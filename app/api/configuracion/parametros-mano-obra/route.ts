import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const parametros = await db.collection("parametros_mano_obra").find({}).toArray()

    return NextResponse.json({
      success: true,
      parametros,
    })
  } catch (error) {
    console.error("Error obteniendo parámetros de mano de obra:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const data = await request.json()

    const parametro = {
      ...data,
      creado_en: new Date(),
      actualizado_en: new Date(),
    }

    const result = await db.collection("parametros_mano_obra").insertOne(parametro)

    return NextResponse.json({
      success: true,
      parametro: { ...parametro, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Error creando parámetro de mano de obra:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
