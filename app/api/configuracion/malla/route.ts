import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const configuracion = await db.collection("configuracion_malla").findOne({})

    return NextResponse.json({
      success: true,
      configuracion: configuracion || {
        materiales_que_contribuyen: [],
        incluye_mano_obra: false,
        tarifa_mano_obra_m2: 0,
      },
    })
  } catch (error) {
    console.error("Error obteniendo configuración de malla:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const data = await request.json()

    const configuracion = {
      ...data,
      actualizado_en: new Date(),
    }

    await db.collection("configuracion_malla").replaceOne({}, configuracion, { upsert: true })

    return NextResponse.json({
      success: true,
      configuracion,
    })
  } catch (error) {
    console.error("Error guardando configuración de malla:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
