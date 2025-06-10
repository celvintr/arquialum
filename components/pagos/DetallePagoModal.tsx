"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CreditCard,
  Calendar,
  User,
  FileText,
  Receipt,
  Building,
  Phone,
  Mail,
  MapPin,
  Hash,
  DollarSign,
  Clock,
  AlertCircle,
} from "lucide-react"

interface DetallePagoModalProps {
  pago: any
  isOpen: boolean
  onClose: () => void
  onGenerarFactura: (pago: any) => void
}

export default function DetallePagoModal({ pago, isOpen, onClose, onGenerarFactura }: DetallePagoModalProps) {
  const [orden, setOrden] = useState<any>(null)
  const [cotizacion, setCotizacion] = useState<any>(null)
  const [cliente, setCliente] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (pago && isOpen) {
      cargarDetallesCompletos()
    }
  }, [pago, isOpen])

  const cargarDetallesCompletos = async () => {
    if (!pago) return

    try {
      setLoading(true)

      // Cargar orden de trabajo
      if (pago.orden_trabajo_id) {
        const ordenResponse = await fetch(`/api/ordenes-trabajo/${pago.orden_trabajo_id}`)
        if (ordenResponse.ok) {
          const ordenData = await ordenResponse.json()
          setOrden(ordenData.orden)

          // Cargar cotización si existe
          if (ordenData.orden?.cotizacion_id) {
            const cotizacionResponse = await fetch(`/api/cotizaciones/${ordenData.orden.cotizacion_id}`)
            if (cotizacionResponse.ok) {
              const cotizacionData = await cotizacionResponse.json()
              setCotizacion(cotizacionData.cotizacion)
            }
          }
        }
      }

      // Cargar cliente
      if (pago.cliente_id) {
        const clienteResponse = await fetch(`/api/clientes/${pago.cliente_id}`)
        if (clienteResponse.ok) {
          const clienteData = await clienteResponse.json()
          setCliente(clienteData.cliente)
        }
      }
    } catch (error) {
      console.error("Error cargando detalles:", error)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const estilos = {
      pendiente: "bg-yellow-100 text-yellow-800",
      completado: "bg-green-100 text-green-800",
      anulado: "bg-red-100 text-red-800",
    }
    return <Badge className={estilos[estado] || "bg-gray-100 text-gray-800"}>{estado}</Badge>
  }

  const getTipoBadge = (tipo: string) => {
    const estilos = {
      abono: "bg-blue-100 text-blue-800",
      completo: "bg-green-100 text-green-800",
      anticipo: "bg-purple-100 text-purple-800",
    }
    return <Badge className={estilos[tipo] || "bg-gray-100 text-gray-800"}>{tipo}</Badge>
  }

  // Función segura para formatear números
  const formatNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "0"
    return value.toLocaleString("es-HN")
  }

  if (!pago) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="w-6 h-6" />
            Detalle del Pago #{pago.numero}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            <span>Cargando detalles...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Información Principal del Pago */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Información del Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Número</p>
                        <p className="font-semibold">{pago.numero}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Fecha</p>
                        <p className="font-semibold">{new Date(pago.fecha).toLocaleDateString("es-HN")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Hora</p>
                        <p className="font-semibold">{new Date(pago.fecha).toLocaleTimeString("es-HN")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <div className="mt-1">{getEstadoBadge(pago.estado)}</div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Tipo</p>
                      <div className="mt-1">{getTipoBadge(pago.tipo)}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Monto</p>
                        <p className="font-bold text-green-600 text-lg">L {formatNumber(pago.monto)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Método de Pago</p>
                      <p className="font-semibold capitalize">{pago.metodo_pago}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Referencia</p>
                      <p className="font-semibold">{pago.referencia || "N/A"}</p>
                    </div>

                    {pago.estado === "anulado" && pago.motivo_anulacion && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <p className="text-sm font-medium text-red-800">Pago Anulado</p>
                        </div>
                        <p className="text-sm text-red-700">{pago.motivo_anulacion}</p>
                        {pago.fecha_anulacion && (
                          <p className="text-xs text-red-600 mt-1">
                            Anulado el: {new Date(pago.fecha_anulacion).toLocaleString("es-HN")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {pago.notas && (
                  <div className="mt-6 pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Notas</p>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{pago.notas}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información del Cliente */}
            {cliente && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Nombre</p>
                          <p className="font-semibold">{cliente.nombre}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">RTN</p>
                          <p className="font-semibold">{cliente.rtn || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Teléfono</p>
                          <p className="font-semibold">{cliente.telefono || "N/A"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-semibold">{cliente.email || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {cliente.direccion && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Dirección</p>
                          <p className="font-semibold">{cliente.direccion}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Información de la Orden */}
            {orden && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Orden de Trabajo #{orden.numero}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <Badge className="mt-1">{orden.estado}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Estimado</p>
                      <p className="font-bold text-blue-600">L {formatNumber(orden.costos_estimados?.total)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha Creación</p>
                      <p className="font-semibold">{new Date(orden.created_at).toLocaleDateString("es-HN")}</p>
                    </div>
                  </div>

                  {orden.descripcion && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-2">Descripción</p>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg">{orden.descripcion}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Información de la Cotización */}
            {cotizacion && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Cotización #{cotizacion.numero}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <Badge className="mt-1">{cotizacion.estado}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Subtotal</p>
                      <p className="font-semibold">L {formatNumber(cotizacion.subtotal)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">IVA</p>
                      <p className="font-semibold">L {formatNumber(cotizacion.iva)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-bold text-green-600">L {formatNumber(cotizacion.total)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Acciones */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Receipt className="w-4 h-4 mr-2" />
                  Generar Recibo
                </Button>

                {pago.estado === "completado" && !pago.factura_id && (
                  <Button onClick={() => onGenerarFactura(pago)} className="bg-green-600 hover:bg-green-700">
                    <FileText className="w-4 h-4 mr-2" />
                    Generar Factura
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
