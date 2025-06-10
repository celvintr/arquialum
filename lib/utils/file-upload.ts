// Versión cliente - sin dependencias de Node.js
export async function saveUploadedFile(file: File, directory: string, filename: string): Promise<string> {
  try {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("directory", directory)
    formData.append("filename", filename)

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Error al guardar el archivo")
    }

    const result = await response.json()
    return result.path
  } catch (error) {
    console.error("❌ Error guardando archivo:", error)
    throw new Error("Error al guardar el archivo")
  }
}

export function generateFileName(originalName: string, prefix = ""): string {
  const timestamp = Date.now()
  const extension = originalName.split(".").pop() || "jpg"
  const cleanName = originalName
    .replace(/\.[^/.]+$/, "") // Remover extensión
    .replace(/[^a-zA-Z0-9]/g, "-") // Reemplazar caracteres especiales
    .toLowerCase()
    .substring(0, 20) // Limitar longitud

  return `${timestamp}-${prefix}${cleanName}.${extension}`
}

export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/uploads?path=${encodeURIComponent(filePath)}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Error eliminando archivo:", error)
      return false
    }

    const result = await response.json()
    return result.success
  } catch (error) {
    console.error("❌ Error eliminando archivo:", error)
    return false
  }
}
