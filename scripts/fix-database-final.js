const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cotizacion"

async function fixDatabaseFinal() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db()

    console.log("🔧 Arreglando base de datos definitivamente...")

    // 1. Eliminar colección duplicada "materials"
    console.log('🗑️ Eliminando colección duplicada "materials"...')
    try {
      await db.collection("materials").drop()
      console.log('✅ Colección "materials" eliminada')
    } catch (error) {
      console.log('ℹ️ Colección "materials" no existía')
    }

    // 2. Limpiar colección "materiales" y usar solo esta
    console.log('🧹 Limpiando colección "materiales"...')
    await db.collection("materiales").deleteMany({})

    // 3. Verificar y crear índices necesarios
    console.log("📊 Creando índices...")
    await db.collection("materiales").createIndex({ nombre: 1 })
    await db.collection("materiales").createIndex({ categoria: 1 })
    await db.collection("materiales").createIndex({ activo: 1 })
    await db.collection("productos").createIndex({ nombre: 1 })
    await db.collection("proveedores").createIndex({ nombre: 1 })

    console.log("✅ Base de datos arreglada correctamente")
    console.log("📋 Resumen:")
    console.log('   - Solo colección "materiales" (sin duplicados)')
    console.log("   - Índices creados para mejor rendimiento")
    console.log("   - Lista para usar con datos reales")
  } catch (error) {
    console.error("❌ Error arreglando base de datos:", error)
  } finally {
    await client.close()
  }
}

if (require.main === module) {
  fixDatabaseFinal()
}

module.exports = { fixDatabaseFinal }
