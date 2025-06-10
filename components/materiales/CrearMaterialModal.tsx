"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Package, DollarSign } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface CrearMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onMaterialCreado: () => void
}

// Lista completa de unidades de medida
const UNIDADES_MEDIDA = [
  { value: "metro", label: "Metro" },
  { value: "m2", label: "Metro cuadrado" },
  { value: "pieza", label: "Pieza" },
  { value: "juego", label: "Juego" },
  { value: "tubo", label: "Tubo" },
  { value: "kg", label: "Kilogramo" },
  { value: "litro", label: "Litro" },
  { value: "lamina", label: "Lámina" },
  { value: "lance", label: "Lance" },
  { value: "rollo", label: "Rollo" },
  { value: "ml", label: "Mililitros (ml)" },
  { value: "g", label: "Gramos (g)" },
  { value: "cm", label: "Centímetros" },
  { value: "pulgada", label: "Pulgadas" },
  { value: "unidad", label: "Unidad (1)" },
]

// Lista completa de unidades de medida para producción
const UNIDADES_PRODUCCION = [
  { value: "M2", label: "M2" },
  { value: "Metros", label: "Metros" },
  { value: "Centímetros", label: "Centímetros" },
  { value: "Pulgadas", label: "Pulgadas" },
  { value: "Lamina", label: "Lamina" },
  { value: "Lance", label: "Lance" },
  { value: "Rollo", label: "Rollo" },
  { value: "Mililitros", label: "Mililitros (ml)" },
  { value: "Litros", label: "Litros (l)" },
  { value: "Gramos", label: "Gramos (g)" },
  { value: "Kilogramos", label: "Kilogramos (kg)" },
  { value: "Unidad", label: "Unidad (1)" },
]

