"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, X, Calculator, Package, Palette, Trash2, Search, Ruler, FileText, Tag } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ItemLibre {
  id: number
  descripcion: string
  cantidad: number
  precio_unitario: number
  precio_total: number
  proveedor_id: string
  material_id: string
  material_tipo: string
  variante_id: string
  materiales_informativos: any[]
  usar_calculo_automatico: boolean
  medidas: {
    ancho: number
    alto: number
    area: number
  }
  notas: string
}

interface CotizacionLibreFormProps {
  onAgregarCotizacion: (cotizacion: any) => void
}

export default function CotizacionLibreForm({ onAgregarCotizacion }: CotizacionLibreFormProps) {
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [proveedores, setProveedores] = useState<any[]>([])
  const [materiales, setMateriales] = useState<any[]>([])
  const [variantes, setVariantes] = useState<any>({
    coloresPVC: [],
    coloresAluminio: [],
    tiposVidrio: [],
  })
  const [filtroMateriales, setFiltroMateriales] = useState("")
  const [filtroProveedores, setFiltroProveedores] = useState("")

  const [items, setItems] = useState<ItemLibre[]>([
    {
      id: Date.now(),
      descripcion: "",
      cantidad: 1,
      precio_unitario: 0,
      precio_total: 0,
      proveedor_id: "",
      material_id: "",
      material_tipo: "",
      variante_id: "",
      materiales_informativos: [],
      usar_calculo_automatico: false,
      medidas: {
        ancho: 0,
        alto: 0,
        area: 0,
      },
      notas: "",
    },
  ])

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      // Cargar proveedores
      const proveedoresResponse = await fetch("/api/proveedores")
      const proveedoresData = await proveedoresResponse.json()

      // Cargar materiales
      const materialesResponse = await fetch("/api/materiales")
      const materialesData = await materialesResponse.json()

      // Cargar variantes
      const variantesResponse = await fetch("/api/variantes/tipos")
      const variantesData = await variantesResponse.json()

      if (proveedoresData.success) {
        setProveedores(proveedoresData.proveedores || [])
      }

      if (materialesData.success) {
        setMateriales(materialesData.materiales || [])
      }

      if (variantesData.success) {
        setVariantes({
          coloresPVC: variantesData.coloresPVC || [],
          coloresAluminio: variantesData.coloresAluminio || [],
          tiposVidrio: variantesData.tiposVidrio || [],
        })
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

  const agregarItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        descripcion: "",
        cantidad: 1,
        precio_unitario: 0,
        precio_total: 0,
        proveedor_id: "",
        material_id: "",
        material_tipo: "",
        variante_id: "",
        materiales_informativos: [],
        usar_calculo_automatico: false,
        medidas: {
          ancho: 0,
          alto: 0,
          area: 0,
        },
        notas: "",
      },
    ])
  }

  const eliminarItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const actualizarItem = (index: number, field: keyof ItemLibre, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const updated = { ...item, [field]: value }

          // Si se selecciona un material, actualizar información
          if (field === "material_id" && value) {
            const material = materiales.find((m) => m._id === value)
            if (material) {
              updated.material_tipo = material.categoria?.toLowerCase() || ""
              updated.variante_id = "" // Resetear variante al cambiar material

              if (!updated.usar_calculo_automatico) {
                updated.precio_unitario = material.precio || 0
              }

              // Actualizar descripción si está vacía
              if (!updated.descripcion) {
                updated.descripcion = material.nombre || ""
              }
            }
          }

          // Si se selecciona una variante, actualizar precio según la variante
          if (field === "variante_id" && value) {
            const material = materiales.find((m) => m._id === updated.material_id)
            if (material && material.proveedores) {
              // Buscar el precio de la variante en los proveedores del material
              for (const proveedor of material.proveedores) {
                if (proveedor.variantes_precios) {
                  const variantePrecio = proveedor.variantes_precios.find((vp: any) => vp.variante_id === value)
                  if (variantePrecio) {
                    updated.precio_unitario = variantePrecio.precio || 0
                    break
                  }
                }
              }
            }
          }

          // Calcular área si se cambian las medidas
          if (field === "medidas") {
            updated.medidas.area = (value.ancho * value.alto) / 10000 // m²

            // Si usa cálculo automático, recalcular precio
            if (updated.usar_calculo_automatico && updated.precio_unitario > 0) {
              updated.precio_total = updated.medidas.area * updated.precio_unitario * updated.cantidad
            }
          }

          // Calcular precio total automáticamente
          if (field === "cantidad" || field === "precio_unitario") {
            if (updated.usar_calculo_automatico && updated.medidas.area > 0) {
              updated.precio_total = updated.medidas.area * updated.precio_unitario * updated.cantidad
            } else {
              updated.precio_total = updated.cantidad * updated.precio_unitario
            }
          }

          return updated
        }
        return item
      }),
    )
  }

  const actualizarMedidas = (index: number, campo: string, valor: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const nuevasMedidas = { ...item.medidas, [campo]: valor }
          nuevasMedidas.area = (nuevasMedidas.ancho * nuevasMedidas.alto) / 10000 // m²

          const updated = { ...item, medidas: nuevasMedidas }

          // Recalcular precio si usa cálculo automático
          if (updated.usar_calculo_automatico && updated.precio_unitario > 0) {
            updated.precio_total = nuevasMedidas.area * updated.precio_unitario * updated.cantidad
          }

          return updated
        }
        return item
      }),
    )
  }

  const agregarMaterialInformativo = (itemIndex: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === itemIndex) {
          return {
            ...item,
            materiales_informativos: [
              ...item.materiales_informativos,
              {
                id: Date.now(),
                material_id: "",
                nombre: "",
                cantidad: 1,
                precio_unitario: 0,
                precio_total: 0,
              },
            ],
          }
        }
        return item
      }),
    )
  }

  const actualizarMaterialInformativo = (itemIndex: number, materialIndex: number, campo: string, valor: any) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === itemIndex) {
          const nuevosMateriales = item.materiales_informativos.map((material, j) => {
            if (j === materialIndex) {
              const materialActualizado = { ...material, [campo]: valor }

              // Si se selecciona un material real, actualizar información
              if (campo === "material_id" && valor) {
                const materialReal = materiales.find((m) => m._id === valor)
                if (materialReal) {
                  materialActualizado.nombre = materialReal.nombre
                  materialActualizado.precio_unitario = materialReal.precio || 0

                  // Si el material tiene variantes, resetear el precio hasta que se seleccione una variante
                  if (materialReal.tiene_variantes) {
                    materialActualizado.precio_unitario = 0
                  }
                }
              }

              // Si se selecciona una variante, actualizar el precio según la variante
              if (campo === "variante_id" && valor) {
                const materialReal = materiales.find((m) => m._id === materialActualizado.material_id)
                if (materialReal && materialReal.proveedores) {
                  // Buscar el precio de la variante en los proveedores del material
                  for (const proveedor of materialReal.proveedores) {
                    if (proveedor.variantes_precios) {
                      const variantePrecio = proveedor.variantes_precios.find((vp: any) => vp.variante_id === valor)
                      if (variantePrecio) {
                        materialActualizado.precio_unitario = variantePrecio.precio || 0
                        break
                      }
                    }
                  }
                }
              }

              // Calcular precio total
              if (campo === "cantidad" || campo === "precio_unitario") {
                materialActualizado.precio_total = materialActualizado.cantidad * materialActualizado.precio_unitario
              }

              return materialActualizado
            }
            return material
          })

          return { ...item, materiales_informativos: nuevosMateriales }
        }
        return item
      }),
    )
  }

  const eliminarMaterialInformativo = (itemIndex: number, materialIndex: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === itemIndex) {
          return {
            ...item,
            materiales_informativos: item.materiales_informativos.filter((_, j) => j !== materialIndex),
          }
        }
        return item
      }),
    )
  }

  const calcularTotal = () => {
    return items.reduce((total, item) => total + item.precio_total, 0)
  }

  const agregarACotizacion = () => {
    // Validar que todos los items tengan descripción
    const itemsInvalidos = items.some((item) => !item.descripcion.trim())
    if (itemsInvalidos) {
      toast({
        title: "Error",
        description: "Todos los items deben tener una descripción",
        variant: "destructive",
      })
      return
    }

    const cotizacionLibre = {
      tipo: "libre",
      items: items
        .filter((item) => item.descripcion.trim())
        .map((item) => {
          const proveedor = proveedores.find((p) => p._id === item.proveedor_id)
          const material = materiales.find((m) => m._id === item.material_id)

          // Obtener variante según el tipo de material
          let variante = null
          if (item.variante_id) {
            if (item.material_tipo === "pvc") {
              variante = variantes.coloresPVC.find((v: any) => v._id === item.variante_id)
            } else if (item.material_tipo === "aluminio") {
              variante = variantes.coloresAluminio.find((v: any) => v._id === item.variante_id)
            } else if (item.material_tipo === "vidrio") {
              variante = variantes.tiposVidrio.find((v: any) => v._id === item.variante_id)
            }
          }

          return {
            ...item,
            proveedor: proveedor
              ? {
                  id: proveedor._id,
                  nombre: proveedor.nombre,
                  contacto: proveedor.contacto,
                  tipoMateriales: proveedor.tipoMateriales,
                }
              : null,
            material: material
              ? {
                  id: material._id,
                  nombre: material.nombre,
                  categoria: material.categoria,
                  precio_base: material.precio,
                }
              : null,
            variante: variante
              ? {
                  id: variante._id,
                  nombre: variante.nombre,
                  tipo: item.material_tipo,
                }
              : null,
          }
        }),
      total: calcularTotal(),
    }

    onAgregarCotizacion(cotizacionLibre)
    resetForm()

    toast({
      title: "Cotización agregada",
      description: "La cotización libre ha sido agregada correctamente",
    })
  }

  const resetForm = () => {
    setItems([
      {
        id: Date.now(),
        descripcion: "",
        cantidad: 1,
        precio_unitario: 0,
        precio_total: 0,
        proveedor_id: "",
        material_id: "",
        material_tipo: "",
        variante_id: "",
        materiales_informativos: [],
        usar_calculo_automatico: false,
        medidas: {
          ancho: 0,
          alto: 0,
          area: 0,
        },
        notas: "",
      },
    ])
  }

  const proveedoresFiltrados = (materialTipo: string, busqueda = "") => {
    let filtrados = proveedores

    // Filtrar por tipo de material si se especifica
    if (materialTipo) {
      filtrados = filtrados.filter((proveedor) => {
        return proveedor.tipoMateriales?.some(
          (tipo: string) =>
            tipo.toLowerCase().includes(materialTipo) ||
            (materialTipo === "pvc" && tipo.toLowerCase().includes("pvc")) ||
            (materialTipo === "aluminio" && tipo.toLowerCase().includes("aluminio")) ||
            (materialTipo === "vidrio" && tipo.toLowerCase().includes("vidrio")),
        )
      })
    }

    // Filtrar por búsqueda si se especifica
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase()
      filtrados = filtrados.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(busquedaLower) ||
          p.contacto?.toLowerCase().includes(busquedaLower) ||
          p.ciudad?.toLowerCase().includes(busquedaLower),
      )
    }

    return filtrados
  }

  const materialesFiltrados = (busqueda = "") => {
    if (!busqueda) return materiales

    const busquedaLower = busqueda.toLowerCase()
    return materiales.filter(
      (m) => m.nombre?.toLowerCase().includes(busquedaLower) || m.categoria?.toLowerCase().includes(busquedaLower),
    )
  }

  const getVariantesPorTipoMaterial = (tipoMaterial: string) => {
    if (tipoMaterial === "pvc") {
      return variantes.coloresPVC || []
    } else if (tipoMaterial === "aluminio") {
      return variantes.coloresAluminio || []
    } else if (tipoMaterial === "vidrio") {
      return variantes.tiposVidrio || []
    }
    return []
  }

  const getEtiquetaVariante = (tipoMaterial: string) => {
    if (tipoMaterial === "pvc") {
      return "Color PVC"
    } else if (tipoMaterial === "aluminio") {
      return "Color Aluminio"
    } else if (tipoMaterial === "vidrio") {
      return "Tipo de Vidrio"
    }
    return "Variante"
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando datos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          Cotización Libre
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Items */}
        <div className="space-y-6">
          {items.map((item, index) => {
            const variantesPorTipo = getVariantesPorTipoMaterial(item.material_tipo)
            const etiquetaVariante = getEtiquetaVariante(item.material_tipo)

            return (
              <Card key={item.id} className="border-dashed">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="font-medium text-lg">Item #{index + 1}</Label>
                    {items.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => eliminarItem(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="general">General</TabsTrigger>
                      <TabsTrigger value="materiales">Materiales</TabsTrigger>
                      <TabsTrigger value="detalles">Detalles</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                      {/* Información básica */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Descripción</Label>
                          <Textarea
                            value={item.descripcion}
                            onChange={(e) => actualizarItem(index, "descripcion", e.target.value)}
                            placeholder="Descripción del producto o servicio"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Cantidad</Label>
                          <Input
                            type="number"
                            min="1"
                            step="0.01"
                            value={item.cantidad}
                            onChange={(e) => actualizarItem(index, "cantidad", Number(e.target.value))}
                          />
                        </div>
                      </div>

                      {/* Cálculo de precio */}
                      <div className="border-t pt-4 mb-4">
                        <div className="flex items-center space-x-4 mb-4">
                          <Switch
                            id={`calculo_auto_${index}`}
                            checked={item.usar_calculo_automatico}
                            onCheckedChange={(checked) => actualizarItem(index, "usar_calculo_automatico", checked)}
                          />
                          <Label htmlFor={`calculo_auto_${index}`}>Usar cálculo automático basado en medidas</Label>
                        </div>

                        {item.usar_calculo_automatico ? (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <Label>Ancho (cm)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.medidas.ancho}
                                onChange={(e) => actualizarMedidas(index, "ancho", Number(e.target.value))}
                              />
                            </div>
                            <div>
                              <Label>Alto (cm)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.medidas.alto}
                                onChange={(e) => actualizarMedidas(index, "alto", Number(e.target.value))}
                              />
                            </div>
                            <div>
                              <Label>Área (m²)</Label>
                              <Input value={item.medidas.area.toFixed(4)} disabled className="bg-gray-50" />
                            </div>
                            <div>
                              <Label>Precio por m² (L)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.precio_unitario}
                                onChange={(e) => actualizarItem(index, "precio_unitario", Number(e.target.value))}
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Label>Precio Unitario (L)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.precio_unitario}
                              onChange={(e) => actualizarItem(index, "precio_unitario", Number(e.target.value))}
                            />
                          </div>
                        )}
                      </div>

                      {/* Total del item */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total del Item:</span>
                          <span className="text-lg font-bold text-primary">L {item.precio_total.toFixed(2)}</span>
                        </div>
                        {item.usar_calculo_automatico && item.medidas.area > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.medidas.area.toFixed(4)} m² × L {item.precio_unitario} × {item.cantidad} = L{" "}
                            {item.precio_total.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="materiales">
                      <div className="space-y-4">
                        {/* Material principal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="flex items-center">
                              <Tag className="w-4 h-4 mr-2" />
                              Material
                            </Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                              </div>
                              <Input
                                className="pl-10"
                                placeholder="Buscar material..."
                                value={filtroMateriales}
                                onChange={(e) => setFiltroMateriales(e.target.value)}
                              />
                            </div>
                            <Select
                              value={item.material_id}
                              onValueChange={(value) => actualizarItem(index, "material_id", value)}
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Seleccionar material" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Sin material específico</SelectItem>
                                {materialesFiltrados(filtroMateriales).map((material) => (
                                  <SelectItem key={material._id} value={material._id}>
                                    <div>
                                      <div className="font-medium">{material.nombre}</div>
                                      <div className="text-xs text-gray-500">{material.categoria}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="flex items-center">
                              <Package className="w-4 h-4 mr-2" />
                              Proveedor
                            </Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                              </div>
                              <Input
                                className="pl-10"
                                placeholder="Buscar proveedor..."
                                value={filtroProveedores}
                                onChange={(e) => setFiltroProveedores(e.target.value)}
                              />
                            </div>
                            <Select
                              value={item.proveedor_id}
                              onValueChange={(value) => actualizarItem(index, "proveedor_id", value)}
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Seleccionar proveedor" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Sin proveedor específico</SelectItem>
                                {proveedoresFiltrados(item.material_tipo, filtroProveedores).map((proveedor) => (
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
                        </div>

                        {/* Variante si aplica */}
                        {variantesPorTipo.length > 0 && (
                          <div>
                            <Label className="flex items-center">
                              <Palette className="w-4 h-4 mr-2" />
                              {etiquetaVariante}
                            </Label>
                            <Select
                              value={item.variante_id}
                              onValueChange={(value) => actualizarItem(index, "variante_id", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`Seleccionar ${etiquetaVariante.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {variantesPorTipo.map((variante: any) => (
                                  <SelectItem key={variante._id} value={variante._id}>
                                    <div className="flex items-center">
                                      {variante.color && (
                                        <div
                                          className="w-4 h-4 rounded-full mr-2 border"
                                          style={{ backgroundColor: variante.color }}
                                        />
                                      )}
                                      {variante.nombre}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Materiales informativos */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <Label className="font-medium">Materiales Informativos</Label>
                            <Button variant="outline" size="sm" onClick={() => agregarMaterialInformativo(index)}>
                              <Plus className="w-4 h-4 mr-2" />
                              Agregar Material
                            </Button>
                          </div>

                          {item.materiales_informativos.length === 0 ? (
                            <div className="text-gray-500 text-center py-4 border rounded-lg">
                              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p>No hay materiales informativos agregados</p>
                              <p className="text-xs mt-1">Agregue materiales para detallar componentes del ítem</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {item.materiales_informativos.map((material, materialIndex) => (
                                <div
                                  key={material.id}
                                  className="grid grid-cols-1 md:grid-cols-5 gap-2 p-2 border rounded"
                                >
                                  <div>
                                    <Select
                                      value={material.material_id}
                                      onValueChange={(value) =>
                                        actualizarMaterialInformativo(index, materialIndex, "material_id", value)
                                      }
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Material" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {materiales.map((mat) => (
                                          <SelectItem key={mat._id} value={mat._id}>
                                            {mat.nombre}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Input
                                      value={material.nombre}
                                      onChange={(e) =>
                                        actualizarMaterialInformativo(index, materialIndex, "nombre", e.target.value)
                                      }
                                      placeholder="Nombre"
                                      className="h-8"
                                    />
                                  </div>
                                  <div>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={material.cantidad}
                                      onChange={(e) =>
                                        actualizarMaterialInformativo(
                                          index,
                                          materialIndex,
                                          "cantidad",
                                          Number(e.target.value),
                                        )
                                      }
                                      placeholder="Cantidad"
                                      className="h-8"
                                    />
                                  </div>
                                  <div>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={material.precio_unitario}
                                      onChange={(e) =>
                                        actualizarMaterialInformativo(
                                          index,
                                          materialIndex,
                                          "precio_unitario",
                                          Number(e.target.value),
                                        )
                                      }
                                      placeholder="Precio"
                                      className="h-8"
                                    />
                                  </div>
                                  <div className="flex items-center">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => eliminarMaterialInformativo(index, materialIndex)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <Badge variant="outline" className="ml-2">
                                      L {material.precio_total.toFixed(2)}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="detalles">
                      <div className="space-y-4">
                        <div>
                          <Label className="flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Notas Adicionales
                          </Label>
                          <Textarea
                            value={item.notas}
                            onChange={(e) => actualizarItem(index, "notas", e.target.value)}
                            placeholder="Especificaciones adicionales, instrucciones, etc."
                            rows={4}
                          />
                        </div>

                        {item.usar_calculo_automatico && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center mb-2">
                              <Ruler className="w-4 h-4 mr-2 text-blue-600" />
                              <span className="font-medium text-blue-800">Cálculo por Dimensiones</span>
                            </div>
                            <p className="text-sm text-blue-700">
                              Este ítem usa cálculo automático basado en dimensiones. El precio total se calcula
                              multiplicando el área (ancho × alto) por el precio por m².
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Agregar Item */}
        <Button variant="outline" onClick={agregarItem} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Item
        </Button>

        {/* Total General */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total General:</span>
              <span className="text-2xl font-bold text-primary">L {calcularTotal().toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={resetForm}>
            Limpiar
          </Button>
          <Button onClick={agregarACotizacion} disabled={items.length === 0 || calcularTotal() === 0}>
            Agregar a Cotización
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
</ === 0}>
            Agregar a Cotización
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
