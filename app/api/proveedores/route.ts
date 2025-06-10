import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Obtener todos los proveedores
    const proveedores = await db.collection("proveedores").find({}).sort({ nombre: 1 }).toArray()

    return NextResponse.json({
      success: true,
      proveedores,
    })
  } catch (error) {
    console.error("Error obteniendo proveedores:", error)
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log("🔍 API Proveedores - POST iniciado")
    await connectToDatabase()

    const data = await request.json()
    console.log("📊 Datos recibidos:", data)

    // Assuming you still want to use the Proveedor model for POST requests
    const { db } = await connectToDatabase() // Get the database connection

    const nuevoProveedor = {
      nombre: data.nombre,
      contacto: data.contacto,
      telefono: data.telefono,
      email: data.email,
      direccion: data.direccion,
      ciudad: data.ciudad,
      pais: data.pais || "México",
      tipoMateriales: data.tipoMateriales || [],
      descuentoGeneral: data.descuentoGeneral || 0,
      isActive: true,
    }

    const result = await db.collection("proveedores").insertOne(nuevoProveedor)
    const nuevoProveedorId = result.insertedId

    console.log("✅ Proveedor creado:", nuevoProveedorId)

    return NextResponse.json({
      success: true,
      proveedor: {
        _id: nuevoProveedorId.toString(),
        nombre: data.nombre,
        contacto: data.contacto,
        telefono: data.telefono,
        email: data.email,
      },
    })
  } catch (error) {
    console.error("❌ Error creando proveedor:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear proveedor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
