const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cotizacion"

async function seedUsers() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log("🔗 Conectando a MongoDB...")
    await client.connect()
    console.log("✅ Conectado a MongoDB")

    const db = client.db()

    // Limpiar usuarios existentes
    console.log("🧹 Limpiando usuarios...")
    await db.collection("users").deleteMany({})

    // Crear usuarios de prueba
    console.log("👥 Creando usuarios...")
    const users = [
      {
        name: "Administrador",
        email: "admin@test.com",
        password: await bcrypt.hash("password", 12),
        role: "admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Vendedor",
        email: "vendedor@test.com",
        password: await bcrypt.hash("password", 12),
        role: "vendedor",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Usuario",
        email: "user@test.com",
        password: await bcrypt.hash("password", 12),
        role: "user",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.collection("users").insertMany(users)
    console.log(`✅ ${users.length} usuarios creados`)

    console.log("📧 Credenciales de acceso:")
    users.forEach((user) => {
      console.log(`- ${user.email} / password (${user.role})`)
    })
  } catch (error) {
    console.error("❌ Error creando usuarios:", error)
  } finally {
    await client.close()
    console.log("🔌 Conexión cerrada")
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedUsers()
}

module.exports = { seedUsers }
