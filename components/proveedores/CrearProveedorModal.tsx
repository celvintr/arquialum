"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Building } from "lucide-react"

interface CrearProveedorModalProps {
  isOpen: boolean
  onClose: () => void
  onProveedorCreado: () => void
}

export default function CrearProveedorModal({ isOpen, onClose, onProveedorCreado }: CrearProveedorModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
    ciudad: "",
    pais: "Honduras",
    tipoMateriales: [] as string[],
    descuentoGeneral: 0,
  })

  const tiposMateriales = ["PVC", "Aluminio", "Vidrio", "Herrajes", "Accesorios", "Selladores"]

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTipoMaterialChange = (tipo: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        tipoMateriales: [...prev.tipoMateriales, tipo],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        tipoMateriales: prev.tipoMateriales.filter((t) => t !== tipo),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.contacto || !formData.telefono) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const response = await fetch("/api/proveedores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Éxito",
          description: "Proveedor creado correctamente",
        })
        onProveedorCreado()
        resetForm()
      } else {
        throw new Error(data.error || "Error al crear proveedor")
      }
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el proveedor",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      contacto: "",
      telefono: "",
      email: "",
      direccion: "",
      ciudad: "",
      pais: "Honduras",
      tipoMateriales: [],
      descuentoGeneral: 0,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card dark:bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center text-foreground">
            <Building className="w-5 h-5 mr-2" />
            Nuevo Proveedor
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre" className="text-foreground">
                Nombre de la Empresa *
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                placeholder="Empresa Proveedora S.A."
                className="bg-background dark:bg-background"
                required
              />
            </div>

            <div>
              <Label htmlFor="contacto" className="text-foreground">
                Contacto Principal *
              </Label>
              <Input
                id="contacto"
                value={formData.contacto}
                onChange={(e) => handleInputChange("contacto", e.target.value)}
                placeholder="Juan Pérez"
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
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="proveedor@email.com"
                className="bg-background dark:bg-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <Label htmlFor="pais" className="text-foreground">
                País
              </Label>
              <Input
                id="pais"
                value={formData.pais}
                onChange={(e) => handleInputChange("pais", e.target.value)}
                placeholder="Honduras"
                className="bg-background dark:bg-background"
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <Label htmlFor="direccion" className="text-foreground">
              Dirección
            </Label>
            <Textarea
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleInputChange("direccion", e.target.value)}
              placeholder="Dirección completa del proveedor"
              rows={3}
              className="bg-background dark:bg-background"
            />
          </div>

          {/* Tipos de Materiales */}
          <div>
            <Label className="text-foreground">Tipos de Materiales que Provee</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {tiposMateriales.map((tipo) => (
                <label key={tipo} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.tipoMateriales.includes(tipo)}
                    onChange={(e) => handleTipoMaterialChange(tipo, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-foreground">{tipo}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Descuento General */}
          <div>
            <Label htmlFor="descuentoGeneral" className="text-foreground">
              Descuento General (%)
            </Label>
            <Input
              id="descuentoGeneral"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.descuentoGeneral}
              onChange={(e) => handleInputChange("descuentoGeneral", Number(e.target.value))}
              placeholder="0"
              className="bg-background dark:bg-background"
            />
          </div>

          {/* Acciones */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? "Creando..." : "Crear Proveedor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
