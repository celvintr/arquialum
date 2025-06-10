import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 API Clientes - GET iniciado")

    const { db } = await connectToDatabase()

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    console.log("📊 Parámetros:", { page, limit, search })

    // Construir query de búsqueda
    const query: any = {}

    if (search) {
      query.$or = [
        { nombre: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { telefono: { $regex: search, $options: "i" } },
      ]
    }

    console.log("📊 Query clientes:", query)

    // Obtener clientes con paginación
    const skip = (page - 1) * limit
    const clientes = await db
      .collection("clientes")
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Contar total
    const total = await db.collection("clientes").countDocuments(query)

    console.log(`✅ Clientes encontrados: ${clientes.length}/${total}`)

    return NextResponse.json({
      success: true,
      clientes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("❌ Error en API clientes:", error)
    return NextResponse.json({ success: false, error: "Error al obtener clientes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 API Clientes - POST iniciado")

    const { db } = await connectToDatabase()
    const body = await request.json()

    console.log("📊 Datos recibidos:", body)

    // Validar datos requeridos
    if (!body.nombre || !body.email) {
      return NextResponse.json({ success: false, error: "Nombre y email son requeridos" }, { status: 400 })
    }

    // Verificar si el email ya existe
    const existeEmail = await db.collection("clientes").findOne({ email: body.email })
    if (existeEmail) {
      return NextResponse.json({ success: false, error: "El email ya está registrado" }, { status: 400 })
    }

    // Crear cliente
    const nuevoCliente = {
      ...body,
      _id: `cliente_${Date.now()}`,
      tipo: body.tipo || "particular",
      activo: true,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await db.collection("clientes").insertOne(nuevoCliente)

    console.log("✅ Cliente creado:", result.insertedId)

    return NextResponse.json(
      {
        success: true,
        cliente: nuevoCliente,
        message: "Cliente creado exitosamente",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("❌ Error al crear cliente:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear cliente",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
