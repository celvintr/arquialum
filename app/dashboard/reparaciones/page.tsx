"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Wrench, DollarSign, Clock, Edit, Trash2, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export default function ReparacionesPage() {
  const { toast } = useToast()
  const [reparaciones, setReparaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editandoReparacion, setEditandoReparacion] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    precio_base: 0,
    tiempo_estimado: 0,
    activo: true,
  })

  useEffect(() => {
    cargarReparaciones()
  }, [])

  const cargarReparaciones = async () => {
    try {
      const response = await fetch("/api/reparaciones")
      const data = await response.json()

      if (data.success) {
        setReparaciones(data.reparaciones || [])
      }
    } catch (error) {
      console.error("Error cargando reparaciones:", error)
    } finally {
      setLoading(false)
    }
  }

  const reparacionesFiltradas = reparaciones.filter(
    (reparacion: any) =>
      reparacion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reparacion.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reparacion.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = async () => {
    try {
      if (!formData.nombre || !formData.categoria || formData.precio_base <= 0) {
        toast({
          title: "Error",
          description: "Completa todos los campos requeridos",
          variant: "destructive",
        })
        return
      }

      const url = editandoReparacion ? `/api/reparaciones/${editandoReparacion._id}` : "/api/reparaciones"

      const method = editandoReparacion ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: editandoReparacion ? "Reparación actualizada" : "Reparación creada",
          description: `La reparación ha sido ${editandoReparacion ? "actualizada" : "creada"} exitosamente`,
        })
        cerrarModal()
        cargarReparaciones()
      } else {
        throw new Error("Error al guardar reparación")
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la reparación",
        variant: "destructive",
      })
    }
  }

  const handleEditar = (reparacion: any) => {
    setEditandoReparacion(reparacion)
    setFormData({
      nombre: reparacion.nombre,
      descripcion: reparacion.descripcion || "",
      categoria: reparacion.categoria,
      precio_base: reparacion.precio_base,
      tiempo_estimado: reparacion.tiempo_estimado || 0,
      activo: reparacion.activo,
    })
    setIsModalOpen(true)
  }

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta reparación?")) return

    try {
      const response = await fetch(`/api/reparaciones/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Reparación eliminada",
          description: "La reparación ha sido eliminada exitosamente",
        })
        cargarReparaciones()
      } else {
        throw new Error("Error al eliminar reparación")
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la reparación",
        variant: "destructive",
      })
    }
  }

  const cerrarModal = () => {
    setIsModalOpen(false)
    setEditandoReparacion(null)
    setFormData({
      nombre: "",
      descripcion: "",
      categoria: "",
      precio_base: 0,
      tiempo_estimado: 0,
      activo: true,
    })
  }

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(precio)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reparaciones</h1>
          <p className="text-gray-600">Gestiona los tipos de reparaciones disponibles</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Reparación
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reparaciones</p>
                <p className="text-2xl font-bold">{reparaciones.length}</p>
              </div>
              <Wrench className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-2xl font-bold">{reparaciones.filter((r: any) => r.activo).length}</p>
              </div>
              <Badge className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
                <p className="text-2xl font-bold">
                  {formatearPrecio(
                    reparaciones.reduce((sum: number, r: any) => sum + (r.precio_base || 0), 0) /
                      (reparaciones.length || 1),
                  )}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    reparaciones.reduce((sum: number, r: any) => sum + (r.tiempo_estimado || 0), 0) /
                      (reparaciones.length || 1),
                  )}{" "}
                  min
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar reparaciones por nombre, categoría o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Reparaciones */}
      <Card>
        <CardContent className="p-0">
          {reparacionesFiltradas.length === 0 ? (
            <div className="p-6 text-center">
              <Wrench className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay reparaciones</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? "No se encontraron reparaciones con ese término"
                  : "Comienza agregando una nueva reparación"}
              </p>
              <Button onClick={() => setIsModalOpen(true)} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Reparación
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio Base</TableHead>
                  <TableHead>Tiempo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reparacionesFiltradas.map((reparacion: any) => (
                  <TableRow key={reparacion._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reparacion.nombre}</div>
                        <div className="text-sm text-gray-500">{reparacion.descripcion}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{reparacion.categoria}</Badge>
                    </TableCell>
                    <TableCell>{formatearPrecio(reparacion.precio_base || 0)}</TableCell>
                    <TableCell>{reparacion.tiempo_estimado || 0} min</TableCell>
                    <TableCell>
                      <Badge variant={reparacion.activo ? "default" : "secondary"}>
                        {reparacion.activo ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditar(reparacion)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEliminar(reparacion._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal Crear/Editar Reparación */}
      <Dialog open={isModalOpen} onOpenChange={cerrarModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editandoReparacion ? "Editar" : "Nueva"} Reparación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Cambio de vidrio"
              />
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción detallada de la reparación"
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
                    <SelectItem value="Vidrio">Vidrio</SelectItem>
                    <SelectItem value="Herrajes">Herrajes</SelectItem>
                    <SelectItem value="Perfiles">Perfiles</SelectItem>
                    <SelectItem value="Sellado">Sellado</SelectItem>
                    <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="precio">Precio Base *</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  value={formData.precio_base}
                  onChange={(e) => setFormData((prev) => ({ ...prev, precio_base: Number(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tiempo">Tiempo Estimado (minutos)</Label>
              <Input
                id="tiempo"
                type="number"
                value={formData.tiempo_estimado}
                onChange={(e) => setFormData((prev) => ({ ...prev, tiempo_estimado: Number(e.target.value) }))}
                placeholder="60"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>{editandoReparacion ? "Actualizar" : "Crear"} Reparación</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
