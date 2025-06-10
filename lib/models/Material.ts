import mongoose, { type Document, Schema } from "mongoose"

export interface IMaterial extends Document {
  nombre: string
  descripcion: string
  proveedor_id: mongoose.Types.ObjectId
  user_id: mongoose.Types.ObjectId
  area_longitud: number
  precio_unitario: number
  descuento: number
  costo: number
  tipo_impuesto_id?: mongoose.Types.ObjectId
  unidad_medida: string
  unidad_medida_produccion: string
  formula_calculo?: string
  formulas_extra?: any[]
  contribuye_a_malla: boolean
  tieneVariantes: boolean
  createdAt: Date
  updatedAt: Date
}

const MaterialSchema = new Schema<IMaterial>(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true },
    proveedor_id: { type: Schema.Types.ObjectId, ref: "Proveedor", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    area_longitud: { type: Number, required: true, min: 0 },
    precio_unitario: { type: Number, required: true, min: 0 },
    descuento: { type: Number, default: 0, min: 0, max: 100 },
    costo: { type: Number, required: true, min: 0 },
    tipo_impuesto_id: { type: Schema.Types.ObjectId, ref: "TipoImpuesto" },
    unidad_medida: { type: String, required: true },
    unidad_medida_produccion: { type: String, required: true },
    formula_calculo: { type: String },
    formulas_extra: [{ type: Schema.Types.Mixed }],
    contribuye_a_malla: { type: Boolean, default: false },
    tieneVariantes: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default mongoose.models.Material || mongoose.model<IMaterial>("Material", MaterialSchema)
