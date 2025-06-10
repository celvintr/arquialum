"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Printer, ArrowLeft, Download, Wrench, Package, Ruler } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface OrdenTrabajo {
  _id: string
  numero: string
  cotizacion_id: string
  cotizacion_numero: string
  cliente_nombre: string
  cliente_telefono: string
  fecha_inicio: string
  fecha_estimada_fin: string
  estado: string
  items_cotizacion: Array<{
    tipo: string
    nombre: string
    descripcion: string
    cantidad: number
    precio_unitario: number
    precio_total: number
    dimensiones?: {
      ancho: number
      alto: number
      area: number
    }
    especificaciones?: {
      tipo_vidrio?: string
      color_pvc?: string
      color_aluminio?: string
      decorado?: string
      tipo_apertura?: string
      herrajes?: string
      acabado?: string
    }
    materiales_calculados?: Array<{
      material_id: string
      nombre: string
      cantidad: number
      unidad: string
      precio_unitario: number
      precio_total: number
      categoria: string
      especificaciones?: any
    }>
    proceso_fabricacion?: Array<{
      paso: number
      descripcion: string
      tiempo_estimado: number
      herramientas: string[]
      notas: string
    }>
    imagen?: any
    imagenUrl?: any
  }>
  grupos_cotizacion?: Array<{
    nombre: string
    items: any[]
    subtotal: number
  }>
}

