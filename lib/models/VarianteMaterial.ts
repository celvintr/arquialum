import mongoose, { type Document, Schema } from "mongoose"

export interface IVarianteMaterial extends Document {
  material_base_id: mongoose.Types.ObjectId
  tipo_variante: string // "color_pvc", "color_aluminio", "tipo_vidrio", "acabado"
  nombre: string
  codigo: string
  costo_adicional: number
  porcentaje_adicional: number
  disponible: boolean
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

const VarianteMaterialSchema = new Schema<IVarianteMaterial>(
  {
    material_base_id: { type: Schema.Types.ObjectId, ref: "MaterialBase", required: true },
    tipo_variante: {
      type: String,
      required: true,
      enum: ["color_pvc", "color_aluminio", "tipo_vidrio", "acabado", "espesor"],
    },
    nombre: { type: String, required: true, trim: true },
    codigo: { type: String, required: true, trim: true },
    costo_adicional: { type: Number, default: 0 },
    porcentaje_adicional: { type: Number, default: 0 },
    disponible: { type: Boolean, default: true },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.models.VarianteMaterial ||
  mongoose.model<IVarianteMaterial>("VarianteMaterial", VarianteMaterialSchema)