export default function CrearMaterialModal({ isOpen, onClose, onMaterialCreado }: CrearMaterialModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [proveedores, setProveedores] = useState([])
  const [variantes, setVariantes] = useState({
    coloresPVC: [],
    coloresAluminio: [],
    tiposVidrio: [],
  })

  // Datos del material principal
  const [formData, setFormData] = useState({
    nombre: "",
    nombres_secundarios: [] as string[],
    descripcion: "",
    categoria: "",
    unidad_medida: "",
    unidad_medida_produccion: "",
    area_longitud: 1,
    formula_calculo: "ancho * alto",
    contribuye_a_malla: false,
    tiene_variantes: false,
    activo: true,
  })

  // Nombre secundario temporal
  const [nuevoNombreSecundario, setNuevoNombreSecundario] = useState("")

  // Proveedores del material con sus variantes
  const [proveedoresMaterial, setProveedoresMaterial] = useState<any[]>([])
  const [nuevoProveedor, setNuevoProveedor] = useState({
    proveedor_id: "",
    proveedor_nombre: "", // Agregamos el nombre del proveedor
    precio_unitario: 0,
    descuento: 0,
    impuesto: 16,
    es_principal: false,
    tipo_variante: "", // "pvc", "aluminio", "vidrio"
    variantes_precios: [] as any[], // [{variante_id, precio_adicional}]
  })

  useEffect(() => {
    if (isOpen) {
      console.log("🔄 Modal crear material abierto, cargando datos...")
      cargarProveedores()
      cargarVariantes()
    }
  }, [isOpen])

  const cargarProveedores = async () => {
    try {
      console.log("📡 Cargando proveedores...")
      const response = await fetch("/api/proveedores")
      const data = await response.json()

      if (data.success) {
        console.log("✅ Proveedores cargados:", data.proveedores?.length || 0)
        setProveedores(data.proveedores || [])
      } else {
        console.log("❌ Error cargando proveedores:", data.error)
        toast({
          title: "Error",
          description: data.error || "Error cargando proveedores",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Error cargando proveedores:", error)
      toast({
        title: "Error",
        description: "Error de conexión al cargar proveedores",
        variant: "destructive",
      })
    }
  }

  const cargarVariantes = async () => {
    try {
      console.log("📡 Cargando variantes...")
      const response = await fetch("/api/variantes")
      const data = await response.json()

      if (data.success) {
        console.log("✅ Variantes cargadas:", {
          pvc: data.coloresPVC?.length || 0,
          aluminio: data.coloresAluminio?.length || 0,
          vidrio: data.tiposVidrio?.length || 0,
        })
        setVariantes({
          coloresPVC: data.coloresPVC || [],
          coloresAluminio: data.coloresAluminio || [],
          tiposVidrio: data.tiposVidrio || [],
        })
      }
    } catch (error) {
      console.error("❌ Error cargando variantes:", error)
    }
  }

  const agregarNombreSecundario = () => {
    if (nuevoNombreSecundario.trim()) {
      console.log("➕ Agregando nombre secundario:", nuevoNombreSecundario.trim())
      setFormData((prev) => ({
        ...prev,
        nombres_secundarios: [...prev.nombres_secundarios, nuevoNombreSecundario.trim()],
      }))
      setNuevoNombreSecundario("")
    }
  }

  const eliminarNombreSecundario = (index: number) => {
    console.log("➖ Eliminando nombre secundario en índice:", index)
    setFormData((prev) => ({
      ...prev,
      nombres_secundarios: prev.nombres_secundarios.filter((_, i) => i !== index),
    }))
  }

  const agregarProveedor = () => {
    if (!nuevoProveedor.proveedor_id) {
      console.log("❌ Error: No se seleccionó proveedor")
      toast({
        title: "Error",
        description: "Selecciona un proveedor",
        variant: "destructive",
      })
      return
    }

    // Solo validar precio si NO tiene variantes
    if (!formData.tiene_variantes && nuevoProveedor.precio_unitario <= 0) {
      console.log("❌ Error: Precio inválido para material sin variantes")
      toast({
        title: "Error",
        description: "Ingresa un precio válido",
        variant: "destructive",
      })
      return
    }

    // Si tiene variantes, validar que se haya seleccionado tipo
    if (formData.tiene_variantes && !nuevoProveedor.tipo_variante) {
      console.log("❌ Error: No se seleccionó tipo de variante")
      toast({
        title: "Error",
        description: "Selecciona el tipo de variante para este proveedor",
        variant: "destructive",
      })
      return
    }

    const proveedor = proveedores.find((p: any) => p._id === nuevoProveedor.proveedor_id)
    if (!proveedor) return

    console.log("➕ Agregando proveedor:", proveedor.nombre)
    setProveedoresMaterial((prev) => [
      ...prev,
      {
        ...nuevoProveedor,
        id: Date.now(),
        proveedor_nombre: proveedor.nombre, // Guardamos el nombre del proveedor
      },
    ])

    setNuevoProveedor({
      proveedor_id: "",
      proveedor_nombre: "",
      precio_unitario: 0,
      descuento: 0,
      impuesto: 16,
      es_principal: false,
      tipo_variante: "",
      variantes_precios: [],
    })

    toast({
      title: "Proveedor agregado",
      description: `${proveedor.nombre} ha sido agregado al material`,
    })
  }

  const eliminarProveedor = (id: number) => {
    console.log("➖ Eliminando proveedor con ID:", id)
    setProveedoresMaterial((prev) => prev.filter((p) => p.id !== id))
    toast({
      title: "Proveedor eliminado",
      description: "El proveedor ha sido removido del material",
    })
  }

  const actualizarPrecioVariante = (proveedorId: number, varianteId: string, precio: number) => {
    console.log("💰 Actualizando precio variante:", { proveedorId, varianteId, precio })
    setProveedoresMaterial((prev) =>
      prev.map((proveedor) => {
        if (proveedor.id === proveedorId) {
          const variantes = proveedor.variantes_precios.filter((v: any) => v.variante_id !== varianteId)
          if (precio > 0) {
            variantes.push({ variante_id: varianteId, precio_adicional: precio })
          }
          return { ...proveedor, variantes_precios: variantes }
        }
        return proveedor
      }),
    )
  }

  const obtenerVariantesPorTipo = (tipo: string) => {
    switch (tipo) {
      case "pvc":
        return variantes.coloresPVC
      case "aluminio":
        return variantes.coloresAluminio
      case "vidrio":
        return variantes.tiposVidrio
      default:
        return []
    }
  }

  // Actualizar unidad de medida de producción cuando cambia la unidad de medida
  useEffect(() => {
    if (formData.unidad_medida && !formData.unidad_medida_produccion) {
      // Intentar encontrar una unidad de producción equivalente
      const unidadEquivalente = UNIDADES_PRODUCCION.find(
        (u) =>
          u.value.toLowerCase() === formData.unidad_medida.toLowerCase() ||
          u.label.toLowerCase().includes(formData.unidad_medida.toLowerCase()),
      )

      if (unidadEquivalente) {
        setFormData((prev) => ({
          ...prev,
          unidad_medida_produccion: unidadEquivalente.value,
        }))
      }
    }
  }, [formData.unidad_medida])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      console.log("💾 Iniciando creación de material...")

      if (!formData.nombre || !formData.categoria || proveedoresMaterial.length === 0) {
        console.log("❌ Validación fallida: campos requeridos faltantes")
        toast({
          title: "Error",
          description: "Completa todos los campos requeridos y agrega al menos un proveedor",
          variant: "destructive",
        })
        return
      }

      const materialData = {
        ...formData,
        proveedores: proveedoresMaterial.map((p) => ({
          proveedor_id: p.proveedor_id,
          proveedor_nombre: p.proveedor_nombre, // Incluimos el nombre del proveedor
          precio_unitario: p.precio_unitario,
          descuento: p.descuento,
          impuesto: p.impuesto,
          es_principal: p.es_principal,
          tipo_variante: p.tipo_variante,
          variantes_precios: p.variantes_precios,
        })),
      }

      console.log("📝 Datos del material a crear:", materialData)

      const response = await fetch("/api/materiales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(materialData),
      })

      const result = await response.json()
      console.log("📡 Respuesta del servidor:", result)

      if (response.ok && result.success) {
        console.log("✅ Material creado exitosamente")
        toast({
          title: "¡Material creado!",
          description: "El material ha sido creado exitosamente",
        })
        onMaterialCreado()
        limpiarFormulario()
        onClose()
      } else {
        throw new Error(result.error || "Error al crear material")
      }
    } catch (error) {
      console.error("❌ Error creando material:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el material",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const limpiarFormulario = () => {
    console.log("🧹 Limpiando formulario...")
    setFormData({
      nombre: "",
      nombres_secundarios: [],
      descripcion: "",
      categoria: "",
      unidad_medida: "",
      unidad_medida_produccion: "",
      area_longitud: 1,
      formula_calculo: "ancho * alto",
      contribuye_a_malla: false,
      tiene_variantes: false,
      activo: true,
    })
    setProveedoresMaterial([])
    setNuevoNombreSecundario("")
    setNuevoProveedor({
      proveedor_id: "",
      proveedor_nombre: "",
      precio_unitario: 0,
      descuento: 0,
      impuesto: 16,
      es_principal: false,
      tipo_variante: "",
      variantes_precios: [],
    })
  }

  // Actualizar el nombre del proveedor cuando se selecciona uno
  useEffect(() => {
    if (nuevoProveedor.proveedor_id) {
      const proveedorSeleccionado = proveedores.find((p: any) => p._id === nuevoProveedor.proveedor_id)
      if (proveedorSeleccionado) {
        setNuevoProveedor((prev) => ({
          ...prev,
          proveedor_nombre: proveedorSeleccionado.nombre,
        }))
      }
    }
  }, [nuevoProveedor.proveedor_id, proveedores])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Crear Nuevo Material
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna 1 - Información Básica */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre Principal del Material *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Perfil Marco PVC"
                  />
                </div>

                {/* Nombres Secundarios */}
                <div>
                  <Label>Nombres Secundarios</Label>
                  <p className="text-sm text-gray-500 mb-2">Otros nombres que usan diferentes proveedores</p>
                  <div className="flex gap-2">
                    <Input
                      value={nuevoNombreSecundario}
                      onChange={(e) => setNuevoNombreSecundario(e.target.value)}
                      placeholder="Nombre alternativo"
                      onKeyPress={(e) => e.key === "Enter" && agregarNombreSecundario()}
                    />
                    <Button type="button" onClick={agregarNombreSecundario}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.nombres_secundarios.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.nombres_secundarios.map((nombre, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {nombre}
                          <button
                            type="button"
                            onClick={() => eliminarNombreSecundario(index)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Descripción detallada del material"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, categoria: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Perfil PVC">Perfil PVC</SelectItem>
                        <SelectItem value="Perfil Aluminio">Perfil Aluminio</SelectItem>
                        <SelectItem value="Vidrio">Vidrio</SelectItem>
                        <SelectItem value="Herrajes">Herrajes</SelectItem>
                        <SelectItem value="Selladores">Selladores</SelectItem>
                        <SelectItem value="Accesorios">Accesorios</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="unidad">Unidad de Medida *</Label>
                    <Select
                      value={formData.unidad_medida}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, unidad_medida: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIDADES_MEDIDA.map((unidad) => (
                          <SelectItem key={unidad.value} value={unidad.value}>
                            {unidad.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="unidad_produccion">Unidad de Medida para Producción</Label>
                  <Select
                    value={formData.unidad_medida_produccion}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, unidad_medida_produccion: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIDADES_PRODUCCION.map((unidad) => (
                        <SelectItem key={unidad.value} value={unidad.value}>
                          {unidad.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Unidad utilizada en comandas de producción</p>
                </div>

                <div>
                  <Label htmlFor="area_longitud">Área/Longitud por Unidad</Label>
                  <Input
                    id="area_longitud"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.area_longitud}
                    onChange={(e) => setFormData((prev) => ({ ...prev, area_longitud: Number(e.target.value) || 1 }))}
                    placeholder="1.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ej: 6 metros por barra, 1 m² por hoja, etc.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>¿Tiene Variantes?</Label>
                      <p className="text-sm text-gray-500">Colores, tipos, acabados, etc.</p>
                    </div>
                    <Switch
                      checked={formData.tiene_variantes}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, tiene_variantes: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Material Activo</Label>
                      <p className="text-sm text-gray-500">Disponible para usar</p>
                    </div>
                    <Switch
                      checked={formData.activo}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, activo: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna 2 - Proveedores */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agregar Proveedor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {proveedores.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No se pudieron cargar los proveedores</p>
                    <Button onClick={cargarProveedores} variant="outline" size="sm" className="mt-2">
                      Reintentar
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label>Proveedor *</Label>
                      <Select
                        value={nuevoProveedor.proveedor_id}
                        onValueChange={(value) => setNuevoProveedor((prev) => ({ ...prev, proveedor_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar proveedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {proveedores.map((proveedor: any) => (
                            <SelectItem key={proveedor._id} value={proveedor._id}>
                              {proveedor.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {!formData.tiene_variantes && (
                      <div>
                        <Label>Precio Base *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={nuevoProveedor.precio_unitario}
                          onChange={(e) =>
                            setNuevoProveedor((prev) => ({ ...prev, precio_unitario: Number(e.target.value) }))
                          }
                          placeholder="0.00"
                        />
                      </div>
                    )}

                    {formData.tiene_variantes && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Material con variantes:</strong> Los precios se configuran por cada variante
                          específica.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Descuento %</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={nuevoProveedor.descuento}
                          onChange={(e) =>
                            setNuevoProveedor((prev) => ({ ...prev, descuento: Number(e.target.value) }))
                          }
                        />
                      </div>

                      <div>
                        <Label>Impuesto %</Label>
                        <Input
                          type="number"
                          min="0"
                          value={nuevoProveedor.impuesto}
                          onChange={(e) => setNuevoProveedor((prev) => ({ ...prev, impuesto: Number(e.target.value) }))}
                        />
                      </div>
                    </div>

                    {formData.tiene_variantes && (
                      <div>
                        <Label>Tipo de Variante *</Label>
                        <Select
                          value={nuevoProveedor.tipo_variante}
                          onValueChange={(value) => setNuevoProveedor((prev) => ({ ...prev, tipo_variante: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pvc">Colores PVC</SelectItem>
                            <SelectItem value="aluminio">Colores Aluminio</SelectItem>
                            <SelectItem value="vidrio">Tipos de Vidrio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={nuevoProveedor.es_principal}
                        onCheckedChange={(checked) => setNuevoProveedor((prev) => ({ ...prev, es_principal: checked }))}
                      />
                      <Label className="text-sm">Proveedor Principal</Label>
                    </div>

                    <Button onClick={agregarProveedor} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Proveedor
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Lista de Proveedores Agregados */}
            {proveedoresMaterial.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Proveedores Agregados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {proveedoresMaterial.map((proveedor) => (
                    <div key={proveedor.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{proveedor.proveedor_nombre}</span>
                            {proveedor.es_principal && <Badge variant="default">Principal</Badge>}
                            {proveedor.tipo_variante && (
                              <Badge variant="outline">{proveedor.tipo_variante.toUpperCase()}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Base: L{proveedor.precio_unitario} - Desc: {proveedor.descuento}% - IVA:{" "}
                            {proveedor.impuesto}%
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => eliminarProveedor(proveedor.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Precios de Variantes */}
                      {proveedor.tipo_variante && (
                        <div className="mt-3 pt-3 border-t">
                          <Label className="text-sm font-medium">Precios por Variante:</Label>
                          <div className="grid grid-cols-1 gap-2 mt-2">
                            {obtenerVariantesPorTipo(proveedor.tipo_variante).map((variante: any) => (
                              <div key={variante._id} className="flex items-center justify-between">
                                <span className="text-sm">{variante.nombre}</span>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-3 h-3" />
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-20 h-8 text-sm"
                                    value={
                                      proveedor.variantes_precios.find((v: any) => v.variante_id === variante._id)
                                        ?.precio_adicional || ""
                                    }
                                    onChange={(e) =>
                                      actualizarPrecioVariante(proveedor.id, variante._id, Number(e.target.value))
                                    }
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Columna 3 - Vista Previa */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Material:</span> {formData.nombre || "Sin nombre"}
                  </div>
                  <div>
                    <span className="font-medium">Categoría:</span> {formData.categoria || "Sin categoría"}
                  </div>
                  <div>
                    <span className="font-medium">Unidad:</span> {formData.unidad_medida || "Sin unidad"}
                  </div>
                  <div>
                    <span className="font-medium">Unidad producción:</span>{" "}
                    {formData.unidad_medida_produccion || "Sin unidad"}
                  </div>
                  <div>
                    <span className="font-medium">Área/Longitud:</span> {formData.area_longitud}
                  </div>
                  <div>
                    <span className="font-medium">Nombres secundarios:</span> {formData.nombres_secundarios.length}
                  </div>
                  <div>
                    <span className="font-medium">Proveedores:</span> {proveedoresMaterial.length}
                  </div>
                  {formData.tiene_variantes && (
                    <div>
                      <span className="font-medium">Con variantes:</span> Sí
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creando..." : "Crear Material"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
