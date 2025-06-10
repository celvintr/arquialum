import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = await params.id
  return NextResponse.json({ id })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = await params.id
  const body = await request.json()
  return NextResponse.json({ id, body })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = await params.id
  return NextResponse.json({ id })
}
