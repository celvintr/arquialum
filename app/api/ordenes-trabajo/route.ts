import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"

// Usar la colección correcta: ordenes-trabajo
const COLLECTION_NAME = "ordenes-trabajo"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // En la función GET, simplificar:
    const ordenes = await db.collection(COLLECTION_NAME).find().sort({ created_at: -1 }).toArray()
    const totalOrdenes = await db.collection(COLLECTION_NAME).countDocuments()

    console.log(`✅ Órdenes encontradas: ${ordenes.length} en colección ${COLLECTION_NAME}`)

    return NextResponse.json({
      success: true,
      ordenes,
      _debug: {
        coleccion_usada: COLLECTION_NAME,
        total_ordenes: totalOrdenes,
      },
    })
  } catch (error) {
    console.error("Error al obtener órdenes de trabajo:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener órdenes de trabajo",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()
    const { cotizacion_id, cotizacion_numero, cliente_id, cliente_nombre } = data

    if (!cotizacion_id) {
      return NextResponse.json({ success: false, error: "ID de cotización requerido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // En la función POST, usar directamente:
    // Generar número de orden
    const fecha = new Date()
    const año = fecha.getFullYear()
    const timestamp = Date.now().toString().slice(-6)
    const numeroOrden = `OT-${año}-${timestamp}`

    // Crear la orden de trabajo
    const ordenTrabajo = {
      numero: numeroOrden,
      cotizacion_id,
      cotizacion_numero,
      cliente_id,
      cliente_nombre,
      cliente_email: data.cliente_email || "",
      cliente_telefono: data.cliente_telefono || "",
      estado: "pendiente",
      fecha_inicio: new Date(),
      fecha_estimada_fin: new Date(fecha.setDate(fecha.getDate() + 15)), // 15 días después
      costos_estimados: {
        materiales: 0,
        mano_obra: 0,
        otros: 0,
        total: 0,
      },
      costos_reales: {
        materiales: 0,
        mano_obra: 0,
        otros: 0,
        total: 0,
      },
      progreso_porcentaje: 0,
      materiales_utilizados: [],
      mano_obra_registrada: [],
      notas: `Orden creada desde cotización ${cotizacion_numero}`,
      created_at: new Date(),
    }

    // Obtener datos de la cotización
    try {
      const cotizacionResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/cotizaciones/${cotizacion_id}`)

      if (cotizacionResponse.ok) {
        const cotizacionData = await cotizacionResponse.json()

        if (cotizacionData.success && cotizacionData.cotizacion) {
          // Agregar items y grupos de la cotización
          ordenTrabajo.items_cotizacion = cotizacionData.cotizacion.items || []
          ordenTrabajo.grupos_cotizacion = cotizacionData.cotizacion.grupos || []

          // Calcular costos estimados
          const subtotal = cotizacionData.cotizacion.subtotal || 0
          ordenTrabajo.costos_estimados = {
            materiales: Math.round(subtotal * 0.6), // 60% materiales
            mano_obra: Math.round(subtotal * 0.3), // 30% mano de obra
            otros: Math.round(subtotal * 0.1), // 10% otros
            total: subtotal,
          }
        }
      }
    } catch (error) {
      console.error("Error al obtener datos de la cotización:", error)
    }

    const result = await db.collection(COLLECTION_NAME).insertOne(ordenTrabajo)

    return NextResponse.json({
      success: true,
      orden: {
        _id: result.insertedId,
        numero: numeroOrden,
      },
      message: "Orden de trabajo creada exitosamente",
    })
  } catch (error) {
    console.error("Error al crear orden de trabajo:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al crear orden de trabajo",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  return NextResponse.json({ message: "DELETE not implemented" }, { status: 501 })
}
