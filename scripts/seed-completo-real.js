const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// Conectar a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cotizacion"

async function seedDatabase() {
  try {
    console.log("🔗 Conectando a MongoDB...")
    await mongoose.connect(MONGODB_URI)
    console.log("✅ Conectado a MongoDB")

    // Definir esquemas
    const proveedorSchema = new mongoose.Schema(
      {
        nombre: String,
        contacto: String,
        telefono: String,
        email: String,
        direccion: String,
        ciudad: String,
        pais: String,
        tipoMateriales: [String],
        descuentoGeneral: Number,
        estado: Boolean,
      },
      { timestamps: true },
    )

    const tipoProductoSchema = new mongoose.Schema(
      {
        nombre: String,
        descripcion: String,
        categoria: String,
        mano_obra_fabricacion: Number,
        mano_obra_instalacion: Number,
        estado: Boolean,
      },
      { timestamps: true },
    )

    const materialSchema = new mongoose.Schema(
      {
        nombre: String,
        descripcion: String,
        categoria: String,
        unidad: String,
        costo: Number,
        stock: Number,
        stockMinimo: Number,
        proveedor_id: mongoose.Schema.Types.ObjectId,
        contribuyeMalla: Boolean,
        estado: Boolean,
        variantes: [
          {
            tipo: String,
            nombre: String,
            costo_adicional: Number,
          },
        ],
      },
      { timestamps: true },
    )

    const productoSchema = new mongoose.Schema(
      {
        nombre: String,
        codigo: String,
        identificador: String,
        descripcion: String,
        tipo_producto_id: mongoose.Schema.Types.ObjectId,
        user_id: mongoose.Schema.Types.ObjectId,
        imagen: String,
        svg: String,
        proveedor_id: mongoose.Schema.Types.ObjectId,
        margen_ganancia: Number,
        estado: Boolean,
        materiales: [
          {
            material_id: mongoose.Schema.Types.ObjectId,
            formula: String,
          },
        ],
      },
      { timestamps: true },
    )

    const clienteSchema = new mongoose.Schema(
      {
        nombre: String,
        email: String,
        telefono: String,
        direccion: String,
        ciudad: String,
        estado: Boolean,
      },
      { timestamps: true },
    )

    const grupoSchema = new mongoose.Schema(
      {
        nombre: String,
        descripcion: String,
        cotizacion_id: mongoose.Schema.Types.ObjectId,
        orden: Number,
      },
      { timestamps: true },
    )

    const cotizacionSchema = new mongoose.Schema(
      {
        numero: String,
        cliente_id: mongoose.Schema.Types.ObjectId,
        user_id: mongoose.Schema.Types.ObjectId,
        subtotal: Number,
        impuestos: Number,
        total: Number,
        estado: String,
        fecha_vencimiento: Date,
        notas: String,
      },
      { timestamps: true },
    )

    const cotizacionItemSchema = new mongoose.Schema(
      {
        cotizacion_id: mongoose.Schema.Types.ObjectId,
        grupo_id: mongoose.Schema.Types.ObjectId,
        tipo: String, // producto, vidrio_templado, reparacion, libre
        producto_id: mongoose.Schema.Types.ObjectId,
        descripcion: String,
        cantidad: Number,
        ancho: Number,
        alto: Number,
        malla: Boolean,
        color_aluminio: String,
        color_pvc: String,
        tipo_vidrio: String,
        precio_unitario: Number,
        subtotal: Number,
        imagen: String,
        orden: Number,
      },
      { timestamps: true },
    )

    const reparacionSchema = new mongoose.Schema(
      {
        nombre: String,
        descripcion: String,
        categoria: String,
        precio_base: Number,
        tiempo_estimado: Number,
        estado: Boolean,
      },
      { timestamps: true },
    )

    const userSchema = new mongoose.Schema(
      {
        name: String,
        email: String,
        password: String,
        role: String,
        isActive: Boolean,
      },
      { timestamps: true },
    )

    // Crear modelos
    const Proveedor = mongoose.models.Proveedor || mongoose.model("Proveedor", proveedorSchema)
    const TipoProducto = mongoose.models.TipoProducto || mongoose.model("TipoProducto", tipoProductoSchema)
    const Material = mongoose.models.Material || mongoose.model("Material", materialSchema)
    const Producto = mongoose.models.Producto || mongoose.model("Producto", productoSchema)
    const Cliente = mongoose.models.Cliente || mongoose.model("Cliente", clienteSchema)
    const Grupo = mongoose.models.Grupo || mongoose.model("Grupo", grupoSchema)
    const Cotizacion = mongoose.models.Cotizacion || mongoose.model("Cotizacion", cotizacionSchema)
    const CotizacionItem = mongoose.models.CotizacionItem || mongoose.model("CotizacionItem", cotizacionItemSchema)
    const Reparacion = mongoose.models.Reparacion || mongoose.model("Reparacion", reparacionSchema)
    const User = mongoose.models.User || mongoose.model("User", userSchema)

    // Limpiar datos existentes
    console.log("🧹 Limpiando datos existentes...")
    await Proveedor.deleteMany({})
    await TipoProducto.deleteMany({})
    await Material.deleteMany({})
    await Producto.deleteMany({})
    await Cliente.deleteMany({})
    await Grupo.deleteMany({})
    await Cotizacion.deleteMany({})
    await CotizacionItem.deleteMany({})
    await Reparacion.deleteMany({})
    await User.deleteMany({})

    // Crear usuarios
    console.log("👤 Creando usuarios...")
    const hashedPassword = await bcrypt.hash("password", 10)

    const users = await User.insertMany([
      {
        name: "Administrador",
        email: "admin@test.com",
        password: hashedPassword,
        role: "admin",
        isActive: true,
      },
      {
        name: "Vendedor",
        email: "vendedor@test.com",
        password: hashedPassword,
        role: "vendedor",
        isActive: true,
      },
    ])

    console.log(`✅ ${users.length} usuarios creados`)

    // Crear proveedores
    console.log("🏢 Creando proveedores...")
    const proveedores = await Proveedor.insertMany([
      {
        nombre: "Naufar",
        contacto: "Juan Pérez",
        telefono: "555-0001",
        email: "contacto@naufar.com",
        direccion: "Av. Industrial 123",
        ciudad: "Guadalajara",
        pais: "México",
        tipoMateriales: ["aluminio", "vidrio"],
        descuentoGeneral: 5,
        estado: true,
      },
      {
        nombre: "Vitro",
        contacto: "María García",
        telefono: "555-0002",
        email: "ventas@vitro.com",
        direccion: "Blvd. Cristal 456",
        ciudad: "Monterrey",
        pais: "México",
        tipoMateriales: ["vidrio", "cristal"],
        descuentoGeneral: 3,
        estado: true,
      },
      {
        nombre: "Herrajes SA",
        contacto: "Carlos Rodríguez",
        telefono: "555-0003",
        email: "info@herrajessa.com",
        direccion: "Calle Industria 789",
        ciudad: "Ciudad de México",
        pais: "México",
        tipoMateriales: ["herrajes", "accesorios"],
        descuentoGeneral: 8,
        estado: true,
      },
    ])

    console.log(`✅ ${proveedores.length} proveedores creados`)

    // Crear tipos de producto
    console.log("📦 Creando tipos de producto...")
    const tiposProducto = await TipoProducto.insertMany([
      {
        nombre: "Ventana PVC",
        descripcion: "Ventanas de PVC con diferentes configuraciones",
        categoria: "ventanas",
        mano_obra_fabricacion: 150,
        mano_obra_instalacion: 200,
        estado: true,
      },
      {
        nombre: "Ventana Aluminio",
        descripcion: "Ventanas de aluminio con diferentes configuraciones",
        categoria: "ventanas",
        mano_obra_fabricacion: 180,
        mano_obra_instalacion: 220,
        estado: true,
      },
      {
        nombre: "Puerta PVC",
        descripcion: "Puertas de PVC con diferentes configuraciones",
        categoria: "puertas",
        mano_obra_fabricacion: 200,
        mano_obra_instalacion: 300,
        estado: true,
      },
      {
        nombre: "Vidrio Templado",
        descripcion: "Trabajos con vidrio templado como barandales y divisiones",
        categoria: "vidrios_templados",
        mano_obra_fabricacion: 250,
        mano_obra_instalacion: 350,
        estado: true,
      },
    ])

    console.log(`✅ ${tiposProducto.length} tipos de producto creados`)

    // Crear materiales
    console.log("🔧 Creando materiales...")
    const materiales = await Material.insertMany([
      {
        nombre: "Perfil PVC Ventana",
        descripcion: "Perfil principal para ventanas de PVC",
        categoria: "PVC",
        unidad: "ml",
        costo: 45.5,
        stock: 1000,
        stockMinimo: 100,
        proveedor_id: proveedores[0]._id,
        contribuyeMalla: false,
        estado: true,
        variantes: [
          { tipo: "color_pvc", nombre: "Blanco", costo_adicional: 0 },
          { tipo: "color_pvc", nombre: "Café", costo_adicional: 5 },
          { tipo: "color_pvc", nombre: "Negro", costo_adicional: 8 },
        ],
      },
      {
        nombre: "Perfil Aluminio Ventana",
        descripcion: "Perfil principal para ventanas de aluminio",
        categoria: "Aluminio",
        unidad: "ml",
        costo: 65.0,
        stock: 800,
        stockMinimo: 80,
        proveedor_id: proveedores[1]._id,
        contribuyeMalla: false,
        estado: true,
        variantes: [
          { tipo: "color_aluminio", nombre: "Natural", costo_adicional: 0 },
          { tipo: "color_aluminio", nombre: "Bronce", costo_adicional: 12 },
          { tipo: "color_aluminio", nombre: "Negro", costo_adicional: 15 },
        ],
      },
      {
        nombre: "Vidrio Claro 6mm",
        descripcion: "Vidrio transparente de 6mm de espesor",
        categoria: "Vidrio",
        unidad: "m2",
        costo: 180.0,
        stock: 500,
        stockMinimo: 50,
        proveedor_id: proveedores[1]._id,
        contribuyeMalla: false,
        estado: true,
        variantes: [
          { tipo: "tipo_vidrio", nombre: "Claro", costo_adicional: 0 },
          { tipo: "tipo_vidrio", nombre: "Bronce", costo_adicional: 25 },
          { tipo: "tipo_vidrio", nombre: "Azul", costo_adicional: 30 },
        ],
      },
      {
        nombre: "Vidrio Templado 10mm",
        descripcion: "Vidrio templado de 10mm para barandales",
        categoria: "Vidrio Templado",
        unidad: "m2",
        costo: 650.0,
        stock: 200,
        stockMinimo: 20,
        proveedor_id: proveedores[1]._id,
        contribuyeMalla: false,
        estado: true,
        variantes: [
          { tipo: "tipo_vidrio", nombre: "Claro", costo_adicional: 0 },
          { tipo: "tipo_vidrio", nombre: "Esmerilado", costo_adicional: 120 },
          { tipo: "tipo_vidrio", nombre: "Satinado", costo_adicional: 150 },
        ],
      },
      {
        nombre: "Herraje para Barandal",
        descripcion: "Kit de herrajes para barandal de vidrio templado",
        categoria: "Herrajes",
        unidad: "juego",
        costo: 850.0,
        stock: 50,
        stockMinimo: 5,
        proveedor_id: proveedores[2]._id,
        contribuyeMalla: false,
        estado: true,
        variantes: [
          { tipo: "otro", nombre: "Acero Inoxidable", costo_adicional: 0 },
          { tipo: "otro", nombre: "Cromado", costo_adicional: 200 },
        ],
      },
      {
        nombre: "Malla Mosquitera",
        descripcion: "Malla para mosquiteros",
        categoria: "Accesorios",
        unidad: "m2",
        costo: 25.0,
        stock: 200,
        stockMinimo: 20,
        proveedor_id: proveedores[2]._id,
        contribuyeMalla: true,
        estado: true,
        variantes: [
          { tipo: "otro", nombre: "Estándar", costo_adicional: 0 },
          { tipo: "otro", nombre: "Reforzada", costo_adicional: 8 },
        ],
      },
    ])

    console.log(`✅ ${materiales.length} materiales creados`)

    // Crear productos
    console.log("🏗️ Creando productos...")
    const productos = await Producto.insertMany([
      {
        nombre: "Ventana PVC 2 Hojas",
        codigo: "PROD-001",
        identificador: "VEN-PVC-2H",
        descripcion: "Ventana de PVC con 2 hojas corredizas",
        tipo_producto_id: tiposProducto[0]._id,
        user_id: users[0]._id,
        imagen: "/placeholder.svg?height=200&width=200",
        svg: '<rect width="100" height="60" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>',
        proveedor_id: proveedores[0]._id,
        margen_ganancia: 35,
        estado: true,
        materiales: [
          {
            material_id: materiales[0]._id,
            formula: "REDONDEAR.MENOS((ancho + alto) * 2 / 100, 0) * 100",
          },
          {
            material_id: materiales[2]._id,
            formula: "REDONDEAR.MENOS(ancho * alto / 10000, 2)",
          },
          {
            material_id: materiales[5]._id,
            formula: "SI(malla = 1, REDONDEAR.MENOS(ancho * alto / 10000, 2), 0)",
          },
        ],
      },
      {
        nombre: "Ventana Aluminio 3 Hojas",
        codigo: "PROD-002",
        identificador: "VEN-ALU-3H",
        descripcion: "Ventana de aluminio con 3 hojas corredizas",
        tipo_producto_id: tiposProducto[1]._id,
        user_id: users[0]._id,
        imagen: "/placeholder.svg?height=200&width=200",
        svg: '<rect width="120" height="60" fill="#d1d5db" stroke="#374151" stroke-width="2"/>',
        proveedor_id: proveedores[1]._id,
        margen_ganancia: 40,
        estado: true,
        materiales: [
          {
            material_id: materiales[1]._id,
            formula: "REDONDEAR.MENOS((ancho + alto) * 2.5 / 100, 0) * 100",
          },
          {
            material_id: materiales[2]._id,
            formula: "REDONDEAR.MENOS(ancho * alto / 10000, 2)",
          },
        ],
      },
      {
        nombre: "Puerta PVC Sencilla",
        codigo: "PROD-003",
        identificador: "PTA-PVC-S",
        descripcion: "Puerta de PVC sencilla con vidrio",
        tipo_producto_id: tiposProducto[2]._id,
        user_id: users[0]._id,
        imagen: "/placeholder.svg?height=200&width=200",
        svg: '<rect width="80" height="200" fill="#f3f4f6" stroke="#374151" stroke-width="2"/>',
        proveedor_id: proveedores[0]._id,
        margen_ganancia: 45,
        estado: true,
        materiales: [
          {
            material_id: materiales[0]._id,
            formula: "REDONDEAR.MENOS((ancho + alto) * 2.2 / 100, 0) * 100",
          },
          {
            material_id: materiales[2]._id,
            formula: "REDONDEAR.MENOS(ancho * alto * 0.6 / 10000, 2)",
          },
        ],
      },
      {
        nombre: "Barandal Vidrio Templado",
        codigo: "PROD-004",
        identificador: "BAR-VT",
        descripcion: "Barandal de vidrio templado con herrajes",
        tipo_producto_id: tiposProducto[3]._id,
        user_id: users[0]._id,
        imagen: "/placeholder.svg?height=200&width=200",
        svg: '<rect width="150" height="40" fill="#d1fae5" stroke="#374151" stroke-width="2"/>',
        proveedor_id: proveedores[1]._id,
        margen_ganancia: 50,
        estado: true,
        materiales: [
          {
            material_id: materiales[3]._id,
            formula: "REDONDEAR.MENOS(ancho * alto / 10000, 2)",
          },
          {
            material_id: materiales[4]._id,
            formula: "REDONDEAR.MENOS(ancho / 100, 0) + 1",
          },
        ],
      },
    ])

    console.log(`✅ ${productos.length} productos creados`)

    // Crear reparaciones
    console.log("🔨 Creando reparaciones...")
    const reparaciones = await Reparacion.insertMany([
      {
        nombre: "Cambio de Vidrio",
        descripcion: "Cambio de vidrio roto en ventana existente",
        categoria: "Reparación Vidrios",
        precio_base: 350,
        tiempo_estimado: 2,
        estado: true,
      },
      {
        nombre: "Ajuste de Herrajes",
        descripcion: "Ajuste y lubricación de herrajes en ventanas o puertas",
        categoria: "Reparación Herrajes",
        precio_base: 180,
        tiempo_estimado: 1,
        estado: true,
      },
      {
        nombre: "Sellado de Filtraciones",
        descripcion: "Sellado de filtraciones de agua en ventanas o puertas",
        categoria: "Impermeabilización",
        precio_base: 250,
        tiempo_estimado: 1.5,
        estado: true,
      },
    ])

    console.log(`✅ ${reparaciones.length} reparaciones creadas`)

    // Crear clientes
    console.log("👥 Creando clientes...")
    const clientes = await Cliente.insertMany([
      {
        nombre: "Juan Pérez",
        email: "juan@example.com",
        telefono: "555-1234",
        direccion: "Calle Principal 123",
        ciudad: "Ciudad de México",
        estado: true,
      },
      {
        nombre: "Constructora Moderna SA",
        email: "contacto@constructoramoderna.com",
        telefono: "555-5678",
        direccion: "Av. Reforma 456",
        ciudad: "Guadalajara",
        estado: true,
      },
      {
        nombre: "María González",
        email: "maria@example.com",
        telefono: "555-9012",
        direccion: "Blvd. Las Palmas 789",
        ciudad: "Monterrey",
        estado: true,
      },
    ])

    console.log(`✅ ${clientes.length} clientes creados`)

    // Crear cotización de ejemplo
    console.log("📝 Creando cotización de ejemplo...")
    const cotizacion = await Cotizacion.create({
      numero: "COT-2024-001",
      cliente_id: clientes[0]._id,
      user_id: users[1]._id,
      subtotal: 0,
      impuestos: 0,
      total: 0,
      estado: "borrador",
      fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notas: "Cotización de ejemplo con múltiples productos y grupos",
    })

    // Crear grupos
    console.log("📋 Creando grupos...")
    const grupos = await Grupo.insertMany([
      {
        nombre: "Fachada Principal",
        descripcion: "Elementos para la fachada principal",
        cotizacion_id: cotizacion._id,
        orden: 1,
      },
      {
        nombre: "Interior Planta Baja",
        descripcion: "Elementos para el interior de la planta baja",
        cotizacion_id: cotizacion._id,
        orden: 2,
      },
    ])

    console.log(`✅ ${grupos.length} grupos creados`)

    // Crear items de cotización
    console.log("📊 Creando items de cotización...")
    const items = await CotizacionItem.insertMany([
      {
        cotizacion_id: cotizacion._id,
        grupo_id: grupos[0]._id,
        tipo: "producto",
        producto_id: productos[0]._id,
        descripcion: "Ventana PVC 2 Hojas 120x100cm",
        cantidad: 2,
        ancho: 120,
        alto: 100,
        malla: true,
        color_pvc: "Blanco",
        precio_unitario: 3500,
        subtotal: 7000,
        imagen: "/placeholder.svg?height=200&width=200",
        orden: 1,
      },
      {
        cotizacion_id: cotizacion._id,
        grupo_id: grupos[0]._id,
        tipo: "producto",
        producto_id: productos[1]._id,
        descripcion: "Ventana Aluminio 3 Hojas 180x120cm",
        cantidad: 1,
        ancho: 180,
        alto: 120,
        malla: false,
        color_aluminio: "Natural",
        precio_unitario: 4800,
        subtotal: 4800,
        imagen: "/placeholder.svg?height=200&width=200",
        orden: 2,
      },
      {
        cotizacion_id: cotizacion._id,
        grupo_id: grupos[1]._id,
        tipo: "producto",
        producto_id: productos[2]._id,
        descripcion: "Puerta PVC Sencilla 90x210cm",
        cantidad: 1,
        ancho: 90,
        alto: 210,
        color_pvc: "Café",
        precio_unitario: 6200,
        subtotal: 6200,
        imagen: "/placeholder.svg?height=200&width=200",
        orden: 1,
      },
      {
        cotizacion_id: cotizacion._id,
        grupo_id: grupos[1]._id,
        tipo: "vidrio_templado",
        descripcion: "Barandal de Vidrio Templado 250x90cm",
        cantidad: 1,
        ancho: 250,
        alto: 90,
        tipo_vidrio: "Claro",
        precio_unitario: 8500,
        subtotal: 8500,
        imagen: "/placeholder.svg?height=200&width=200",
        orden: 2,
      },
      {
        cotizacion_id: cotizacion._id,
        grupo_id: grupos[1]._id,
        tipo: "reparacion",
        descripcion: "Ajuste de Herrajes en ventanas existentes",
        cantidad: 3,
        precio_unitario: 180,
        subtotal: 540,
        orden: 3,
      },
      {
        cotizacion_id: cotizacion._id,
        grupo_id: grupos[0]._id,
        tipo: "libre",
        descripcion: "Instalación y materiales adicionales",
        cantidad: 1,
        precio_unitario: 1200,
        subtotal: 1200,
        orden: 3,
      },
    ])

    console.log(`✅ ${items.length} items de cotización creados`)

    // Actualizar totales de la cotización
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const impuestos = subtotal * 0.16
    const total = subtotal + impuestos

    await Cotizacion.updateOne(
      { _id: cotizacion._id },
      {
        subtotal: subtotal,
        impuestos: impuestos,
        total: total,
      },
    )

    console.log("✅ Totales de cotización actualizados")

    console.log("\n🎉 ¡Datos de ejemplo creados exitosamente!")
    console.log("\n📊 Resumen:")
    console.log(`- Usuarios: ${users.length}`)
    console.log(`- Proveedores: ${proveedores.length}`)
    console.log(`- Tipos de Producto: ${tiposProducto.length}`)
    console.log(`- Materiales: ${materiales.length}`)
    console.log(`- Productos: ${productos.length}`)
    console.log(`- Reparaciones: ${reparaciones.length}`)
    console.log(`- Clientes: ${clientes.length}`)
    console.log(`- Grupos: ${grupos.length}`)
    console.log(`- Items de Cotización: ${items.length}`)
    console.log("\n🔑 Credenciales de acceso:")
    console.log("- Admin: admin@test.com / password")
    console.log("- Vendedor: vendedor@test.com / password")
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    // Cerrar conexión
    await mongoose.disconnect()
    console.log("🔌 Conexión cerrada")
  }
}

// Ejecutar la función
seedDatabase()
