import { type NextRequest, NextResponse } from "next/server"
import puppeteer from "puppeteer"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return new NextResponse("Missing order ID", { status: 400 })
    }

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
    const page = await browser.newPage()

    // Construct the URL for the production order details page
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/ordenes-trabajo/${id}/produccion`

    await page.goto(url, { waitUntil: "networkidle0" })

    // Generate the PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    })

    await browser.close()

    // Set the response headers
    const headers = new Headers({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="orden_produccion_${id}.pdf"`,
    })

    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers,
    })
  } catch (error: any) {
    console.error("Error generating PDF:", error)
    return new NextResponse(`Error generating PDF: ${error.message}`, { status: 500 })
  }
}
