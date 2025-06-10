import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await dbConnect()

    // Simulamos datos para el ejemplo
    const stats = {
      cotizaciones: 24,
      productos: 45,
      materiales: 120,
      ventasMes: 45000,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Error fetching dashboard stats" }, { status: 500 })
  }
}
