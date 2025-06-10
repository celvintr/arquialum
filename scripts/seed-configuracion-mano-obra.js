const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tablar"

async function seedConfiguracionManoObra() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("🔗 Conectado a MongoDB")

    const db = client.db()
    const collection = db.collection("configuraciones_mano_obra")

    // Limpiar configuraciones existentes
    await collection.deleteMany({})
    console.log("🧹 Configuraciones existentes eliminadas")

    // Configuraciones predeterminadas
    const configuraciones = [
      {
        nombre: "Mano de obra fabricación estándar",
        descripcion: "Costo de mano de obra para fabricación de productos estándar",
        tipo: "fabricacion",
        formula: "ancho * alto * tarifa_base",
        tarifa_base: 400,
        activo: true,
        condiciones: {
          tipos_producto: [],
          materiales_requeridos: [],
          materiales_excluidos: [],
          contribuye_malla: false,
        },
        aplicacion: {
          por_producto: true,
          por_material: false,
          materiales_aplicables: [],
        },
        creado_en: new Date(),
        actualizado_en: new Date(),
        creado_por: "sistema",
      },
      {
        nombre: "Mano de obra instalación estándar",
        descripcion: "Costo de mano de obra para instalación de productos",
        tipo: "instalacion",
        formula: "ancho * alto * tarifa_base",
        tarifa_base: 200,
        activo: true,
        condiciones: {
          tipos_producto: [],
          materiales_requeridos: [],
          materiales_excluidos: [],
          contribuye_malla: false,
        },
        aplicacion: {
          por_producto: true,
          por_material: false,
          materiales_aplicables: [],
        },
        creado_en: new Date(),
        actualizado_en: new Date(),
        creado_por: "sistema",
      },
      {
        nombre: "Costo de malla estándar",
        descripcion: "Costo adicional para productos que requieren malla",
        tipo: "malla",
        formula: "ancho * alto * 0.25 * tarifa_base",
        tarifa_base: 400,
        activo: true,
        condiciones: {
          tipos_producto: [],
          materiales_requeridos: [],
          materiales_excluidos: [],
          contribuye_malla: true,
        },
        aplicacion: {
          por_producto: true,
          por_material: false,
          materiales_aplicables: [],
        },
        creado_en: new Date(),
        actualizado_en: new Date(),
        creado_por: "sistema",
      },
    ]

    // Insertar configuraciones
    const resultado = await collection.insertMany(configuraciones)
    console.log(`✅ ${resultado.insertedCount} configuraciones de mano de obra creadas`)

    // Mostrar configuraciones creadas
    configuraciones.forEach((config, index) => {
      console.log(`   ${index + 1}. ${config.nombre} (${config.tipo})`)
    })
  } catch (error) {
    console.error("❌ Error creando configuraciones de mano de obra:", error)
  } finally {
    await client.close()
    console.log("🔌 Conexión cerrada")
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedConfiguracionManoObra()
}

module.exports = { seedConfiguracionManoObra }
