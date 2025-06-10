import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const movimientosEjemplo = [
      {
        _id: "mov_001",
        material_id: "mat_001",
        material_nombre: "Perfil PVC 60mm",
        tipo_movimiento: "salida",
        cantidad: 10,
        costo_unitario: 45.5,
        costo_total: 455,
        orden_trabajo_id: "orden_001",
        fecha: "2024-01-20",
        usuario: "admin",
      },
      {
        _id: "mov_002",
        material_id: "mat_002",
        material_nombre: "Vidrio Templado 6mm",
        tipo_movimiento: "entrada",
        cantidad: 50,
        costo_unitario: 120,
        costo_total: 6000,
        proveedor_id: "prov_001",
        fecha: "2024-01-18",
        usuario: "admin",
      },
    ]

    return NextResponse.json({
      success: true,
      movimientos: movimientosEjemplo,
    })
  } catch (error) {
    console.error("Error obteniendo inventario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()

    const nuevoMovimiento = {
      _id: `mov_${Date.now()}`,
      material_id: body.material_id,
      material_nombre: body.material_nombre,
      tipo_movimiento: body.tipo_movimiento,
      cantidad: body.cantidad,
      costo_unitario: body.costo_unitario,
      costo_total: body.cantidad * body.costo_unitario,
      orden_trabajo_id: body.orden_trabajo_id,
      proveedor_id: body.proveedor_id,
      fecha: new Date().toISOString(),
      usuario: "admin",
      created_at: new Date(),
    }

    return NextResponse.json({
      success: true,
      movimiento: nuevoMovimiento,
      message: "Movimiento registrado exitosamente",
    })
  } catch (error) {
    console.error("Error registrando movimiento:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
