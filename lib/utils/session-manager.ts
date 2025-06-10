import { saveUploadedFile, deleteFile, generateFileName } from "./file-upload"

export class SessionManager {
  private static readonly SESSION_KEY = "cotizacion_session"
  private static readonly IMAGES_KEY = "cotizacion_images"

  static async guardarSesion(data: any) {
    try {
      console.log("💾 Iniciando guardado de sesión...")

      // Procesar grupos para guardar imágenes físicamente
      const gruposConImagenes = data.grupos || []
      const gruposProcesados = await Promise.all(
        gruposConImagenes.map(async (grupo: any) => {
          // Si ya tiene imagenUrl válida (no blob) y no tiene imagen nueva, mantener la URL
          if (grupo.imagenUrl && !grupo.imagenUrl.startsWith("blob:") && !grupo.imagen) {
            return {
              ...grupo,
              imagen: null, // No guardar el objeto File
            }
          }

          // Si tiene imagen nueva (File), guardarla físicamente
          if (grupo.imagen instanceof File) {
            try {
              const fileName = generateFileName(grupo.imagen.name, `grupo_${grupo.id}_`)
              const savedPath = await saveUploadedFile(grupo.imagen, "grupos", fileName)

              console.log(`📷 Imagen de grupo guardada: ${savedPath}`)

              return {
                ...grupo,
                imagen: null, // No guardar el objeto File
                imagenUrl: savedPath, // Usar la ruta guardada
                imagenGuardada: true, // Marcar como guardada físicamente
              }
            } catch (error) {
              console.error(`❌ Error guardando imagen del grupo ${grupo.id}:`, error)
              return {
                ...grupo,
                imagen: null,
                imagenUrl: null, // Limpiar blob URL si falla
              }
            }
          }

          // Si tiene blob URL, limpiarla
          if (grupo.imagenUrl && grupo.imagenUrl.startsWith("blob:")) {
            return {
              ...grupo,
              imagen: null,
              imagenUrl: null, // Limpiar blob URL
            }
          }

          return {
            ...grupo,
            imagen: null, // No guardar el objeto File
          }
        }),
      )

      // Crear objeto de sesión
      const sessionData = {
        ...data,
        id: `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
        grupos: gruposProcesados,
      }

      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData))

      console.log("✅ Sesión guardada:", sessionData.timestamp)
      return sessionData
    } catch (error) {
      console.error("❌ Error guardando sesión:", error)
      throw error
    }
  }

  static cargarSesion() {
    try {
      const sessionStr = localStorage.getItem(this.SESSION_KEY)
      if (!sessionStr) return null

      const session = JSON.parse(sessionStr)

      // Verificar que las imágenes guardadas físicamente aún existan
      if (session.grupos && session.grupos.length > 0) {
        session.grupos = session.grupos.map((grupo: any) => {
          return {
            ...grupo,
            imagen: null, // Nunca cargar objetos File
            // Limpiar blob URLs si existen
            imagenUrl: grupo.imagenUrl && grupo.imagenUrl.startsWith("blob:") ? null : grupo.imagenUrl,
          }
        })
      }

      console.log("📂 Sesión cargada exitosamente")
      return session
    } catch (error) {
      console.error("❌ Error cargando sesión:", error)
      return null
    }
  }

  static async limpiarSesion() {
    try {
      // Obtener sesión actual para limpiar imágenes físicas
      const session = this.cargarSesion()

      if (session?.grupos) {
        // Eliminar imágenes físicas de grupos
        for (const grupo of session.grupos) {
          if (grupo.imagenUrl && grupo.imagenGuardada && grupo.imagenUrl.startsWith("/uploads/")) {
            try {
              await deleteFile(grupo.imagenUrl)
              console.log(`🗑️ Imagen de grupo eliminada: ${grupo.imagenUrl}`)
            } catch (error) {
              console.warn(`⚠️ No se pudo eliminar imagen: ${grupo.imagenUrl}`, error)
            }
          }
        }
      }

      localStorage.removeItem(this.SESSION_KEY)
      localStorage.removeItem(this.IMAGES_KEY)
      console.log("🧹 Sesión limpiada completamente")
    } catch (error) {
      console.error("❌ Error limpiando sesión:", error)
    }
  }

  static getInfoSesion() {
    try {
      const sessionStr = localStorage.getItem(this.SESSION_KEY)
      if (!sessionStr) return null

      const session = JSON.parse(sessionStr)
      return {
        timestamp: session.timestamp,
        itemsCount: session.items?.length || 0,
        gruposCount: session.grupos?.length || 0,
        cliente: session.cliente?.nombre || null,
        imagenesGuardadas: session.grupos?.filter((g: any) => g.imagenGuardada).length || 0,
      }
    } catch (error) {
      return null
    }
  }

  static validarImagen(file: File): { valida: boolean; error?: string } {
    // Validar tipo
    if (!file.type.startsWith("image/")) {
      return { valida: false, error: "Solo se permiten archivos de imagen" }
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { valida: false, error: "La imagen no debe superar los 5MB" }
    }

    return { valida: true }
  }

  static async convertirImagenABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}
