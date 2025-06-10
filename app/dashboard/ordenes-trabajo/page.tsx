"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Trash2,
  Save,
  X,
  Receipt,
  CreditCard,
  Printer,
  Factory,
  Package,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  DollarSign,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface OrdenTrabajo {
  _id: string
  numero: string
  cotizacion_id: string
  cotizacion_numero?: string
  cliente_id?: string
  cliente_nombre?: string
  estado: string
  fecha_inicio: string
  fecha_estimada_fin: string
  costos_estimados: {
    materiales: number
    mano_obra: number
    otros: number
    total: number
  }
  progreso_porcentaje: number
  notas?: string
  // Información de pagos
  pagos?: Array<{
    _id: string
    numero: string
    monto: number
    tipo: string
    estado: string
    fecha: string
  }>
  total_pagado?: number
  saldo_pendiente?: number
  estado_pago?: "sin_pagos" | "parcial" | "completo"
}

interface PagoData {
  tipo: "abono" | "completo"
  monto: number
  metodo: string
  referencia: string
  notas: string
}

export default function OrdenesTrabajoPage() {
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroEstadoPago, setFiltroEstadoPago] = useState<string>("todos")
  const [filtroOrden, setFiltroOrden] = useState<string>("")

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 5

  // Modales
  const [showCrearModal, setShowCrearModal] = useState(false)
  const [showVerModal, setShowVerModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [showPagarModal, setShowPagarModal] = useState(false)
  const [showPagosModal, setShowPagosModal] = useState(false)

  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenTrabajo | null>(null)
  const [editandoOrden, setEditandoOrden] = useState<OrdenTrabajo | null>(null)
  const [pagoData, setPagoData] = useState<PagoData>({
    tipo: "completo",
    monto: 0,
    metodo: "efectivo",
    referencia: "",
    notas: "",
  })
  const [procesandoPago, setProcesandoPago] = useState(false)

  // Obtener parámetros de URL para filtros
  const searchParams = useSearchParams()

  useEffect(() => {
    // Aplicar filtro desde URL si existe
    const filtroOrdenParam = searchParams.get("filtro_orden")
    if (filtroOrdenParam) {
      setFiltroOrden(filtroOrdenParam)
    }

    cargarOrdenes()
  }, [searchParams])

  const cargarOrdenes = async () => {
    try {
      setLoading(true)

      // Cargar órdenes
      const ordenesResponse = await fetch("/api/ordenes-trabajo")
      const ordenesData = await ordenesResponse.json()

      // Cargar pagos
      const pagosResponse = await fetch("/api/pagos")
      const pagosData = await pagosResponse.json()

      if (ordenesData.success && pagosData.success) {
        // Enriquecer órdenes con información de pagos
        const ordenesEnriquecidas = ordenesData.ordenes.map((orden: OrdenTrabajo) => {
          const pagosOrden = pagosData.pagos.filter(
            (pago: any) => pago.orden_trabajo_id === orden._id && pago.estado === "completado",
          )

          const totalPagado = pagosOrden.reduce((sum: number, pago: any) => sum + pago.monto, 0)
          const saldoPendiente = orden.costos_estimados.total - totalPagado

          let estadoPago: "sin_pagos" | "parcial" | "completo" = "sin_pagos"
          if (totalPagado > 0) {
            estadoPago = saldoPendiente <= 0 ? "completo" : "parcial"
          }

          return {
            ...orden,
            pagos: pagosOrden,
            total_pagado: totalPagado,
            saldo_pendiente: Math.max(0, saldoPendiente),
            estado_pago: estadoPago,
          }
        })

        setOrdenes(ordenesEnriquecidas)
      }
    } catch (error) {
      console.error("Error cargando órdenes:", error)
      toast.error("Error al cargar las órdenes de trabajo")
    } finally {
      setLoading(false)
    }
  }

  // Aplicar filtros
  const ordenesFiltradas = ordenes.filter((orden) => {
    const coincideBusqueda =
      orden.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.cotizacion_numero?.toLowerCase().includes(searchTerm.toLowerCase())

    const coincideEstado = filtroEstado === "todos" || orden.estado === filtroEstado
    const coincideEstadoPago = filtroEstadoPago === "todos" || orden.estado_pago === filtroEstadoPago
    const coincideOrden = !filtroOrden || orden._id === filtroOrden

    return coincideBusqueda && coincideEstado && coincideEstadoPago && coincideOrden
  })

  // Paginación
  const totalPaginas = Math.ceil(ordenesFiltradas.length / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const indiceFin = indiceInicio + itemsPorPagina
  const ordenesPaginadas = ordenesFiltradas.slice(indiceInicio, indiceFin)

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1)
  }, [searchTerm, filtroEstado, filtroEstadoPago, filtroOrden])

  const limpiarFiltros = () => {
    setSearchTerm("")
    setFiltroEstado("todos")
    setFiltroEstadoPago("todos")
    setFiltroOrden("")
    setPaginaActual(1)
  }

  const verOrden = (orden: OrdenTrabajo) => {
    setOrdenSeleccionada(orden)
    setShowVerModal(true)
  }

  const verPagos = (orden: OrdenTrabajo) => {
    setOrdenSeleccionada(orden)
    setShowPagosModal(true)
  }

  const editarOrden = (orden: OrdenTrabajo) => {
    setEditandoOrden({ ...orden })
    setShowEditarModal(true)
  }

  const iniciarPago = (orden: OrdenTrabajo) => {
    setOrdenSeleccionada(orden)
    const montoTotal = orden.costos_estimados.total
    const montoPendiente = orden.saldo_pendiente || montoTotal
    setPagoData({
      tipo: "completo",
      monto: montoPendiente,
      metodo: "efectivo",
      referencia: "",
      notas: `Pago por orden de trabajo ${orden.numero}`,
    })
    setShowPagarModal(true)
  }

  const procesarPago = async () => {
    if (!ordenSeleccionada) return

    try {
      setProcesandoPago(true)

      const response = await fetch("/api/ordenes-trabajo/procesar-pago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orden_trabajo_id: ordenSeleccionada._id,
          numero_orden: ordenSeleccionada.numero,
          cliente_id: ordenSeleccionada.cliente_id,
          cliente_nombre: ordenSeleccionada.cliente_nombre,
          tipo_pago: pagoData.tipo,
          monto: pagoData.monto,
          metodo_pago: pagoData.metodo,
          referencia: pagoData.referencia,
          notas: pagoData.notas,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error al procesar el pago")
      }

      const data = await response.json()

      toast.success(`Pago procesado y factura ${data.factura.numero} generada exitosamente`)
      setShowPagarModal(false)

      if (confirm("¿Deseas imprimir la factura generada?")) {
        window.open(`/dashboard/facturas/imprimir/${data.factura._id}`, "_blank")
      }

      cargarOrdenes()
    } catch (error) {
      console.error("Error procesando pago:", error)
      toast.error(error.message || "Error al procesar el pago")
    } finally {
      setProcesandoPago(false)
    }
  }

  const guardarCambios = async () => {
    if (!editandoOrden) return

    try {
      const response = await fetch(`/api/ordenes-trabajo/${editandoOrden._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estado: editandoOrden.estado,
          progreso_porcentaje: editandoOrden.progreso_porcentaje,
          notas: editandoOrden.notas,
        }),
      })

      if (response.ok) {
        toast.success("Orden actualizada exitosamente")
        setShowEditarModal(false)
        setEditandoOrden(null)
        cargarOrdenes()
      } else {
        const error = await response.json()
        toast.error(error.message || "Error al actualizar la orden")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de conexión al actualizar orden")
    }
  }

  const eliminarOrden = async (orden: OrdenTrabajo) => {
    // Verificar si tiene pagos
    if (orden.pagos && orden.pagos.length > 0) {
      toast.error("No se puede eliminar una orden que tiene pagos registrados")
      return
    }

    if (!confirm("¿Estás seguro de que quieres eliminar esta orden de trabajo?")) {
      return
    }

    try {
      const response = await fetch(`/api/ordenes-trabajo/${orden._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Orden eliminada exitosamente")
        cargarOrdenes()
      } else {
        const error = await response.json()
        toast.error(error.message || "Error al eliminar la orden")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de conexión al eliminar orden")
    }
  }

  const getEstadoBadge = (estado: string) => {
    const estados = {
      pendiente: { label: "Pendiente", variant: "secondary" as const, icon: Clock, color: "bg-gray-100 text-gray-800" },
      en_proceso: {
        label: "En Proceso",
        variant: "default" as const,
        icon: AlertCircle,
        color: "bg-blue-100 text-blue-800",
      },
      completada: {
        label: "Completada",
        variant: "default" as const,
        icon: CheckCircle,
        color: "bg-green-100 text-green-800",
      },
      facturada: {
        label: "Facturada",
        variant: "default" as const,
        icon: Receipt,
        color: "bg-purple-100 text-purple-800",
      },
    }

    const config = estados[estado] || estados.pendiente
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getEstadoPagoBadge = (estadoPago: string) => {
    const estados = {
      sin_pagos: { label: "Sin Pagos", color: "bg-gray-100 text-gray-800" },
      parcial: { label: "Parcial", color: "bg-yellow-100 text-yellow-800" },
      completo: { label: "Pagado", color: "bg-green-100 text-green-800" },
    }

    const config = estados[estadoPago] || estados.sin_pagos

    return <Badge className={config.color}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🛠️ Órdenes de Trabajo</h1>
          <p className="text-gray-600">Gestión de proyectos y seguimiento de pagos</p>
          {filtroOrden && (
            <p className="text-sm text-blue-600 mt-1">
              Filtrando por orden: {ordenes.find((o) => o._id === filtroOrden)?.numero || filtroOrden}
            </p>
          )}
        </div>
        <Dialog open={showCrearModal} onOpenChange={setShowCrearModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Orden
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Crear Orden de Trabajo
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Crear desde Cotización</h3>
                <p className="text-gray-500 mb-4">
                  Las órdenes de trabajo se crean directamente desde cotizaciones aprobadas.
                </p>
                <Link href="/dashboard/cotizaciones">
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                    <FileText className="w-4 h-4 mr-2" />
                    Ir a Cotizaciones
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card className="border-2 border-blue-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar órdenes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="facturada">Facturada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroEstadoPago} onValueChange={setFiltroEstadoPago}>
              <SelectTrigger>
                <SelectValue placeholder="Estado de Pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los pagos</SelectItem>
                <SelectItem value="sin_pagos">Sin Pagos</SelectItem>
                <SelectItem value="parcial">Pagos Parciales</SelectItem>
                <SelectItem value="completo">Pagado Completo</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={limpiarFiltros}>
              Limpiar Filtros
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-sm">
              {ordenesFiltradas.length} de {ordenes.length} órdenes
            </Badge>
            <div className="text-sm text-gray-600">
              Total estimado: L{" "}
              {ordenesFiltradas.reduce((sum, o) => sum + o.costos_estimados.total, 0).toLocaleString("es-HN")}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Órdenes Activas</p>
                <p className="text-2xl font-bold">
                  {ordenes.filter((o) => o.estado !== "completada" && o.estado !== "facturada").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Completadas</p>
                <p className="text-2xl font-bold">{ordenes.filter((o) => o.estado === "completada").length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Pagos Parciales</p>
                <p className="text-2xl font-bold">{ordenes.filter((o) => o.estado_pago === "parcial").length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Pagadas</p>
                <p className="text-2xl font-bold">{ordenes.filter((o) => o.estado_pago === "completo").length}</p>
              </div>
              <Receipt className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Órdenes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Lista de Órdenes de Trabajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordenesPaginadas.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes de trabajo</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filtroEstado !== "todos" || filtroEstadoPago !== "todos"
                  ? "No se encontraron órdenes con los filtros aplicados"
                  : "Las órdenes se crean desde cotizaciones aprobadas"}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={limpiarFiltros}>Limpiar Filtros</Button>
                <Link href="/dashboard/cotizaciones">
                  <Button>
                    <FileText className="w-4 h-4 mr-2" />
                    Ir a Cotizaciones
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pagado</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Estado Pago</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordenesPaginadas.map((orden) => (
                  <TableRow key={orden._id}>
                    <TableCell className="font-medium">{orden.numero}</TableCell>
                    <TableCell>{orden.cliente_nombre || "Cliente"}</TableCell>
                    <TableCell>{getEstadoBadge(orden.estado)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${orden.progreso_porcentaje}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{orden.progreso_porcentaje}%</span>
                      </div>
                    </TableCell>
                    <TableCell>L {orden.costos_estimados.total.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      L {(orden.total_pagado || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-orange-600 font-medium">
                      L {(orden.saldo_pendiente || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>{getEstadoPagoBadge(orden.estado_pago || "sin_pagos")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => verOrden(orden)} title="Ver orden">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => editarOrden(orden)} title="Editar orden">
                          <Edit className="w-4 h-4" />
                        </Button>

                        {/* Ver pagos si tiene pagos */}
                        {orden.pagos && orden.pagos.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => verPagos(orden)}
                            title="Ver pagos"
                            className="text-green-600"
                          >
                            <DollarSign className="w-4 h-4" />
                          </Button>
                        )}

                        {/* Comanda de fabricación - disponible desde en_proceso */}
                        {(orden.estado === "en_proceso" || orden.estado === "completada") && (
                          <Link href={`/dashboard/ordenes-trabajo/comanda/${orden._id}`}>
                            <Button size="sm" variant="outline" title="Comanda de fabricación">
                              <Factory className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}

                        {/* Hoja de Producción - disponible desde en_proceso */}
                        {(orden.estado === "en_proceso" || orden.estado === "completada") && (
                          <Link href={`/dashboard/ordenes-trabajo/produccion/${orden._id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              title="Hoja de producción"
                              className="bg-orange-50 hover:bg-orange-100"
                            >
                              <Package className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}

                        {/* Pago - disponible si tiene saldo pendiente */}
                        {(orden.saldo_pendiente || 0) > 0 &&
                          (orden.estado === "en_proceso" || orden.estado === "completada") && (
                            <Button
                              size="sm"
                              onClick={() => iniciarPago(orden)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              title="Procesar pago"
                            >
                              <CreditCard className="w-4 h-4" />
                            </Button>
                          )}

                        {/* Eliminar - solo si no tiene pagos */}
                        {(!orden.pagos || orden.pagos.length === 0) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => eliminarOrden(orden)}
                            className="text-red-600 hover:text-red-700"
                            title="Eliminar orden"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {indiceInicio + 1} a {Math.min(indiceFin, ordenesFiltradas.length)} de{" "}
                {ordenesFiltradas.length} órdenes
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaActual(paginaActual - 1)}
                  disabled={paginaActual === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                    <Button
                      key={pagina}
                      variant={pagina === paginaActual ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaginaActual(pagina)}
                      className="w-8 h-8 p-0"
                    >
                      {pagina}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaActual(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal Ver Orden */}
      <Dialog open={showVerModal} onOpenChange={setShowVerModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Detalles de la Orden {ordenSeleccionada?.numero}
            </DialogTitle>
          </DialogHeader>
          {ordenSeleccionada && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Número de Orden</Label>
                  <p className="text-sm text-gray-600">{ordenSeleccionada.numero}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Cotización</Label>
                  <p className="text-sm text-gray-600">{ordenSeleccionada.cotizacion_numero}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Cliente</Label>
                  <p className="text-sm text-gray-600">{ordenSeleccionada.cliente_nombre}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estado</Label>
                  <div className="mt-1">{getEstadoBadge(ordenSeleccionada.estado)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Progreso</Label>
                  <p className="text-sm text-gray-600">{ordenSeleccionada.progreso_porcentaje}%</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Estimado</Label>
                  <p className="text-sm text-gray-600">L {ordenSeleccionada.costos_estimados.total.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Pagado</Label>
                  <p className="text-sm text-green-600 font-semibold">
                    L {(ordenSeleccionada.total_pagado || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Saldo Pendiente</Label>
                  <p className="text-sm text-orange-600 font-semibold">
                    L {(ordenSeleccionada.saldo_pendiente || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estado de Pago</Label>
                  <div className="mt-1">{getEstadoPagoBadge(ordenSeleccionada.estado_pago || "sin_pagos")}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fecha de Inicio</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(ordenSeleccionada.fecha_inicio).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Información de pagos */}
              {ordenSeleccionada.pagos && ordenSeleccionada.pagos.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Pagos Registrados ({ordenSeleccionada.pagos.length})</Label>
                  <div className="mt-2 space-y-2">
                    {ordenSeleccionada.pagos.slice(0, 3).map((pago) => (
                      <div key={pago._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{pago.numero}</span>
                        <span className="text-sm font-medium">L {pago.monto.toLocaleString()}</span>
                      </div>
                    ))}
                    {ordenSeleccionada.pagos.length > 3 && (
                      <Button variant="outline" size="sm" onClick={() => verPagos(ordenSeleccionada)}>
                        Ver todos los pagos ({ordenSeleccionada.pagos.length})
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {ordenSeleccionada.notas && (
                <div>
                  <Label className="text-sm font-medium">Notas</Label>
                  <p className="text-sm text-gray-600 mt-1">{ordenSeleccionada.notas}</p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex justify-end gap-2 pt-4">
                {(ordenSeleccionada.estado === "en_proceso" || ordenSeleccionada.estado === "completada") && (
                  <>
                    <Link href={`/dashboard/ordenes-trabajo/comanda/${ordenSeleccionada._id}`}>
                      <Button variant="outline">
                        <Factory className="w-4 h-4 mr-2" />
                        Ver Comanda
                      </Button>
                    </Link>
                    <Link href={`/dashboard/ordenes-trabajo/produccion/${ordenSeleccionada._id}`}>
                      <Button variant="outline" className="bg-orange-50 hover:bg-orange-100">
                        <Package className="w-4 h-4 mr-2" />
                        Hoja de Producción
                      </Button>
                    </Link>
                    {(ordenSeleccionada.saldo_pendiente || 0) > 0 && (
                      <Button
                        onClick={() => iniciarPago(ordenSeleccionada)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Procesar Pago
                      </Button>
                    )}
                  </>
                )}
                <Button variant="outline" onClick={() => setShowVerModal(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Ver Pagos */}
      <Dialog open={showPagosModal} onOpenChange={setShowPagosModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pagos de la Orden {ordenSeleccionada?.numero}
            </DialogTitle>
          </DialogHeader>
          {ordenSeleccionada && (
            <div className="space-y-4">
              {/* Resumen de pagos */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Orden</p>
                  <p className="text-lg font-bold">L {ordenSeleccionada.costos_estimados.total.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Pagado</p>
                  <p className="text-lg font-bold text-green-600">
                    L {(ordenSeleccionada.total_pagado || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Saldo Pendiente</p>
                  <p className="text-lg font-bold text-orange-600">
                    L {(ordenSeleccionada.saldo_pendiente || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Lista de pagos */}
              {ordenSeleccionada.pagos && ordenSeleccionada.pagos.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium">Historial de Pagos</h4>
                  {ordenSeleccionada.pagos.map((pago) => (
                    <div key={pago._id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{pago.numero}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(pago.fecha).toLocaleDateString()} - {pago.tipo}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">L {pago.monto.toLocaleString()}</p>
                        <Badge
                          className={
                            pago.estado === "completado"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {pago.estado}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {/* Enlace a ver todos los pagos */}
                  <div className="pt-2">
                    <Link href={`/dashboard/pagos?filtro_orden=${ordenSeleccionada._id}`}>
                      <Button variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver todos los pagos en detalle
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pagos registrados</h3>
                  <p className="text-gray-500 mb-4">Esta orden aún no tiene pagos asociados</p>
                  <Button onClick={() => iniciarPago(ordenSeleccionada)} className="bg-green-600 hover:bg-green-700">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Registrar Primer Pago
                  </Button>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowPagosModal(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Editar Orden */}
      <Dialog open={showEditarModal} onOpenChange={setShowEditarModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Editar Orden {editandoOrden?.numero}
            </DialogTitle>
          </DialogHeader>
          {editandoOrden && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={editandoOrden.estado}
                    onValueChange={(value) => setEditandoOrden({ ...editandoOrden, estado: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="en_proceso">En Proceso</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="progreso">Progreso (%)</Label>
                  <Input
                    id="progreso"
                    type="number"
                    min="0"
                    max="100"
                    value={editandoOrden.progreso_porcentaje}
                    onChange={(e) =>
                      setEditandoOrden({ ...editandoOrden, progreso_porcentaje: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  value={editandoOrden.notas || ""}
                  onChange={(e) => setEditandoOrden({ ...editandoOrden, notas: e.target.value })}
                  placeholder="Agregar notas sobre el progreso..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditarModal(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={guardarCambios}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Procesar Pago */}
      <Dialog open={showPagarModal} onOpenChange={setShowPagarModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Procesar Pago - Orden {ordenSeleccionada?.numero}
            </DialogTitle>
          </DialogHeader>
          {ordenSeleccionada && (
            <div className="space-y-4">
              {/* Información de la orden */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Cliente:</span> {ordenSeleccionada.cliente_nombre}
                  </div>
                  <div>
                    <span className="font-medium">Orden:</span> {ordenSeleccionada.numero}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span> L{" "}
                    {ordenSeleccionada.costos_estimados.total.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Saldo:</span> L{" "}
                    {(ordenSeleccionada.saldo_pendiente || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tipo de pago */}
              <div>
                <Label>Tipo de Pago</Label>
                <Select
                  value={pagoData.tipo}
                  onValueChange={(value: "abono" | "completo") => {
                    setPagoData({ ...pagoData, tipo: value })
                    if (value === "completo") {
                      const saldoPendiente =
                        ordenSeleccionada.saldo_pendiente || ordenSeleccionada.costos_estimados.total
                      setPagoData((prev) => ({ ...prev, monto: saldoPendiente }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abono">Abono Parcial</SelectItem>
                    <SelectItem value="completo">Pago Completo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Monto */}
              <div>
                <Label htmlFor="monto">Monto {pagoData.tipo === "abono" ? "del Abono" : "Total"}</Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  value={pagoData.monto}
                  onChange={(e) => setPagoData({ ...pagoData, monto: Number.parseFloat(e.target.value) || 0 })}
                  disabled={pagoData.tipo === "completo"}
                />
              </div>

              {/* Método de pago */}
              <div>
                <Label htmlFor="metodo">Método de Pago</Label>
                <Select value={pagoData.metodo} onValueChange={(value) => setPagoData({ ...pagoData, metodo: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                    <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Referencia */}
              <div>
                <Label htmlFor="referencia">Referencia/Número de Transacción</Label>
                <Input
                  id="referencia"
                  value={pagoData.referencia}
                  onChange={(e) => setPagoData({ ...pagoData, referencia: e.target.value })}
                  placeholder="Número de cheque, autorización, etc."
                />
              </div>

              {/* Notas */}
              <div>
                <Label htmlFor="notas_pago">Notas del Pago</Label>
                <Textarea
                  id="notas_pago"
                  value={pagoData.notas}
                  onChange={(e) => setPagoData({ ...pagoData, notas: e.target.value })}
                  placeholder="Notas adicionales, observaciones, etc."
                />
              </div>

              <Separator />

              {/* Botones */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPagarModal(false)} disabled={procesandoPago}>
                  Cancelar
                </Button>
                <Button
                  onClick={procesarPago}
                  disabled={procesandoPago || pagoData.monto <= 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {procesandoPago ? (
                    <>
                      <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Printer className="w-4 h-4 mr-2" />
                      Procesar y Generar Factura
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
