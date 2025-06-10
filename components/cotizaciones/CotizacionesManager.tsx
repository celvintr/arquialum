"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Package,
  Wrench,
  GlassWater,
  FileText,
  ShoppingCart,
  Plus,
  Save,
  RefreshCw,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Star,
  TrendingUp,
} from "lucide-react"
import CotizarProductoModal from "./CotizarProductoModal"
import CotizarReparacionModal from "./CotizarReparacionModal"
import CotizarVidrioTempladoModal from "./CotizarVidrioTempladoModal"
import CotizacionLibreModal from "./CotizacionLibreModal"
import ClienteSelector from "./ClienteSelector"
import ResumenCotizacion from "./ResumenCotizacion"
import GruposManager from "./GruposManager"
import SeleccionarProductoModal from "./SeleccionarProductoModal"
import { useToast } from "@/components/ui/use-toast"
import { SessionManager } from "@/lib/utils/session-manager"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CotizacionesManagerProps {
  tipoCotizacion?: string
}

export default function CotizacionesManager({ tipoCotizacion }: CotizacionesManagerProps) {
  const { toast } = useToast()

  // Estados principales
  const [items, setItems] = useState<any[]>([])
  const [cliente, setCliente] = useState<any>(null)
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)

  // Estados de modales
  const [modalProducto, setModalProducto] = useState(false)
  const [modalReparacion, setModalReparacion] = useState(false)
  const [modalVidrioTemplado, setModalVidrioTemplado] = useState(false)
  const [modalLibre, setModalLibre] = useState(false)
  const [modalSeleccionProducto, setModalSeleccionProducto] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null)
  const [itemEditando, setItemEditando] = useState<any>(null)

  // Estados de grupos
  const [grupos, setGrupos] = useState<any[]>([
    {
      id: "default",
      nombre: "Items Generales",
      descripcion: "Items sin grupo específico",
      items: [],
      imagen: null,
      imagenUrl: null,
    },
  ])
  const [grupoActivo, setGrupoActivo] = useState("default")

  // Estado de sesión
  const [sesionInfo, setSesionInfo] = useState<any>(null)
  const [autoGuardado, setAutoGuardado] = useState(false)
  const [errorSesion, setErrorSesion] = useState<string | null>(null)

  useEffect(() => {
    // Cargar productos si es necesario
    if (tipoCotizacion === "productos") {
      cargarProductos()
    }

    // Cargar sesión guardada
    cargarSesionGuardada()

    // Auto-guardado cada 10 segundos
    const interval = setInterval(() => {
      if (items.length > 0 || cliente) {
        guardarSesionAutomatica()
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [tipoCotizacion])

  // Auto-guardar cuando cambien los datos importantes
  useEffect(() => {
    if (items.length > 0 || cliente) {
      const timeoutId = setTimeout(guardarSesionAutomatica, 2000)
      return () => clearTimeout(timeoutId)
    }
  }, [items, cliente, grupos, grupoActivo])

  const cargarProductos = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/productos")
      const data = await response.json()
      setProductos(data.productos || [])

      toast({
        title: "📦 Productos cargados",
        description: `Se cargaron ${data.productos?.length || 0} productos disponibles`,
      })
    } catch (error) {
      console.error("Error cargando productos:", error)
      toast({
        title: "❌ Error al cargar productos",
        description: "No se pudieron cargar los productos. Intente recargar la página.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const cargarSesionGuardada = () => {
    try {
      const session = SessionManager.cargarSesion()
      if (session) {
        setItems(session.items || [])
        setCliente(session.cliente || null)

        // Asegurarse de que siempre haya al menos el grupo default
        const gruposCargados = session.grupos || []
        if (gruposCargados.length === 0 || !gruposCargados.find((g: any) => g.id === "default")) {
          gruposCargados.push({
            id: "default",
            nombre: "Items Generales",
            descripcion: "Items sin grupo específico",
            items: [],
            imagen: null,
            imagenUrl: null,
          })
        }

        setGrupos(gruposCargados)
        setGrupoActivo(session.grupoActivo || "default")
        setSesionInfo(SessionManager.getInfoSesion())

        toast({
          title: "🔄 Sesión recuperada",
          description: `Se recuperaron ${session.items?.length || 0} items y ${gruposCargados.length} grupos de la sesión anterior`,
          duration: 5000,
        })

        setErrorSesion(null)
      }
    } catch (error) {
      console.error("Error al cargar la sesión:", error)
      setErrorSesion(
        "Hubo un problema al cargar la sesión guardada. Algunos datos podrían no haberse recuperado correctamente.",
      )

      toast({
        title: "⚠️ Error de sesión",
        description: "No se pudo cargar la sesión anterior completamente",
        variant: "destructive",
      })
    }
  }

  const guardarSesionAutomatica = () => {
    try {
      setGuardando(true)

      SessionManager.guardarSesion({
        cliente,
        items,
        grupos,
        grupoActivo,
      })

      setSesionInfo(SessionManager.getInfoSesion())
      setAutoGuardado(true)
      setErrorSesion(null)

      // Quitar indicador después de 2 segundos
      setTimeout(() => setAutoGuardado(false), 2000)
    } catch (error) {
      console.error("Error al guardar sesión:", error)
      setErrorSesion("No se pudo guardar la sesión automáticamente. Intente guardar manualmente.")

      toast({
        title: "⚠️ Error de auto-guardado",
        description: "La sesión no se pudo guardar automáticamente",
        variant: "destructive",
      })
    } finally {
      setGuardando(false)
    }
  }

  const guardarSesionManual = () => {
    try {
      setGuardando(true)

      SessionManager.guardarSesion({
        cliente,
        items,
        grupos,
        grupoActivo,
      })

      setSesionInfo(SessionManager.getInfoSesion())
      setErrorSesion(null)

      toast({
        title: "💾 Sesión guardada manualmente",
        description: "La cotización ha sido guardada localmente con éxito",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error al guardar sesión manualmente:", error)
      toast({
        title: "❌ Error al guardar",
        description: "No se pudo guardar la sesión. Intente de nuevo.",
        variant: "destructive",
      })
    } finally {
      setGuardando(false)
    }
  }

  const limpiarSesion = () => {
    SessionManager.limpiarSesion()
    setItems([])
    setCliente(null)
    setGrupos([
      {
        id: "default",
        nombre: "Items Generales",
        descripcion: "Items sin grupo específico",
        items: [],
        imagen: null,
        imagenUrl: null,
      },
    ])
    setGrupoActivo("default")
    setSesionInfo(null)
    setErrorSesion(null)

    toast({
      title: "🧹 Sesión limpiada",
      description: "Se han eliminado todos los datos guardados. Comenzando desde cero.",
      duration: 4000,
    })
  }

  const agregarItem = (item: any) => {
    if (itemEditando) {
      // Estamos editando un item existente
      setItems((prev) =>
        prev.map((existingItem) =>
          existingItem.id === itemEditando.id
            ? { ...item, id: itemEditando.id, timestamp: itemEditando.timestamp }
            : existingItem,
        ),
      )

      toast({
        title: "✏️ Item actualizado",
        description: `"${item.nombre || item.descripcion}" ha sido actualizado en ${grupos.find((g) => g.id === (item.grupoId || grupoActivo))?.nombre}`,
        duration: 4000,
      })

      setItemEditando(null)
    } else {
      // Estamos agregando un item nuevo
      const nuevoItem = {
        ...item,
        id: Date.now(),
        grupoId: grupoActivo,
        timestamp: new Date().toISOString(),
      }

      setItems((prev) => [...prev, nuevoItem])

      toast({
        title: "✅ Item agregado exitosamente",
        description: `"${item.nombre || item.descripcion}" se agregó al grupo: ${grupos.find((g) => g.id === grupoActivo)?.nombre}`,
        duration: 4000,
      })
    }
  }

  const eliminarItem = (itemId: number) => {
    const item = items.find((i) => i.id === itemId)
    setItems((prev) => prev.filter((item) => item.id !== itemId))

    toast({
      title: "🗑️ Item eliminado",
      description: `"${item?.nombre || item?.descripcion || "Item"}" ha sido eliminado de la cotización`,
      variant: "destructive",
      duration: 4000,
    })
  }

  const editarItem = (itemId: number) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    setItemEditando(item)

    // Abrir el modal correspondiente según el tipo
    switch (item.tipo) {
      case "producto":
        // Para productos, necesitamos cargar el producto original
        if (item.producto_id) {
          const producto = productos.find((p) => p._id === item.producto_id) || {
            _id: item.producto_id,
            nombre: item.producto_nombre || item.nombre,
            imagen: item.producto_imagen,
          }
          setProductoSeleccionado(producto)
        }
        setModalProducto(true)
        break
      case "reparacion":
        setModalReparacion(true)
        break
      case "vidrio_templado":
      case "barandal":
        setModalVidrioTemplado(true)
        break
      case "libre":
        setModalLibre(true)
        break
      default:
        toast({
          title: "⚠️ Función no disponible",
          description: "La edición de este tipo de item no está disponible aún",
          variant: "destructive",
        })
    }

    toast({
      title: "✏️ Modo edición activado",
      description: `Editando: ${item.nombre || item.descripcion}`,
    })
  }

  const actualizarCantidadItem = (itemId: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) return

    const item = items.find((i) => i.id === itemId)

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const precioUnitario = item.precio_unitario || item.precio_total / item.cantidad
          return {
            ...item,
            cantidad: nuevaCantidad,
            precio_total: precioUnitario * nuevaCantidad,
          }
        }
        return item
      }),
    )

    toast({
      title: "🔢 Cantidad actualizada",
      description: `"${item?.nombre || item?.descripcion}" - Nueva cantidad: ${nuevaCantidad}`,
    })
  }

  const moverItemAGrupo = (itemId: number, nuevoGrupoId: string) => {
    const item = items.find((i) => i.id === itemId)
    const grupoDestino = grupos.find((g) => g.id === nuevoGrupoId)

    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, grupoId: nuevoGrupoId } : item)))

    toast({
      title: "📁 Item movido",
      description: `"${item?.nombre || item?.descripcion}" se movió a: ${grupoDestino?.nombre}`,
    })
  }

  const crearGrupo = (nombre: string, imagen?: File, descripcion?: string) => {
    const nuevoGrupo = {
      id: `grupo_${Date.now()}`,
      nombre,
      descripcion: descripcion || "",
      items: [],
      imagen: imagen || null,
      imagenUrl: imagen ? URL.createObjectURL(imagen) : null,
    }

    setGrupos((prev) => [...prev, nuevoGrupo])
    setGrupoActivo(nuevoGrupo.id)

    // Guardar inmediatamente para asegurar que la imagen se procese
    setTimeout(() => {
      guardarSesionAutomatica()
    }, 500)

    toast({
      title: "🎉 ¡Grupo creado exitosamente!",
      description: `El grupo "${nombre}" está listo para usar. Ahora es tu grupo activo.`,
      duration: 5000,
    })
  }

  const eliminarGrupo = (grupoId: string) => {
    if (grupoId === "default") {
      toast({
        title: "🚫 Acción no permitida",
        description: "No se puede eliminar el grupo por defecto",
        variant: "destructive",
      })
      return
    }

    const grupo = grupos.find((g) => g.id === grupoId)
    const itemsAfectados = items.filter((item) => item.grupoId === grupoId)

    // Mover items del grupo eliminado al grupo por defecto
    setItems((prev) => prev.map((item) => (item.grupoId === grupoId ? { ...item, grupoId: "default" } : item)))

    setGrupos((prev) => prev.filter((grupo) => grupo.id !== grupoId))

    if (grupoActivo === grupoId) {
      setGrupoActivo("default")
    }

    toast({
      title: "🗑️ Grupo eliminado",
      description: `"${grupo?.nombre}" eliminado. ${itemsAfectados.length} items movidos al grupo general.`,
      variant: "destructive",
      duration: 5000,
    })
  }

  const actualizarGrupo = (grupoId: string, datos: any) => {
    setGrupos((prev) =>
      prev.map((grupo) =>
        grupo.id === grupoId
          ? {
              ...grupo,
              ...datos,
              imagenUrl: datos.imagen ? URL.createObjectURL(datos.imagen) : grupo.imagenUrl,
            }
          : grupo,
      ),
    )

    // Guardar inmediatamente para asegurar que la imagen se procese
    setTimeout(() => {
      guardarSesionAutomatica()
    }, 500)
  }

  const calcularTotal = () => {
    return items.reduce((total, item) => total + (item.precio_total || 0), 0)
  }

  const guardarCotizacion = async () => {
    if (items.length === 0) {
      toast({
        title: "⚠️ Cotización vacía",
        description: "Debe agregar al menos un item antes de guardar la cotización",
        variant: "destructive",
      })
      return
    }

    if (!cliente) {
      toast({
        title: "⚠️ Cliente requerido",
        description: "Debe seleccionar un cliente antes de guardar la cotización",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Toast de inicio del proceso
      toast({
        title: "💾 Guardando cotización...",
        description: "Procesando la información, por favor espere...",
      })

      const cotizacionData = {
        cliente_id: cliente._id,
        items: items,
        grupos: grupos,
        subtotal: calcularTotal(),
        iva: calcularTotal() * 0.15,
        total: calcularTotal() * 1.15,
        tipo: tipoCotizacion || "mixta",
        estado: "borrador",
      }

      console.log("📤 Enviando cotización:", cotizacionData)

      const response = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cotizacionData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "🎉 ¡Cotización guardada exitosamente!",
          description: `Cotización ${result.cotizacion.numero} creada. Total: L ${result.cotizacion.total.toLocaleString()}. Redirigiendo...`,
          duration: 6000,
        })

        limpiarSesion()

        // Redirigir a la vista previa después de 2 segundos
        setTimeout(() => {
          window.location.href = `/dashboard/cotizaciones/ver/${result.cotizacion._id}`
        }, 2000)
      } else {
        throw new Error(result.details || result.error || "Error desconocido")
      }
    } catch (error) {
      console.error("❌ Error guardando cotización:", error)
      toast({
        title: "❌ Error al guardar cotización",
        description: `No se pudo guardar: ${error.message}. Verifique su conexión e intente nuevamente.`,
        variant: "destructive",
        duration: 6000,
      })
    } finally {
      setLoading(false)
    }
  }

  const itemsGrupoActivo = items.filter(
    (item) => item.grupoId === grupoActivo || (!item.grupoId && grupoActivo === "default"),
  )

  return (
    <div className="space-y-6">
      {/* Header con Cliente y Sesión */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Nueva Cotización
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Tipo: {tipoCotizacion ? tipoCotizacion.charAt(0).toUpperCase() + tipoCotizacion.slice(1) : "Mixta"}
              </p>

              {/* Indicadores de sesión */}
              <div className="flex gap-2 mt-2">
                {sesionInfo && (
                  <Badge variant="outline" className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Última sesión: {new Date(sesionInfo.timestamp).toLocaleTimeString()}
                  </Badge>
                )}
                {autoGuardado && (
                  <Badge className="bg-green-500 flex items-center animate-pulse">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Auto-guardado
                  </Badge>
                )}
                {guardando && (
                  <Badge className="bg-blue-500 flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    Guardando...
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={guardarSesionManual} disabled={guardando}>
                <Save className="w-4 h-4 mr-2" />
                {guardando ? "Guardando..." : "Guardar Sesión"}
              </Button>
              <ClienteSelector
                cliente={cliente}
                onClienteSeleccionado={(nuevoCliente) => {
                  setCliente(nuevoCliente)
                  toast({
                    title: "👤 Cliente seleccionado",
                    description: `Cliente: ${nuevoCliente?.nombre || "Sin nombre"}`,
                  })
                }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alerta de error de sesión */}
      {errorSesion && (
        <Alert variant="destructive" className="border-l-4 border-l-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>⚠️ Error de sesión</AlertTitle>
          <AlertDescription>
            {errorSesion}
            <Button variant="link" className="p-0 h-auto text-red-600 underline ml-2" onClick={guardarSesionManual}>
              Intentar guardar manualmente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Gestión de Grupos */}
      <GruposManager
        grupos={grupos}
        grupoActivo={grupoActivo}
        items={items}
        onGrupoSeleccionado={setGrupoActivo}
        onCrearGrupo={crearGrupo}
        onEliminarGrupo={eliminarGrupo}
        onActualizarGrupo={actualizarGrupo}
      />

      {/* Panel de Agregar Items - TODOS LOS TIPOS */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Agregar Items a la Cotización
            <Badge className="ml-2 bg-gradient-to-r from-green-500 to-blue-500">
              <TrendingUp className="w-3 h-3 mr-1" />
              Activo: {grupos.find((g) => g.id === grupoActivo)?.nombre}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Productos */}
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-500 group">
              <CardContent
                className="p-6 text-center"
                onClick={() => {
                  setModalSeleccionProducto(true)
                  toast({
                    title: "📦 Abriendo catálogo de productos",
                    description: "Seleccione un producto para cotizar",
                  })
                }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Productos</h3>
                <p className="text-sm text-gray-600">Cotizar productos del catálogo</p>
                <Badge className="mt-2 bg-blue-100 text-blue-800">Usa Materiales</Badge>
              </CardContent>
            </Card>

            {/* Reparaciones */}
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-green-500 group">
              <CardContent
                className="p-6 text-center"
                onClick={() => {
                  setModalReparacion(true)
                  toast({
                    title: "🔧 Abriendo reparaciones",
                    description: "Configure un servicio de reparación",
                  })
                }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Wrench className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Reparaciones</h3>
                <p className="text-sm text-gray-600">Servicios de reparación</p>
                <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                  Precio Fijo
                </Badge>
              </CardContent>
            </Card>

            {/* Vidrio Templado */}
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-500 group">
              <CardContent
                className="p-6 text-center"
                onClick={() => {
                  setModalVidrioTemplado(true)
                  toast({
                    title: "🪟 Abriendo vidrio templado",
                    description: "Configure barandales, puertas o divisiones",
                  })
                }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <GlassWater className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Vidrio Templado</h3>
                <p className="text-sm text-gray-600">Barandales, puertas, divisiones</p>
                <Badge variant="secondary" className="mt-2 bg-purple-100 text-purple-800">
                  Calculado
                </Badge>
              </CardContent>
            </Card>

            {/* Cotización Libre */}
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-orange-500 group">
              <CardContent
                className="p-6 text-center"
                onClick={() => {
                  setModalLibre(true)
                  toast({
                    title: "📝 Abriendo cotización libre",
                    description: "Cree un item personalizado",
                  })
                }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Cotización Libre</h3>
                <p className="text-sm text-gray-600">Items personalizados</p>
                <Badge variant="secondary" className="mt-2 bg-orange-100 text-orange-800">
                  Manual
                </Badge>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Items del Grupo Activo */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Items en {grupos.find((g) => g.id === grupoActivo)?.nombre} ({itemsGrupoActivo.length})
              {itemsGrupoActivo.length > 0 && (
                <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500">
                  Total: L {itemsGrupoActivo.reduce((sum, item) => sum + (item.precio_total || 0), 0).toLocaleString()}
                </Badge>
              )}
            </div>
            {items.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    cargarSesionGuardada()
                    toast({
                      title: "🔄 Recargando sesión",
                      description: "Actualizando datos desde el almacenamiento local",
                    })
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recargar
                </Button>
                <Button variant="outline" size="sm" onClick={limpiarSesion}>
                  Limpiar Todo
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {itemsGrupoActivo.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No hay items en este grupo</h3>
              <p className="text-sm">Agrega items usando los botones de arriba para comenzar tu cotización</p>
              <div className="mt-4">
                <Badge variant="outline" className="text-xs">
                  Grupo activo: {grupos.find((g) => g.id === grupoActivo)?.nombre}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {itemsGrupoActivo.map((item, index) => (
                <Card key={item.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500">{item.tipo || "Item"}</Badge>
                          <h3 className="font-semibold">{item.nombre || item.descripcion}</h3>
                        </div>

                        {item.descripcion && item.nombre !== item.descripcion && (
                          <p className="text-sm text-gray-600 mb-2">{item.descripcion}</p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          {/* Cantidad editable */}
                          <div>
                            <span className="font-medium">Cantidad:</span>
                            <div className="flex items-center gap-1 mt-1">
                              <Input
                                type="number"
                                min="1"
                                value={item.cantidad || 1}
                                onChange={(e) => actualizarCantidadItem(item.id, Number(e.target.value))}
                                className="w-16 h-8 text-xs"
                              />
                            </div>
                          </div>

                          {item.dimensiones && (
                            <div>
                              <span className="font-medium">Dimensiones:</span>
                              <p>
                                {item.dimensiones.ancho}x{item.dimensiones.alto}
                                {item.dimensiones.area ? ` (${item.dimensiones.area.toFixed(2)}m²)` : ""}
                              </p>
                            </div>
                          )}

                          {item.precio_unitario && (
                            <div>
                              <span className="font-medium">Precio Unit:</span>
                              <p>L {item.precio_unitario.toLocaleString()}</p>
                            </div>
                          )}

                          <div>
                            <span className="font-medium">Total:</span>
                            <p className="font-bold text-green-600">L {(item.precio_total || 0).toLocaleString()}</p>
                          </div>

                          {/* Selector de grupo */}
                          <div>
                            <span className="font-medium text-xs">Grupo:</span>
                            <select
                              value={item.grupoId || "default"}
                              onChange={(e) => moverItemAGrupo(item.id, e.target.value)}
                              className="text-xs border rounded px-2 py-1 w-full mt-1"
                            >
                              {grupos.map((grupo) => (
                                <option key={grupo.id} value={grupo.id}>
                                  {grupo.nombre}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {item.materiales && item.materiales.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-1">Materiales:</p>
                            <div className="flex flex-wrap gap-1">
                              {item.materiales.slice(0, 3).map((material: any, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {material.nombre}
                                </Badge>
                              ))}
                              {item.materiales.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{item.materiales.length - 3} más
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {item.notas && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Notas:</p>
                            <p className="text-sm text-gray-600">{item.notas}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editarItem(item.id)}
                          className="hover:bg-blue-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarItem(item.id)}
                          className="hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen y Acciones */}
      {items.length > 0 && (
        <ResumenCotizacion
          items={items}
          grupos={grupos}
          cliente={cliente}
          onGuardar={guardarCotizacion}
          onLimpiar={limpiarSesion}
        />
      )}

      {/* Modales */}
      <SeleccionarProductoModal
        isOpen={modalSeleccionProducto}
        onClose={() => setModalSeleccionProducto(false)}
        productos={productos}
        onProductoSeleccionado={(producto) => {
          setProductoSeleccionado(producto)
          setModalSeleccionProducto(false)
          setModalProducto(true)
          toast({
            title: "📦 Producto seleccionado",
            description: `Configurando: ${producto.nombre}`,
          })
        }}
      />

      <CotizarProductoModal
        isOpen={modalProducto}
        onClose={() => {
          setModalProducto(false)
          setProductoSeleccionado(null)
          setItemEditando(null)
          toast({
            title: "❌ Modal cerrado",
            description: "Configuración de producto cancelada",
          })
        }}
        producto={productoSeleccionado}
        itemEditando={itemEditando}
        onAgregarCotizacion={agregarItem}
      />

      <CotizarReparacionModal
        isOpen={modalReparacion}
        onClose={() => {
          setModalReparacion(false)
          setItemEditando(null)
          toast({
            title: "❌ Modal cerrado",
            description: "Configuración de reparación cancelada",
          })
        }}
        itemEditando={itemEditando}
        onAgregarItem={agregarItem}
      />

      <CotizarVidrioTempladoModal
        isOpen={modalVidrioTemplado}
        onClose={() => {
          setModalVidrioTemplado(false)
          setItemEditando(null)
          toast({
            title: "❌ Modal cerrado",
            description: "Configuración de vidrio templado cancelada",
          })
        }}
        itemEditando={itemEditando}
        onAgregarItem={agregarItem}
      />

      <CotizacionLibreModal
        isOpen={modalLibre}
        onClose={() => {
          setModalLibre(false)
          setItemEditando(null)
          toast({
            title: "❌ Modal cerrado",
            description: "Configuración libre cancelada",
          })
        }}
        itemEditando={itemEditando}
        onAgregarItem={agregarItem}
      />
    </div>
  )
}
