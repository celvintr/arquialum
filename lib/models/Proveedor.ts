import mongoose from "mongoose"

const ProveedorSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    contacto: {
      type: String,
      trim: true,
    },
    telefono: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    direccion: {
      type: String,
      trim: true,
    },
    ciudad: {
      type: String,
      trim: true,
    },
    pais: {
      type: String,
      default: "México",
      trim: true,
    },
    tipoMateriales: [
      {
        type: String,
        enum: ["Perfil PVC", "Perfil Aluminio", "Vidrio", "Herrajes", "Selladores", "Accesorios"],
      },
    ],
    descuentoGeneral: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "proveedores", // Nombre fijo de colección
  },
)

export default mongoose.models.Proveedor || mongoose.model("Proveedor", ProveedorSchema)
