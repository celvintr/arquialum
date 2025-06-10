"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Check, X, Download, Send, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

interface Cotizacion {
  _id: string
  numero: string
  cliente: {
    nombre: string
    email: string
    telefono?: string
  }
  fechaCreacion: string
  estado: string
  total: number
  subtotal: number
  iva: number
  tipo: string
  items: any[]
  grupos: any[]
}

export default function VerCotizacionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (resolvedParams.id) {
      cargarCotizacion(resolvedParams.id as string)
    }
  }, [resolvedParams.id])

  const cargarCotizacion = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/cotizaciones/${id}`)
      if (response.ok) {
        const data = await response.json()
        setCotizacion(data.cotizacion)
      } else {
        toast({
          title: "Error",
          description: "No se pudo cargar la cotización",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error cargando cotización:", error)
      toast({
        title: "Error",
        description: "Error al cargar la cotización",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstado = async (nuevoEstado: string) => {
    if (!cotizacion) return

    try {
      const response = await fetch(`/api/cotizaciones/${cotizacion._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (response.ok) {
        setCotizacion({ ...cotizacion, estado: nuevoEstado })
        toast({
          title: "Estado actualizado",
          description: `Cotización marcada como ${nuevoEstado}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      })
    }
  }

  const eliminarCotizacion = async () => {
    if (!cotizacion) return

    if (confirm("¿Estás seguro de que quieres eliminar esta cotización?")) {
      try {
        const response = await fetch(`/api/cotizaciones/${cotizacion._id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          toast({
            title: "Cotización eliminada",
            description: "La cotización ha sido eliminada exitosamente",
          })
          router.push("/dashboard/cotizaciones")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la cotización",
          variant: "destructive",
        })
      }
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

  const agruparItemsPorGrupo = () => {
    if (!cotizacion) return {}

    const itemsAgrupados = {}

    cotizacion.grupos?.forEach((grupo) => {
      itemsAgrupados[grupo.id] = {
        ...grupo,
        items: cotizacion.items.filter((item) => item.grupoId === grupo.id),
      }
    })

    // Items sin grupo
    const itemsSinGrupo = cotizacion.items.filter((item) => !item.grupoId || item.grupoId === "default")
    if (itemsSinGrupo.length > 0) {
      itemsAgrupados["default"] = {
        id: "default",
        nombre: "Items Generales",
        items: itemsSinGrupo,
      }
    }

    return itemsAgrupados
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
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cotización no encontrada</h3>
            <Link href="/dashboard/cotizaciones">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Cotizaciones
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const itemsAgrupados = agruparItemsPorGrupo()

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboard/cotizaciones">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Cotización #{cotizacion.numero}</h1>
            {getEstadoBadge(cotizacion.estado)}
          </div>
          <p className="text-gray-600">Creada el {new Date(cotizacion.fechaCreacion).toLocaleDateString("es-MX")}</p>
        </div>

        <div className="flex gap-2">
          <Link href={`/dashboard/cotizaciones/editar/${cotizacion._id}`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>

          {cotizacion.estado === "borrador" && (
            <Button onClick={() => cambiarEstado("enviada")}>
              <Send className="mr-2 h-4 w-4" />
              Enviar
            </Button>
          )}

          {cotizacion.estado === "enviada" && (
            <>
              <Button onClick={() => cambiarEstado("aprobada")} className="bg-green-600 hover:bg-green-700">
                <Check className="mr-2 h-4 w-4" />
                Aprobar
              </Button>
              <Button onClick={() => cambiarEstado("rechazada")} variant="destructive">
                <X className="mr-2 h-4 w-4" />
                Rechazar
              </Button>
            </>
          )}

          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>

          <Button variant="destructive" onClick={eliminarCotizacion}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Información del Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="font-medium">Nombre:</span>
              <p className="text-gray-600">{cotizacion.cliente.nombre}</p>
            </div>
            <div>
              <span className="font-medium">Email:</span>
              <p className="text-gray-600">{cotizacion.cliente.email}</p>
            </div>
            <div>
              <span className="font-medium">Teléfono:</span>
              <p className="text-gray-600">{cotizacion.cliente.telefono || "No especificado"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items por Grupo */}
      {Object.values(itemsAgrupados).map((grupo: any) => (
        <Card key={grupo.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {grupo.imagenUrl && (
                  <img
                    src={grupo.imagenUrl || "/placeholder.svg"}
                    alt={grupo.nombre}
                    className="w-8 h-8 rounded object-cover"
                  />
                )}
                {grupo.nombre}
                <Badge variant="outline">{grupo.items.length} items</Badge>
              </CardTitle>
            </div>
            {grupo.descripcion && <p className="text-sm text-gray-600">{grupo.descripcion}</p>}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {grupo.items.map((item: any, index: number) => (
                <div key={item.id || index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{item.nombre || item.descripcion}</h4>
                      <Badge variant="outline" className="mt-1">
                        {item.tipo}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">L {(item.precio_total || 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Cantidad: {item.cantidad || 1}</p>
                    </div>
                  </div>

                  {item.descripcion && item.nombre !== item.descripcion && (
                    <p className="text-sm text-gray-600 mb-2">{item.descripcion}</p>
                  )}

                  {item.dimensiones && (
                    <p className="text-sm text-gray-600">
                      Dimensiones: {item.dimensiones.ancho}x{item.dimensiones.alto}
                      {item.dimensiones.area && ` (${item.dimensiones.area.toFixed(2)}m²)`}
                    </p>
                  )}

                  {item.materiales && item.materiales.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Materiales:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.materiales.map((material: any, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {material.nombre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.notas && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Notas:</p>
                      <p className="text-sm text-gray-600">{item.notas}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Resumen de Totales */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Totales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>L {cotizacion.subtotal?.toLocaleString() || "0.00"}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (15%):</span>
              <span>L {cotizacion.iva?.toLocaleString() || "0.00"}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>L {cotizacion.total?.toLocaleString() || "0.00"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
