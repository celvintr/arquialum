import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Obtener todas las colecciones de la base de datos
    const collections = await db.listCollections().toArray()

    // Extraer nombres de colecciones
    const collectionNames = collections.map((collection) => collection.name)

    // Para cada colección, obtener un documento de muestra
    const collectionSamples = {}

    for (const name of collectionNames) {
      try {
        const sample = await db.collection(name).findOne({})
        collectionSamples[name] = sample
          ? {
              _id: sample._id.toString(),
              // Incluir algunos campos clave si existen
              numero: sample.numero,
              nombre: sample.nombre,
              // Contar documentos en la colección
              totalDocumentos: await db.collection(name).countDocuments(),
            }
          : null
      } catch (error) {
        collectionSamples[name] = { error: error.message }
      }
    }

    return NextResponse.json({
      success: true,
      colecciones: collectionNames,
      muestras: collectionSamples,
    })
  } catch (error) {
    console.error("Error obteniendo colecciones:", error)
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
