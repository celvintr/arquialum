"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Eye } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import CotizacionesManager from "@/components/cotizaciones/CotizacionesManager"

interface Cotizacion {
  _id: string
  numero: string
  cliente: any
  items: any[]
  grupos: any[]
  estado: string
  tipo: string
  subtotal: number
  iva: number
  total: number
  fechaCreacion: string
}

export default function EditarCotizacionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (resolvedParams.id) {
      cargarCotizacion()
    }
  }, [resolvedParams.id])

  const cargarCotizacion = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/cotizaciones/${resolvedParams.id}`)

      if (response.ok) {
        const data = await response.json()
        setCotizacion(data.cotizacion)
      } else {
        toast({
          title: "Error",
          description: "No se pudo cargar la cotización",
          variant: "destructive",
        })
        router.push("/dashboard/cotizaciones")
      }
    } catch (error) {
      console.error("Error cargando cotización:", error)
      toast({
        title: "Error",
        description: "Error al cargar la cotización",
        variant: "destructive",
      })
      router.push("/dashboard/cotizaciones")
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const colores = {
      borrador: "secondary",
      enviada: "default",
      aprobada: "default",
      rechazada: "destructive",
    }
    return <Badge variant={colores[estado] || "secondary"}>{estado}</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">Cargando cotización...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!cotizacion) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cotización no encontrada</h3>
              <p className="text-gray-500 mb-4">La cotización que buscas no existe o ha sido eliminada</p>
              <Link href="/dashboard/cotizaciones">
                <Button>Volver a Cotizaciones</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/cotizaciones">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Editar Cotización</h1>
              <div className="flex items-center space-x-4 mt-2">
                <p className="text-gray-600">#{cotizacion.numero}</p>
                {getEstadoBadge(cotizacion.estado)}
                <Badge variant="outline">{cotizacion.tipo}</Badge>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href={`/dashboard/cotizaciones`}>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Ver Lista
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Información de la cotización */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información de la Cotización</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Cliente:</span>
              <p className="text-gray-600">{cotizacion.cliente?.nombre || "Sin cliente"}</p>
            </div>
            <div>
              <span className="font-medium">Email:</span>
              <p className="text-gray-600">{cotizacion.cliente?.email || "N/A"}</p>
            </div>
            <div>
              <span className="font-medium">Fecha:</span>
              <p className="text-gray-600">{new Date(cotizacion.fechaCreacion).toLocaleDateString("es-MX")}</p>
            </div>
            <div>
              <span className="font-medium">Total:</span>
              <p className="text-gray-600 font-semibold">L {cotizacion.total?.toLocaleString("es-MX") || "0.00"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manager de cotizaciones en modo edición */}
      <CotizacionesManager tipoCotizacion={cotizacion.tipo} cotizacionEditando={cotizacion} />
    </div>
  )
}
