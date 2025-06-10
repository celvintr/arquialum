"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Building, FileText, Printer, CreditCard, Save } from "lucide-react"

export default function ConfiguracionEmpresaPage() {
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [activeTab, setActiveTab] = useState("informacion")

  // Estado para la configuración
  const [config, setConfig] = useState({
    // Información básica
    nombre: "Empresa S.A.",
    slogan: "Soluciones de calidad",
    telefono: "(504) 2222-3333",
    celular: "(504) 9999-8888",
    email: "info@empresa.com",
    sitio_web: "www.empresa.com",
    direccion: "Calle Principal, Ciudad",

    // Información fiscal
    rtn: "08019999123456",
    cai: "12345-67890-12345-ABCDE",
    regimen_fiscal: "Pequeños Contribuyentes",
    fecha_limite_emision: "",
    rango_inicial: "000-001-01-00000001",
    rango_final: "000-001-01-00001000",

    // Términos y condiciones
    terminos_cotizacion: "Precios sujetos a cambio sin previo aviso. Cotización válida por 15 días.",
    terminos_factura: "Garantía de 30 días en materiales y mano de obra.",
    politica_devolucion: "No se aceptan devoluciones después de 7 días de la compra.",
    politica_garantia: "Garantía limitada a defectos de fabricación por 30 días.",

    // Configuración de pagos
    moneda: "HNL",
    simbolo_moneda: "L",
    impuesto_ventas: 15,
    metodos_pago: ["efectivo", "transferencia", "tarjeta", "cheque"],
    requiere_anticipo: true,
    porcentaje_anticipo: 50,

    // Configuración de impresión
    mostrar_logo: true,
    mostrar_firma_digital: false,
    mostrar_sello: true,
    pie_pagina: "Gracias por su preferencia",
    color_primario: "#4f46e5",
    color_secundario: "#10b981",
    redes_sociales: {
      facebook: "facebook.com/empresa",
      instagram: "instagram.com/empresa",
      twitter: "",
    },
  })

  useEffect(() => {
    // Simular carga de configuración desde la API
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const handleChange = (section: string, field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      redes_sociales: {
        ...prev.redes_sociales,
        [platform]: value,
      },
    }))
  }

  const guardarConfiguracion = async () => {
    try {
      setGuardando(true)

      // Simular guardado en API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast.success("Configuración guardada exitosamente")
    } catch (error) {
      console.error("Error guardando configuración:", error)
      toast.error("Error al guardar la configuración")
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
              <span>Cargando configuración...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🏢 Configuración de Empresa</h1>
          <p className="text-gray-600 mt-2">
            Personaliza la información de tu empresa para facturas, cotizaciones y documentos
          </p>
        </div>
        <Button onClick={guardarConfiguracion} disabled={guardando} className="bg-green-600 hover:bg-green-700">
          {guardando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="informacion" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span className="hidden sm:inline">Información</span>
          </TabsTrigger>
          <TabsTrigger value="fiscal" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Fiscal</span>
          </TabsTrigger>
          <TabsTrigger value="terminos" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Términos</span>
          </TabsTrigger>
          <TabsTrigger value="pagos" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Pagos</span>
          </TabsTrigger>
          <TabsTrigger value="impresion" className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Impresión</span>
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Información Básica */}
        <TabsContent value="informacion" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de la Empresa</Label>
                  <Input
                    id="nombre"
                    value={config.nombre}
                    onChange={(e) => handleChange("informacion", "nombre", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slogan">Slogan</Label>
                  <Input
                    id="slogan"
                    value={config.slogan}
                    onChange={(e) => handleChange("informacion", "slogan", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={config.telefono}
                    onChange={(e) => handleChange("informacion", "telefono", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    value={config.celular}
                    onChange={(e) => handleChange("informacion", "celular", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={config.email}
                    onChange={(e) => handleChange("informacion", "email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sitio_web">Sitio Web</Label>
                  <Input
                    id="sitio_web"
                    value={config.sitio_web}
                    onChange={(e) => handleChange("informacion", "sitio_web", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea
                  id="direccion"
                  value={config.direccion}
                  onChange={(e) => handleChange("informacion", "direccion", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-medium">Redes Sociales</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={config.redes_sociales.facebook}
                      onChange={(e) => handleSocialMediaChange("facebook", e.target.value)}
                      placeholder="facebook.com/tuempresa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={config.redes_sociales.instagram}
                      onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                      placeholder="instagram.com/tuempresa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={config.redes_sociales.twitter}
                      onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
                      placeholder="twitter.com/tuempresa"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo de la Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-400">Logo no disponible</span>
                </div>
                <Button>Subir Logo</Button>
                <p className="text-sm text-gray-500 mt-2">Formatos permitidos: PNG, JPG, SVG. Máximo 2MB.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Información Fiscal */}
        <TabsContent value="fiscal" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Información Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="rtn">RTN</Label>
                  <Input id="rtn" value={config.rtn} onChange={(e) => handleChange("fiscal", "rtn", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cai">CAI</Label>
                  <Input id="cai" value={config.cai} onChange={(e) => handleChange("fiscal", "cai", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="regimen_fiscal">Régimen Fiscal</Label>
                  <Input
                    id="regimen_fiscal"
                    value={config.regimen_fiscal}
                    onChange={(e) => handleChange("fiscal", "regimen_fiscal", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_limite_emision">Fecha Límite de Emisión</Label>
                  <Input
                    id="fecha_limite_emision"
                    type="date"
                    value={config.fecha_limite_emision}
                    onChange={(e) => handleChange("fiscal", "fecha_limite_emision", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="rango_inicial">Rango Inicial</Label>
                  <Input
                    id="rango_inicial"
                    value={config.rango_inicial}
                    onChange={(e) => handleChange("fiscal", "rango_inicial", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rango_final">Rango Final</Label>
                  <Input
                    id="rango_final"
                    value={config.rango_final}
                    onChange={(e) => handleChange("fiscal", "rango_final", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Términos y Condiciones */}
        <TabsContent value="terminos" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Términos y Condiciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="terminos_cotizacion">Términos para Cotizaciones</Label>
                <Textarea
                  id="terminos_cotizacion"
                  value={config.terminos_cotizacion}
                  onChange={(e) => handleChange("terminos", "terminos_cotizacion", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terminos_factura">Términos para Facturas</Label>
                <Textarea
                  id="terminos_factura"
                  value={config.terminos_factura}
                  onChange={(e) => handleChange("terminos", "terminos_factura", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="politica_devolucion">Política de Devolución</Label>
                <Textarea
                  id="politica_devolucion"
                  value={config.politica_devolucion}
                  onChange={(e) => handleChange("terminos", "politica_devolucion", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="politica_garantia">Política de Garantía</Label>
                <Textarea
                  id="politica_garantia"
                  value={config.politica_garantia}
                  onChange={(e) => handleChange("terminos", "politica_garantia", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Configuración de Pagos */}
        <TabsContent value="pagos" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Configuración de Pagos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="moneda">Moneda</Label>
                  <Input
                    id="moneda"
                    value={config.moneda}
                    onChange={(e) => handleChange("pagos", "moneda", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="simbolo_moneda">Símbolo de Moneda</Label>
                  <Input
                    id="simbolo_moneda"
                    value={config.simbolo_moneda}
                    onChange={(e) => handleChange("pagos", "simbolo_moneda", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="impuesto_ventas">Impuesto de Ventas (%)</Label>
                  <Input
                    id="impuesto_ventas"
                    type="number"
                    min="0"
                    max="100"
                    value={config.impuesto_ventas}
                    onChange={(e) => handleChange("pagos", "impuesto_ventas", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requiere_anticipo">Requiere Anticipo</Label>
                    <p className="text-sm text-gray-500">Solicitar anticipo para nuevos trabajos</p>
                  </div>
                  <Switch
                    id="requiere_anticipo"
                    checked={config.requiere_anticipo}
                    onCheckedChange={(checked) => handleChange("pagos", "requiere_anticipo", checked)}
                  />
                </div>

                {config.requiere_anticipo && (
                  <div className="space-y-2">
                    <Label htmlFor="porcentaje_anticipo">Porcentaje de Anticipo (%)</Label>
                    <Input
                      id="porcentaje_anticipo"
                      type="number"
                      min="0"
                      max="100"
                      value={config.porcentaje_anticipo}
                      onChange={(e) =>
                        handleChange("pagos", "porcentaje_anticipo", Number.parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label>Métodos de Pago Aceptados</Label>
                <div className="grid grid-cols-2 gap-4">
                  {["efectivo", "transferencia", "tarjeta", "cheque"].map((metodo) => (
                    <div key={metodo} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={metodo}
                        checked={config.metodos_pago.includes(metodo)}
                        onChange={(e) => {
                          const newMetodos = e.target.checked
                            ? [...config.metodos_pago, metodo]
                            : config.metodos_pago.filter((m) => m !== metodo)
                          handleChange("pagos", "metodos_pago", newMetodos)
                        }}
                      />
                      <Label htmlFor={metodo} className="capitalize">
                        {metodo}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Configuración de Impresión */}
        <TabsContent value="impresion" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="w-5 h-5" />
                Configuración de Impresión
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="color_primario">Color Primario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color_primario"
                      type="color"
                      value={config.color_primario}
                      onChange={(e) => handleChange("impresion", "color_primario", e.target.value)}
                      className="w-16"
                    />
                    <Input
                      value={config.color_primario}
                      onChange={(e) => handleChange("impresion", "color_primario", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color_secundario">Color Secundario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color_secundario"
                      type="color"
                      value={config.color_secundario}
                      onChange={(e) => handleChange("impresion", "color_secundario", e.target.value)}
                      className="w-16"
                    />
                    <Input
                      value={config.color_secundario}
                      onChange={(e) => handleChange("impresion", "color_secundario", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pie_pagina">Pie de Página</Label>
                <Input
                  id="pie_pagina"
                  value={config.pie_pagina}
                  onChange={(e) => handleChange("impresion", "pie_pagina", e.target.value)}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Elementos a Mostrar</h3>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mostrar_logo">Mostrar Logo</Label>
                    <p className="text-sm text-gray-500">Incluir logo en documentos</p>
                  </div>
                  <Switch
                    id="mostrar_logo"
                    checked={config.mostrar_logo}
                    onCheckedChange={(checked) => handleChange("impresion", "mostrar_logo", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mostrar_firma_digital">Mostrar Firma Digital</Label>
                    <p className="text-sm text-gray-500">Incluir firma digital en documentos</p>
                  </div>
                  <Switch
                    id="mostrar_firma_digital"
                    checked={config.mostrar_firma_digital}
                    onCheckedChange={(checked) => handleChange("impresion", "mostrar_firma_digital", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mostrar_sello">Mostrar Sello</Label>
                    <p className="text-sm text-gray-500">Incluir sello de la empresa</p>
                  </div>
                  <Switch
                    id="mostrar_sello"
                    checked={config.mostrar_sello}
                    onCheckedChange={(checked) => handleChange("impresion", "mostrar_sello", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: config.color_primario }}>
                      {config.nombre}
                    </h2>
                    <p className="text-gray-600">{config.slogan}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>RTN: {config.rtn}</p>
                    <p>{config.direccion}</p>
                    <p>Tel: {config.telefono}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-center text-sm text-gray-600">{config.pie_pagina}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
