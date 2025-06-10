import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

interface Params {
  id: string
}

// Usar la colección correcta: cotizacions
const COLLECTION_NAME = "cotizacions"

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params
    const { db } = await connectToDatabase()

    console.log(`🔍 Buscando cotización con ID: ${id}`)

    let cotizacion

    // Try to find by ObjectId first
    if (ObjectId.isValid(id)) {
      cotizacion = await db.collection(COLLECTION_NAME).findOne({
        _id: new ObjectId(id),
      })
      if (cotizacion) console.log("✅ Encontrada por ObjectId")
    }

    // If not found, try by numero field
    if (!cotizacion) {
      cotizacion = await db.collection(COLLECTION_NAME).findOne({
        numero: id,
      })
      if (cotizacion) console.log("✅ Encontrada por numero")
    }

    // If still not found, try as string ID
    if (!cotizacion) {
      cotizacion = await db.collection(COLLECTION_NAME).findOne({
        _id: id,
      })
      if (cotizacion) console.log("✅ Encontrada por string ID")
    }

    if (!cotizacion) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Cotización no encontrada",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Get related cliente data with better error handling
    let cliente = null
    if (cotizacion.cliente_id) {
      try {
        if (ObjectId.isValid(cotizacion.cliente_id)) {
          cliente = await db.collection("clientes").findOne({
            _id: new ObjectId(cotizacion.cliente_id),
          })
        } else {
          cliente = await db.collection("clientes").findOne({
            _id: cotizacion.cliente_id,
          })
        }

        if (!cliente) {
          console.warn(`⚠️ Cliente no encontrado para ID: ${cotizacion.cliente_id}`)
        }
      } catch (error) {
        console.error("Error al buscar cliente:", error)
      }
    }

    // Get related vendedor data with better error handling
    let vendedor = null
    if (cotizacion.vendedor_id) {
      try {
        if (ObjectId.isValid(cotizacion.vendedor_id)) {
          vendedor = await db.collection("users").findOne({
            _id: new ObjectId(cotizacion.vendedor_id),
          })
        } else {
          vendedor = await db.collection("users").findOne({
            _id: cotizacion.vendedor_id,
          })
        }

        if (!vendedor) {
          console.warn(`⚠️ Vendedor no encontrado para ID: ${cotizacion.vendedor_id}`)
        }
      } catch (error) {
        console.error("Error al buscar vendedor:", error)
      }
    }

    // Ensure we have default values for cliente and vendedor
    const clienteData = cliente || {
      nombre: "Cliente no especificado",
      email: "",
      telefono: "",
      direccion: "",
      rtn: "",
    }

    const vendedorData = vendedor || {
      nombre: "Vendedor no especificado",
      email: "",
    }

    const response = {
      success: true,
      cotizacion: {
        ...cotizacion,
        cliente: clienteData,
        vendedor: vendedorData,
        items: cotizacion.items || [],
        grupos: cotizacion.grupos || [],
        subtotal: cotizacion.subtotal || 0,
        iva: cotizacion.iva || 0,
        total: cotizacion.total || 0,
        descuento: cotizacion.descuento || 0,
        pagos_realizados: cotizacion.pagos_realizados || 0,
        saldo_pendiente: cotizacion.saldo_pendiente || cotizacion.total || 0,
      },
    }

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error al obtener la cotización:", error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Error al obtener la cotización",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { db } = await connectToDatabase()

    console.log(`🔄 Actualizando cotización ${id} con datos:`, body)

    let filter
    if (ObjectId.isValid(id)) {
      filter = { _id: new ObjectId(id) }
    } else {
      filter = { _id: id }
    }

    // Verificar que la cotización existe
    const cotizacionExistente = await db.collection(COLLECTION_NAME).findOne(filter)
    if (!cotizacionExistente) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Cotización no encontrada",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Verificar si tiene pagos asociados (no se puede editar si tiene pagos)
    const ordenAsociada = await db.collection("ordenes-trabajo").findOne({
      cotizacion_id: cotizacionExistente._id.toString(),
    })

    if (ordenAsociada) {
      const pagosAsociados = await db.collection("pagos").findOne({
        orden_trabajo_id: ordenAsociada._id.toString(),
        estado: "completado",
      })

      if (pagosAsociados && !body.estado) {
        // Solo bloquear edición de contenido, no cambios de estado
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: "No se puede editar: La cotización tiene pagos asociados",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        )
      }
    }

    // Validar cambios de estado
    if (body.estado) {
      const estadoActual = cotizacionExistente.estado
      const nuevoEstado = body.estado

      console.log(`🔄 Cambio de estado: ${estadoActual} → ${nuevoEstado}`)

      // Validaciones de transiciones de estado
      const transicionesValidas = {
        borrador: ["enviada", "aprobada", "rechazada"],
        enviada: ["aprobada", "rechazada", "borrador"],
        aprobada: ["rechazada"], // Una vez aprobada, solo se puede rechazar
        rechazada: ["borrador"], // Se puede volver a borrador para corregir
      }

      if (!transicionesValidas[estadoActual]?.includes(nuevoEstado)) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: `No se puede cambiar de estado "${estadoActual}" a "${nuevoEstado}"`,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        )
      }

      // Verificar si ya tiene orden de trabajo (no se puede cambiar estado si ya tiene orden)
      const ordenExistente = await db.collection("ordenes-trabajo").findOne({
        cotizacion_id: cotizacionExistente._id.toString(),
      })

      if (ordenExistente && nuevoEstado !== "rechazada") {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: "No se puede cambiar el estado: La cotización ya tiene una orden de trabajo asociada",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        )
      }
    }

    // Preparar datos de actualización
    const updateData = {
      ...body,
      updated_at: new Date(),
    }

    // Si se está cambiando la fecha, convertirla
    if (body.fecha) {
      updateData.fecha = new Date(body.fecha)
    }

    const result = await db.collection(COLLECTION_NAME).updateOne(filter, { $set: updateData })

    if (result.matchedCount === 0) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Cotización no encontrada",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Get updated cotizacion
    const updatedCotizacion = await db.collection(COLLECTION_NAME).findOne(filter)

    // Get related cliente data
    let cliente = null
    if (updatedCotizacion?.cliente_id) {
      if (ObjectId.isValid(updatedCotizacion.cliente_id)) {
        cliente = await db.collection("clientes").findOne({
          _id: new ObjectId(updatedCotizacion.cliente_id),
        })
      } else {
        cliente = await db.collection("clientes").findOne({
          _id: updatedCotizacion.cliente_id,
        })
      }
    }

    const response = {
      success: true,
      cotizacion: {
        ...updatedCotizacion,
        cliente: cliente,
        items: updatedCotizacion?.items || [],
      },
    }

    console.log(`✅ Cotización actualizada exitosamente`)

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error al actualizar la cotización:", error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Error al actualizar la cotización",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params
    const { db } = await connectToDatabase()

    let filter
    if (ObjectId.isValid(id)) {
      filter = { _id: new ObjectId(id) }
    } else {
      filter = { _id: id }
    }

    // Verificar que la cotización existe
    const cotizacionExistente = await db.collection(COLLECTION_NAME).findOne(filter)
    if (!cotizacionExistente) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Cotización no encontrada",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Verificar si tiene orden de trabajo asociada
    const ordenExistente = await db.collection("ordenes-trabajo").findOne({
      cotizacion_id: cotizacionExistente._id.toString(),
    })

    if (ordenExistente) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "No se puede eliminar: La cotización tiene una orden de trabajo asociada",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Verificar si tiene pagos asociados
    const pagosExistentes = await db.collection("pagos").findOne({
      cotizacion_id: cotizacionExistente._id.toString(),
    })

    if (pagosExistentes) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "No se puede eliminar: La cotización tiene pagos registrados",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const result = await db.collection(COLLECTION_NAME).deleteOne(filter)

    if (result.deletedCount === 0) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Cotización no encontrada",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Also delete related items if stored separately
    await db.collection("cotizacion_items").deleteMany({
      cotizacion_id: id,
    })

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "Cotización eliminada correctamente",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error al eliminar la cotización:", error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Error al eliminar la cotización",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
      },
    )
  }
}
