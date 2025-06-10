"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Calculator } from "lucide-react"

interface CotizacionItem {
  id: string
  producto: string
  cantidad: number
  precio: number
  subtotal: number
}

export default function NuevaCotizacionForm() {
  const [cliente, setCliente] = useState("")
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [items, setItems] = useState<CotizacionItem[]>([])
  const [loading, setLoading] = useState(false)

  const productos = [
    { id: "1", nombre: "Ventana PVC 1x1m", precio: 250 },
    { id: "2", nombre: "Puerta Aluminio 2x2m", precio: 450 },
    { id: "3", nombre: "Barandal Vidrio Templado", precio: 180 },
    { id: "4", nombre: "Ventana Corrediza", precio: 320 },
  ]

  const agregarItem = () => {
    const nuevoItem: CotizacionItem = {
      id: Date.now().toString(),
      producto: "",
      cantidad: 1,
      precio: 0,
      subtotal: 0,
    }
    setItems([...items, nuevoItem])
  }

  const actualizarItem = (id: string, campo: keyof CotizacionItem, valor: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const itemActualizado = { ...item, [campo]: valor }
          if (campo === "cantidad" || campo === "precio") {
            itemActualizado.subtotal = itemActualizado.cantidad * itemActualizado.precio
          }
          return itemActualizado
        }
        return item
      }),
    )
  }

  const eliminarItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const total = items.reduce((sum, item) => sum + item.subtotal, 0)
  const iva = total * 0.16
  const totalConIva = total + iva

  const guardarCotizacion = async () => {
    setLoading(true)
    try {
      const cotizacion = {
        cliente,
        email,
        telefono,
        items,
        subtotal: total,
        iva,
        total: totalConIva,
        fecha: new Date().toISOString(),
        estado: "borrador",
      }

      const response = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cotizacion),
      })

      if (response.ok) {
        alert("Cotización guardada exitosamente")
        // Reset form
        setCliente("")
        setEmail("")
        setTelefono("")
        setItems([])
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al guardar la cotización")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Información del Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="cliente">Nombre del Cliente</Label>
            <Input
              id="cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@email.com"
            />
          </div>
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
        </CardContent>
      </Card>

      {/* Items de la Cotización */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items de la Cotización</CardTitle>
          <Button onClick={agregarItem} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                <div className="md:col-span-2">
                  <Label>Producto</Label>
                  <Select
                    value={item.producto}
                    onValueChange={(value) => {
                      const producto = productos.find((p) => p.id === value)
                      actualizarItem(item.id, "producto", value)
                      if (producto) {
                        actualizarItem(item.id, "precio", producto.precio)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.map((producto) => (
                        <SelectItem key={producto.id} value={producto.id}>
                          {producto.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => actualizarItem(item.id, "cantidad", Number.parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label>Precio Unit.</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.precio}
                    onChange={(e) => actualizarItem(item.id, "precio", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Subtotal</Label>
                  <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                    ${item.subtotal.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-end">
                  <Button variant="destructive" size="sm" onClick={() => eliminarItem(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay items en la cotización. Haz clic en "Agregar Item" para comenzar.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Totales */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Resumen de Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (16%):</span>
                <span>${iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${totalConIva.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">Cancelar</Button>
        <Button onClick={guardarCotizacion} disabled={loading || !cliente || items.length === 0}>
          {loading ? "Guardando..." : "Guardar Cotización"}
        </Button>
      </div>
    </div>
  )
}
