import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

interface Params {
  params: { id: string }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params
    const { db } = await connectToDatabase()

    const cliente = await db.collection("clientes").findOne({ _id: id })

    if (!cliente) return NextResponse.json({ message: "Cliente not found" }, { status: 404 })

    return NextResponse.json(cliente)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 500,
        },
      )
    }
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = params
    const { nombre, direccion, telefono, email } = await request.json()
    const { db } = await connectToDatabase()

    const updatedCliente = await db.collection("clientes").findOneAndUpdate(
      { _id: id },
      {
        $set: {
          nombre,
          direccion,
          telefono,
          email,
          updated_at: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (!updatedCliente.value) {
      return NextResponse.json({ message: "Cliente not found" }, { status: 404 })
    }

    return NextResponse.json(updatedCliente.value)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 500,
        },
      )
    }
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params
    const { db } = await connectToDatabase()

    const result = await db.collection("clientes").deleteOne({ _id: id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Cliente not found" }, { status: 404 })
    }

    return new NextResponse(null, {
      status: 204,
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 500,
        },
      )
    }
  }
}
