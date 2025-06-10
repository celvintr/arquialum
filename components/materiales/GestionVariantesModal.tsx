"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface GestionVariantesModalProps {
  isOpen: boolean
  onClose: () => void
  material: any
  onActualizado?: () => void
}

export default function GestionVariantesModal({
  isOpen,
  onClose,
  material,
  onActualizado,
}: GestionVariantesModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [proveedores, setProveedores] = useState<any[]>([])
  const [variantes, setVariantes] = useState<any[]>([])
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("")
  const [tipoVariante, setTipoVariante] = useState("")
  const [preciosVariantes, setPreciosVariantes] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    if (isOpen && material) {
      console.log("🔄 Modal gestionar variantes abierto para material:", material)
      cargarDatos()
    }
  }, [isOpen, material])

  const cargarDatos = async () => {
    try {
      console.log("📡 Cargando datos para gestión de variantes...")
      await Promise.all([cargarProveedores(), cargarVariantes()])

      // Inicializar con el primer proveedor si existe
      if (material.proveedores && material.proveedores.length > 0) {
        const primerProveedor = material.proveedores[0]
        console.log("🔍 Primer proveedor encontrado:", primerProveedor)

        setProveedorSeleccionado(primerProveedor.proveedor_id)
        setTipoVariante(primerProveedor.tipo_variante || "pvc")

        // Cargar precios de variantes si existen
        if (primerProveedor.variantes_precios && Array.isArray(primerProveedor.variantes_precios)) {
          const precios: { [key: string]: number } = {}
          primerProveedor.variantes_precios.forEach((v: any) => {
            precios[v.variante_id] = v.precio_adicional
          })
          setPreciosVariantes(precios)
          console.log("💰 Precios de variantes cargados:", precios)
        }
      }
    } catch (error) {
      console.error("❌ Error cargando datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos necesarios",
        variant: "destructive",
      })
    }
  }

  const cargarProveedores = async () => {
    try {
      console.log("📡 Cargando proveedores del material...")

      // Primero verificamos si el material ya tiene proveedores
      if (material.proveedores && Array.isArray(material.proveedores)) {
        console.log("👥 Proveedores del material:", material.proveedores)

        // Enriquecer los datos de proveedores con nombres si están disponibles
        const proveedoresEnriquecidos = material.proveedores.map((p: any) => ({
          ...p,
          nombre: p.proveedor_nombre || "Proveedor sin nombre",
        }))

        setProveedores(proveedoresEnriquecidos)
      } else {
        console.log("⚠️ El material no tiene proveedores configurados")
        setProveedores([])
      }
    } catch (error) {
      console.error("❌ Error cargando proveedores:", error)
      toast({
        title: "Error",
        description: "Error al cargar los proveedores",
        variant: "destructive",
      })
    }
  }

  const cargarVariantes = async () => {
    try {
      console.log("📡 Cargando variantes disponibles...")
      const response = await fetch("/api/variantes")
      const data = await response.json()

      if (data.success) {
        console.log("✅ Variantes cargadas")
        setVariantes({
          pvc: data.coloresPVC || [],
          aluminio: data.coloresAluminio || [],
          vidrio: data.tiposVidrio || [],
        })
      } else {
        throw new Error(data.error || "Error al cargar variantes")
      }
    } catch (error) {
      console.error("❌ Error cargando variantes:", error)
      toast({
        title: "Error",
        description: "Error al cargar las variantes",
        variant: "destructive",
      })
    }
  }

  const handleProveedorChange = (proveedorId: string) => {
    console.log("🔄 Cambiando proveedor seleccionado a:", proveedorId)
    setProveedorSeleccionado(proveedorId)

    // Buscar el proveedor seleccionado
    const proveedor = proveedores.find((p) => p.proveedor_id === proveedorId)
    if (proveedor) {
      console.log("🔍 Proveedor encontrado:", proveedor)
      setTipoVariante(proveedor.tipo_variante || "pvc")

      // Cargar precios de variantes si existen
      if (proveedor.variantes_precios && Array.isArray(proveedor.variantes_precios)) {
        const precios: { [key: string]: number } = {}
        proveedor.variantes_precios.forEach((v: any) => {
          precios[v.variante_id] = v.precio_adicional
        })
        setPreciosVariantes(precios)
        console.log("💰 Precios de variantes cargados:", precios)
      } else {
        setPreciosVariantes({})
      }
    }
  }

  const handleTipoVarianteChange = (tipo: string) => {
    console.log("🔄 Cambiando tipo de variante a:", tipo)
    setTipoVariante(tipo)
  }

  const handlePrecioChange = (varianteId: string, precio: number) => {
    console.log("💰 Actualizando precio de variante:", { varianteId, precio })
    setPreciosVariantes((prev) => ({
      ...prev,
      [varianteId]: precio,
    }))
  }

  const limpiarPrecios = () => {
    console.log("🧹 Limpiando todos los precios de variantes")
    setPreciosVariantes({})
    toast({
      title: "Precios limpiados",
      description: "Se han eliminado todos los precios por variante",
    })
  }

  const handleGuardar = async () => {
    try {
      setLoading(true)
      console.log("💾 Guardando configuración de variantes...")

      if (!proveedorSeleccionado || !tipoVariante) {
        console.log("❌ Validación fallida: proveedor o tipo de variante no seleccionado")
        toast({
          title: "Error",
          description: "Selecciona un proveedor y un tipo de variante",
          variant: "destructive",
        })
        return
      }

      // Preparar datos para actualizar
      const proveedorActualizado = proveedores.find((p) => p.proveedor_id === proveedorSeleccionado)
      if (!proveedorActualizado) {
        throw new Error("Proveedor no encontrado")
      }

      // Convertir preciosVariantes a formato de array
      const variantesPreciosArray = Object.entries(preciosVariantes).map(([varianteId, precio]) => ({
        variante_id: varianteId,
        precio_adicional: precio,
      }))

      // Actualizar el proveedor con los nuevos datos
      proveedorActualizado.tipo_variante = tipoVariante
      proveedorActualizado.variantes_precios = variantesPreciosArray

      // Actualizar el material con los proveedores actualizados
      const proveedoresActualizados = proveedores.map((p) =>
        p.proveedor_id === proveedorSeleccionado ? proveedorActualizado : p,
      )

      const materialActualizado = {
        ...material,
        tiene_variantes: true,
        proveedores: proveedoresActualizados,
      }

      console.log("📝 Datos a enviar:", materialActualizado)

      // Enviar actualización al servidor
      const response = await fetch(`/api/materiales/${material._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(materialActualizado),
      })

      const result = await response.json()
      console.log("📡 Respuesta del servidor:", result)

      if (response.ok && result.success) {
        console.log("✅ Variantes actualizadas exitosamente")
        toast({
          title: "¡Variantes actualizadas!",
          description: "Las variantes han sido actualizadas exitosamente",
        })
        if (onActualizado) {
          console.log("🔄 Ejecutando callback onActualizado")
          onActualizado()
        }
        onClose()
      } else {
        throw new Error(result.error || "Error al actualizar variantes")
      }
    } catch (error) {
      console.error("❌ Error guardando variantes:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudieron guardar las variantes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEliminarMaterial = async () => {
    try {
      if (!confirm("¿Estás seguro de que deseas eliminar este material? Esta acción no se puede deshacer.")) {
        return
      }

      setLoading(true)
      console.log("🗑️ Eliminando material:", material._id)

      const response = await fetch(`/api/materiales/${material._id}`, {
        method: "DELETE",
      })

      const result = await response.json()
      console.log("📡 Respuesta del servidor:", result)

      if (response.ok && result.success) {
        console.log("✅ Material eliminado exitosamente")
        toast({
          title: "Material eliminado",
          description: "El material ha sido eliminado exitosamente",
        })
        if (onActualizado) {
          console.log("🔄 Ejecutando callback onActualizado")
          onActualizado()
        }
        onClose()
      } else {
        throw new Error(result.error || result.message || "Error al eliminar material")
      }
    } catch (error) {
      console.error("❌ Error eliminando material:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el material",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const obtenerVariantesPorTipo = () => {
    if (!tipoVariante || !variantes) return []
    return variantes[tipoVariante] || []
  }

  const obtenerNombreProveedor = (proveedorId: string) => {
    const proveedor = proveedores.find((p) => p.proveedor_id === proveedorId)
    return proveedor ? proveedor.nombre || proveedor.proveedor_nombre : "Proveedor no encontrado"
  }

  if (!material) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Gestionar Variantes - {material.nombre}</span>
            <Button variant="destructive" size="sm" onClick={handleEliminarMaterial} disabled={loading}>
              <Trash2 className="w-4 h-4 mr-1" /> Eliminar Material
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configuración */}
          <div>
            <h3 className="text-lg font-medium mb-4">Configuración</h3>

            <div className="space-y-4">
              <div>
                <Label>Proveedor</Label>
                <Select value={proveedorSeleccionado} onValueChange={handleProveedorChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.length > 0 ? (
                      proveedores.map((proveedor) => (
                        <SelectItem key={proveedor.proveedor_id} value={proveedor.proveedor_id}>
                          {proveedor.nombre || proveedor.proveedor_nombre || "Proveedor sin nombre"}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No hay proveedores disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipo de Variante</Label>
                <Select value={tipoVariante} onValueChange={handleTipoVarianteChange}>
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

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Material con variantes:</strong> Configura el precio adicional para cada variante.
                </p>
              </div>
            </div>
          </div>

          {/* Precios por Variante */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Precios por Variante</h3>
              <Button variant="outline" size="sm" onClick={limpiarPrecios} className="h-8 px-2 text-xs">
                <RefreshCw className="w-3 h-3 mr-1" />
                Limpiar Precios
              </Button>
            </div>

            <div className="space-y-3">
              {obtenerVariantesPorTipo().map((variante: any) => (
                <div key={variante._id} className="flex items-center justify-between">
                  <span>{variante.nombre}</span>
                  <div className="flex items-center gap-1">
                    <span>L</span>
                    <Input
                      type="number"
                      step="0.01"
                      className="w-24"
                      value={preciosVariantes[variante._id] || ""}
                      onChange={(e) => handlePrecioChange(variante._id, Number(e.target.value))}
                    />
                  </div>
                </div>
              ))}

              {obtenerVariantesPorTipo().length === 0 && (
                <p className="text-sm text-gray-500">No hay variantes disponibles para este tipo.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Variantes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
