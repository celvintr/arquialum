"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { GlassWater, Plus, Calculator } from "lucide-react"

interface CotizarBarandalModalProps {
  isOpen: boolean
  onClose: () => void
  onAgregarCotizacion: (cotizacion: any) => void
}

export default function CotizarBarandalModal({ isOpen, onClose, onAgregarCotizacion }: CotizarBarandalModalProps) {
  const [formData, setFormData] = useState({
    descripcion: "",
    ancho: 0,
    alto: 0,
    cantidad: 1,
    tipo_vidrio: "templado_10mm",
    tipo_herraje: "acero_inoxidable",
    acabado_herraje: "satinado",
    tipo_instalacion: "piso_techo",
    incluye_instalacion: true,
    notas: "",
  })

  const [materiales, setMateriales] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      cargarMateriales()
    }
  }, [isOpen])

  const cargarMateriales = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/materiales")
      const data = await response.json()
      setMateriales(data.materiales || [])
    } catch (error) {
      console.error("Error cargando materiales:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const calcularPrecio = () => {
    if (!formData.ancho || !formData.alto) return 0

    // Cálculos base para barandal
    const area = (formData.ancho * formData.alto) / 10000 // m²
    const perimetro = ((formData.ancho + formData.alto) * 2) / 100 // metros lineales

    // Precios base
    const precioVidrioM2 = 850 // por m²
    const precioHerrajeML = 450 // por metro lineal
    const precioInstalacionM2 = 200 // por m²

    // Multiplicadores según tipo
    const multiplicadorVidrio =
      {
        templado_6mm: 1.0,
        templado_8mm: 1.2,
        templado_10mm: 1.4,
        templado_12mm: 1.6,
        laminado_6mm: 1.3,
        laminado_8mm: 1.5,
      }[formData.tipo_vidrio] || 1.0

    const multiplicadorHerraje =
      {
        acero_inoxidable: 1.0,
        aluminio: 0.8,
        acero_cromado: 1.2,
        acero_negro: 0.9,
      }[formData.tipo_herraje] || 1.0

    // Cálculos
    const costoVidrio = area * precioVidrioM2 * multiplicadorVidrio
    const costoHerraje = perimetro * precioHerrajeML * multiplicadorHerraje
    const costoInstalacion = formData.incluye_instalacion ? area * precioInstalacionM2 : 0

    const subtotal = costoVidrio + costoHerraje + costoInstalacion
    const margenGanancia = subtotal * 0.4 // 40% de margen
    const total = (subtotal + margenGanancia) * formData.cantidad

    return {
      costoVidrio,
      costoHerraje,
      costoInstalacion,
      subtotal,
      margenGanancia,
      total,
      area,
      perimetro,
    }
  }

  const handleSubmit = () => {
    if (!formData.ancho || !formData.alto) {
      return
    }

    const calculo = calcularPrecio()

    const barandal = {
      tipo: "barandal",
      nombre: formData.descripcion || `Barandal ${formData.ancho}x${formData.alto}cm`,
      descripcion: formData.descripcion,
      dimensiones: {
        ancho: formData.ancho,
        alto: formData.alto,
        area: calculo.area,
        perimetro: calculo.perimetro,
      },
      especificaciones: {
        tipo_vidrio: formData.tipo_vidrio,
        tipo_herraje: formData.tipo_herraje,
        acabado_herraje: formData.acabado_herraje,
        tipo_instalacion: formData.tipo_instalacion,
        incluye_instalacion: formData.incluye_instalacion,
      },
      cantidad: formData.cantidad,
      costos: {
        vidrio: calculo.costoVidrio,
        herraje: calculo.costoHerraje,
        instalacion: calculo.costoInstalacion,
        subtotal: calculo.subtotal,
        margen: calculo.margenGanancia,
      },
      precio_unitario: calculo.total / formData.cantidad,
      precio_total: calculo.total,
      notas: formData.notas,
      materiales: [
        {
          nombre: `Vidrio ${formData.tipo_vidrio}`,
          cantidad: calculo.area,
          unidad: "m²",
          precio: calculo.costoVidrio,
        },
        {
          nombre: `Herraje ${formData.tipo_herraje}`,
          cantidad: calculo.perimetro,
          unidad: "ml",
          precio: calculo.costoHerraje,
        },
      ],
    }

    onAgregarCotizacion(barandal)
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setFormData({
      descripcion: "",
      ancho: 0,
      alto: 0,
      cantidad: 1,
      tipo_vidrio: "templado_10mm",
      tipo_herraje: "acero_inoxidable",
      acabado_herraje: "satinado",
      tipo_instalacion: "piso_techo",
      incluye_instalacion: true,
      notas: "",
    })
  }

  const calculo = calcularPrecio()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <GlassWater className="w-5 h-5 mr-2" />
            Cotizar Barandal de Vidrio Templado
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel Izquierdo - Configuración */}
          <div className="space-y-6">
            {/* Información Básica */}
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Descripción</Label>
                  <Input
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    placeholder="Ej: Barandal para escalera principal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ancho (cm)</Label>
                    <Input
                      type="number"
                      value={formData.ancho || ""}
                      onChange={(e) => handleInputChange("ancho", Number(e.target.value))}
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <Label>Alto (cm)</Label>
                    <Input
                      type="number"
                      value={formData.alto || ""}
                      onChange={(e) => handleInputChange("alto", Number(e.target.value))}
                      placeholder="90"
                    />
                  </div>
                </div>

                <div>
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.cantidad}
                    onChange={(e) => handleInputChange("cantidad", Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Especificaciones Técnicas */}
            <Card>
              <CardHeader>
                <CardTitle>Especificaciones Técnicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tipo de Vidrio</Label>
                  <Select
                    value={formData.tipo_vidrio}
                    onValueChange={(value) => handleInputChange("tipo_vidrio", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="templado_6mm">Templado 6mm</SelectItem>
                      <SelectItem value="templado_8mm">Templado 8mm</SelectItem>
                      <SelectItem value="templado_10mm">Templado 10mm</SelectItem>
                      <SelectItem value="templado_12mm">Templado 12mm</SelectItem>
                      <SelectItem value="laminado_6mm">Laminado 6mm</SelectItem>
                      <SelectItem value="laminado_8mm">Laminado 8mm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tipo de Herraje</Label>
                  <Select
                    value={formData.tipo_herraje}
                    onValueChange={(value) => handleInputChange("tipo_herraje", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acero_inoxidable">Acero Inoxidable</SelectItem>
                      <SelectItem value="aluminio">Aluminio</SelectItem>
                      <SelectItem value="acero_cromado">Acero Cromado</SelectItem>
                      <SelectItem value="acero_negro">Acero Negro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Acabado del Herraje</Label>
                  <Select
                    value={formData.acabado_herraje}
                    onValueChange={(value) => handleInputChange("acabado_herraje", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="satinado">Satinado</SelectItem>
                      <SelectItem value="brillante">Brillante</SelectItem>
                      <SelectItem value="mate">Mate</SelectItem>
                      <SelectItem value="negro_mate">Negro Mate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tipo de Instalación</Label>
                  <Select
                    value={formData.tipo_instalacion}
                    onValueChange={(value) => handleInputChange("tipo_instalacion", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piso_techo">Piso a Techo</SelectItem>
                      <SelectItem value="lateral">Lateral</SelectItem>
                      <SelectItem value="esquina">Esquina</SelectItem>
                      <SelectItem value="flotante">Flotante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="incluye_instalacion"
                    checked={formData.incluye_instalacion}
                    onChange={(e) => handleInputChange("incluye_instalacion", e.target.checked)}
                  />
                  <Label htmlFor="incluye_instalacion">Incluir instalación</Label>
                </div>

                <div>
                  <Label>Notas Adicionales</Label>
                  <Textarea
                    value={formData.notas}
                    onChange={(e) => handleInputChange("notas", e.target.value)}
                    placeholder="Especificaciones adicionales..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Derecho - Cálculos y Resumen */}
          <div className="space-y-6">
            {/* Cálculos Detallados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Cálculos Detallados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.ancho && formData.alto ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Área:</span>
                        <p>{calculo.area.toFixed(2)} m²</p>
                      </div>
                      <div>
                        <span className="font-medium">Perímetro:</span>
                        <p>{calculo.perimetro.toFixed(2)} ml</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Vidrio:</span>
                        <span>L {calculo.costoVidrio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Herraje:</span>
                        <span>L {calculo.costoHerraje.toFixed(2)}</span>
                      </div>
                      {formData.incluye_instalacion && (
                        <div className="flex justify-between">
                          <span>Instalación:</span>
                          <span>L {calculo.costoInstalacion.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>L {calculo.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Margen (40%):</span>
                        <span>L {calculo.margenGanancia.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-green-600">L {calculo.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-4">Ingresa las dimensiones para ver los cálculos</p>
                )}
              </CardContent>
            </Card>

            {/* Resumen de Materiales */}
            <Card>
              <CardHeader>
                <CardTitle>Materiales Incluidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Vidrio</Badge>
                    <span className="text-sm">
                      {formData.tipo_vidrio.replace("_", " ")} - {calculo.area.toFixed(2)} m²
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Herraje</Badge>
                    <span className="text-sm">
                      {formData.tipo_herraje.replace("_", " ")} - {calculo.perimetro.toFixed(2)} ml
                    </span>
                  </div>
                  {formData.incluye_instalacion && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Instalación</Badge>
                      <span className="text-sm">Instalación {formData.tipo_instalacion.replace("_", " ")}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.ancho || !formData.alto}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar a Cotización
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
