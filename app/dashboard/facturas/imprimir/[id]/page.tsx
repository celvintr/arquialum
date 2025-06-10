"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Printer, Download, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Factura {
  _id: string
  numero: string
  serie: string
  tipo: string
  orden_trabajo_id?: string
  numero_orden?: string
  cliente: {
    nombre: string
    rtn?: string
    direccion?: string
    telefono?: string
    email?: string
  }
  items: Array<{
    tipo: string
    descripcion: string
    cantidad: number
    precio_unitario: number
    descuento: number
    subtotal: number
    impuesto: number
    total: number
  }>
  subtotal: number
  descuento_global: number
  impuesto_total: number
  total: number
  estado: string
  tipo_pago?: string
  monto_pagado: number
  fecha_emision: string
  fecha_vencimiento: string
  terminos_pago: string
  notas?: string
}

export default function ImprimirFacturaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [factura, setFactura] = useState<Factura | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarFactura()
  }, [params.id])

  const cargarFactura = async () => {
    try {
      const response = await fetch(`/api/facturas/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setFactura(data.factura)
      } else {
        toast.error("Error al cargar la factura")
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
      const response = await fetch(`/api/facturas/${params.id}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `Factura-${factura?.numero}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success("PDF descargado exitosamente")
      } else {
        toast.error("Error al generar PDF")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al descargar PDF")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!factura) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Factura no encontrada</h2>
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
      {/* Barra de herramientas */}
      <div className="bg-white shadow-sm border-b p-4 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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

      {/* Contenido de la factura */}
      <div className="max-w-4xl mx-auto p-6 print:p-0">
        <div className="bg-white rounded-lg shadow-lg border-4 border-green-500 p-8 print:shadow-none print:border-2">
          {/* Encabezado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center col-span-2">
              <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mr-6">
                <span className="text-gray-500 text-xs">LOGO</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">ArquiAlum Honduras</h1>
                <p className="text-sm text-gray-600">Colonia Kennedy, Bloque M, Casa 2516</p>
                <p className="text-sm text-gray-600">Tegucigalpa, Honduras</p>
                <p className="text-sm text-gray-600">RTN: 08019016832627</p>
                <p className="text-sm text-gray-600">Tel: +504 9999-9999 / Email: info@arquialum.hn</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-green-100 border-2 border-green-500 p-4 rounded-lg">
                <h2 className="text-xl font-bold text-green-800">FACTURA</h2>
                <p className="text-sm text-gray-600">#{factura.numero}</p>
                <p className="text-sm text-gray-600">Serie: {factura.serie}</p>
                <p className="text-sm text-gray-600">
                  Fecha: {new Date(factura.fecha_emision).toLocaleDateString("es-HN")}
                </p>
                <p className="text-sm text-gray-600">
                  Vence: {new Date(factura.fecha_vencimiento).toLocaleDateString("es-HN")}
                </p>
              </div>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="border border-gray-300 bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-green-800 mb-2">FACTURAR A:</h3>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">Cliente:</span> {factura.cliente.nombre}
              </p>
              <p>
                <span className="font-medium">RTN:</span> {factura.cliente.rtn || "N/A"}
              </p>
              <p>
                <span className="font-medium">Dirección:</span> {factura.cliente.direccion || "N/A"}
              </p>
              <p>
                <span className="font-medium">Teléfono:</span> {factura.cliente.telefono || "N/A"}
              </p>
              {factura.numero_orden && (
                <p>
                  <span className="font-medium">Orden de Trabajo:</span> {factura.numero_orden}
                </p>
              )}
            </div>
          </div>

          {/* Items de la Factura */}
          <div className="mb-6">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th className="border border-gray-300 px-4 py-2 text-center">Cant.</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Descripción</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Precio Unit.</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Desc.</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {factura.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.cantidad || 1}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.descripcion}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      L {item.precio_unitario.toLocaleString("es-HN")}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      L {item.descuento.toLocaleString("es-HN")}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-bold">
                      L {item.total.toLocaleString("es-HN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="mb-6">
            <table className="w-full border-collapse border border-gray-300">
              <tbody>
                <tr>
                  <td colSpan={4} className="text-right border border-gray-300 py-2 px-4 font-medium">
                    Subtotal:
                  </td>
                  <td className="text-right border border-gray-300 py-2 px-4">
                    L {factura.subtotal.toLocaleString("es-HN")}
                  </td>
                </tr>
                {factura.descuento_global > 0 && (
                  <tr>
                    <td colSpan={4} className="text-right border border-gray-300 py-2 px-4 font-medium">
                      Descuento:
                    </td>
                    <td className="text-right border border-gray-300 py-2 px-4 text-red-600">
                      -L {factura.descuento_global.toLocaleString("es-HN")}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={4} className="text-right border border-gray-300 py-2 px-4 font-medium">
                    IVA (15%):
                  </td>
                  <td className="text-right border border-gray-300 py-2 px-4">
                    L {factura.impuesto_total.toLocaleString("es-HN")}
                  </td>
                </tr>
                <tr className="bg-green-100">
                  <td colSpan={4} className="text-right border border-gray-300 py-3 px-4 font-bold text-lg">
                    TOTAL A PAGAR:
                  </td>
                  <td className="text-right border border-gray-300 py-3 px-4 font-bold text-lg text-green-600">
                    L {factura.total.toLocaleString("es-HN")}
                  </td>
                </tr>
                {factura.monto_pagado > 0 && (
                  <>
                    <tr>
                      <td colSpan={4} className="text-right border border-gray-300 py-2 px-4 font-medium">
                        Monto Pagado:
                      </td>
                      <td className="text-right border border-gray-300 py-2 px-4 text-green-600">
                        L {factura.monto_pagado.toLocaleString("es-HN")}
                      </td>
                    </tr>
                    <tr className="bg-yellow-50">
                      <td colSpan={4} className="text-right border border-gray-300 py-2 px-4 font-bold">
                        Saldo Pendiente:
                      </td>
                      <td className="text-right border border-gray-300 py-2 px-4 font-bold text-orange-600">
                        L {(factura.total - factura.monto_pagado).toLocaleString("es-HN")}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Información de Pago */}
          {factura.monto_pagado > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
              <h4 className="font-bold text-blue-800 mb-2">INFORMACIÓN DE PAGO</h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Tipo de Pago:</span>{" "}
                  {factura.tipo_pago === "completo" ? "Pago Completo" : "Abono Parcial"}
                </p>
                <p>
                  <span className="font-medium">Monto Pagado:</span> L {factura.monto_pagado.toLocaleString("es-HN")}
                </p>
                <p>
                  <span className="font-medium">Fecha de Pago:</span>{" "}
                  {new Date(factura.fecha_emision).toLocaleDateString("es-HN")}
                </p>
                {factura.notas && (
                  <p>
                    <span className="font-medium">Notas:</span> {factura.notas}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <p className="font-bold text-gray-800 mb-2">¡Gracias por su preferencia!</p>
            <p className="text-sm text-gray-600 mb-1">
              Esta factura fue generada electrónicamente y es válida sin firma ni sello.
            </p>
            <p className="text-sm text-gray-600">Para consultas: info@arquialum.hn | +504 9999-9999</p>
          </div>
        </div>
      </div>
    </div>
  )
}
