const { seedProveedores } = require("./seed-proveedores")
const { seedVariantesTipos } = require("./seed-variantes-tipos")
const { seedTiposProducto } = require("./seed-tipos-producto")

async function seedAllData() {
  console.log("🚀 Iniciando seeding completo de la base de datos 'cotizacion'")
  console.log("=".repeat(60))

  try {
    console.log("\n1️⃣ Seeding Proveedores...")
    await seedProveedores()

    console.log("\n2️⃣ Seeding Variantes y Tipos...")
    await seedVariantesTipos()

    console.log("\n3️⃣ Seeding Tipos de Producto...")
    await seedTiposProducto()

    console.log("\n" + "=".repeat(60))
    console.log("✅ SEEDING COMPLETO EXITOSO")
    console.log("🎯 Base de datos 'cotizacion' lista para usar")
    console.log("📊 Datos insertados:")
    console.log("   • 7 Proveedores")
    console.log("   • 5 Colores PVC")
    console.log("   • 5 Colores Aluminio")
    console.log("   • 10 Tipos de Vidrio")
    console.log("   • 11 Tipos de Producto")
    console.log("   • Múltiples Modelos")
    console.log("=".repeat(60))
  } catch (error) {
    console.error("❌ Error en el seeding completo:", error)
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  seedAllData()
}

module.exports = { seedAllData }
