const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cotizacion"

async function createTestUser() {
  let client

  try {
    console.log("🔌 Conectando a MongoDB...")
    client = new MongoClient(MONGODB_URI)
    await client.connect()

    const db = client.db()
    const users = db.collection("users")

    console.log("🧹 Limpiando usuarios existentes...")
    await users.deleteMany({})

    console.log("🔐 Creando hash de contraseña...")
    const hashedPassword = await bcrypt.hash("password", 10)

    console.log("👤 Creando usuario administrador...")
    const adminUser = {
      name: "Administrador",
      email: "admin@test.com",
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await users.insertOne(adminUser)
    console.log("✅ Usuario creado con ID:", result.insertedId)

    // Verificar que el usuario se creó correctamente
    const createdUser = await users.findOne({ email: "admin@test.com" })
    console.log("✅ Usuario verificado:", {
      id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
    })

    console.log("\n🎉 ¡Usuario de prueba creado exitosamente!")
    console.log("📧 Email: admin@test.com")
    console.log("🔑 Password: password")
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    if (client) {
      await client.close()
      console.log("🔌 Conexión cerrada")
    }
  }
}

createTestUser()
