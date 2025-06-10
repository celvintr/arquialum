import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🔍 GET Material - ID:", params.id)

    const { db } = await connectToDatabase()
    const materialId = params.id

    // Buscar material por ID (string directo, no ObjectId)
    const material = await db.collection("materiales").findOne({ _id: materialId })

    if (!material) {
      console.log("❌ Material no encontrado:", materialId)
      return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
    }

    console.log("✅ Material encontrado:", material.nombre)

    return NextResponse.json({
      success: true,
      material,
    })
  } catch (error) {
    console.error("❌ Error obteniendo material:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🔄 PUT Material - ID:", params.id)

    const { db } = await connectToDatabase()
    const materialId = params.id
    const body = await request.json()

    console.log("📝 Datos recibidos para actualizar:", JSON.stringify(body, null, 2))

    // Validar datos requeridos
    if (!body.nombre || !body.categoria) {
      console.log("❌ Faltan datos requeridos")
      return NextResponse.json({ error: "Nombre y categoría son requeridos" }, { status: 400 })
    }

    // Procesar proveedores con validación estricta
    const proveedoresProcesados = []
    if (body.proveedores && Array.isArray(body.proveedores)) {
      console.log("👥 Procesando proveedores:", body.proveedores.length)

      for (let i = 0; i < body.proveedores.length; i++) {
        const proveedor = body.proveedores[i]
        console.log(`🔍 Procesando proveedor ${i + 1}:`, {
          id: proveedor.proveedor_id,
          nombre: proveedor.proveedor_nombre,
          precio: proveedor.precio_unitario,
          descuento: proveedor.descuento,
          impuesto: proveedor.impuesto,
          tipo: typeof proveedor.impuesto,
        })

        // Si no tiene nombre, intentar obtenerlo de la colección proveedores
        let nombreProveedor = proveedor.proveedor_nombre
        if (!nombreProveedor && proveedor.proveedor_id) {
          try {
            const proveedorDoc = await db.collection("proveedores").findOne({ _id: proveedor.proveedor_id })
            if (proveedorDoc) {
              nombreProveedor = proveedorDoc.nombre
              console.log(`✅ Nombre de proveedor resuelto: ${proveedorDoc.nombre}`)
            }
          } catch (err) {
            console.error(`❌ Error resolviendo nombre de proveedor ${proveedor.proveedor_id}:`, err)
          }
        }

        // Procesar campos numéricos con validación estricta
        const precioUnitario = Number.parseFloat(proveedor.precio_unitario) || 0
        const descuento = Number.parseFloat(proveedor.descuento) || 0
        const impuesto = Number.parseFloat(proveedor.impuesto)

        // Validar que el impuesto sea un número válido
        const impuestoFinal = !isNaN(impuesto) && impuesto >= 0 ? impuesto : 16

        console.log(`🔢 Valores numéricos procesados para proveedor ${i + 1}:`, {
          precio_original: proveedor.precio_unitario,
          precio_procesado: precioUnitario,
          descuento_original: proveedor.descuento,
          descuento_procesado: descuento,
          impuesto_original: proveedor.impuesto,
          impuesto_procesado: impuestoFinal,
        })

        const proveedorProcesado = {
          proveedor_id: proveedor.proveedor_id,
          proveedor_nombre: nombreProveedor || "Proveedor sin nombre",
          precio_unitario: precioUnitario,
          descuento: descuento,
          impuesto: impuestoFinal,
          es_principal: Boolean(proveedor.es_principal),
          tipo_variante: proveedor.tipo_variante || "",
          variantes_precios: Array.isArray(proveedor.variantes_precios) ? proveedor.variantes_precios : [],
        }

        proveedoresProcesados.push(proveedorProcesado)

        console.log(`✅ Proveedor ${i + 1} procesado:`, proveedorProcesado)
      }
    }

    // Preparar datos de actualización
    const updateData = {
      nombre: body.nombre,
      nombres_secundarios: Array.isArray(body.nombres_secundarios) ? body.nombres_secundarios : [],
      descripcion: body.descripcion || "",
      categoria: body.categoria,
      unidad_medida: body.unidad_medida,
      unidad_medida_produccion: body.unidad_medida_produccion || body.unidad_medida,
      area_longitud: Number.parseFloat(body.area_longitud) || 1,
      formula_calculo: body.formula_calculo || "ancho * alto",
      contribuye_a_malla: Boolean(body.contribuye_a_malla),
      tiene_variantes: Boolean(body.tiene_variantes),
      activo: body.activo !== false, // Por defecto true
      proveedores: proveedoresProcesados,
      updated_at: new Date(),
    }

    console.log("💾 Datos finales para actualizar:", JSON.stringify(updateData, null, 2))

    // Validar área/longitud
    if (updateData.area_longitud <= 0) {
      console.log("❌ Área/longitud inválida")
      return NextResponse.json({ error: "El área/longitud debe ser mayor a 0" }, { status: 400 })
    }

    // Validar que haya al menos un proveedor
    if (proveedoresProcesados.length === 0) {
      console.log("❌ No hay proveedores válidos")
      return NextResponse.json({ error: "Debe haber al menos un proveedor" }, { status: 400 })
    }

    // Actualizar el material
    console.log("🔄 Ejecutando actualización en MongoDB...")
    const result = await db.collection("materiales").updateOne({ _id: materialId }, { $set: updateData })

    console.log("📊 Resultado de la actualización:", {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      acknowledged: result.acknowledged,
    })

    if (result.matchedCount === 0) {
      console.log("❌ Material no encontrado para actualizar:", materialId)
      return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
    }

    if (result.modifiedCount === 0) {
      console.log("⚠️ No se modificaron documentos (posiblemente los datos son iguales)")
    }

    console.log("✅ Material actualizado exitosamente")

    // Obtener el material actualizado para verificar
    const materialActualizado = await db.collection("materiales").findOne({ _id: materialId })

    if (materialActualizado) {
      console.log("🔍 Material después de actualizar:")
      console.log("- Nombre:", materialActualizado.nombre)
      console.log("- Proveedores:", materialActualizado.proveedores?.length || 0)

      if (materialActualizado.proveedores) {
        materialActualizado.proveedores.forEach((prov: any, index: number) => {
          console.log(`  Proveedor ${index + 1}:`, {
            nombre: prov.proveedor_nombre,
            impuesto: prov.impuesto,
            tipo_impuesto: typeof prov.impuesto,
          })
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Material actualizado correctamente",
      material: materialActualizado,
      debug: {
        proveedores_procesados: proveedoresProcesados.length,
        modificaciones: result.modifiedCount,
      },
    })
  } catch (error) {
    console.error("❌ Error actualizando material:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🗑️ DELETE Material - ID:", params.id)

    const { db } = await connectToDatabase()
    const materialId = params.id

    // Verificar si el material está en uso en productos
    const enUso = await db.collection("productos").findOne({
      "materiales.material_id": materialId,
    })

    if (enUso) {
      console.log("❌ Material en uso, no se puede eliminar")
      return NextResponse.json(
        {
          error: "No se puede eliminar",
          message: "Este material está siendo usado en productos",
        },
        { status: 400 },
      )
    }

    const result = await db.collection("materiales").deleteOne({ _id: materialId })

    if (result.deletedCount === 0) {
      console.log("❌ Material no encontrado para eliminar")
      return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
    }

    console.log("✅ Material eliminado exitosamente")
    return NextResponse.json({
      success: true,
      message: "Material eliminado correctamente",
    })
  } catch (error) {
    console.error("❌ Error eliminando material:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
