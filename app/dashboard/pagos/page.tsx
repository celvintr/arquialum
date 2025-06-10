"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Plus, Eye, Ban, CreditCard, Filter, ChevronLeft, ChevronRight, Receipt, FileText } from "lucide-react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import DetallePagoModal from "@/components/pagos/DetallePagoModal"
import GenerarFacturaModal from "@/components/pagos/GenerarFacturaModal"

interface Pago {
  _id: string
  numero: string
  orden_trabajo_id: string
  cliente_id: string
  cliente_nombre: string
  tipo: string
  monto: number
  metodo_pago: string
  referencia: string
  estado: string
  fecha: string
  notas: string
  created_at: string
  orden_numero?: string
  cotizacion_numero?: string
  factura_id?: string
  factura_numero?: string
}

interface Factura {
  _id: string
  numero: string
  estado: string
  total: number
  fecha: string
}

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAnularModal, setShowAnularModal] = useState(false)
  const [pagoSeleccionado, setPagoSeleccionado] = useState<Pago | null>(null)
  const [motivoAnulacion, setMotivoAnulacion] = useState("")

  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [showGenerarFacturaModal, setShowGenerarFacturaModal] = useState(false)
  const [pagoSeleccionadoDetalle, setPagoSeleccionadoDetalle] = useState<Pago | null>(null)

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroMetodo, setFiltroMetodo] = useState<string>("todos")
  const [filtroOrden, setFiltroOrden] = useState<string>("")

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 10

  // Obtener parámetros de URL para filtros
  const searchParams = useSearchParams()

  useEffect(() => {
    // Aplicar filtro desde URL si existe
    const filtroOrdenParam = searchParams.get("filtro_orden")
    if (filtroOrdenParam) {
      setFiltroOrden(filtroOrdenParam)
    }

    cargarDatos()
  }, [searchParams])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      console.log("🔄 Cargando datos...")

      // Cargar pagos
      const pagosResponse = await fetch("/api/pagos")
      if (!pagosResponse.ok) throw new Error("Error al cargar pagos")
      const pagosData = await pagosResponse.json()

      // Cargar facturas
      const facturasResponse = await fetch("/api/facturas")
      if (!facturasResponse.ok) throw new Error("Error al cargar facturas")
      const facturasData = await facturasResponse.json()

      // Cargar órdenes de trabajo
      const ordenesResponse = await fetch("/api/ordenes-trabajo")
      if (!ordenesResponse.ok) throw new Error("Error al cargar órdenes")
      const ordenesData = await ordenesResponse.json()

      // Cargar cotizaciones
      const cotizacionesResponse = await fetch("/api/cotizaciones")
      if (!cotizacionesResponse.ok) throw new Error("Error al cargar cotizaciones")
      const cotizacionesData = await cotizacionesResponse.json()

      console.log("📊 Datos cargados:")
      console.log("- Pagos:", pagosData.pagos?.length || 0)
      console.log("- Facturas:", facturasData.facturas?.length || 0)
      console.log("- Órdenes:", ordenesData.ordenes?.length || 0)
      console.log("- Cotizaciones:", cotizacionesData.cotizaciones?.length || 0)

      // Enriquecer pagos con información completa
      const pagosEnriquecidos = (pagosData.pagos || []).map((pago: Pago) => {
        const orden = ordenesData.ordenes?.find((o: any) => o._id === pago.orden_trabajo_id)
        const cotizacion = cotizacionesData.cotizaciones?.find((c: any) => c._id === orden?.cotizacion_id)

        // Buscar factura asociada al pago
        const factura = facturasData.facturas?.find(
          (f: any) => f.orden_trabajo_id === pago.orden_trabajo_id && f.pagos?.some((p: any) => p.pago_id === pago._id),
        )

        return {
          ...pago,
          orden_numero: orden?.numero || "N/A",
          cotizacion_numero: cotizacion?.numero || "N/A",
          factura_id: factura?._id,
          factura_numero: factura?.numero,
        }
      })

      setPagos(pagosEnriquecidos)
      setFacturas(facturasData.facturas || [])
      console.log("✅ Datos cargados y enriquecidos")
    } catch (error) {
      console.error("❌ Error cargando datos:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  const anularPago = async () => {
    if (!pagoSeleccionado || !motivoAnulacion.trim()) {
      toast.error("Debe proporcionar un motivo para la anulación")
      return
    }

    try {
      const response = await fetch(`/api/pagos/${pagoSeleccionado._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: "anulado",
          motivo_anulacion: motivoAnulacion,
          fecha_anulacion: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error al anular el pago")
      }

      toast.success("Pago anulado exitosamente")
      setShowAnularModal(false)
      setPagoSeleccionado(null)
      setMotivoAnulacion("")
      cargarDatos()
    } catch (error) {
      console.error("Error anulando pago:", error)
      toast.error(error.message || "Error al anular el pago")
    }
  }

  const verDetallePago = (pago: Pago) => {
    setPagoSeleccionadoDetalle(pago)
    setShowDetalleModal(true)
  }

  const generarFacturaDesdePago = (pago: Pago) => {
    setPagoSeleccionadoDetalle(pago)
    setShowGenerarFacturaModal(true)
  }

  const onFacturaGenerada = (factura: any) => {
    toast.success(`Factura ${factura.numero} generada exitosamente`)
    cargarDatos() // Recargar datos para mostrar la factura vinculada
  }

  // Aplicar filtros
  const pagosFiltrados = pagos.filter((pago) => {
    const coincideBusqueda =
      pago.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.orden_numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.cotizacion_numero?.toLowerCase().includes(searchTerm.toLowerCase())

    const coincideEstado = filtroEstado === "todos" || pago.estado === filtroEstado
    const coincideTipo = filtroTipo === "todos" || pago.tipo === filtroTipo
    const coincideMetodo = filtroMetodo === "todos" || pago.metodo_pago === filtroMetodo
    const coincideOrden = !filtroOrden || pago.orden_trabajo_id === filtroOrden

    return coincideBusqueda && coincideEstado && coincideTipo && coincideMetodo && coincideOrden
  })

  // Paginación
  const totalPaginas = Math.ceil(pagosFiltrados.length / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const indiceFin = indiceInicio + itemsPorPagina
  const pagosPaginados = pagosFiltrados.slice(indiceInicio, indiceFin)

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1)
  }, [searchTerm, filtroEstado, filtroTipo, filtroMetodo, filtroOrden])

  const limpiarFiltros = () => {
    setSearchTerm("")
    setFiltroEstado("todos")
    setFiltroTipo("todos")
    setFiltroMetodo("todos")
    setFiltroOrden("")
    setPaginaActual(1)
  }

  const getEstadoBadge = (estado: string) => {
    const estilos = {
      pendiente: "bg-yellow-100 text-yellow-800",
      completado: "bg-green-100 text-green-800",
      anulado: "bg-red-100 text-red-800",
      cancelado: "bg-gray-100 text-gray-800",
    }

    return <Badge className={estilos[estado] || "bg-gray-100 text-gray-800"}>{estado}</Badge>
  }

  const getTipoBadge = (tipo: string) => {
    const estilos = {
      abono: "bg-blue-100 text-blue-800",
      completo: "bg-green-100 text-green-800",
      anticipo: "bg-purple-100 text-purple-800",
    }

    return <Badge className={estilos[tipo] || "bg-gray-100 text-gray-800"}>{tipo}</Badge>
  }

  const getMetodoBadge = (metodo: string) => {
    const estilos = {
      efectivo: "bg-green-100 text-green-800",
      transferencia: "bg-blue-100 text-blue-800",
      tarjeta: "bg-purple-100 text-purple-800",
      cheque: "bg-orange-100 text-orange-800",
    }

    return <Badge className={estilos[metodo] || "bg-gray-100 text-gray-800"}>{metodo}</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
              <span>Cargando pagos...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">💳 Pagos</h1>
          <p className="text-gray-600 mt-2">Gestiona todos los pagos realizados</p>
          {filtroOrden && (
            <p className="text-sm text-blue-600 mt-1">
              Filtrando por orden: {pagos.find((p) => p.orden_trabajo_id === filtroOrden)?.orden_numero || filtroOrden}
            </p>
          )}
        </div>
        <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Pago
        </Button>
      </div>

      {/* Filtros */}
      <Card className="border-2 border-green-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar pagos..."
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
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="anulado">Anulado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="abono">Abono</SelectItem>
                <SelectItem value="completo">Completo</SelectItem>
                <SelectItem value="anticipo">Anticipo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroMetodo} onValueChange={setFiltroMetodo}>
              <SelectTrigger>
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los métodos</SelectItem>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={limpiarFiltros}>
              Limpiar Filtros
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-sm">
              {pagosFiltrados.length} de {pagos.length} pagos
            </Badge>
            <div className="text-sm text-gray-600">
              Total filtrado: L{" "}
              {pagosFiltrados
                .filter((p) => p.estado === "completado")
                .reduce((sum, p) => sum + p.monto, 0)
                .toLocaleString("es-HN")}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de pagos */}
      {pagosPaginados.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pagos</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filtroEstado !== "todos" || filtroTipo !== "todos" || filtroMetodo !== "todos"
                ? "No se encontraron pagos con los filtros aplicados"
                : "No hay pagos registrados"}
            </p>
            <Button onClick={limpiarFiltros}>Limpiar Filtros</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pagosPaginados.map((pago) => (
            <Card key={pago._id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Pago #{pago.numero}
                      {getEstadoBadge(pago.estado)}
                      {getTipoBadge(pago.tipo)}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Cliente: {pago.cliente_nombre}</p>
                    <p className="text-xs text-gray-500">
                      Orden: {pago.orden_numero} | Cotización: {pago.cotizacion_numero}
                    </p>
                    {pago.factura_numero && <p className="text-xs text-purple-600">Factura: {pago.factura_numero}</p>}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" title="Ver detalles" onClick={() => verDetallePago(pago)}>
                      <Eye className="h-4 w-4" />
                    </Button>

                    {/* Enlace a factura si existe */}
                    {pago.factura_id && (
                      <Link href={`/dashboard/facturas/imprimir/${pago.factura_id}`} target="_blank">
                        <Button variant="ghost" size="icon" title="Ver factura" className="text-purple-600">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}

                    <Button variant="ghost" size="icon" title="Generar recibo">
                      <Receipt className="h-4 w-4" />
                    </Button>

                    {/* Solo anular si está completado */}
                    {pago.estado === "completado" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Anular pago"
                        className="text-red-600"
                        onClick={() => {
                          setPagoSeleccionado(pago)
                          setShowAnularModal(true)
                        }}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Fecha:</span>
                    <p className="text-gray-600">{new Date(pago.fecha).toLocaleDateString("es-HN")}</p>
                  </div>
                  <div>
                    <span className="font-medium">Monto:</span>
                    <p className="text-green-600 font-semibold">L {pago.monto.toLocaleString("es-HN")}</p>
                  </div>
                  <div>
                    <span className="font-medium">Método:</span>
                    <div className="mt-1">{getMetodoBadge(pago.metodo_pago)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Referencia:</span>
                    <p className="text-gray-600">{pago.referencia || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-medium">Orden:</span>
                    <Link href={`/dashboard/ordenes-trabajo?filtro_orden=${pago.orden_trabajo_id}`}>
                      <p className="text-blue-600 hover:underline">{pago.orden_numero}</p>
                    </Link>
                  </div>
                  <div>
                    <span className="font-medium">Cotización:</span>
                    <p className="text-purple-600">{pago.cotizacion_numero}</p>
                  </div>
                </div>
                {pago.notas && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="font-medium text-sm">Notas:</span>
                    <p className="text-gray-600 text-sm mt-1">{pago.notas}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {indiceInicio + 1} a {Math.min(indiceFin, pagosFiltrados.length)} de {pagosFiltrados.length}{" "}
                pagos
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

      {/* Modal Anular Pago */}
      <Dialog open={showAnularModal} onOpenChange={setShowAnularModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-600" />
              Anular Pago #{pagoSeleccionado?.numero}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Advertencia:</strong> Esta acción anulará el pago pero no lo eliminará del sistema. El pago
                quedará marcado como anulado para fines de auditoría.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Motivo de la anulación *</label>
              <textarea
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
                placeholder="Explique el motivo de la anulación..."
                value={motivoAnulacion}
                onChange={(e) => setMotivoAnulacion(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAnularModal(false)}>
                Cancelar
              </Button>
              <Button onClick={anularPago} disabled={!motivoAnulacion.trim()} className="bg-red-600 hover:bg-red-700">
                <Ban className="w-4 h-4 mr-2" />
                Anular Pago
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modales */}
      <DetallePagoModal
        pago={pagoSeleccionadoDetalle}
        isOpen={showDetalleModal}
        onClose={() => {
          setShowDetalleModal(false)
          setPagoSeleccionadoDetalle(null)
        }}
        onGenerarFactura={generarFacturaDesdePago}
      />

      <GenerarFacturaModal
        pago={pagoSeleccionadoDetalle}
        isOpen={showGenerarFacturaModal}
        onClose={() => {
          setShowGenerarFacturaModal(false)
          setPagoSeleccionadoDetalle(null)
        }}
        onFacturaGenerada={onFacturaGenerada}
      />
    </div>
  )
}
