import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Material from "@/lib/models/Material"
import Proveedor from "@/lib/models/Proveedor"

export async function GET() {
  try {
    await dbConnect()

    const [total, conVariantes, sinStock, totalProveedores] = await Promise.all([
      Material.countDocuments({ isActive: true }),
      Material.countDocuments({ isActive: true, tieneVariantes: true }),
      Material.countDocuments({ isActive: true, stock: 0 }),
      Proveedor.countDocuments({ isActive: true }),
    ])

    return NextResponse.json({
      total,
      conVariantes,
      sinStock,
      proveedores: totalProveedores,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
