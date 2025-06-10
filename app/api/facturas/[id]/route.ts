import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = await params.id
  return NextResponse.json({ id })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = await params.id
    const body = await request.json()

    // Here you would typically update the factura with the given ID
    // using the data from the request body.
    // For example, if you had a database connection:
    // await db.facturas.update({ where: { id }, data: body });

    return NextResponse.json({ message: `Factura ${id} updated successfully`, body })
  } catch (error) {
    console.error("Error updating factura:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = await params.id

    // Here you would typically delete the factura with the given ID.
    // For example, if you had a database connection:
    // await db.facturas.delete({ where: { id } });

    return NextResponse.json({ message: `Factura ${id} deleted successfully` })
  } catch (error) {
    console.error("Error deleting factura:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
