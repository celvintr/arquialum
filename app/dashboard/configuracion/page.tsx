"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Wrench, Calculator, Package } from "lucide-react"
import Link from "next/link"

export default function ConfiguracionPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="mano-obra">Mano de Obra</TabsTrigger>
          <TabsTrigger value="materiales">Materiales</TabsTrigger>
          <TabsTrigger value="productos">Productos</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Configuración General
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Configurar parámetros generales del sistema como moneda, impuestos, etc.
                </p>
                <Button variant="outline" className="w-full">
                  Configurar
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Tipos de Producto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Gestionar tipos de productos y sus características.</p>
                <Button variant="outline" className="w-full">
                  Gestionar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mano-obra">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Configuración de Mano de Obra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Configure las reglas y fórmulas para el cálculo de mano de obra de fabricación, instalación y costos de
                malla.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <Card className="border-2 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Configuración de Mano de Obra
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Sistema completo de configuración para fabricación, instalación y materiales de malla con
                      parámetros detallados.
                    </p>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-500">• Configuración de fabricación (PVC y Aluminio)</div>
                      <div className="text-sm text-gray-500">• Configuración de instalación</div>
                      <div className="text-sm text-gray-500">• Selección de materiales que contribuyen a malla</div>
                      <div className="text-sm text-gray-500">• Configuración de mano de obra de malla</div>
                    </div>
                    <Link href="/dashboard/configuracion/mano-obra-v2" className="block mt-4">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <Wrench className="w-4 h-4 mr-2" />
                        Configurar Mano de Obra
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materiales">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Materiales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Gestionar categorías de materiales, unidades de medida y configuraciones específicas.
              </p>
              <Button variant="outline">Próximamente</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productos">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Configurar tipos de productos, modelos y características especiales.</p>
              <Button variant="outline">Próximamente</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
