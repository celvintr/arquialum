"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Printer, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface OrdenTrabajo {
  _id: string
  numero: string
  cotizacion_id: string
  cotizacion_numero: string
  cliente_nombre: string
  fecha_inicio: string
  items_cotizacion: Array<{
    tipo?: string
    nombre: string
    descripcion: string
    cantidad: number
    dimensiones?: {
      ancho: number
      alto: number
      area: number
    }
    especificaciones?: {
      tipo_vidrio?: string
      color_pvc?: string
      decorado?: string
    }
    materiales?: Array<{
      nombre: string
      cantidad: number
      unidad: string
    }>
    imagen?: any
    imagenUrl?: any
  }>
}

export default function ComandaFabricacionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [orden, setOrden] = useState<OrdenTrabajo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarOrden()
  }, [resolvedParams.id])

  const cargarOrden = async () => {
    try {
      console.log("Cargando orden con ID:", resolvedParams.id)
      const response = await fetch(`/api/ordenes-trabajo/${resolvedParams.id}`)
      const data = await response.json()

      console.log("Respuesta de la API:", data)

      if (data.success && data.orden) {
        setOrden(data.orden)
        toast.success("Orden cargada correctamente")
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
          <p className="text-gray-600 mb-4">ID buscado: {resolvedParams.id}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra de herramientas - Solo visible en pantalla */}
      <div className="bg-white shadow-sm border-b p-4 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex gap-2">
            <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir Comanda
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido de la comanda */}
      <div className="max-w-4xl mx-auto p-6 print:p-0">
        <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
          {/* Encabezado */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Comanda de Fabricación</h1>
                <p className="text-lg">
                  <span className="font-medium">Fabricación para:</span> {orden.cliente_nombre}
                </p>
                <p className="text-sm text-gray-600">
                  Fecha de Creación: {new Date(orden.fecha_inicio).toLocaleDateString("es-HN")}
                </p>
              </div>
              <div className="text-right">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="font-bold">Orden: {orden.numero}</p>
                  <p className="text-sm">Cotización: {orden.cotizacion_numero}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="space-y-8">
            {orden.items_cotizacion?.map((producto, index) => (
              <Card key={index} className="border-2 border-gray-200">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="flex items-center gap-4">
                    {producto.imagenUrl && (
                      <img
                        src={producto.imagenUrl || "/placeholder.svg"}
                        alt={producto.nombre}
                        className="w-20 h-20 object-cover rounded border"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-bold">{producto.nombre}</h3>
                      <p className="text-sm text-gray-600">{producto.descripcion}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Tabla de especificaciones */}
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 px-4 py-2 text-left">Dimensiones</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Decorado</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Color PVC</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Tipo de Vidrio</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Cantidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">
                            {producto.dimensiones
                              ? `${producto.dimensiones.ancho} x ${producto.dimensiones.alto}`
                              : "N/A"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {producto.especificaciones?.decorado || "N/A"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {producto.especificaciones?.color_pvc || "N/A"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {producto.especificaciones?.tipo_vidrio || "N/A"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                            {producto.cantidad}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Gráfico/Imagen del producto */}
                  {producto.imagenUrl && (
                    <div className="text-center mb-6">
                      <h4 className="font-bold mb-4">Gráfico del Producto</h4>
                      <div className="border-2 border-gray-200 rounded-lg p-4 inline-block">
                        <img
                          src={producto.imagenUrl || "/placeholder.svg"}
                          alt={`Gráfico de ${producto.nombre}`}
                          className="max-w-md max-h-64 mx-auto"
                        />
                      </div>
                    </div>
                  )}

                  {/* Lista de materiales */}
                  {producto.materiales && producto.materiales.length > 0 && (
                    <div>
                      <h4 className="font-bold mb-4">Materiales Necesarios:</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-gray-300 px-4 py-2 text-left">Material</th>
                              <th className="border border-gray-300 px-4 py-2 text-center">Cantidad</th>
                              <th className="border border-gray-300 px-4 py-2 text-center">Unidad</th>
                            </tr>
                          </thead>
                          <tbody>
                            {producto.materiales.map((material, materialIndex) => (
                              <tr key={materialIndex}>
                                <td className="border border-gray-300 px-4 py-2">{material.nombre}</td>
                                <td className="border border-gray-300 px-4 py-2 text-center">{material.cantidad}</td>
                                <td className="border border-gray-300 px-4 py-2 text-center">{material.unidad}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Notas adicionales */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-bold mb-2">Notas Importantes:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Verificar todas las medidas antes de iniciar la fabricación</li>
              <li>Confirmar disponibilidad de materiales en inventario</li>
              <li>Seguir estrictamente las especificaciones de color y tipo de vidrio</li>
              <li>Reportar cualquier discrepancia al supervisor de producción</li>
            </ul>
          </div>

          {/* Firmas */}
          <div className="flex justify-between mt-12">
            <div className="text-center">
              <div className="border-t border-gray-500 w-48 mx-auto mb-2"></div>
              <p className="text-sm font-medium">Supervisor de Producción</p>
              <p className="text-xs text-gray-500">Fecha: _______________</p>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-500 w-48 mx-auto mb-2"></div>
              <p className="text-sm font-medium">Operario Responsable</p>
              <p className="text-xs text-gray-500">Fecha: _______________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
