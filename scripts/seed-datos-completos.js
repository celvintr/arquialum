const { MongoClient } = require("mongodb")

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/cotizacion"

async function seedDatabase() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("🔗 Conectado a MongoDB")

    const db = client.db()

    // Limpiar colecciones existentes
    const collections = [
      "clientes",
      "productos",
      "materiales",
      "cotizaciones",
      "proveedores",
      "tipos_producto",
      "colores_pvc",
      "colores_aluminio",
      "tipos_vidrio",
    ]

    for (const collection of collections) {
      try {
        await db.collection(collection).drop()
        console.log(`🗑️ Colección ${collection} eliminada`)
      } catch (error) {
        console.log(`ℹ️ Colección ${collection} no existía`)
      }
    }

    // 1. CLIENTES
    const clientes = [
      {
        _id: "cliente_001",
        nombre: "Juan Pérez García",
        email: "juan.perez@email.com",
        telefono: "555-0101",
        direccion: "Av. Principal 123, Col. Centro",
        ciudad: "Ciudad de México",
        tipo: "particular",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "cliente_002",
        nombre: "Constructora ABC SA de CV",
        email: "contacto@constructoraabc.com",
        telefono: "555-0202",
        direccion: "Blvd. Empresarial 456, Col. Industrial",
        ciudad: "Guadalajara",
        tipo: "empresa",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "cliente_003",
        nombre: "María González López",
        email: "maria.gonzalez@email.com",
        telefono: "555-0303",
        direccion: "Calle Reforma 789, Col. Residencial",
        ciudad: "Monterrey",
        tipo: "particular",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "cliente_004",
        nombre: "Desarrollos Inmobiliarios XYZ",
        email: "ventas@desarrollosxyz.com",
        telefono: "555-0404",
        direccion: "Torre Corporativa, Piso 15",
        ciudad: "Puebla",
        tipo: "empresa",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "cliente_005",
        nombre: "Carlos Rodríguez Martínez",
        email: "carlos.rodriguez@email.com",
        telefono: "555-0505",
        direccion: "Privada Los Pinos 321",
        ciudad: "Tijuana",
        tipo: "particular",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    await db.collection("clientes").insertMany(clientes)
    console.log("✅ Clientes insertados")

    // 2. PROVEEDORES
    const proveedores = [
      {
        _id: "prov_001",
        nombre: "Aluminios del Norte SA",
        contacto: "Ing. Roberto Silva",
        telefono: "555-1001",
        email: "ventas@aluminiosnorte.com",
        direccion: "Zona Industrial Norte",
        ciudad: "Monterrey",
        especialidad: "Perfiles de aluminio",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "prov_002",
        nombre: "Vidrios y Cristales SA",
        contacto: "Lic. Ana Martínez",
        telefono: "555-1002",
        email: "pedidos@vidriosycristales.com",
        direccion: "Av. Industrial 567",
        ciudad: "Guadalajara",
        especialidad: "Vidrios templados y laminados",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "prov_003",
        nombre: "Herrajes Premium",
        contacto: "Sr. Luis Hernández",
        telefono: "555-1003",
        email: "info@herrajespremium.com",
        direccion: "Calle Comercio 890",
        ciudad: "Ciudad de México",
        especialidad: "Herrajes y accesorios",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    await db.collection("proveedores").insertMany(proveedores)
    console.log("✅ Proveedores insertados")

    // 3. TIPOS DE PRODUCTO
    const tiposProducto = [
      {
        _id: "tipo_001",
        nombre: "Ventana",
        descripcion: "Ventanas de aluminio y PVC",
        categoria: "aberturas",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "tipo_002",
        nombre: "Puerta",
        descripcion: "Puertas de aluminio y PVC",
        categoria: "aberturas",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "tipo_003",
        nombre: "Barandal",
        descripcion: "Barandales de aluminio",
        categoria: "estructuras",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "tipo_004",
        nombre: "Mampara",
        descripcion: "Mamparas para baño",
        categoria: "aberturas",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    await db.collection("tipos_producto").insertMany(tiposProducto)
    console.log("✅ Tipos de producto insertados")

    // 4. COLORES PVC
    const coloresPVC = [
      { _id: "pvc_001", nombre: "Blanco", codigo: "#FFFFFF", activo: true },
      { _id: "pvc_002", nombre: "Beige", codigo: "#F5F5DC", activo: true },
      { _id: "pvc_003", nombre: "Gris", codigo: "#808080", activo: true },
      { _id: "pvc_004", nombre: "Café", codigo: "#8B4513", activo: true },
      { _id: "pvc_005", nombre: "Negro", codigo: "#000000", activo: true },
    ]

    await db.collection("colores_pvc").insertMany(coloresPVC)
    console.log("✅ Colores PVC insertados")

    // 5. COLORES ALUMINIO
    const coloresAluminio = [
      { _id: "alu_001", nombre: "Natural", codigo: "#C0C0C0", activo: true },
      { _id: "alu_002", nombre: "Blanco", codigo: "#FFFFFF", activo: true },
      { _id: "alu_003", nombre: "Negro", codigo: "#000000", activo: true },
      { _id: "alu_004", nombre: "Bronce", codigo: "#CD7F32", activo: true },
      { _id: "alu_005", nombre: "Champagne", codigo: "#F7E7CE", activo: true },
    ]

    await db.collection("colores_aluminio").insertMany(coloresAluminio)
    console.log("✅ Colores aluminio insertados")

    // 6. TIPOS DE VIDRIO
    const tiposVidrio = [
      { _id: "vid_001", nombre: "Claro 6mm", espesor: 6, tipo: "claro", precio_m2: 150.0, activo: true },
      { _id: "vid_002", nombre: "Templado 6mm", espesor: 6, tipo: "templado", precio_m2: 280.0, activo: true },
      { _id: "vid_003", nombre: "Laminado 6mm", espesor: 6, tipo: "laminado", precio_m2: 320.0, activo: true },
      { _id: "vid_004", nombre: "Claro 8mm", espesor: 8, tipo: "claro", precio_m2: 180.0, activo: true },
      { _id: "vid_005", nombre: "Templado 8mm", espesor: 8, tipo: "templado", precio_m2: 350.0, activo: true },
    ]

    await db.collection("tipos_vidrio").insertMany(tiposVidrio)
    console.log("✅ Tipos de vidrio insertados")

    // 7. MATERIALES
    const materiales = [
      {
        _id: "mat_001",
        nombre: "Perfil Ventana PVC 60mm",
        descripcion: "Perfil principal para ventana PVC serie 60",
        categoria: "perfiles",
        material: "PVC",
        unidad: "ml",
        precio_unitario: 85.5,
        stock: 500,
        stock_minimo: 50,
        proveedor_id: "prov_001",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "mat_002",
        nombre: "Perfil Marco Aluminio 50x25",
        descripcion: "Perfil de marco para ventana aluminio",
        categoria: "perfiles",
        material: "Aluminio",
        unidad: "ml",
        precio_unitario: 65.0,
        stock: 300,
        stock_minimo: 30,
        proveedor_id: "prov_001",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "mat_003",
        nombre: "Vidrio Templado 6mm",
        descripcion: "Vidrio templado transparente 6mm",
        categoria: "vidrios",
        material: "Vidrio",
        unidad: "m2",
        precio_unitario: 280.0,
        stock: 100,
        stock_minimo: 10,
        proveedor_id: "prov_002",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "mat_004",
        nombre: "Herraje Ventana Europea",
        descripcion: "Herraje completo para ventana europea",
        categoria: "herrajes",
        material: "Acero",
        unidad: "juego",
        precio_unitario: 450.0,
        stock: 80,
        stock_minimo: 10,
        proveedor_id: "prov_003",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "mat_005",
        nombre: "Sellador Estructural",
        descripcion: "Sellador estructural para vidrio",
        categoria: "selladores",
        material: "Silicón",
        unidad: "tubo",
        precio_unitario: 35.0,
        stock: 200,
        stock_minimo: 20,
        proveedor_id: "prov_003",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "mat_006",
        nombre: "Perfil Hoja PVC 60mm",
        descripcion: "Perfil de hoja para ventana PVC",
        categoria: "perfiles",
        material: "PVC",
        unidad: "ml",
        precio_unitario: 75.0,
        stock: 400,
        stock_minimo: 40,
        proveedor_id: "prov_001",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    await db.collection("materiales").insertMany(materiales)
    console.log("✅ Materiales insertados")

    // 8. PRODUCTOS
    const productos = [
      {
        _id: "prod_001",
        nombre: "Ventana PVC 1.20 x 1.50",
        descripcion: "Ventana de PVC blanco con vidrio templado",
        tipo_producto_id: "tipo_001",
        categoria: "ventanas",
        precio_base: 2500.0,
        activo: true,
        materiales: [
          { material_id: "mat_001", cantidad: 5.4, unidad: "ml" },
          { material_id: "mat_006", cantidad: 4.8, unidad: "ml" },
          { material_id: "mat_003", cantidad: 1.8, unidad: "m2" },
          { material_id: "mat_004", cantidad: 1, unidad: "juego" },
          { material_id: "mat_005", cantidad: 2, unidad: "tubo" },
        ],
        dimensiones: {
          ancho: 120,
          alto: 150,
          profundidad: 6,
        },
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "prod_002",
        nombre: "Ventana Aluminio 1.00 x 1.20",
        descripcion: "Ventana de aluminio natural con vidrio claro",
        tipo_producto_id: "tipo_001",
        categoria: "ventanas",
        precio_base: 1800.0,
        activo: true,
        materiales: [
          { material_id: "mat_002", cantidad: 4.4, unidad: "ml" },
          { material_id: "mat_003", cantidad: 1.2, unidad: "m2" },
          { material_id: "mat_004", cantidad: 1, unidad: "juego" },
        ],
        dimensiones: {
          ancho: 100,
          alto: 120,
          profundidad: 5,
        },
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "prod_003",
        nombre: "Puerta PVC 0.90 x 2.10",
        descripcion: "Puerta de PVC con vidrio templado",
        tipo_producto_id: "tipo_002",
        categoria: "puertas",
        precio_base: 3200.0,
        activo: true,
        materiales: [
          { material_id: "mat_001", cantidad: 6.0, unidad: "ml" },
          { material_id: "mat_006", cantidad: 5.4, unidad: "ml" },
          { material_id: "mat_003", cantidad: 1.5, unidad: "m2" },
          { material_id: "mat_004", cantidad: 1, unidad: "juego" },
        ],
        dimensiones: {
          ancho: 90,
          alto: 210,
          profundidad: 6,
        },
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "prod_004",
        nombre: "Barandal Aluminio por metro",
        descripcion: "Barandal de aluminio con vidrio templado",
        tipo_producto_id: "tipo_003",
        categoria: "barandales",
        precio_base: 850.0,
        activo: true,
        materiales: [
          { material_id: "mat_002", cantidad: 3.2, unidad: "ml" },
          { material_id: "mat_003", cantidad: 0.8, unidad: "m2" },
        ],
        dimensiones: {
          ancho: 100,
          alto: 100,
          profundidad: 2,
        },
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "prod_005",
        nombre: "Mampara Baño 0.80 x 1.80",
        descripcion: "Mampara para baño con vidrio templado",
        tipo_producto_id: "tipo_004",
        categoria: "mamparas",
        precio_base: 2800.0,
        activo: true,
        materiales: [
          { material_id: "mat_002", cantidad: 5.2, unidad: "ml" },
          { material_id: "mat_003", cantidad: 1.44, unidad: "m2" },
          { material_id: "mat_004", cantidad: 1, unidad: "juego" },
        ],
        dimensiones: {
          ancho: 80,
          alto: 180,
          profundidad: 6,
        },
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    await db.collection("productos").insertMany(productos)
    console.log("✅ Productos insertados")

    // 9. COTIZACIÓN DE EJEMPLO
    const cotizaciones = [
      {
        _id: "cot_001",
        numero: "COT-2024-001",
        cliente_id: "cliente_001",
        fecha: new Date(),
        vigencia: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        estado: "pendiente",
        productos: [
          {
            producto_id: "prod_001",
            cantidad: 2,
            precio_unitario: 2500.0,
            subtotal: 5000.0,
            observaciones: "Ventanas para sala",
          },
          {
            producto_id: "prod_002",
            cantidad: 1,
            precio_unitario: 1800.0,
            subtotal: 1800.0,
            observaciones: "Ventana para cocina",
          },
        ],
        subtotal: 6800.0,
        iva: 1088.0,
        total: 7888.0,
        observaciones: "Cotización para casa habitación",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    await db.collection("cotizaciones").insertMany(cotizaciones)
    console.log("✅ Cotización de ejemplo insertada")

    console.log("\n🎉 ¡Base de datos poblada exitosamente!")
    console.log("📊 Resumen de datos insertados:")
    console.log(`   • ${clientes.length} clientes`)
    console.log(`   • ${proveedores.length} proveedores`)
    console.log(`   • ${tiposProducto.length} tipos de producto`)
    console.log(`   • ${coloresPVC.length} colores PVC`)
    console.log(`   • ${coloresAluminio.length} colores aluminio`)
    console.log(`   • ${tiposVidrio.length} tipos de vidrio`)
    console.log(`   • ${materiales.length} materiales`)
    console.log(`   • ${productos.length} productos`)
    console.log(`   • ${cotizaciones.length} cotización de ejemplo`)
  } catch (error) {
    console.error("❌ Error al poblar la base de datos:", error)
  } finally {
    await client.close()
    console.log("🔌 Conexión cerrada")
  }
}

seedDatabase()
