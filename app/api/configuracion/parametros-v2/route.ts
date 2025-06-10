import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  try {
    console.log("🔍 GET Configuraciones - Obteniendo parámetros de mano de obra")
    const { db } = await connectToDatabase()

    // Obtener todas las configuraciones
    const configuraciones = await db.collection("configuraciones_mano_obra").find({}).toArray()
    console.log(`✅ ${configuraciones.length} configuraciones encontradas`)

    return NextResponse.json({
      success: true,
      configuraciones,
    })
  } catch (error) {
    console.error("❌ Error obteniendo configuraciones:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        configuraciones: [],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("➕ POST Configuración - Creando/actualizando configuración")
    const { db } = await connectToDatabase()
    const body = await request.json()

    console.log("📝 Datos recibidos:", body)

    // Validar datos mínimos
    if (!body.tipo) {
      return NextResponse.json({ error: "Tipo de configuración es obligatorio" }, { status: 400 })
    }

    // Buscar si ya existe una configuración de este tipo
    const configuracionExistente = await db.collection("configuraciones_mano_obra").findOne({ tipo: body.tipo })

    if (configuracionExistente) {
      // Actualizar configuración existente
      const updateData = {
        ...body,
        updated_at: new Date(),
      }

      const result = await db
        .collection("configuraciones_mano_obra")
        .updateOne({ tipo: body.tipo }, { $set: updateData })

      if (result.modifiedCount > 0) {
        console.log("✅ Configuración actualizada exitosamente")
        return NextResponse.json({
          success: true,
          message: "Configuración actualizada correctamente",
        })
      } else {
        throw new Error("No se pudo actualizar la configuración")
      }
    } else {
      // Crear nueva configuración
      const nuevaConfiguracion = {
        _id: uuidv4(),
        ...body,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const result = await db.collection("configuraciones_mano_obra").insertOne(nuevaConfiguracion)

      if (result.acknowledged) {
        console.log("✅ Configuración creada exitosamente")
        return NextResponse.json({
          success: true,
          message: "Configuración creada correctamente",
        })
      } else {
        throw new Error("Error al insertar la configuración")
      }
    }
  } catch (error) {
    console.error("❌ Error guardando configuración:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
