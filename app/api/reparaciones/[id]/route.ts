import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface Params {
  id: string
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params

    const reparacion = await prisma.reparacion.findUnique({
      where: {
        id: id,
      },
    })

    if (!reparacion) {
      return new NextResponse(JSON.stringify({ message: "Reparacion not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new NextResponse(JSON.stringify(reparacion), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error(error)
    return new NextResponse(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params
    const json = await request.json()

    const updatedReparacion = await prisma.reparacion.update({
      where: {
        id: id,
      },
      data: json,
    })

    return new NextResponse(JSON.stringify(updatedReparacion), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error(error)
    return new NextResponse(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params

    await prisma.reparacion.delete({
      where: {
        id: id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return new NextResponse(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
