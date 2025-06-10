import mongoose, { type Document, Schema } from "mongoose"

export interface ICotizacionItem extends Document {
  cotizacion_id: mongoose.Types.ObjectId
  grupo_id: string
  orden: number
  tipo_item: string // "producto", "material_libre", "reparacion", "vidrio_templado"

  // Para productos
  producto_id?: mongoose.Types.ObjectId
  dimensiones?: {
    ancho: number
    alto: number
    divisionHorizontal: number
    divisionVertical: number
    decoradoHorizontal: number
    decoradoVertical: number
  }

  // Selecciones del usuario
  proveedor_seleccionado_id?: mongoose.Types.ObjectId
  variantes_seleccionadas?: {
    color_pvc?: string
    color_aluminio?: string
    tipo_vidrio?: string
    acabado?: string
  }

  // Para items libres
  descripcion?: string

  // Cálculos
  cantidad: number
  precio_unitario: number
  precio_total: number
  materiales_calculados?: any[]

  // Metadatos
  observaciones?: string
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

const CotizacionItemSchema = new Schema<ICotizacionItem>(
  {
    cotizacion_id: { type: Schema.Types.ObjectId, ref: "Cotizacion", required: true },
    grupo_id: { type: String, required: true },
    orden: { type: Number, default: 0 },
    tipo_item: {
      type: String,
      required: true,
      enum: ["producto", "material_libre", "reparacion", "vidrio_templado"],
    },

    // Producto
    producto_id: { type: Schema.Types.ObjectId, ref: "Producto" },
    dimensiones: {
      ancho: { type: Number },
      alto: { type: Number },
      divisionHorizontal: { type: Number, default: 0 },
      divisionVertical: { type: Number, default: 0 },
      decoradoHorizontal: { type: Number, default: 0 },
      decoradoVertical: { type: Number, default: 0 },
    },

    // Selecciones
    proveedor_seleccionado_id: { type: Schema.Types.ObjectId, ref: "Proveedor" },
    variantes_seleccionadas: {
      color_pvc: { type: String },
      color_aluminio: { type: String },
      tipo_vidrio: { type: String },
      acabado: { type: String },
    },

    // Item libre
    descripcion: { type: String },

    // Cálculos
    cantidad: { type: Number, required: true, min: 1 },
    precio_unitario: { type: Number, required: true, min: 0 },
    precio_total: { type: Number, required: true, min: 0 },
    materiales_calculados: [{ type: Schema.Types.Mixed }],

    observaciones: { type: String },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.models.CotizacionItem || mongoose.model<ICotizacionItem>("CotizacionItem", CotizacionItemSchema)
