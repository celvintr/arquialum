import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  console.log("🧪 API TEST-DB: Iniciando prueba de conexión...")

  try {
    console.log("🔗 Intentando conectar a la base de datos...")
    await dbConnect()

    console.log("📊 Verificando estado de la conexión...")
    const connectionState = mongoose.connection.readyState
    const dbName = mongoose.connection.name
    const host = mongoose.connection.host
    const port = mongoose.connection.port

    console.log("✅ Conexión verificada exitosamente")

    // Intentar listar las colecciones
    console.log("📋 Listando colecciones...")
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log(
      "📦 Colecciones encontradas:",
      collections.map((c) => c.name),
    )

    return NextResponse.json({
      success: true,
      message: "Conexión a MongoDB exitosa",
      details: {
        connectionState,
        dbName,
        host,
        port,
        collections: collections.map((c) => c.name),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("💥 ERROR EN TEST-DB:")
    console.error("🔍 Mensaje:", error.message)
    console.error("📋 Stack:", error.stack)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
