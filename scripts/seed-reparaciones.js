const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cotizacion"

async function seedReparaciones() {
  console.log("🔧 SEEDING REPARACIONES")
  console.log("=" * 40)

  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db("cotizacion")

    // Limpiar colección
    await db.collection("reparaciones").deleteMany({})

    const reparaciones = [
      {
        _id: "rep_001",
        nombre: "Cambio de Vidrio",
        descripcion: "Reemplazo de vidrio roto o dañado",
        categoria: "Ventanas",
        precio_base: 350,
        tiempo_estimado: 45,
        incluye_materiales: true,
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "rep_002",
        nombre: "Ajuste de Hoja",
        descripcion: "Ajuste de hoja que no cierra correctamente",
        categoria: "Ventanas",
        precio_base: 180,
        tiempo_estimado: 30,
        incluye_materiales: false,
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "rep_003",
        nombre: "Cambio de Chapa",
        descripcion: "Reemplazo de chapa dañada o perdida",
        categoria: "Puertas",
        precio_base: 450,
        tiempo_estimado: 60,
        incluye_materiales: true,
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "rep_004",
        nombre: "Reparación de Marco",
        descripcion: "Reparación de marco dañado o deformado",
        categoria: "Ventanas",
        precio_base: 280,
        tiempo_estimado: 90,
        incluye_materiales: false,
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "rep_005",
        nombre: "Cambio de Herrajes",
        descripcion: "Reemplazo de herrajes desgastados",
        categoria: "Herrajes",
        precio_base: 320,
        tiempo_estimado: 40,
        incluye_materiales: true,
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    await db.collection("reparaciones").insertMany(reparaciones)
    console.log(`✅ ${reparaciones.length} reparaciones insertadas`)

    console.log("\n" + "=" * 40)
    console.log("✅ REPARACIONES SEEDING COMPLETADO")
    console.log("=" * 40)
  } catch (error) {
    console.error("❌ Error en seeding reparaciones:", error)
  } finally {
    await client.close()
  }
}

if (require.main === module) {
  seedReparaciones()
}

module.exports = { seedReparaciones }
