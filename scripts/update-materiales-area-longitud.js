const { MongoClient } = require("mongodb")

async function updateMaterialesAreaLongitud() {
  const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/tablar")

  try {
    await client.connect()
    console.log("📡 Conectado a MongoDB")

    const db = client.db()
    const collection = db.collection("materiales")

    // Buscar materiales sin area_longitud o con valor 0
    const materialesSinArea = await collection
      .find({
        $or: [{ area_longitud: { $exists: false } }, { area_longitud: 0 }, { area_longitud: null }],
      })
      .toArray()

    console.log(`📋 Encontrados ${materialesSinArea.length} materiales sin área/longitud`)

    if (materialesSinArea.length === 0) {
      console.log("✅ Todos los materiales ya tienen área/longitud configurada")
      return
    }

    // Actualizar materiales con valores por defecto basados en su unidad de medida
    for (const material of materialesSinArea) {
      let areaLongitudDefault = 1

      // Asignar valores por defecto según la unidad de medida
      switch (material.unidad_medida?.toLowerCase()) {
        case "metros":
        case "metro":
          areaLongitudDefault = 6 // 6 metros por barra (común en perfiles)
          break
        case "metros_cuadrados":
        case "metro_cuadrado":
        case "m2":
          areaLongitudDefault = 1 // 1 m² por unidad
          break
        case "piezas":
        case "pieza":
          areaLongitudDefault = 1 // 1 pieza por unidad
          break
        case "kilogramos":
        case "kg":
          areaLongitudDefault = 1 // 1 kg por unidad
          break
        case "litros":
        case "litro":
          areaLongitudDefault = 1 // 1 litro por unidad
          break
        default:
          areaLongitudDefault = 1
      }

      await collection.updateOne(
        { _id: material._id },
        {
          $set: {
            area_longitud: areaLongitudDefault,
            updated_at: new Date(),
          },
        },
      )

      console.log(`✅ Actualizado ${material.nombre}: área/longitud = ${areaLongitudDefault}`)
    }

    console.log(`🎉 Actualizados ${materialesSinArea.length} materiales exitosamente`)
  } catch (error) {
    console.error("❌ Error actualizando materiales:", error)
  } finally {
    await client.close()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  updateMaterialesAreaLongitud()
}

module.exports = { updateMaterialesAreaLongitud }
