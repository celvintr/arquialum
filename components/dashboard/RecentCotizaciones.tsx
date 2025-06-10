"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, ExternalLink, Plus } from "lucide-react"

export function RecentCotizaciones() {
  const [cotizaciones, setCotizaciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCotizaciones = async () => {
      try {
        const response = await fetch("/api/cotizaciones?limit=5")
        const data = await response.json()
        setCotizaciones(data.cotizaciones || [])
      } catch (error) {
        console.error("Error fetching cotizaciones:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCotizaciones()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (cotizaciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay cotizaciones recientes</h3>
        <p className="text-sm text-muted-foreground mb-4">Comienza creando una nueva cotización</p>
        <Link href="/dashboard/cotizaciones/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cotización
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {cotizaciones.map((cotizacion) => (
        <div key={cotizacion._id} className="flex items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{cotizacion.cliente?.nombre || "Cliente sin nombre"}</p>
            <p className="text-sm text-muted-foreground">{new Date(cotizacion.fecha_creacion).toLocaleDateString()}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge
              variant={
                cotizacion.estado === "pendiente"
                  ? "outline"
                  : cotizacion.estado === "aprobada"
                    ? "default"
                    : "destructive"
              }
            >
              {cotizacion.estado}
            </Badge>
            <Link href={`/dashboard/cotizaciones/${cotizacion._id}`}>
              <Button variant="ghost" size="icon">
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Ver cotización</span>
              </Button>
            </Link>
          </div>
        </div>
      ))}
      <div className="flex justify-center">
        <Link href="/dashboard/cotizaciones">
          <Button variant="outline">Ver todas las cotizaciones</Button>
        </Link>
      </div>
    </div>
  )
}
