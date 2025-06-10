import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const materialId = params.id

    const material = await db.collection("materiales").findOne({ _id: materialId })

    if (!material) {
      return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      proveedores: material.proveedores || [],
    })
  } catch (error) {
    console.error("Error obteniendo proveedores:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const materialId = params.id
    const body = await request.json()

    const result = await db.collection("materiales").updateOne(
      { _id: materialId },
      {
        $push: { proveedores: { ...body, id: Date.now() } },
        $set: { updated_at: new Date() },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error agregando proveedor:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
