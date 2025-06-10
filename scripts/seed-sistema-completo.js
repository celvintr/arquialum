const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cotizacion"

async function seedSistemaCompleto() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("🔗 Conectado a MongoDB")

    const db = client.db()

    // Limpiar colecciones existentes
    console.log("🧹 Limpiando colecciones...")
    await db.collection("proveedores").deleteMany({})
    await db.collection("materialesbase").deleteMany({})
    await db.collection("materialesproveedores").deleteMany({})
    await db.collection("variantesmateriales").deleteMany({})
    await db.collection("productos").deleteMany({})
    await db.collection("productomaterialformulas").deleteMany({})

    // 1. PROVEEDORES
    console.log("👥 Creando proveedores...")
    const proveedores = [
      {
        _id: "prov_naufar",
        nombre: "Naufar",
        contacto: "Juan Pérez",
        telefono: "555-0101",
        email: "ventas@naufar.com",
        especialidad: "Perfiles PVC y Aluminio",
        descuento_general: 5,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "prov_oepcem",
        nombre: "Oepcem",
        contacto: "María García",
        telefono: "555-0102",
        email: "cotizaciones@oepcem.com",
        especialidad: "Vidrios y Cristales",
        descuento_general: 3,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "prov_ferruperfiles",
        nombre: "Ferruperfiles",
        contacto: "Carlos López",
        telefono: "555-0103",
        email: "ventas@ferruperfiles.com",
        especialidad: "Herrajes y Accesorios",
        descuento_general: 7,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "prov_alupac",
        nombre: "Alupac",
        contacto: "Ana Martínez",
        telefono: "555-0104",
        email: "comercial@alupac.com",
        especialidad: "Perfiles de Aluminio Premium",
        descuento_general: 4,
        activo: true,
        created_at: new Date(),
      },
    ]
    await db.collection("proveedores").insertMany(proveedores)

    // 2. MATERIALES BASE
    console.log("📦 Creando materiales base...")
    const materialesBase = [
      {
        _id: "mat_perfil_pvc_ventana",
        nombre: "Perfil PVC para Ventana",
        descripcion: "Perfil principal para marcos de ventanas PVC",
        categoria: "Perfil PVC",
        tipo_material: "PVC",
        unidad_medida: "metro",
        unidad_medida_produccion: "metro",
        contribuye_a_malla: false,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "mat_perfil_aluminio_ventana",
        nombre: "Perfil Aluminio para Ventana",
        descripcion: "Perfil principal para marcos de ventanas aluminio",
        categoria: "Perfil Aluminio",
        tipo_material: "Aluminio",
        unidad_medida: "metro",
        unidad_medida_produccion: "metro",
        contribuye_a_malla: false,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "mat_vidrio_claro",
        nombre: "Vidrio Claro",
        descripcion: "Vidrio transparente para ventanas",
        categoria: "Vidrio",
        tipo_material: "Vidrio",
        unidad_medida: "m2",
        unidad_medida_produccion: "m2",
        contribuye_a_malla: false,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "mat_herraje_ventana",
        nombre: "Herraje para Ventana",
        descripcion: "Kit de herrajes para ventanas",
        categoria: "Herraje",
        tipo_material: "Herraje",
        unidad_medida: "juego",
        unidad_medida_produccion: "juego",
        contribuye_a_malla: false,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "mat_sellador",
        nombre: "Sellador de Silicón",
        descripcion: "Sellador para acabados",
        categoria: "Sellador",
        tipo_material: "Sellador",
        unidad_medida: "tubo",
        unidad_medida_produccion: "metro",
        contribuye_a_malla: false,
        activo: true,
        created_at: new Date(),
      },
    ]
    await db.collection("materialesbase").insertMany(materialesBase)

    // 3. MATERIALES POR PROVEEDOR
    console.log("🏪 Creando materiales por proveedor...")
    const materialesProveedores = [
      // Perfil PVC - Naufar
      {
        _id: "mp_naufar_pvc_vent",
        material_base_id: "mat_perfil_pvc_ventana",
        proveedor_id: "prov_naufar",
        codigo_proveedor: "NAU-PVC-V001",
        nombre_proveedor: "Perfil PVC Ventana Serie 60",
        precio_unitario: 85.5,
        descuento: 5,
        precio_final: 81.23,
        disponible: true,
        tiempo_entrega_dias: 3,
        activo: true,
        created_at: new Date(),
      },
      // Perfil PVC - Oepcem
      {
        _id: "mp_oepcem_pvc_vent",
        material_base_id: "mat_perfil_pvc_ventana",
        proveedor_id: "prov_oepcem",
        codigo_proveedor: "OEP-PVC-001",
        nombre_proveedor: "Marco PVC Premium",
        precio_unitario: 92.0,
        descuento: 3,
        precio_final: 89.24,
        disponible: true,
        tiempo_entrega_dias: 5,
        activo: true,
        created_at: new Date(),
      },
      // Perfil Aluminio - Alupac
      {
        _id: "mp_alupac_alu_vent",
        material_base_id: "mat_perfil_aluminio_ventana",
        proveedor_id: "prov_alupac",
        codigo_proveedor: "ALP-ALU-V001",
        nombre_proveedor: "Perfil Aluminio Premium V1",
        precio_unitario: 125.0,
        descuento: 4,
        precio_final: 120.0,
        disponible: true,
        tiempo_entrega_dias: 7,
        activo: true,
        created_at: new Date(),
      },
      // Perfil Aluminio - Ferruperfiles
      {
        _id: "mp_ferro_alu_vent",
        material_base_id: "mat_perfil_aluminio_ventana",
        proveedor_id: "prov_ferruperfiles",
        codigo_proveedor: "FP-ALU-001",
        nombre_proveedor: "Marco Aluminio Estándar",
        precio_unitario: 110.0,
        descuento: 7,
        precio_final: 102.3,
        disponible: true,
        tiempo_entrega_dias: 4,
        activo: true,
        created_at: new Date(),
      },
      // Vidrio - Oepcem
      {
        _id: "mp_oepcem_vidrio",
        material_base_id: "mat_vidrio_claro",
        proveedor_id: "prov_oepcem",
        codigo_proveedor: "OEP-VID-CLR",
        nombre_proveedor: "Vidrio Claro 6mm",
        precio_unitario: 180.0,
        descuento: 3,
        precio_final: 174.6,
        disponible: true,
        tiempo_entrega_dias: 2,
        activo: true,
        created_at: new Date(),
      },
      // Herrajes - Ferruperfiles
      {
        _id: "mp_ferro_herraje",
        material_base_id: "mat_herraje_ventana",
        proveedor_id: "prov_ferruperfiles",
        codigo_proveedor: "FP-HER-V001",
        nombre_proveedor: "Kit Herrajes Ventana Premium",
        precio_unitario: 450.0,
        descuento: 7,
        precio_final: 418.5,
        disponible: true,
        tiempo_entrega_dias: 1,
        activo: true,
        created_at: new Date(),
      },
    ]
    await db.collection("materialesproveedores").insertMany(materialesProveedores)

    // 4. VARIANTES DE MATERIALES
    console.log("🎨 Creando variantes de materiales...")
    const variantes = [
      // Colores PVC
      {
        _id: "var_pvc_blanco",
        material_base_id: "mat_perfil_pvc_ventana",
        tipo_variante: "color_pvc",
        nombre: "Blanco",
        codigo: "PVC-BLA",
        costo_adicional: 0,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "var_pvc_beige",
        material_base_id: "mat_perfil_pvc_ventana",
        tipo_variante: "color_pvc",
        nombre: "Beige",
        codigo: "PVC-BEI",
        costo_adicional: 15,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "var_pvc_gris",
        material_base_id: "mat_perfil_pvc_ventana",
        tipo_variante: "color_pvc",
        nombre: "Gris",
        codigo: "PVC-GRI",
        costo_adicional: 20,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "var_pvc_cafe",
        material_base_id: "mat_perfil_pvc_ventana",
        tipo_variante: "color_pvc",
        nombre: "Café",
        codigo: "PVC-CAF",
        costo_adicional: 25,
        activo: true,
        created_at: new Date(),
      },

      // Colores Aluminio
      {
        _id: "var_alu_natural",
        material_base_id: "mat_perfil_aluminio_ventana",
        tipo_variante: "color_aluminio",
        nombre: "Natural",
        codigo: "ALU-NAT",
        costo_adicional: 0,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "var_alu_blanco",
        material_base_id: "mat_perfil_aluminio_ventana",
        tipo_variante: "color_aluminio",
        nombre: "Blanco",
        codigo: "ALU-BLA",
        costo_adicional: 12,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "var_alu_negro",
        material_base_id: "mat_perfil_aluminio_ventana",
        tipo_variante: "color_aluminio",
        nombre: "Negro",
        codigo: "ALU-NEG",
        costo_adicional: 18,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "var_alu_bronce",
        material_base_id: "mat_perfil_aluminio_ventana",
        tipo_variante: "color_aluminio",
        nombre: "Bronce",
        codigo: "ALU-BRO",
        costo_adicional: 15,
        activo: true,
        created_at: new Date(),
      },

      // Tipos de Vidrio
      {
        _id: "var_vid_claro",
        material_base_id: "mat_vidrio_claro",
        tipo_variante: "tipo_vidrio",
        nombre: "Claro 6mm",
        codigo: "VID-CLA-6",
        costo_adicional: 0,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "var_vid_esmerilado",
        material_base_id: "mat_vidrio_claro",
        tipo_variante: "tipo_vidrio",
        nombre: "Esmerilado 6mm",
        codigo: "VID-ESM-6",
        costo_adicional: 35,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "var_vid_templado",
        material_base_id: "mat_vidrio_claro",
        tipo_variante: "tipo_vidrio",
        nombre: "Templado 8mm",
        codigo: "VID-TEM-8",
        costo_adicional: 120,
        activo: true,
        created_at: new Date(),
      },
    ]
    await db.collection("variantesmateriales").insertMany(variantes)

    // 5. PRODUCTOS
    console.log("🏠 Creando productos...")
    const productos = [
      {
        _id: "prod_ventana_pvc",
        nombre: "Ventana PVC Corrediza",
        descripcion: "Ventana corrediza de PVC con vidrio claro",
        categoria: "Ventanas",
        tipo_producto: "Ventana",
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "prod_ventana_aluminio",
        nombre: "Ventana Aluminio Corrediza",
        descripcion: "Ventana corrediza de aluminio con vidrio claro",
        categoria: "Ventanas",
        tipo_producto: "Ventana",
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "prod_puerta_pvc",
        nombre: "Puerta PVC Abatible",
        descripcion: "Puerta abatible de PVC con vidrio",
        categoria: "Puertas",
        tipo_producto: "Puerta",
        activo: true,
        created_at: new Date(),
      },
    ]
    await db.collection("productos").insertMany(productos)

    // 6. FÓRMULAS DE PRODUCTOS
    console.log("📐 Creando fórmulas de productos...")
    const formulas = [
      // Ventana PVC
      {
        _id: "form_vent_pvc_perfil",
        producto_id: "prod_ventana_pvc",
        material_base_id: "mat_perfil_pvc_ventana",
        formula: "(ancho + alto) * 2",
        orden: 1,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "form_vent_pvc_vidrio",
        producto_id: "prod_ventana_pvc",
        material_base_id: "mat_vidrio_claro",
        formula: "ancho * alto / 10000",
        orden: 2,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "form_vent_pvc_herraje",
        producto_id: "prod_ventana_pvc",
        material_base_id: "mat_herraje_ventana",
        formula: "1",
        orden: 3,
        activo: true,
        created_at: new Date(),
      },

      // Ventana Aluminio
      {
        _id: "form_vent_alu_perfil",
        producto_id: "prod_ventana_aluminio",
        material_base_id: "mat_perfil_aluminio_ventana",
        formula: "(ancho + alto) * 2",
        orden: 1,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "form_vent_alu_vidrio",
        producto_id: "prod_ventana_aluminio",
        material_base_id: "mat_vidrio_claro",
        formula: "ancho * alto / 10000",
        orden: 2,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "form_vent_alu_herraje",
        producto_id: "prod_ventana_aluminio",
        material_base_id: "mat_herraje_ventana",
        formula: "1",
        orden: 3,
        activo: true,
        created_at: new Date(),
      },

      // Puerta PVC
      {
        _id: "form_puerta_pvc_perfil",
        producto_id: "prod_puerta_pvc",
        material_base_id: "mat_perfil_pvc_ventana",
        formula: "(ancho + alto) * 2.5",
        orden: 1,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "form_puerta_pvc_vidrio",
        producto_id: "prod_puerta_pvc",
        material_base_id: "mat_vidrio_claro",
        formula: "ancho * alto * 0.6 / 10000",
        orden: 2,
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "form_puerta_pvc_herraje",
        producto_id: "prod_puerta_pvc",
        material_base_id: "mat_herraje_ventana",
        formula: "2",
        orden: 3,
        activo: true,
        created_at: new Date(),
      },
    ]
    await db.collection("productomaterialformulas").insertMany(formulas)

    console.log("✅ Sistema completo creado exitosamente!")
    console.log(`
📊 RESUMEN:
- ${proveedores.length} Proveedores
- ${materialesBase.length} Materiales Base
- ${materialesProveedores.length} Materiales por Proveedor
- ${variantes.length} Variantes de Materiales
- ${productos.length} Productos
- ${formulas.length} Fórmulas de Productos
    `)
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await client.close()
  }
}

seedSistemaCompleto()
