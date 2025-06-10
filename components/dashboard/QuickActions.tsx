import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Package, PenToolIcon as Tool } from "lucide-react"

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Link href="/dashboard/cotizaciones/nueva">
        <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
          <Plus className="h-6 w-6" />
          <span>Nueva Cotización</span>
        </Button>
      </Link>
      <Link href="/dashboard/cotizaciones">
        <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
          <FileText className="h-6 w-6" />
          <span>Ver Cotizaciones</span>
        </Button>
      </Link>
      <Link href="/dashboard/productos">
        <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
          <Package className="h-6 w-6" />
          <span>Productos</span>
        </Button>
      </Link>
      <Link href="/dashboard/materiales">
        <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
          <Tool className="h-6 w-6" />
          <span>Materiales</span>
        </Button>
      </Link>
    </div>
  )
}
