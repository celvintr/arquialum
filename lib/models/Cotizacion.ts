import mongoose from "mongoose"

const CotizacionSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      required: true,
      unique: true,
    },
    cliente_id: {
      type: String,
      required: true,
    },
    cliente: {
      id: { type: String, required: false },
      nombre: { type: String, required: false },
      email: { type: String, required: false },
      telefono: { type: String, required: false },
      direccion: { type: String, required: false },
    },
    vendedor: {
      id: { type: String, required: true },
      nombre: { type: String, required: true },
      email: { type: String, required: true },
    },
    items: [
      {
        tipo: String,
        nombre: String,
        descripcion: String,
        cantidad: Number,
        precio_unitario: Number,
        precio_total: Number,
        dimensiones: mongoose.Schema.Types.Mixed,
        especificaciones: mongoose.Schema.Types.Mixed,
        materiales: mongoose.Schema.Types.Mixed,
        costos: mongoose.Schema.Types.Mixed,
        notas: String,
        grupoId: String,
        imagen: { type: mongoose.Schema.Types.Mixed, default: null },
        imagenUrl: { type: mongoose.Schema.Types.Mixed, default: null },
      },
    ],
    grupos: [
      {
        id: String,
        nombre: String,
        descripcion: String,
        imagen: { type: mongoose.Schema.Types.Mixed, default: null },
        imagenUrl: { type: mongoose.Schema.Types.Mixed, default: null },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    iva: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    moneda: {
      type: String,
      default: "HNL",
    },
    tipo: {
      type: String,
      enum: ["productos", "reparaciones", "vidrio_templado", "mixta"],
      default: "mixta",
    },
    estado: {
      type: String,
      enum: ["borrador", "enviada", "aprobada", "rechazada", "vencida"],
      default: "borrador",
    },
    fechaCreacion: {
      type: Date,
      default: Date.now,
    },
    fechaVencimiento: {
      type: Date,
      required: false,
      default: () => {
        const fecha = new Date()
        fecha.setDate(fecha.getDate() + 30)
        return fecha
      },
    },
    notas: String,
    descuento: {
      type: Number,
      default: 0,
    },
    terminos_condiciones: String,
  },
  {
    timestamps: true,
  },
)

// Importante: El nombre del modelo debe ser "Cotizacion" (singular)
// Mongoose automáticamente buscará la colección "cotizacions" (plural en MongoDB)
export default mongoose.models.Cotizacion || mongoose.model("Cotizacion", CotizacionSchema)
