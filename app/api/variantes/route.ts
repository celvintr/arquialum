import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import ColorPVC from "@/lib/models/ColorPVC"
import ColorAluminio from "@/lib/models/ColorAluminio"
import TipoVidrio from "@/lib/models/TipoVidrio"

export async function GET() {
  try {
    console.log("🔍 API Variantes - GET iniciado")
    await dbConnect()

    const [coloresPVC, coloresAluminio, tiposVidrio] = await Promise.all([
      ColorPVC.find({ activo: true }).select("nombre descripcion costo").sort({ nombre: 1 }),
      ColorAluminio.find({ activo: true }).select("nombre descripcion costo").sort({ nombre: 1 }),
      TipoVidrio.find({ activo: true }).select("nombre descripcion espesor costo").sort({ nombre: 1 }),
    ])

    console.log(`✅ Variantes encontradas: PVC(${coloresPVC.length}), Aluminio(${coloresAluminio.length}), Vidrio(${tiposVidrio.length})`)

    return NextResponse.json({
      success: true,
      coloresPVC: coloresPVC.map((color) => ({
        _id: color._id.toString(),
        nombre: color.nombre,
        descripcion: color.descripcion,
        costo: color.costo,
      })),
      coloresAluminio: coloresAluminio.map((color) => ({
        _id: color._id.toString(),
        nombre: color.nombre,
        descripcion: color.descripcion,
        costo: color.costo,
      })),
      tiposVidrio: tiposVidrio.map((tipo) => ({
        _id: tipo._id.toString(),
        nombre: tipo.nombre,
        descripcion: tipo.descripcion,
        espesor: tipo.espesor,
        costo: tipo.costo,
      })),
    })
  } catch (error) {
    console.error("❌ Error obteniendo variantes:", error)
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
