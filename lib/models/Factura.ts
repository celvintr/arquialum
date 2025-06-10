import mongoose from "mongoose"

const FacturaSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      required: true,
      unique: true,
    },
    serie: {
      type: String,
      default: "A",
    },
    tipo: {
      type: String,
      enum: ["factura", "nota_credito", "nota_debito"],
      default: "factura",
    },

    // Referencias
    cotizacion_id: String,
    orden_trabajo_id: String,
    cliente_id: {
      type: String,
      required: true,
    },

    // Datos del cliente (snapshot)
    cliente: {
      nombre: String,
      rtn: String,
      direccion: String,
      telefono: String,
      email: String,
    },

    // Items facturados
    items: [
      {
        tipo: String, // "producto", "material", "mano_obra", "otro"
        descripcion: String,
        cantidad: Number,
        precio_unitario: Number,
        descuento: Number,
        subtotal: Number,
        impuesto: Number,
        total: Number,

        // Referencias opcionales
        material_id: String,
        producto_id: String,
      },
    ],

    // Totales
    subtotal: Number,
    descuento_global: Number,
    impuesto_total: Number,
    total: Number,

    // Estado
    estado: {
      type: String,
      enum: ["borrador", "emitida", "pagada", "anulada", "vencida"],
      default: "borrador",
    },

    // Fechas
    fecha_emision: {
      type: Date,
      default: Date.now,
    },
    fecha_vencimiento: Date,

    // Términos y condiciones
    terminos_pago: String,
    notas: String,

    // Control fiscal
    cai: String, // Código de Autorización de Impresión
    rango_inicial: String,
    rango_final: String,
    fecha_limite_emision: Date,
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Factura || mongoose.model("Factura", FacturaSchema)
