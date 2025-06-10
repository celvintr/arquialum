import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    console.log("🔍 GET Materiales del producto - ID:", resolvedParams.id)

    const { db } = await connectToDatabase()
    const productoId = resolvedParams.id

    // Buscar materiales asociados al producto
    const materiales = await db.collection("producto_materiales").find({ producto_id: productoId }).toArray()

    console.log("✅ Materiales encontrados:", materiales.length)

    return NextResponse.json({
      success: true,
      materiales,
    })
  } catch (error) {
    console.error("❌ Error obteniendo materiales del producto:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    console.log("➕ POST agregar material al producto:", resolvedParams.id)

    const { db } = await connectToDatabase()
    const body = await request.json()
    const { material_id, formula } = body

    console.log("📝 Datos recibidos:", { material_id, formula })

    // Validar datos
    if (!material_id) {
      return NextResponse.json({ error: "material_id es requerido" }, { status: 400 })
    }

    if (!formula) {
      return NextResponse.json({ error: "formula es requerida" }, { status: 400 })
    }

    // Verificar que el producto existe
    const producto = await db.collection("productos").findOne({ _id: resolvedParams.id })

    if (!producto) {
      console.log("❌ Producto no encontrado:", resolvedParams.id)
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    console.log("✅ Producto encontrado:", producto.nombre)

    // Verificar que el material existe
    const material = await db.collection("materiales").findOne({ _id: material_id })

    if (!material) {
      console.log("❌ Material no encontrado:", material_id)
      return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
    }

    console.log("✅ Material encontrado:", material.nombre)

    // Verificar si ya existe la relación
    const relacionExistente = await db.collection("producto_materiales").findOne({
      producto_id: resolvedParams.id,
      material_id: material_id,
    })

    if (relacionExistente) {
      return NextResponse.json({ error: "El material ya está agregado a este producto" }, { status: 400 })
    }

    // Crear la relación
    const nuevaRelacion = {
      _id: `${resolvedParams.id}_${material_id}`,
      producto_id: resolvedParams.id,
      material_id: material_id,
      formula: formula.trim(),
      es_dependiente: body.es_dependiente || false,
      material_dependencia: body.material_dependencia || null,
      multiplicador: body.multiplicador || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("💾 Creando relación:", nuevaRelacion)

    const result = await db.collection("producto_materiales").insertOne(nuevaRelacion)

    if (!result.insertedId) {
      throw new Error("No se pudo crear la relación")
    }

    console.log("✅ Material agregado exitosamente")

    return NextResponse.json({
      success: true,
      message: "Material agregado al producto exitosamente",
      relacion: nuevaRelacion,
    })
  } catch (error) {
    console.error("❌ Error agregando material al producto:", error)
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    console.log("🗑️ DELETE material del producto:", resolvedParams.id)

    const { db } = await connectToDatabase()
    const body = await request.json()
    const { material_id } = body

    console.log("📝 Datos recibidos:", { material_id })

    // Validar datos
    if (!material_id) {
      return NextResponse.json({ error: "material_id es requerido" }, { status: 400 })
    }

    // Verificar que el producto existe
    const producto = await db.collection("productos").findOne({ _id: resolvedParams.id })

    if (!producto) {
      console.log("❌ Producto no encontrado:", resolvedParams.id)
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    console.log("✅ Producto encontrado:", producto.nombre)

    // Eliminar la relación
    const result = await db.collection("producto_materiales").deleteOne({
      producto_id: resolvedParams.id,
      material_id: material_id,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Relación no encontrada" }, { status: 404 })
    }

    console.log("✅ Material eliminado del producto exitosamente")

    return NextResponse.json({
      success: true,
      message: "Material eliminado del producto exitosamente",
    })
  } catch (error) {
    console.error("❌ Error eliminando material del producto:", error)
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    console.log("✏️ PUT actualizar fórmula del material en producto:", resolvedParams.id)

    const { db } = await connectToDatabase()
    const body = await request.json()
    const { material_id, formula } = body

    console.log("📝 Datos recibidos:", { material_id, formula })

    // Validar datos
    if (!material_id) {
      return NextResponse.json({ error: "material_id es requerido" }, { status: 400 })
    }

    if (!formula) {
      return NextResponse.json({ error: "formula es requerida" }, { status: 400 })
    }

    // Verificar que el producto existe
    const producto = await db.collection("productos").findOne({ _id: resolvedParams.id })

    if (!producto) {
      console.log("❌ Producto no encontrado:", resolvedParams.id)
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    console.log("✅ Producto encontrado:", producto.nombre)

    // Actualizar la fórmula
    const result = await db.collection("producto_materiales").updateOne(
      {
        producto_id: resolvedParams.id,
        material_id: material_id,
      },
      {
        $set: {
          formula: formula.trim(),
          es_dependiente: body.es_dependiente || false,
          material_dependencia: body.material_dependencia || null,
          multiplicador: body.multiplicador || null,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Relación no encontrada" }, { status: 404 })
    }

    console.log("✅ Fórmula actualizada exitosamente")

    return NextResponse.json({
      success: true,
      message: "Fórmula actualizada exitosamente",
    })
  } catch (error) {
    console.error("❌ Error actualizando fórmula:", error)
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 })
  }
}
