"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, Save, Trash2, FileText, User, FolderOpen } from "lucide-react"

interface ResumenCotizacionProps {
  items: any[]
  grupos?: any[]
  cliente: any
  onGuardar: () => void
  onLimpiar: () => void
}

export default function ResumenCotizacion({
  items,
  grupos = [],
  cliente,
  onGuardar,
  onLimpiar,
}: ResumenCotizacionProps) {
  const calcularSubtotal = () => {
    return items.reduce((total, item) => total + (item.precio_total || 0), 0)
  }

  const calcularIVA = () => {
    return calcularSubtotal() * 0.15 // 15% IVA en Honduras
  }

  const calcularTotal = () => {
    return calcularSubtotal() + calcularIVA()
  }

  const agruparPorTipo = () => {
    const grupos = items.reduce(
      (acc, item) => {
        const tipo = item.tipo || "otros"
        if (!acc[tipo]) {
          acc[tipo] = []
        }
        acc[tipo].push(item)
        return acc
      },
      {} as Record<string, any[]>,
    )

    return grupos
  }

  const agruparPorGrupos = () => {
    const itemsPorGrupo = items.reduce(
      (acc, item) => {
        const grupoId = item.grupoId || "default"
        if (!acc[grupoId]) {
          acc[grupoId] = []
        }
        acc[grupoId].push(item)
        return acc
      },
      {} as Record<string, any[]>,
    )

    return itemsPorGrupo
  }

  const gruposTipos = agruparPorTipo()
  const gruposItems = agruparPorGrupos()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Resumen de Cotización
          </div>
          <div className="flex items-center gap-2">
            {cliente && (
              <Badge variant="outline" className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {cliente.nombre}
              </Badge>
            )}
            <Badge>{items.length} items</Badge>
            <Badge variant="secondary">{grupos.length} grupos</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumen por Grupos */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Resumen por Grupos */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Items por Grupo
                </h3>
                <div className="space-y-4">
                  {Object.entries(gruposItems).map(([grupoId, itemsDelGrupo]) => {
                    const grupo = grupos.find((g) => g.id === grupoId)
                    const nombreGrupo = grupo?.nombre || "Items Generales"
                    const totalGrupo = itemsDelGrupo.reduce((sum, item) => sum + (item.precio_total || 0), 0)

                    return (
                      <Card key={grupoId} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              {grupo?.imagenUrl && (
                                <img
                                  src={grupo.imagenUrl || "/placeholder.svg"}
                                  alt={nombreGrupo}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              )}
                              <h4 className="font-medium">{nombreGrupo}</h4>
                            </div>
                            <Badge variant="secondary">{itemsDelGrupo.length} items</Badge>
                          </div>

                          <div className="space-y-2">
                            {itemsDelGrupo.map((item, index) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span className="truncate flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {item.tipo}
                                  </Badge>
                                  {item.nombre || item.descripcion}
                                </span>
                                <span className="font-medium">L {(item.precio_total || 0).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>

                          <Separator className="my-2" />
                          <div className="flex justify-between font-semibold">
                            <span>Subtotal {nombreGrupo}:</span>
                            <span className="text-green-600">L {totalGrupo.toLocaleString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Resumen por Tipo */}
              <div>
                <h3 className="font-semibold mb-4">Resumen por Tipo</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(gruposTipos).map(([tipo, itemsDelTipo]) => {
                    const totalTipo = itemsDelTipo.reduce((sum, item) => sum + (item.precio_total || 0), 0)

                    return (
                      <Card key={tipo} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-3">
                          <div className="text-center">
                            <Badge className="mb-2 capitalize">{tipo}</Badge>
                            <p className="text-sm text-gray-600">{itemsDelTipo.length} items</p>
                            <p className="font-semibold text-green-600">L {totalTipo.toLocaleString()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Totales y Acciones */}
          <div>
            <h3 className="font-semibold mb-4">Totales</h3>
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>L {calcularSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (15%):</span>
                  <span>L {calcularIVA().toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">L {calcularTotal().toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Información del Cliente */}
            {cliente && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Cliente
                  </h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Nombre:</strong> {cliente.nombre}
                    </p>
                    {cliente.email && (
                      <p>
                        <strong>Email:</strong> {cliente.email}
                      </p>
                    )}
                    {cliente.telefono && (
                      <p>
                        <strong>Teléfono:</strong> {cliente.telefono}
                      </p>
                    )}
                    {cliente.direccion && (
                      <p>
                        <strong>Dirección:</strong> {cliente.direccion}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Estadísticas de Grupos */}
            {grupos.length > 1 && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Estadísticas
                  </h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Total de grupos:</strong> {grupos.length}
                    </p>
                    <p>
                      <strong>Grupos con items:</strong> {Object.keys(gruposItems).length}
                    </p>
                    <p>
                      <strong>Tipos de productos:</strong> {Object.keys(gruposTipos).length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Acciones */}
            <div className="mt-6 space-y-2">
              <Button onClick={onGuardar} className="w-full" disabled={!cliente}>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cotización
              </Button>
              <Button variant="outline" onClick={onLimpiar} className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar Todo
              </Button>
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Vista Previa PDF
              </Button>
            </div>

            {!cliente && (
              <p className="text-sm text-red-600 mt-2 text-center">* Selecciona un cliente para poder guardar</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
