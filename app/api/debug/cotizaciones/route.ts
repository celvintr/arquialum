import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // CORRECCIÓN: Nombre de colección "cotizacions" en lugar de "cotizaciones"
    const cotizaciones = await db.collection("cotizacions").find({}).toArray()

    return NextResponse.json({
      success: true,
      count: cotizaciones.length,
      cotizaciones: cotizaciones.map((cot) => ({
        _id: cot._id,
        numero: cot.numero,
        cliente: cot.cliente?.nombre || "Sin cliente",
        estado: cot.estado,
        total: cot.total,
      })),
    })
  } catch (error) {
    console.error("Error obteniendo cotizaciones:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
