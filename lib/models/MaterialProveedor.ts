import mongoose, { type Document, Schema } from "mongoose"

export interface IMaterialProveedor extends Document {
  material_base_id: mongoose.Types.ObjectId
  proveedor_id: mongoose.Types.ObjectId
  codigo_proveedor: string
  nombre_proveedor: string
  precio_unitario: number
  descuento: number
  precio_final: number
  disponible: boolean
  tiempo_entrega_dias: number
  stock_minimo: number
  observaciones: string
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

const MaterialProveedorSchema = new Schema<IMaterialProveedor>(
  {
    material_base_id: { type: Schema.Types.ObjectId, ref: "MaterialBase", required: true },
    proveedor_id: { type: Schema.Types.ObjectId, ref: "Proveedor", required: true },
    codigo_proveedor: { type: String, required: true, trim: true },
    nombre_proveedor: { type: String, required: true, trim: true },
    precio_unitario: { type: Number, required: true, min: 0 },
    descuento: { type: Number, default: 0, min: 0, max: 100 },
    precio_final: { type: Number, required: true, min: 0 },
    disponible: { type: Boolean, default: true },
    tiempo_entrega_dias: { type: Number, default: 0 },
    stock_minimo: { type: Number, default: 0 },
    observaciones: { type: String, trim: true },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true },
)

// Índice único para evitar duplicados
MaterialProveedorSchema.index({ material_base_id: 1, proveedor_id: 1, codigo_proveedor: 1 }, { unique: true })

export default mongoose.models.MaterialProveedor ||
  mongoose.model<IMaterialProveedor>("MaterialProveedor", MaterialProveedorSchema)
