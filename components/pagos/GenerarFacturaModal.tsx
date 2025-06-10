"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Plus, Trash, Save, Printer, Download } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GenerarFacturaModalProps {
  pago: any
  isOpen: boolean
  onClose: () => void
  onFacturaGenerada: (factura: any) => void
}

export default function GenerarFacturaModal({ pago, isOpen, onClose, onFacturaGenerada }: GenerarFacturaModalProps) {
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [cliente, setCliente] = useState<any>(null)
  const [orden, setOrden] = useState<any>(null)
  const [cotizacion, setCotizacion] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("detalles")

  // Datos de la factura
  const [facturaData, setFacturaData] = useState({
    numero: "",
    fecha: new Date().toISOString().split("T")[0],
    fecha_vencimiento: "",
    condiciones_pago: "Contado",
    notas: "",
    terminos: "",
    items: [] as any[],
    subtotal: 0,
    impuesto: 0,
    total: 0,
  })

  useEffect(() => {
    if (pago && isOpen) {
      cargarDatos()
    }
  }, [pago, isOpen])

  const cargarDatos = async () => {
    if (!pago) return

    try {
      setLoading(true)

      // Generar número de factura
      const facturaNumero = `F-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`

      // Cargar cliente
      if (pago.cliente_id) {
        const clienteResponse = await fetch(`/api/clientes/${pago.cliente_id}`)
        if (clienteResponse.ok) {
          const clienteData = await clienteResponse.json()
          setCliente(clienteData.cliente)
        }
      }

      // Cargar orden de trabajo
      if (pago.orden_trabajo_id) {
        const ordenResponse = await fetch(`/api/ordenes-trabajo/${pago.orden_trabajo_id}`)
        if (ordenResponse.ok) {
          const ordenData = await ordenResponse.json()
          setOrden(ordenData.orden)

          // Cargar cotización
          if (ordenData.orden?.cotizacion_id) {
            const cotizacionResponse = await fetch(`/api/cotizaciones/${ordenData.orden.cotizacion_id}`)
            if (cotizacionResponse.ok) {
              const cotizacionData = await cotizacionResponse.json()
              setCotizacion(cotizacionData.cotizacion)

              // Preparar items de factura basados en la cotización
              const items = cotizacionData.cotizacion.items.map((item: any) => ({
                descripcion: item.descripcion || `${item.producto_nombre || "Producto"} ${item.dimensiones || ""}`,
                cantidad: item.cantidad || 1,
                precio_unitario: item.precio_unitario || item.precio || 0,
                impuesto: item.impuesto || 0,
                total: item.total || 0,
              }))

              // Calcular totales
              const subtotal = items.reduce((sum: number, item: any) => sum + item.precio_unitario * item.cantidad, 0)
              const impuesto = items.reduce((sum: number, item: any) => sum + item.impuesto, 0)
              const total = subtotal + impuesto

              // Actualizar datos de factura
              setFacturaData({
                ...facturaData,
                numero: facturaNumero,
                items,
                subtotal,
                impuesto,
                total,
                notas: `Pago #${pago.numero} - Orden de trabajo #${ordenData.orden.numero}`,
                terminos: "Garantía de 30 días en materiales y mano de obra.",
              })
            }
          }
        }
      }
    } catch (error) {
      console.error("Error cargando datos:", error)
      toast.error("Error al cargar los datos para la factura")
    } finally {
      setLoading(false)
    }
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...facturaData.items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Recalcular totales del item
    if (field === "cantidad" || field === "precio_unitario") {
      const cantidad = field === "cantidad" ? value : newItems[index].cantidad
      const precioUnitario = field === "precio_unitario" ? value : newItems[index].precio_unitario

      newItems[index].total = cantidad * precioUnitario

      // Calcular impuesto (15%)
      newItems[index].impuesto = newItems[index].total * 0.15
    }

    // Actualizar items y recalcular totales
    const subtotal = newItems.reduce((sum, item) => sum + (item.total || 0), 0)
    const impuesto = newItems.reduce((sum, item) => sum + (item.impuesto || 0), 0)
    const total = subtotal + impuesto

    setFacturaData({
      ...facturaData,
      items: newItems,
      subtotal,
      impuesto,
      total,
    })
  }

  const agregarItem = () => {
    const newItems = [
      ...facturaData.items,
      {
        descripcion: "",
        cantidad: 1,
        precio_unitario: 0,
        impuesto: 0,
        total: 0,
      },
    ]
    setFacturaData({ ...facturaData, items: newItems })
  }

  const eliminarItem = (index: number) => {
    const newItems = facturaData.items.filter((_, i) => i !== index)

    // Recalcular totales
    const subtotal = newItems.reduce((sum, item) => sum + (item.total || 0), 0)
    const impuesto = newItems.reduce((sum, item) => sum + (item.impuesto || 0), 0)
    const total = subtotal + impuesto

    setFacturaData({
      ...facturaData,
      items: newItems,
      subtotal,
      impuesto,
      total,
    })
  }

  const guardarFactura = async () => {
    if (!pago || !cliente) {
      toast.error("Faltan datos necesarios para generar la factura")
      return
    }

    try {
      setGuardando(true)

      const facturaPayload = {
        numero: facturaData.numero,
        cliente_id: cliente._id,
        cliente_nombre: cliente.nombre,
        cliente_rtn: cliente.rtn || "",
        cliente_direccion: cliente.direccion || "",
        cliente_telefono: cliente.telefono || "",
        fecha: facturaData.fecha,
        fecha_vencimiento: facturaData.fecha_vencimiento || facturaData.fecha,
        condiciones_pago: facturaData.condiciones_pago,
        items: facturaData.items,
        subtotal: facturaData.subtotal,
        impuesto: facturaData.impuesto,
        total: facturaData.total,
        estado: "emitida",
        notas: facturaData.notas,
        terminos: facturaData.terminos,
        orden_trabajo_id: pago.orden_trabajo_id,
        pagos: [
          {
            pago_id: pago._id,
            monto: pago.monto,
            fecha: pago.fecha,
            metodo: pago.metodo_pago,
            referencia: pago.referencia,
          },
        ],
      }

      const response = await fetch("/api/facturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(facturaPayload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error al guardar la factura")
      }

      const data = await response.json()
      toast.success(`Factura ${facturaData.numero} generada exitosamente`)
      onFacturaGenerada(data.factura)
      onClose()
    } catch (error) {
      console.error("Error guardando factura:", error)
      toast.error(error.message || "Error al guardar la factura")
    } finally {
      setGuardando(false)
    }
  }

  // Formatear números
  const formatNumber = (value: number) => {
    return value.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  if (!pago) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-6 h-6" />
            Generar Factura
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            <span>Cargando datos...</span>
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="detalles">Detalles</TabsTrigger>
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="vista-previa">Vista Previa</TabsTrigger>
              </TabsList>

              {/* Pestaña de Detalles */}
              <TabsContent value="detalles" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información de la Factura */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Información de la Factura</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="numero">Número de Factura</Label>
                        <Input
                          id="numero"
                          value={facturaData.numero}
                          onChange={(e) => setFacturaData({ ...facturaData, numero: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fecha">Fecha de Emisión</Label>
                        <Input
                          id="fecha"
                          type="date"
                          value={facturaData.fecha}
                          onChange={(e) => setFacturaData({ ...facturaData, fecha: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
                        <Input
                          id="fecha_vencimiento"
                          type="date"
                          value={facturaData.fecha_vencimiento}
                          onChange={(e) => setFacturaData({ ...facturaData, fecha_vencimiento: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="condiciones_pago">Condiciones de Pago</Label>
                        <Select
                          value={facturaData.condiciones_pago}
                          onValueChange={(value) => setFacturaData({ ...facturaData, condiciones_pago: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar condición" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Contado">Contado</SelectItem>
                            <SelectItem value="Crédito 15 días">Crédito 15 días</SelectItem>
                            <SelectItem value="Crédito 30 días">Crédito 30 días</SelectItem>
                            <SelectItem value="Crédito 60 días">Crédito 60 días</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Información del Cliente */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Información del Cliente</h3>

                    {cliente ? (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">Nombre:</span>
                              <span>{cliente.nombre}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">RTN:</span>
                              <span>{cliente.rtn || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Teléfono:</span>
                              <span>{cliente.telefono || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Email:</span>
                              <span>{cliente.email || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Dirección:</span>
                              <span>{cliente.direccion || "N/A"}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
                        No se encontró información del cliente
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-medium">Información Adicional</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="notas">Notas</Label>
                      <textarea
                        id="notas"
                        className="w-full min-h-[100px] p-2 border rounded-md"
                        value={facturaData.notas}
                        onChange={(e) => setFacturaData({ ...facturaData, notas: e.target.value })}
                        placeholder="Notas adicionales para la factura..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="terminos">Términos y Condiciones</Label>
                      <textarea
                        id="terminos"
                        className="w-full min-h-[100px] p-2 border rounded-md"
                        value={facturaData.terminos}
                        onChange={(e) => setFacturaData({ ...facturaData, terminos: e.target.value })}
                        placeholder="Términos y condiciones de la factura..."
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Pestaña de Items */}
              <TabsContent value="items" className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Items de la Factura</h3>
                  <Button onClick={agregarItem} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Item
                  </Button>
                </div>

                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Descripción</th>
                        <th className="px-4 py-2 text-center">Cantidad</th>
                        <th className="px-4 py-2 text-right">Precio Unit.</th>
                        <th className="px-4 py-2 text-right">Impuesto</th>
                        <th className="px-4 py-2 text-right">Total</th>
                        <th className="px-4 py-2 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facturaData.items.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                            No hay items en la factura. Haga clic en "Agregar Item".
                          </td>
                        </tr>
                      ) : (
                        facturaData.items.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">
                              <Input
                                value={item.descripcion}
                                onChange={(e) => handleItemChange(index, "descripcion", e.target.value)}
                                placeholder="Descripción del item"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                min="1"
                                value={item.cantidad}
                                onChange={(e) =>
                                  handleItemChange(index, "cantidad", Number.parseInt(e.target.value) || 0)
                                }
                                className="text-center"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.precio_unitario}
                                onChange={(e) =>
                                  handleItemChange(index, "precio_unitario", Number.parseFloat(e.target.value) || 0)
                                }
                                className="text-right"
                              />
                            </td>
                            <td className="px-4 py-2 text-right">L {formatNumber(item.impuesto || 0)}</td>
                            <td className="px-4 py-2 text-right font-medium">L {formatNumber(item.total || 0)}</td>
                            <td className="px-4 py-2 text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => eliminarItem(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr className="border-t">
                        <td colSpan={3} className="px-4 py-2 text-right font-medium">
                          Subtotal:
                        </td>
                        <td colSpan={3} className="px-4 py-2 text-right font-medium">
                          L {formatNumber(facturaData.subtotal)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right font-medium">
                          Impuesto (15%):
                        </td>
                        <td colSpan={3} className="px-4 py-2 text-right font-medium">
                          L {formatNumber(facturaData.impuesto)}
                        </td>
                      </tr>
                      <tr className="bg-gray-100">
                        <td colSpan={3} className="px-4 py-2 text-right font-bold">
                          Total:
                        </td>
                        <td colSpan={3} className="px-4 py-2 text-right font-bold text-green-600">
                          L {formatNumber(facturaData.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </TabsContent>

              {/* Pestaña de Vista Previa */}
              <TabsContent value="vista-previa" className="space-y-4 pt-4">
                <div className="flex justify-end gap-2 mb-4">
                  <Button variant="outline" size="sm">
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>

                <div className="border rounded-lg p-8 bg-white">
                  {/* Encabezado de la Factura */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-2xl font-bold">FACTURA</h2>
                      <p className="text-gray-600"># {facturaData.numero}</p>
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold text-lg">EMPRESA S.A.</h3>
                      <p className="text-sm text-gray-600">RTN: 08019999123456</p>
                      <p className="text-sm text-gray-600">Dirección: Calle Principal, Ciudad</p>
                      <p className="text-sm text-gray-600">Tel: (504) 2222-3333</p>
                    </div>
                  </div>

                  {/* Información Cliente y Factura */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="space-y-2">
                      <h4 className="font-bold text-gray-700">Cliente:</h4>
                      <p>{cliente?.nombre || "N/A"}</p>
                      <p>RTN: {cliente?.rtn || "N/A"}</p>
                      <p>{cliente?.direccion || "N/A"}</p>
                      <p>Tel: {cliente?.telefono || "N/A"}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-700">Fecha de Emisión:</span>
                        <span>{new Date(facturaData.fecha).toLocaleDateString("es-HN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-700">Fecha de Vencimiento:</span>
                        <span>
                          {facturaData.fecha_vencimiento
                            ? new Date(facturaData.fecha_vencimiento).toLocaleDateString("es-HN")
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-700">Condiciones de Pago:</span>
                        <span>{facturaData.condiciones_pago}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-700">Orden de Trabajo:</span>
                        <span>#{orden?.numero || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tabla de Items */}
                  <table className="w-full mb-8">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left">Descripción</th>
                        <th className="px-4 py-2 text-center">Cantidad</th>
                        <th className="px-4 py-2 text-right">Precio Unit.</th>
                        <th className="px-4 py-2 text-right">Impuesto</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facturaData.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-2">{item.descripcion}</td>
                          <td className="px-4 py-2 text-center">{item.cantidad}</td>
                          <td className="px-4 py-2 text-right">L {formatNumber(item.precio_unitario)}</td>
                          <td className="px-4 py-2 text-right">L {formatNumber(item.impuesto)}</td>
                          <td className="px-4 py-2 text-right">L {formatNumber(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-right font-medium">Subtotal:</td>
                        <td className="px-4 py-2 text-right">L {formatNumber(facturaData.subtotal)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-right font-medium">Impuesto (15%):</td>
                        <td className="px-4 py-2 text-right">L {formatNumber(facturaData.impuesto)}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-right font-bold">Total:</td>
                        <td className="px-4 py-2 text-right font-bold">L {formatNumber(facturaData.total)}</td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Información de Pago */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="space-y-2">
                      <h4 className="font-bold text-gray-700">Información de Pago:</h4>
                      <p>Método: {pago.metodo_pago}</p>
                      <p>Referencia: {pago.referencia || "N/A"}</p>
                      <p>Fecha: {new Date(pago.fecha).toLocaleDateString("es-HN")}</p>
                      <p className="font-bold">Monto Pagado: L {formatNumber(pago.monto)}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-gray-700">Notas:</h4>
                      <p className="text-sm">{facturaData.notas}</p>
                    </div>
                  </div>

                  {/* Términos y Condiciones */}
                  <div className="border-t pt-4">
                    <h4 className="font-bold text-gray-700 mb-2">Términos y Condiciones:</h4>
                    <p className="text-sm text-gray-600">{facturaData.terminos}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Acciones */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={guardarFactura} disabled={guardando} className="bg-green-600 hover:bg-green-700">
                {guardando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Factura
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
