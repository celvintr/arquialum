import mongoose from "mongoose"

const PagoSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      required: true,
      unique: true,
    },

    // Referencias
    factura_id: {
      type: String,
      required: true,
    },
    cliente_id: {
      type: String,
      required: true,
    },

    // Información del pago
    monto: {
      type: Number,
      required: true,
    },
    metodo_pago: {
      type: String,
      enum: ["efectivo", "transferencia", "cheque", "tarjeta_credito", "tarjeta_debito"],
      required: true,
    },

    // Detalles específicos del método
    detalles_pago: {
      numero_referencia: String,
      banco: String,
      numero_cheque: String,
      numero_autorizacion: String,
      ultimos_4_digitos: String,
    },

    fecha_pago: {
      type: Date,
      default: Date.now,
    },

    estado: {
      type: String,
      enum: ["pendiente", "confirmado", "rechazado"],
      default: "confirmado",
    },

    notas: String,
    comprobante_url: String, // URL del comprobante escaneado
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Pago || mongoose.model("Pago", PagoSchema)
