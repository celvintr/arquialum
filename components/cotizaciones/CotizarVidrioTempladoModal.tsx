"use client"

import type React from "react"

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
import { Switch } from "@/components/ui/switch"
import {
  GlassWater,
  Plus,
  Package,
  Trash2,
  Calculator,
  Upload,
  X,
  ImageIcon,
  ShoppingCart,
  Edit3,
  Layers,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface CotizarVidrioTempladoModalProps {
  isOpen: boolean
  onClose: () => void
  onAgregarItem: (item: any) => void
  itemEditando?: any
}

// Tipos de vidrio templado con descripciones e iconos
const TIPOS_VIDRIO_TEMPLADO = [
  {
    id: "barandales",
    nombre: "Barandales",
    descripcion:
      "Barandales de vidrio templado para escaleras, balcones y terrazas. Proporciona seguridad y elegancia.",
    icono: "🛡️",
    precio_base: 1200,
    aplicaciones: ["Escaleras", "Balcones", "Terrazas", "Piscinas"],
  },
  {
    id: "puertas_bano",
    nombre: "Puertas de Baño",
    descripcion: "Puertas de vidrio templado para baños y duchas. Resistente a la humedad y fácil limpieza.",
    icono: "🚿",
    precio_base: 1500,
    aplicaciones: ["Duchas", "Baños", "Divisiones húmedas"],
  },
  {
    id: "divisiones_internas",
    nombre: "Divisiones Internas",
    descripcion: "Divisiones de vidrio templado para oficinas y espacios comerciales. Maximiza la luz natural.",
    icono: "🏢",
    precio_base: 1000,
    aplicaciones: ["Oficinas", "Comercios", "Salas de juntas", "Recepción"],
  },
  {
    id: "fachadas",
    nombre: "Fachadas",
    descripcion: "Fachadas de vidrio templado para edificios. Excelente aislamiento térmico y acústico.",
    icono: "🏗️",
    precio_base: 1800,
    aplicaciones: ["Edificios", "Centros comerciales", "Hoteles", "Oficinas"],
  },
  {
    id: "puertas_abatibles",
    nombre: "Puertas Abatibles",
    descripcion: "Puertas de vidrio templado con apertura abatible. Ideales para accesos principales.",
    icono: "🚪",
    precio_base: 1600,
    aplicaciones: ["Entradas", "Oficinas", "Comercios", "Residencial"],
  },
  {
    id: "puertas_corredizas",
    nombre: "Puertas Corredizas",
    descripcion: "Puertas de vidrio templado con sistema corredizo. Ahorro de espacio y funcionalidad.",
    icono: "↔️",
    precio_base: 1700,
    aplicaciones: ["Closets", "Divisiones", "Terrazas", "Balcones"],
  },
  {
    id: "varios",
    nombre: "Varios",
    descripcion: "Aplicaciones especiales de vidrio templado según necesidades específicas del cliente.",
    icono: "⚙️",
    precio_base: 1300,
    aplicaciones: ["Mesas", "Repisas", "Vitrinas", "Aplicaciones especiales"],
  },
]

export default function CotizarVidrioTempladoModal({
  isOpen,
  onClose,
  onAgregarItem,
  itemEditando,
}: CotizarVidrioTempladoModalProps) {
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [proveedores, setProveedores] = useState<any[]>([])
  const [materiales, setMateriales] = useState<any[]>([])
  const [tiposVidrio, setTiposVidrio] = useState<any[]>([])
  const [tipoSeleccionado, setTipoSeleccionado] = useState("")

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo_vidrio_templado: "",
    proveedor_id: "",
    tipo_vidrio: "",
    cantidad: 1,
    ancho: 0,
    alto: 0,
    precio_base_m2: 1200,
    usar_calculo_automatico: false,
    flete: 0,
    notas: "",
    materiales_adicionales: [] as any[],
    campos_personalizados: [] as any[],
    imagen: null as File | null,
    imagen_preview: "",
  })

  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<any>(null)

  useEffect(() => {
    if (isOpen) {
      cargarProveedores()
      cargarMateriales()
      cargarVariantes()
    }
  }, [isOpen])

  useEffect(() => {
    if (itemEditando) {
      setFormData({
        nombre: itemEditando.nombre || "",
        descripcion: itemEditando.descripcion || "",
        tipo_vidrio_templado: itemEditando.tipo_vidrio_templado || "",
        proveedor_id: itemEditando.proveedor?.id || "",
        tipo_vidrio: itemEditando.especificaciones?.tipo_vidrio || "",
        cantidad: itemEditando.cantidad || 1,
        ancho: itemEditando.dimensiones?.ancho || 0,
        alto: itemEditando.dimensiones?.alto || 0,
        precio_base_m2: itemEditando.costos?.vidrio_base || 1200,
        usar_calculo_automatico: itemEditando.usar_calculo_automatico || false,
        flete: itemEditando.flete || 0,
        notas: itemEditando.notas || "",
        materiales_adicionales: itemEditando.materiales_adicionales || [],
        campos_personalizados: itemEditando.campos_personalizados || [],
        imagen: null,
        imagen_preview: itemEditando.imagen_url || "",
      })

      if (itemEditando.tipo_vidrio_templado) {
        setTipoSeleccionado(itemEditando.tipo_vidrio_templado)
      }

      if (itemEditando.proveedor?.id) {
        const proveedor = proveedores.find((p) => p._id === itemEditando.proveedor.id)
        setProveedorSeleccionado(proveedor)
      }
    }
  }, [itemEditando, proveedores])

  const cargarProveedores = async () => {
    try {
      const response = await fetch("/api/proveedores")
      const data = await response.json()

      if (data.success) {
        const proveedoresVidrio = data.proveedores.filter((proveedor: any) =>
          proveedor.tipoMateriales?.some((tipo: string) => tipo.toLowerCase().includes("vidrio")),
        )
        setProveedores(proveedoresVidrio)
      }
    } catch (error) {
      console.error("Error cargando proveedores:", error)
    }
  }

  const cargarMateriales = async () => {
    try {
      const response = await fetch("/api/materiales")
      const data = await response.json()

      if (data.success) {
        setMateriales(data.materiales)
      }
    } catch (error) {
      console.error("Error cargando materiales:", error)
    }
  }

  const cargarVariantes = async () => {
    try {
      const response = await fetch("/api/variantes/tipos")
      const data = await response.json()

      if (data.success) {
        setTiposVidrio(data.tiposVidrio || [])
      }
    } catch (error) {
      console.error("Error cargando variantes:", error)
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

  const handleTipoChange = (tipoId: string) => {
    const tipo = TIPOS_VIDRIO_TEMPLADO.find((t) => t.id === tipoId)
    if (tipo) {
      setTipoSeleccionado(tipoId)
      // SIEMPRE actualizar nombre y descripción cuando cambie el tipo
      setFormData((prev) => ({
        ...prev,
        tipo_vidrio_templado: tipoId,
        nombre: tipo.nombre, // Siempre actualizar
        descripcion: tipo.descripcion, // Siempre actualizar
        precio_base_m2: tipo.precio_base,
      }))
    }
  }

  const handleProveedorChange = (proveedorId: string) => {
    const proveedor = proveedores.find((p) => p._id === proveedorId)
    setProveedorSeleccionado(proveedor)
    setFormData((prev) => ({
      ...prev,
      proveedor_id: proveedorId,
    }))
  }

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Solo se permiten archivos de imagen",
          variant: "destructive",
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen no puede ser mayor a 5MB",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          imagen: file,
          imagen_preview: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const eliminarImagen = () => {
    setFormData((prev) => ({
      ...prev,
      imagen: null,
      imagen_preview: "",
    }))
  }

  // Funciones para materiales adicionales
  const agregarMaterial = () => {
    const nuevoMaterial = {
      id: Date.now(),
      material_id: "",
      material_nombre: "",
      cantidad: 1,
      precio_unitario: 0,
      precio_total: 0,
      notas: "",
    }

    setFormData((prev) => ({
      ...prev,
      materiales_adicionales: [...prev.materiales_adicionales, nuevoMaterial],
    }))
  }

  const actualizarMaterial = (index: number, campo: string, valor: any) => {
    setFormData((prev) => ({
      ...prev,
      materiales_adicionales: prev.materiales_adicionales.map((item, i) => {
        if (i === index) {
          const updated = { ...item, [campo]: valor }

          // Si cambió el material, actualizar el nombre
          if (campo === "material_id") {
            const material = materiales.find((m) => m._id === valor)
            updated.material_nombre = material?.nombre || ""

            // Si el material tiene proveedores, usar el primer precio disponible
            if (material?.proveedores?.length > 0) {
              updated.precio_unitario = material.proveedores[0].precio_unitario || 0
            }
          }

          // Recalcular precio total
          if (campo === "cantidad" || campo === "precio_unitario") {
            updated.precio_total = updated.cantidad * updated.precio_unitario
          }

          return updated
        }
        return item
      }),
    }))
  }

  const eliminarMaterial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      materiales_adicionales: prev.materiales_adicionales.filter((_, i) => i !== index),
    }))
  }

  const agregarCampoPersonalizado = () => {
    const nuevoCampo = {
      id: Date.now(),
      nombre: "",
      valor: "",
      tipo: "texto",
      precio: 0,
    }

    setFormData((prev) => ({
      ...prev,
      campos_personalizados: [...prev.campos_personalizados, nuevoCampo],
    }))
  }

  const actualizarCampoPersonalizado = (index: number, campo: string, valor: any) => {
    setFormData((prev) => ({
      ...prev,
      campos_personalizados: prev.campos_personalizados.map((item, i) =>
        i === index ? { ...item, [campo]: valor } : item,
      ),
    }))
  }

  const eliminarCampoPersonalizado = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      campos_personalizados: prev.campos_personalizados.filter((_, i) => i !== index),
    }))
  }

  const calcularPrecioTotal = () => {
    const tipoVidrioInfo = tiposVidrio.find((t) => t._id === formData.tipo_vidrio)

    // Precio base ajustado por tipo de vidrio
    const precioBaseAjustado = formData.precio_base_m2 * (tipoVidrioInfo?.factor_precio || 1)

    let precioArea = 0
    let subtotal = 0

    if (formData.usar_calculo_automatico && formData.ancho > 0 && formData.alto > 0) {
      // Calcular área
      const area = formData.ancho * formData.alto
      precioArea = precioBaseAjustado * area
      subtotal = precioArea * formData.cantidad
    } else {
      // Usar precio base sin cálculo automático
      subtotal = precioBaseAjustado * formData.cantidad
    }

    // Precio de materiales adicionales
    const precioMateriales = formData.materiales_adicionales.reduce(
      (total, material) => total + (material.precio_total || 0),
      0,
    )

    // Precio de campos personalizados
    const precioCamposPersonalizados = formData.campos_personalizados.reduce(
      (total, campo) => total + (campo.precio || 0),
      0,
    )

    return {
      area: formData.ancho * formData.alto,
      precio_base: formData.precio_base_m2,
      precio_ajustado: precioBaseAjustado,
      precio_area: precioArea,
      subtotal: subtotal,
      materiales: precioMateriales,
      campos_personalizados: precioCamposPersonalizados,
      flete: formData.flete,
      total: subtotal + precioMateriales + precioCamposPersonalizados + formData.flete,
    }
  }

  const handleSubmit = () => {
    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive",
      })
      return
    }

    if (!formData.tipo_vidrio_templado) {
      toast({
        title: "Error",
        description: "Debe seleccionar un tipo de vidrio templado",
        variant: "destructive",
      })
      return
    }

    if (!formData.proveedor_id) {
      toast({
        title: "Error",
        description: "Debe seleccionar un proveedor",
        variant: "destructive",
      })
      return
    }

    if (formData.usar_calculo_automatico && (formData.ancho <= 0 || formData.alto <= 0)) {
      toast({
        title: "Error",
        description: "Las dimensiones deben ser mayores a cero cuando usa cálculo automático",
        variant: "destructive",
      })
      return
    }

    const tipoInfo = TIPOS_VIDRIO_TEMPLADO.find((t) => t.id === formData.tipo_vidrio_templado)
    const tipoVidrioInfo = tiposVidrio.find((t) => t._id === formData.tipo_vidrio)
    const calculo = calcularPrecioTotal()

    const vidrioTemplado = {
      tipo: "vidrio_templado",
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      tipo_vidrio_templado: formData.tipo_vidrio_templado,
      nombre_tipo: tipoInfo?.nombre,
      proveedor: {
        id: formData.proveedor_id,
        nombre: proveedorSeleccionado?.nombre,
        contacto: proveedorSeleccionado?.contacto,
        tipoMateriales: proveedorSeleccionado?.tipoMateriales,
      },
      dimensiones: {
        ancho: formData.ancho,
        alto: formData.alto,
        area: calculo.area,
      },
      especificaciones: {
        tipo_vidrio: formData.tipo_vidrio,
        tipo_vidrio_nombre: tipoVidrioInfo?.nombre,
        precio_factor_vidrio: tipoVidrioInfo?.factor_precio || 1,
        aplicaciones: tipoInfo?.aplicaciones || [],
      },
      cantidad: formData.cantidad,
      precio_unitario: calculo.total / formData.cantidad,
      precio_total: calculo.total,
      costos: {
        vidrio_base: formData.precio_base_m2,
        vidrio_ajustado: calculo.precio_ajustado,
        area_calculada: calculo.precio_area,
        materiales_adicionales: calculo.materiales,
        campos_personalizados: calculo.campos_personalizados,
        flete: formData.flete,
      },
      materiales_adicionales: formData.materiales_adicionales,
      campos_personalizados: formData.campos_personalizados,
      usar_calculo_automatico: formData.usar_calculo_automatico,
      flete: formData.flete,
      notas: formData.notas,
      imagen: formData.imagen,
      imagen_preview: formData.imagen_preview,
    }

    onAgregarItem(vidrioTemplado)
    resetForm()
    onClose()

    toast({
      title: "✅ Vidrio templado agregado",
      description: `${formData.nombre} ha sido agregado a la cotización`,
    })
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      tipo_vidrio_templado: "",
      proveedor_id: "",
      tipo_vidrio: "",
      cantidad: 1,
      ancho: 0,
      alto: 0,
      precio_base_m2: 1200,
      usar_calculo_automatico: false,
      flete: 0,
      notas: "",
      materiales_adicionales: [],
      campos_personalizados: [],
      imagen: null,
      imagen_preview: "",
    })
    setTipoSeleccionado("")
    setProveedorSeleccionado(null)
  }

  const calculo = calcularPrecioTotal()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <GlassWater className="w-6 h-6 mr-3 text-blue-600" />
            {itemEditando ? "Editar Vidrio Templado" : "Cotizar Vidrio Templado"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Columna 1: Tipo de Vidrio Templado */}
          <div className="space-y-4">
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-blue-600" />
                  Tipo de Aplicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {TIPOS_VIDRIO_TEMPLADO.map((tipo) => (
                    <Card
                      key={tipo.id}
                      className={`cursor-pointer transition-all border-2 hover:shadow-md ${
                        tipoSeleccionado === tipo.id
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() => handleTipoChange(tipo.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{tipo.icono}</span>
                          <span className="font-semibold text-sm">{tipo.nombre}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{tipo.descripcion}</p>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs font-medium">
                            L {tipo.precio_base.toLocaleString()}/m²
                          </Badge>
                          {tipo.aplicaciones && (
                            <span className="text-xs text-gray-500">{tipo.aplicaciones.length} usos</span>
                          )}
                        </div>
                        {tipoSeleccionado === tipo.id && tipo.aplicaciones && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <div className="text-xs text-blue-600 mb-2 font-medium">Aplicaciones:</div>
                            <div className="flex flex-wrap gap-1">
                              {tipo.aplicaciones.slice(0, 3).map((app, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {app}
                                </Badge>
                              ))}
                              {tipo.aplicaciones.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{tipo.aplicaciones.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna 2: Especificaciones */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Edit3 className="w-5 h-5 mr-2 text-green-600" />
                  Especificaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Nombre del Item</Label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    placeholder="Nombre descriptivo"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Descripción</Label>
                  <Textarea
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    placeholder="Descripción detallada"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="flex items-center text-sm font-medium">
                    <Package className="w-4 h-4 mr-2" />
                    Proveedor de Vidrio
                  </Label>
                  <Select value={formData.proveedor_id} onValueChange={handleProveedorChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {proveedores.map((proveedor) => (
                        <SelectItem key={proveedor._id} value={proveedor._id}>
                          <div>
                            <div className="font-medium">{proveedor.nombre}</div>
                            <div className="text-xs text-gray-500">
                              {proveedor.contacto} - {proveedor.ciudad}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Tipo de Vidrio</Label>
                  <Select
                    value={formData.tipo_vidrio}
                    onValueChange={(value) => handleInputChange("tipo_vidrio", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposVidrio.map((tipo) => (
                        <SelectItem key={tipo._id} value={tipo._id}>
                          <div>
                            <div className="font-medium">{tipo.nombre}</div>
                            <div className="text-xs text-gray-500">Factor: {tipo.factor_precio || 1}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  <Switch
                    id="calculo_automatico"
                    checked={formData.usar_calculo_automatico}
                    onCheckedChange={(checked) => handleInputChange("usar_calculo_automatico", checked)}
                  />
                  <Label htmlFor="calculo_automatico" className="text-sm font-medium">
                    Usar cálculo automático por dimensiones
                  </Label>
                </div>

                {/* Dimensiones - Solo si usa cálculo automático */}
                {formData.usar_calculo_automatico && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <Label className="text-sm font-medium">Ancho (m)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.ancho || ""}
                        onChange={(e) => handleInputChange("ancho", Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Alto (m)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.alto || ""}
                        onChange={(e) => handleInputChange("alto", Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Área (m²)</Label>
                      <div className="p-2 bg-white rounded border text-center font-bold text-blue-600 mt-1">
                        {calculo.area.toFixed(2)} m²
                      </div>
                    </div>
                  </div>
                )}

                {!formData.usar_calculo_automatico && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>💡 Modo manual:</strong> El precio se basa únicamente en el tipo de aplicación
                      seleccionado, sin considerar dimensiones específicas.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.cantidad}
                      onChange={(e) => handleInputChange("cantidad", Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Flete (L)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.flete}
                      onChange={(e) => handleInputChange("flete", Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Precio Base por m² (L)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precio_base_m2}
                    onChange={(e) => handleInputChange("precio_base_m2", Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna 3: Materiales Adicionales */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2 text-purple-600" />
                    Materiales Adicionales
                  </div>
                  <Button variant="outline" size="sm" onClick={agregarMaterial}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {formData.materiales_adicionales.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No hay materiales adicionales</p>
                    <p className="text-xs mt-1">Agrega herrajes, accesorios, etc.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {formData.materiales_adicionales.map((material, index) => (
                      <div key={material.id} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Material #{index + 1}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => eliminarMaterial(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>

                        <Select
                          value={material.material_id}
                          onValueChange={(value) => actualizarMaterial(index, "material_id", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Seleccionar material" />
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

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Cantidad</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={material.cantidad}
                              onChange={(e) => actualizarMaterial(index, "cantidad", Number(e.target.value))}
                              className="h-8 text-sm"
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
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-xs text-gray-600">Total:</span>
                          <span className="font-bold text-green-600">
                            L {material.precio_total?.toFixed(2) || "0.00"}
                          </span>
                        </div>

                        <Input
                          value={material.notas}
                          onChange={(e) => actualizarMaterial(index, "notas", e.target.value)}
                          placeholder="Notas del material..."
                          className="h-8 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Campos personalizados */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Calculator className="w-5 h-5 mr-2 text-orange-600" />
                    Campos Personalizados
                  </div>
                  <Button variant="outline" size="sm" onClick={agregarCampoPersonalizado}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {formData.campos_personalizados.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay campos personalizados</p>
                    <p className="text-xs mt-1">Agrega medidas especiales, etc.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {formData.campos_personalizados.map((campo, index) => (
                      <div key={campo.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <Input
                            value={campo.nombre}
                            onChange={(e) => actualizarCampoPersonalizado(index, "nombre", e.target.value)}
                            placeholder="Nombre del campo"
                            className="h-8 text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => eliminarCampoPersonalizado(index)}
                            className="h-8 w-8 p-0 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <Select
                          value={campo.tipo}
                          onValueChange={(value) => actualizarCampoPersonalizado(index, "tipo", value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="texto">Texto</SelectItem>
                            <SelectItem value="numero">Número</SelectItem>
                            <SelectItem value="medida">Medida (cm)</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={campo.valor}
                            onChange={(e) => actualizarCampoPersonalizado(index, "valor", e.target.value)}
                            placeholder={campo.tipo === "medida" ? "150" : "Valor"}
                            type={campo.tipo === "numero" || campo.tipo === "medida" ? "number" : "text"}
                            className="h-8 text-sm"
                          />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={campo.precio}
                            onChange={(e) => actualizarCampoPersonalizado(index, "precio", Number(e.target.value))}
                            placeholder="Precio"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Columna 4: Resumen e Imagen */}
          <div className="space-y-4">
            {/* Resumen */}
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-4">
                <h3 className="font-bold mb-4 text-lg flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-green-600" />
                  Resumen de Costos
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Precio base:</span>
                    <span className="font-medium">L {formData.precio_base_m2.toLocaleString()}/m²</span>
                  </div>

                  {formData.usar_calculo_automatico && calculo.area > 0 && (
                    <div className="flex justify-between">
                      <span>Área ({calculo.area.toFixed(2)} m²):</span>
                      <span className="font-medium">L {calculo.precio_area.toLocaleString()}</span>
                    </div>
                  )}

                  {!formData.usar_calculo_automatico && (
                    <div className="flex justify-between">
                      <span>Precio por unidad:</span>
                      <span className="font-medium">L {calculo.precio_ajustado.toLocaleString()}</span>
                    </div>
                  )}

                  {formData.materiales_adicionales.length > 0 && (
                    <div className="flex justify-between">
                      <span>Materiales adicionales:</span>
                      <span className="font-medium">L {calculo.materiales.toLocaleString()}</span>
                    </div>
                  )}

                  {formData.campos_personalizados.length > 0 && (
                    <div className="flex justify-between">
                      <span>Campos personalizados:</span>
                      <span className="font-medium">L {calculo.campos_personalizados.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Flete:</span>
                    <span className="font-medium">L {formData.flete.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Cantidad:</span>
                    <span className="font-medium">{formData.cantidad}</span>
                  </div>

                  <Separator />
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total:</span>
                    <span className="text-green-600">L {calculo.total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Imagen/Diagrama */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <ImageIcon className="w-5 h-5 mr-2 text-indigo-600" />
                  Imagen/Diagrama
                </CardTitle>
              </CardHeader>
              <CardContent>
                {formData.imagen_preview ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={formData.imagen_preview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={eliminarImagen}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Subir imagen o diagrama</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagenChange}
                      className="hidden"
                      id="imagen-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("imagen-upload")?.click()}
                    >
                      Seleccionar Archivo
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">Máximo 5MB - JPG, PNG, GIF</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notas */}
            <div>
              <Label className="text-sm font-medium">Notas Adicionales</Label>
              <Textarea
                value={formData.notas}
                onChange={(e) => handleInputChange("notas", e.target.value)}
                placeholder="Especificaciones adicionales, instrucciones de instalación, etc."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button variant="outline" onClick={onClose} size="lg">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.nombre.trim() || !formData.tipo_vidrio_templado || !formData.proveedor_id}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            {itemEditando ? "Actualizar" : "Agregar"} Vidrio Templado
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
