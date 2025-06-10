"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Database, AlertCircle } from "lucide-react"

export default function DebugPage() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [database, setDatabase] = useState("")

  const loadCollections = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/debug/collections")
      const data = await response.json()

      if (data.success) {
        setCollections(data.collections)
        setDatabase(data.database)
      }
    } catch (error) {
      console.error("Error cargando colecciones:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCollections()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Debug - Base de Datos</h1>
          <p className="text-gray-600">Estado actual de las colecciones</p>
        </div>
        <Button onClick={loadCollections} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Base de Datos: {database}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection: any) => (
              <div key={collection.name} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{collection.name}</h3>
                  <Badge variant={collection.count > 0 ? "default" : "secondary"}>{collection.count}</Badge>
                </div>
                {collection.count === 0 && (
                  <div className="flex items-center mt-2 text-amber-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Vacía</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {collections.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">No se encontraron colecciones</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
