const { MongoClient, ObjectId } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cotizacion"

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log("🔗 Conectando a MongoDB...")
    await client.connect()
    console.log("✅ Conectado a MongoDB")

    const db = client.db()

    // Limpiar colecciones existentes
    console.log("🧹 Limpiando colecciones...")
    await db.collection("tiposproducto").deleteMany({})
    await db.collection("proveedores").deleteMany({})
    await db.collection("materiales").deleteMany({})
    await db.collection("productos").deleteMany({})

    // Eliminar índices problemáticos si existen
    try {
      await db.collection("productos").dropIndex("codigo_1")
      console.log("🗑️ Índice codigo_1 eliminado")
    } catch (e) {
      console.log("ℹ️ Índice codigo_1 no existía")
    }

    // Seed Tipos de Producto
    console.log("📦 Creando tipos de producto...")
    const tiposProductoResult = await db.collection("tiposproducto").insertMany([
      {
        _id: new ObjectId(),
        nombre: "Ventana PVC",
        descripcion: "Ventanas de PVC con diferentes configuraciones",
        categoria: "ventanas",
        mano_obra_fabricacion: 150,
        mano_obra_instalacion: 200,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        nombre: "Ventana Aluminio",
        descripcion: "Ventanas de aluminio con diferentes configuraciones",
        categoria: "ventanas",
        mano_obra_fabricacion: 180,
        mano_obra_instalacion: 220,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        nombre: "Puerta PVC",
        descripcion: "Puertas de PVC con diferentes configuraciones",
        categoria: "puertas",
        mano_obra_fabricacion: 200,
        mano_obra_instalacion: 300,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        nombre: "Barandal",
        descripcion: "Barandales de diferentes materiales",
        categoria: "barandales",
        mano_obra_fabricacion: 120,
        mano_obra_instalacion: 180,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const tiposProducto = Object.values(tiposProductoResult.insertedIds)
    console.log(`✅ ${tiposProducto.length} tipos de producto creados`)

    // Seed Proveedores
    console.log("🏢 Creando proveedores...")
    const proveedoresResult = await db.collection("proveedores").insertMany([
      {
        _id: new ObjectId(),
        nombre: "Proveedor PVC Premium",
        contacto: "Juan Pérez",
        telefono: "555-0101",
        email: "juan@pvcpremium.com",
        direccion: "Av. Industrial 123",
        ciudad: "Ciudad de México",
        pais: "México",
        tipoMateriales: ["PVC", "Herrajes"],
        descuentoGeneral: 5,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        nombre: "Aluminio y Vidrios SA",
        contacto: "María González",
        telefono: "555-0202",
        email: "maria@aluvid.com",
        direccion: "Calle Aluminio 456",
        ciudad: "Guadalajara",
        pais: "México",
        tipoMateriales: ["Aluminio", "Vidrio"],
        descuentoGeneral: 8,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        nombre: "Herrajes y Accesorios",
        contacto: "Carlos Rodríguez",
        telefono: "555-0303",
        email: "carlos@herrajes.com",
        direccion: "Zona Industrial 789",
        ciudad: "Monterrey",
        pais: "México",
        tipoMateriales: ["Herrajes", "Accesorios"],
        descuentoGeneral: 3,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const proveedores = Object.values(proveedoresResult.insertedIds)
    console.log(`✅ ${proveedores.length} proveedores creados`)

    // Seed Materiales
    console.log("🔧 Creando materiales...")
    const materialesResult = await db.collection("materiales").insertMany([
      {
        _id: new ObjectId(),
        nombre: "Perfil PVC Ventana",
        descripcion: "Perfil principal para ventanas de PVC",
        categoria: "PVC",
        unidad: "ml",
        costo: 45.5,
        stock: 1000,
        stockMinimo: 100,
        proveedor_id: proveedores[0],
        contribuyeMalla: false,
        estado: true,
        variantes: [
          { tipo: "color_pvc", nombre: "Blanco", costo_adicional: 0 },
          { tipo: "color_pvc", nombre: "Café", costo_adicional: 5 },
          { tipo: "color_pvc", nombre: "Negro", costo_adicional: 8 },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        nombre: "Perfil Aluminio Ventana",
        descripcion: "Perfil principal para ventanas de aluminio",
        categoria: "Aluminio",
        unidad: "ml",
        costo: 65.0,
        stock: 800,
        stockMinimo: 80,
        proveedor_id: proveedores[1],
        contribuyeMalla: false,
        estado: true,
        variantes: [
          { tipo: "color_aluminio", nombre: "Natural", costo_adicional: 0 },
          { tipo: "color_aluminio", nombre: "Bronce", costo_adicional: 12 },
          { tipo: "color_aluminio", nombre: "Negro", costo_adicional: 15 },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        nombre: "Vidrio Claro 6mm",
        descripcion: "Vidrio transparente de 6mm de espesor",
        categoria: "Vidrio",
        unidad: "m2",
        costo: 180.0,
        stock: 500,
        stockMinimo: 50,
        proveedor_id: proveedores[1],
        contribuyeMalla: false,
        estado: true,
        variantes: [
          { tipo: "tipo_vidrio", nombre: "Claro", costo_adicional: 0 },
          { tipo: "tipo_vidrio", nombre: "Bronce", costo_adicional: 25 },
          { tipo: "tipo_vidrio", nombre: "Azul", costo_adicional: 30 },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        nombre: "Malla Mosquitera",
        descripcion: "Malla para mosquiteros",
        categoria: "Accesorios",
        unidad: "m2",
        costo: 25.0,
        stock: 200,
        stockMinimo: 20,
        proveedor_id: proveedores[2],
        contribuyeMalla: true,
        estado: true,
        variantes: [
          { tipo: "otro", nombre: "Estándar", costo_adicional: 0 },
          { tipo: "otro", nombre: "Reforzada", costo_adicional: 8 },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const materiales = Object.values(materialesResult.insertedIds)
    console.log(`✅ ${materiales.length} materiales creados`)

    // Seed Productos
    console.log("🏗️ Creando productos...")
    await db.collection("productos").insertMany([
      {
        _id: new ObjectId(),
        nombre: "Ventana PVC 2 Hojas",
        codigo: "PROD-001",
        identificador: "VEN-PVC-2H",
        descripcion: "Ventana de PVC con 2 hojas corredizas",
        tipo_producto_id: tiposProducto[0],
        user_id: new ObjectId(),
        imagen: "/placeholder.svg?height=200&width=200",
        svg: '<rect width="100" height="60" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>',
        proveedor_id: proveedores[0],
        margen_ganancia: 35,
        estado: true,
        materiales: [
          {
            material_id: materiales[0],
            formula: "REDONDEAR.MENOS((ancho + alto) * 2 / 100, 0) * 100",
          },
          {
            material_id: materiales[2],
            formula: "REDONDEAR.MENOS(ancho * alto / 10000, 2)",
          },
          {
            material_id: materiales[3],
            formula: "SI(malla = 1, REDONDEAR.MENOS(ancho * alto / 10000, 2), 0)",
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        nombre: "Ventana Aluminio 3 Hojas",
        codigo: "PROD-002",
        identificador: "VEN-ALU-3H",
        descripcion: "Ventana de aluminio con 3 hojas corredizas",
        tipo_producto_id: tiposProducto[1],
        user_id: new ObjectId(),
        imagen: "/placeholder.svg?height=200&width=200",
        svg: '<rect width="120" height="60" fill="#d1d5db" stroke="#374151" stroke-width="2"/>',
        proveedor_id: proveedores[1],
        margen_ganancia: 40,
        estado: true,
        materiales: [
          {
            material_id: materiales[1],
            formula: "REDONDEAR.MENOS((ancho + alto) * 2.5 / 100, 0) * 100",
          },
          {
            material_id: materiales[2],
            formula: "REDONDEAR.MENOS(ancho * alto / 10000, 2)",
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    console.log("✅ 2 productos creados")

    console.log("🎉 ¡Base de datos inicializada correctamente!")

    // Mostrar resumen
    console.log("\n📊 RESUMEN:")
    console.log(`- Tipos de producto: ${tiposProducto.length}`)
    console.log(`- Proveedores: ${proveedores.length}`)
    console.log(`- Materiales: ${materiales.length}`)
    console.log("- Productos: 2")
  } catch (error) {
    console.error("❌ Error inicializando base de datos:", error)
  } finally {
    await client.close()
    console.log("🔌 Conexión cerrada")
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedDatabase()
}

module.exports = { seedDatabase }
