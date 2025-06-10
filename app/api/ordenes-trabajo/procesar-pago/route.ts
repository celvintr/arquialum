import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()

    console.log("💳 Procesando pago:", body)

    if (!body.orden_trabajo_id) {
      return NextResponse.json({ error: "ID de orden de trabajo es requerido" }, { status: 400 })
    }

    if (!body.monto || body.monto <= 0) {
      return NextResponse.json({ error: "El monto debe ser mayor a cero" }, { status: 400 })
    }

    // 1. Registrar el pago
    const numeroPago = `PAGO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    const nuevoPago = {
      _id: `pago_${Date.now()}`,
      numero: numeroPago,
      orden_trabajo_id: body.orden_trabajo_id,
      cliente_id: body.cliente_id || "cliente_default",
      cliente_nombre: body.cliente_nombre || "Cliente",
      tipo: body.tipo_pago, // "abono" o "completo"
      monto: body.monto,
      metodo_pago: body.metodo_pago || "efectivo",
      referencia: body.referencia || "",
      estado: "completado",
      fecha: new Date().toISOString(),
      notas: body.notas || "",
      created_at: new Date(),
    }

    await db.collection("pagos").insertOne(nuevoPago)

    // 2. Crear la factura
    const numeroFactura = `FACT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    const nuevaFactura = {
      _id: `fact_${Date.now()}`,
      numero: numeroFactura,
      serie: "A",
      tipo: "factura",
      orden_trabajo_id: body.orden_trabajo_id,
      numero_orden: body.numero_orden,
      pago_id: nuevoPago._id,
      cliente_id: body.cliente_id || "cliente_default",
      cliente: {
        nombre: body.cliente_nombre || "Cliente",
        rtn: "",
        direccion: "",
        telefono: "",
        email: "",
      },
      items: [
        {
          tipo: "servicio",
          descripcion: `Trabajo realizado según orden ${body.numero_orden}`,
          cantidad: 1,
          precio_unitario: body.monto,
          descuento: 0,
          subtotal: body.monto,
          impuesto: body.monto * 0.15,
          total: body.monto * 1.15,
        },
      ],
      subtotal: body.monto,
      descuento_global: 0,
      impuesto_total: body.monto * 0.15,
      total: body.monto * 1.15,
      estado: body.tipo_pago === "completo" ? "pagada" : "parcial",
      tipo_pago: body.tipo_pago,
      monto_pagado: body.monto,
      fecha_emision: new Date().toISOString(),
      fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      terminos_pago: "30 días",
      notas: body.notas || `Factura generada desde orden de trabajo ${body.numero_orden}`,
      documentos_adjuntos: [], // Para futuras capturas de pantalla, documentos, etc.
      created_at: new Date(),
    }

    await db.collection("facturas").insertOne(nuevaFactura)

    // 3. Actualizar estado de la orden
    const nuevoEstado = body.tipo_pago === "completo" ? "facturada" : "completada"
    await db.collection("ordenes-trabajo").updateOne(
      { _id: body.orden_trabajo_id },
      {
        $set: {
          estado: nuevoEstado,
          fecha_facturacion: new Date().toISOString(),
          updated_at: new Date(),
        },
      },
    )

    console.log("✅ Pago procesado y factura creada:", { pago: nuevoPago, factura: nuevaFactura })

    return NextResponse.json({
      success: true,
      pago: nuevoPago,
      factura: nuevaFactura,
      message: `Pago procesado y factura ${numeroFactura} generada exitosamente`,
    })
  } catch (error) {
    console.error("❌ Error procesando pago:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
