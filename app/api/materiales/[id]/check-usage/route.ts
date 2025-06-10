import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const materialId = params.id

    // Verificar si el material está siendo usado en productos
    const productosConMaterial = await db
      .collection("productos")
      .find({
        "materiales.material_id": materialId,
      })
      .toArray()

    // Verificar si el material está siendo usado en cotizaciones
    const cotizacionesConMaterial = await db
      .collection("cotizaciones")
      .find({
        $or: [{ "materiales.material_id": materialId }, { "productos.materiales.material_id": materialId }],
      })
      .toArray()

    const enUso = productosConMaterial.length > 0 || cotizacionesConMaterial.length > 0

    return NextResponse.json({
      success: true,
      enUso,
      detalles: {
        productos: productosConMaterial.length,
        cotizaciones: cotizacionesConMaterial.length,
        productosAfectados: productosConMaterial.map((p) => ({
          id: p._id,
          nombre: p.nombre,
        })),
      },
    })
  } catch (error) {
    console.error("Error verificando uso del material:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
