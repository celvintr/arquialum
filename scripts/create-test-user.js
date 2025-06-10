const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cotizacion"

// Esquema de usuario
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: String,
  },
  {
    timestamps: true,
    collection: "users",
  },
)

const User = mongoose.model("User", UserSchema)

async function createTestUser() {
  try {
    console.log("🔌 Conectando a MongoDB...")
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log("✅ Conectado a MongoDB")

    // Limpiar usuarios existentes
    await User.deleteMany({})
    console.log("🧹 Usuarios existentes eliminados")

    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash("password", 12)

    const testUser = new User({
      name: "Administrador",
      email: "admin@test.com",
      password: hashedPassword,
      role: "admin",
    })

    await testUser.save()
    console.log("✅ Usuario de prueba creado:")
    console.log("   📧 Email: admin@test.com")
    console.log("   🔑 Password: password")
    console.log("   👤 Role: admin")

    // Verificar que se guardó correctamente
    const savedUser = await User.findOne({ email: "admin@test.com" }).select("+password")
    if (savedUser) {
      console.log("✅ Verificación: Usuario guardado correctamente")
      console.log(`   ID: ${savedUser._id}`)
      console.log(`   Nombre: ${savedUser.name}`)
      console.log(`   Email: ${savedUser.email}`)
      console.log(`   Role: ${savedUser.role}`)
    }

    await mongoose.disconnect()
    console.log("👋 Desconectado de MongoDB")
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

createTestUser()
