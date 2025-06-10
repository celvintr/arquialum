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
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wrench, Plus, Search, Package, Palette, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface CotizarReparacionModalProps {
  isOpen: boolean
  onClose: () => void
  onAgregarItem: (item: any) => void
  itemEditando?: any
}

const COLORES_PVC = [
  { id: "blanco", nombre: "Blanco", hex: "#FFFFFF" },
  { id: "cafe", nombre: "Café", hex: "#8B4513" },
  { id: "negro", nombre: "Negro", hex: "#000000" },
  { id: "gris", nombre: "Gris", hex: "#808080" },
]

const COLORES_ALUMINIO = [
  { id: "natural", nombre: "Natural", hex: "#C0C0C0" },
  { id: "bronce", nombre: "Bronce", hex: "#CD7F32" },
  { id: "negro", nombre: "Negro", hex: "#000000" },
  { id: "blanco", nombre: "Blanco", hex: "#FFFFFF" },
]

export default function CotizarReparacionModal({
  isOpen,
  onClose,
  onAgregarItem,
  itemEditando,
}: CotizarReparacionModalProps) {
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [reparacionesDefinidas, setReparacionesDefinidas] = useState<any[]>([])
  const [proveedores, setProveedores] = useState<any[]>([])
  const [materiales, setMateriales] = useState<any[]>([])
  const [tipoReparacion, setTipoReparacion] = useState<"definida" | "personalizada">("definida")
  const [reparacionSeleccionada, setReparacionSeleccionada] = useState<any>(null)
  const [busqueda, setBusqueda] = useState("")

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    precio_base: 0,
    precio_mano_obra: 0,
    tiempo_estimado: 1,
    cantidad: 1,
    proveedor_id: "",
    material_tipo: "",
    color_seleccionado: "",
    flete: 0,
    notas: "",
    materiales_seleccionados: [] as any[],
  })

  useEffect(() => {
    if (isOpen) {
      cargarDatos()
    }
  }, [isOpen])

  useEffect(() => {
    if (itemEditando) {
      setFormData({
        nombre: itemEditando.nombre || "",
        descripcion: itemEditando.descripcion || "",
        categoria: itemEditando.categoria || "",
        precio_base: itemEditando.precio_unitario || 0,
        precio_mano_obra: itemEditando.precio_mano_obra || 0,
        tiempo_estimado: itemEditando.tiempo_estimado || 1,
        cantidad: itemEditando.cantidad || 1,
        proveedor_id: itemEditando.proveedor?.id || "",
        material_tipo: itemEditando.material_tipo || "",
        color_seleccionado: itemEditando.color_seleccionado || "",
        flete: itemEditando.flete || 0,
        notas: itemEditando.notas || "",
        materiales_seleccionados: itemEditando.materiales || [],
      })

      if (itemEditando.reparacion_id) {
        const reparacion = reparacionesDefinidas.find((r) => r._id === itemEditando.reparacion_id)
        if (reparacion) {
          setReparacionSeleccionada(reparacion)
          setTipoReparacion("definida")
        }
      } else {
        setTipoReparacion("personalizada")
      }
    }
  }, [itemEditando, reparacionesDefinidas])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      // Cargar reparaciones definidas
      const reparacionesResponse = await fetch("/api/reparaciones")
      const reparacionesData = await reparacionesResponse.json()

      // Cargar proveedores
      const proveedoresResponse = await fetch("/api/proveedores")
      const proveedoresData = await proveedoresResponse.json()

      // Cargar materiales
      const materialesResponse = await fetch("/api/materiales")
      const materialesData = await materialesResponse.json()

      if (reparacionesData.success) {
        setReparacionesDefinidas(reparacionesData.reparaciones || [])
      }

      if (proveedoresData.success) {
        setProveedores(proveedoresData.proveedores || [])
      }

      if (materialesData.success) {
        setMateriales(materialesData.materiales || [])
      }
    } catch (error) {
      console.error("Error cargando datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const seleccionarReparacionDefinida = (reparacion: any) => {
    setReparacionSeleccionada(reparacion)
    setFormData((prev) => ({
      ...prev,
      nombre: reparacion.nombre,
      descripcion: reparacion.descripcion,
      categoria: reparacion.categoria,
      precio_base: reparacion.precio_base,
      precio_mano_obra: reparacion.precio_base,
      tiempo_estimado: reparacion.tiempo_estimado,
      materiales_seleccionados:
        reparacion.materiales_incluidos?.map((materialNombre: string) => {
          const materialEncontrado = materiales.find((m) =>
            m.nombre.toLowerCase().includes(materialNombre.toLowerCase()),
          )
          return {
            id: materialEncontrado?._id || Date.now(),
            material_id: materialEncontrado?._id,
            nombre: materialNombre,
            cantidad: 1,
            precio_unitario: 0,
            precio_total: 0,
            es_informativo: true,
            material_real: materialEncontrado || null,
          }
        }) || [],
    }))
  }

  const agregarMaterial = () => {
    const nuevoMaterial = {
      id: Date.now(),
      material_id: "",
      nombre: "",
      cantidad: 1,
      precio_unitario: 0,
      precio_total: 0,
      es_informativo: true,
      material_real: null,
    }

    setFormData((prev) => ({
      ...prev,
      materiales_seleccionados: [...prev.materiales_seleccionados, nuevoMaterial],
    }))
  }

  const actualizarMaterial = (index: number, campo: string, valor: any) => {
    setFormData((prev) => ({
      ...prev,
      materiales_seleccionados: prev.materiales_seleccionados.map((material, i) => {
        if (i === index) {
          const materialActualizado = { ...material, [campo]: valor }

          // Si se selecciona un material real, actualizar información
          if (campo === "material_id" && valor) {
            const materialReal = materiales.find((m) => m._id === valor)
            if (materialReal) {
              materialActualizado.material_real = materialReal
              materialActualizado.nombre = materialReal.nombre
              materialActualizado.precio_unitario = materialReal.precio || 0
            }
          }

          // Calcular precio total automáticamente
          if (campo === "cantidad" || campo === "precio_unitario") {
            materialActualizado.precio_total = materialActualizado.cantidad * materialActualizado.precio_unitario
          }

          return materialActualizado
        }
        return material
      }),
    }))
  }

  const eliminarMaterial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      materiales_seleccionados: prev.materiales_seleccionados.filter((_, i) => i !== index),
    }))
  }

  const calcularPrecioTotal = () => {
    const costoMateriales = formData.materiales_seleccionados.reduce(
      (total, material) => total + (material.precio_total || 0),
      0,
    )
    const costoManoObra = formData.precio_mano_obra * formData.cantidad
    const costoFlete = formData.flete

    return costoMateriales + costoManoObra + costoFlete
  }

  const handleSubmit = () => {
    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la reparación es requerido",
        variant: "destructive",
      })
      return
    }

    if (formData.precio_mano_obra <= 0) {
      toast({
        title: "Error",
        description: "El precio de mano de obra debe ser mayor a 0",
        variant: "destructive",
      })
      return
    }

    const proveedor = proveedores.find((p) => p._id === formData.proveedor_id)
    const colorSeleccionado =
      formData.material_tipo === "pvc"
        ? COLORES_PVC.find((c) => c.id === formData.color_seleccionado)
        : formData.material_tipo === "aluminio"
          ? COLORES_ALUMINIO.find((c) => c.id === formData.color_seleccionado)
          : null

    const reparacion = {
      tipo: "reparacion",
      reparacion_id: reparacionSeleccionada?._id || null,
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      categoria: formData.categoria,
      cantidad: formData.cantidad,
      precio_unitario: calcularPrecioTotal() / formData.cantidad,
      precio_total: calcularPrecioTotal(),
      precio_mano_obra: formData.precio_mano_obra,
      tiempo_estimado: formData.tiempo_estimado,
      proveedor: proveedor
        ? {
            id: proveedor._id,
            nombre: proveedor.nombre,
            contacto: proveedor.contacto,
            tipoMateriales: proveedor.tipoMateriales,
          }
        : null,
      material_tipo: formData.material_tipo,
      color_seleccionado: colorSeleccionado,
      flete: formData.flete,
      materiales: formData.materiales_seleccionados,
      notas: formData.notas,
      es_personalizada: tipoReparacion === "personalizada",
    }

    onAgregarItem(reparacion)
    resetForm()
    onClose()

    toast({
      title: "Reparación agregada",
      description: `${formData.nombre} ha sido agregada a la cotización`,
    })
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      categoria: "",
      precio_base: 0,
      precio_mano_obra: 0,
      tiempo_estimado: 1,
      cantidad: 1,
      proveedor_id: "",
      material_tipo: "",
      color_seleccionado: "",
      flete: 0,
      notas: "",
      materiales_seleccionados: [],
    })
    setReparacionSeleccionada(null)
    setBusqueda("")
    setTipoReparacion("definida")
  }

  const reparacionesFiltradas = reparacionesDefinidas.filter(
    (reparacion) =>
      reparacion.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      reparacion.categoria.toLowerCase().includes(busqueda.toLowerCase()),
  )

  const coloresDisponibles =
    formData.material_tipo === "pvc" ? COLORES_PVC : formData.material_tipo === "aluminio" ? COLORES_ALUMINIO : []

  const proveedoresFiltrados = proveedores.filter((proveedor) => {
    if (!formData.material_tipo) return true

    const tipoMaterial = formData.material_tipo.toLowerCase()
    return proveedor.tipoMateriales?.some(
      (tipo: string) =>
        tipo.toLowerCase().includes(tipoMaterial) ||
        (tipoMaterial === "pvc" && tipo.toLowerCase().includes("pvc")) ||
        (tipoMaterial === "aluminio" && tipo.toLowerCase().includes("aluminio")) ||
        (tipoMaterial === "vidrio" && tipo.toLowerCase().includes("vidrio")) ||
        (tipoMaterial === "herrajes" && tipo.toLowerCase().includes("herrajes")),
    )
  })

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando datos...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wrench className="w-5 h-5 mr-2" />
            {itemEditando ? "Editar Reparación" : "Cotizar Reparación"}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={tipoReparacion}
          onValueChange={(value) => setTipoReparacion(value as "definida" | "personalizada")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="definida">Reparación Definida</TabsTrigger>
            <TabsTrigger value="personalizada">Personalizada</TabsTrigger>
          </TabsList>

          <TabsContent value="definida" className="space-y-4">
            {/* Búsqueda de reparaciones */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar reparaciones..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Lista de reparaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {reparacionesFiltradas.map((reparacion) => (
                <Card
                  key={reparacion._id}
                  className={`cursor-pointer transition-all border-2 ${
                    reparacionSeleccionada?._id === reparacion._id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => seleccionarReparacionDefinida(reparacion)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{reparacion.nombre}</h3>
                      <Badge variant="outline">L {reparacion.precio_base}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{reparacion.descripcion}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{reparacion.categoria}</span>
                      <span>{reparacion.tiempo_estimado}h</span>
                    </div>
                    {reparacion.materiales_incluidos && reparacion.materiales_incluidos.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">Materiales incluidos:</div>
                        <div className="flex flex-wrap gap-1">
                          {reparacion.materiales_incluidos.map((material: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {material}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="personalizada" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nombre de la Reparación</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder="Ej: Instalación de cerradura"
                />
              </div>
              <div>
                <Label>Categoría</Label>
                <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vidrio">Vidrio</SelectItem>
                    <SelectItem value="Herrajes">Herrajes</SelectItem>
                    <SelectItem value="Aluminio">Aluminio</SelectItem>
                    <SelectItem value="PVC">PVC</SelectItem>
                    <SelectItem value="Perfiles">Perfiles</SelectItem>
                    <SelectItem value="Selladores">Selladores</SelectItem>
                    <SelectItem value="Instalación">Instalación</SelectItem>
                    <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                placeholder="Descripción detallada de la reparación"
                rows={2}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Formulario común para ambos tipos */}
        {(reparacionSeleccionada || tipoReparacion === "personalizada") && (
          <div className="space-y-6 border-t pt-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.cantidad}
                  onChange={(e) => handleInputChange("cantidad", Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Precio Mano de Obra (L)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.precio_mano_obra}
                  onChange={(e) => handleInputChange("precio_mano_obra", Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Tiempo Estimado (horas)</Label>
                <Input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.tiempo_estimado}
                  onChange={(e) => handleInputChange("tiempo_estimado", Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Flete (L)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.flete}
                  onChange={(e) => handleInputChange("flete", Number(e.target.value))}
                />
              </div>
            </div>

            {/* Proveedor y Material */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Tipo de Material</Label>
                <Select
                  value={formData.material_tipo}
                  onValueChange={(value) => handleInputChange("material_tipo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pvc">PVC</SelectItem>
                    <SelectItem value="aluminio">Aluminio</SelectItem>
                    <SelectItem value="vidrio">Vidrio</SelectItem>
                    <SelectItem value="herrajes">Herrajes</SelectItem>
                    <SelectItem value="selladores">Selladores</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Proveedor
                </Label>
                <Select
                  value={formData.proveedor_id}
                  onValueChange={(value) => handleInputChange("proveedor_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedoresFiltrados.map((proveedor) => (
                      <SelectItem key={proveedor._id} value={proveedor._id}>
                        <div>
                          <div className="font-medium">{proveedor.nombre}</div>
                          <div className="text-xs text-gray-500">
                            {proveedor.tipoMateriales?.join(", ")} - {proveedor.ciudad}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {coloresDisponibles.length > 0 && (
                <div>
                  <Label className="flex items-center">
                    <Palette className="w-4 h-4 mr-2" />
                    Color
                  </Label>
                  <Select
                    value={formData.color_seleccionado}
                    onValueChange={(value) => handleInputChange("color_seleccionado", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar color" />
                    </SelectTrigger>
                    <SelectContent>
                      {coloresDisponibles.map((color) => (
                        <SelectItem key={color.id} value={color.id}>
                          <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full mr-2 border" style={{ backgroundColor: color.hex }} />
                            {color.nombre}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Materiales informativos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Materiales (Informativos)
                  <Button variant="outline" size="sm" onClick={agregarMaterial}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Material
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {formData.materiales_seleccionados.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No hay materiales agregados. Los materiales son solo informativos.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {formData.materiales_seleccionados.map((material, index) => (
                      <div key={material.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-lg">
                        <div>
                          <Label className="text-xs">Material</Label>
                          <Select
                            value={material.material_id}
                            onValueChange={(value) => actualizarMaterial(index, "material_id", value)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {materiales.map((mat) => (
                                <SelectItem key={mat._id} value={mat._id}>
                                  <div>
                                    <div className="font-medium">{mat.nombre}</div>
                                    <div className="text-xs text-gray-500">{mat.categoria}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Nombre</Label>
                          <Input
                            value={material.nombre}
                            onChange={(e) => actualizarMaterial(index, "nombre", e.target.value)}
                            placeholder="Nombre del material"
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Cantidad</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={material.cantidad}
                            onChange={(e) => actualizarMaterial(index, "cantidad", Number(e.target.value))}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Precio Unit. (L)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={material.precio_unitario}
                            onChange={(e) => actualizarMaterial(index, "precio_unitario", Number(e.target.value))}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Total (L)</Label>
                          <Input
                            value={material.precio_total?.toFixed(2) || "0.00"}
                            disabled
                            className="h-8 bg-gray-50"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button variant="outline" size="sm" onClick={() => eliminarMaterial(index)} className="h-8">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notas */}
            <div>
              <Label>Notas Adicionales</Label>
              <Textarea
                value={formData.notas}
                onChange={(e) => handleInputChange("notas", e.target.value)}
                placeholder="Notas adicionales sobre la reparación"
                rows={2}
              />
            </div>

            {/* Resumen de costos */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Resumen de Costos</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Mano de Obra:</span>
                    <span>L {(formData.precio_mano_obra * formData.cantidad).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Materiales:</span>
                    <span>
                      L{" "}
                      {formData.materiales_seleccionados
                        .reduce((total, m) => total + (m.precio_total || 0), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flete:</span>
                    <span>L {formData.flete.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">L {calcularPrecioTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.nombre.trim() || formData.precio_mano_obra <= 0}>
            <Plus className="w-4 h-4 mr-2" />
            {itemEditando ? "Actualizar" : "Agregar"} Reparación
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
