import { type NextRequest, NextResponse } from "next/server"
import { getFacturaById } from "@/lib/facturas"
import { generateInvoicePdf } from "@/lib/pdf-generator"

export async function GET(request: NextRequest, { params }: { id: { id: string } }) {
  try {
    const id = await params.id
    const factura = await getFacturaById(id)

    if (!factura) {
      return new NextResponse(JSON.stringify({ message: "Factura not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    const pdfBuffer = await generateInvoicePdf(factura)

    if (!pdfBuffer) {
      return new NextResponse(JSON.stringify({ message: "Failed to generate PDF" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    const headers = new Headers()
    headers.append("Content-Type", "application/pdf")
    headers.append("Content-Disposition", `inline; filename="factura-${factura.numero}.pdf"`)

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: headers,
    })
  } catch (error) {
    console.error("Error generating or serving PDF:", error)
    return new NextResponse(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
