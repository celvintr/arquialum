const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cotizacion"

async function fixCollectionsFinal() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db()

    console.log("🔧 ARREGLANDO TODAS LAS COLECCIONES...")

    // 1. ELIMINAR COLECCIONES DUPLICADAS/INCORRECTAS
    console.log("🗑️ Eliminando colecciones duplicadas...")
    const coleccionesAEliminar = ["materials", "cotizacions", "tipoproductomodelos"]

    for (const coleccion of coleccionesAEliminar) {
      try {
        await db.collection(coleccion).drop()
        console.log(`   ✅ Eliminada: ${coleccion}`)
      } catch (error) {
        console.log(`   ⚠️ ${coleccion} no existía`)
      }
    }

    // 2. LIMPIAR Y RECREAR CONFIGURACIONES
    console.log("\n⚙️ Creando configuraciones del sistema...")
    await db.collection("configuraciones").deleteMany({})

    const configuraciones = [
      {
        _id: "config_impuestos",
        nombre: "Configuración de Impuestos",
        tipo: "impuestos",
        valores: {
          iva: 16,
          isr: 1.5,
          aplicar_iva: true,
          aplicar_isr: false,
        },
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "config_mano_obra",
        nombre: "Tarifas de Mano de Obra",
        tipo: "mano_obra",
        valores: {
          fabricacion: 400,
          instalacion: 200,
          malla: 400,
          moneda: "HNL",
        },
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "config_margenes",
        nombre: "Márgenes de Ganancia",
        tipo: "margenes",
        valores: {
          minimo: 15,
          recomendado: 30,
          maximo: 60,
        },
        activo: true,
        created_at: new Date(),
      },
    ]

    await db.collection("configuraciones").insertMany(configuraciones)
    console.log(`   ✅ ${configuraciones.length} configuraciones creadas`)

    // 3. RECREAR REPARACIONES DEFINIDAS
    console.log("\n🔧 Creando reparaciones definidas...")
    await db.collection("reparaciones_definidas").deleteMany({})

    const reparaciones = [
      {
        _id: "rep_cambio_vidrio",
        nombre: "Cambio de Vidrio",
        descripcion: "Reemplazo de vidrio dañado en ventana",
        categoria: "Vidrio",
        precio_base: 150.0,
        tiempo_estimado: 2,
        materiales_incluidos: ["Vidrio", "Sellador"],
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "rep_ajuste_herrajes",
        nombre: "Ajuste de Herrajes",
        descripcion: "Ajuste y lubricación de herrajes",
        categoria: "Herrajes",
        precio_base: 80.0,
        tiempo_estimado: 1,
        materiales_incluidos: ["Lubricante", "Tornillos"],
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "rep_cambio_chapa",
        nombre: "Cambio de Chapa",
        descripcion: "Reemplazo de chapa de seguridad",
        categoria: "Herrajes",
        precio_base: 250.0,
        tiempo_estimado: 3,
        materiales_incluidos: ["Chapa", "Llaves", "Tornillos"],
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "rep_sellado_ventana",
        nombre: "Sellado de Ventana",
        descripcion: "Aplicación de sellador perimetral",
        categoria: "Selladores",
        precio_base: 120.0,
        tiempo_estimado: 2,
        materiales_incluidos: ["Sellador", "Limpiador"],
        activo: true,
        created_at: new Date(),
      },
      {
        _id: "rep_cambio_perfil",
        nombre: "Cambio de Perfil",
        descripcion: "Reemplazo de perfil dañado",
        categoria: "Perfiles",
        precio_base: 300.0,
        tiempo_estimado: 4,
        materiales_incluidos: ["Perfil", "Herrajes", "Sellador"],
        activo: true,
        created_at: new Date(),
      },
    ]

    await db.collection("reparaciones_definidas").insertMany(reparaciones)
    console.log(`   ✅ ${reparaciones.length} reparaciones creadas`)

    // 4. RECREAR MATERIALES CON ESTRUCTURA CORRECTA
    console.log("\n📦 Recreando materiales con estructura correcta...")
    await db.collection("materiales").deleteMany({})

    const materiales = [
      {
        _id: "mat_perfil_marco_pvc",
        nombre: "Perfil Marco PVC 60mm",
        nombres_secundarios: ["Marco PVC", "Perfil Principal"],
        descripcion: "Perfil principal para marcos de ventanas PVC",
        categoria: "Perfil PVC",
        unidad_medida: "metro",
        area_longitud: 6.0,
        costo_base: 45.5,
        contribuye_a_malla: false,
        tiene_variantes: true,
        activo: true,
        proveedores: [
          {
            proveedor_id: "prov_pvc_principal",
            proveedor_nombre: "PVC SISTEMAS SA",
            precio_unitario: 45.5,
            descuento: 5,
            impuesto: 16,
            es_principal: true,
            tipo_variante: "pvc",
            variantes_precios: [
              { variante_id: "color_pvc_blanco", nombre: "Blanco", precio_adicional: 0 },
              { variante_id: "color_pvc_cafe", nombre: "Café", precio_adicional: 8.5 },
              { variante_id: "color_pvc_gris", nombre: "Gris", precio_adicional: 12.0 },
              { variante_id: "color_pvc_negro", nombre: "Negro", precio_adicional: 15.0 },
              { variante_id: "color_pvc_madera", nombre: "Imitación Madera", precio_adicional: 25.0 },
            ],
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "mat_perfil_hoja_pvc",
        nombre: "Perfil Hoja PVC 60mm",
        nombres_secundarios: ["Hoja PVC", "Perfil Móvil"],
        descripcion: "Perfil para hojas móviles de ventanas PVC",
        categoria: "Perfil PVC",
        unidad_medida: "metro",
        area_longitud: 6.0,
        costo_base: 38.75,
        contribuye_a_malla: false,
        tiene_variantes: true,
        activo: true,
        proveedores: [
          {
            proveedor_id: "prov_pvc_principal",
            proveedor_nombre: "PVC SISTEMAS SA",
            precio_unitario: 38.75,
            descuento: 5,
            impuesto: 16,
            es_principal: true,
            tipo_variante: "pvc",
            variantes_precios: [
              { variante_id: "color_pvc_blanco", nombre: "Blanco", precio_adicional: 0 },
              { variante_id: "color_pvc_cafe", nombre: "Café", precio_adicional: 7.0 },
              { variante_id: "color_pvc_gris", nombre: "Gris", precio_adicional: 10.5 },
              { variante_id: "color_pvc_negro", nombre: "Negro", precio_adicional: 13.5 },
              { variante_id: "color_pvc_madera", nombre: "Imitación Madera", precio_adicional: 22.0 },
            ],
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "mat_decorado_pvc",
        nombre: "Decorado PVC",
        nombres_secundarios: ["Moldura", "Decorativo"],
        descripcion: "Perfil decorativo para ventanas PVC",
        categoria: "Perfil PVC",
        unidad_medida: "metro",
        area_longitud: 6.0,
        costo_base: 28.5,
        contribuye_a_malla: false,
        tiene_variantes: true,
        activo: true,
        proveedores: [
          {
            proveedor_id: "prov_pvc_principal",
            proveedor_nombre: "PVC SISTEMAS SA",
            precio_unitario: 28.5,
            descuento: 5,
            impuesto: 16,
            es_principal: true,
            tipo_variante: "pvc",
            variantes_precios: [
              { variante_id: "color_pvc_blanco", nombre: "Blanco", precio_adicional: 0 },
              { variante_id: "color_pvc_cafe", nombre: "Café", precio_adicional: 5.0 },
              { variante_id: "color_pvc_gris", nombre: "Gris", precio_adicional: 7.5 },
              { variante_id: "color_pvc_madera", nombre: "Imitación Madera", precio_adicional: 18.0 },
            ],
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "mat_vidrio_claro",
        nombre: "Vidrio Claro",
        nombres_secundarios: ["Cristal", "Vidrio Transparente"],
        descripcion: "Vidrio claro para ventanas",
        categoria: "Vidrio",
        unidad_medida: "m2",
        area_longitud: 1.0,
        costo_base: 180.0,
        contribuye_a_malla: false,
        tiene_variantes: true,
        activo: true,
        proveedores: [
          {
            proveedor_id: "prov_vidrio",
            proveedor_nombre: "VIDRIOS ESPECIALIZADOS",
            precio_unitario: 180.0,
            descuento: 10,
            impuesto: 16,
            es_principal: true,
            tipo_variante: "vidrio",
            variantes_precios: [
              { variante_id: "vidrio_4mm", nombre: "4mm", precio_adicional: 0 },
              { variante_id: "vidrio_6mm", nombre: "6mm", precio_adicional: 45.0 },
              { variante_id: "vidrio_8mm", nombre: "8mm", precio_adicional: 85.0 },
              { variante_id: "vidrio_templado_6mm", nombre: "Templado 6mm", precio_adicional: 120.0 },
              { variante_id: "vidrio_templado_8mm", nombre: "Templado 8mm", precio_adicional: 180.0 },
            ],
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "mat_herraje_corredizo",
        nombre: "Herraje Corredizo",
        nombres_secundarios: ["Riel", "Sistema Corredizo"],
        descripcion: "Sistema completo de herrajes para ventanas corredizas",
        categoria: "Herrajes",
        unidad_medida: "juego",
        area_longitud: 1.0,
        costo_base: 285.0,
        contribuye_a_malla: false,
        tiene_variantes: false,
        activo: true,
        proveedores: [
          {
            proveedor_id: "prov_herrajes",
            proveedor_nombre: "HERRAJES PREMIUM",
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
        _id: "mat_sellador_silicona",
        nombre: "Sellador de Silicona",
        nombres_secundarios: ["Silicona", "Sellante"],
        descripcion: "Sellador de silicona estructural",
        categoria: "Selladores",
        unidad_medida: "tubo",
        area_longitud: 12.0,
        costo_base: 45.0,
        contribuye_a_malla: true,
        tiene_variantes: false,
        activo: true,
        proveedores: [
          {
            proveedor_id: "prov_accesorios",
            proveedor_nombre: "ACCESORIOS Y MAS",
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

    await db.collection("materiales").insertMany(materiales)
    console.log(`   ✅ ${materiales.length} materiales creados`)

    // 5. RECREAR PRODUCTOS CON FÓRMULAS REALES
    console.log("\n🏗️ Recreando productos con fórmulas reales...")
    await db.collection("productos").deleteMany({})

    const productos = [
      {
        _id: "prod_ventana_pvc_corrediza",
        nombre: "Ventana PVC Corrediza",
        identificador: "VENT-PVC-CORR-001",
        descripcion: "Ventana corrediza de PVC con vidrio claro",
        tipo_producto_id: "tipo_ventana",
        tipo_producto_modelo_id: 1,
        categoria: "PVC",
        estado: true,
        imagen_url: "/placeholder.svg?height=200&width=300&text=Ventana+PVC+Corrediza",
        materiales: [
          {
            material_id: "mat_perfil_marco_pvc",
            formula: "(ancho * 2) + (alto * 4)",
            es_requerido: true,
            orden: 1,
          },
          {
            material_id: "mat_perfil_hoja_pvc",
            formula: "(ancho * 2) + (alto * 4)",
            es_requerido: true,
            orden: 2,
          },
          {
            material_id: "mat_decorado_pvc",
            formula: "(ancho * decoradoHorizontal) + (alto * decoradoVertical * 2)",
            es_requerido: false,
            orden: 3,
          },
          {
            material_id: "mat_vidrio_claro",
            formula: "ancho * alto",
            es_requerido: true,
            orden: 4,
          },
          {
            material_id: "mat_herraje_corredizo",
            formula: "(ancho > 1.5 ? 3 : 2) + (alto > 1.5 ? 6 : 4)",
            es_requerido: true,
            orden: 5,
          },
          {
            material_id: "mat_sellador_silicona",
            formula: "REDONDEAR.MENOS((ancho + alto) * 2 / 12, 0) + 1",
            es_requerido: true,
            orden: 6,
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: "prod_ventana_pvc_abatible",
        nombre: "Ventana PVC Abatible",
        identificador: "VENT-PVC-ABAT-001",
        descripcion: "Ventana abatible de PVC con vidrio templado",
        tipo_producto_id: "tipo_ventana",
        tipo_producto_modelo_id: 2,
        categoria: "PVC",
        estado: true,
        imagen_url: "/placeholder.svg?height=200&width=300&text=Ventana+PVC+Abatible",
        materiales: [
          {
            material_id: "mat_perfil_marco_pvc",
            formula: "(ancho + alto) * 2",
            es_requerido: true,
            orden: 1,
          },
          {
            material_id: "mat_perfil_hoja_pvc",
            formula: "(ancho + alto) * 2",
            es_requerido: true,
            orden: 2,
          },
          {
            material_id: "mat_decorado_pvc",
            formula: "(ancho * decoradoHorizontal) + (alto * decoradoVertical * 4)",
            es_requerido: false,
            orden: 3,
          },
          {
            material_id: "mat_vidrio_claro",
            formula: "ancho * alto",
            es_requerido: true,
            orden: 4,
          },
          {
            material_id: "mat_sellador_silicona",
            formula: "REDONDEAR.MENOS((ancho + alto) * 2 / 12, 0) + 1",
            es_requerido: true,
            orden: 5,
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    await db.collection("productos").insertMany(productos)
    console.log(`   ✅ ${productos.length} productos creados`)

    console.log("\n🎉 TODAS LAS COLECCIONES ARREGLADAS CORRECTAMENTE!")
    console.log("📊 Resumen final:")
    console.log(`   • ${configuraciones.length} Configuraciones`)
    console.log(`   • ${reparaciones.length} Reparaciones definidas`)
    console.log(`   • ${materiales.length} Materiales con proveedores y variantes`)
    console.log(`   • ${productos.length} Productos con fórmulas reales`)
    console.log("   • Colecciones duplicadas eliminadas")
    console.log("   • Estructura correcta implementada")
  } catch (error) {
    console.error("❌ Error arreglando colecciones:", error)
  } finally {
    await client.close()
  }
}

if (require.main === module) {
  fixCollectionsFinal()
}

module.exports = { fixCollectionsFinal }
