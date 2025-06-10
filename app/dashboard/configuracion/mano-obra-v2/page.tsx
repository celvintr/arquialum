"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Factory, Home, Grid3X3, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ConfiguracionManoObraV2Page() {
  const { toast } = useToast()
  const [configuraciones, setConfiguraciones] = useState<any[]>([])
  const [materiales, setMateriales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Estados para modales
  const [modalFabricacion, setModalFabricacion] = useState(false)
  const [modalInstalacion, setModalInstalacion] = useState(false)
  const [modalMalla, setModalMalla] = useState(false)

  // Configuraciones específicas
  const [configFabricacion, setConfigFabricacion] = useState({
    pvc: { activo: true, tarifa_por_m2: 400 },
    aluminio: { activo: true, tarifa_por_m2: 450 },
  })

  const [configInstalacion, setConfigInstalacion] = useState({
    pvc: { activo: true, tarifa_por_m2: 200 },
    aluminio: { activo: true, tarifa_por_m2: 250 },
  })

  const [configMalla, setConfigMalla] = useState({
    materiales_que_contribuyen: [],
    incluye_mano_obra: false,
    tarifa_mano_obra_m2: 0,
    activo: true,
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      // Cargar configuraciones
      const configResponse = await fetch("/api/configuracion/parametros-v2")
      const configData = await configResponse.json()

      if (configData.success) {
        setConfiguraciones(configData.configuraciones)

        // Separar configuraciones por tipo
        configData.configuraciones.forEach((config: any) => {
          if (config.tipo === "fabricacion") {
            setConfigFabricacion(config.configuraciones_tipo || configFabricacion)
          } else if (config.tipo === "instalacion") {
            setConfigInstalacion(config.configuraciones_tipo || configInstalacion)
          } else if (config.tipo === "malla") {
            setConfigMalla(config.configuracion_malla || configMalla)
          }
        })
      }

      // Cargar materiales
      const materialesResponse = await fetch("/api/materiales")
      const materialesData = await materialesResponse.json()

      if (materialesData.success) {
        setMateriales(materialesData.materiales || [])
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

  const guardarConfiguracion = async (tipo: string, configuracion: any) => {
    try {
      const payload: any = {
        nombre: `Mano de obra ${tipo}`,
        tipo,
        activo: true,
      }

      if (tipo === "fabricacion" || tipo === "instalacion") {
        payload.configuraciones_tipo = configuracion
      } else if (tipo === "malla") {
        payload.configuracion_malla = configuracion
      }

      const response = await fetch("/api/configuracion/parametros-v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "¡Éxito!",
          description: `Configuración de ${tipo} guardada correctamente`,
        })
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

  const toggleMaterialMalla = (materialId: string) => {
    const materiales = [...configMalla.materiales_que_contribuyen]
    const index = materiales.indexOf(materialId)

    if (index > -1) {
      materiales.splice(index, 1)
    } else {
      materiales.push(materialId)
    }

    setConfigMalla((prev) => ({
      ...prev,
      materiales_que_contribuyen: materiales,
    }))
  }

  const isMaterialSeleccionado = (materialId: string) => {
    return configMalla.materiales_que_contribuyen.includes(materialId)
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
        <h1 className="text-2xl font-bold">Configuración de Mano de Obra</h1>
      </div>

      <p className="text-gray-600">
        Configure las reglas y fórmulas para el cálculo de mano de obra de fabricación, instalación y otros costos.
      </p>

      {/* Grid de configuraciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fabricación */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Factory className="w-5 h-5" />
              Fabricación
            </CardTitle>
            <p className="text-sm text-gray-600">Configurar costos de mano de obra para fabricación de productos.</p>
          </CardHeader>
          <CardContent>
            <Dialog open={modalFabricacion} onOpenChange={setModalFabricacion}>
              <DialogTrigger asChild>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Configurar Fabricación</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurar Mano de Obra - Fabricación</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  {/* PVC */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        Productos PVC
                        <Switch
                          checked={configFabricacion.pvc.activo}
                          onCheckedChange={(checked) =>
                            setConfigFabricacion((prev) => ({
                              ...prev,
                              pvc: { ...prev.pvc, activo: checked },
                            }))
                          }
                        />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label htmlFor="tarifa-pvc-fab">Tarifa por m² (Lempiras)</Label>
                        <Input
                          id="tarifa-pvc-fab"
                          type="number"
                          min="0"
                          step="0.01"
                          value={configFabricacion.pvc.tarifa_por_m2}
                          onChange={(e) =>
                            setConfigFabricacion((prev) => ({
                              ...prev,
                              pvc: { ...prev.pvc, tarifa_por_m2: Number.parseFloat(e.target.value) || 0 },
                            }))
                          }
                          disabled={!configFabricacion.pvc.activo}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Aluminio */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        Productos Aluminio
                        <Switch
                          checked={configFabricacion.aluminio.activo}
                          onCheckedChange={(checked) =>
                            setConfigFabricacion((prev) => ({
                              ...prev,
                              aluminio: { ...prev.aluminio, activo: checked },
                            }))
                          }
                        />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label htmlFor="tarifa-aluminio-fab">Tarifa por m² (Lempiras)</Label>
                        <Input
                          id="tarifa-aluminio-fab"
                          type="number"
                          min="0"
                          step="0.01"
                          value={configFabricacion.aluminio.tarifa_por_m2}
                          onChange={(e) =>
                            setConfigFabricacion((prev) => ({
                              ...prev,
                              aluminio: { ...prev.aluminio, tarifa_por_m2: Number.parseFloat(e.target.value) || 0 },
                            }))
                          }
                          disabled={!configFabricacion.aluminio.activo}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button variant="outline" onClick={() => setModalFabricacion(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      guardarConfiguracion("fabricacion", configFabricacion)
                      setModalFabricacion(false)
                    }}
                  >
                    Guardar Configuración
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Instalación */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Home className="w-5 h-5" />
              Instalación
            </CardTitle>
            <p className="text-sm text-gray-600">Configurar costos de mano de obra para instalación.</p>
          </CardHeader>
          <CardContent>
            <Dialog open={modalInstalacion} onOpenChange={setModalInstalacion}>
              <DialogTrigger asChild>
                <Button className="w-full bg-green-600 hover:bg-green-700">Configurar Instalación</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurar Mano de Obra - Instalación</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  {/* PVC */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        Productos PVC
                        <Switch
                          checked={configInstalacion.pvc.activo}
                          onCheckedChange={(checked) =>
                            setConfigInstalacion((prev) => ({
                              ...prev,
                              pvc: { ...prev.pvc, activo: checked },
                            }))
                          }
                        />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label htmlFor="tarifa-pvc-inst">Tarifa por m² (Lempiras)</Label>
                        <Input
                          id="tarifa-pvc-inst"
                          type="number"
                          min="0"
                          step="0.01"
                          value={configInstalacion.pvc.tarifa_por_m2}
                          onChange={(e) =>
                            setConfigInstalacion((prev) => ({
                              ...prev,
                              pvc: { ...prev.pvc, tarifa_por_m2: Number.parseFloat(e.target.value) || 0 },
                            }))
                          }
                          disabled={!configInstalacion.pvc.activo}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Aluminio */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        Productos Aluminio
                        <Switch
                          checked={configInstalacion.aluminio.activo}
                          onCheckedChange={(checked) =>
                            setConfigInstalacion((prev) => ({
                              ...prev,
                              aluminio: { ...prev.aluminio, activo: checked },
                            }))
                          }
                        />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label htmlFor="tarifa-aluminio-inst">Tarifa por m² (Lempiras)</Label>
                        <Input
                          id="tarifa-aluminio-inst"
                          type="number"
                          min="0"
                          step="0.01"
                          value={configInstalacion.aluminio.tarifa_por_m2}
                          onChange={(e) =>
                            setConfigInstalacion((prev) => ({
                              ...prev,
                              aluminio: { ...prev.aluminio, tarifa_por_m2: Number.parseFloat(e.target.value) || 0 },
                            }))
                          }
                          disabled={!configInstalacion.aluminio.activo}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button variant="outline" onClick={() => setModalInstalacion(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      guardarConfiguracion("instalacion", configInstalacion)
                      setModalInstalacion(false)
                    }}
                  >
                    Guardar Configuración
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Malla */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Grid3X3 className="w-5 h-5" />
              Malla
            </CardTitle>
            <p className="text-sm text-gray-600">
              Configurar qué materiales contribuyen al costo de malla en cada producto.
            </p>
          </CardHeader>
          <CardContent>
            <Dialog open={modalMalla} onOpenChange={setModalMalla}>
              <DialogTrigger asChild>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">Configurar Malla</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Configurar Costos de Malla</DialogTitle>
                  <p className="text-sm text-gray-600">
                    Seleccione los materiales cuyos importes se sumarán para calcular el costo de malla en cada producto
                    cotizado.
                  </p>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={configMalla.activo}
                      onCheckedChange={(checked) => setConfigMalla((prev) => ({ ...prev, activo: checked }))}
                    />
                    <Label>Activar cálculo de malla</Label>
                  </div>

                  {configMalla.activo && (
                    <>
                      <div>
                        <Label className="text-base font-medium">
                          Materiales que contribuyen al costo de malla ({configMalla.materiales_que_contribuyen.length}{" "}
                          seleccionados)
                        </Label>
                        <p className="text-sm text-gray-600 mb-4">
                          Al cotizar un producto, los importes de estos materiales se sumarán para calcular el costo
                          total de malla
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                          {materiales.map((material) => (
                            <div
                              key={material._id}
                              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                isMaterialSeleccionado(material._id)
                                  ? "border-orange-500 bg-orange-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => toggleMaterialMalla(material._id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <span className="font-medium text-sm">{material.nombre}</span>
                                  <p className="text-xs text-gray-600">{material.categoria}</p>
                                </div>
                                {isMaterialSeleccionado(material._id) && <Check className="w-4 h-4 text-orange-600" />}
                              </div>
                            </div>
                          ))}
                        </div>

                        {materiales.length === 0 && (
                          <p className="text-center text-gray-500 py-4">No hay materiales disponibles</p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={configMalla.incluye_mano_obra}
                            onCheckedChange={(checked) =>
                              setConfigMalla((prev) => ({ ...prev, incluye_mano_obra: checked }))
                            }
                          />
                          <Label>Incluir mano de obra adicional para malla</Label>
                        </div>

                        {configMalla.incluye_mano_obra && (
                          <div>
                            <Label htmlFor="tarifa-malla">Tarifa de mano de obra por m² (Lempiras)</Label>
                            <Input
                              id="tarifa-malla"
                              type="number"
                              min="0"
                              step="0.01"
                              value={configMalla.tarifa_mano_obra_m2}
                              onChange={(e) =>
                                setConfigMalla((prev) => ({
                                  ...prev,
                                  tarifa_mano_obra_m2: Number.parseFloat(e.target.value) || 0,
                                }))
                              }
                              placeholder="Ej: 50.00"
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button variant="outline" onClick={() => setModalMalla(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      guardarConfiguracion("malla", configMalla)
                      setModalMalla(false)
                    }}
                  >
                    Guardar Configuración
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de configuraciones actuales */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Configuraciones Actuales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Fabricación</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>PVC:</span>
                  <Badge variant={configFabricacion.pvc.activo ? "default" : "secondary"}>
                    {configFabricacion.pvc.activo ? `L ${configFabricacion.pvc.tarifa_por_m2}/m²` : "Inactivo"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Aluminio:</span>
                  <Badge variant={configFabricacion.aluminio.activo ? "default" : "secondary"}>
                    {configFabricacion.aluminio.activo
                      ? `L ${configFabricacion.aluminio.tarifa_por_m2}/m²`
                      : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Instalación</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>PVC:</span>
                  <Badge variant={configInstalacion.pvc.activo ? "default" : "secondary"}>
                    {configInstalacion.pvc.activo ? `L ${configInstalacion.pvc.tarifa_por_m2}/m²` : "Inactivo"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Aluminio:</span>
                  <Badge variant={configInstalacion.aluminio.activo ? "default" : "secondary"}>
                    {configInstalacion.aluminio.activo
                      ? `L ${configInstalacion.aluminio.tarifa_por_m2}/m²`
                      : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Malla</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Estado:</span>
                  <Badge variant={configMalla.activo ? "default" : "secondary"}>
                    {configMalla.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Materiales:</span>
                  <Badge variant="outline">{configMalla.materiales_que_contribuyen.length} seleccionados</Badge>
                </div>
                {configMalla.incluye_mano_obra && (
                  <div className="flex justify-between">
                    <span>M.O. Malla:</span>
                    <Badge variant="outline">L {configMalla.tarifa_mano_obra_m2}/m²</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
