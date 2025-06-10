const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cotizacion"

async function testConnection() {
  let client

  try {
    console.log("🔌 Probando conexión a MongoDB...")
    console.log("📍 URI:", MONGODB_URI)

    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    await client.connect()
    console.log("✅ Conexión exitosa!")

    const db = client.db()
    console.log("📁 Base de datos:", db.databaseName)

    // Probar una operación simple
    const collections = await db.listCollections().toArray()
    console.log(
      "📋 Colecciones existentes:",
      collections.map((c) => c.name),
    )

    // Probar inserción y consulta
    const testCollection = db.collection("test")
    await testCollection.insertOne({ test: true, timestamp: new Date() })
    const testDoc = await testCollection.findOne({ test: true })
    console.log("✅ Prueba de inserción/consulta exitosa:", testDoc)

    // Limpiar
    await testCollection.deleteMany({ test: true })
    console.log("🧹 Datos de prueba limpiados")
  } catch (error) {
    console.error("❌ Error de conexión:", error.message)

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 Sugerencias:")
      console.log("1. Verifica que MongoDB esté ejecutándose")
      console.log("2. Verifica que el puerto 27017 esté abierto")
      console.log("3. Si usas Laragon, asegúrate que MongoDB esté habilitado")
    }
  } finally {
    if (client) {
      await client.close()
      console.log("🔌 Conexión cerrada")
    }
  }
}

testConnection()
