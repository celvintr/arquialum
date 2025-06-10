import mongoose, { type Document, Schema } from "mongoose"

export interface IProducto extends Document {
  nombre: string
  identificador: string
  svg?: string
  tipo_producto_id: mongoose.Types.ObjectId
  user_id: mongoose.Types.ObjectId
  descripcion: string
  imagen?: string
  proveedor_id: mongoose.Types.ObjectId
  tipo_producto_modelo_id?: mongoose.Types.ObjectId
  estado: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductoSchema = new Schema<IProducto>(
  {
    nombre: { type: String, required: true, trim: true },
    identificador: { type: String, required: true, trim: true },
    svg: { type: String },
    tipo_producto_id: { type: Schema.Types.ObjectId, ref: "TipoProducto", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    descripcion: { type: String, required: true },
    imagen: { type: String },
    proveedor_id: { type: Schema.Types.ObjectId, ref: "Proveedor", required: true },
    tipo_producto_modelo_id: { type: Schema.Types.ObjectId, ref: "TipoProductoModelo" },
    estado: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.models.Producto || mongoose.model<IProducto>("Producto", ProductoSchema)
