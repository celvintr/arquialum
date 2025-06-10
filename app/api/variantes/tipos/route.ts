import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET Tipos de Variantes")

    const { db } = await connectToDatabase()

    // Obtener todos los tipos de variantes
    const [coloresPVC, coloresAluminio, tiposVidrio] = await Promise.all([
      db.collection("colores_pvc").find({ activo: true }).toArray(),
      db.collection("colores_aluminio").find({ activo: true }).toArray(),
      db.collection("tipos_vidrio").find({ activo: true }).toArray(),
    ])

    console.log("✅ Variantes cargadas:", {
      pvc: coloresPVC.length,
      aluminio: coloresAluminio.length,
      vidrio: tiposVidrio.length,
    })

    return NextResponse.json({
      success: true,
      coloresPVC,
      coloresAluminio,
      tiposVidrio,
    })
  } catch (error) {
    console.error("❌ Error obteniendo tipos de variantes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
