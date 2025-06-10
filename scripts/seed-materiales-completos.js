const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cotizacion"

async function seedMaterialesCompletos() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db()

    console.log("🌱 Creando materiales completos con proveedores y variantes...")

    // Limpiar colección
    await db.collection("materiales").deleteMany({})

    // Materiales PVC con fórmulas reales del SQL
    const materialesPVC = [
      {
        _id: "mat_perfil_marco_pvc",
        nombre: "Perfil Marco PVC",
        nombres_secundarios: ["Marco PVC", "Perfil Principal PVC"],
        descripcion: "Perfil principal para marcos de ventanas PVC",
        categoria: "Perfil PVC",
        unidad_medida: "metro",
        area_longitud: 6.0,
        formula_calculo: "(ancho * 2) + (alto * 4)",
        contribuye_a_malla: false,
        tiene_variantes: true,
        activo: true,
        proveedores: [
          {
            proveedor_id: "prov_pvc_principal",
            precio_unitario: 45.5,
            descuento: 5,
            impuesto: 16,
            es_principal: true,
            tipo_variante: "pvc",
            variantes_precios: [
              { variante_id: "color_pvc_blanco", precio_adicional: 0 },
              { variante_id: "color_pvc_cafe", precio_adicional: 8.5 },
              { variante_id: "color_pvc_gris", precio_adicional: 12.0 },
              { variante_id: "color_pvc_negro", precio_adicional: 15.0 },
              { variante_id: "color_pvc_madera", precio_adicional: 25.0 },
            ],
          },
          {
            proveedor_id: "prov_pvc_secundario",
            precio_unitario: 42.0,
            descuento: 3,
            impuesto: 16,
            es_principal: false,
            tipo_variante: "pvc",
            variantes_precios: [
              { variante_id: "color_pvc_blanco", precio_adicional: 0 },
              { variante_id: "color_pvc_cafe", precio_adicional: 10.0 },
              { variante_id: "color_pvc_gris", precio_adicional: 14.0 },
            ],
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "mat_perfil_hoja_pvc",
        nombre: "Perfil Hoja PVC",
        nombres_secundarios: ["Hoja PVC", "Perfil Móvil PVC"],
        descripcion: "Perfil para hojas móviles de ventanas PVC",
        categoria: "Perfil PVC",
        unidad_medida: "metro",
        area_longitud: 6.0,
        formula_calculo: "(ancho * 2) + (alto * 4)",
        contribuye_a_malla: false,
        tiene_variantes: true,
        activo: true,
        proveedores: [
          {
            proveedor_id: "prov_pvc_principal",
            precio_unitario: 38.75,
            descuento: 5,
            impuesto: 16,
            es_principal: true,
            tipo_variante: "pvc",
            variantes_precios: [
              { variante_id: "color_pvc_blanco", precio_adicional: 0 },
              { variante_id: "color_pvc_cafe", precio_adicional: 7.0 },
              { variante_id: "color_pvc_gris", precio_adicional: 10.5 },
              { variante_id: "color_pvc_negro", precio_adicional: 13.5 },
              { variante_id: "color_pvc_madera", precio_adicional: 22.0 },
            ],
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "mat_decorado_pvc",
        nombre: "Decorado PVC",
        nombres_secundarios: ["Moldura PVC", "Decorativo PVC"],
        descripcion: "Perfil decorativo para ventanas PVC",
        categoria: "Perfil PVC",
        unidad_medida: "metro",
        area_longitud: 6.0,
        formula_calculo: "(ancho * decoradoHorizontal) + (alto * decoradoVertical * 2)",
        contribuye_a_malla: false,
        tiene_variantes: true,
        activo: true,
        proveedores: [
          {
            proveedor_id: "prov_pvc_principal",
            precio_unitario: 28.5,
            descuento: 5,
            impuesto: 16,
            es_principal: true,
            tipo_variante: "pvc",
            variantes_precios: [
              { variante_id: "color_pvc_blanco", precio_adicional: 0 },
              { variante_id: "color_pvc_cafe", precio_adicional: 5.0 },
              { variante_id: "color_pvc_gris", precio_adicional: 7.5 },
              { variante_id: "color_pvc_madera", precio_adicional: 18.0 },
            ],
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "mat_refuerzo_pvc",
        nombre: "Refuerzo PVC",
        nombres_secundarios: ["Refuerzo Metálico", "Alma de Acero"],
        descripcion: "Refuerzo metálico para perfiles PVC",
        categoria: "Herrajes",
        unidad_medida: "metro",
        area_longitud: 6.0,
        formula_calculo: "ancho + (alto * 2)",
        contribuye_a_malla: false,
        tiene_variantes: false,
        activo: true,
        proveedores: [
          {
            proveedor_id: "prov_herrajes",
            precio_unitario: 15.75,
            descuento: 0,
            impuesto: 16,
            es_principal: true,
            tipo_variante: "",
            variantes_precios: [],
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    // Materiales Aluminio
    const materialesAluminio = [
      {
        _id: "mat_perfil_marco_aluminio",
        nombre: "Perfil Marco Aluminio",
        nombres_secundarios: ["Marco Aluminio", "Perfil Principal Aluminio"],
        descripcion: "Perfil principal para marcos de ventanas aluminio",
        categoria: "Perfil Aluminio",
        unidad_medida: "metro",
        area_longitud: 6.0,
        formula_calculo: "(ancho + alto) * 2",
        contribuye_a_malla: false,
        tiene_variantes: true,
        activo: true,
        proveedores: [
          {
            proveedor_id: "prov_aluminio_principal",
            precio_unitario: 52.0,
            descuento: 8,
            impuesto: 16,
            es_principal: true,
            tipo_variante: "aluminio",
            variantes_precios: [
              { variante_id: "color_alu_natural", precio_adicional: 0 },
              { variante_id: "color_alu_blanco", precio_adicional: 12.0 },
              { variante_id: "color_alu_negro", precio_adicional: 18.0 },
              { variante_id: "color_alu_bronce", precio_adicional: 15.0 },
              { variante_id: "color_alu_madera", precio_adicional: 35.0 },
            ],
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "mat_perfil_hoja_aluminio",
        nombre: "Perfil Hoja Aluminio",
        nombres_secundarios: ["Hoja Aluminio", "Perfil Móvil Aluminio"],
        descripcion: "Perfil para hojas móviles de ventanas aluminio",
        categoria: "Perfil Aluminio",
        unidad_medida: "metro",
        area_longitud: 6.0,
        formula_calculo: "(ancho * 2) + (alto * 4)",
        contribuye_a_malla: false,
        tiene_variantes: true,
        activo: true,
        proveedores: [
          {
            proveedor_id: "prov_aluminio_principal",
            precio_unitario: 48.5,
            descuento: 8,
            impuesto: 16,
            es_principal: true,
            tipo_variante: "aluminio",
            variantes_precios: [
              { variante_id: "color_alu_natural", precio_adicional: 0 },
              { variante_id: "color_alu_blanco", precio_adicional: 10.0 },
              { variante_id: "color_alu_negro", precio_adicional: 16.0 },
              { variante_id: "color_alu_bronce", precio_adicional: 13.0 },
            ],
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    // Materiales Vidrio
    const materialesVidrio = [
      {
        _id: "mat_vidrio_claro",
        nombre: "Vidrio Claro",
        nombres_secundarios: ["Cristal Claro", "Vidrio Transparente"],
        descripcion: "Vidrio claro para ventanas",
        categoria: "Vidrio",
        unidad_medida: "m2",
        area_longitud: 1.0,
        formula_calculo: "ancho * alto",
        contribuye_a_malla: false,
        tiene_variantes: true,
        activo: true,
        proveedores: [
          {
            proveedor_id: "prov_vidrio",
            precio_unitario: 180.0,
            descuento: 10,
            impuesto: 16,
            es_principal: true,
            tipo_variante: "vidrio",
            variantes_precios: [
              { variante_id: "vidrio_4mm", precio_adicional: 0 },
              { variante_id: "vidrio_6mm", precio_adicional: 45.0 },
              { variante_id: "vidrio_8mm", precio_adicional: 85.0 },
              { variante_id: "vidrio_templado_6mm", precio_adicional: 120.0 },
              { variante_id: "vidrio_templado_8mm", precio_adicional: 180.0 },
              { variante_id: "vidrio_laminado_6mm", precio_adicional: 95.0 },
            ],
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    // Materiales Herrajes
    const materialesHerrajes = [
      {
        _id: "mat_herraje_corredizo",
        nombre: "Herraje Corredizo",
        nombres_secundarios: ["Riel Corredizo", "Sistema Corredizo"],
        descripcion: "Sistema de herrajes para ventanas corredizas",
        categoria: "Herrajes",
        unidad_medida: "juego",
        area_longitud: 1.0,
        formula_calculo: "(ancho > 1.5 ? 3 : 2) + (alto > 1.5 ? 6 : 4)",
        contribuye_a_malla: false,
        tiene_variantes: false,
        activo: true,
        proveedores: [
          {
            proveedor_id: "prov_herrajes",
            precio_unitario: 285.0,
            descuento: 5,
            impuesto: 16,
            es_principal: true,
            tipo_variante: "",
            variantes_precios: [],
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "mat_herraje_abatible",
        nombre: "Herraje Abatible",
        nombres_secundarios: ["Bisagras", "Sistema Abatible"],
        descripcion: "Sistema de herrajes para ventanas abatibles",
        categoria: "Herrajes",
        unidad_medida: "juego",
        area_longitud: 1.0,
        formula_calculo: "(alto < 1 ? 8 : REDONDEAR.MENOS(alto / 0.5, 0) * 4)",
        contribuye_a_malla: false,
        tiene_variantes: false,
        activo: true,
        proveedores: [
          {
            proveedor_id: "prov_herrajes",
            precio_unitario: 320.0,
            descuento: 5,
            impuesto: 16,
            es_principal: true,
            tipo_variante: "",
            variantes_precios: [],
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "mat_sellador_silicona",
        nombre: "Sellador de Silicona",
        nombres_secundarios: ["Silicona", "Sellante"],
        descripcion: "Sellador de silicona para ventanas",
        categoria: "Selladores",
        unidad_medida: "tubo",
        area_longitud: 12.0,
        formula_calculo: "REDONDEAR.MENOS((ancho + alto) * 2 / 12, 0) + 1",
        contribuye_a_malla: false,
        tiene_variantes: false,
        activo: true,
        proveedores: [
          {
            proveedor_id: "prov_accesorios",
            precio_unitario: 45.0,
            descuento: 0,
            impuesto: 16,
            es_principal: true,
            tipo_variante: "",
            variantes_precios: [],
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    // Insertar todos los materiales
    const todosMateriales = [...materialesPVC, ...materialesAluminio, ...materialesVidrio, ...materialesHerrajes]

    await db.collection("materiales").insertMany(todosMateriales)

    console.log(`✅ ${todosMateriales.length} materiales creados exitosamente`)

    // Crear productos de ejemplo con materiales
    await db.collection("productos").deleteMany({})

    const productos = [
      {
        _id: "prod_ventana_pvc_corrediza",
        nombre: "Ventana PVC Corrediza",
        identificador: "VENT-PVC-CORR",
        descripcion: "Ventana corrediza de PVC con vidrio claro",
        tipo_producto_id: "tipo_ventana",
        proveedor_id: "prov_pvc_principal",
        tipo_producto_modelo_id: 1,
        estado: true,
        materiales: [
          {
            material_id: "mat_perfil_marco_pvc",
            formula: "(ancho * 2) + (alto * 4)",
          },
          {
            material_id: "mat_perfil_hoja_pvc",
            formula: "(ancho * 2) + (alto * 4)",
          },
          {
            material_id: "mat_decorado_pvc",
            formula: "(ancho * decoradoHorizontal) + (alto * decoradoVertical * 2)",
          },
          {
            material_id: "mat_refuerzo_pvc",
            formula: "ancho + (alto * 2)",
          },
          {
            material_id: "mat_vidrio_claro",
            formula: "ancho * alto",
          },
          {
            material_id: "mat_herraje_corredizo",
            formula: "(ancho > 1.5 ? 3 : 2) + (alto > 1.5 ? 6 : 4)",
          },
          {
            material_id: "mat_sellador_silicona",
            formula: "REDONDEAR.MENOS((ancho + alto) * 2 / 12, 0) + 1",
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "prod_ventana_aluminio_abatible",
        nombre: "Ventana Aluminio Abatible",
        identificador: "VENT-ALU-ABAT",
        descripcion: "Ventana abatible de aluminio con vidrio templado",
        tipo_producto_id: "tipo_ventana",
        proveedor_id: "prov_aluminio_principal",
        tipo_producto_modelo_id: 2,
        estado: true,
        materiales: [
          {
            material_id: "mat_perfil_marco_aluminio",
            formula: "(ancho + alto) * 2",
          },
          {
            material_id: "mat_perfil_hoja_aluminio",
            formula: "(ancho * 2) + (alto * 4)",
          },
          {
            material_id: "mat_vidrio_claro",
            formula: "ancho * alto",
          },
          {
            material_id: "mat_herraje_abatible",
            formula: "(alto < 1 ? 8 : REDONDEAR.MENOS(alto / 0.5, 0) * 4)",
          },
          {
            material_id: "mat_sellador_silicona",
            formula: "REDONDEAR.MENOS((ancho + alto) * 2 / 12, 0) + 1",
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    await db.collection("productos").insertMany(productos)
    console.log(`✅ ${productos.length} productos creados exitosamente`)

    console.log("🎉 Seed de materiales completos terminado!")
  } catch (error) {
    console.error("❌ Error en seed:", error)
  } finally {
    await client.close()
  }
}

if (require.main === module) {
  seedMaterialesCompletos()
}

module.exports = { seedMaterialesCompletos }
