import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

interface Params {
  id: string
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params
    const { db } = await connectToDatabase()

    // Usar la colección correcta: ordenes-trabajo
    const COLLECTION_NAME = "ordenes-trabajo"

    // En la función GET, simplificar la búsqueda:
    console.log(`🔍 Buscando orden con ID: ${id} en colección ${COLLECTION_NAME}`)

    // Listar todas las colecciones para debug
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)
    console.log(`📁 Colecciones disponibles:`, collectionNames)

    let orden = null
    let collectionUsed = ""

    const count = await db.collection(COLLECTION_NAME).countDocuments()
    console.log(`📊 Colección ${COLLECTION_NAME}: ${count} documentos`)

    if (count > 0) {
      // Mostrar ejemplos de órdenes
      const ejemplos = await db.collection(COLLECTION_NAME).find().limit(5).toArray()
      console.log(`📋 Ejemplos en ${COLLECTION_NAME}:`)
      ejemplos.forEach((o, i) => {
        console.log(`  ${i + 1}. ID: "${o._id}" (tipo: ${typeof o._id}), Numero: ${o.numero}`)
      })

      // Intentar buscar por diferentes métodos
      if (ObjectId.isValid(id)) {
        orden = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
        if (orden) {
          console.log(`✅ Orden encontrada en ${COLLECTION_NAME} por ObjectId`)
          collectionUsed = COLLECTION_NAME
        }
      }

      if (!orden) {
        orden = await db.collection(COLLECTION_NAME).findOne({ _id: id })
        if (orden) {
          console.log(`✅ Orden encontrada en ${COLLECTION_NAME} por string ID`)
          collectionUsed = COLLECTION_NAME
        }
      }

      if (!orden) {
        orden = await db.collection(COLLECTION_NAME).findOne({ numero: id })
        if (orden) {
          console.log(`✅ Orden encontrada en ${COLLECTION_NAME} por numero`)
          collectionUsed = COLLECTION_NAME
        }
      }
    }

    if (!orden) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Orden no encontrada",
          debug: {
            id_buscado: id,
            colecciones_revisadas: [COLLECTION_NAME],
            colecciones_disponibles: collectionNames,
          },
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        orden,
        _debug: {
          coleccion_usada: collectionUsed,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error al obtener la orden:", error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Error al obtener la orden",
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
    const { id } = await params
    const body = await request.json()
    const { db } = await connectToDatabase()

    // Usar la colección correcta: ordenes-trabajo
    const COLLECTION_NAME = "ordenes-trabajo"

    let orden = null
    let collectionUsed = ""

    const count = await db.collection(COLLECTION_NAME).countDocuments()

    if (count > 0) {
      // Intentar buscar por diferentes métodos
      if (ObjectId.isValid(id)) {
        orden = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
        if (orden) {
          collectionUsed = COLLECTION_NAME
        }
      }

      if (!orden) {
        orden = await db.collection(COLLECTION_NAME).findOne({ _id: id })
        if (orden) {
          collectionUsed = COLLECTION_NAME
        }
      }

      if (!orden) {
        orden = await db.collection(COLLECTION_NAME).findOne({ numero: id })
        if (orden) {
          collectionUsed = COLLECTION_NAME
        }
      }
    }

    if (!orden) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Orden no encontrada para actualizar",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Actualizar la orden
    let filter
    if (ObjectId.isValid(id)) {
      filter = { _id: new ObjectId(id) }
    } else if (typeof orden._id === "object") {
      filter = { _id: orden._id }
    } else {
      filter = { _id: id }
    }

    const result = await db.collection(collectionUsed).updateOne(filter, { $set: { ...body, updated_at: new Date() } })

    if (result.matchedCount === 0) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "No se pudo actualizar la orden",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Obtener la orden actualizada
    const ordenActualizada = await db.collection(collectionUsed).findOne(filter)

    return new NextResponse(
      JSON.stringify({
        success: true,
        orden: ordenActualizada,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error al actualizar la orden:", error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Error al actualizar la orden",
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
    const { id } = await params
    const { db } = await connectToDatabase()

    // Usar la colección correcta: ordenes-trabajo
    const COLLECTION_NAME = "ordenes-trabajo"

    let orden = null
    let collectionUsed = ""

    const count = await db.collection(COLLECTION_NAME).countDocuments()

    if (count > 0) {
      // Intentar buscar por diferentes métodos
      if (ObjectId.isValid(id)) {
        orden = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
        if (orden) {
          collectionUsed = COLLECTION_NAME
        }
      }

      if (!orden) {
        orden = await db.collection(COLLECTION_NAME).findOne({ _id: id })
        if (orden) {
          collectionUsed = COLLECTION_NAME
        }
      }

      if (!orden) {
        orden = await db.collection(COLLECTION_NAME).findOne({ numero: id })
        if (orden) {
          collectionUsed = COLLECTION_NAME
        }
      }
    }

    if (!orden) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Orden no encontrada para eliminar",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Eliminar la orden
    let filter
    if (ObjectId.isValid(id)) {
      filter = { _id: new ObjectId(id) }
    } else if (typeof orden._id === "object") {
      filter = { _id: orden._id }
    } else {
      filter = { _id: id }
    }

    const result = await db.collection(collectionUsed).deleteOne(filter)

    if (result.deletedCount === 0) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "No se pudo eliminar la orden",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "Orden eliminada correctamente",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error al eliminar la orden:", error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Error al eliminar la orden",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
