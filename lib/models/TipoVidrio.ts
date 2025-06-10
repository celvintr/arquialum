import mongoose from "mongoose"

const TipoVidrioSchema = new mongoose.Schema(
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
    espesor: {
      type: String,
      trim: true,
    },
    costo: {
      type: Number,
      default: 0,
      min: 0,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "tipos_vidrio", // Nombre fijo de colección
  },
)

export default mongoose.models.TipoVidrio || mongoose.model("TipoVidrio", TipoVidrioSchema)
