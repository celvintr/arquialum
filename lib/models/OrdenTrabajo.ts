import mongoose from "mongoose"

const OrdenTrabajoSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      required: true,
      unique: true,
    },
    cotizacion_id: {
      type: String,
      required: true,
    },
    cliente_id: {
      type: String,
      required: true,
    },
    estado: {
      type: String,
      enum: ["pendiente", "en_proceso", "completada", "facturada", "cancelada"],
      default: "pendiente",
    },
    fecha_inicio: Date,
    fecha_estimada_fin: Date,
    fecha_real_fin: Date,

    // Costos estimados vs reales
    costos_estimados: {
      materiales: Number,
      mano_obra: Number,
      otros: Number,
      total: Number,
    },
    costos_reales: {
      materiales: Number,
      mano_obra: Number,
      otros: Number,
      total: Number,
    },

    // Materiales utilizados
    materiales_utilizados: [
      {
        material_id: String,
        material_nombre: String,
        cantidad_estimada: Number,
        cantidad_real: Number,
        precio_unitario: Number,
        costo_total: Number,
        fecha_uso: Date,
        notas: String,
      },
    ],

    // Mano de obra
    mano_obra_registrada: [
      {
        trabajador_id: String,
        trabajador_nombre: String,
        horas_trabajadas: Number,
        tarifa_hora: Number,
        costo_total: Number,
        fecha: Date,
        descripcion: String,
      },
    ],

    // Progreso
    progreso_porcentaje: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    notas: String,
    imagenes: [String],
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.OrdenTrabajo || mongoose.model("OrdenTrabajo", OrdenTrabajoSchema)
