import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cotizacion"

if (!MONGODB_URI) {
  throw new Error("Por favor define la variable MONGODB_URI en .env.local")
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ Conectado a MongoDB - Base de datos: cotizacion")
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect

// También exportar función para obtener la conexión directa
export async function connectToDatabase() {
  await dbConnect()
  return {
    db: mongoose.connection.db,
    client: mongoose.connection.getClient(),
  }
}

// Exportar connectDB como alias de dbConnect para compatibilidad
export { dbConnect as connectDB }
