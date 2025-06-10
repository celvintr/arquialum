import mongoose, { type Document, Schema } from "mongoose"

export interface IMaterialBase extends Document {
  nombre: string
  descripcion: string
  categoria: string // "Perfil PVC", "Perfil Aluminio", "Vidrio", "Herraje", etc.
  tipo_material: string // "PVC", "Aluminio", "Vidrio", "Herraje"
  unidad_medida: string
  unidad_medida_produccion: string
  contribuye_a_malla: boolean
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

const MaterialBaseSchema = new Schema<IMaterialBase>(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true },
    categoria: { type: String, required: true },
    tipo_material: {
      type: String,
      required: true,
      enum: ["PVC", "Aluminio", "Vidrio", "Herraje", "Sellador", "Accesorio"],
    },
    unidad_medida: { type: String, required: true },
    unidad_medida_produccion: { type: String, required: true },
    contribuye_a_malla: { type: Boolean, default: false },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.models.MaterialBase || mongoose.model<IMaterialBase>("MaterialBase", MaterialBaseSchema)
