"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { User, Building } from "lucide-react"

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
}

interface EditarClienteModalProps {
  isOpen: boolean
  onClose: () => void
  onClienteActualizado: () => void
  cliente: Cliente
}

export default function EditarClienteModal({
  isOpen,
  onClose,
  onClienteActualizado,
  cliente,
}: EditarClienteModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    tipo: "particular",
    rtn: "",
    contacto_principal: "",
  })

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || "",
        email: cliente.email || "",
        telefono: cliente.telefono || "",
        direccion: cliente.direccion || "",
        ciudad: cliente.ciudad || "",
        tipo: cliente.tipo || "particular",
        rtn: cliente.rtn || "",
        contacto_principal: cliente.contacto_principal || "",
      })
    }
  }, [cliente])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.email || !formData.telefono) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`/api/clientes/${cliente._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Éxito",
          description: "Cliente actualizado correctamente",
        })
        onClienteActualizado()
        onClose()
      } else {
        throw new Error(data.error || "Error al actualizar cliente")
      }
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el cliente",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card dark:bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center text-foreground">
            <User className="w-5 h-5 mr-2" />
            Editar Cliente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Cliente */}
          <div>
            <Label className="text-foreground">Tipo de Cliente *</Label>
            <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
              <SelectTrigger className="bg-background dark:bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="particular">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Particular
                  </div>
                </SelectItem>
                <SelectItem value="empresa">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    Empresa
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre" className="text-foreground">
                {formData.tipo === "empresa" ? "Nombre de la Empresa" : "Nombre Completo"} *
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                placeholder={formData.tipo === "empresa" ? "Empresa S.A." : "Juan Pérez"}
                className="bg-background dark:bg-background"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-foreground">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="cliente@email.com"
                className="bg-background dark:bg-background"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefono" className="text-foreground">
                Teléfono *
              </Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                placeholder="+504 9999-9999"
                className="bg-background dark:bg-background"
                required
              />
            </div>

            <div>
              <Label htmlFor="ciudad" className="text-foreground">
                Ciudad
              </Label>
              <Input
                id="ciudad"
                value={formData.ciudad}
                onChange={(e) => handleInputChange("ciudad", e.target.value)}
                placeholder="Tegucigalpa"
                className="bg-background dark:bg-background"
              />
            </div>
          </div>

          {/* Campos específicos para empresa */}
          {formData.tipo === "empresa" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rtn" className="text-foreground">
                  RTN
                </Label>
                <Input
                  id="rtn"
                  value={formData.rtn}
                  onChange={(e) => handleInputChange("rtn", e.target.value)}
                  placeholder="08011999123456"
                  className="bg-background dark:bg-background"
                />
              </div>

              <div>
                <Label htmlFor="contacto_principal" className="text-foreground">
                  Contacto Principal
                </Label>
                <Input
                  id="contacto_principal"
                  value={formData.contacto_principal}
                  onChange={(e) => handleInputChange("contacto_principal", e.target.value)}
                  placeholder="Nombre del contacto"
                  className="bg-background dark:bg-background"
                />
              </div>
            </div>
          )}

          {/* Dirección */}
          <div>
            <Label htmlFor="direccion" className="text-foreground">
              Dirección
            </Label>
            <Textarea
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleInputChange("direccion", e.target.value)}
              placeholder="Dirección completa del cliente"
              rows={3}
              className="bg-background dark:bg-background"
            />
          </div>

          {/* Acciones */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? "Actualizando..." : "Actualizar Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
