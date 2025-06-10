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
import { Plus, Trash2, Edit, RefreshCw, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface EditarMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  material: any
  onActualizado?: () => void
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

export default function EditarMaterialModal({ isOpen, onClose, material, onActualizado }: EditarMaterialModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [proveedores, setProveedores] = useState<any[]>([])
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
    proveedor_nombre: "",
    precio_unitario: 0,
    descuento: 0,
    impuesto: 16,
    es_principal: false,
    tipo_variante: "",
    variantes_precios: [] as any[],
  })

  useEffect(() => {
    if (isOpen && material) {
      console.log("🔄 Modal editar material abierto, cargando datos...", material)
      setInitialLoading(true)

      // Resetear estados
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

      Promise.all([cargarProveedores(), cargarVariantes()])
        .then(() => {
          // Cargar datos del material después de cargar proveedores y variantes
          cargarDatosMaterial()
          console.log("✅ Carga inicial completa")
          setInitialLoading(false)
        })
        .catch((error) => {
          console.error("❌ Error durante la carga inicial:", error)
          toast({
            title: "Error",
            description: "Error al cargar datos iniciales",
            variant: "destructive",
          })
          setInitialLoading(false)
        })
    }
  }, [isOpen, material])

  const cargarDatosMaterial = () => {
    try {
      if (!material) {
        console.warn("⚠️ No se proporcionó material para cargar datos.")
        return
      }

      console.log("📝 Cargando datos del material:", material)

      // Cargar datos básicos del material
      setFormData({
        nombre: material.nombre || "",
        nombres_secundarios: Array.isArray(material.nombres_secundarios) ? material.nombres_secundarios : [],
        descripcion: material.descripcion || "",
        categoria: material.categoria || "",
        unidad_medida: material.unidad_medida || "",
        unidad_medida_produccion: material.unidad_medida_produccion || material.unidad_medida || "",
        area_longitud: material.area_longitud || 1,
        formula_calculo: material.formula_calculo || "ancho * alto",
        contribuye_a_malla: material.contribuye_a_malla || false,
        tiene_variantes: material.tiene_variantes || false,
        activo: material.activo !== false,
      })

      // Cargar proveedores existentes
      if (Array.isArray(material.proveedores)) {
        console.log("👥 Proveedores del material:", material.proveedores)

        const proveedoresExistentes = material.proveedores.map((prov: any, index: number) => {
          const proveedorNombre = prov.proveedor_nombre || "Proveedor sin nombre"
          console.log(`🔍 Proveedor ${index}:`, {
            id: prov.proveedor_id,
            nombre: proveedorNombre,
            precio: prov.precio_unitario,
            descuento: prov.descuento,
            impuesto: prov.impuesto,
          })

          return {
            ...prov,
            id: prov.proveedor_id + "_" + index, // ID único para el frontend
            precio_unitario: Number(prov.precio_unitario) || 0,
            descuento: Number(prov.descuento) || 0,
            impuesto: Number(prov.impuesto) || 16, // Si es 0, usar 16 como default
            es_principal: Boolean(prov.es_principal),
            tipo_variante: prov.tipo_variante || "",
            variantes_precios: prov.variantes_precios || [],
            proveedor_nombre: proveedorNombre,
          }
        })

        console.log("✅ Proveedores procesados:", proveedoresExistentes)
        setProveedoresMaterial(proveedoresExistentes)
      } else {
        console.log("⚠️ No hay proveedores en el material o formato incorrecto")
        setProveedoresMaterial([])
      }
    } catch (error) {
      console.error("❌ Error al cargar datos del material:", error)
      toast({
        title: "Error",
        description: "Error al cargar datos del material",
        variant: "destructive",
      })
    }
  }

  const cargarProveedores = async () => {
    try {
      console.log("📡 Cargando lista de proveedores...")
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

  const proveedorYaAgregado = (proveedorId: string) => {
    return proveedoresMaterial.some((p) => p.proveedor_id === proveedorId)
  }

  const proveedoresDisponibles = () => {
    return proveedores.filter((p) => !proveedorYaAgregado(p._id))
  }

  const agregarProveedor = () => {
    if (!nuevoProveedor.proveedor_id) {
      toast({
        title: "Error",
        description: "Selecciona un proveedor",
        variant: "destructive",
      })
      return
    }

    if (proveedorYaAgregado(nuevoProveedor.proveedor_id)) {
      toast({
        title: "Error",
        description: "Este proveedor ya está agregado al material",
        variant: "destructive",
      })
      return
    }

    if (!formData.tiene_variantes && nuevoProveedor.precio_unitario <= 0) {
      toast({
        title: "Error",
        description: "Ingresa un precio válido",
        variant: "destructive",
      })
      return
    }

    if (formData.tiene_variantes && !nuevoProveedor.tipo_variante) {
      toast({
        title: "Error",
        description: "Selecciona el tipo de variante para este proveedor",
        variant: "destructive",
      })
      return
    }

    const proveedor = proveedores.find((p: any) => p._id === nuevoProveedor.proveedor_id)
    if (!proveedor) {
      return
    }

    console.log("➕ Agregando proveedor:", proveedor.nombre)
    setProveedoresMaterial((prev) => [
      ...prev,
      {
        ...nuevoProveedor,
        id: Date.now(),
        proveedor_id: proveedor._id,
        proveedor_nombre: proveedor.nombre,
      },
    ])

    toast({
      title: "Proveedor agregado",
      description: `${proveedor.nombre} ha sido agregado al material`,
    })

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

  const eliminarProveedor = (id: string | number) => {
    console.log("➖ Eliminando proveedor con ID:", id)
    setProveedoresMaterial((prev) => prev.filter((p) => p.id !== id))
    toast({
      title: "Proveedor eliminado",
      description: "El proveedor ha sido removido del material",
    })
  }

  const actualizarPrecioVariante = (proveedorId: string | number, varianteId: string, precio: number) => {
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

  const limpiarPreciosVariantes = (proveedorId: string | number) => {
    console.log("🧹 Limpiando precios de variantes para proveedor:", proveedorId)
    setProveedoresMaterial((prev) =>
      prev.map((proveedor) => {
        if (proveedor.id === proveedorId) {
          return { ...proveedor, variantes_precios: [] }
        }
        return proveedor
      }),
    )
    toast({
      title: "Precios limpiados",
      description: "Se han eliminado todos los precios por variante",
    })
  }

  // Corregir la función actualizarProveedor para permitir impuesto 0
  const actualizarProveedor = (proveedorId: string | number, campo: string, valor: any) => {
    console.log(`🔄 Actualizando proveedor ${proveedorId}, campo: ${campo}, valor:`, valor)

    // Asegurar que el valor sea del tipo correcto
    let valorProcesado = valor
    if (campo === "impuesto" || campo === "descuento" || campo === "precio_unitario") {
      valorProcesado = Number(valor)
      // Convertir NaN a 0
      if (isNaN(valorProcesado)) {
        valorProcesado = 0
      }
    }

    setProveedoresMaterial((prev) =>
      prev.map((proveedor) => {
        if (proveedor.id === proveedorId) {
          const actualizado = { ...proveedor, [campo]: valorProcesado }
          console.log(`✅ Proveedor actualizado - ${campo}:`, valorProcesado, "Estado completo:", actualizado)
          return actualizado
        }
        return proveedor
      }),
    )

    // Toast más específico
    const nombreCampo =
      campo === "impuesto"
        ? "Impuesto"
        : campo === "descuento"
          ? "Descuento"
          : campo === "precio_unitario"
            ? "Precio"
            : campo

    toast({
      title: `${nombreCampo} actualizado`,
      description: `${nombreCampo}: ${valorProcesado}${campo === "impuesto" || campo === "descuento" ? "%" : ""}`,
    })
  }

  const obtenerVariantesPorTipo = (tipo: string, materialId?: string) => {
    // Si tenemos el ID del material, intentar obtener sus variantes específicas
    if (materialId && material?.variantes_disponibles) {
      const variantesDelMaterial = material.variantes_disponibles.filter((v: any) => {
        switch (tipo) {
          case "pvc":
            return v.tipo === "color_pvc"
          case "aluminio":
            return v.tipo === "color_aluminio"
          case "vidrio":
            return v.tipo === "tipo_vidrio"
          default:
            return false
        }
      })

      if (variantesDelMaterial.length > 0) {
        return variantesDelMaterial
      }
    }

    // Fallback a todas las variantes del tipo si no hay específicas
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

  useEffect(() => {
    if (formData.unidad_medida && !formData.unidad_medida_produccion) {
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

  // Corregir la función handleSubmit para asegurar que el modal se cierre correctamente
  const handleSubmit = async () => {
    if (loading) {
      console.log("⚠️ Ya se está procesando una solicitud, ignorando...")
      return
    }

    try {
      setLoading(true)
      console.log("💾 Iniciando actualización de material...")

      // Validaciones
      if (!formData.nombre || !formData.categoria || proveedoresMaterial.length === 0) {
        console.log("❌ Validación fallida: campos requeridos faltantes")
        toast({
          title: "Error de validación",
          description: "Completa todos los campos requeridos y agrega al menos un proveedor",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Mostrar toast de inicio
      toast({
        title: "Guardando material...",
        description: "Procesando la actualización",
      })

      const materialData = {
        ...formData,
        proveedores: proveedoresMaterial.map((p) => ({
          proveedor_id: p.proveedor_id,
          proveedor_nombre: p.proveedor_nombre,
          precio_unitario: Number(p.precio_unitario) || 0,
          descuento: Number(p.descuento) || 0,
          impuesto: Number(p.impuesto), // Permitir que sea 0 si así se configuró
          es_principal: Boolean(p.es_principal),
          tipo_variante: p.tipo_variante || "",
          variantes_precios: p.variantes_precios || [],
        })),
      }

      console.log("📝 Datos del material a enviar:", JSON.stringify(materialData, null, 2))

      const response = await fetch(`/api/materiales/${material._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(materialData),
      })

      const result = await response.json()
      console.log("📡 Respuesta del servidor:", result)

      if (response.ok && result.success) {
        console.log("✅ Material actualizado exitosamente")
        toast({
          title: "¡Material actualizado!",
          description: `${formData.nombre} se ha guardado correctamente`,
        })

        // Llamar callback y cerrar modal inmediatamente
        if (onActualizado) {
          onActualizado()
        }
        onClose()
      } else {
        throw new Error(result.error || `Error HTTP ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error actualizando material:", error)
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudo actualizar el material",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (!material) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit className="w-5 h-5 mr-2" />
            Editar Material: {material.nombre}
          </DialogTitle>
        </DialogHeader>

        {initialLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cargando datos...</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cargando proveedores...</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vista previa...</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
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
                  {proveedoresDisponibles().length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">
                        {proveedores.length === 0
                          ? "No se pudieron cargar los proveedores"
                          : "Todos los proveedores ya están agregados"}
                      </p>
                      {proveedores.length === 0 && (
                        <Button onClick={cargarProveedores} variant="outline" size="sm" className="mt-2">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reintentar
                        </Button>
                      )}
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
                            {proveedoresDisponibles().map((proveedor: any) => (
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
                            onChange={(e) => {
                              const nuevoImpuesto = Number(e.target.value) || 0
                              setNuevoProveedor((prev) => ({ ...prev, impuesto: nuevoImpuesto }))
                            }}
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
                    <CardTitle>Proveedores Agregados ({proveedoresMaterial.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {proveedoresMaterial.map((proveedor) => (
                      <div key={proveedor.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {proveedor.proveedor_nombre || "Proveedor sin nombre"}
                              </span>
                              {proveedor.es_principal && <Badge variant="default">Principal</Badge>}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => eliminarProveedor(proveedor.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {!formData.tiene_variantes && (
                            <div>
                              <Label className="text-sm">Precio Base</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={proveedor.precio_unitario}
                                onChange={(e) =>
                                  actualizarProveedor(proveedor.id, "precio_unitario", Number(e.target.value))
                                }
                                placeholder="0.00"
                              />
                            </div>
                          )}

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-sm">Descuento %</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={proveedor.descuento}
                                onChange={(e) => actualizarProveedor(proveedor.id, "descuento", Number(e.target.value))}
                              />
                            </div>

                            <div>
                              <Label className="text-sm">Impuesto %</Label>
                              <Input
                                type="number"
                                min="0"
                                value={proveedor.impuesto}
                                onChange={(e) => {
                                  const nuevoImpuesto = Number(e.target.value) || 0
                                  actualizarProveedor(proveedor.id, "impuesto", nuevoImpuesto)
                                }}
                              />
                            </div>

                            <div className="flex items-end">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={proveedor.es_principal}
                                  onCheckedChange={(checked) =>
                                    actualizarProveedor(proveedor.id, "es_principal", checked)
                                  }
                                />
                                <Label className="text-xs">Principal</Label>
                              </div>
                            </div>
                          </div>

                          {/* Gestión de Variantes */}
                          {formData.tiene_variantes && (
                            <div className="mt-4 border-t pt-3">
                              <div className="flex justify-between items-center mb-3">
                                <Label className="text-sm font-medium">Gestión de Variantes</Label>
                                {proveedor.variantes_precios && proveedor.variantes_precios.length > 0 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => limpiarPreciosVariantes(proveedor.id)}
                                    className="text-red-600"
                                  >
                                    Limpiar Precios
                                  </Button>
                                )}
                              </div>

                              {/* Selector de tipo de variante */}
                              <div className="mb-3">
                                <Label className="text-sm">Tipo de Variante</Label>
                                <Select
                                  value={proveedor.tipo_variante || ""}
                                  onValueChange={(value) => actualizarProveedor(proveedor.id, "tipo_variante", value)}
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

                              {/* Lista de variantes disponibles */}
                              {proveedor.tipo_variante && (
                                <div className="space-y-2">
                                  <Label className="text-sm">Precios por Variante</Label>
                                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                                    {obtenerVariantesPorTipo(proveedor.tipo_variante, material?._id).map(
                                      (variante: any) => {
                                        const precioExistente = proveedor.variantes_precios?.find(
                                          (v: any) => v.variante_id === variante._id,
                                        )
                                        return (
                                          <div
                                            key={variante._id}
                                            className="flex items-center gap-2 p-2 border rounded"
                                          >
                                            <div className="flex-1">
                                              <span className="text-sm font-medium">{variante.nombre}</span>
                                              {variante.codigo && (
                                                <span className="text-xs text-gray-500 ml-2">({variante.codigo})</span>
                                              )}
                                            </div>
                                            <div className="w-24">
                                              <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={precioExistente?.precio_adicional || ""}
                                                onChange={(e) =>
                                                  actualizarPrecioVariante(
                                                    proveedor.id,
                                                    variante._id,
                                                    Number(e.target.value) || 0,
                                                  )
                                                }
                                                className="text-sm"
                                              />
                                            </div>
                                          </div>
                                        )
                                      },
                                    )}
                                  </div>

                                  {/* Resumen de variantes configuradas */}
                                  {proveedor.variantes_precios && proveedor.variantes_precios.length > 0 && (
                                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                      <strong>Configuradas:</strong> {proveedor.variantes_precios.length} de{" "}
                                      {obtenerVariantesPorTipo(proveedor.tipo_variante, material?._id).length} variantes
                                      disponibles
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
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
                      <span className="font-medium">Proveedores:</span> {proveedoresMaterial.length}
                    </div>
                    <div>
                      <span className="font-medium">Estado:</span>{" "}
                      <Badge variant={formData.activo ? "default" : "secondary"}>
                        {formData.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>

                    {/* Debug info */}
                    <div className="mt-4 p-2 bg-gray-50 rounded text-xs">
                      <strong>Debug:</strong>
                      <br />
                      Proveedores en estado: {proveedoresMaterial.length}
                      <br />
                      {proveedoresMaterial.map((p, i) => (
                        <div key={i}>
                          {p.proveedor_nombre}: Impuesto {p.impuesto}%
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || initialLoading}>
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Material
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
