"use client"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Eye } from "lucide-react"

interface Producto {
  _id: string
  nombre: string
  descripcion: string
  codigo: string
  identificador: string
  imagen: string
  svg: string
}

interface ProductoCardProps {
  producto: Producto
  onSelect: (productoId: string) => void
}

export default function ProductoCard({ producto, onSelect }: ProductoCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square bg-muted">
        {producto.imagen ? (
          <img
            src={producto.imagen || "/placeholder.svg"}
            alt={producto.nombre}
            className="object-cover w-full h-full"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center bg-muted"
            dangerouslySetInnerHTML={{ __html: producto.svg || "" }}
          />
        )}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm">
              <Eye className="h-4 w-4" />
              <span className="sr-only">Ver detalles</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{producto.nombre}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="aspect-square bg-muted rounded-md overflow-hidden">
                {producto.imagen ? (
                  <img
                    src={producto.imagen || "/placeholder.svg"}
                    alt={producto.nombre}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center bg-muted"
                    dangerouslySetInnerHTML={{ __html: producto.svg || "" }}
                  />
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Descripción</h3>
                  <p className="text-sm text-muted-foreground">{producto.descripcion}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Código</h4>
                    <p className="text-sm">{producto.codigo}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Identificador</h4>
                    <p className="text-sm">{producto.identificador}</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium truncate">{producto.nombre}</h3>
        <p className="text-sm text-muted-foreground truncate">{producto.descripcion}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="default" className="w-full" onClick={() => onSelect(producto._id)}>
          <Plus className="mr-2 h-4 w-4" />
          Cotizar
        </Button>
      </CardFooter>
    </Card>
  )
}
