import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET /api/tipos-producto - Obteniendo tipos de producto")

    const { db } = await connectToDatabase()

    // Obtener todos los tipos de producto
    const tipos = await db.collection("tipos_producto").find({}).sort({ nombre: 1 }).toArray()

    console.log("✅ Tipos de producto encontrados:", tipos.length)
    console.log(
      "📋 Tipos:",
      tipos.map((t) => ({ id: t._id, nombre: t.nombre })),
    )

    return NextResponse.json({
      success: true,
      tipos: tipos,
      tiposProducto: tipos, // También incluir con el nombre alternativo por compatibilidad
      total: tipos.length,
    })
  } catch (error) {
    console.error("❌ Error obteniendo tipos de producto:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("📝 POST /api/tipos-producto - Creando tipo de producto")

    const { db } = await connectToDatabase()
    const body = await request.json()

    const { nombre, descripcion } = body

    // Validar campos requeridos
    if (!nombre?.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    // Verificar que no exista un tipo con el mismo nombre
    const tipoExistente = await db.collection("tipos_producto").findOne({
      nombre: { $regex: new RegExp(`^${nombre.trim()}$`, "i") },
    })

    if (tipoExistente) {
      return NextResponse.json({ error: "Ya existe un tipo de producto con ese nombre" }, { status: 400 })
    }

    // Crear nuevo tipo de producto
    const nuevoTipo = {
      _id: `tipo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || "",
      estado: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("tipos_producto").insertOne(nuevoTipo)

    if (result.acknowledged) {
      console.log("✅ Tipo de producto creado:", nuevoTipo.nombre)
      return NextResponse.json({
        success: true,
        message: "Tipo de producto creado exitosamente",
        tipo: nuevoTipo,
      })
    } else {
      throw new Error("No se pudo crear el tipo de producto")
    }
  } catch (error) {
    console.error("❌ Error creando tipo de producto:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
