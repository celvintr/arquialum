import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Listar todas las colecciones
    const collections = await db.listCollections().toArray()

    // Contar documentos en cada colección
    const collectionStats = []
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments()
      collectionStats.push({
        name: collection.name,
        count: count,
      })
    }

    return NextResponse.json({
      success: true,
      database: db.databaseName,
      collections: collectionStats.sort((a, b) => a.name.localeCompare(b.name)),
    })
  } catch (error) {
    console.error("Error obteniendo colecciones:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
