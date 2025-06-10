"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Wrench, GlassWater, FileText, Calculator } from "lucide-react"
import CotizacionesManager from "@/components/cotizaciones/CotizacionesManager"

export default function NuevaCotizacionPage() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>("")

  const tiposCotizacion = [
    {
      id: "productos",
      nombre: "Productos",
      descripcion: "Cotizar productos del catálogo con materiales y fórmulas",
      icon: Package,
      color: "bg-blue-500",
      usaMateriales: true,
    },
    {
      id: "reparaciones",
      nombre: "Reparaciones",
      descripcion: "Servicios de reparación con precios fijos",
      icon: Wrench,
      color: "bg-green-500",
      usaMateriales: false,
    },
    {
      id: "vidrio_templado",
      nombre: "Vidrio Templado",
      descripcion: "Cotización especializada para vidrios templados",
      icon: GlassWater,
      color: "bg-purple-500",
      usaMateriales: false,
    },
    {
      id: "libre",
      nombre: "Cotización Libre",
      descripcion: "Items personalizados con precios manuales",
      icon: FileText,
      color: "bg-orange-500",
      usaMateriales: false,
    },
  ]

  if (!tipoSeleccionado) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Nueva Cotización</h1>
          <p className="text-gray-600 mt-2">Selecciona el tipo de cotización que deseas crear</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiposCotizacion.map((tipo) => {
            const IconComponent = tipo.icon
            return (
              <Card
                key={tipo.id}
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                onClick={() => setTipoSeleccionado(tipo.id)}
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${tipo.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{tipo.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 mb-4">{tipo.descripcion}</p>
                  <div className="flex justify-center">
                    <Badge variant={tipo.usaMateriales ? "default" : "secondary"}>
                      {tipo.usaMateriales ? "Usa Materiales" : "Precio Fijo"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Información sobre Tipos de Cotización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-600 mb-2">✅ Usan Materiales y Fórmulas:</h3>
                <ul className="space-y-1 text-sm">
                  <li>
                    • <strong>Productos:</strong> Calculan costos basados en materiales del catálogo
                  </li>
                  <li>• Permiten seleccionar proveedor y variantes</li>
                  <li>• Usan fórmulas para calcular cantidades</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-600 mb-2">📋 Precios Fijos:</h3>
                <ul className="space-y-1 text-sm">
                  <li>
                    • <strong>Reparaciones:</strong> Servicios con precios predefinidos
                  </li>
                  <li>
                    • <strong>Vidrio Templado:</strong> Cálculo especializado por m²
                  </li>
                  <li>
                    • <strong>Cotización Libre:</strong> Items manuales personalizados
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nueva Cotización</h1>
          <p className="text-gray-600 mt-2">Tipo: {tiposCotizacion.find((t) => t.id === tipoSeleccionado)?.nombre}</p>
        </div>
        <Button variant="outline" onClick={() => setTipoSeleccionado("")}>
          Cambiar Tipo
        </Button>
      </div>

      <CotizacionesManager tipoCotizacion={tipoSeleccionado} />
    </div>
  )
}
