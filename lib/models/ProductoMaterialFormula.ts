import mongoose, { type Document, Schema } from "mongoose"

export interface IProductoMaterialFormula extends Document {
  producto_id: mongoose.Types.ObjectId
  material_base_id: mongoose.Types.ObjectId
  formula: string
  es_opcional: boolean
  orden: number
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductoMaterialFormulaSchema = new Schema<IProductoMaterialFormula>(
  {
    producto_id: { type: Schema.Types.ObjectId, ref: "Producto", required: true },
    material_base_id: { type: Schema.Types.ObjectId, ref: "MaterialBase", required: true },
    formula: { type: String, required: true },
    es_opcional: { type: Boolean, default: false },
    orden: { type: Number, default: 0 },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.models.ProductoMaterialFormula ||
  mongoose.model<IProductoMaterialFormula>("ProductoMaterialFormula", ProductoMaterialFormulaSchema)
