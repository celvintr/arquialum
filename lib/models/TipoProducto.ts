import mongoose from "mongoose"

const TipoProductoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    categoria: {
      type: String,
      enum: ["Ventanas", "Puertas", "Barandales", "Divisiones", "Otros"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "tipos_producto", // Nombre fijo de colección
  },
)

export default mongoose.models.TipoProducto || mongoose.model("TipoProducto", TipoProductoSchema)
