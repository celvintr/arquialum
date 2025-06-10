"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, FileText, Eye, Download } from "lucide-react"
import Link from "next/link"

interface Cotizacion {
  _id: string
  numero: string
  cliente: string
  email: string
  fecha: string
  items: number
  subtotal: number
  iva: number
  total: number
  estado: "borrador" | "enviada" | "aprobada" | "rechazada"
}

export default function CotizacionesTable() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [filtro, setFiltro] = useState("")
  const [loading, setLoading] = useState(true)

  // Datos de ejemplo
  const cotizacionesEjemplo: Cotizacion[] = [
    {
      _id: "1",
      numero: "COT-2024-001",
      cliente: "Juan Pérez",
      email: "juan@email.com",
      fecha: "2024-01-15",
      items: 3,
      subtotal: 1250.0,
      iva: 200.0,
      total: 1450.0,
      estado: "enviada",
    },
    {
      _id: "2",
      numero: "COT-2024-002",
      cliente: "María García",
      email: "maria@email.com",
      fecha: "2024-01-14",
      items: 2,
      subtotal: 850.0,
      iva: 136.0,
      total: 986.0,
      estado: "aprobada",
    },
    {
      _id: "3",
      numero: "COT-2024-003",
      cliente: "Carlos López",
      email: "carlos@email.com",
      fecha: "2024-01-13",
      items: 5,
      subtotal: 2100.0,
      iva: 336.0,
      total: 2436.0,
      estado: "borrador",
    },
    {
      _id: "4",
      numero: "COT-2024-004",
      cliente: "Ana Martínez",
      email: "ana@email.com",
      fecha: "2024-01-12",
      items: 1,
      subtotal: 450.0,
      iva: 72.0,
      total: 522.0,
      estado: "rechazada",
    },
  ]

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setCotizaciones(cotizacionesEjemplo)
      setLoading(false)
    }, 1000)
  }, [])

  const cotizacionesFiltradas = cotizaciones.filter(
    (cotizacion) =>
      cotizacion.numero.toLowerCase().includes(filtro.toLowerCase()) ||
      cotizacion.cliente.toLowerCase().includes(filtro.toLowerCase()) ||
      cotizacion.email.toLowerCase().includes(filtro.toLowerCase()),
  )

  const getEstadoBadge = (estado: string) => {
    const badges = {
      borrador: <Badge variant="secondary">Borrador</Badge>,
      enviada: (
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          Enviada
        </Badge>
      ),
      aprobada: (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Aprobada
        </Badge>
      ),
      rechazada: <Badge variant="destructive">Rechazada</Badge>,
    }
    return badges[estado as keyof typeof badges] || <Badge variant="secondary">{estado}</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar cotizaciones..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="pl-10"
              />
            </div>
            <Link href="/dashboard/cotizaciones/nueva">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cotización
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Cotizaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Lista de Cotizaciones ({cotizacionesFiltradas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Número</th>
                  <th className="text-left p-4 font-medium">Cliente</th>
                  <th className="text-left p-4 font-medium">Fecha</th>
                  <th className="text-left p-4 font-medium">Items</th>
                  <th className="text-left p-4 font-medium">Total</th>
                  <th className="text-left p-4 font-medium">Estado</th>
                  <th className="text-left p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cotizacionesFiltradas.map((cotizacion) => (
                  <tr key={cotizacion._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium">{cotizacion.numero}</div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{cotizacion.cliente}</div>
                        <div className="text-sm text-gray-500">{cotizacion.email}</div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{new Date(cotizacion.fecha).toLocaleDateString("es-ES")}</td>
                    <td className="p-4">
                      <Badge variant="outline">{cotizacion.items} items</Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-bold text-lg">${cotizacion.total.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">Subtotal: ${cotizacion.subtotal.toFixed(2)}</div>
                      </div>
                    </td>
                    <td className="p-4">{getEstadoBadge(cotizacion.estado)}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {cotizacionesFiltradas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No se encontraron cotizaciones que coincidan con la búsqueda.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
