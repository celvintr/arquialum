"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wrench, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ConfiguracionManoObraPage() {
  const { toast } = useToast()
  const [configuraciones, setConfiguraciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [configuracionEditando, setConfiguracionEditando] = useState<any>(null)
  const [materiales, setMateriales] = useState<any[]>([])
  const [tiposProducto, setTiposProducto] = useState<any[]>([])

  // Formulario
  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    tipo: "fabricacion",
    formula: "ancho * alto * tarifa_base",
    tarifa_base: 400,
    activo: true,
    condiciones: {
      tipos_producto: [],
      materiales_requeridos: [],
      materiales_excluidos: [],
      contribuye_malla: false,
    },
    aplicacion: {
      por_producto: true,
      por_material: false,
      materiales_aplicables: [],
    },
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      // Cargar configuraciones
      const configResponse = await fetch("/api/configuracion/mano-obra")
      const configData = await configResponse.json()

      if (configData.success) {
        setConfiguraciones(configData.configuraciones)
      }

      // Cargar materiales
      const materialesResponse = await fetch("/api/materiales")
      const materialesData = await materialesResponse.json()

      if (materialesData.success) {
        setMateriales(materialesData.materiales)
      }

      // Cargar tipos de producto
      const tiposResponse = await fetch("/api/tipos-producto")
      const tiposData = await tiposResponse.json()

      if (tiposData.success) {
        setTiposProducto(tiposData.tipos)
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

  const abrirModal = (configuracion?: any) => {
    if (configuracion) {
      setConfiguracionEditando(configuracion)
      setFormulario(configuracion)
    } else {
      setConfiguracionEditando(null)
      setFormulario({
        nombre: "",
        descripcion: "",
        tipo: "fabricacion",
        formula: "ancho * alto * tarifa_base",
        tarifa_base: 400,
        activo: true,
        condiciones: {
          tipos_producto: [],
          materiales_requeridos: [],
          materiales_excluidos: [],
          contribuye_malla: false,
        },
        aplicacion: {
          por_producto: true,
          por_material: false,
          materiales_aplicables: [],
        },
      })
    }
    setModalAbierto(true)
  }

  const guardarConfiguracion = async () => {
    try {
      const url = configuracionEditando
        ? `/api/configuracion/mano-obra/${configuracionEditando._id}`
        : "/api/configuracion/mano-obra"

      const method = configuracionEditando ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formulario),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "¡Éxito!",
          description: configuracionEditando
            ? "Configuración actualizada correctamente"
            : "Configuración creada correctamente",
        })

        setModalAbierto(false)
        cargarDatos()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error guardando configuración:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      })
    }
  }

  const eliminarConfiguracion = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta configuración?")) return

    try {
      const response = await fetch(`/api/configuracion/mano-obra/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "¡Éxito!",
          description: "Configuración eliminada correctamente",
        })
        cargarDatos()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error eliminando configuración:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la configuración",
        variant: "destructive",
      })
    }
  }

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "fabricacion":
        return "bg-blue-100 text-blue-800"
      case "instalacion":
        return "bg-green-100 text-green-800"
      case "malla":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Wrench className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Configuración de Mano de Obra</h1>
        </div>

        <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Configuración
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{configuracionEditando ? "Editar" : "Nueva"} Configuración de Mano de Obra</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información básica */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formulario.nombre}
                    onChange={(e) => setFormulario((prev) => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Mano de obra fabricación PVC"
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formulario.descripcion}
                    onChange={(e) => setFormulario((prev) => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Descripción detallada de la configuración"
                  />
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formulario.tipo}
                    onValueChange={(value) => setFormulario((prev) => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fabricacion">Fabricación</SelectItem>
                      <SelectItem value="instalacion">Instalación</SelectItem>
                      <SelectItem value="malla">Malla</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="formula">Fórmula</Label>
                  <Input
                    id="formula"
                    value={formulario.formula}
                    onChange={(e) => setFormulario((prev) => ({ ...prev, formula: e.target.value }))}
                    placeholder="ancho * alto * tarifa_base"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Variables disponibles: ancho, alto, divisionHorizontal, divisionVertical, decoradoHorizontal,
                    decoradoVertical, tarifa_base
                  </p>
                </div>

                <div>
                  <Label htmlFor="tarifa_base">Tarifa Base</Label>
                  <Input
                    id="tarifa_base"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formulario.tarifa_base}
                    onChange={(e) =>
                      setFormulario((prev) => ({ ...prev, tarifa_base: Number.parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="activo"
                    checked={formulario.activo}
                    onCheckedChange={(checked) => setFormulario((prev) => ({ ...prev, activo: checked }))}
                  />
                  <Label htmlFor="activo">Configuración activa</Label>
                </div>
              </div>

              {/* Condiciones y aplicación */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Condiciones de Aplicación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Tipos de Producto</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipos de producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposProducto.map((tipo) => (
                            <SelectItem key={tipo._id} value={tipo._id}>
                              {tipo.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="contribuye_malla"
                        checked={formulario.condiciones.contribuye_malla}
                        onCheckedChange={(checked) =>
                          setFormulario((prev) => ({
                            ...prev,
                            condiciones: { ...prev.condiciones, contribuye_malla: checked },
                          }))
                        }
                      />
                      <Label htmlFor="contribuye_malla">Contribuye al costo de malla</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Forma de Aplicación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="por_producto"
                        checked={formulario.aplicacion.por_producto}
                        onCheckedChange={(checked) =>
                          setFormulario((prev) => ({
                            ...prev,
                            aplicacion: { ...prev.aplicacion, por_producto: checked },
                          }))
                        }
                      />
                      <Label htmlFor="por_producto">Aplicar por producto completo</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="por_material"
                        checked={formulario.aplicacion.por_material}
                        onCheckedChange={(checked) =>
                          setFormulario((prev) => ({
                            ...prev,
                            aplicacion: { ...prev.aplicacion, por_material: checked },
                          }))
                        }
                      />
                      <Label htmlFor="por_material">Aplicar por material específico</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button variant="outline" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button onClick={guardarConfiguracion}>
                {configuracionEditando ? "Actualizar" : "Crear"} Configuración
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla de configuraciones */}
      <Card>
        <CardHeader>
          <CardTitle>Configuraciones Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fórmula</TableHead>
                <TableHead>Tarifa Base</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configuraciones.map((config) => (
                <TableRow key={config._id}>
                  <TableCell className="font-medium">{config.nombre}</TableCell>
                  <TableCell>
                    <Badge className={getTipoBadgeColor(config.tipo)}>{config.tipo}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{config.formula}</TableCell>
                  <TableCell>L {config.tarifa_base}</TableCell>
                  <TableCell>
                    <Badge variant={config.activo ? "default" : "secondary"}>
                      {config.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => abrirModal(config)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => eliminarConfiguracion(config._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {configuraciones.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay configuraciones de mano de obra. Cree la primera configuración.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
