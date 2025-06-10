"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Building, Phone, Mail, MapPin } from "lucide-react"
import CrearProveedorModal from "@/components/proveedores/CrearProveedorModal"
import { useToast } from "@/components/ui/use-toast"

interface Proveedor {
  _id: string
  nombre: string
  contacto: string
  telefono: string
  email: string
  direccion: string
  ciudad: string
  pais: string
  tipoMateriales: string[]
  descuentoGeneral: number
  isActive: boolean
}

export default function ProveedoresPage() {
  const { toast } = useToast()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCrearModalOpen, setIsCrearModalOpen] = useState(false)

  useEffect(() => {
    cargarProveedores()
  }, [])

  const cargarProveedores = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/proveedores")
      const data = await response.json()

      if (data.success) {
        setProveedores(data.proveedores || [])
      }
    } catch (error) {
      console.error("Error cargando proveedores:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los proveedores",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProveedorCreado = () => {
    setIsCrearModalOpen(false)
    cargarProveedores()
    toast({
      title: "Éxito",
      description: "Proveedor creado correctamente",
    })
  }

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este proveedor?")) return

    try {
      const response = await fetch(`/api/proveedores/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        cargarProveedores()
        toast({
          title: "Éxito",
          description: "Proveedor eliminado correctamente",
        })
      } else {
        throw new Error(data.error || "Error al eliminar")
      }
    } catch (error: any) {
      console.error("Error al eliminar:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el proveedor",
        variant: "destructive",
      })
    }
  }

  const proveedoresFiltrados = proveedores.filter(
    (proveedor) =>
      proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor.contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor.ciudad.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando proveedores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Proveedores</h1>
          <p className="text-muted-foreground">Administra la información de tus proveedores</p>
        </div>
        <Button onClick={() => setIsCrearModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Proveedores</p>
                <p className="text-2xl font-bold text-foreground">{proveedores.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Badge className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold text-foreground">{proveedores.filter((p) => p.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Search className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Filtrados</p>
                <p className="text-2xl font-bold text-foreground">{proveedoresFiltrados.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Ciudades</p>
                <p className="text-2xl font-bold text-foreground">{new Set(proveedores.map((p) => p.ciudad)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar proveedores por nombre, contacto o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Proveedores */}
      <div className="grid gap-4">
        {proveedoresFiltrados.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No hay proveedores</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No se encontraron proveedores con ese término" : "Comienza agregando un nuevo proveedor"}
              </p>
              <Button onClick={() => setIsCrearModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Proveedor
              </Button>
            </CardContent>
          </Card>
        ) : (
          proveedoresFiltrados.map((proveedor) => (
            <Card key={proveedor._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-foreground">{proveedor.nombre}</h3>
                      <Badge variant={proveedor.isActive ? "default" : "secondary"}>
                        {proveedor.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                      {proveedor.descuentoGeneral > 0 && (
                        <Badge variant="outline" className="text-green-600">
                          {proveedor.descuentoGeneral}% desc.
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{proveedor.telefono}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{proveedor.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {proveedor.ciudad}, {proveedor.pais}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Contacto:</strong> {proveedor.contacto}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Dirección:</strong> {proveedor.direccion}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {proveedor.tipoMateriales.map((tipo, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tipo}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEliminar(proveedor._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal */}
      <CrearProveedorModal
        isOpen={isCrearModalOpen}
        onClose={() => setIsCrearModalOpen(false)}
        onProveedorCreado={handleProveedorCreado}
      />
    </div>
  )
}
