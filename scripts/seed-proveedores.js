const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cotizacion"

const proveedores = [
  {
    nombre: "Naufar",
    contacto: "Juan Pérez",
    telefono: "+52 33 1234-5678",
    email: "ventas@naufar.com.mx",
    direccion: "Av. Industrial 123",
    ciudad: "Guadalajara",
    pais: "México",
    tipoMateriales: ["PVC", "Aluminio"],
    descuentoGeneral: 5,
    isActive: true,
  },
  {
    nombre: "Opecem",
    contacto: "María González",
    telefono: "+52 33 2345-6789",
    email: "contacto@opecem.com.mx",
    direccion: "Calle Cemento 456",
    ciudad: "Guadalajara",
    pais: "México",
    tipoMateriales: ["Cemento", "Construcción"],
    descuentoGeneral: 3,
    isActive: true,
  },
  {
    nombre: "Alupac",
    contacto: "Carlos Rodríguez",
    telefono: "+52 33 3456-7890",
    email: "ventas@alupac.com.mx",
    direccion: "Zona Industrial Norte 789",
    ciudad: "Guadalajara",
    pais: "México",
    tipoMateriales: ["Aluminio", "Perfiles"],
    descuentoGeneral: 7,
    isActive: true,
  },
  {
    nombre: "Extralum",
    contacto: "Ana Martínez",
    telefono: "+52 33 4567-8901",
    email: "info@extralum.com.mx",
    direccion: "Parque Industrial Sur 321",
    ciudad: "Guadalajara",
    pais: "México",
    tipoMateriales: ["Aluminio", "Extrusión"],
    descuentoGeneral: 6,
    isActive: true,
  },
  {
    nombre: "Ferruperfiles",
    contacto: "Roberto Silva",
    telefono: "+52 33 5678-9012",
    email: "ventas@ferruperfiles.com.mx",
    direccion: "Av. Ferretería 654",
    ciudad: "Guadalajara",
    pais: "México",
    tipoMateriales: ["Perfiles", "Herrajes"],
    descuentoGeneral: 4,
    isActive: true,
  },
  {
    nombre: "Serviport",
    contacto: "Laura Jiménez",
    telefono: "+52 33 6789-0123",
    email: "contacto@serviport.com.mx",
    direccion: "Puerto Industrial 987",
    ciudad: "Guadalajara",
    pais: "México",
    tipoMateriales: ["Importación", "Logística"],
    descuentoGeneral: 2,
    isActive: true,
  },
  {
    nombre: "Arqui Alum",
    contacto: "Miguel Torres",
    telefono: "+52 33 7890-1234",
    email: "proyectos@arquialum.com.mx",
    direccion: "Centro Arquitectónico 147",
    ciudad: "Guadalajara",
    pais: "México",
    tipoMateriales: ["Aluminio", "Arquitectura"],
    descuentoGeneral: 8,
    isActive: true,
  },
]

async function seedProveedores() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("🔗 Conectado a MongoDB - Base de datos: cotizacion")

    const db = client.db("cotizacion")
    const collection = db.collection("proveedores")

    // Limpiar colección existente
    await collection.deleteMany({})
    console.log("🗑️ Colección de proveedores limpiada")

    // Insertar nuevos proveedores
    const result = await collection.insertMany(
      proveedores.map((proveedor) => ({
        ...proveedor,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    )

    console.log(`✅ ${result.insertedCount} proveedores insertados exitosamente`)

    // Mostrar proveedores insertados
    const insertedProveedores = await collection.find({}).toArray()
    console.log("\n📊 Proveedores insertados:")
    insertedProveedores.forEach((proveedor) => {
      console.log(
        `  • ${proveedor.nombre} - ${proveedor.tipoMateriales.join(", ")} (Descuento: ${proveedor.descuentoGeneral}%)`,
      )
    })

    console.log(`\n🎯 Total de proveedores en la base de datos: ${insertedProveedores.length}`)
  } catch (error) {
    console.error("❌ Error seeding proveedores:", error)
  } finally {
    await client.close()
    console.log("🔌 Conexión cerrada")
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  seedProveedores()
}

module.exports = { seedProveedores }
