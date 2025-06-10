"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Filter, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import MaterialesTable from "@/components/materiales/MaterialesTable"
import CrearMaterialModal from "@/components/materiales/CrearMaterialModal"
import EditarMaterialModal from "@/components/materiales/EditarMaterialModal"
import GestionVariantesModal from "@/components/materiales/GestionVariantesModal"

export default function MaterialesPage() {
  const { toast } = useToast()
  const [materiales, setMateriales] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("")

  // Estados de modales
  const [showCrearModal, setShowCrearModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [showVariantesModal, setShowVariantesModal] = useState(false)
  const [materialSeleccionado, setMaterialSeleccionado] = useState(null)

  useEffect(() => {
    console.log("🔄 Componente MaterialesPage montado, cargando materiales...")
    cargarMateriales()
  }, [])

  const cargarMateriales = async () => {
    try {
      setLoading(true)
      console.log("📡 Cargando materiales desde API...")

      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (categoriaFiltro) params.append("categoria", categoriaFiltro)

      const response = await fetch(`/api/materiales?${params.toString()}`)
      const data = await response.json()

      console.log("📡 Respuesta de materiales:", data)

      if (data.success) {
        console.log("✅ Materiales cargados exitosamente:", data.materiales?.length || 0)
        setMateriales(data.materiales || [])

        if (data.materiales?.length === 0) {
          toast({
            title: "Sin materiales",
            description: "No se encontraron materiales con los filtros aplicados",
          })
        }
      } else {
        throw new Error(data.error || "Error cargando materiales")
      }
    } catch (error) {
      console.error("❌ Error cargando materiales:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los materiales",
        variant: "destructive",
      })
      setMateriales([])
    } finally {
      setLoading(false)
    }
  }

  const handleBuscar = () => {
    console.log("🔍 Ejecutando búsqueda con término:", searchTerm, "y categoría:", categoriaFiltro)
    cargarMateriales()
  }

  const handleLimpiarFiltros = () => {
    console.log("🧹 Limpiando filtros de búsqueda")
    setSearchTerm("")
    setCategoriaFiltro("")
    // Recargar sin filtros
    setTimeout(() => cargarMateriales(), 100)
  }

  const handleCrearMaterial = () => {
    console.log("➕ Abriendo modal para crear material")
    setShowCrearModal(true)
  }

  const handleEditarMaterial = (material: any) => {
    console.log("✏️ Abriendo modal para editar material:", material.nombre)
    setMaterialSeleccionado(material)
    setShowEditarModal(true)
  }

  const handleGestionarVariantes = (material: any) => {
    console.log("🎨 Abriendo modal para gestionar variantes del material:", material.nombre)
    setMaterialSeleccionado(material)
    setShowVariantesModal(true)
  }

  const handleMaterialCreado = () => {
    console.log("✅ Material creado, recargando lista...")
    toast({
      title: "¡Material creado!",
      description: "El material ha sido agregado exitosamente",
    })
    cargarMateriales()
  }

  const handleMaterialActualizado = () => {
    console.log("✅ Material actualizado, recargando lista...")
    toast({
      title: "¡Material actualizado!",
      description: "Los cambios han sido guardados exitosamente",
    })
    cargarMateriales()
  }

  const cerrarModales = () => {
    console.log("❌ Cerrando todos los modales")
    setShowCrearModal(false)
    setShowEditarModal(false)
    setShowVariantesModal(false)
    setMaterialSeleccionado(null)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Materiales</h1>
          <p className="text-gray-600">Administra el catálogo de materiales y sus proveedores</p>
        </div>
        <Button onClick={handleCrearMaterial} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Material
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Buscar por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleBuscar()}
              />
            </div>
            <div>
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="Perfil PVC">Perfil PVC</SelectItem>
                  <SelectItem value="Perfil Aluminio">Perfil Aluminio</SelectItem>
                  <SelectItem value="Vidrio">Vidrio</SelectItem>
                  <SelectItem value="Herrajes">Herrajes</SelectItem>
                  <SelectItem value="Selladores">Selladores</SelectItem>
                  <SelectItem value="Accesorios">Accesorios</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleBuscar} variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
              <Button onClick={handleLimpiarFiltros} variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Limpiar
              </Button>
              <Button onClick={cargarMateriales} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Materiales */}
      <MaterialesTable
        materiales={materiales}
        loading={loading}
        onEditarMaterial={handleEditarMaterial}
        onGestionarVariantes={handleGestionarVariantes}
        onActualizar={cargarMateriales}
      />

      {/* Modales */}
      <CrearMaterialModal isOpen={showCrearModal} onClose={cerrarModales} onMaterialCreado={handleMaterialCreado} />

      <EditarMaterialModal
        isOpen={showEditarModal}
        onClose={cerrarModales}
        material={materialSeleccionado}
        onActualizado={handleMaterialActualizado}
      />

      <GestionVariantesModal
        isOpen={showVariantesModal}
        onClose={cerrarModales}
        material={materialSeleccionado}
        onActualizado={handleMaterialActualizado}
      />
    </div>
  )
}
