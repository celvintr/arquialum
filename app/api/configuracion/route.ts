import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const configuraciones = await db.collection("configuraciones").find({ activo: true }).toArray()

    return NextResponse.json({
      success: true,
      configuraciones,
    })
  } catch (error) {
    console.error("❌ Error obteniendo configuraciones:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()

    const configuracion = {
      ...body,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await db.collection("configuraciones").insertOne(configuracion)

    return NextResponse.json({
      success: true,
      configuracion: { ...configuracion, _id: result.insertedId },
    })
  } catch (error) {
    console.error("❌ Error creando configuración:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
