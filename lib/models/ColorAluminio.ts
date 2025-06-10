import mongoose from "mongoose"

const ColorAluminioSchema = new mongoose.Schema(
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
    collection: "colores_aluminio", // Nombre fijo de colección
  },
)

export default mongoose.models.ColorAluminio || mongoose.model("ColorAluminio", ColorAluminioSchema)
