import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const facturasEjemplo = [
      {
        _id: "fact_001",
        numero: "FACT-2024-001",
        orden_trabajo_id: "orden_001",
        cliente_id: "cliente_001",
        tipo: "total",
        estado: "pagada",
        fecha_emision: "2024-01-20",
        fecha_vencimiento: "2024-02-20",
        subtotal: 15000,
        impuestos: 2400,
        total: 17400,
        saldo_pendiente: 0,
      },
      {
        _id: "fact_002",
        numero: "FACT-2024-002",
        orden_trabajo_id: "orden_002",
        cliente_id: "cliente_002",
        tipo: "parcial",
        estado: "pendiente",
        fecha_emision: "2024-01-18",
        fecha_vencimiento: "2024-02-18",
        subtotal: 8500,
        impuestos: 1360,
        total: 9860,
        saldo_pendiente: 9860,
      },
    ]

    return NextResponse.json({
      success: true,
      facturas: facturasEjemplo,
    })
  } catch (error) {
    console.error("Error obteniendo facturas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()

    console.log("📝 Creando factura:", body)

    if (!body.orden_trabajo_id) {
      return NextResponse.json({ error: "ID de orden de trabajo es requerido" }, { status: 400 })
    }

    // Obtener datos de la orden de trabajo
    let ordenData = null
    try {
      const ordenResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/ordenes-trabajo/${body.orden_trabajo_id}`)
      if (ordenResponse.ok) {
        const ordenResult = await ordenResponse.json()
        ordenData = ordenResult.orden
      }
    } catch (error) {
      console.log("⚠️ No se pudo obtener datos de la orden:", error)
    }

    // Generar número de factura si no se proporciona
    const numeroFactura = body.numero || `FACT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    const nuevaFactura = {
      _id: body._id || `fact_${Date.now()}`,
      numero: numeroFactura,
      serie: body.serie || "A",
      tipo: body.tipo || "factura",
      orden_trabajo_id: body.orden_trabajo_id,
      numero_orden: body.numero_orden || ordenData?.numero || "N/A",
      cotizacion_id: body.cotizacion_id || ordenData?.cotizacion_id || "",
      cliente_id: body.cliente_id || ordenData?.cliente_id || "cliente_default",
      cliente: body.cliente || {
        nombre: ordenData?.cliente_nombre || "Cliente",
        rtn: "",
        direccion: "",
        telefono: "",
        email: "",
      },
      items: body.items || [
        {
          tipo: "servicio",
          descripcion: `Trabajo realizado según orden ${body.numero_orden || ordenData?.numero}`,
          cantidad: 1,
          precio_unitario: body.subtotal || ordenData?.costos_estimados?.total || 0,
          descuento: 0,
          subtotal: body.subtotal || ordenData?.costos_estimados?.total || 0,
          impuesto: (body.subtotal || ordenData?.costos_estimados?.total || 0) * 0.15,
          total: (body.subtotal || ordenData?.costos_estimados?.total || 0) * 1.15,
        },
      ],
      subtotal: body.subtotal || ordenData?.costos_estimados?.total || 0,
      descuento_global: body.descuento_global || 0,
      impuesto_total: body.impuesto_total || (body.subtotal || ordenData?.costos_estimados?.total || 0) * 0.15,
      total: body.total || (body.subtotal || ordenData?.costos_estimados?.total || 0) * 1.15,
      estado: body.estado || "emitida",
      fecha_emision: body.fecha_emision || new Date().toISOString(),
      fecha_vencimiento: body.fecha_vencimiento || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      terminos_pago: body.terminos_pago || "30 días",
      notas: body.notas || `Factura generada desde orden de trabajo ${body.numero_orden}`,
      pago_id: body.pago_id, // Vincular con el pago que la generó
      created_at: new Date(),
    }

    // Guardar en base de datos (simulado por ahora)
    console.log("✅ Factura creada:", nuevaFactura)

    return NextResponse.json({
      success: true,
      factura: nuevaFactura,
      message: "Factura creada exitosamente",
    })
  } catch (error) {
    console.error("❌ Error creando factura:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
