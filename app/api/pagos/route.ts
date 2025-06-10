import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const pagos = await db.collection("pagos").find({}).toArray()

    return NextResponse.json({
      success: true,
      pagos,
    })
  } catch (error) {
    console.error("Error obteniendo pagos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()

    console.log("📝 Registrando pago:", body)

    if (!body.orden_trabajo_id) {
      return NextResponse.json({ error: "ID de orden de trabajo es requerido" }, { status: 400 })
    }

    if (!body.monto || body.monto <= 0) {
      return NextResponse.json({ error: "El monto debe ser mayor a cero" }, { status: 400 })
    }

    // Generar número de pago
    const numeroPago = `PAGO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    const nuevoPago = {
      _id: `pago_${Date.now()}`,
      numero: numeroPago,
      orden_trabajo_id: body.orden_trabajo_id,
      cliente_id: body.cliente_id || "cliente_default",
      monto: body.monto,
      metodo_pago: body.metodo_pago || "efectivo",
      referencia: body.referencia || "",
      estado: "completado",
      fecha: new Date().toISOString(),
      notas: body.notas || "",
      created_at: new Date(),
    }

    // Guardar el pago en la base de datos
    await db.collection("pagos").insertOne(nuevoPago)

    console.log("✅ Pago registrado:", nuevoPago)

    return NextResponse.json({
      success: true,
      pago: nuevoPago,
      message: "Pago registrado exitosamente",
    })
  } catch (error) {
    console.error("❌ Error registrando pago:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
