"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Plus, Edit, Calculator } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ParametrosConfiguracionPage() {
  const { toast } = useToast()
  const [parametrosManoObra, setParametrosManoObra] = useState<any[]>([])
  const [configuracionMalla, setConfiguracionMalla] = useState<any>({
    materiales_que_contribuyen: [],
    incluye_mano_obra: false,
    tarifa_mano_obra_m2: 0,
  })
  const [materiales, setMateriales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modal para parámetros de mano de obra
  const [modalParametroAbierto, setModalParametroAbierto] = useState(false)
  const [parametroEditando, setParametroEditando] = useState<any>(null)
  const [formularioParametro, setFormularioParametro] = useState({
    nombre: "",
    tipo: "fabricacion",
    tarifa_por_m2: 400,
    activo: true,
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      // Cargar parámetros de mano de obra
      const parametrosResponse = await fetch("/api/configuracion/parametros-mano-obra")
      const parametrosData = await parametrosResponse.json()
      if (parametrosData.success) {
        setParametrosManoObra(parametrosData.parametros)
      }

      // Cargar configuración de malla
      const mallaResponse = await fetch("/api/configuracion/malla")
      const mallaData = await mallaResponse.json()
      if (mallaData.success) {
        setConfiguracionMalla(mallaData.configuracion)
      }

      // Cargar materiales
      const materialesResponse = await fetch("/api/materiales")
      const materialesData = await materialesResponse.json()
      if (materialesData.success) {
        setMateriales(materialesData.materiales)
      }
    } catch (error) {
      console.error("Error cargando datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const guardarParametroManoObra = async () => {
    try {
      const url = parametroEditando
        ? `/api/configuracion/parametros-mano-obra/${parametroEditando._id}`
        : "/api/configuracion/parametros-mano-obra"

      const method = parametroEditando ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formularioParametro),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "¡Éxito!",
          description: parametroEditando ? "Parámetro actualizado correctamente" : "Parámetro creado correctamente",
        })

        setModalParametroAbierto(false)
        cargarDatos()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error guardando parámetro:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el parámetro",
        variant: "destructive",
      })
    }
  }

  const guardarConfiguracionMalla = async () => {
    try {
      const response = await fetch("/api/configuracion/malla", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configuracionMalla),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "¡Éxito!",
          description: "Configuración de malla guardada correctamente",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error guardando configuración de malla:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración de malla",
        variant: "destructive",
      })
    }
  }

  const abrirModalParametro = (parametro?: any) => {
    if (parametro) {
      setParametroEditando(parametro)
      setFormularioParametro(parametro)
    } else {
      setParametroEditando(null)
      setFormularioParametro({
        nombre: "",
        tipo: "fabricacion",
        tarifa_por_m2: 400,
        activo: true,
      })
    }
    setModalParametroAbierto(true)
  }

  const toggleMaterialMalla = (materialId: string) => {
    const materiales = [...configuracionMalla.materiales_que_contribuyen]
    const index = materiales.indexOf(materialId)

    if (index > -1) {
      materiales.splice(index, 1)
    } else {
      materiales.push(materialId)
    }

    setConfiguracionMalla((prev) => ({
      ...prev,
      materiales_que_contribuyen: materiales,
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Parámetros de Configuración</h1>
      </div>

      {/* Parámetros de Mano de Obra */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Parámetros de Mano de Obra
          </CardTitle>

          <Dialog open={modalParametroAbierto} onOpenChange={setModalParametroAbierto}>
            <DialogTrigger asChild>
              <Button onClick={() => abrirModalParametro()}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Parámetro
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{parametroEditando ? "Editar" : "Nuevo"} Parámetro de Mano de Obra</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formularioParametro.nombre}
                    onChange={(e) =>
                      setFormularioParametro((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                      }))
                    }
                    placeholder="Ej: Mano de obra fabricación ventana"
                  />
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formularioParametro.tipo}
                    onValueChange={(value) =>
                      setFormularioParametro((prev) => ({
                        ...prev,
                        tipo: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fabricacion">Fabricación</SelectItem>
                      <SelectItem value="instalacion">Instalación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tarifa">Tarifa por m² (Lempiras)</Label>
                  <Input
                    id="tarifa"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formularioParametro.tarifa_por_m2}
                    onChange={(e) =>
                      setFormularioParametro((prev) => ({
                        ...prev,
                        tarifa_por_m2: Number.parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="activo"
                    checked={formularioParametro.activo}
                    onCheckedChange={(checked) =>
                      setFormularioParametro((prev) => ({
                        ...prev,
                        activo: checked,
                      }))
                    }
                  />
                  <Label htmlFor="activo">Parámetro activo</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button variant="outline" onClick={() => setModalParametroAbierto(false)}>
                  Cancelar
                </Button>
                <Button onClick={guardarParametroManoObra}>{parametroEditando ? "Actualizar" : "Crear"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tarifa por m²</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parametrosManoObra.map((parametro) => (
                <TableRow key={parametro._id}>
                  <TableCell className="font-medium">{parametro.nombre}</TableCell>
                  <TableCell>
                    <Badge variant={parametro.tipo === "fabricacion" ? "default" : "secondary"}>{parametro.tipo}</Badge>
                  </TableCell>
                  <TableCell>L {parametro.tarifa_por_m2}</TableCell>
                  <TableCell>
                    <Badge variant={parametro.activo ? "default" : "secondary"}>
                      {parametro.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => abrirModalParametro(parametro)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {parametrosManoObra.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay parámetros configurados. Cree el primer parámetro.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuración de Malla */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Malla</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Materiales que contribuyen al costo de malla</Label>
            <p className="text-sm text-gray-600 mb-4">
              Seleccione los materiales cuyos importes se sumarán para calcular el costo de material de malla
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {materiales.map((material) => (
                <div
                  key={material._id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    configuracionMalla.materiales_que_contribuyen.includes(material._id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => toggleMaterialMalla(material._id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{material.nombre}</span>
                    {configuracionMalla.materiales_que_contribuyen.includes(material._id) && (
                      <Badge variant="default">Seleccionado</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{material.categoria}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="incluye_mano_obra_malla"
                checked={configuracionMalla.incluye_mano_obra}
                onCheckedChange={(checked) =>
                  setConfiguracionMalla((prev) => ({
                    ...prev,
                    incluye_mano_obra: checked,
                  }))
                }
              />
              <Label htmlFor="incluye_mano_obra_malla">Incluir mano de obra en costo de malla</Label>
            </div>

            {configuracionMalla.incluye_mano_obra && (
              <div>
                <Label htmlFor="tarifa_malla">Tarifa de mano de obra por m² (Lempiras)</Label>
                <Input
                  id="tarifa_malla"
                  type="number"
                  min="0"
                  step="0.01"
                  value={configuracionMalla.tarifa_mano_obra_m2}
                  onChange={(e) =>
                    setConfiguracionMalla((prev) => ({
                      ...prev,
                      tarifa_mano_obra_m2: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            )}
          </div>

          <Button onClick={guardarConfiguracionMalla}>Guardar Configuración de Malla</Button>
        </CardContent>
      </Card>
    </div>
  )
}
