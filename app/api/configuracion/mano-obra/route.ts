import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    const configuraciones = await db
      .collection("configuraciones_mano_obra")
      .find({})
      .sort({ tipo: 1, nombre: 1 })
      .toArray()

    return NextResponse.json({
      success: true,
      configuraciones,
    })
  } catch (error) {
    console.error("Error obteniendo configuraciones de mano de obra:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()

    // Validar datos requeridos
    const { nombre, descripcion, tipo, formula, tarifa_base } = body

    if (!nombre || !descripcion || !tipo || !formula || tarifa_base === undefined) {
      return NextResponse.json({ success: false, error: "Faltan campos requeridos" }, { status: 400 })
    }

    const nuevaConfiguracion = {
      ...body,
      creado_en: new Date(),
      actualizado_en: new Date(),
      creado_por: "sistema", // TODO: obtener del usuario autenticado
    }

    const resultado = await db.collection("configuraciones_mano_obra").insertOne(nuevaConfiguracion)

    return NextResponse.json({
      success: true,
      configuracion: { ...nuevaConfiguracion, _id: resultado.insertedId },
    })
  } catch (error) {
    console.error("Error creando configuración de mano de obra:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
