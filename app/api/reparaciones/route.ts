import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const reparaciones = await db.collection("reparaciones_definidas").find({ activo: true }).toArray()

    return NextResponse.json({
      success: true,
      reparaciones,
    })
  } catch (error) {
    console.error("❌ Error obteniendo reparaciones:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()

    const reparacion = {
      ...body,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await db.collection("reparaciones_definidas").insertOne(reparacion)

    return NextResponse.json({
      success: true,
      reparacion: { ...reparacion, _id: result.insertedId },
    })
  } catch (error) {
    console.error("❌ Error creando reparación:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
