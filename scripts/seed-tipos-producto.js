const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cotizacion"

const tiposProducto = [
  {
    nombre: "Ventana Corrediza",
    descripcion: "Ventanas con sistema de deslizamiento horizontal",
    categoria: "Ventanas",
    isActive: true,
  },
  {
    nombre: "Ventana Abatible",
    descripcion: "Ventanas con apertura hacia adentro o afuera",
    categoria: "Ventanas",
    isActive: true,
  },
  {
    nombre: "Ventana Proyectante",
    descripcion: "Ventanas con apertura proyectante",
    categoria: "Ventanas",
    isActive: true,
  },
  {
    nombre: "Ventana Fija",
    descripcion: "Ventanas sin apertura, solo para iluminación",
    categoria: "Ventanas",
    isActive: true,
  },
  {
    nombre: "Puerta Corrediza",
    descripcion: "Puertas con sistema de deslizamiento",
    categoria: "Puertas",
    isActive: true,
  },
  {
    nombre: "Puerta Abatible",
    descripcion: "Puertas con apertura tradicional",
    categoria: "Puertas",
    isActive: true,
  },
  {
    nombre: "Puerta Plegable",
    descripcion: "Puertas con sistema plegable",
    categoria: "Puertas",
    isActive: true,
  },
  {
    nombre: "Barandal Recto",
    descripcion: "Barandales en línea recta",
    categoria: "Barandales",
    isActive: true,
  },
  {
    nombre: "Barandal Curvo",
    descripcion: "Barandales con curvas",
    categoria: "Barandales",
    isActive: true,
  },
  {
    nombre: "División Oficina",
    descripcion: "Divisiones para espacios de oficina",
    categoria: "Divisiones",
    isActive: true,
  },
  {
    nombre: "Mampara Baño",
    descripcion: "Divisiones para baños",
    categoria: "Divisiones",
    isActive: true,
  },
]

const modelosPorTipo = {
  "Ventana Corrediza": [
    { nombre: "Modelo Económico", descripcion: "Ventana corrediza básica", codigo: "VCE-001" },
    { nombre: "Modelo Estándar", descripcion: "Ventana corrediza estándar", codigo: "VCS-001" },
    { nombre: "Modelo Premium", descripcion: "Ventana corrediza premium", codigo: "VCP-001" },
  ],
  "Ventana Abatible": [
    { nombre: "Abatible Simple", descripcion: "Ventana abatible de una hoja", codigo: "VAS-001" },
    { nombre: "Abatible Doble", descripcion: "Ventana abatible de dos hojas", codigo: "VAD-001" },
  ],
  "Ventana Proyectante": [
    { nombre: "Proyectante Básico", descripcion: "Ventana proyectante básica", codigo: "VPB-001" },
    { nombre: "Proyectante Reforzado", descripcion: "Ventana proyectante reforzada", codigo: "VPR-001" },
  ],
  "Puerta Corrediza": [
    { nombre: "Corrediza Estándar", descripcion: "Puerta corrediza estándar", codigo: "PCE-001" },
    { nombre: "Corrediza Premium", descripcion: "Puerta corrediza premium", codigo: "PCP-001" },
  ],
  "Puerta Abatible": [
    { nombre: "Abatible Estándar", descripcion: "Puerta abatible estándar", codigo: "PAE-001" },
    { nombre: "Abatible Reforzada", descripcion: "Puerta abatible reforzada", codigo: "PAR-001" },
  ],
  "Barandal Recto": [
    { nombre: "Barandal Básico", descripcion: "Barandal recto básico", codigo: "BRB-001" },
    { nombre: "Barandal Decorativo", descripcion: "Barandal recto decorativo", codigo: "BRD-001" },
  ],
}

async function seedTiposProducto() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("🔗 Conectado a MongoDB - Base de datos: cotizacion")

    const db = client.db("cotizacion")

    // Seed Tipos de Producto
    const tiposCollection = db.collection("tipoproductos")
    await tiposCollection.deleteMany({})
    const resultTipos = await tiposCollection.insertMany(
      tiposProducto.map((tipo) => ({
        ...tipo,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    )
    console.log(`✅ ${resultTipos.insertedCount} tipos de producto insertados`)

    // Obtener los IDs insertados
    const tiposInsertados = await tiposCollection.find({}).toArray()

    // Seed Modelos de Producto
    const modelosCollection = db.collection("tipoproductomodelos")
    await modelosCollection.deleteMany({})

    const modelosParaInsertar = []

    tiposInsertados.forEach((tipo) => {
      const modelos = modelosPorTipo[tipo.nombre] || []
      modelos.forEach((modelo) => {
        modelosParaInsertar.push({
          ...modelo,
          tipo_producto_id: tipo._id,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      })
    })

    if (modelosParaInsertar.length > 0) {
      const resultModelos = await modelosCollection.insertMany(modelosParaInsertar)
      console.log(`✅ ${resultModelos.insertedCount} modelos de producto insertados`)
    }

    console.log("\n📊 === TIPOS DE PRODUCTO CREADOS ===")
    const categorias = {}
    tiposInsertados.forEach((tipo) => {
      if (!categorias[tipo.categoria]) {
        categorias[tipo.categoria] = []
      }
      categorias[tipo.categoria].push(tipo.nombre)
    })

    Object.keys(categorias).forEach((categoria) => {
      console.log(`\n🏷️ ${categoria}:`)
      categorias[categoria].forEach((nombre) => {
        const modelosCount = modelosPorTipo[nombre]?.length || 0
        console.log(`  • ${nombre} (${modelosCount} modelos)`)
      })
    })

    console.log(`\n🎯 Total: ${tiposInsertados.length} tipos de producto con ${modelosParaInsertar.length} modelos`)
  } catch (error) {
    console.error("❌ Error seeding tipos de producto:", error)
  } finally {
    await client.close()
    console.log("🔌 Conexión cerrada")
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  seedTiposProducto()
}

module.exports = { seedTiposProducto }
