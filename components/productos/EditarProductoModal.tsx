"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, X, Check, ImageIcon, Code, Tag, Pencil, Package, FileText } from "lucide-react"

interface EditarProductoModalProps {
  producto: any
  tiposProducto: any[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductoActualizado: (producto: any) => void
}

export default function EditarProductoModal({
  producto,
  tiposProducto,
  open,
  onOpenChange,
  onProductoActualizado,
}: EditarProductoModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    identificador: "",
    descripcion: "",
    tipo_producto_id: "",
    categoria: "",
    precio_base: 0,
    svg: "",
    estado: true,
    imagenActual: "",
  })
  const [imagen, setImagen] = useState<File | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar datos del producto cuando cambia
  useEffect(() => {
    if (producto && open) {
      setFormData({
        nombre: producto.nombre || "",
        identificador: producto.identificador || "",
        descripcion: producto.descripcion || "",
        tipo_producto_id: producto.tipo_producto_id || "",
        categoria: producto.categoria || "",
        precio_base: producto.precio_base || 0,
        svg: producto.svg || "",
        estado: producto.estado !== false,
        imagenActual: producto.imagen || "",
      })
      setImagen(null)
      setImagenPreview(producto.imagen || null)
    }
  }, [producto, open])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "❌ Error",
        description: "La imagen no puede ser mayor a 5MB",
        variant: "destructive",
      })
      return
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "❌ Error",
        description: "Solo se permiten archivos de imagen",
        variant: "destructive",
      })
      return
    }

    setImagen(file)
    setImagenPreview(URL.createObjectURL(file))
    setFormData((prev) => ({ ...prev, imagenActual: "" })) // Limpiar imagen actual

    toast({
      title: "✅ Nueva imagen seleccionada",
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    })
  }

  const eliminarImagen = () => {
    setImagen(null)
    setImagenPreview(null)
    setFormData((prev) => ({ ...prev, imagenActual: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    toast({
      title: "🗑️ Imagen eliminada",
      description: "La imagen ha sido eliminada del producto",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!formData.nombre.trim()) {
      toast({
        title: "⚠️ Campo requerido",
        description: "El nombre del producto es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!formData.tipo_producto_id) {
      toast({
        title: "⚠️ Campo requerido",
        description: "Debe seleccionar un tipo de producto",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Crear FormData para enviar datos e imagen
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString())
      })

      if (imagen) {
        data.append("imagen", imagen)
      }

      // Enviar datos al servidor
      const response = await fetch(`/api/productos/${producto._id}`, {
        method: "PUT",
        body: data,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar el producto")
      }

      // Notificar éxito
      toast({
        title: "✅ Producto actualizado",
        description: `El producto "${formData.nombre}" ha sido actualizado exitosamente`,
      })

      // Cerrar modal
      onOpenChange(false)

      // Notificar al componente padre
      onProductoActualizado(result.producto)
    } catch (error) {
      console.error("Error actualizando producto:", error)
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Error al actualizar el producto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Editar Producto
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda - Datos básicos */}
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-sm font-medium flex items-center">
                        <Pencil className="w-4 h-4 mr-2" />
                        Nombre del Producto <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => handleChange("nombre", e.target.value)}
                        placeholder="Ej: Ventana Corrediza 2 Hojas"
                        className="border-2 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="identificador" className="text-sm font-medium flex items-center">
                        <Tag className="w-4 h-4 mr-2" />
                        Identificador
                      </Label>
                      <Input
                        id="identificador"
                        value={formData.identificador}
                        onChange={(e) => handleChange("identificador", e.target.value)}
                        placeholder="Ej: VENT-CORR-2H"
                        className="border-2 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipo_producto_id" className="text-sm font-medium flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Tipo de Producto <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Select
                        value={formData.tipo_producto_id}
                        onValueChange={(value) => handleChange("tipo_producto_id", value)}
                      >
                        <SelectTrigger className="border-2 focus:border-blue-500">
                          <SelectValue placeholder="Seleccione un tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposProducto.map((tipo) => (
                            <SelectItem key={tipo._id} value={tipo._id}>
                              {tipo.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoria" className="text-sm font-medium flex items-center">
                        <Tag className="w-4 h-4 mr-2" />
                        Categoría
                      </Label>
                      <Select value={formData.categoria} onValueChange={(value) => handleChange("categoria", value)}>
                        <SelectTrigger className="border-2 focus:border-blue-500">
                          <SelectValue placeholder="Seleccione una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ventanas">Ventanas</SelectItem>
                          <SelectItem value="puertas">Puertas</SelectItem>
                          <SelectItem value="barandales">Barandales</SelectItem>
                          <SelectItem value="canceleria">Cancelería</SelectItem>
                          <SelectItem value="otros">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="precio_base" className="text-sm font-medium flex items-center">
                        <Tag className="w-4 h-4 mr-2" />
                        Precio Base
                      </Label>
                      <Input
                        id="precio_base"
                        type="number"
                        value={formData.precio_base}
                        onChange={(e) => handleChange("precio_base", Number.parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="border-2 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estado" className="text-sm font-medium flex items-center">
                        <Tag className="w-4 h-4 mr-2" />
                        Estado
                      </Label>
                      <Select
                        value={formData.estado ? "true" : "false"}
                        onValueChange={(value) => handleChange("estado", value === "true")}
                      >
                        <SelectTrigger className="border-2 focus:border-blue-500">
                          <SelectValue placeholder="Seleccione estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Activo</SelectItem>
                          <SelectItem value="false">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="descripcion" className="text-sm font-medium flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Descripción
                    </Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => handleChange("descripcion", e.target.value)}
                      placeholder="Descripción detallada del producto..."
                      rows={4}
                      className="border-2 focus:border-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Columna derecha - Imagen y SVG */}
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Imagen del Producto
                    </Label>

                    {imagenPreview ? (
                      <div className="relative">
                        <img
                          src={imagenPreview || "/placeholder.svg"}
                          alt="Vista previa"
                          className="w-full h-48 object-cover rounded-lg border-2 border-blue-300"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 rounded-full w-8 h-8"
                          onClick={eliminarImagen}
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-10 h-10 mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Haga clic para seleccionar una imagen</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF o WebP (máx. 5MB)</p>
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImagenChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="svg" className="text-sm font-medium flex items-center">
                      <Code className="w-4 h-4 mr-2" />
                      Código SVG (opcional)
                    </Label>
                    <Textarea
                      id="svg"
                      value={formData.svg}
                      onChange={(e) => handleChange("svg", e.target.value)}
                      placeholder="<svg>...</svg>"
                      rows={6}
                      className="border-2 focus:border-blue-500 font-mono text-sm"
                    />
                    {formData.svg && (
                      <div className="mt-2 p-4 border rounded-md bg-gray-50">
                        <p className="text-xs text-gray-500 mb-2">Vista previa SVG:</p>
                        <div
                          className="w-full h-24 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: formData.svg }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Actualizando...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" /> Actualizar Producto
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
