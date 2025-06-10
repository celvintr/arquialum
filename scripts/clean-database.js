const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cotizacion"

async function cleanDatabase() {
  console.log("🧹 LIMPIANDO BASE DE DATOS - Eliminando colecciones duplicadas")
  console.log("=" * 60)

  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db("cotizacion")

    // Obtener todas las colecciones
    const collections = await db.listCollections().toArray()
    console.log("📋 Colecciones encontradas:")
    collections.forEach((col) => console.log(`   • ${col.name}`))

    // Colecciones a eliminar (duplicadas o mal nombradas)
    const coleccionesAEliminar = [
      "coloraluminios",
      "colorpvcs",
      "cotizacionitems",
      "cotizacions",
      "grupos",
      "materialesbase",
      "materialesproveedores",
      "materials",
      "productomaterialformulas",
      "proveedors",
      "reparacions",
      "tipoproductomodelos",
      "tipoproductos",
      "tipos_producto",
      "tiposproducto",
      "tipovidrios",
      "variantesmateriales",
    ]

    console.log("\n🗑️ Eliminando colecciones duplicadas...")
    for (const coleccion of coleccionesAEliminar) {
      try {
        const existe = await db.listCollections({ name: coleccion }).hasNext()
        if (existe) {
          await db.collection(coleccion).drop()
          console.log(`   ✅ Eliminada: ${coleccion}`)
        }
      } catch (error) {
        console.log(`   ⚠️ No se pudo eliminar ${coleccion}: ${error.message}`)
      }
    }

    // Colecciones que DEBEN existir (nombres correctos)
    const coleccionesCorrectas = [
      "clientes",
      "colores_pvc",
      "colores_aluminio",
      "tipos_vidrio",
      "materiales",
      "productos",
      "proveedores",
      "cotizaciones",
      "tipos_producto",
      "reparaciones",
      "users",
      "configuracion",
    ]

    console.log("\n📋 Colecciones que deben existir:")
    for (const coleccion of coleccionesCorrectas) {
      const existe = await db.listCollections({ name: coleccion }).hasNext()
      console.log(`   ${existe ? "✅" : "❌"} ${coleccion}`)
    }

    console.log("\n✅ LIMPIEZA COMPLETADA")
  } catch (error) {
    console.error("❌ Error limpiando base de datos:", error)
  } finally {
    await client.close()
  }
}

if (require.main === module) {
  cleanDatabase()
}

module.exports = { cleanDatabase }
