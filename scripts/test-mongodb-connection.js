const mongoose = require("mongoose")

// Obtener la URL de MongoDB desde los argumentos o usar el valor predeterminado
const MONGODB_URI = process.argv[2] || "mongodb://127.0.0.1:27017/cotizacion"

console.log(`🔍 Probando conexión a MongoDB: ${MONGODB_URI}`)

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // 5 segundos de timeout
  })
  .then(() => {
    console.log("✅ Conexión exitosa a MongoDB")
    console.log("📊 Información de la conexión:")
    console.log(`   - Host: ${mongoose.connection.host}`)
    console.log(`   - Puerto: ${mongoose.connection.port}`)
    console.log(`   - Base de datos: ${mongoose.connection.name}`)

    // Listar colecciones
    return mongoose.connection.db.listCollections().toArray()
  })
  .then((collections) => {
    console.log("📋 Colecciones disponibles:")
    if (collections.length === 0) {
      console.log("   - No hay colecciones (base de datos vacía)")
    } else {
      collections.forEach((collection) => {
        console.log(`   - ${collection.name}`)
      })
    }

    // Cerrar la conexión
    return mongoose.disconnect()
  })
  .then(() => {
    console.log("👋 Conexión cerrada correctamente")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Error de conexión:", error)
    process.exit(1)
  })
