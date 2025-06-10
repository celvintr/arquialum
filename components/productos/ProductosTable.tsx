"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, Plus, Edit, Trash2, Package, Filter, ChevronLeft, ChevronRight, ImageIcon, Wrench } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import CrearProductoModal from "./CrearProductoModal"
import EditarProductoModal from "./EditarProductoModal"
import GestionMaterialesModal from "./GestionMaterialesModal"

interface Producto {
  _id: string
  nombre: string
  identificador: string
  descripcion: string
  categoria: string
  precio_base: number
  estado: boolean
  imagen?: string
  tipoProducto?: {
    _id: string
    nombre: string
  }
  proveedor?: {
    _id: string
    nombre: string
  }
  total_materiales: number
  tiene_materiales: boolean
  createdAt: string
  updatedAt: string
}

interface TipoProducto {
  _id: string
  nombre: string
}

export default function ProductosTable() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [tiposProducto, setTiposProducto] = useState<TipoProducto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProductos, setTotalProductos] = useState(0)

  // Estados para modales
  const [showCrearModal, setShowCrearModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [showMaterialesModal, setShowMaterialesModal] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)

  // Estado para confirmación de eliminación
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null)

  const limit = 12

  // Cargar tipos de producto
  useEffect(() => {
    const cargarTiposProducto = async () => {
      try {
        const response = await fetch("/api/tipos-producto")
        if (response.ok) {
          const data = await response.json()
          console.log("✅ Tipos de producto cargados:", data)
          setTiposProducto(data.tipos || [])
        } else {
          console.error("❌ Error cargando tipos de producto:", response.status)
        }
      } catch (error) {
        console.error("❌ Error cargando tipos de producto:", error)
        toast({
          title: "❌ Error",
          description: "Error al cargar tipos de producto",
          variant: "destructive",
        })
      }
    }
    cargarTiposProducto()
  }, [])

  // Cargar productos
  const cargarProductos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search: searchTerm,
        tipo: tipoFiltro,
      })

      console.log("🔄 Cargando productos con parámetros:", Object.fromEntries(params))

      const response = await fetch(`/api/productos?${params}`)

      if (response.ok) {
        const data = await response.json()
        console.log("📦 Productos cargados:", data)

        setProductos(data.productos || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalProductos(data.pagination?.total || 0)
      } else {
        console.error("❌ Error en la respuesta:", response.status)
        toast({
          title: "❌ Error",
          description: "Error al cargar productos",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Error cargando productos:", error)
      toast({
        title: "❌ Error",
        description: "Error de conexión al cargar productos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarProductos()
  }, [currentPage, searchTerm, tipoFiltro])

  // Manejar búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // Manejar filtro por tipo
  const handleTipoChange = (value: string) => {
    setTipoFiltro(value)
    setCurrentPage(1)
  }

  // Manejar eliminación
  const handleEliminar = async () => {
    if (!productoAEliminar) return

    try {
      console.log("🗑️ Eliminando producto:", productoAEliminar._id)

      const response = await fetch(`/api/productos/${productoAEliminar._id}`, {
        method: "DELETE",
      })

      const result = await response.json()
      console.log("📡 Respuesta eliminar:", result)

      if (response.ok && result.success) {
        toast({
          title: "✅ Éxito",
          description: `Producto "${productoAEliminar.nombre}" eliminado correctamente`,
        })
        cargarProductos()
      } else {
        throw new Error(result.error || "Error al eliminar producto")
      }
    } catch (error) {
      console.error("❌ Error eliminando producto:", error)
      toast({
        title: "❌ Error",
        description: error.message || "Error de conexión al eliminar producto",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setProductoAEliminar(null)
    }
  }

  // Confirmar eliminación
  const confirmarEliminacion = (producto: Producto) => {
    setProductoAEliminar(producto)
    setShowDeleteDialog(true)
  }

  // Manejar edición
  const handleEditar = (producto: Producto) => {
    setProductoSeleccionado(producto)
    setShowEditarModal(true)
  }

  // Manejar gestión de materiales
  const handleGestionMateriales = (producto: Producto) => {
    console.log("🔧 Gestionando materiales para:", producto)
    setProductoSeleccionado(producto)
    setShowMaterialesModal(true)
  }

  // Manejar paginación
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  // Callback cuando se crea un producto
  const handleProductoCreado = (nuevoProducto: Producto) => {
    toast({
      title: "🎉 ¡Producto creado!",
      description: `El producto "${nuevoProducto.nombre}" ha sido creado exitosamente`,
    })
    cargarProductos()
    setShowCrearModal(false)
  }

  // Callback cuando se actualiza un producto
  const handleProductoActualizado = (productoActualizado: Producto) => {
    toast({
      title: "✅ ¡Producto actualizado!",
      description: `El producto "${productoActualizado.nombre}" ha sido actualizado exitosamente`,
    })
    cargarProductos()
    setShowEditarModal(false)
    setProductoSeleccionado(null)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando productos...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gestión de Productos ({totalProductos})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por tipo */}
            <div className="w-full sm:w-48">
              <Select value={tipoFiltro} onValueChange={handleTipoChange}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {tiposProducto.map((tipo) => (
                    <SelectItem key={tipo._id} value={tipo._id}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botón crear */}
            <Button onClick={() => setShowCrearModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>

          {/* Tabla de productos */}
          {productos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || tipoFiltro !== "all"
                ? "No se encontraron productos con los filtros aplicados"
                : "No hay productos registrados"}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Imagen</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Materiales</TableHead>
                      <TableHead>Precio Base</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productos.map((producto) => (
                      <TableRow key={producto._id}>
                        <TableCell>
                          <div className="w-12 h-12 rounded-lg overflow-hidden border bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                            {producto.imagen ? (
                              <img
                                src={producto.imagen || "/placeholder.svg"}
                                alt={producto.nombre}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                  e.currentTarget.nextElementSibling.style.display = "flex"
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-full h-full flex items-center justify-center ${producto.imagen ? "hidden" : ""}`}
                            >
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{producto.nombre}</div>
                            <div className="text-sm text-gray-500">{producto.identificador}</div>
                            {producto.descripcion && (
                              <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">{producto.descripcion}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {producto.tipoProducto?.nombre ? (
                            <Badge variant="outline">{producto.tipoProducto.nombre}</Badge>
                          ) : (
                            <Badge variant="destructive">Sin tipo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{producto.categoria || "Sin categoría"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={producto.tiene_materiales ? "default" : "secondary"}
                              className="flex items-center gap-1"
                            >
                              <Wrench className="h-3 w-3" />
                              {producto.total_materiales || 0}
                            </Badge>
                            {producto.tiene_materiales && <span className="text-xs text-green-600">Configurado</span>}
                          </div>
                        </TableCell>
                        <TableCell>L {(producto.precio_base || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={producto.estado ? "default" : "secondary"}>
                            {producto.estado ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGestionMateriales(producto)}
                              title="Gestionar materiales"
                            >
                              <Package className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditar(producto)}
                              title="Editar producto"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => confirmarEliminacion(producto)}
                              title="Eliminar producto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Página {currentPage} de {totalPages} ({totalProductos} productos)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      {showCrearModal && (
        <CrearProductoModal
          tiposProducto={tiposProducto}
          onProductoCreado={handleProductoCreado}
          open={showCrearModal}
          onOpenChange={setShowCrearModal}
        />
      )}

      {showEditarModal && productoSeleccionado && (
        <EditarProductoModal
          producto={productoSeleccionado}
          tiposProducto={tiposProducto}
          open={showEditarModal}
          onOpenChange={setShowEditarModal}
          onProductoActualizado={handleProductoActualizado}
        />
      )}

      {showMaterialesModal && productoSeleccionado && (
        <GestionMaterialesModal
          isOpen={showMaterialesModal}
          onClose={() => {
            setShowMaterialesModal(false)
            setProductoSeleccionado(null)
          }}
          producto={productoSeleccionado}
          onSuccess={() => {
            cargarProductos()
          }}
        />
      )}

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el producto "{productoAEliminar?.nombre}"? Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminar} className="bg-red-600 hover:bg-red-700 text-white">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
