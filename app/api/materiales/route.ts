import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    console.log("📊 Obteniendo materiales con proveedores y variantes...")

    // Traer materiales con información agregada de proveedores y variantes
    const materiales = await db.collection("materiales").find({}).toArray()

    console.log(`📊 Materiales encontrados: ${materiales.length}`)

    // Para cada material, calcular proveedores y variantes
    const materialesConInfo = await Promise.all(
      materiales.map(async (material) => {
        try {
          // Contar proveedores
          let totalProveedores = 0
          let proveedorPrincipal = null

          if (material.proveedores && Array.isArray(material.proveedores)) {
            totalProveedores = material.proveedores.length

            // Buscar proveedor principal o usar el primero
            proveedorPrincipal = material.proveedores.find((p) => p.es_principal) || material.proveedores[0] || null

            // Contar variantes desde los proveedores
            let totalVariantes = 0
            let tieneVariantes = false

            // Contar variantes desde los proveedores que tienen variantes_precios
            for (const proveedor of material.proveedores) {
              if (proveedor.variantes_precios && Array.isArray(proveedor.variantes_precios)) {
                totalVariantes += proveedor.variantes_precios.length
                if (proveedor.variantes_precios.length > 0) {
                  tieneVariantes = true
                }
              }
            }

            console.log(`📊 Material ${material.nombre}: ${totalProveedores} proveedores, ${totalVariantes} variantes`)

            return {
              ...material,
              area_longitud: material.area_longitud || 1,
              precio_unitario: material.precio_unitario || 0,
              stock: material.stock || 0,
              stock_minimo: material.stock_minimo || 0,
              activo: material.activo !== false,
              total_proveedores: totalProveedores,
              proveedor_principal: proveedorPrincipal,
              total_variantes: totalVariantes,
              tiene_variantes: tieneVariantes,
            }
          } else {
            console.log(`⚠️ Material ${material.nombre} no tiene proveedores`)
            return {
              ...material,
              area_longitud: material.area_longitud || 1,
              precio_unitario: material.precio_unitario || 0,
              stock: material.stock || 0,
              stock_minimo: material.stock_minimo || 0,
              activo: material.activo !== false,
              total_proveedores: 0,
              proveedor_principal: null,
              total_variantes: 0,
              tiene_variantes: false,
            }
          }
        } catch (materialError) {
          console.error(`❌ Error procesando material ${material.nombre}:`, materialError)
          return {
            ...material,
            area_longitud: material.area_longitud || 1,
            precio_unitario: material.precio_unitario || 0,
            stock: material.stock || 0,
            stock_minimo: material.stock_minimo || 0,
            activo: material.activo !== false,
            total_proveedores: 0,
            proveedor_principal: null,
            total_variantes: 0,
            tiene_variantes: false,
          }
        }
      }),
    )

    console.log("✅ Materiales procesados con información de proveedores y variantes")

    return NextResponse.json({
      success: true,
      materiales: materialesConInfo,
    })
  } catch (error) {
    console.error("❌ Error obteniendo materiales:", error)
    return NextResponse.json({ error: "Error obteniendo materiales" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()

    console.log("📝 Creando material con datos:", body)

    const nuevoMaterial = {
      _id: uuidv4(),
      nombre: body.nombre,
      categoria: body.categoria,
      unidad_medida: body.unidad_medida,
      unidad_medida_produccion: body.unidad_medida_produccion || body.unidad_medida,
      area_longitud: Number(body.area_longitud) || 1,
      descripcion: body.descripcion || "",
      precio_unitario: Number(body.precio_unitario) || 0,
      stock: Number(body.stock) || 0,
      stock_minimo: Number(body.stock_minimo) || 0,
      proveedores: body.proveedores || [],
      especificaciones: body.especificaciones || "",
      activo: body.activo !== false,
      created_at: new Date(),
      updated_at: new Date(),
    }

    console.log("💾 Guardando material:", nuevoMaterial)

    await db.collection("materiales").insertOne(nuevoMaterial)

    return NextResponse.json({
      success: true,
      material: nuevoMaterial,
    })
  } catch (error) {
    console.error("Error creando material:", error)
    return NextResponse.json({ error: "Error creando material" }, { status: 500 })
  }
}
