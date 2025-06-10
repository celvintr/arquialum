"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, User, Building } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ClienteSelectorProps {
  onClienteSeleccionado: (cliente: any) => void
  clienteSeleccionado?: any
}

export default function ClienteSelector({ onClienteSeleccionado, clienteSeleccionado }: ClienteSelectorProps) {
  const { toast } = useToast()
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [creandoCliente, setCreandoCliente] = useState(false)

  // Formulario nuevo cliente
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    tipo: "particular",
  })

  useEffect(() => {
    cargarClientes()
  }, [])

  const cargarClientes = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/clientes")
      const data = await response.json()

      if (data.clientes) {
        setClientes(data.clientes)
      }
    } catch (error) {
      console.error("Error cargando clientes:", error)
    } finally {
      setLoading(false)
    }
  }

  const clientesFiltrados = clientes.filter(
    (cliente: any) =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCrearCliente = async () => {
    try {
      setCreandoCliente(true)

      if (!nuevoCliente.nombre || !nuevoCliente.email) {
        toast({
          title: "Error",
          description: "Nombre y email son requeridos",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoCliente),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Cliente creado",
          description: "El cliente ha sido creado exitosamente",
        })

        // Agregar el nuevo cliente a la lista
        setClientes((prev) => [data, ...prev])

        // Seleccionar automáticamente el nuevo cliente
        onClienteSeleccionado(data)

        // Limpiar formulario y cerrar modal
        setNuevoCliente({
          nombre: "",
          email: "",
          telefono: "",
          direccion: "",
          ciudad: "",
          tipo: "particular",
        })
        setIsModalOpen(false)
      } else {
        throw new Error(data.error || "Error al crear cliente")
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el cliente",
        variant: "destructive",
      })
    } finally {
      setCreandoCliente(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium">Cliente</Label>
        <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Cliente seleccionado */}
      {clienteSeleccionado && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {clienteSeleccionado.tipo === "empresa" ? (
                  <Building className="w-5 h-5 text-blue-600" />
                ) : (
                  <User className="w-5 h-5 text-green-600" />
                )}
                <div>
                  <div className="font-medium">{clienteSeleccionado.nombre}</div>
                  <div className="text-sm text-gray-500">{clienteSeleccionado.email}</div>
                </div>
              </div>
              <Badge variant="outline">{clienteSeleccionado.tipo}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Búsqueda de clientes */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar cliente por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lista de clientes */}
        {searchTerm && (
          <div className="max-h-60 overflow-y-auto border rounded-md">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No se encontraron clientes</div>
            ) : (
              clientesFiltrados.map((cliente: any) => (
                <div
                  key={cliente._id}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => {
                    onClienteSeleccionado(cliente)
                    setSearchTerm("")
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {cliente.tipo === "empresa" ? (
                        <Building className="w-4 h-4 text-blue-600" />
                      ) : (
                        <User className="w-4 h-4 text-green-600" />
                      )}
                      <div>
                        <div className="font-medium">{cliente.nombre}</div>
                        <div className="text-sm text-gray-500">{cliente.email}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {cliente.tipo}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal Crear Cliente */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={nuevoCliente.nombre}
                  onChange={(e) => setNuevoCliente((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={nuevoCliente.email}
                  onChange={(e) => setNuevoCliente((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={nuevoCliente.telefono}
                  onChange={(e) => setNuevoCliente((prev) => ({ ...prev, telefono: e.target.value }))}
                  placeholder="123-456-7890"
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={nuevoCliente.tipo}
                  onValueChange={(value) => setNuevoCliente((prev) => ({ ...prev, tipo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particular">Particular</SelectItem>
                    <SelectItem value="empresa">Empresa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={nuevoCliente.direccion}
                onChange={(e) => setNuevoCliente((prev) => ({ ...prev, direccion: e.target.value }))}
                placeholder="Dirección completa"
              />
            </div>

            <div>
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                value={nuevoCliente.ciudad}
                onChange={(e) => setNuevoCliente((prev) => ({ ...prev, ciudad: e.target.value }))}
                placeholder="Ciudad"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCrearCliente} disabled={creandoCliente}>
              {creandoCliente ? "Creando..." : "Crear Cliente"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