export default function ProduccionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [orden, setOrden] = useState<OrdenTrabajo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarOrden()
  }, [resolvedParams.id])

  const cargarOrden = async () => {
    try {
      const response = await fetch(`/api/ordenes-trabajo/${resolvedParams.id}`)
      const data = await response.json()

      if (data.success && data.orden) {
        setOrden(data.orden)
      } else {
        console.error("Error en respuesta:", data)
        toast.error(data.message || "Error al cargar la orden de trabajo")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/ordenes-trabajo/${resolvedParams.id}/produccion-pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `Produccion-${orden?.numero || "orden"}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("PDF descargado exitosamente")
      } else {
        toast.error("Error al generar PDF")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de conexión")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!orden) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Orden no encontrada</h2>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    )
  }

  // Consolidar todos los materiales de todos los productos
  const materialesConsolidados =
    orden.items_cotizacion?.reduce(
      (acc, item) => {
        item.materiales_calculados?.forEach((material) => {
          const key = `${material.material_id}-${material.nombre}`
          if (acc[key]) {
            acc[key].cantidad += material.cantidad
            acc[key].precio_total += material.precio_total
          } else {
            acc[key] = { ...material }
          }
        })
        return acc
      },
      {} as Record<string, any>,
    ) || {}

  const materialesArray = Object.values(materialesConsolidados)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra de herramientas - Solo visible en pantalla */}
      <div className="bg-white shadow-sm border-b p-4 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido de producción */}
      <div className="max-w-7xl mx-auto p-6 print:p-0">
        <div className="bg-white rounded-lg shadow-lg print:shadow-none">
          {/* Encabezado Principal */}
          <div className="bg-blue-600 text-white p-6 rounded-t-lg print:rounded-none">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">HOJA DE PRODUCCIÓN</h1>
                <p className="text-blue-100">ArquiAlum Honduras - Sistema de Fabricación</p>
              </div>
              <div className="text-right">
                <div className="bg-white text-blue-600 p-4 rounded-lg">
                  <p className="font-bold text-lg">Orden: {orden.numero}</p>
                  <p className="text-sm">Cotización: {orden.cotizacion_numero}</p>
                  <Badge variant={orden.estado === "pendiente" ? "destructive" : "default"}>
                    {orden.estado.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Información del Cliente y Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-500">CLIENTE</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-bold text-lg">{orden.cliente_nombre}</p>
                  <p className="text-sm text-gray-600">{orden.cliente_telefono}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-500">FECHA INICIO</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-bold text-lg">{new Date(orden.fecha_inicio).toLocaleDateString("es-HN")}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-500">FECHA ENTREGA</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-bold text-lg text-red-600">
                    {new Date(orden.fecha_estimada_fin).toLocaleDateString("es-HN")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista Consolidada de Materiales */}
            <Card className="mb-8">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  LISTA CONSOLIDADA DE MATERIALES
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Cantidad Total
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Unidad</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Disponible
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {materialesArray.map((material, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium">{material.nombre}</div>
                            {material.especificaciones && (
                              <div className="text-xs text-gray-500 mt-1">
                                {JSON.stringify(material.especificaciones)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline">{material.categoria}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center font-bold">{material.cantidad.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">{material.unidad}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="w-16 h-8 border rounded mx-auto"></div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="w-20 h-8 border rounded mx-auto"></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Productos Detallados */}
            <div className="space-y-8">
              {orden.items_cotizacion?.map((producto, index) => (
                <Card key={index} className="border-2 border-blue-200">
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="flex items-center gap-4">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{producto.nombre}</h3>
                        <p className="text-sm text-gray-600">{producto.descripcion}</p>
                        <div className="flex gap-4 mt-2">
                          <Badge variant="secondary">Cantidad: {producto.cantidad}</Badge>
                          {producto.dimensiones && (
                            <Badge variant="outline">
                              {producto.dimensiones.ancho} x {producto.dimensiones.alto} cm
                            </Badge>
                          )}
                        </div>
                      </div>
                      {producto.imagenUrl && (
                        <img
                          src={producto.imagenUrl || "/placeholder.svg"}
                          alt={producto.nombre}
                          className="w-24 h-24 object-cover rounded border"
                        />
                      )}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6">
                    {/* Especificaciones Técnicas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-bold mb-3 flex items-center gap-2">
                          <Ruler className="w-4 h-4" />
                          Especificaciones Técnicas
                        </h4>
                        <div className="space-y-2 text-sm">
                          {producto.especificaciones?.tipo_vidrio && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tipo de Vidrio:</span>
                              <span className="font-medium">{producto.especificaciones.tipo_vidrio}</span>
                            </div>
                          )}
                          {producto.especificaciones?.color_pvc && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Color PVC:</span>
                              <span className="font-medium">{producto.especificaciones.color_pvc}</span>
                            </div>
                          )}
                          {producto.especificaciones?.color_aluminio && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Color Aluminio:</span>
                              <span className="font-medium">{producto.especificaciones.color_aluminio}</span>
                            </div>
                          )}
                          {producto.especificaciones?.decorado && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Decorado:</span>
                              <span className="font-medium">{producto.especificaciones.decorado}</span>
                            </div>
                          )}
                          {producto.especificaciones?.tipo_apertura && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tipo Apertura:</span>
                              <span className="font-medium">{producto.especificaciones.tipo_apertura}</span>
                            </div>
                          )}
                          {producto.especificaciones?.herrajes && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Herrajes:</span>
                              <span className="font-medium">{producto.especificaciones.herrajes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dimensiones */}
                      {producto.dimensiones && (
                        <div>
                          <h4 className="font-bold mb-3">Dimensiones</h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {producto.dimensiones.ancho} x {producto.dimensiones.alto}
                              </div>
                              <div className="text-sm text-gray-600">cm (Ancho x Alto)</div>
                              <div className="text-lg font-medium mt-2">
                                Área: {producto.dimensiones.area?.toFixed(2)} m²
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Materiales del Producto */}
                    {producto.materiales_calculados && producto.materiales_calculados.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-bold mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Materiales Específicos
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="border border-gray-300 px-3 py-2 text-left">Material</th>
                                <th className="border border-gray-300 px-3 py-2 text-center">Cantidad</th>
                                <th className="border border-gray-300 px-3 py-2 text-center">Unidad</th>
                                <th className="border border-gray-300 px-3 py-2 text-center">Usado</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Notas</th>
                              </tr>
                            </thead>
                            <tbody>
                              {producto.materiales_calculados.map((material, materialIndex) => (
                                <tr key={materialIndex}>
                                  <td className="border border-gray-300 px-3 py-2">
                                    <div className="font-medium">{material.nombre}</div>
                                    <div className="text-xs text-gray-500">{material.categoria}</div>
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">
                                    {material.cantidad.toFixed(2)}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-center">{material.unidad}</td>
                                  <td className="border border-gray-300 px-3 py-2 text-center">
                                    <div className="w-16 h-6 border rounded mx-auto"></div>
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2">
                                    <div className="w-full h-6 border rounded"></div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Proceso de Fabricación */}
                    <div>
                      <h4 className="font-bold mb-3 flex items-center gap-2">
                        <Wrench className="w-4 h-4" />
                        Proceso de Fabricación
                      </h4>
                      <div className="space-y-3">
                        {[
                          "1. Corte de perfiles según medidas especificadas",
                          "2. Preparación y limpieza de materiales",
                          "3. Ensamble de marco principal",
                          "4. Instalación de herrajes y accesorios",
                          "5. Colocación de vidrio con sellado",
                          "6. Control de calidad y ajustes finales",
                          "7. Empaque y preparación para entrega",
                        ].map((paso, pasoIndex) => (
                          <div key={pasoIndex} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              ✓
                            </div>
                            <span className="flex-1">{paso}</span>
                            <div className="text-xs text-gray-500">Responsable: _______________</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Imagen técnica si existe */}
                    {producto.imagenUrl && (
                      <div className="mt-6 text-center">
                        <h4 className="font-bold mb-4">Diagrama Técnico</h4>
                        <div className="border-2 border-gray-200 rounded-lg p-4 inline-block bg-white">
                          <img
                            src={producto.imagenUrl || "/placeholder.svg"}
                            alt={`Diagrama técnico de ${producto.nombre}`}
                            className="max-w-md max-h-64 mx-auto"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Control de Calidad */}
            <Card className="mt-8">
              <CardHeader className="bg-yellow-50">
                <CardTitle>Control de Calidad</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold mb-3">Verificaciones Obligatorias</h4>
                    <div className="space-y-2">
                      {[
                        "Medidas exactas según especificaciones",
                        "Calidad de cortes y acabados",
                        "Funcionamiento de herrajes",
                        "Sellado correcto de vidrios",
                        "Limpieza general del producto",
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-3">Firmas de Responsabilidad</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="border-t border-gray-400 w-48 mb-2"></div>
                        <p className="text-sm font-medium">Supervisor de Producción</p>
                        <p className="text-xs text-gray-500">Fecha: _______________</p>
                      </div>
                      <div>
                        <div className="border-t border-gray-400 w-48 mb-2"></div>
                        <p className="text-sm font-medium">Control de Calidad</p>
                        <p className="text-xs text-gray-500">Fecha: _______________</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
