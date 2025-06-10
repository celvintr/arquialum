"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2, Search, Filter, Package, Palette, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import EditarMaterialModal from "./EditarMaterialModal"
import GestionVariantesModal from "./GestionVariantesModal"

interface MaterialesTableProps {
  onEditarMaterial?: (material: any) => void
  onEliminarMaterial?: (materialId: string) => void
  refreshTrigger?: number
}

export default function MaterialesTable({
  onEditarMaterial,
  onEliminarMaterial,
  refreshTrigger,
}: MaterialesTableProps) {
  const { toast } = useToast()
  const [materiales, setMateriales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    busqueda: "",
    categoria: "all",
    activo: "all",
    conProveedores: "all",
    conVariantes: "all",
  })

  // Estados para modales
  const [materialEditando, setMaterialEditando] = useState<any>(null)
  const [materialVariantes, setMaterialVariantes] = useState<any>(null)

  useEffect(() => {
    cargarMateriales()
  }, [refreshTrigger])

  const cargarMateriales = async () => {
    try {
      setLoading(true)
      console.log("📡 Cargando materiales...")

      const response = await fetch("/api/materiales")
      const data = await response.json()

      if (data.success) {
        console.log("✅ Materiales cargados:", data.materiales?.length || 0)
        setMateriales(data.materiales || [])
      } else {
        console.error("❌ Error cargando materiales:", data.error)
        toast({
          title: "Error",
          description: data.error || "Error cargando materiales",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Error cargando materiales:", error)
      toast({
        title: "Error",
        description: "Error de conexión al cargar materiales",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar materiales
  const materialesFiltrados = materiales.filter((material) => {
    const cumpleBusqueda =
      !filtros.busqueda ||
      material.nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      material.categoria?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      material.descripcion?.toLowerCase().includes(filtros.busqueda.toLowerCase())

    const cumpleCategoria =
      !filtros.categoria || filtros.categoria === "all" || material.categoria === filtros.categoria

    const cumpleActivo =
      !filtros.activo ||
      filtros.activo === "all" ||
      (filtros.activo === "activo" && material.activo) ||
      (filtros.activo === "inactivo" && !material.activo)

    const cumpleProveedores =
      !filtros.conProveedores ||
      filtros.conProveedores === "all" ||
      (filtros.conProveedores === "con" && material.total_proveedores > 0) ||
      (filtros.conProveedores === "sin" && material.total_proveedores === 0)

    const cumpleVariantes =
      !filtros.conVariantes ||
      filtros.conVariantes === "all" ||
      (filtros.conVariantes === "con" && material.tiene_variantes) ||
      (filtros.conVariantes === "sin" && !material.tiene_variantes)

    return cumpleBusqueda && cumpleCategoria && cumpleActivo && cumpleProveedores && cumpleVariantes
  })

  const handleEditarMaterial = (material: any) => {
    console.log("✏️ Editando material:", material.nombre)
    setMaterialEditando(material)
    onEditarMaterial?.(material)
  }

  const handleEliminarMaterial = async (material: any) => {
    if (!confirm(`¿Estás seguro de eliminar el material "${material.nombre}"?`)) {
      return
    }

    try {
      console.log("🗑️ Eliminando material:", material.nombre)

      const response = await fetch(`/api/materiales/${material._id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log("✅ Material eliminado exitosamente")
        toast({
          title: "Material eliminado",
          description: `${material.nombre} ha sido eliminado`,
        })
        cargarMateriales() // Recargar la lista
        onEliminarMaterial?.(material._id)
      } else {
        throw new Error(result.error || "Error al eliminar material")
      }
    } catch (error) {
      console.error("❌ Error eliminando material:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el material",
        variant: "destructive",
      })
    }
  }

  const handleGestionarVariantes = (material: any) => {
    console.log("🎨 Gestionando variantes para:", material.nombre)
    setMaterialVariantes(material)
  }

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      categoria: "all",
      activo: "all",
      conProveedores: "all",
      conVariantes: "all",
    })
  }

  const obtenerCategorias = () => {
    const categorias = [...new Set(materiales.map((m) => m.categoria).filter(Boolean))]
    return categorias.sort()
  }

  const renderEstadoMaterial = (material: any) => {
    const problemas = []

    if (!material.activo) problemas.push("Inactivo")
    if (material.total_proveedores === 0) problemas.push("Sin proveedores")
    if (material.tiene_variantes && material.total_variantes === 0) problemas.push("Sin variantes configuradas")

    if (problemas.length === 0) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Completo
        </Badge>
      )
    }

    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        {problemas.length} problema{problemas.length > 1 ? "s" : ""}
      </Badge>
    )
  }

  const renderProveedorPrincipal = (material: any) => {
    if (!material.proveedor_principal) {
      return <span className="text-gray-400">Sin proveedor</span>
    }

    return (
      <div>
        <div className="font-medium">{material.proveedor_principal.proveedor_nombre || "Proveedor sin nombre"}</div>
        <div className="text-sm text-gray-500">
          L{material.proveedor_principal.precio_unitario || 0}
          {material.proveedor_principal.descuento > 0 && ` (-${material.proveedor_principal.descuento}%)`}
        </div>
      </div>
    )
  }

  const renderVariantes = (material: any) => {
    if (!material.tiene_variantes) {
      return <span className="text-gray-400">No aplica</span>
    }

    if (material.total_variantes === 0) {
      return (
        <Badge variant="outline" className="text-orange-600">
          Sin configurar
        </Badge>
      )
    }

    return (
      <Badge variant="secondary">
        {material.total_variantes} variante{material.total_variantes > 1 ? "s" : ""}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Cargando materiales...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Materiales ({materialesFiltrados.length})
            </div>
            <Button onClick={limpiarFiltros} variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Limpiar Filtros
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar materiales..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros((prev) => ({ ...prev, busqueda: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={filtros.categoria}
              onValueChange={(value) => setFiltros((prev) => ({ ...prev, categoria: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {obtenerCategorias().map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filtros.activo}
              onValueChange={(value) => setFiltros((prev) => ({ ...prev, activo: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filtros.conProveedores}
              onValueChange={(value) => setFiltros((prev) => ({ ...prev, conProveedores: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Proveedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="con">Con proveedores</SelectItem>
                <SelectItem value="sin">Sin proveedores</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filtros.conVariantes}
              onValueChange={(value) => setFiltros((prev) => ({ ...prev, conVariantes: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Variantes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="con">Con variantes</SelectItem>
                <SelectItem value="sin">Sin variantes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Unidad Prod.</TableHead>
                  <TableHead>Proveedor Principal</TableHead>
                  <TableHead>Variantes</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialesFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <Package className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-gray-500">No se encontraron materiales</p>
                        {Object.values(filtros).some((f) => f !== "all") && (
                          <Button onClick={limpiarFiltros} variant="outline" size="sm" className="mt-2">
                            Limpiar filtros
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  materialesFiltrados.map((material) => (
                    <TableRow key={material._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{material.nombre}</div>
                          {material.descripcion && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">{material.descripcion}</div>
                          )}
                          {material.nombres_secundarios && material.nombres_secundarios.length > 0 && (
                            <div className="text-xs text-blue-600 mt-1">
                              +{material.nombres_secundarios.length} nombre
                              {material.nombres_secundarios.length > 1 ? "s" : ""} alt.
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{material.categoria}</Badge>
                      </TableCell>
                      <TableCell>{material.unidad_medida}</TableCell>
                      <TableCell>
                        {material.unidad_medida_produccion ? (
                          <Badge variant="secondary" className="text-xs">
                            {material.unidad_medida_produccion}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">No definida</span>
                        )}
                      </TableCell>
                      <TableCell>{renderProveedorPrincipal(material)}</TableCell>
                      <TableCell>{renderVariantes(material)}</TableCell>
                      <TableCell>{renderEstadoMaterial(material)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {material.tiene_variantes && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGestionarVariantes(material)}
                              title="Gestionar variantes"
                            >
                              <Palette className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditarMaterial(material)}
                            title="Editar material"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEliminarMaterial(material)}
                            title="Eliminar material"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      {materialEditando && (
        <EditarMaterialModal
          isOpen={!!materialEditando}
          onClose={() => setMaterialEditando(null)}
          material={materialEditando}
          onActualizado={() => {
            cargarMateriales()
            setMaterialEditando(null)
          }}
        />
      )}

      {materialVariantes && (
        <GestionVariantesModal
          isOpen={!!materialVariantes}
          onClose={() => setMaterialVariantes(null)}
          material={materialVariantes}
          onActualizado={() => {
            cargarMateriales()
            setMaterialVariantes(null)
          }}
        />
      )}
    </>
  )
}
