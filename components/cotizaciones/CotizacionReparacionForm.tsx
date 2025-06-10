"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Wrench, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface CotizacionReparacionFormProps {
  onAgregarCotizacion: (cotizacion: any) => void
}

export default function CotizacionReparacionForm({ onAgregarCotizacion }: CotizacionReparacionFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState<any[]>([])
  const [reparaciones, setReparaciones] = useState<any[]>([])
  const [reparacionesSeleccionadas, setReparacionesSeleccionadas] = useState<any[]>([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("")
  const [imagen, setImagen] = useState<File | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [descripcionAdicional, setDescripcionAdicional] = useState("")

  useEffect(() => {
    cargarCategorias()
  }, [])

  useEffect(() => {
    if (categoriaSeleccionada) {
      cargarReparaciones(categoriaSeleccionada)
    }
  }, [categoriaSeleccionada])

  const cargarCategorias = async () => {
    try {
      setLoading(true)

      // Simulamos datos de ejemplo
      setCategorias([
        { _id: "c1", nombre: "Ventanas" },
        { _id: "c2", nombre: "Puertas" },
        { _id: "c3", nombre: "Barandales" },
      ])
    } catch (error) {
      console.error("Error cargando categorías:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const cargarReparaciones = async (categoriaId: string) => {
    try {
      setLoading(true)
      // Simulamos datos de ejemplo
      setReparaciones(
        [
          {
            _id: "r1",
            nombre: "Reparación de bisagra",
            precio_base: 50,
            tiempo_estimado: 2,
            materiales_incluidos: true,
            categoria_id: "c2",
          },
          {
            _id: "r2",
            nombre: "Ajuste de cerradura",
            precio_base: 40,
            tiempo_estimado: 1,
            materiales_incluidos: false,
            categoria_id: "c2",
          },
          {
            _id: "r3",
            nombre: "Instalación de vidrio",
            precio_base: 80,
            tiempo_estimado: 3,
            materiales_incluidos: true,
            categoria_id: "c1",
          },
        ].filter((r) => r.categoria_id === categoriaId),
      )
    } catch (error) {
      console.error("Error cargando reparaciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las reparaciones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCategoriaChange = (value: string) => {
    setCategoriaSeleccionada(value)
    setReparacionesSeleccionadas([])
  }

  const handleReparacionSelect = (reparacionId: string) => {
    const reparacion = reparaciones.find((r) => r._id === reparacionId)
    if (reparacion) {
      setReparacionesSeleccionadas((prev) => [...prev, reparacion])
    }
  }

  const handleRemoveReparacion = (reparacionId: string) => {
    setReparacionesSeleccionadas((prev) => prev.filter((r) => r._id !== reparacionId))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImagen(file)
      setImagenPreview(URL.createObjectURL(file))
    }
  }

  const calcularTotal = () => {
    return reparacionesSeleccionadas.reduce((total, reparacion) => total + reparacion.precio_base, 0)
  }

  const agregarACotizacion = () => {
    if (reparacionesSeleccionadas.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos una reparación",
        variant: "destructive",
      })
      return
    }

    const cotizacionReparaciones = reparacionesSeleccionadas.map((reparacion) => ({
      tipo: "reparacion",
      reparacion_id: reparacion._id,
      reparacion_nombre: reparacion.nombre,
      categoria: categorias.find((c) => c._id === categoriaSeleccionada)?.nombre || "",
      descripcion: reparacion.descripcion,
      cantidad: 1,
      precio_unitario: reparacion.precio_base,
      precio_total: reparacion.precio_base,
      tiempo_estimado: reparacion.tiempo_estimado,
      materiales_incluidos: reparacion.materiales_incluidos,
      observaciones: descripcionAdicional,
    }))

    cotizacionReparaciones.forEach((cotizacionReparacion) => onAgregarCotizacion(cotizacionReparacion))
    resetForm()

    toast({
      title: "Reparaciones agregadas",
      description: "Las reparaciones han sido agregadas a la cotización",
    })
  }

  const resetForm = () => {
    setCategoriaSeleccionada("")
    setReparacionesSeleccionadas([])
    setImagen(null)
    setImagenPreview(null)
    setDescripcionAdicional("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wrench className="w-5 h-5 mr-2" />
          Cotización de Reparaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selección de Categoría */}
        <div>
          <Label>Categoría de Reparación</Label>
          <Select value={categoriaSeleccionada} onValueChange={handleCategoriaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((categoria) => (
                <SelectItem key={categoria._id} value={categoria._id}>
                  {categoria.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selección de Reparación */}
        {categoriaSeleccionada && (
          <div>
            <Label>Tipo de Reparación</Label>
            <Select onValueChange={handleReparacionSelect} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar reparación" />
              </SelectTrigger>
              <SelectContent>
                {reparaciones.map((reparacion) => (
                  <SelectItem key={reparacion._id} value={reparacion._id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{reparacion.nombre}</span>
                      <Badge variant="outline">${reparacion.precio_base}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Reparaciones Seleccionadas */}
        {reparacionesSeleccionadas.length > 0 && (
          <div>
            <Label>Reparaciones Seleccionadas</Label>
            <div className="space-y-2">
              {reparacionesSeleccionadas.map((reparacion) => (
                <Card key={reparacion._id} className="bg-gray-50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{reparacion.nombre}</h4>
                      <p className="text-sm text-gray-600">Precio: ${reparacion.precio_base}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveReparacion(reparacion._id)}>
                      <Plus className="w-4 h-4 rotate-45" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Imagen Adicional */}
        <div>
          <Label htmlFor="imagen">Imagen Adicional</Label>
          <Input type="file" id="imagen" accept="image/*" onChange={handleImageChange} />
          {imagenPreview && (
            <div className="mt-2">
              <img src={imagenPreview || "/placeholder.svg"} alt="Vista previa" className="max-h-40" />
            </div>
          )}
        </div>

        {/* Descripción Adicional */}
        <div>
          <Label htmlFor="descripcion">Descripción Adicional</Label>
          <Textarea
            id="descripcion"
            placeholder="Descripción adicional de la reparación"
            rows={3}
            value={descripcionAdicional}
            onChange={(e) => setDescripcionAdicional(e.target.value)}
          />
        </div>

        {/* Total */}
        {reparacionesSeleccionadas.length > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600">Total de la reparación:</span>
                </div>
                <span className="text-2xl font-bold text-primary">${calcularTotal().toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Acciones */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={resetForm}>
            Limpiar
          </Button>
          <Button onClick={agregarACotizacion} disabled={reparacionesSeleccionadas.length === 0}>
            Agregar a Cotización
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
