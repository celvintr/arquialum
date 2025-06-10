import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"

// Esta función se ejecuta en el servidor
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const directory = formData.get("directory") as string
    const filename = formData.get("filename") as string

    if (!file || !directory || !filename) {
      return NextResponse.json({ error: "Faltan parámetros requeridos (file, directory, filename)" }, { status: 400 })
    }

    // Crear el directorio si no existe
    const uploadDir = join(process.cwd(), "public", "uploads", directory)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Crear la ruta completa del archivo
    const filePath = join(uploadDir, filename)

    // Guardar el archivo
    await writeFile(filePath, buffer)

    // Retornar la ruta pública
    const publicPath = `/uploads/${directory}/${filename}`

    console.log(`✅ Archivo guardado en: ${publicPath}`)

    return NextResponse.json({
      success: true,
      path: publicPath,
      message: "Archivo guardado exitosamente",
    })
  } catch (error) {
    console.error("❌ Error guardando archivo:", error)
    return NextResponse.json({ error: "Error al guardar el archivo", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")

    if (!path) {
      return NextResponse.json({ error: "Falta el parámetro path" }, { status: 400 })
    }

    // Eliminar el prefijo /uploads/ si existe
    const relativePath = path.startsWith("/uploads/") ? path.substring(9) : path

    const fullPath = join(process.cwd(), "public", "uploads", relativePath)

    if (existsSync(fullPath)) {
      const { unlink } = await import("fs/promises")
      await unlink(fullPath)
      console.log(`🗑️ Archivo eliminado: ${fullPath}`)
      return NextResponse.json({
        success: true,
        message: "Archivo eliminado exitosamente",
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: "Archivo no encontrado",
      },
      { status: 404 },
    )
  } catch (error) {
    console.error("❌ Error eliminando archivo:", error)
    return NextResponse.json({ error: "Error al eliminar el archivo", details: error.message }, { status: 500 })
  }
}
