import mongoose from "mongoose"

const MovimientoInventarioSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      required: true,
      unique: true,
    },

    tipo: {
      type: String,
      enum: ["entrada", "salida", "ajuste", "transferencia"],
      required: true,
    },

    motivo: {
      type: String,
      enum: ["compra", "venta", "produccion", "ajuste_inventario", "merma", "devolucion"],
      required: true,
    },

    // Referencias
    material_id: {
      type: String,
      required: true,
    },
    orden_trabajo_id: String,
    factura_id: String,
    proveedor_id: String,

    // Cantidades
    cantidad: {
      type: Number,
      required: true,
    },
    cantidad_anterior: Number,
    cantidad_nueva: Number,

    // Costos
    costo_unitario: Number,
    costo_total: Number,

    fecha_movimiento: {
      type: Date,
      default: Date.now,
    },

    usuario_id: String,
    notas: String,
    documento_referencia: String,
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.MovimientoInventario ||
  mongoose.model("MovimientoInventario", MovimientoInventarioSchema)
