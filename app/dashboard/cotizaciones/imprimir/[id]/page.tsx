"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Eye, AlertCircle } from "lucide-react"
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
  observaciones?: string
  descuento?: number
  impuestos?: number
  pagos_realizados?: number
  saldo_pendiente?: number
  vendedor?: any
}

export default function EditarCotizacionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (resolvedParams.id) {
      cargarCotizacion()
    }
  }, [resolvedParams.id])

  const cargarCotizacion = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log(`🔍 Cargando cotización: ${resolvedParams.id}`)

      const response = await fetch(`/api/cotizaciones/${resolvedParams.id}`)
      const data = await response.json()

      console.log("📦 Respuesta de la API:", data)

      if (response.ok && data.success) {
        // Procesar la cotización para el formato esperado por CotizacionesManager
        const cotizacionProcesada = {
          ...data.cotizacion,
          // Asegurar que los grupos tengan la estructura correcta
          grupos: (data.cotizacion.grupos || []).map((grupo: any) => ({
            ...grupo,
            // Limpiar la imagen blob URL si existe
            imagenUrl: grupo.imagenUrl && grupo.imagenUrl.startsWith("blob:") ? null : grupo.imagenUrl,
            imagen: null, // No cargar objetos File
            items: grupo.items || [],
          })),
          // Asegurar que los items estén en el formato correcto
          items: data.cotizacion.items || [],
          // Información del cliente
          cliente: data.cotizacion.cliente || null,
        }

        console.log("✅ Cotización procesada:", cotizacionProcesada)
        setCotizacion(cotizacionProcesada)
      } else {
        const errorMsg = data.message || "No se pudo cargar la cotización"
        setError(errorMsg)
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Error cargando cotización:", error)
      const errorMsg = "Error de conexión al cargar la cotización"
      setError(errorMsg)
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
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
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <div>Cargando cotización...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar la cotización</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <div className="space-x-2">
                  <Button onClick={cargarCotizacion} variant="outline">
                    Reintentar
                  </Button>
                  <Link href="/dashboard/cotizaciones">
                    <Button>Volver a Cotizaciones</Button>
                  </Link>
                </div>
              </div>
            </div>
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
            <Link href={`/dashboard/cotizaciones/ver/${cotizacion._id}`}>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Ver Cotización
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
              <p className="text-gray-600 font-semibold">
                L {(cotizacion.total || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 pt-4 border-t">
            <div>
              <span className="font-medium">Subtotal:</span>
              <p className="text-gray-600">
                L {(cotizacion.subtotal || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <span className="font-medium">IVA:</span>
              <p className="text-gray-600">
                L {(cotizacion.iva || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <span className="font-medium">Items:</span>
              <p className="text-gray-600">{cotizacion.items?.length || 0} productos</p>
            </div>
            <div>
              <span className="font-medium">Grupos:</span>
              <p className="text-gray-600">{cotizacion.grupos?.length || 0} grupos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manager de cotizaciones en modo edición */}
      <CotizacionesManager tipoCotizacion={cotizacion.tipo} cotizacionEditando={cotizacion} />
    </div>
  )
}
