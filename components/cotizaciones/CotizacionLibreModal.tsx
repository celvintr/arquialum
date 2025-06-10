"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { FileText, Plus, Calculator, Package, Search, Trash2, ShoppingCart, Filter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface CotizacionLibreModalProps {
  isOpen: boolean
  onClose: () => void
  onAgregarItem: (item: any) => void
}

export default function CotizacionLibreModal({ isOpen, onClose, onAgregarItem }: CotizacionLibreModalProps) {
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [loadingMateriales, setLoadingMateriales] = useState(false)
  const [loadingProveedores, setLoadingProveedores] = useState(false)
  const [loadingVariantes, setLoadingVariantes] = useState(false)

  // Datos de APIs
  const [materiales, setMateriales] = useState<any[]>([])
  const [proveedores, setProveedores] = useState<any[]>([])
  const [variantes, setVariantes] = useState<any>({})

  // Filtros y búsqueda
  const [busquedaMaterial, setBusquedaMaterial] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas")
  const [proveedorFiltro, setProveedorFiltro] = useState("todos")

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    tipo_calculo: "precio_fijo", // "precio_fijo", "por_unidad", "por_area"
    precio_unitario: 0,
    cantidad: 1,
    unidad_medida: "pieza",
    dimensiones: {
      ancho: 0,
      alto: 0,
      usar_dimensiones: false,
    },
    incluye_instalacion: false,
    precio_instalacion: 0,
    margen_ganancia: 30,
    notas: "",
    materiales_incluidos: [] as any[],
  })

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      cargarMateriales()
      cargarProveedores()
      cargarVariantes()
    }
  }, [isOpen])

  const cargarMateriales = async () => {
    try {
      setLoadingMateriales(true)
      const response = await fetch("/api/materiales")
      const data = await response.json()

      if (data.success) {
        setMateriales(data.materiales)
      }
    } catch (error) {
      console.error("Error cargando materiales:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los materiales",
        variant: "destructive",
      })
    } finally {
      setLoadingMateriales(false)
    }
  }

  const cargarProveedores = async () => {
    try {
      setLoadingProveedores(true)
      const response = await fetch("/api/proveedores")
      const data = await response.json()

      if (data.success) {
        setProveedores(data.proveedores)
      }
    } catch (error) {
      console.error("Error cargando proveedores:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los proveedores",
        variant: "destructive",
      })
    } finally {
      setLoadingProveedores(false)
    }
  }

  const cargarVariantes = async () => {
    try {
      setLoadingVariantes(true)
      const response = await fetch("/api/variantes/tipos")
      const data = await response.json()

      if (data.success) {
        setVariantes({
          coloresPVC: data.coloresPVC || [],
          coloresAluminio: data.coloresAluminio || [],
          tiposVidrio: data.tiposVidrio || [],
        })
      }
    } catch (error) {
      console.error("Error cargando variantes:", error)
    } finally {
      setLoadingVariantes(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const agregarMaterial = (material: any) => {
    const materialExistente = formData.materiales_incluidos.find((m) => m.material_id === material._id)

    if (materialExistente) {
      toast({
        title: "Material ya agregado",
        description: "Este material ya está en la lista",
        variant: "destructive",
      })
      return
    }

    const nuevoMaterial = {
      id: Date.now(),
      material_id: material._id,
      nombre: material.nombre,
      categoria: material.categoria,
      proveedor_id: "",
      variante_id: "",
      cantidad: 1,
      precio_unitario: material.precio_unitario || 0,
      precio_personalizado: material.precio_unitario || 0,
      es_informativo: false,
      notas: "",
    }

    setFormData((prev) => ({
      ...prev,
      materiales_incluidos: [...prev.materiales_incluidos, nuevoMaterial],
    }))

    toast({
      title: "Material agregado",
      description: `${material.nombre} ha sido agregado`,
    })
  }

  const actualizarMaterial = (id: number, campo: string, valor: any) => {
    setFormData((prev) => ({
      ...prev,
      materiales_incluidos: prev.materiales_incluidos.map((material) =>
        material.id === id ? { ...material, [campo]: valor } : material,
      ),
    }))
  }

  const eliminarMaterial = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      materiales_incluidos: prev.materiales_incluidos.filter((material) => material.id !== id),
    }))
  }

  const obtenerVariantesPorMaterial = (material: any) => {
    if (!material.categoria) return []

    const categoria = material.categoria.toLowerCase()

    if (categoria.includes("pvc")) {
      return variantes.coloresPVC || []
    } else if (categoria.includes("aluminio")) {
      return variantes.coloresAluminio || []
    } else if (categoria.includes("vidrio")) {
      return variantes.tiposVidrio || []
    }

    return []
  }

  const obtenerProveedoresPorMaterial = (material: any) => {
    if (!material.categoria) return proveedores

    return proveedores.filter((proveedor) =>
      proveedor.tipoMateriales?.some((tipo: string) => tipo.toLowerCase().includes(material.categoria.toLowerCase())),
    )
  }

  const calcularPrecioTotal = () => {
    let precioBase = formData.precio_unitario

    // Si usa dimensiones y es por área
    if (formData.dimensiones.usar_dimensiones && formData.tipo_calculo === "por_area") {
      const area = (formData.dimensiones.ancho * formData.dimensiones.alto) / 10000 // m²
      precioBase = precioBase * area
    }

    // Aplicar cantidad
    const subtotal = precioBase * formData.cantidad

    // Agregar instalación si aplica
    const costoInstalacion = formData.incluye_instalacion ? formData.precio_instalacion : 0

    // Costo de materiales
    const costoMateriales = formData.materiales_incluidos.reduce((total, material) => {
      if (material.es_informativo) return total
      return total + material.cantidad * material.precio_personalizado
    }, 0)

    // Aplicar margen de ganancia
    const baseParaMargen = subtotal + costoInstalacion + costoMateriales
    const margen = baseParaMargen * (formData.margen_ganancia / 100)

    return {
      precio_base: precioBase,
      subtotal: subtotal,
      instalacion: costoInstalacion,
      materiales: costoMateriales,
      margen: margen,
      total: baseParaMargen + margen,
      area: formData.dimensiones.usar_dimensiones
        ? (formData.dimensiones.ancho * formData.dimensiones.alto) / 10000
        : 0,
    }
  }

  const materialesFiltrados = materiales.filter((material) => {
    const coincideBusqueda = material.nombre.toLowerCase().includes(busquedaMaterial.toLowerCase())
    const coincideCategoria = !categoriaFiltro || categoriaFiltro === "todas" || material.categoria === categoriaFiltro
    const coincideProveedor =
      !proveedorFiltro ||
      proveedorFiltro === "todos" ||
      obtenerProveedoresPorMaterial(material).some((p: any) => p._id === proveedorFiltro)

    return coincideBusqueda && coincideCategoria && coincideProveedor
  })

  const categorias = [...new Set(materiales.map((m) => m.categoria).filter(Boolean))]

  const handleSubmit = () => {
    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre del item es requerido",
        variant: "destructive",
      })
      return
    }

    if (formData.precio_unitario <= 0) {
      toast({
        title: "Error",
        description: "El precio debe ser mayor a cero",
        variant: "destructive",
      })
      return
    }

    const calculo = calcularPrecioTotal()

    const itemLibre = {
      tipo: "libre",
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      categoria: formData.categoria,
      especificaciones: {
        tipo_calculo: formData.tipo_calculo,
        unidad_medida: formData.unidad_medida,
        usa_dimensiones: formData.dimensiones.usar_dimensiones,
        incluye_instalacion: formData.incluye_instalacion,
        margen_ganancia: formData.margen_ganancia,
      },
      dimensiones: formData.dimensiones.usar_dimensiones
        ? {
            ancho: formData.dimensiones.ancho,
            alto: formData.dimensiones.alto,
            area: calculo.area,
          }
        : null,
      costos: {
        precio_base: calculo.precio_base,
        subtotal: calculo.subtotal,
        instalacion: calculo.instalacion,
        materiales: calculo.materiales,
        margen: calculo.margen,
      },
      cantidad: formData.cantidad,
      precio_unitario: calculo.total / formData.cantidad,
      precio_total: calculo.total,
      notas: formData.notas,
      materiales: formData.materiales_incluidos,
    }

    onAgregarItem(itemLibre)
    resetForm()
    onClose()

    toast({
      title: "Item agregado",
      description: `${formData.nombre} ha sido agregado a la cotización`,
    })
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      categoria: "",
      tipo_calculo: "precio_fijo",
      precio_unitario: 0,
      cantidad: 1,
      unidad_medida: "pieza",
      dimensiones: {
        ancho: 0,
        alto: 0,
        usar_dimensiones: false,
      },
      incluye_instalacion: false,
      precio_instalacion: 0,
      margen_ganancia: 30,
      notas: "",
      materiales_incluidos: [],
    })
    setBusquedaMaterial("")
    setCategoriaFiltro("todas")
    setProveedorFiltro("todos")
  }

  const calculo = calcularPrecioTotal()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Cotización Libre
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="general">Información General</TabsTrigger>
            <TabsTrigger value="materiales">Materiales ({formData.materiales_incluidos.length})</TabsTrigger>
            <TabsTrigger value="catalogo">Catálogo de Materiales</TabsTrigger>
          </TabsList>

          {/* Pestaña General */}
          <TabsContent value="general">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Panel Izquierdo */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información del Item</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Nombre del Item</Label>
                      <Input
                        value={formData.nombre}
                        onChange={(e) => handleInputChange("nombre", e.target.value)}
                        placeholder="Ej: Instalación de sistema especial"
                      />
                    </div>

                    <div>
                      <Label>Descripción</Label>
                      <Textarea
                        value={formData.descripcion}
                        onChange={(e) => handleInputChange("descripcion", e.target.value)}
                        placeholder="Descripción detallada del item..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Categoría</Label>
                      <Select
                        value={formData.categoria}
                        onValueChange={(value) => handleInputChange("categoria", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Servicios">Servicios</SelectItem>
                          <SelectItem value="Materiales Especiales">Materiales Especiales</SelectItem>
                          <SelectItem value="Instalaciones">Instalaciones</SelectItem>
                          <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                          <SelectItem value="Consultoria">Consultoría</SelectItem>
                          <SelectItem value="Transporte">Transporte</SelectItem>
                          <SelectItem value="Otros">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tipo de Cálculo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Método de Cálculo</Label>
                      <Select
                        value={formData.tipo_calculo}
                        onValueChange={(value) => handleInputChange("tipo_calculo", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="precio_fijo">Precio Fijo</SelectItem>
                          <SelectItem value="por_unidad">Por Unidad</SelectItem>
                          <SelectItem value="por_area">Por Área (m²)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>
                          {formData.tipo_calculo === "precio_fijo"
                            ? "Precio Total"
                            : formData.tipo_calculo === "por_area"
                              ? "Precio por m²"
                              : "Precio Unitario"}{" "}
                          (L)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.precio_unitario || ""}
                          onChange={(e) => handleInputChange("precio_unitario", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.cantidad}
                          onChange={(e) => handleInputChange("cantidad", Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Unidad de Medida</Label>
                      <Select
                        value={formData.unidad_medida}
                        onValueChange={(value) => handleInputChange("unidad_medida", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pieza">Pieza</SelectItem>
                          <SelectItem value="metro">Metro</SelectItem>
                          <SelectItem value="metro_cuadrado">Metro Cuadrado</SelectItem>
                          <SelectItem value="hora">Hora</SelectItem>
                          <SelectItem value="dia">Día</SelectItem>
                          <SelectItem value="lote">Lote</SelectItem>
                          <SelectItem value="servicio">Servicio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dimensiones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="usar_dimensiones"
                        checked={formData.dimensiones.usar_dimensiones}
                        onCheckedChange={(checked) => handleInputChange("dimensiones.usar_dimensiones", checked)}
                      />
                      <Label htmlFor="usar_dimensiones">Usar dimensiones específicas</Label>
                    </div>

                    {formData.dimensiones.usar_dimensiones && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Ancho (cm)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={formData.dimensiones.ancho || ""}
                            onChange={(e) => handleInputChange("dimensiones.ancho", Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Alto (cm)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={formData.dimensiones.alto || ""}
                            onChange={(e) => handleInputChange("dimensiones.alto", Number(e.target.value))}
                          />
                        </div>
                      </div>
                    )}

                    {formData.dimensiones.usar_dimensiones && calculo.area > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">Área calculada:</span> {calculo.area.toFixed(2)} m²
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Panel Derecho */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración Adicional</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="incluye_instalacion"
                        checked={formData.incluye_instalacion}
                        onCheckedChange={(checked) => handleInputChange("incluye_instalacion", checked)}
                      />
                      <Label htmlFor="incluye_instalacion">Incluir costo de instalación</Label>
                    </div>

                    {formData.incluye_instalacion && (
                      <div>
                        <Label>Precio de Instalación (L)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.precio_instalacion || ""}
                          onChange={(e) => handleInputChange("precio_instalacion", Number(e.target.value))}
                        />
                      </div>
                    )}

                    <div>
                      <Label>Margen de Ganancia (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.margen_ganancia}
                        onChange={(e) => handleInputChange("margen_ganancia", Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label>Notas Adicionales</Label>
                      <Textarea
                        value={formData.notas}
                        onChange={(e) => handleInputChange("notas", e.target.value)}
                        placeholder="Notas específicas para este item..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Calculator className="w-5 h-5 mr-2" />
                      Cálculos Detallados
                    </h3>
                    {formData.precio_unitario > 0 ? (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Precio base:</span>
                          <span>L {calculo.precio_base.toLocaleString()}</span>
                        </div>

                        {formData.cantidad > 1 && (
                          <div className="flex justify-between text-sm">
                            <span>Cantidad ({formData.cantidad}):</span>
                            <span>L {calculo.subtotal.toLocaleString()}</span>
                          </div>
                        )}

                        {calculo.materiales > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Materiales:</span>
                            <span>L {calculo.materiales.toLocaleString()}</span>
                          </div>
                        )}

                        {formData.incluye_instalacion && calculo.instalacion > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Instalación:</span>
                            <span>L {calculo.instalacion.toLocaleString()}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-sm">
                          <span>Margen ({formData.margen_ganancia}%):</span>
                          <span>L {calculo.margen.toLocaleString()}</span>
                        </div>

                        <Separator />

                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span className="text-green-600">L {calculo.total.toLocaleString()}</span>
                        </div>

                        {formData.cantidad > 1 && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Precio por unidad:</span>
                            <span>L {(calculo.total / formData.cantidad).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Ingresa un precio para ver los cálculos</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Pestaña Materiales */}
          <TabsContent value="materiales">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Materiales Incluidos ({formData.materiales_incluidos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {formData.materiales_incluidos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay materiales agregados</p>
                    <p className="text-sm mt-2">Ve al catálogo para agregar materiales</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.materiales_incluidos.map((material) => {
                      const materialOriginal = materiales.find((m) => m._id === material.material_id)
                      const variantesDisponibles = materialOriginal ? obtenerVariantesPorMaterial(materialOriginal) : []
                      const proveedoresDisponibles = materialOriginal
                        ? obtenerProveedoresPorMaterial(materialOriginal)
                        : []

                      return (
                        <Card key={material.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                              <div className="md:col-span-2">
                                <div className="font-medium">{material.nombre}</div>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {material.categoria}
                                </Badge>
                              </div>

                              <div>
                                <Label className="text-xs">Proveedor</Label>
                                <Select
                                  value={material.proveedor_id}
                                  onValueChange={(value) => actualizarMaterial(material.id, "proveedor_id", value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Seleccionar" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {proveedoresDisponibles.map((proveedor: any) => (
                                      <SelectItem key={proveedor._id} value={proveedor._id}>
                                        {proveedor.nombre}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {variantesDisponibles.length > 0 && (
                                <div>
                                  <Label className="text-xs">Variante</Label>
                                  <Select
                                    value={material.variante_id}
                                    onValueChange={(value) => actualizarMaterial(material.id, "variante_id", value)}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {variantesDisponibles.map((variante: any) => (
                                        <SelectItem key={variante._id} value={variante._id}>
                                          {variante.nombre}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              <div>
                                <Label className="text-xs">Cantidad</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={material.cantidad}
                                  onChange={(e) => actualizarMaterial(material.id, "cantidad", Number(e.target.value))}
                                  className="h-8"
                                />
                              </div>

                              <div>
                                <Label className="text-xs">Precio (L)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={material.precio_personalizado}
                                  onChange={(e) =>
                                    actualizarMaterial(material.id, "precio_personalizado", Number(e.target.value))
                                  }
                                  className="h-8"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="text-center">
                                  <div className="text-xs text-gray-500">Subtotal</div>
                                  <div className="font-medium">
                                    L {(material.cantidad * material.precio_personalizado).toFixed(2)}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => eliminarMaterial(material.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center gap-4">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`informativo-${material.id}`}
                                  checked={material.es_informativo}
                                  onCheckedChange={(checked) =>
                                    actualizarMaterial(material.id, "es_informativo", checked)
                                  }
                                />
                                <Label htmlFor={`informativo-${material.id}`} className="text-xs">
                                  Solo informativo (no afecta precio)
                                </Label>
                              </div>

                              <Input
                                placeholder="Notas adicionales..."
                                value={material.notas}
                                onChange={(e) => actualizarMaterial(material.id, "notas", e.target.value)}
                                className="h-8 text-xs flex-1"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña Catálogo */}
          <TabsContent value="catalogo">
            <div className="space-y-4">
              {/* Filtros */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    Filtros de Búsqueda
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Buscar Material</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Buscar por nombre..."
                          value={busquedaMaterial}
                          onChange={(e) => setBusquedaMaterial(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Categoría</Label>
                      <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas las categorías</SelectItem>
                          {categorias.map((categoria) => (
                            <SelectItem key={categoria} value={categoria}>
                              {categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Proveedor</Label>
                      <Select value={proveedorFiltro} onValueChange={setProveedorFiltro}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los proveedores" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos los proveedores</SelectItem>
                          {proveedores.map((proveedor) => (
                            <SelectItem key={proveedor._id} value={proveedor._id}>
                              {proveedor.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setBusquedaMaterial("")
                          setCategoriaFiltro("todas")
                          setProveedorFiltro("todos")
                        }}
                        className="w-full"
                      >
                        Limpiar Filtros
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Materiales */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Catálogo de Materiales ({materialesFiltrados.length} de {materiales.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingMateriales ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p>Cargando materiales...</p>
                    </div>
                  ) : materialesFiltrados.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No se encontraron materiales</p>
                      <p className="text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                      {materialesFiltrados.map((material) => {
                        const yaAgregado = formData.materiales_incluidos.some((m) => m.material_id === material._id)
                        const proveedoresCompatibles = obtenerProveedoresPorMaterial(material)
                        const variantesCompatibles = obtenerVariantesPorMaterial(material)

                        return (
                          <Card
                            key={material._id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              yaAgregado ? "bg-green-50 border-green-200" : "hover:border-blue-300"
                            }`}
                            onClick={() => !yaAgregado && agregarMaterial(material)}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{material.nombre}</h4>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {material.categoria}
                                  </Badge>
                                </div>
                                {yaAgregado ? (
                                  <Badge variant="default" className="text-xs">
                                    Agregado
                                  </Badge>
                                ) : (
                                  <Button size="sm" variant="outline">
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>

                              <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex justify-between">
                                  <span>Precio base:</span>
                                  <span className="font-medium">
                                    L {material.precio_unitario?.toFixed(2) || "0.00"}
                                  </span>
                                </div>

                                {proveedoresCompatibles.length > 0 && (
                                  <div>
                                    <span className="font-medium">Proveedores:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {proveedoresCompatibles.slice(0, 2).map((proveedor: any) => (
                                        <Badge key={proveedor._id} variant="secondary" className="text-xs">
                                          {proveedor.nombre}
                                        </Badge>
                                      ))}
                                      {proveedoresCompatibles.length > 2 && (
                                        <Badge variant="secondary" className="text-xs">
                                          +{proveedoresCompatibles.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {variantesCompatibles.length > 0 && (
                                  <div>
                                    <span className="font-medium">Variantes:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {variantesCompatibles.slice(0, 3).map((variante: any) => (
                                        <Badge key={variante._id} variant="outline" className="text-xs">
                                          {variante.nombre}
                                        </Badge>
                                      ))}
                                      {variantesCompatibles.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{variantesCompatibles.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Acciones */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.nombre.trim() || formData.precio_unitario <= 0}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar a Cotización
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
