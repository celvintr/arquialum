import mongoose, { type Document, Schema } from "mongoose"

export interface ITipoProductoModelo extends Document {
  nombre: string
  descripcion?: string
  codigo?: string
  tipo_producto_id: mongoose.Types.ObjectId
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const TipoProductoModeloSchema = new Schema<ITipoProductoModelo>(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del modelo es requerido"],
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    codigo: {
      type: String,
      trim: true,
    },
    tipo_producto_id: {
      type: Schema.Types.ObjectId,
      ref: "TipoProducto",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.TipoProductoModelo ||
  mongoose.model<ITipoProductoModelo>("TipoProductoModelo", TipoProductoModeloSchema)
