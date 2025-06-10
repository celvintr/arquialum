import mongoose, { type Document, Schema } from "mongoose"

export interface IReparacionDefinida extends Document {
  nombre: string
  descripcion: string
  categoria_reparacion_id: mongoose.Types.ObjectId
  precio_base: number
  tiempo_estimado: number
  materiales_incluidos: boolean
  observaciones?: string
  estado: boolean
  createdAt: Date
  updatedAt: Date
}

const ReparacionDefinidaSchema = new Schema<IReparacionDefinida>(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true },
    categoria_reparacion_id: { type: Schema.Types.ObjectId, ref: "CategoriaReparacion", required: true },
    precio_base: { type: Number, required: true, min: 0 },
    tiempo_estimado: { type: Number, required: true, min: 1 }, // en horas
    materiales_incluidos: { type: Boolean, default: false },
    observaciones: { type: String },
    estado: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.models.ReparacionDefinida ||
  mongoose.model<IReparacionDefinida>("ReparacionDefinida", ReparacionDefinidaSchema)
