import mongoose, { type Document, Schema } from "mongoose"

export interface IMaterialColorVariant extends Document {
  material_id: mongoose.Types.ObjectId
  color_pvc_id?: mongoose.Types.ObjectId
  color_aluminio_id?: mongoose.Types.ObjectId
  tipo_vidrio_id?: mongoose.Types.ObjectId
  id_otro_tipo_variante?: mongoose.Types.ObjectId
  costo: number
  descuento: number
  createdAt: Date
  updatedAt: Date
}

const MaterialColorVariantSchema = new Schema<IMaterialColorVariant>(
  {
    material_id: { type: Schema.Types.ObjectId, ref: "Material", required: true },
    color_pvc_id: { type: Schema.Types.ObjectId, ref: "ColorPVC" },
    color_aluminio_id: { type: Schema.Types.ObjectId, ref: "ColorAluminio" },
    tipo_vidrio_id: { type: Schema.Types.ObjectId, ref: "TipoVidrio" },
    id_otro_tipo_variante: { type: Schema.Types.ObjectId, ref: "OtroTipoVariante" },
    costo: { type: Number, required: true, min: 0 },
    descuento: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true },
)

export default mongoose.models.MaterialColorVariant ||
  mongoose.model<IMaterialColorVariant>("MaterialColorVariant", MaterialColorVariantSchema)
