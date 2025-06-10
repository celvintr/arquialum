const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// Conectar a MongoDB
mongoose.connect("mongodb://localhost:27017/cotizacion")

// Esquemas simplificados para el seeding
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const MaterialSchema = new mongoose.Schema(
  {
    nombre: String,
    descripcion: String,
    categoria: String,
    costo: Number,
    unidadMedida: String,
    formula: String,
    proveedor: {
      id: mongoose.Types.ObjectId,
      nombre: String,
      descuento: Number,
    },
    variantes: [
      {
        tipo: String,
        nombre: String,
        codigo: String,
        precioUnitario: Number,
        descuento: Number,
        isActive: Boolean,
      },
    ],
    stock: Number,
    stockMinimo: Number,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const ProductoSchema = new mongoose.Schema(
  {
    nombre: String,
    descripcion: String,
    codigo: String,
    categoria: String,
    materiales: [
      {
        materialId: mongoose.Types.ObjectId,
        nombre: String,
        formula: String,
        unidadMedida: String,
        costo: Number,
      },
    ],
    precioBase: Number,
    margenGanancia: Number,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const CotizacionSchema = new mongoose.Schema(
  {
    numero: String,
    cliente: {
      id: mongoose.Types.ObjectId,
      nombre: String,
      email: String,
      telefono: String,
    },
    vendedor: {
      id: mongoose.Types.ObjectId,
      nombre: String,
      email: String,
    },
    productos: [
      {
        productoId: mongoose.Types.ObjectId,
        nombre: String,
        cantidad: Number,
        precioUnitario: Number,
        subtotal: Number,
      },
    ],
    subtotal: Number,
    impuestos: Number,
    total: Number,
    estado: String,
    fechaVencimiento: Date,
  },
  { timestamps: true },
)

const User = mongoose.model("User", UserSchema)
const Material = mongoose.model("Material", MaterialSchema)
const Producto = mongoose.model("Producto", ProductoSchema)
const Cotizacion = mongoose.model("Cotizacion", CotizacionSchema)

async function seedDatabase() {
  try {
    console.log("🌱 Iniciando seeding de la base de datos...")

    // Limpiar datos existentes
    await User.deleteMany({})
    await Material.deleteMany({})
    await Producto.deleteMany({})
    await Cotizacion.deleteMany({})

    console.log("🗑️ Datos existentes eliminados")

    // Crear usuarios
    const hashedPassword = await bcrypt.hash("password", 12)

    const users = await User.insertMany([
      {
        name: "Administrador",
        email: "admin@test.com",
        password: hashedPassword,
        role: "admin",
      },
      {
        name: "Vendedor 1",
        email: "vendedor@test.com",
        password: hashedPassword,
        role: "vendedor",
      },
      {
        name: "Usuario Test",
        email: "user@test.com",
        password: hashedPassword,
        role: "user",
      },
    ])

    console.log("👥 Usuarios creados:", users.length)

    // Crear materiales
    const materiales = await Material.insertMany([
      {
        nombre: "Perfil de Aluminio 6063",
        descripcion: "Perfil de aluminio extruido para ventanas",
        categoria: "Perfiles",
        costo: 85.5,
        unidadMedida: "metro",
        formula: "ancho * 2 + alto * 2",
        proveedor: {
          id: new mongoose.Types.ObjectId(),
          nombre: "Naufar",
          descuento: 5,
        },
        variantes: [
          {
            tipo: "color_aluminio",
            nombre: "Natural",
            codigo: "NAT",
            precioUnitario: 0,
            descuento: 0,
            isActive: true,
          },
          {
            tipo: "color_aluminio",
            nombre: "Bronce",
            codigo: "BRZ",
            precioUnitario: 15,
            descuento: 0,
            isActive: true,
          },
        ],
        stock: 500,
        stockMinimo: 50,
      },
      {
        nombre: "Vidrio Templado 6mm",
        descripcion: "Vidrio templado transparente",
        categoria: "Vidrios",
        costo: 120,
        unidadMedida: "m2",
        formula: "ancho * alto",
        proveedor: {
          id: new mongoose.Types.ObjectId(),
          nombre: "Vitro",
          descuento: 3,
        },
        variantes: [
          {
            tipo: "tipo_vidrio",
            nombre: "Transparente",
            codigo: "TRANS",
            precioUnitario: 0,
            descuento: 0,
            isActive: true,
          },
          {
            tipo: "tipo_vidrio",
            nombre: "Bronce",
            codigo: "BRZ",
            precioUnitario: 25,
            descuento: 0,
            isActive: true,
          },
        ],
        stock: 100,
        stockMinimo: 10,
      },
      {
        nombre: "Herraje de Ventana",
        descripcion: "Kit completo de herrajes para ventana",
        categoria: "Herrajes",
        costo: 450,
        unidadMedida: "pieza",
        formula: "1",
        proveedor: {
          id: new mongoose.Types.ObjectId(),
          nombre: "Herrajes SA",
          descuento: 8,
        },
        variantes: [],
        stock: 200,
        stockMinimo: 20,
      },
    ])

    console.log("🔧 Materiales creados:", materiales.length)

    // Crear productos
    const productos = await Producto.insertMany([
      {
        nombre: "Ventana Corrediza 1.20 x 1.00",
        descripcion: "Ventana corrediza de aluminio con vidrio templado",
        codigo: "PROD-0001",
        categoria: "Ventanas",
        materiales: [
          {
            materialId: materiales[0]._id,
            nombre: "Perfil de Aluminio 6063",
            formula: "ancho * 2 + alto * 2",
            unidadMedida: "metro",
            costo: 85.5,
          },
          {
            materialId: materiales[1]._id,
            nombre: "Vidrio Templado 6mm",
            formula: "ancho * alto",
            unidadMedida: "m2",
            costo: 120,
          },
          {
            materialId: materiales[2]._id,
            nombre: "Herraje de Ventana",
            formula: "1",
            unidadMedida: "pieza",
            costo: 450,
          },
        ],
        precioBase: 2500,
        margenGanancia: 35,
      },
      {
        nombre: "Puerta de Aluminio 0.90 x 2.10",
        descripcion: "Puerta de aluminio con vidrio",
        codigo: "PROD-0002",
        categoria: "Puertas",
        materiales: [
          {
            materialId: materiales[0]._id,
            nombre: "Perfil de Aluminio 6063",
            formula: "ancho * 2 + alto * 2",
            unidadMedida: "metro",
            costo: 85.5,
          },
          {
            materialId: materiales[1]._id,
            nombre: "Vidrio Templado 6mm",
            formula: "ancho * alto * 0.7",
            unidadMedida: "m2",
            costo: 120,
          },
        ],
        precioBase: 3200,
        margenGanancia: 40,
      },
    ])

    console.log("📦 Productos creados:", productos.length)

    // Crear cotizaciones de ejemplo
    const cotizaciones = await Cotizacion.insertMany([
      {
        numero: "COT-2024-0001",
        cliente: {
          id: new mongoose.Types.ObjectId(),
          nombre: "Juan Pérez",
          email: "juan@email.com",
          telefono: "555-1234",
        },
        vendedor: {
          id: users[1]._id,
          nombre: users[1].name,
          email: users[1].email,
        },
        productos: [
          {
            productoId: productos[0]._id,
            nombre: productos[0].nombre,
            cantidad: 2,
            precioUnitario: 3375,
            subtotal: 6750,
          },
        ],
        subtotal: 6750,
        impuestos: 1080,
        total: 7830,
        estado: "enviada",
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        numero: "COT-2024-0002",
        cliente: {
          id: new mongoose.Types.ObjectId(),
          nombre: "María García",
          email: "maria@email.com",
          telefono: "555-5678",
        },
        vendedor: {
          id: users[1]._id,
          nombre: users[1].name,
          email: users[1].email,
        },
        productos: [
          {
            productoId: productos[1]._id,
            nombre: productos[1].nombre,
            cantidad: 1,
            precioUnitario: 4480,
            subtotal: 4480,
          },
        ],
        subtotal: 4480,
        impuestos: 716.8,
        total: 5196.8,
        estado: "aprobada",
        fechaVencimiento: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      },
      {
        numero: "COT-2024-0003",
        cliente: {
          id: new mongoose.Types.ObjectId(),
          nombre: "Carlos López",
          email: "carlos@email.com",
          telefono: "555-9012",
        },
        vendedor: {
          id: users[0]._id,
          nombre: users[0].name,
          email: users[0].email,
        },
        productos: [
          {
            productoId: productos[0]._id,
            nombre: productos[0].nombre,
            cantidad: 4,
            precioUnitario: 3375,
            subtotal: 13500,
          },
          {
            productoId: productos[1]._id,
            nombre: productos[1].nombre,
            cantidad: 2,
            precioUnitario: 4480,
            subtotal: 8960,
          },
        ],
        subtotal: 22460,
        impuestos: 3593.6,
        total: 26053.6,
        estado: "borrador",
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ])

    console.log("📋 Cotizaciones creadas:", cotizaciones.length)

    console.log("✅ Seeding completado exitosamente!")
    console.log("📊 Resumen:")
    console.log(`   - Usuarios: ${users.length}`)
    console.log(`   - Materiales: ${materiales.length}`)
    console.log(`   - Productos: ${productos.length}`)
    console.log(`   - Cotizaciones: ${cotizaciones.length}`)
    console.log("")
    console.log("🔑 Credenciales de prueba:")
    console.log("   Admin: admin@test.com / password")
    console.log("   Vendedor: vendedor@test.com / password")
    console.log("   Usuario: user@test.com / password")
  } catch (error) {
    console.error("❌ Error durante el seeding:", error)
  } finally {
    mongoose.connection.close()
  }
}

seedDatabase()
