"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  Eye,
  Download,
  Send,
  DollarSign,
  FileText,
  AlertTriangle,
  Calendar,
  Search,
  Filter,
  Printer,
  CreditCard,
  CheckCircle,
  BarChart3,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { toast } from "sonner"

interface Factura {
  _id: string
  numero: string
  cliente_id: string
  cliente_nombre?: string
  estado: string
  fecha_emision: string
  fecha_vencimiento: string
  subtotal: number
  impuesto_total: number
  total: number
  orden_trabajo_id?: string
  pagos?: Pago[]
  saldo_pendiente?: number
}

interface Pago {
  _id: string
  numero: string
  monto: number
  metodo_pago: string
  fecha: string
  estado: string
  orden_trabajo_id?: string
}

export default function FacturasPage() {
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [showCrearModal, setShowCrearModal] = useState(false)
  const [ordenTrabajoId, setOrdenTrabajoId] = useState("")
  const [tipoFacturacion, setTipoFacturacion] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroFecha, setFiltroFecha] = useState("todos")
  const [busqueda, setBusqueda] = useState("")
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<Factura | null>(null)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: "fecha_emision", direction: "desc" })

  useEffect(() => {
    cargarFacturas()
  }, [])

  const cargarFacturas = async () => {
    try {
      setLoading(true)
      console.log("🔍 Cargando facturas...")

      // Cargar facturas
      const response = await fetch("/api/facturas")
      const data = await response.json()

      if (data.success && data.facturas?.length > 0) {
        console.log(`✅ ${data.facturas.length} facturas cargadas`)

        // Para cada factura, cargar sus pagos específicos
        const facturasConPagos = await Promise.all(
          data.facturas.map(async (factura: Factura) => {
            if (factura.orden_trabajo_id) {
              try {
                // Filtrar pagos específicamente por orden_trabajo_id
                const pagoResponse = await fetch(`/api/pagos?orden_trabajo_id=${factura.orden_trabajo_id}`)
                const pagoData = await pagoResponse.json()

                if (pagoData.success && pagoData.pagos?.length > 0) {
                  // Filtrar solo los pagos que corresponden a esta orden específica
                  const pagosDeEstaOrden = pagoData.pagos.filter(
                    (p: Pago) => p.orden_trabajo_id === factura.orden_trabajo_id && p.estado === "completado",
                  )

                  const totalPagado = pagosDeEstaOrden.reduce((sum: number, p: Pago) => sum + p.monto, 0)

                  return {
                    ...factura,
                    pagos: pagosDeEstaOrden,
                    saldo_pendiente: factura.total - totalPagado,
                  }
                }
              } catch (error) {
                console.error(`Error cargando pagos para factura ${factura.numero}:`, error)
              }
            }

            return {
              ...factura,
              pagos: [],
              saldo_pendiente: factura.total,
            }
          }),
        )

        setFacturas(facturasConPagos)
      } else {
        console.log("⚠️ No se encontraron facturas o hubo un error")
        toast.error("No se pudieron cargar las facturas")
      }
    } catch (error) {
      console.error("Error cargando facturas:", error)
      toast.error("Error al cargar datos de facturas")
    } finally {
      setLoading(false)
    }
  }

  const crearFactura = async () => {
    if (!ordenTrabajoId || !tipoFacturacion) {
      toast.error("Completa todos los campos")
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/facturas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orden_trabajo_id: ordenTrabajoId,
          tipo_facturacion: tipoFacturacion,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Factura creada exitosamente")
        setShowCrearModal(false)
        setOrdenTrabajoId("")
        setTipoFacturacion("")
        cargarFacturas()
      } else {
        toast.error(data.message || "Error al crear la factura")
      }
    } catch (error) {
      console.error("Error creando factura:", error)
      toast.error("Error al crear la factura")
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const estados = {
      borrador: { label: "Borrador", variant: "secondary" as const, icon: FileText },
      emitida: { label: "Emitida", variant: "default" as const, icon: Send },
      pagada: { label: "Pagada", variant: "success" as const, icon: CheckCircle },
      vencida: { label: "Vencida", variant: "destructive" as const, icon: AlertTriangle },
      anulada: { label: "Anulada", variant: "outline" as const, icon: AlertTriangle },
    }

    const config = estados[estado] || estados.borrador
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getMetodoPagoBadge = (metodo: string) => {
    const metodos = {
      efectivo: { label: "Efectivo", variant: "success" as const, icon: DollarSign },
      tarjeta: { label: "Tarjeta", variant: "default" as const, icon: CreditCard },
      transferencia: { label: "Transferencia", variant: "secondary" as const, icon: CreditCard },
      cheque: { label: "Cheque", variant: "outline" as const, icon: FileText },
    }

    const config = metodos[metodo] || metodos.efectivo
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  // Calcular totales con verificación de valores
  const totalVentas = facturas.filter((f) => f.estado === "pagada").reduce((sum, f) => sum + (f.total || 0), 0)

  const totalPendiente = facturas.filter((f) => f.estado === "emitida").reduce((sum, f) => sum + (f.total || 0), 0)

  const totalFacturasEmitidas = facturas.filter((f) => f.estado === "emitida").length
  const totalFacturasPagadas = facturas.filter((f) => f.estado === "pagada").length

  // Función segura para formatear números
  const formatNumber = (value: number | undefined) => {
    if (value === undefined || value === null) return "0"
    return value.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-HN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Filtrar facturas
  const filtrarFacturas = () => {
    return facturas.filter((factura) => {
      // Filtro por estado
      if (filtroEstado !== "todos" && factura.estado !== filtroEstado) {
        return false
      }

      // Filtro por fecha
      if (filtroFecha !== "todos") {
        const hoy = new Date()
        const fechaFactura = new Date(factura.fecha_emision)

        if (
          filtroFecha === "hoy" &&
          !(
            fechaFactura.getDate() === hoy.getDate() &&
            fechaFactura.getMonth() === hoy.getMonth() &&
            fechaFactura.getFullYear() === hoy.getFullYear()
          )
        ) {
          return false
        }

        if (filtroFecha === "semana") {
          const unaSemanaAtras = new Date(hoy)
          unaSemanaAtras.setDate(hoy.getDate() - 7)
          if (fechaFactura < unaSemanaAtras) {
            return false
          }
        }

        if (filtroFecha === "mes") {
          const unMesAtras = new Date(hoy)
          unMesAtras.setMonth(hoy.getMonth() - 1)
          if (fechaFactura < unMesAtras) {
            return false
          }
        }
      }

      // Filtro por búsqueda
      if (busqueda) {
        const terminoBusqueda = busqueda.toLowerCase()
        return (
          factura.numero.toLowerCase().includes(terminoBusqueda) ||
          (factura.cliente_nombre || "").toLowerCase().includes(terminoBusqueda)
        )
      }

      return true
    })
  }

  // Ordenar facturas
  const sortedFacturas = () => {
    const facturasFiltradas = filtrarFacturas()

    return [...facturasFiltradas].sort((a, b) => {
      if (sortConfig.key === "fecha_emision") {
        const dateA = new Date(a.fecha_emision).getTime()
        const dateB = new Date(b.fecha_emision).getTime()
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA
      }

      if (sortConfig.key === "total") {
        return sortConfig.direction === "asc" ? (a.total || 0) - (b.total || 0) : (b.total || 0) - (a.total || 0)
      }

      if (sortConfig.key === "cliente") {
        const clienteA = (a.cliente_nombre || "").toLowerCase()
        const clienteB = (b.cliente_nombre || "").toLowerCase()
        return sortConfig.direction === "asc" ? clienteA.localeCompare(clienteB) : clienteB.localeCompare(clienteA)
      }

      return 0
    })
  }

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    })
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />
    }

    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    )
  }

  const verDetalleFactura = (factura: Factura) => {
    setFacturaSeleccionada(factura)
    setShowDetalleModal(true)
  }

  const calcularPorcentajePagado = (factura: Factura) => {
    if (!factura.pagos || factura.pagos.length === 0) return 0

    const totalPagado = factura.pagos.reduce((sum, p) => sum + p.monto, 0)
    return Math.min(Math.round((totalPagado / factura.total) * 100), 100)
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
          <h1 className="text-3xl font-bold">💰 Facturas</h1>
          <p className="text-gray-600">Gestión de facturación y control de ventas</p>
        </div>
        <Dialog open={showCrearModal} onOpenChange={setShowCrearModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Factura
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Factura</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="orden">Orden de Trabajo</Label>
                <Input
                  id="orden"
                  placeholder="ID de la orden de trabajo"
                  value={ordenTrabajoId}
                  onChange={(e) => setOrdenTrabajoId(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo de Facturación</Label>
                <Select value={tipoFacturacion} onValueChange={setTipoFacturacion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total">Facturación Total</SelectItem>
                    <SelectItem value="materiales">Solo Materiales</SelectItem>
                    <SelectItem value="parcial">Facturación Parcial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={crearFactura} className="flex-1">
                  Crear Factura
                </Button>
                <Button variant="outline" onClick={() => setShowCrearModal(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Ventas Totales</p>
                <p className="text-2xl font-bold">L {formatNumber(totalVentas)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Facturas Emitidas</p>
                <p className="text-2xl font-bold">{totalFacturasEmitidas}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Por Cobrar</p>
                <p className="text-2xl font-bold">L {formatNumber(totalPendiente)}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Facturas Pagadas</p>
                <p className="text-2xl font-bold">{totalFacturasPagadas}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por número o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full"
            prefix={<Search className="w-4 h-4 text-gray-400" />}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                <span>Estado</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="borrador">Borrador</SelectItem>
              <SelectItem value="emitida">Emitida</SelectItem>
              <SelectItem value="pagada">Pagada</SelectItem>
              <SelectItem value="vencida">Vencida</SelectItem>
              <SelectItem value="anulada">Anulada</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroFecha} onValueChange={setFiltroFecha}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Fecha</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las fechas</SelectItem>
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="semana">Última semana</SelectItem>
              <SelectItem value="mes">Último mes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="todas" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="emitidas">Emitidas</TabsTrigger>
          <TabsTrigger value="pagadas">Pagadas</TabsTrigger>
          <TabsTrigger value="vencidas">Vencidas</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          {/* Tabla de Facturas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Lista de Facturas</span>
                <div className="flex items-center text-sm text-gray-500">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  {sortedFacturas().length} facturas encontradas
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("numero")}>
                      <div className="flex items-center">Número {getSortIcon("numero")}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("cliente")}>
                      <div className="flex items-center">Cliente {getSortIcon("cliente")}</div>
                    </TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("fecha_emision")}>
                      <div className="flex items-center">Fecha {getSortIcon("fecha_emision")}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("total")}>
                      <div className="flex items-center">Total {getSortIcon("total")}</div>
                    </TableHead>
                    <TableHead>Pagado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFacturas().length > 0 ? (
                    sortedFacturas().map((factura) => {
                      const porcentajePagado = calcularPorcentajePagado(factura)
                      const totalPagado = factura.pagos?.reduce((sum, p) => sum + p.monto, 0) || 0

                      return (
                        <TableRow key={factura._id} className="group hover:bg-gray-50">
                          <TableCell className="font-medium">{factura.numero}</TableCell>
                          <TableCell>{factura.cliente_nombre || "Cliente"}</TableCell>
                          <TableCell>{getEstadoBadge(factura.estado)}</TableCell>
                          <TableCell>{formatDate(factura.fecha_emision)}</TableCell>
                          <TableCell className="font-bold">L {formatNumber(factura.total)}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>L {formatNumber(totalPagado)}</span>
                                <span>{porcentajePagado}%</span>
                              </div>
                              <Progress value={porcentajePagado} className="h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => verDetalleFactura(factura)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`/dashboard/facturas/imprimir/${factura._id}`, "_blank")}
                              >
                                <Printer className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                        No hay facturas disponibles con los filtros seleccionados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emitidas">
          {/* Contenido similar pero filtrado por emitidas */}
          <Card>
            <CardHeader>
              <CardTitle>Facturas Emitidas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Emisión</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Impuesto</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facturas
                    .filter((f) => f.estado === "emitida")
                    .map((factura) => (
                      <TableRow key={factura._id}>
                        <TableCell className="font-medium">{factura.numero}</TableCell>
                        <TableCell>{factura.cliente_nombre || "Cliente"}</TableCell>
                        <TableCell>{getEstadoBadge(factura.estado)}</TableCell>
                        <TableCell>{new Date(factura.fecha_emision).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(factura.fecha_vencimiento).toLocaleDateString()}</TableCell>
                        <TableCell>L {formatNumber(factura.subtotal)}</TableCell>
                        <TableCell>L {formatNumber(factura.impuesto_total)}</TableCell>
                        <TableCell className="font-bold">L {formatNumber(factura.total)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagadas">
          {/* Contenido similar pero filtrado por pagadas */}
          <Card>
            <CardHeader>
              <CardTitle>Facturas Pagadas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Emisión</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Impuesto</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facturas
                    .filter((f) => f.estado === "pagada")
                    .map((factura) => (
                      <TableRow key={factura._id}>
                        <TableCell className="font-medium">{factura.numero}</TableCell>
                        <TableCell>{factura.cliente_nombre || "Cliente"}</TableCell>
                        <TableCell>{getEstadoBadge(factura.estado)}</TableCell>
                        <TableCell>{new Date(factura.fecha_emision).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(factura.fecha_vencimiento).toLocaleDateString()}</TableCell>
                        <TableCell>L {formatNumber(factura.subtotal)}</TableCell>
                        <TableCell>L {formatNumber(factura.impuesto_total)}</TableCell>
                        <TableCell className="font-bold">L {formatNumber(factura.total)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vencidas">
          {/* Contenido similar pero filtrado por vencidas */}
          <Card>
            <CardHeader>
              <CardTitle>Facturas Vencidas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Emisión</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Impuesto</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facturas
                    .filter((f) => f.estado === "vencida")
                    .map((factura) => (
                      <TableRow key={factura._id}>
                        <TableCell className="font-medium">{factura.numero}</TableCell>
                        <TableCell>{factura.cliente_nombre || "Cliente"}</TableCell>
                        <TableCell>{getEstadoBadge(factura.estado)}</TableCell>
                        <TableCell>{new Date(factura.fecha_emision).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(factura.fecha_vencimiento).toLocaleDateString()}</TableCell>
                        <TableCell>L {formatNumber(factura.subtotal)}</TableCell>
                        <TableCell>L {formatNumber(factura.impuesto_total)}</TableCell>
                        <TableCell className="font-bold">L {formatNumber(factura.total)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Detalle */}
      <Dialog open={showDetalleModal} onOpenChange={setShowDetalleModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalle de Factura</DialogTitle>
          </DialogHeader>

          {facturaSeleccionada && (
            <div className="space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-500">Información General</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Número:</div>
                    <div className="text-sm font-medium">{facturaSeleccionada.numero}</div>

                    <div className="text-sm text-gray-500">Estado:</div>
                    <div>{getEstadoBadge(facturaSeleccionada.estado)}</div>

                    <div className="text-sm text-gray-500">Fecha Emisión:</div>
                    <div className="text-sm">{formatDate(facturaSeleccionada.fecha_emision)}</div>

                    <div className="text-sm text-gray-500">Fecha Vencimiento:</div>
                    <div className="text-sm">{formatDate(facturaSeleccionada.fecha_vencimiento)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-500">Cliente</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Nombre:</div>
                    <div className="text-sm font-medium">{facturaSeleccionada.cliente_nombre || "Cliente"}</div>

                    <div className="text-sm text-gray-500">ID:</div>
                    <div className="text-sm">{facturaSeleccionada.cliente_id}</div>
                  </div>
                </div>
              </div>

              {/* Totales */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Subtotal</div>
                    <div className="text-lg font-bold">L {formatNumber(facturaSeleccionada.subtotal)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Impuesto</div>
                    <div className="text-lg font-bold">L {formatNumber(facturaSeleccionada.impuesto_total)}</div>
                  </div>
                  <div className="text-center bg-blue-50 rounded p-2">
                    <div className="text-sm text-blue-600">Total</div>
                    <div className="text-lg font-bold text-blue-700">L {formatNumber(facturaSeleccionada.total)}</div>
                  </div>
                </div>
              </div>

              {/* Pagos */}
              <div className="space-y-3">
                <h3 className="font-semibold">Pagos Registrados</h3>

                {facturaSeleccionada.pagos && facturaSeleccionada.pagos.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Número</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead>Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {facturaSeleccionada.pagos.map((pago) => (
                          <TableRow key={pago._id}>
                            <TableCell className="font-medium">{pago.numero}</TableCell>
                            <TableCell>{formatDate(pago.fecha)}</TableCell>
                            <TableCell>{getMetodoPagoBadge(pago.metodo_pago)}</TableCell>
                            <TableCell className="font-bold">L {formatNumber(pago.monto)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 border rounded-lg">
                    No hay pagos registrados para esta factura
                  </div>
                )}

                {/* Resumen de pagos */}
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Total Factura</div>
                      <div className="text-lg font-bold">L {formatNumber(facturaSeleccionada.total)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Total Pagado</div>
                      <div className="text-lg font-bold text-green-600">
                        L {formatNumber(facturaSeleccionada.pagos?.reduce((sum, p) => sum + p.monto, 0) || 0)}
                      </div>
                    </div>
                    <div className="text-center bg-orange-50 rounded p-2">
                      <div className="text-sm text-orange-600">Saldo Pendiente</div>
                      <div className="text-lg font-bold text-orange-700">
                        L {formatNumber(facturaSeleccionada.saldo_pendiente)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => window.open(`/dashboard/facturas/imprimir/${facturaSeleccionada._id}`, "_blank")}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button onClick={() => setShowDetalleModal(false)}>Cerrar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
