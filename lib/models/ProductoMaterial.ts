import mongoose, { type Document, Schema } from "mongoose"

export interface IProductoMaterial extends Document {
  material_id: mongoose.Types.ObjectId
  producto_id: mongoose.Types.ObjectId
  formula: string
  createdAt: Date
  updatedAt: Date
}

const ProductoMaterialSchema = new Schema<IProductoMaterial>(
  {
    material_id: { type: Schema.Types.ObjectId, ref: "Material", required: true },
    producto_id: { type: Schema.Types.ObjectId, ref: "Producto", required: true },
    formula: { type: String, required: true },
  },
  { timestamps: true },
)

export default mongoose.models.ProductoMaterial ||
  mongoose.model<IProductoMaterial>("ProductoMaterial", ProductoMaterialSchema)
