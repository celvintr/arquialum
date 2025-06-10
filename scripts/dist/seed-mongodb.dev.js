"use strict";

var _require = require("mongodb"),
    MongoClient = _require.MongoClient,
    ObjectId = _require.ObjectId;

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cotizacion";

function seedDatabase() {
  var client, db, tiposProductoResult, tiposProducto, proveedoresResult, proveedores, materialesResult, materiales;
  return regeneratorRuntime.async(function seedDatabase$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          client = new MongoClient(MONGODB_URI);
          _context.prev = 1;
          console.log("🔗 Conectando a MongoDB...");
          _context.next = 5;
          return regeneratorRuntime.awrap(client.connect());

        case 5:
          console.log("✅ Conectado a MongoDB");
          db = client.db(); // Limpiar colecciones existentes

          console.log("🧹 Limpiando colecciones...");
          _context.next = 10;
          return regeneratorRuntime.awrap(db.collection("tiposproducto").deleteMany({}));

        case 10:
          _context.next = 12;
          return regeneratorRuntime.awrap(db.collection("proveedores").deleteMany({}));

        case 12:
          _context.next = 14;
          return regeneratorRuntime.awrap(db.collection("materiales").deleteMany({}));

        case 14:
          _context.next = 16;
          return regeneratorRuntime.awrap(db.collection("productos").deleteMany({}));

        case 16:
          _context.prev = 16;
          _context.next = 19;
          return regeneratorRuntime.awrap(db.collection("productos").dropIndex("codigo_1"));

        case 19:
          console.log("🗑️ Índice codigo_1 eliminado");
          _context.next = 25;
          break;

        case 22:
          _context.prev = 22;
          _context.t0 = _context["catch"](16);
          console.log("ℹ️ Índice codigo_1 no existía");

        case 25:
          // Seed Tipos de Producto
          console.log("📦 Creando tipos de producto...");
          _context.next = 28;
          return regeneratorRuntime.awrap(db.collection("tiposproducto").insertMany([{
            _id: new ObjectId(),
            nombre: "Ventana PVC",
            descripcion: "Ventanas de PVC con diferentes configuraciones",
            categoria: "ventanas",
            mano_obra_fabricacion: 150,
            mano_obra_instalacion: 200,
            estado: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }, {
            _id: new ObjectId(),
            nombre: "Ventana Aluminio",
            descripcion: "Ventanas de aluminio con diferentes configuraciones",
            categoria: "ventanas",
            mano_obra_fabricacion: 180,
            mano_obra_instalacion: 220,
            estado: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }, {
            _id: new ObjectId(),
            nombre: "Puerta PVC",
            descripcion: "Puertas de PVC con diferentes configuraciones",
            categoria: "puertas",
            mano_obra_fabricacion: 200,
            mano_obra_instalacion: 300,
            estado: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }, {
            _id: new ObjectId(),
            nombre: "Barandal",
            descripcion: "Barandales de diferentes materiales",
            categoria: "barandales",
            mano_obra_fabricacion: 120,
            mano_obra_instalacion: 180,
            estado: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }]));

        case 28:
          tiposProductoResult = _context.sent;
          tiposProducto = Object.values(tiposProductoResult.insertedIds);
          console.log("\u2705 ".concat(tiposProducto.length, " tipos de producto creados")); // Seed Proveedores

          console.log("🏢 Creando proveedores...");
          _context.next = 34;
          return regeneratorRuntime.awrap(db.collection("proveedores").insertMany([{
            _id: new ObjectId(),
            nombre: "Proveedor PVC Premium",
            contacto: "Juan Pérez",
            telefono: "555-0101",
            email: "juan@pvcpremium.com",
            direccion: "Av. Industrial 123",
            ciudad: "Ciudad de México",
            pais: "México",
            tipoMateriales: ["PVC", "Herrajes"],
            descuentoGeneral: 5,
            estado: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }, {
            _id: new ObjectId(),
            nombre: "Aluminio y Vidrios SA",
            contacto: "María González",
            telefono: "555-0202",
            email: "maria@aluvid.com",
            direccion: "Calle Aluminio 456",
            ciudad: "Guadalajara",
            pais: "México",
            tipoMateriales: ["Aluminio", "Vidrio"],
            descuentoGeneral: 8,
            estado: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }, {
            _id: new ObjectId(),
            nombre: "Herrajes y Accesorios",
            contacto: "Carlos Rodríguez",
            telefono: "555-0303",
            email: "carlos@herrajes.com",
            direccion: "Zona Industrial 789",
            ciudad: "Monterrey",
            pais: "México",
            tipoMateriales: ["Herrajes", "Accesorios"],
            descuentoGeneral: 3,
            estado: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }]));

        case 34:
          proveedoresResult = _context.sent;
          proveedores = Object.values(proveedoresResult.insertedIds);
          console.log("\u2705 ".concat(proveedores.length, " proveedores creados")); // Seed Materiales

          console.log("🔧 Creando materiales...");
          _context.next = 40;
          return regeneratorRuntime.awrap(db.collection("materiales").insertMany([{
            _id: new ObjectId(),
            nombre: "Perfil PVC Ventana",
            descripcion: "Perfil principal para ventanas de PVC",
            categoria: "PVC",
            unidad: "ml",
            costo: 45.5,
            stock: 1000,
            stockMinimo: 100,
            proveedor_id: proveedores[0],
            contribuyeMalla: false,
            estado: true,
            variantes: [{
              tipo: "color_pvc",
              nombre: "Blanco",
              costo_adicional: 0
            }, {
              tipo: "color_pvc",
              nombre: "Café",
              costo_adicional: 5
            }, {
              tipo: "color_pvc",
              nombre: "Negro",
              costo_adicional: 8
            }],
            createdAt: new Date(),
            updatedAt: new Date()
          }, {
            _id: new ObjectId(),
            nombre: "Perfil Aluminio Ventana",
            descripcion: "Perfil principal para ventanas de aluminio",
            categoria: "Aluminio",
            unidad: "ml",
            costo: 65.0,
            stock: 800,
            stockMinimo: 80,
            proveedor_id: proveedores[1],
            contribuyeMalla: false,
            estado: true,
            variantes: [{
              tipo: "color_aluminio",
              nombre: "Natural",
              costo_adicional: 0
            }, {
              tipo: "color_aluminio",
              nombre: "Bronce",
              costo_adicional: 12
            }, {
              tipo: "color_aluminio",
              nombre: "Negro",
              costo_adicional: 15
            }],
            createdAt: new Date(),
            updatedAt: new Date()
          }, {
            _id: new ObjectId(),
            nombre: "Vidrio Claro 6mm",
            descripcion: "Vidrio transparente de 6mm de espesor",
            categoria: "Vidrio",
            unidad: "m2",
            costo: 180.0,
            stock: 500,
            stockMinimo: 50,
            proveedor_id: proveedores[1],
            contribuyeMalla: false,
            estado: true,
            variantes: [{
              tipo: "tipo_vidrio",
              nombre: "Claro",
              costo_adicional: 0
            }, {
              tipo: "tipo_vidrio",
              nombre: "Bronce",
              costo_adicional: 25
            }, {
              tipo: "tipo_vidrio",
              nombre: "Azul",
              costo_adicional: 30
            }],
            createdAt: new Date(),
            updatedAt: new Date()
          }, {
            _id: new ObjectId(),
            nombre: "Malla Mosquitera",
            descripcion: "Malla para mosquiteros",
            categoria: "Accesorios",
            unidad: "m2",
            costo: 25.0,
            stock: 200,
            stockMinimo: 20,
            proveedor_id: proveedores[2],
            contribuyeMalla: true,
            estado: true,
            variantes: [{
              tipo: "otro",
              nombre: "Estándar",
              costo_adicional: 0
            }, {
              tipo: "otro",
              nombre: "Reforzada",
              costo_adicional: 8
            }],
            createdAt: new Date(),
            updatedAt: new Date()
          }]));

        case 40:
          materialesResult = _context.sent;
          materiales = Object.values(materialesResult.insertedIds);
          console.log("\u2705 ".concat(materiales.length, " materiales creados")); // Seed Productos

          console.log("🏗️ Creando productos...");
          _context.next = 46;
          return regeneratorRuntime.awrap(db.collection("productos").insertMany([{
            _id: new ObjectId(),
            nombre: "Ventana PVC 2 Hojas",
            codigo: "PROD-001",
            identificador: "VEN-PVC-2H",
            descripcion: "Ventana de PVC con 2 hojas corredizas",
            tipo_producto_id: tiposProducto[0],
            user_id: new ObjectId(),
            imagen: "/placeholder.svg?height=200&width=200",
            svg: '<rect width="100" height="60" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>',
            proveedor_id: proveedores[0],
            margen_ganancia: 35,
            estado: true,
            materiales: [{
              material_id: materiales[0],
              formula: "REDONDEAR.MENOS((ancho + alto) * 2 / 100, 0) * 100"
            }, {
              material_id: materiales[2],
              formula: "REDONDEAR.MENOS(ancho * alto / 10000, 2)"
            }, {
              material_id: materiales[3],
              formula: "SI(malla = 1, REDONDEAR.MENOS(ancho * alto / 10000, 2), 0)"
            }],
            createdAt: new Date(),
            updatedAt: new Date()
          }, {
            _id: new ObjectId(),
            nombre: "Ventana Aluminio 3 Hojas",
            codigo: "PROD-002",
            identificador: "VEN-ALU-3H",
            descripcion: "Ventana de aluminio con 3 hojas corredizas",
            tipo_producto_id: tiposProducto[1],
            user_id: new ObjectId(),
            imagen: "/placeholder.svg?height=200&width=200",
            svg: '<rect width="120" height="60" fill="#d1d5db" stroke="#374151" stroke-width="2"/>',
            proveedor_id: proveedores[1],
            margen_ganancia: 40,
            estado: true,
            materiales: [{
              material_id: materiales[1],
              formula: "REDONDEAR.MENOS((ancho + alto) * 2.5 / 100, 0) * 100"
            }, {
              material_id: materiales[2],
              formula: "REDONDEAR.MENOS(ancho * alto / 10000, 2)"
            }],
            createdAt: new Date(),
            updatedAt: new Date()
          }]));

        case 46:
          console.log("✅ 2 productos creados");
          console.log("🎉 ¡Base de datos inicializada correctamente!"); // Mostrar resumen

          console.log("\n📊 RESUMEN:");
          console.log("- Tipos de producto: ".concat(tiposProducto.length));
          console.log("- Proveedores: ".concat(proveedores.length));
          console.log("- Materiales: ".concat(materiales.length));
          console.log("- Productos: 2");
          _context.next = 58;
          break;

        case 55:
          _context.prev = 55;
          _context.t1 = _context["catch"](1);
          console.error("❌ Error inicializando base de datos:", _context.t1);

        case 58:
          _context.prev = 58;
          _context.next = 61;
          return regeneratorRuntime.awrap(client.close());

        case 61:
          console.log("🔌 Conexión cerrada");
          return _context.finish(58);

        case 63:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 55, 58, 63], [16, 22]]);
} // Ejecutar si se llama directamente


if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase: seedDatabase
};
//# sourceMappingURL=seed-mongodb.dev.js.map
