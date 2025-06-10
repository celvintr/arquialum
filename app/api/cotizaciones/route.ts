import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Usar la colección correcta: cotizacions
const COLLECTION_NAME = "cotizacions"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const estado = searchParams.get("estado")
    const tipo = searchParams.get("tipo")
    const cliente = searchParams.get("cliente")
    const fechaInicio = searchParams.get("fechaInicio")
    const fechaFin = searchParams.get("fechaFin")

    const { db } = await connectToDatabase()

    // Construir filtros
    const filtros: any = {}

    if (estado && estado !== "todos") {
      filtros.estado = estado
    }

    if (tipo && tipo !== "todos") {
      filtros.tipo = tipo
    }

    if (cliente) {
      filtros.cliente_id = cliente
    }

    if (fechaInicio || fechaFin) {
      filtros.fechaCreacion = {}
      if (fechaInicio) {
        filtros.fechaCreacion.$gte = new Date(fechaInicio)
      }
      if (fechaFin) {
        filtros.fechaCreacion.$lte = new Date(fechaFin)
      }
    }

    console.log("🔍 Filtros aplicados:", filtros)

    // Calcular skip para paginación
    const skip = (page - 1) * limit

    // Obtener cotizaciones con paginación
    const cotizaciones = await db
      .collection(COLLECTION_NAME)
      .find(filtros)
      .sort({ fechaCreacion: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Obtener total para paginación
    const total = await db.collection(COLLECTION_NAME).countDocuments(filtros)

    // Obtener información de clientes para cada cotización
    const cotizacionesConClientes = await Promise.all(
      cotizaciones.map(async (cotizacion) => {
        let cliente = null
        if (cotizacion.cliente_id) {
          if (ObjectId.isValid(cotizacion.cliente_id)) {
            cliente = await db.collection("clientes").findOne({
              _id: new ObjectId(cotizacion.cliente_id),
            })
          } else {
            cliente = await db.collection("clientes").findOne({
              _id: cotizacion.cliente_id,
            })
          }
        }

        // Limpiar grupos de blob URLs
        const gruposLimpios = (cotizacion.grupos || []).map((grupo: any) => ({
          ...grupo,
          imagenUrl: grupo.imagenUrl && grupo.imagenUrl.startsWith("blob:") ? null : grupo.imagenUrl,
          imagen: undefined, // No enviar objetos File
        }))

        return {
          ...cotizacion,
          cliente: cliente,
          grupos: gruposLimpios,
        }
      }),
    )

    const response = {
      success: true,
      cotizaciones: cotizacionesConClientes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error al obtener cotizaciones:", error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Error al obtener cotizaciones",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { db } = await connectToDatabase()

    console.log("📝 Creando nueva cotización:", body)

    // Limpiar grupos de blob URLs antes de guardar
    const gruposLimpios = (body.grupos || []).map((grupo: any) => ({
      ...grupo,
      imagenUrl: grupo.imagenUrl && grupo.imagenUrl.startsWith("blob:") ? null : grupo.imagenUrl,
      imagen: undefined, // No guardar objetos File
    }))

    // Generar número de cotización único
    const year = new Date().getFullYear()
    const randomNum = Math.floor(Math.random() * 900000) + 100000
    const numero = `COT-${year}-${randomNum}`

    // Verificar que el número no exista
    const existeNumero = await db.collection(COLLECTION_NAME).findOne({ numero })
    if (existeNumero) {
      // Generar otro número si existe
      const newRandomNum = Math.floor(Math.random() * 900000) + 100000
      body.numero = `COT-${year}-${newRandomNum}`
    } else {
      body.numero = numero
    }

    // Preparar datos para insertar
    const cotizacionData = {
      ...body,
      grupos: gruposLimpios,
      fechaCreacion: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
      estado: body.estado || "borrador",
    }

    // Insertar en la base de datos
    const result = await db.collection(COLLECTION_NAME).insertOne(cotizacionData)

    if (!result.insertedId) {
      throw new Error("No se pudo insertar la cotización")
    }

    // Obtener la cotización creada con información del cliente
    const cotizacionCreada = await db.collection(COLLECTION_NAME).findOne({
      _id: result.insertedId,
    })

    let cliente = null
    if (cotizacionCreada?.cliente_id) {
      if (ObjectId.isValid(cotizacionCreada.cliente_id)) {
        cliente = await db.collection("clientes").findOne({
          _id: new ObjectId(cotizacionCreada.cliente_id),
        })
      } else {
        cliente = await db.collection("clientes").findOne({
          _id: cotizacionCreada.cliente_id,
        })
      }
    }

    const response = {
      success: true,
      cotizacion: {
        ...cotizacionCreada,
        cliente: cliente,
      },
      message: "Cotización creada exitosamente",
    }

    console.log("✅ Cotización creada:", cotizacionCreada?.numero)

    return new NextResponse(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error al crear cotización:", error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Error al crear la cotización",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
