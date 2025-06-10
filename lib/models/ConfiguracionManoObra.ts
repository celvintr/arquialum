export interface ConfiguracionManoObra {
  _id?: string
  nombre: string
  descripcion: string
  tipo: "fabricacion" | "instalacion" | "malla" | "otros"
  formula: string // Ej: "ancho * alto * tarifa_base"
  tarifa_base: number
  activo: boolean

  // Condiciones para aplicar la configuración
  condiciones: {
    tipos_producto: string[] // IDs de tipos de producto que aplican
    materiales_requeridos: string[] // IDs de materiales que deben estar presentes
    materiales_excluidos: string[] // IDs de materiales que excluyen esta configuración
    contribuye_malla: boolean // Si este material contribuye al costo de malla
  }

  // Forma de aplicación
  aplicacion: {
    por_producto: boolean // Se aplica una vez por producto
    por_material: boolean // Se aplica por cada material específico
    materiales_aplicables: string[] // IDs de materiales a los que se aplica
  }

  // Metadatos
  creado_en: Date
  actualizado_en: Date
  creado_por: string
}

export const ConfiguracionManoObraSchema = {
  nombre: { type: "string", required: true },
  descripcion: { type: "string", required: true },
  tipo: {
    type: "string",
    required: true,
    enum: ["fabricacion", "instalacion", "malla", "otros"],
  },
  formula: { type: "string", required: true },
  tarifa_base: { type: "number", required: true, min: 0 },
  activo: { type: "boolean", default: true },
  condiciones: {
    tipos_producto: { type: "array", items: { type: "string" } },
    materiales_requeridos: { type: "array", items: { type: "string" } },
    materiales_excluidos: { type: "array", items: { type: "string" } },
    contribuye_malla: { type: "boolean", default: false },
  },
  aplicacion: {
    por_producto: { type: "boolean", default: true },
    por_material: { type: "boolean", default: false },
    materiales_aplicables: { type: "array", items: { type: "string" } },
  },
  creado_en: { type: "date", default: "now" },
  actualizado_en: { type: "date", default: "now" },
  creado_por: { type: "string", required: true },
}
