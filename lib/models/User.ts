import mongoose, { type Document, Schema } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
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
      index: true, // Solo usar index: true, no schema.index() adicional
    },
    password: {
      type: String,
      required: [true, "La contraseña es requerida"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "vendedor", "usuario"],
      default: "usuario",
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
)

// Evitar recompilación del modelo
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
