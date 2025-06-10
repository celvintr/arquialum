import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const configuracion = await db.collection("configuracion_empresa").findOne({ activo: true })

    return NextResponse.json({
      success: true,
      configuracion,
    })
  } catch (error) {
    console.error("❌ Error obteniendo configuración de empresa:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()

    // Desactivar configuración anterior
    await db
      .collection("configuracion_empresa")
      .updateMany({ activo: true }, { $set: { activo: false, updated_at: new Date() } })

    const configuracion = {
      ...body,
      activo: true,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await db.collection("configuracion_empresa").insertOne(configuracion)

    return NextResponse.json({
      success: true,
      configuracion: { ...configuracion, _id: result.insertedId },
    })
  } catch (error) {
    console.error("❌ Error guardando configuración de empresa:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
