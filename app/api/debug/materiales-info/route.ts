import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Obtener un material de ejemplo
    const materialEjemplo = await db.collection("materiales").findOne({ nombre: { $regex: /Perfil/i } })

    // Contar variantes directamente desde el material
    let variantes = 0
    let variantesAlt = 0

    if (materialEjemplo && materialEjemplo.proveedores && Array.isArray(materialEjemplo.proveedores)) {
      // Contar variantes desde los proveedores
      for (const proveedor of materialEjemplo.proveedores) {
        if (proveedor.variantes_precios && Array.isArray(proveedor.variantes_precios)) {
          variantes += proveedor.variantes_precios.length
        }
      }

      // Actualizar el total de proveedores
      materialEjemplo.total_proveedores = materialEjemplo.proveedores.length
    }

    // Obtener lista de colecciones
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    // Buscar variantes en la colección material_variantes
    try {
      if (collectionNames.includes("material_variantes")) {
        const variantesCollection = await db
          .collection("material_variantes")
          .find({
            material_id: materialEjemplo?._id,
          })
          .toArray()
        variantesAlt = variantesCollection.length
      }
    } catch (e) {
      console.error("Error buscando variantes:", e)
    }

    // Obtener información de proveedores
    const proveedoresInfo = []
    if (materialEjemplo && materialEjemplo.proveedores) {
      for (const prov of materialEjemplo.proveedores) {
        if (prov.proveedor_id) {
          try {
            const proveedorData = await db.collection("proveedores").findOne({ _id: prov.proveedor_id })
            proveedoresInfo.push({
              id: prov.proveedor_id,
              nombre_en_material: prov.proveedor_nombre,
              nombre_en_db: proveedorData?.nombre || "No encontrado",
              variantes: prov.variantes_precios?.length || 0,
            })
          } catch (e) {
            proveedoresInfo.push({
              id: prov.proveedor_id,
              nombre_en_material: prov.proveedor_nombre,
              nombre_en_db: "Error al buscar",
              error: e.message,
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      debug: {
        materialEjemplo,
        variantes,
        variantesAlt,
        collections: collectionNames,
        proveedoresInfo,
      },
    })
  } catch (error) {
    console.error("Error en debug:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
