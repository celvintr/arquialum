import { NextResponse, type NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const { db } = await connectToDatabase()

    console.log("🔍 Consultando estado de pago para cotización:", resolvedParams.id)

    // Obtener la cotización
    const cotizacion = await db.collection("cotizacions").findOne({ _id: resolvedParams.id })

    if (!cotizacion) {
      console.log("❌ Cotización no encontrada:", resolvedParams.id)
      return NextResponse.json({ success: false, error: "Cotización no encontrada" }, { status: 404 })
    }

    console.log("✅ Cotización encontrada:", cotizacion.numero, "Total:", cotizacion.total)

    // Obtener todos los pagos relacionados con esta cotización
    const pagos = await db
      .collection("pagos")
      .find({
        $or: [
          { cotizacion_id: resolvedParams.id },
          { factura_id: { $regex: resolvedParams.id } },
          { orden_trabajo_id: { $regex: resolvedParams.id } },
        ],
      })
      .toArray()

    console.log("💳 Pagos encontrados:", pagos.length)

    // Calcular totales de pagos
    const totalPagado = pagos.reduce((sum, pago) => {
      const monto = pago.monto || 0
      console.log("💰 Pago:", pago.numero, "Monto:", monto, "Estado:", pago.estado)
      return sum + (pago.estado === "confirmado" ? monto : 0)
    }, 0)

    const saldoPendiente = Math.max(0, (cotizacion.total || 0) - totalPagado)
    const porcentajePagado = cotizacion.total > 0 ? (totalPagado / cotizacion.total) * 100 : 0

    console.log("📊 Resumen - Total:", cotizacion.total, "Pagado:", totalPagado, "Pendiente:", saldoPendiente)

    // Obtener órdenes de trabajo relacionadas
    const ordenes = await db.collection("ordenes-trabajo").find({ cotizacion_id: resolvedParams.id }).toArray()

    const estadoPago = {
      total_cotizacion: cotizacion.total || 0,
      total_pagado: totalPagado,
      saldo_pendiente: saldoPendiente,
      porcentaje_pagado: porcentajePagado,
      pagos: pagos,
      ordenes: ordenes,
      puede_pagar: ordenes.some((orden) => orden.estado === "en_proceso" || orden.estado === "completada"),
    }

    return NextResponse.json({
      success: true,
      estado_pago: estadoPago,
    })
  } catch (error) {
    console.error("❌ Error obteniendo estado de pago:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: Request, params: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  try {
    const cotizacionId = resolvedParams.id
    const { estadoPago } = await request.json()

    if (!estadoPago) {
      return new NextResponse(JSON.stringify({ error: "El estado de pago es requerido" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    const { db } = await connectToDatabase()

    const updatedCotizacion = await db
      .collection("cotizacions")
      .updateOne({ _id: cotizacionId }, { $set: { estadoPago: estadoPago } })

    if (!updatedCotizacion.modifiedCount) {
      return new NextResponse(JSON.stringify({ error: "Cotización no encontrada o no se pudo actualizar" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    const cotizacion = await db.collection("cotizacions").findOne({ _id: cotizacionId })

    return new NextResponse(JSON.stringify(cotizacion), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error actualizando el estado de pago:", error)
    return new NextResponse(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
