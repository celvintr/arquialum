import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const modelos = await prisma.modelo.findMany({
      where: {
        tipoProductoId: id,
      },
    })

    return NextResponse.json(modelos)
  } catch (error) {
    console.error("Error fetching modelos:", error)
    return NextResponse.json({ error: "Failed to fetch modelos" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { nombre } = await request.json()

    const newModelo = await prisma.modelo.create({
      data: {
        nombre,
        tipoProductoId: id,
      },
    })

    return NextResponse.json(newModelo, { status: 201 })
  } catch (error) {
    console.error("Error creating modelo:", error)
    return NextResponse.json({ error: "Failed to create modelo" }, { status: 500 })
  }
}
