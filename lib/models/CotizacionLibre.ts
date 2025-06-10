import mongoose, { type Document, Schema } from "mongoose"

export interface ICotizacionLibre extends Document {
  cliente_id?: mongoose.Types.ObjectId
  vendedor_id: mongoose.Types.ObjectId
  descripcion: string
  cantidad: number
  precio_unitario: number
  precio_total: number
  observaciones?: string
  estado: "borrador" | "enviada" | "aprobada" | "rechazada"
  createdAt: Date
  updatedAt: Date
}

const CotizacionLibreSchema = new Schema<ICotizacionLibre>(
  {
    cliente_id: { type: Schema.Types.ObjectId, ref: "Cliente" },
    vendedor_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    descripcion: { type: String, required: true },
    cantidad: { type: Number, required: true, min: 1 },
    precio_unitario: { type: Number, required: true, min: 0 },
    precio_total: { type: Number, required: true, min: 0 },
    observaciones: { type: String },
    estado: {
      type: String,
      enum: ["borrador", "enviada", "aprobada", "rechazada"],
      default: "borrador",
    },
  },
  { timestamps: true },
)

export default mongoose.models.CotizacionLibre ||
  mongoose.model<ICotizacionLibre>("CotizacionLibre", CotizacionLibreSchema)
