export interface ParametroManoObra {
  _id?: string
  nombre: string
  descripcion: string
  tipo: "fabricacion" | "instalacion" | "malla"

  // Configuración por tipo de producto
  configuraciones_tipo: {
    pvc: {
      activo: boolean
      tarifa_por_m2: number
    }
    aluminio: {
      activo: boolean
      tarifa_por_m2: number
    }
  }

  // Para malla
  configuracion_malla?: {
    materiales_que_contribuyen: string[]
    incluye_mano_obra: boolean
    tarifa_mano_obra_m2: number
  }

  // Estado general
  activo: boolean
  creado_en: Date
  actualizado_en: Date
}
