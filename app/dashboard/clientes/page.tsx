"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  Phone,
  Mail,
  MapPin,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import CrearClienteModal from "@/components/clientes/CrearClienteModal"
import EditarClienteModal from "@/components/clientes/EditarClienteModal"
import { useToast } from "@/components/ui/use-toast"

interface Cliente {
  _id: string
  nombre: string
  email: string
  telefono: string
  direccion: string
  ciudad: string
  tipo: string
  rtn?: string
  contacto_principal?: string
  activo?: boolean
}

export default function ClientesPage() {
  const { toast } = useToast()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCrearModalOpen, setIsCrearModalOpen] = useState(false)
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)

  // Paginación
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 12

  const cargarClientes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: searchTerm,
      })

      console.log("🔍 Cargando clientes con params:", params.toString())

      const response = await fetch(`/api/clientes?${params}`)
      const data = await response.json()

      console.log("📦 Respuesta clientes:", data)

      if (data.success && data.clientes) {
        setClientes(data.clientes)
        setTotal(data.pagination?.total || 0)
        setTotalPages(Math.ceil((data.pagination?.total || 0) / limit))
        console.log(`✅ ${data.clientes.length} clientes cargados`)
      } else {
        console.error("❌ Error en respuesta:", data)
        setClientes([])
      }
    } catch (error) {
      console.error("❌ Error cargando clientes:", error)
      setClientes([])
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarClientes()
  }, [page, searchTerm])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleClienteCreado = () => {
    setIsCrearModalOpen(false)
    cargarClientes()
    toast({
      title: "Éxito",
      description: "Cliente creado correctamente",
    })
  }

  const handleClienteActualizado = () => {
    setIsEditarModalOpen(false)
    setClienteSeleccionado(null)
    cargarClientes()
    toast({
      title: "Éxito",
      description: "Cliente actualizado correctamente",
    })
  }

  const handleEditar = (cliente: Cliente) => {
    setClienteSeleccionado(cliente)
    setIsEditarModalOpen(true)
  }

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return

    try {
      console.log("🗑️ Eliminando cliente:", id)

      const response = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()
      console.log("📦 Respuesta eliminar:", data)

      if (data.success) {
        cargarClientes()
        toast({
          title: "Éxito",
          description: "Cliente eliminado correctamente",
        })
      } else {
        throw new Error(data.error || "Error al eliminar")
      }
    } catch (error: any) {
      console.error("❌ Error al eliminar:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el cliente",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Clientes</h1>
          <p className="text-muted-foreground">Administra la información de tus clientes</p>
        </div>
        <Button onClick={() => setIsCrearModalOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card dark:bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clientes</p>
                <p className="text-2xl font-bold text-foreground">{total}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card dark:bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Particulares</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {clientes.filter((c) => c.tipo === "particular").length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card dark:bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Empresas</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {clientes.filter((c) => c.tipo === "empresa").length}
                </p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card dark:bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Página</p>
                <p className="text-2xl font-bold text-foreground">
                  {page} de {totalPages}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                {(page - 1) * limit + 1}-{Math.min(page * limit, total)} de {total}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card className="bg-card dark:bg-card">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar clientes por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-background dark:bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      {clientes.length === 0 ? (
        <Card className="bg-card dark:bg-card">
          <CardContent className="pt-6 text-center py-12">
            <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No hay clientes</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? "No se encontraron clientes con ese término" : "Comienza agregando un nuevo cliente"}
            </p>
            <Button onClick={() => setIsCrearModalOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientes.map((cliente) => (
            <Card
              key={cliente._id}
              className="bg-card dark:bg-card hover:shadow-lg transition-all duration-200 border-border dark:border-border"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-foreground">{cliente.nombre}</h3>
                      <Badge variant={cliente.tipo === "particular" ? "default" : "secondary"}>
                        {cliente.tipo === "particular" ? "Particular" : "Empresa"}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">{cliente.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{cliente.telefono}</span>
                      </div>
                      {cliente.ciudad && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{cliente.ciudad}</span>
                        </div>
                      )}
                    </div>

                    {cliente.direccion && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{cliente.direccion}</p>
                    )}

                    {cliente.tipo === "empresa" && cliente.rtn && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">RTN:</span> {cliente.rtn}
                        </p>
                        {cliente.contacto_principal && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Contacto:</span> {cliente.contacto_principal}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-1 ml-4">
                    <Button variant="ghost" size="icon" onClick={() => handleEditar(cliente)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEliminar(cliente._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <Card className="bg-card dark:bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total} clientes
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modales */}
      <CrearClienteModal
        isOpen={isCrearModalOpen}
        onClose={() => setIsCrearModalOpen(false)}
        onClienteCreado={handleClienteCreado}
      />

      {clienteSeleccionado && (
        <EditarClienteModal
          isOpen={isEditarModalOpen}
          onClose={() => {
            setIsEditarModalOpen(false)
            setClienteSeleccionado(null)
          }}
          onClienteActualizado={handleClienteActualizado}
          cliente={clienteSeleccionado}
        />
      )}
    </div>
  )
}
