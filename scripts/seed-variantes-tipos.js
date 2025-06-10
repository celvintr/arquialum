const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tablar"

async function seedVariantesTipos() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("🔗 Conectado a MongoDB")

    const db = client.db()

    // Limpiar colecciones existentes
    await db.collection("colores_pvc").deleteMany({})
    await db.collection("colores_aluminio").deleteMany({})
    await db.collection("tipos_vidrio").deleteMany({})

    // Colores PVC
    const coloresPVC = [
      { nombre: "Blanco", codigo: "PVC-001", activo: true, created_at: new Date() },
      { nombre: "Beige", codigo: "PVC-002", activo: true, created_at: new Date() },
      { nombre: "Café", codigo: "PVC-003", activo: true, created_at: new Date() },
      { nombre: "Negro", codigo: "PVC-004", activo: true, created_at: new Date() },
      { nombre: "Gris", codigo: "PVC-005", activo: true, created_at: new Date() },
      { nombre: "Madera Clara", codigo: "PVC-006", activo: true, created_at: new Date() },
      { nombre: "Madera Oscura", codigo: "PVC-007", activo: true, created_at: new Date() },
    ]

    // Colores Aluminio
    const coloresAluminio = [
      { nombre: "Natural", codigo: "ALU-001", activo: true, created_at: new Date() },
      { nombre: "Blanco", codigo: "ALU-002", activo: true, created_at: new Date() },
      { nombre: "Negro", codigo: "ALU-003", activo: true, created_at: new Date() },
      { nombre: "Bronce", codigo: "ALU-004", activo: true, created_at: new Date() },
      { nombre: "Champagne", codigo: "ALU-005", activo: true, created_at: new Date() },
      { nombre: "Madera", codigo: "ALU-006", activo: true, created_at: new Date() },
    ]

    // Tipos de Vidrio
    const tiposVidrio = [
      { nombre: "Claro 4mm", codigo: "VID-001", espesor: 4, activo: true, created_at: new Date() },
      { nombre: "Claro 6mm", codigo: "VID-002", espesor: 6, activo: true, created_at: new Date() },
      { nombre: "Templado 6mm", codigo: "VID-003", espesor: 6, activo: true, created_at: new Date() },
      { nombre: "Templado 8mm", codigo: "VID-004", espesor: 8, activo: true, created_at: new Date() },
      { nombre: "Laminado 6mm", codigo: "VID-005", espesor: 6, activo: true, created_at: new Date() },
      { nombre: "Reflectivo", codigo: "VID-006", espesor: 6, activo: true, created_at: new Date() },
    ]

    // Insertar datos
    await db.collection("colores_pvc").insertMany(coloresPVC)
    await db.collection("colores_aluminio").insertMany(coloresAluminio)
    await db.collection("tipos_vidrio").insertMany(tiposVidrio)

    console.log("✅ Variantes creadas:")
    console.log(`   - ${coloresPVC.length} colores PVC`)
    console.log(`   - ${coloresAluminio.length} colores aluminio`)
    console.log(`   - ${tiposVidrio.length} tipos de vidrio`)
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await client.close()
  }
}

seedVariantesTipos()
