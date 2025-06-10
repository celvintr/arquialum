import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { FormulaCalculator } from "@/lib/utils/formula-calculator"

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const { producto_id, dimensiones, selecciones, margenGanancia, cantidad } = await request.json()

    // Obtener producto con materiales
    const producto = await db.collection("productos").findOne({ _id: producto_id })
    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Obtener materiales completos
    const materialesCompletos = await Promise.all(
      producto.materiales.map(async (materialProducto: any) => {
        const material = await db.collection("materiales").findOne({ _id: materialProducto.material_id })
        return {
          ...materialProducto,
          material,
        }
      }),
    )

    const calculator = new FormulaCalculator(dimensiones)
    let totalMateriales = 0
    const detallesMateriales: any[] = []

    // Calcular cada material
    for (const materialProducto of materialesCompletos) {
      const material = materialProducto.material
      if (!material) continue

      const formula = materialProducto.formula || "ancho * alto"

      // Calcular cantidad según fórmula
      const cantidad = calculator.calcularCantidad(formula)
      const rendimiento = calculator.calcularRendimiento(cantidad, material.area_longitud || 1)

      // Obtener proveedor seleccionado
      const proveedorId = selecciones.proveedores[material._id]
      const proveedor = material.proveedores?.find((p: any) => p.proveedor_id === proveedorId)

      let precioBase = 0
      let precioVariante = 0
      let nombreProveedor = "Sin proveedor"

      if (proveedor) {
        precioBase = proveedor.precio_unitario || 0

        // Buscar proveedor en la colección para obtener el nombre
        const proveedorData = await db.collection("proveedores").findOne({ _id: proveedorId })
        nombreProveedor = proveedorData?.nombre || "Proveedor desconocido"

        // Calcular precio de variante
        const varianteId = selecciones.variantes[material._id]
        if (varianteId && proveedor.variantes_precios) {
          const variantePrecio = proveedor.variantes_precios.find((v: any) => v.variante_id === varianteId)
          precioVariante = variantePrecio?.precio_adicional || 0
        }
      }

      const precioTotal = precioBase + precioVariante
      const descuento = proveedor?.descuento || 0
      const precioConDescuento = precioTotal * (1 - descuento / 100)
      const importe = rendimiento * precioConDescuento

      totalMateriales += importe

      detallesMateriales.push({
        material_id: material._id,
        nombre: material.nombre,
        proveedor: nombreProveedor,
        cantidad,
        rendimiento,
        precio_base: precioBase,
        precio_variante: precioVariante,
        precio_total: precioTotal,
        descuento,
        precio_final: precioConDescuento,
        importe,
        unidad_medida: material.unidad_medida,
        formula: formula,
      })
    }

    // Calcular mano de obra
    const tipoProductoModelo = producto.tipo_producto_modelo_id || 1

    const manoObraFabricacion = calculator.calcularManoObra(
      dimensiones.ancho,
      dimensiones.alto,
      tipoProductoModelo,
      "fabricacion",
    )

    const manoObraInstalacion = calculator.calcularManoObra(
      dimensiones.ancho,
      dimensiones.alto,
      tipoProductoModelo,
      "instalacion",
    )

    const manoObraMalla = calculator.calcularManoObra(dimensiones.ancho, dimensiones.alto, tipoProductoModelo, "malla")

    // Calcular totales
    const subtotal = totalMateriales + manoObraFabricacion + manoObraInstalacion + manoObraMalla
    const gananciaNeta = subtotal * (margenGanancia / 100)
    const total = (subtotal + gananciaNeta) * cantidad

    const resultado = {
      materiales: detallesMateriales,
      costos: {
        totalMateriales,
        manoObraFabricacion,
        manoObraInstalacion,
        manoObraMalla,
        subtotal,
        gananciaNeta,
        total,
      },
      dimensiones,
      selecciones,
      cantidad,
      margenGanancia,
    }

    return NextResponse.json({
      success: true,
      resultado,
    })
  } catch (error) {
    console.error("❌ Error calculando cotización:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al calcular cotización",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
