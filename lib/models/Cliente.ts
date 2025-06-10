import mongoose, { type Document, Schema } from "mongoose"

export interface ICliente extends Document {
  nombre: string
  email: string
  telefono: string
  direccion: {
    calle: string
    ciudad: string
    estado: string
    codigoPostal: string
  }
  rfc?: string
  empresa?: string
  contactoSecundario?: {
    nombre: string
    telefono: string
    email: string
  }
  notas?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ClienteSchema = new Schema<ICliente>(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es requerido"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    telefono: {
      type: String,
      required: [true, "El teléfono es requerido"],
      trim: true,
    },
    direccion: {
      calle: {
        type: String,
        required: [true, "La dirección es requerida"],
        trim: true,
      },
      ciudad: {
        type: String,
        required: [true, "La ciudad es requerida"],
        trim: true,
      },
      estado: {
        type: String,
        required: [true, "El estado es requerido"],
        trim: true,
      },
      codigoPostal: {
        type: String,
        required: [true, "El código postal es requerido"],
        trim: true,
      },
    },
    rfc: {
      type: String,
      trim: true,
      uppercase: true,
    },
    empresa: {
      type: String,
      trim: true,
    },
    contactoSecundario: {
      nombre: String,
      telefono: String,
      email: String,
    },
    notas: {
      type: String,
      trim: true,
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

ClienteSchema.index({ nombre: "text", email: "text", empresa: "text" })
ClienteSchema.index({ email: 1 })

export default mongoose.models.Cliente || mongoose.model<ICliente>("Cliente", ClienteSchema)
