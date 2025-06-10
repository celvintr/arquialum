"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  Send,
  XCircle,
  Settings,
  Printer,
  Filter,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Lock,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Cotizacion {
  _id: string
  numero: string
  cliente: {
    nombre: string
    email: string
  }
  fechaCreacion: string
  estado: string
  total: number
  tipo: string
  items: any[]
  grupos: any[]
  tiene_orden?: boolean
  orden_id?: string
  pagos_realizados?: number
  saldo_pendiente?: number
  porcentaje_pagado?: number
  facturas_asociadas?: number
}

export default function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [creandoOrden, setCreandoOrden] = useState<string | null>(null)

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroFecha, setFiltroFecha] = useState<Date | undefined>(undefined)
  const [filtroPago, setFiltroPago] = useState<string>("todos")

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 5

  useEffect(() => {
    cargarCotizaciones()
  }, [])

  const cargarCotizaciones = async () => {
    try {
      setLoading(true)
      console.log("🔄 Cargando cotizaciones...")

      // Cargar cotizaciones
      const response = await fetch("/api/cotizaciones")
      if (!response.ok) {
        throw new Error("Error al cargar cotizaciones")
      }
      const data = await response.json()

      // Cargar órdenes de trabajo
      const ordenesResponse = await fetch("/api/ordenes-trabajo")
      if (!ordenesResponse.ok) {
        throw new Error("Error al cargar órdenes")
      }
      const ordenesData = await ordenesResponse.json()

      // Cargar pagos
      const pagosResponse = await fetch("/api/pagos")
      if (!pagosResponse.ok) {
        throw new Error("Error al cargar pagos")
      }
      const pagosData = await pagosResponse.json()

      // Cargar facturas
      const facturasResponse = await fetch("/api/facturas")
      if (!facturasResponse.ok) {
        throw new Error("Error al cargar facturas")
      }
      const facturasData = await facturasResponse.json()

      console.log("📊 Datos cargados:")
      console.log("- Cotizaciones:", data.cotizaciones?.length || 0)
      console.log("- Órdenes:", ordenesData.ordenes?.length || 0)
      console.log("- Pagos:", pagosData.pagos?.length || 0)
      console.log("- Facturas:", facturasData.facturas?.length || 0)

      // Procesar cada cotización con sus datos reales
      const cotizacionesConDatos = (data.cotizaciones || []).map((cotizacion: Cotizacion) => {
        // Buscar orden de trabajo de esta cotización
        const orden = ordenesData.ordenes?.find((o: any) => o.cotizacion_id === cotizacion._id)

        // Buscar facturas de esta cotización
        const facturasAsociadas = facturasData.facturas?.filter((f: any) => f.cotizacion_id === cotizacion._id) || []

        if (orden) {
          // Buscar pagos de esta orden
          const pagosOrden = pagosData.pagos?.filter((p: any) => p.orden_trabajo_id === orden._id) || []

          // Calcular totales de pagos confirmados
          const totalPagado = pagosOrden.reduce((sum: number, pago: any) => {
            return sum + (pago.estado === "completado" ? pago.monto || 0 : 0)
          }, 0)

          const saldoPendiente = Math.max(0, (cotizacion.total || 0) - totalPagado)
          const porcentajePagado = cotizacion.total > 0 ? (totalPagado / cotizacion.total) * 100 : 0

          return {
            ...cotizacion,
            tiene_orden: true,
            orden_id: orden._id,
            pagos_realizados: totalPagado,
            saldo_pendiente: saldoPendiente,
            porcentaje_pagado: porcentajePagado,
            facturas_asociadas: facturasAsociadas.length,
          }
        } else {
          // Sin orden = sin pagos
          return {
            ...cotizacion,
            tiene_orden: false,
            pagos_realizados: 0,
            saldo_pendiente: cotizacion.total,
            porcentaje_pagado: 0,
            facturas_asociadas: facturasAsociadas.length,
          }
        }
      })

      setCotizaciones(cotizacionesConDatos)
      console.log("✅ Cotizaciones procesadas con datos de pagos")
    } catch (error) {
      console.error("❌ Error cargando datos:", error)
      toast.error("Error al cargar las cotizaciones")
    } finally {
      setLoading(false)
    }
  }

  // Aplicar filtros
  const cotizacionesFiltradas = cotizaciones.filter((cotizacion) => {
    // Filtro de búsqueda
    const coincideBusqueda =
      cotizacion.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotizacion.cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotizacion.tipo.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro de estado
    const coincideEstado = filtroEstado === "todos" || cotizacion.estado === filtroEstado

    // Filtro de tipo
    const coincideTipo = filtroTipo === "todos" || cotizacion.tipo === filtroTipo

    // Filtro de fecha
    const coincideFecha =
      !filtroFecha || new Date(cotizacion.fechaCreacion).toDateString() === filtroFecha.toDateString()

    // Filtro de pago
    let coincidePago = true
    if (filtroPago === "sin_pagos") {
      coincidePago = (cotizacion.pagos_realizados || 0) === 0
    } else if (filtroPago === "pagos_parciales") {
      coincidePago = (cotizacion.porcentaje_pagado || 0) > 0 && (cotizacion.porcentaje_pagado || 0) < 100
    } else if (filtroPago === "pagos_completos") {
      coincidePago = (cotizacion.porcentaje_pagado || 0) >= 100
    }

    return coincideBusqueda && coincideEstado && coincideTipo && coincideFecha && coincidePago
  })

  // Paginación
  const totalPaginas = Math.ceil(cotizacionesFiltradas.length / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const indiceFin = indiceInicio + itemsPorPagina
  const cotizacionesPaginadas = cotizacionesFiltradas.slice(indiceInicio, indiceFin)

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1)
  }, [searchTerm, filtroEstado, filtroTipo, filtroFecha, filtroPago])

  const limpiarFiltros = () => {
    setSearchTerm("")
    setFiltroEstado("todos")
    setFiltroTipo("todos")
    setFiltroFecha(undefined)
    setFiltroPago("todos")
    setPaginaActual(1)
  }

  const getEstadoBadge = (estado: string) => {
    const estilos = {
      borrador: "bg-gray-100 text-gray-800",
      enviada: "bg-blue-100 text-blue-800",
      aprobada: "bg-green-100 text-green-800",
      rechazada: "bg-red-100 text-red-800",
    }

    return <Badge className={estilos[estado] || "bg-gray-100 text-gray-800"}>{estado}</Badge>
  }

  const getTipoBadge = (tipo: string) => {
    const colores = {
      productos: "bg-purple-100 text-purple-800",
      reparaciones: "bg-orange-100 text-orange-800",
      vidrio_templado: "bg-cyan-100 text-cyan-800",
      libre: "bg-pink-100 text-pink-800",
    }
    return <Badge className={colores[tipo] || "bg-gray-100 text-gray-800"}>{tipo}</Badge>
  }

  const getPagoBadge = (cotizacion: Cotizacion) => {
    const pagosRealizados = cotizacion.pagos_realizados || 0
    const porcentaje = cotizacion.porcentaje_pagado || 0

    if (pagosRealizados === 0) {
      return <Badge className="bg-red-100 text-red-800">Sin Pagos (0%)</Badge>
    }

    if (porcentaje >= 100) {
      return <Badge className="bg-green-100 text-green-800">Pagado (100%)</Badge>
    }

    return <Badge className="bg-yellow-100 text-yellow-800">Parcial ({Math.round(porcentaje)}%)</Badge>
  }

  const puedeEditar = (cotizacion: Cotizacion) => {
    return (cotizacion.pagos_realizados || 0) === 0
  }

  const puedeEliminar = (cotizacion: Cotizacion) => {
    return !cotizacion.tiene_orden && (cotizacion.pagos_realizados || 0) === 0
  }

  const puedeCambiarEstado = (cotizacion: Cotizacion) => {
    // No se puede cambiar estado si tiene pagos, excepto para rechazar
    return (cotizacion.pagos_realizados || 0) === 0
  }

  const eliminarCotizacion = async (id: string) => {
    const cotizacion = cotizaciones.find((c) => c._id === id)

    if (!puedeEliminar(cotizacion!)) {
      if (cotizacion?.tiene_orden) {
        toast.error("No se puede eliminar: La cotización tiene una orden de trabajo asociada")
      } else if (cotizacion?.pagos_realizados && cotizacion.pagos_realizados > 0) {
        toast.error("No se puede eliminar: La cotización tiene pagos registrados")
      }
      return
    }

    if (cotizacion?.estado === "aprobada") {
      if (!confirm("⚠️ Esta cotización está APROBADA. ¿Estás seguro de eliminarla?")) {
        return
      }
    } else {
      if (!confirm("¿Estás seguro de que quieres eliminar esta cotización?")) {
        return
      }
    }

    try {
      const response = await fetch(`/api/cotizaciones/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Cotización eliminada exitosamente")
        cargarCotizaciones()
      } else {
        const error = await response.json()
        toast.error(error.message || "Error al eliminar la cotización")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de conexión al eliminar cotización")
    }
  }

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    const cotizacion = cotizaciones.find((c) => c._id === id)

    // Validar si se puede cambiar el estado
    if (!puedeCambiarEstado(cotizacion!) && nuevoEstado !== "rechazada") {
      toast.error("No se puede cambiar el estado: La cotización tiene pagos registrados")
      return
    }

    try {
      const response = await fetch(`/api/cotizaciones/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (response.ok) {
        toast.success(`Cotización ${nuevoEstado} exitosamente`)
        cargarCotizaciones()
      } else {
        const error = await response.json()
        toast.error(error.message || "Error al cambiar el estado")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de conexión al cambiar estado")
    }
  }

  const crearOrdenDeTrabajo = async (cotizacion: Cotizacion) => {
    try {
      setCreandoOrden(cotizacion._id)

      const payload = {
        cotizacion_id: cotizacion._id,
        cotizacion_numero: cotizacion.numero,
        cliente_id: cotizacion.cliente?.id || "cliente_default",
        cliente_nombre: cotizacion.cliente?.nombre || "Cliente sin nombre",
      }

      const response = await fetch("/api/ordenes-trabajo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(`✅ Orden de trabajo ${data.orden.numero} creada exitosamente`)
        cargarCotizaciones()

        setTimeout(() => {
          window.location.href = "/dashboard/ordenes-trabajo"
        }, 1500)
      } else {
        toast.error(data.error || data.message || "Error al crear la orden de trabajo")
      }
    } catch (error) {
      console.error("❌ Error de conexión:", error)
      toast.error("Error de conexión al crear la orden de trabajo")
    } finally {
      setCreandoOrden(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
              <span>Cargando cotizaciones y datos de pagos...</span>
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
          <h1 className="text-3xl font-bold">💼 Cotizaciones</h1>
          <p className="text-gray-600 mt-2">Gestiona todas tus cotizaciones y su estado de pago real</p>
        </div>
        <Link href="/dashboard/cotizaciones/nueva">
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cotización
          </Button>
        </Link>
      </div>

      {/* Filtros Avanzados */}
      <Card className="border-2 border-blue-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5" />
            Filtros Avanzados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primera fila de filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar cotizaciones..."
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
                <SelectItem value="borrador">Borrador</SelectItem>
                <SelectItem value="enviada">Enviada</SelectItem>
                <SelectItem value="aprobada">Aprobada</SelectItem>
                <SelectItem value="rechazada">Rechazada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="productos">Productos</SelectItem>
                <SelectItem value="reparaciones">Reparaciones</SelectItem>
                <SelectItem value="vidrio_templado">Vidrio Templado</SelectItem>
                <SelectItem value="libre">Libre</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroPago} onValueChange={setFiltroPago}>
              <SelectTrigger>
                <SelectValue placeholder="Estado de Pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los pagos</SelectItem>
                <SelectItem value="sin_pagos">Sin Pagos</SelectItem>
                <SelectItem value="pagos_parciales">Pagos Parciales</SelectItem>
                <SelectItem value="pagos_completos">Pagos Completos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Segunda fila de filtros */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filtroFecha ? format(filtroFecha, "PPP", { locale: es }) : "Filtrar por fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={filtroFecha} onSelect={setFiltroFecha} initialFocus />
                </PopoverContent>
              </Popover>

              <Button variant="outline" onClick={limpiarFiltros}>
                Limpiar Filtros
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-sm">
                {cotizacionesFiltradas.length} de {cotizaciones.length} cotizaciones
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de cotizaciones */}
      {cotizacionesPaginadas.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cotizaciones</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filtroEstado !== "todos" || filtroTipo !== "todos" || filtroFecha || filtroPago !== "todos"
                ? "No se encontraron cotizaciones con los filtros aplicados"
                : "Comienza creando una nueva cotización"}
            </p>
            {searchTerm ||
            filtroEstado !== "todos" ||
            filtroTipo !== "todos" ||
            filtroFecha ||
            filtroPago !== "todos" ? (
              <Button onClick={limpiarFiltros}>Limpiar Filtros</Button>
            ) : (
              <Link href="/dashboard/cotizaciones/nueva">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Cotización
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cotizacionesPaginadas.map((cotizacion) => (
            <Card
              key={cotizacion._id}
              className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Cotización #{cotizacion.numero}
                      {cotizacion.tiene_orden && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          Con Orden
                        </Badge>
                      )}
                      {getPagoBadge(cotizacion)}
                      {!puedeEditar(cotizacion) && (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                          <Lock className="w-3 h-3 mr-1" />
                          Bloqueada
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Cliente: {cotizacion.cliente?.nombre || "Sin cliente"}</p>
                    <p className="text-xs text-gray-500">ID: {cotizacion._id}</p>
                  </div>
                  <div className="flex space-x-2">
                    {/* Enlaces a pagos - CORREGIDO CON FILTRO */}
                    {cotizacion.tiene_orden && (
                      <Link href={`/dashboard/pagos?filtro_orden=${cotizacion.orden_id}`}>
                        <Button variant="ghost" size="icon" title="Ver pagos asociados">
                          <CreditCard className="h-4 w-4 text-green-600" />
                        </Button>
                      </Link>
                    )}

                    {/* Botón de imprimir */}
                    <Link href={`/dashboard/cotizaciones/imprimir/${cotizacion._id}`}>
                      <Button variant="ghost" size="icon" title="Imprimir cotización">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </Link>

                    <Link href={`/dashboard/cotizaciones/ver/${cotizacion._id}`}>
                      <Button variant="ghost" size="icon" title="Ver cotización">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>

                    {/* Botón de editar con validación */}
                    {puedeEditar(cotizacion) ? (
                      <Link href={`/dashboard/cotizaciones/editar/${cotizacion._id}`}>
                        <Button variant="ghost" size="icon" title="Editar cotización">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="No se puede editar: tiene pagos asociados"
                        disabled
                        className="opacity-50 cursor-not-allowed"
                      >
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </Button>
                    )}

                    {/* Botones de estado - LÓGICA CORREGIDA CON VALIDACIÓN DE PAGOS */}
                    {cotizacion.estado === "borrador" && puedeCambiarEstado(cotizacion) && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Aprobar cotización"
                          onClick={() => cambiarEstado(cotizacion._id, "aprobada")}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Enviar cotización"
                          onClick={() => cambiarEstado(cotizacion._id, "enviada")}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {cotizacion.estado === "enviada" && puedeCambiarEstado(cotizacion) && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Aprobar cotización"
                          onClick={() => cambiarEstado(cotizacion._id, "aprobada")}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Rechazar cotización"
                          onClick={() => cambiarEstado(cotizacion._id, "rechazada")}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {/* Botón para crear orden de trabajo - SOLO cuando está aprobada y NO tiene orden */}
                    {cotizacion.estado === "aprobada" && !cotizacion.tiene_orden && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Crear Orden de Trabajo"
                        onClick={() => crearOrdenDeTrabajo(cotizacion)}
                        disabled={creandoOrden === cotizacion._id}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                      >
                        {creandoOrden === cotizacion._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        ) : (
                          <Settings className="h-4 w-4" />
                        )}
                      </Button>
                    )}

                    {/* Botón de rechazar - SOLO si no tiene pagos */}
                    {(cotizacion.estado === "aprobada" || cotizacion.estado === "enviada") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title={
                          puedeCambiarEstado(cotizacion)
                            ? "Rechazar cotización"
                            : "No se puede rechazar: tiene pagos asociados"
                        }
                        onClick={() => cambiarEstado(cotizacion._id, "rechazada")}
                        disabled={!puedeCambiarEstado(cotizacion)}
                        className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${
                          !puedeCambiarEstado(cotizacion) ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Botón de eliminar - SOLO si no tiene orden ni pagos */}
                    <Button
                      variant="ghost"
                      size="icon"
                      title={
                        puedeEliminar(cotizacion)
                          ? "Eliminar cotización"
                          : "No se puede eliminar: tiene orden o pagos asociados"
                      }
                      onClick={() => eliminarCotizacion(cotizacion._id)}
                      disabled={!puedeEliminar(cotizacion)}
                      className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${
                        !puedeEliminar(cotizacion) ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-8 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Fecha:</span>
                    <p className="text-gray-600">{new Date(cotizacion.fechaCreacion).toLocaleDateString("es-HN")}</p>
                  </div>
                  <div>
                    <span className="font-medium">Tipo:</span>
                    <div className="mt-1">{getTipoBadge(cotizacion.tipo)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Estado:</span>
                    <div className="mt-1">{getEstadoBadge(cotizacion.estado)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Items:</span>
                    <p className="text-gray-600">{cotizacion.items?.length || 0} items</p>
                  </div>
                  <div>
                    <span className="font-medium">Total:</span>
                    <p className="text-gray-600 font-semibold">
                      L {cotizacion.total?.toLocaleString("es-HN") || "0.00"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Pagado:</span>
                    <p className="text-green-600 font-semibold">
                      L {(cotizacion.pagos_realizados || 0).toLocaleString("es-HN")}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Saldo:</span>
                    <p
                      className={`font-semibold ${(cotizacion.saldo_pendiente || 0) > 0 ? "text-orange-600" : "text-green-600"}`}
                    >
                      L {(cotizacion.saldo_pendiente || 0).toLocaleString("es-HN")}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Facturas:</span>
                    <p className="text-blue-600 font-semibold">{cotizacion.facturas_asociadas || 0}</p>
                  </div>
                </div>
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
                Mostrando {indiceInicio + 1} a {Math.min(indiceFin, cotizacionesFiltradas.length)} de{" "}
                {cotizacionesFiltradas.length} cotizaciones
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
    </div>
  )
}
