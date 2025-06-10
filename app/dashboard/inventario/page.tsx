"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Package, TrendingDown, TrendingUp, AlertTriangle, Eye } from "lucide-react"
import { toast } from "sonner"

interface MovimientoInventario {
  _id: string
  material_nombre: string
  tipo_movimiento: string
  cantidad: number
  fecha: string
  usuario: string
}

export default function InventarioPage() {
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([])
  const [loading, setLoading] = useState(true)
  const [showMovimientoModal, setShowMovimientoModal] = useState(false)
  const [materialId, setMaterialId] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [tipo, setTipo] = useState("")
  const [motivo, setMotivo] = useState("")

  useEffect(() => {
    cargarMovimientos()
  }, [])

  const cargarMovimientos = async () => {
    try {
      const response = await fetch("/api/inventario")
      const data = await response.json()

      if (data.success) {
        setMovimientos(data.movimientos)
      }
    } catch (error) {
      console.error("Error cargando movimientos:", error)
      toast.error("Error al cargar los movimientos")
    } finally {
      setLoading(false)
    }
  }

  const registrarMovimiento = async () => {
    if (!materialId || !cantidad || !tipo) {
      toast.error("Completa todos los campos")
      return
    }

    try {
      const response = await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          material_id: materialId,
          material_nombre: `Material ${materialId}`,
          tipo_movimiento: tipo,
          cantidad: Number.parseInt(cantidad),
          costo_unitario: 100,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Movimiento registrado exitosamente")
        setShowMovimientoModal(false)
        setMaterialId("")
        setCantidad("")
        setTipo("")
        setMotivo("")
        cargarMovimientos()
      } else {
        toast.error(data.error || "Error al registrar el movimiento")
      }
    } catch (error) {
      console.error("Error registrando movimiento:", error)
      toast.error("Error al registrar el movimiento")
    }
  }

  const getTipoMovimientoBadge = (tipo: string, cantidad: number) => {
    if (tipo === "entrada" || cantidad > 0) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <TrendingUp className="w-3 h-3 mr-1" />
          Entrada
        </Badge>
      )
    } else {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          <TrendingDown className="w-3 h-3 mr-1" />
          Salida
        </Badge>
      )
    }
  }

  const totalEntradas = movimientos.filter((m) => m.tipo_movimiento === "entrada").length
  const totalSalidas = movimientos.filter((m) => m.tipo_movimiento === "salida").length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📦 Control de Inventario</h1>
          <p className="text-gray-600">Movimientos y valoración de inventario</p>
        </div>
        <Dialog open={showMovimientoModal} onOpenChange={setShowMovimientoModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Movimiento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Movimiento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  placeholder="ID del material"
                  value={materialId}
                  onChange={(e) => setMaterialId(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  placeholder="0"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="salida">Salida</SelectItem>
                    <SelectItem value="ajuste">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={registrarMovimiento} className="flex-1">
                  Registrar
                </Button>
                <Button variant="outline" onClick={() => setShowMovimientoModal(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Entradas</p>
                <p className="text-2xl font-bold">{totalEntradas}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Salidas</p>
                <p className="text-2xl font-bold">{totalSalidas}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Materiales Activos</p>
                <p className="text-2xl font-bold">45</p>
              </div>
              <Package className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Stock Bajo</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Movimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientos.map((movimiento) => (
                <TableRow key={movimiento._id}>
                  <TableCell>{movimiento.material_nombre}</TableCell>
                  <TableCell>{getTipoMovimientoBadge(movimiento.tipo_movimiento, movimiento.cantidad)}</TableCell>
                  <TableCell
                    className={movimiento.cantidad > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}
                  >
                    {movimiento.cantidad > 0 ? "+" : ""}
                    {movimiento.cantidad}
                  </TableCell>
                  <TableCell>{new Date(movimiento.fecha).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{movimiento.usuario}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
