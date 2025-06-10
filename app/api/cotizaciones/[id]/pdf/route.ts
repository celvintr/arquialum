import { type NextRequest, NextResponse } from "next/server"
import { getCotizacion } from "@/app/actions/cotizaciones"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    const cotizacion = await getCotizacion(id)

    if (!cotizacion) {
      return new NextResponse("Cotización no encontrada", { status: 404 })
    }

    const doc = new jsPDF()

    doc.text(`Cotización #${cotizacion.numero}`, 10, 10)
    doc.text(`Cliente: ${cotizacion.cliente.nombre}`, 10, 20)

    autoTable(doc, {
      head: [["Producto", "Cantidad", "Precio Unitario", "Total"]],
      body: cotizacion.items.map((item) => [
        item.producto.nombre,
        item.cantidad,
        item.precioUnitario,
        item.cantidad * item.precioUnitario,
      ]),
    })

    const pdfBytes = doc.output("arraybuffer")

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cotizacion_${cotizacion.numero}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error al generar el PDF:", error)
    return new NextResponse("Error al generar el PDF", { status: 500 })
  }
}
