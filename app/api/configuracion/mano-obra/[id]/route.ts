import { NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params {
  params: { id: string }
}

export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = params

    const manoObra = await db.manoObra.findUnique({
      where: {
        id,
      },
    })

    if (!manoObra) {
      return new NextResponse("Mano de Obra no encontrada", { status: 404 })
    }

    return NextResponse.json(manoObra)
  } catch (error) {
    console.log("[MANO_OBRA_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = params
    const body = await req.json()

    const { nombre, valorHora } = body

    if (!nombre) {
      return new NextResponse("Nombre es requerido", { status: 400 })
    }

    if (!valorHora) {
      return new NextResponse("Valor por hora es requerido", { status: 400 })
    }

    const manoObra = await db.manoObra.update({
      where: {
        id,
      },
      data: {
        nombre,
        valorHora,
      },
    })

    return NextResponse.json(manoObra)
  } catch (error) {
    console.log("[MANO_OBRA_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = params

    const manoObra = await db.manoObra.delete({
      where: {
        id,
      },
    })

    return NextResponse.json(manoObra)
  } catch (error) {
    console.log("[MANO_OBRA_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
