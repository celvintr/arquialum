import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🔍 GET Variantes - Material ID:", params.id)

    const { db } = await connectToDatabase()
    const materialId = params.id

    // Validar ObjectId
    if (!ObjectId.isValid(materialId)) {
      console.log("❌ ID inválido:", materialId)
      return NextResponse.json({ error: "ID de material inválido" }, { status: 400 })
    }

    const material = await db.collection("materiales").findOne({ _id: new ObjectId(materialId) })

    if (!material) {
      console.log("❌ Material no encontrado:", materialId)
      return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
    }

    console.log("✅ Material encontrado:", material.nombre)

    return NextResponse.json({
      success: true,
      variantes: material.variantes || [],
      tiene_variantes: material.tiene_variantes || false,
    })
  } catch (error) {
    console.error("❌ Error obteniendo variantes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("➕ POST Variantes - Material ID:", params.id)

    const { db } = await connectToDatabase()
    const materialId = params.id
    const body = await request.json()

    console.log("📝 Datos recibidos:", body)

    // Validar ObjectId
    if (!ObjectId.isValid(materialId)) {
      return NextResponse.json({ error: "ID de material inválido" }, { status: 400 })
    }

    const result = await db.collection("materiales").updateOne(
      { _id: new ObjectId(materialId) },
      {
        $push: { variantes: { ...body, id: Date.now() } },
        $set: { tiene_variantes: true, updated_at: new Date() },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
    }

    console.log("✅ Variante agregada exitosamente")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Error agregando variante:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🔄 PUT Variantes - Material ID:", params.id)

    const { db } = await connectToDatabase()
    const materialId = params.id
    const body = await request.json()

    console.log("📝 Datos para actualizar:", body)

    // Validar ObjectId
    if (!ObjectId.isValid(materialId)) {
      return NextResponse.json({ error: "ID de material inválido" }, { status: 400 })
    }

    const { proveedor_id, tipo_variante, variantes_precios } = body

    // Actualizar el material con la información de variantes
    const result = await db.collection("materiales").updateOne(
      { _id: new ObjectId(materialId) },
      {
        $set: {
          tiene_variantes: true,
          tipo_variante: tipo_variante,
          variantes_precios: variantes_precios || [],
          updated_at: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
    }

    console.log("✅ Variantes actualizadas exitosamente")
    return NextResponse.json({
      success: true,
      message: "Variantes actualizadas correctamente",
    })
  } catch (error) {
    console.error("❌ Error actualizando variantes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
