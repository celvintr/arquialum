const { MongoClient } = require("mongodb")

async function cleanDuplicateCollections() {
  const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017")

  try {
    await client.connect()
    console.log("🔗 Conectado a MongoDB")

    const db = client.db("cotizacion")

    // Eliminar colecciones duplicadas/incorrectas
    const collectionsToDelete = ["materials", "cotizacions", "tipoproductomodelos"]

    for (const collectionName of collectionsToDelete) {
      try {
        const exists = await db.listCollections({ name: collectionName }).hasNext()
        if (exists) {
          await db.collection(collectionName).drop()
          console.log(`✅ Eliminada colección duplicada: ${collectionName}`)
        }
      } catch (error) {
        console.log(`⚠️  Colección ${collectionName} no existe o ya fue eliminada`)
      }
    }

    // Verificar colecciones restantes
    const collections = await db.listCollections().toArray()
    console.log("\n📊 Colecciones finales:")
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments()
      console.log(`  ${collection.name}: ${count} documentos`)
    }

    console.log("\n✅ Limpieza completada")
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await client.close()
  }
}

cleanDuplicateCollections()
