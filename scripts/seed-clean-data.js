const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cotizacion"

async function seedCleanData() {
  console.log("🌱 SEEDING DATOS LIMPIOS - Base de datos: cotizacion")
  console.log("=" * 60)

  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db("cotizacion")

    // 1. PROVEEDORES
    console.log("\n1️⃣ Insertando Proveedores...")
    await db.collection("proveedores").deleteMany({})
    const proveedores = [
      {
        nombre: "ALUMINIOS DEL NORTE",
        contacto: "Juan Pérez",
        telefono: "555-0101",
        email: "ventas@aluminiosnorte.com",
        direccion: "Av. Industrial 123",
        ciudad: "Monterrey",
        pais: "México",
        tipoMateriales: ["Perfil Aluminio", "Herrajes"],
        descuentoGeneral: 5,
        isActive: true,
      },
      {
        nombre: "PVC SISTEMAS",
        contacto: "María González",
        telefono: "555-0102",
        email: "info@pvcsistemas.com",
        direccion: "Calle Manufactura 456",
        ciudad: "Guadalajara",
        pais: "México",
        tipoMateriales: ["Perfil PVC", "Selladores"],
        descuentoGeneral: 3,
        isActive: true,
      },
      {
        nombre: "VIDRIOS ESPECIALIZADOS",
        contacto: "Carlos Ruiz",
        telefono: "555-0103",
        email: "pedidos@vidriosespe.com",
        direccion: "Zona Industrial 789",
        ciudad: "Ciudad de México",
        pais: "México",
        tipoMateriales: ["Vidrio"],
        descuentoGeneral: 2,
        isActive: true,
      },
      {
        nombre: "HERRAJES PREMIUM",
        contacto: "Ana López",
        telefono: "555-0104",
        email: "ventas@herrajespremium.com",
        direccion: "Av. Tecnológica 321",
        ciudad: "Tijuana",
        pais: "México",
        tipoMateriales: ["Herrajes", "Accesorios"],
        descuentoGeneral: 4,
        isActive: true,
      },
    ]
    await db.collection("proveedores").insertMany(proveedores)
    console.log(`   ✅ ${proveedores.length} proveedores insertados`)

    // 2. COLORES PVC
    console.log("\n2️⃣ Insertando Colores PVC...")
    await db.collection("colores_pvc").deleteMany({})
    const coloresPVC = [
      { nombre: "Blanco", descripcion: "Blanco estándar", costo: 0, activo: true },
      { nombre: "Negro", descripcion: "Negro mate", costo: 15, activo: true },
      { nombre: "Café", descripcion: "Café chocolate", costo: 20, activo: true },
      { nombre: "Madera", descripcion: "Imitación madera", costo: 25, activo: true },
      { nombre: "Gris", descripcion: "Gris antracita", costo: 18, activo: true },
    ]
    await db.collection("colores_pvc").insertMany(coloresPVC)
    console.log(`   ✅ ${coloresPVC.length} colores PVC insertados`)

    // 3. COLORES ALUMINIO
    console.log("\n3️⃣ Insertando Colores Aluminio...")
    await db.collection("colores_aluminio").deleteMany({})
    const coloresAluminio = [
      { nombre: "Natural", descripcion: "Aluminio natural", costo: 0, activo: true },
      { nombre: "Negro", descripcion: "Negro anodizado", costo: 30, activo: true },
      { nombre: "Blanco", descripcion: "Blanco electrostático", costo: 25, activo: true },
      { nombre: "Bronce", descripcion: "Bronce anodizado", costo: 35, activo: true },
      { nombre: "Champagne", descripcion: "Champagne anodizado", costo: 40, activo: true },
    ]
    await db.collection("colores_aluminio").insertMany(coloresAluminio)
    console.log(`   ✅ ${coloresAluminio.length} colores aluminio insertados`)

    // 4. TIPOS DE VIDRIO
    console.log("\n4️⃣ Insertando Tipos de Vidrio...")
    await db.collection("tipos_vidrio").deleteMany({})
    const tiposVidrio = [
      { nombre: "Claro", descripcion: "Vidrio transparente", espesor: "6mm", costo: 0, activo: true },
      { nombre: "Bronce", descripcion: "Vidrio color bronce", espesor: "6mm", costo: 50, activo: true },
      { nombre: "Reflectivo", descripcion: "Vidrio reflectivo", espesor: "6mm", costo: 80, activo: true },
      { nombre: "Laminado", descripcion: "Vidrio laminado seguridad", espesor: "6+6mm", costo: 120, activo: true },
      { nombre: "Templado", descripcion: "Vidrio templado", espesor: "6mm", costo: 100, activo: true },
      { nombre: "Doble", descripcion: "Doble vidrio hermético", espesor: "6+6mm", costo: 200, activo: true },
    ]
    await db.collection("tipos_vidrio").insertMany(tiposVidrio)
    console.log(`   ✅ ${tiposVidrio.length} tipos de vidrio insertados`)

    // 5. TIPOS DE PRODUCTO
    console.log("\n5️⃣ Insertando Tipos de Producto...")
    await db.collection("tipos_producto").deleteMany({})
    const tiposProducto = [
      {
        nombre: "Ventana Corrediza",
        descripcion: "Ventana de corredera horizontal",
        categoria: "Ventanas",
        isActive: true,
      },
      {
        nombre: "Ventana Abatible",
        descripcion: "Ventana que abre hacia adentro",
        categoria: "Ventanas",
        isActive: true,
      },
      {
        nombre: "Ventana Proyectante",
        descripcion: "Ventana que proyecta hacia afuera",
        categoria: "Ventanas",
        isActive: true,
      },
      { nombre: "Puerta Abatible", descripcion: "Puerta de una hoja", categoria: "Puertas", isActive: true },
      { nombre: "Puerta Corrediza", descripcion: "Puerta de corredera", categoria: "Puertas", isActive: true },
      { nombre: "Barandal Fijo", descripcion: "Barandal sin apertura", categoria: "Barandales", isActive: true },
      { nombre: "Barandal con Puerta", descripcion: "Barandal con acceso", categoria: "Barandales", isActive: true },
    ]
    await db.collection("tipos_producto").insertMany(tiposProducto)
    console.log(`   ✅ ${tiposProducto.length} tipos de producto insertados`)

    console.log("\n" + "=" * 60)
    console.log("✅ SEEDING COMPLETADO EXITOSAMENTE")
    console.log('📊 Datos insertados en base "cotizacion":')
    console.log(`   • ${proveedores.length} Proveedores`)
    console.log(`   • ${coloresPVC.length} Colores PVC`)
    console.log(`   • ${coloresAluminio.length} Colores Aluminio`)
    console.log(`   • ${tiposVidrio.length} Tipos de Vidrio`)
    console.log(`   • ${tiposProducto.length} Tipos de Producto`)
    console.log("=" * 60)
  } catch (error) {
    console.error("❌ Error en seeding:", error)
  } finally {
    await client.close()
  }
}

if (require.main === module) {
  seedCleanData()
}

module.exports = { seedCleanData }
