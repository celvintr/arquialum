"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Filter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SeleccionarProductoModalProps {
  isOpen: boolean
  onClose: () => void
  productos: any[]
  onProductoSeleccionado: (producto: any) => void
}

export default function SeleccionarProductoModal({
  isOpen,
  onClose,
  productos,
  onProductoSeleccionado,
}: SeleccionarProductoModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [productosData, setProductosData] = useState<any[]>([])
  const [filtros, setFiltros] = useState({
    busqueda: "",
    tipo: "all",
  })
  const [tiposProducto, setTiposProducto] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      cargarProductos()
      cargarTiposProducto()
    }
  }, [isOpen])

  useEffect(() => {
    aplicarFiltros()
  }, [productos, filtros])

  const cargarProductos = async () => {
    try {
      setLoading(true)
      console.log("📦 Cargando productos para selección...")

      const response = await fetch("/api/productos?limit=50")
      const data = await response.json()

      if (data.success) {
        setProductosData(data.productos || [])
        console.log("✅ Productos cargados:", data.productos.length)
      } else {
        throw new Error("Error cargando productos")
      }
    } catch (error) {
      console.error("❌ Error cargando productos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const cargarTiposProducto = async () => {
    try {
      const response = await fetch("/api/tipos-producto")
      const data = await response.json()

      if (data.success) {
        setTiposProducto(data.tipos || [])
      }
    } catch (error) {
      console.error("❌ Error cargando tipos de producto:", error)
    }
  }

  const aplicarFiltros = () => {
    let productosFiltrados = [...productosData]

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase()
      productosFiltrados = productosFiltrados.filter(
        (producto) =>
          producto.nombre?.toLowerCase().includes(busqueda) ||
          producto.identificador?.toLowerCase().includes(busqueda) ||
          producto.descripcion?.toLowerCase().includes(busqueda),
      )
    }

    // Filtro por tipo
    if (filtros.tipo && filtros.tipo !== "all") {
      productosFiltrados = productosFiltrados.filter((producto) => producto.tipo_producto_id === filtros.tipo)
    }

    setProductosData(productosFiltrados)
  }

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const seleccionarProducto = (producto: any) => {
    console.log("✅ Producto seleccionado:", producto.nombre)
    onProductoSeleccionado(producto)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Seleccionar Producto para Cotizar
          </DialogTitle>
        </DialogHeader>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar productos..."
              value={filtros.busqueda}
              onChange={(e) => handleFiltroChange("busqueda", e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filtros.tipo} onValueChange={(value) => handleFiltroChange("tipo", value)}>
            <SelectTrigger>
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

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{productosData.length} productos</span>
          </div>
        </div>

        {/* Lista de Productos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Cargando productos...</p>
            </div>
          </div>
        ) : productosData.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos disponibles</h3>
            <p className="text-gray-600">No se encontraron productos que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {productosData.map((producto) => (
              <Card key={producto._id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  {/* Imagen del producto */}
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    {producto.imagen ? (
                      <img
                        src={producto.imagen || "/placeholder.svg"}
                        alt={producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Información del producto */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg line-clamp-2">{producto.nombre}</h3>

                    {producto.identificador && <p className="text-sm text-gray-600">ID: {producto.identificador}</p>}

                    {producto.descripcion && (
                      <p className="text-sm text-gray-600 line-clamp-2">{producto.descripcion}</p>
                    )}

                    <div className="flex items-center justify-between">
                      {producto.tipoProducto && (
                        <Badge variant="secondary" className="text-xs">
                          {producto.tipoProducto.nombre}
                        </Badge>
                      )}

                      {producto.tiene_materiales ? (
                        <Badge variant="default" className="text-xs">
                          {producto.total_materiales} materiales
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Sin materiales
                        </Badge>
                      )}
                    </div>

                    {producto.precio_base > 0 && (
                      <p className="text-lg font-bold text-green-600">L {producto.precio_base.toLocaleString()}</p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <Button
                    onClick={() => seleccionarProducto(producto)}
                    className="w-full"
                    disabled={!producto.tiene_materiales}
                  >
                    {producto.tiene_materiales ? "Cotizar Producto" : "Sin Materiales"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
