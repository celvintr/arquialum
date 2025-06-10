"use strict";

var mongoose = require("mongoose");

var bcrypt = require("bcryptjs"); // Conectar a MongoDB


var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cotizacion";

function seedDatabase() {
  var proveedorSchema, tipoProductoSchema, materialSchema, productoSchema, clienteSchema, grupoSchema, cotizacionSchema, cotizacionItemSchema, reparacionSchema, userSchema, Proveedor, TipoProducto, Material, Producto, Cliente, Grupo, Cotizacion, CotizacionItem, Reparacion, User, hashedPassword, users, proveedores, tiposProducto, materiales, productos, reparaciones, clientes, cotizacion, grupos, items, subtotal, impuestos, total;
  return regeneratorRuntime.async(function seedDatabase$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          console.log("🔗 Conectando a MongoDB...");
          _context.next = 4;
          return regeneratorRuntime.awrap(mongoose.connect(MONGODB_URI));

        case 4:
          console.log("✅ Conectado a MongoDB"); // Definir esquemas

          proveedorSchema = new mongoose.Schema({
            nombre: String,
            contacto: String,
            telefono: String,
            email: String,
            direccion: String,
            ciudad: String,
            pais: String,
            tipoMateriales: [String],
            descuentoGeneral: Number,
            estado: Boolean
          }, {
            timestamps: true
          });
          tipoProductoSchema = new mongoose.Schema({
            nombre: String,
            descripcion: String,
            categoria: String,
            mano_obra_fabricacion: Number,
            mano_obra_instalacion: Number,
            estado: Boolean
          }, {
            timestamps: true
          });
          materialSchema = new mongoose.Schema({
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
            variantes: [{
              tipo: String,
              nombre: String,
              costo_adicional: Number
            }]
          }, {
            timestamps: true
          });
          productoSchema = new mongoose.Schema({
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
            materiales: [{
              material_id: mongoose.Schema.Types.ObjectId,
              formula: String
            }]
          }, {
            timestamps: true
          });
          clienteSchema = new mongoose.Schema({
            nombre: String,
            email: String,
            telefono: String,
            direccion: String,
            ciudad: String,
            estado: Boolean
          }, {
            timestamps: true
          });
          grupoSchema = new mongoose.Schema({
            nombre: String,
            descripcion: String,
            cotizacion_id: mongoose.Schema.Types.ObjectId,
            orden: Number
          }, {
            timestamps: true
          });
          cotizacionSchema = new mongoose.Schema({
            numero: String,
            cliente_id: mongoose.Schema.Types.ObjectId,
            user_id: mongoose.Schema.Types.ObjectId,
            subtotal: Number,
            impuestos: Number,
            total: Number,
            estado: String,
            fecha_vencimiento: Date,
            notas: String
          }, {
            timestamps: true
          });
          cotizacionItemSchema = new mongoose.Schema({
            cotizacion_id: mongoose.Schema.Types.ObjectId,
            grupo_id: mongoose.Schema.Types.ObjectId,
            tipo: String,
            // producto, vidrio_templado, reparacion, libre
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
            orden: Number
          }, {
            timestamps: true
          });
          reparacionSchema = new mongoose.Schema({
            nombre: String,
            descripcion: String,
            categoria: String,
            precio_base: Number,
            tiempo_estimado: Number,
            estado: Boolean
          }, {
            timestamps: true
          });
          userSchema = new mongoose.Schema({
            name: String,
            email: String,
            password: String,
            role: String,
            isActive: Boolean
          }, {
            timestamps: true
          }); // Crear modelos

          Proveedor = mongoose.models.Proveedor || mongoose.model("Proveedor", proveedorSchema);
          TipoProducto = mongoose.models.TipoProducto || mongoose.model("TipoProducto", tipoProductoSchema);
          Material = mongoose.models.Material || mongoose.model("Material", materialSchema);
          Producto = mongoose.models.Producto || mongoose.model("Producto", productoSchema);
          Cliente = mongoose.models.Cliente || mongoose.model("Cliente", clienteSchema);
          Grupo = mongoose.models.Grupo || mongoose.model("Grupo", grupoSchema);
          Cotizacion = mongoose.models.Cotizacion || mongoose.model("Cotizacion", cotizacionSchema);
          CotizacionItem = mongoose.models.CotizacionItem || mongoose.model("CotizacionItem", cotizacionItemSchema);
          Reparacion = mongoose.models.Reparacion || mongoose.model("Reparacion", reparacionSchema);
          User = mongoose.models.User || mongoose.model("User", userSchema); // Limpiar datos existentes

          console.log("🧹 Limpiando datos existentes...");
          _context.next = 28;
          return regeneratorRuntime.awrap(Proveedor.deleteMany({}));

        case 28:
          _context.next = 30;
          return regeneratorRuntime.awrap(TipoProducto.deleteMany({}));

        case 30:
          _context.next = 32;
          return regeneratorRuntime.awrap(Material.deleteMany({}));

        case 32:
          _context.next = 34;
          return regeneratorRuntime.awrap(Producto.deleteMany({}));

        case 34:
          _context.next = 36;
          return regeneratorRuntime.awrap(Cliente.deleteMany({}));

        case 36:
          _context.next = 38;
          return regeneratorRuntime.awrap(Grupo.deleteMany({}));

        case 38:
          _context.next = 40;
          return regeneratorRuntime.awrap(Cotizacion.deleteMany({}));

        case 40:
          _context.next = 42;
          return regeneratorRuntime.awrap(CotizacionItem.deleteMany({}));

        case 42:
          _context.next = 44;
          return regeneratorRuntime.awrap(Reparacion.deleteMany({}));

        case 44:
          _context.next = 46;
          return regeneratorRuntime.awrap(User.deleteMany({}));

        case 46:
          // Crear usuarios
          console.log("👤 Creando usuarios...");
          _context.next = 49;
          return regeneratorRuntime.awrap(bcrypt.hash("password", 10));

        case 49:
          hashedPassword = _context.sent;
          _context.next = 52;
          return regeneratorRuntime.awrap(User.insertMany([{
            name: "Administrador",
            email: "admin@test.com",
            password: hashedPassword,
            role: "admin",
            isActive: true
          }, {
            name: "Vendedor",
            email: "vendedor@test.com",
            password: hashedPassword,
            role: "vendedor",
            isActive: true
          }]));

        case 52:
          users = _context.sent;
          console.log("\u2705 ".concat(users.length, " usuarios creados")); // Crear proveedores

          console.log("🏢 Creando proveedores...");
          _context.next = 57;
          return regeneratorRuntime.awrap(Proveedor.insertMany([{
            nombre: "Naufar",
            contacto: "Juan Pérez",
            telefono: "555-0001",
            email: "contacto@naufar.com",
            direccion: "Av. Industrial 123",
            ciudad: "Guadalajara",
            pais: "México",
            tipoMateriales: ["aluminio", "vidrio"],
            descuentoGeneral: 5,
            estado: true
          }, {
            nombre: "Vitro",
            contacto: "María García",
            telefono: "555-0002",
            email: "ventas@vitro.com",
            direccion: "Blvd. Cristal 456",
            ciudad: "Monterrey",
            pais: "México",
            tipoMateriales: ["vidrio", "cristal"],
            descuentoGeneral: 3,
            estado: true
          }, {
            nombre: "Herrajes SA",
            contacto: "Carlos Rodríguez",
            telefono: "555-0003",
            email: "info@herrajessa.com",
            direccion: "Calle Industria 789",
            ciudad: "Ciudad de México",
            pais: "México",
            tipoMateriales: ["herrajes", "accesorios"],
            descuentoGeneral: 8,
            estado: true
          }]));

        case 57:
          proveedores = _context.sent;
          console.log("\u2705 ".concat(proveedores.length, " proveedores creados")); // Crear tipos de producto

          console.log("📦 Creando tipos de producto...");
          _context.next = 62;
          return regeneratorRuntime.awrap(TipoProducto.insertMany([{
            nombre: "Ventana PVC",
            descripcion: "Ventanas de PVC con diferentes configuraciones",
            categoria: "ventanas",
            mano_obra_fabricacion: 150,
            mano_obra_instalacion: 200,
            estado: true
          }, {
            nombre: "Ventana Aluminio",
            descripcion: "Ventanas de aluminio con diferentes configuraciones",
            categoria: "ventanas",
            mano_obra_fabricacion: 180,
            mano_obra_instalacion: 220,
            estado: true
          }, {
            nombre: "Puerta PVC",
            descripcion: "Puertas de PVC con diferentes configuraciones",
            categoria: "puertas",
            mano_obra_fabricacion: 200,
            mano_obra_instalacion: 300,
            estado: true
          }, {
            nombre: "Vidrio Templado",
            descripcion: "Trabajos con vidrio templado como barandales y divisiones",
            categoria: "vidrios_templados",
            mano_obra_fabricacion: 250,
            mano_obra_instalacion: 350,
            estado: true
          }]));

        case 62:
          tiposProducto = _context.sent;
          console.log("\u2705 ".concat(tiposProducto.length, " tipos de producto creados")); // Crear materiales

          console.log("🔧 Creando materiales...");
          _context.next = 67;
          return regeneratorRuntime.awrap(Material.insertMany([{
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
            }]
          }, {
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
            }]
          }, {
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
            }]
          }, {
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
            variantes: [{
              tipo: "tipo_vidrio",
              nombre: "Claro",
              costo_adicional: 0
            }, {
              tipo: "tipo_vidrio",
              nombre: "Esmerilado",
              costo_adicional: 120
            }, {
              tipo: "tipo_vidrio",
              nombre: "Satinado",
              costo_adicional: 150
            }]
          }, {
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
            variantes: [{
              tipo: "otro",
              nombre: "Acero Inoxidable",
              costo_adicional: 0
            }, {
              tipo: "otro",
              nombre: "Cromado",
              costo_adicional: 200
            }]
          }, {
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
            variantes: [{
              tipo: "otro",
              nombre: "Estándar",
              costo_adicional: 0
            }, {
              tipo: "otro",
              nombre: "Reforzada",
              costo_adicional: 8
            }]
          }]));

        case 67:
          materiales = _context.sent;
          console.log("\u2705 ".concat(materiales.length, " materiales creados")); // Crear productos

          console.log("🏗️ Creando productos...");
          _context.next = 72;
          return regeneratorRuntime.awrap(Producto.insertMany([{
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
            materiales: [{
              material_id: materiales[0]._id,
              formula: "REDONDEAR.MENOS((ancho + alto) * 2 / 100, 0) * 100"
            }, {
              material_id: materiales[2]._id,
              formula: "REDONDEAR.MENOS(ancho * alto / 10000, 2)"
            }, {
              material_id: materiales[5]._id,
              formula: "SI(malla = 1, REDONDEAR.MENOS(ancho * alto / 10000, 2), 0)"
            }]
          }, {
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
            materiales: [{
              material_id: materiales[1]._id,
              formula: "REDONDEAR.MENOS((ancho + alto) * 2.5 / 100, 0) * 100"
            }, {
              material_id: materiales[2]._id,
              formula: "REDONDEAR.MENOS(ancho * alto / 10000, 2)"
            }]
          }, {
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
            materiales: [{
              material_id: materiales[0]._id,
              formula: "REDONDEAR.MENOS((ancho + alto) * 2.2 / 100, 0) * 100"
            }, {
              material_id: materiales[2]._id,
              formula: "REDONDEAR.MENOS(ancho * alto * 0.6 / 10000, 2)"
            }]
          }, {
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
            materiales: [{
              material_id: materiales[3]._id,
              formula: "REDONDEAR.MENOS(ancho * alto / 10000, 2)"
            }, {
              material_id: materiales[4]._id,
              formula: "REDONDEAR.MENOS(ancho / 100, 0) + 1"
            }]
          }]));

        case 72:
          productos = _context.sent;
          console.log("\u2705 ".concat(productos.length, " productos creados")); // Crear reparaciones

          console.log("🔨 Creando reparaciones...");
          _context.next = 77;
          return regeneratorRuntime.awrap(Reparacion.insertMany([{
            nombre: "Cambio de Vidrio",
            descripcion: "Cambio de vidrio roto en ventana existente",
            categoria: "Reparación Vidrios",
            precio_base: 350,
            tiempo_estimado: 2,
            estado: true
          }, {
            nombre: "Ajuste de Herrajes",
            descripcion: "Ajuste y lubricación de herrajes en ventanas o puertas",
            categoria: "Reparación Herrajes",
            precio_base: 180,
            tiempo_estimado: 1,
            estado: true
          }, {
            nombre: "Sellado de Filtraciones",
            descripcion: "Sellado de filtraciones de agua en ventanas o puertas",
            categoria: "Impermeabilización",
            precio_base: 250,
            tiempo_estimado: 1.5,
            estado: true
          }]));

        case 77:
          reparaciones = _context.sent;
          console.log("\u2705 ".concat(reparaciones.length, " reparaciones creadas")); // Crear clientes

          console.log("👥 Creando clientes...");
          _context.next = 82;
          return regeneratorRuntime.awrap(Cliente.insertMany([{
            nombre: "Juan Pérez",
            email: "juan@example.com",
            telefono: "555-1234",
            direccion: "Calle Principal 123",
            ciudad: "Ciudad de México",
            estado: true
          }, {
            nombre: "Constructora Moderna SA",
            email: "contacto@constructoramoderna.com",
            telefono: "555-5678",
            direccion: "Av. Reforma 456",
            ciudad: "Guadalajara",
            estado: true
          }, {
            nombre: "María González",
            email: "maria@example.com",
            telefono: "555-9012",
            direccion: "Blvd. Las Palmas 789",
            ciudad: "Monterrey",
            estado: true
          }]));

        case 82:
          clientes = _context.sent;
          console.log("\u2705 ".concat(clientes.length, " clientes creados")); // Crear cotización de ejemplo

          console.log("📝 Creando cotización de ejemplo...");
          _context.next = 87;
          return regeneratorRuntime.awrap(Cotizacion.create({
            numero: "COT-2024-001",
            cliente_id: clientes[0]._id,
            user_id: users[1]._id,
            subtotal: 0,
            impuestos: 0,
            total: 0,
            estado: "borrador",
            fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            notas: "Cotización de ejemplo con múltiples productos y grupos"
          }));

        case 87:
          cotizacion = _context.sent;
          // Crear grupos
          console.log("📋 Creando grupos...");
          _context.next = 91;
          return regeneratorRuntime.awrap(Grupo.insertMany([{
            nombre: "Fachada Principal",
            descripcion: "Elementos para la fachada principal",
            cotizacion_id: cotizacion._id,
            orden: 1
          }, {
            nombre: "Interior Planta Baja",
            descripcion: "Elementos para el interior de la planta baja",
            cotizacion_id: cotizacion._id,
            orden: 2
          }]));

        case 91:
          grupos = _context.sent;
          console.log("\u2705 ".concat(grupos.length, " grupos creados")); // Crear items de cotización

          console.log("📊 Creando items de cotización...");
          _context.next = 96;
          return regeneratorRuntime.awrap(CotizacionItem.insertMany([{
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
            orden: 1
          }, {
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
            orden: 2
          }, {
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
            orden: 1
          }, {
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
            orden: 2
          }, {
            cotizacion_id: cotizacion._id,
            grupo_id: grupos[1]._id,
            tipo: "reparacion",
            descripcion: "Ajuste de Herrajes en ventanas existentes",
            cantidad: 3,
            precio_unitario: 180,
            subtotal: 540,
            orden: 3
          }, {
            cotizacion_id: cotizacion._id,
            grupo_id: grupos[0]._id,
            tipo: "libre",
            descripcion: "Instalación y materiales adicionales",
            cantidad: 1,
            precio_unitario: 1200,
            subtotal: 1200,
            orden: 3
          }]));

        case 96:
          items = _context.sent;
          console.log("\u2705 ".concat(items.length, " items de cotizaci\xF3n creados")); // Actualizar totales de la cotización

          subtotal = items.reduce(function (sum, item) {
            return sum + item.subtotal;
          }, 0);
          impuestos = subtotal * 0.16;
          total = subtotal + impuestos;
          _context.next = 103;
          return regeneratorRuntime.awrap(Cotizacion.updateOne({
            _id: cotizacion._id
          }, {
            subtotal: subtotal,
            impuestos: impuestos,
            total: total
          }));

        case 103:
          console.log("✅ Totales de cotización actualizados");
          console.log("\n🎉 ¡Datos de ejemplo creados exitosamente!");
          console.log("\n📊 Resumen:");
          console.log("- Usuarios: ".concat(users.length));
          console.log("- Proveedores: ".concat(proveedores.length));
          console.log("- Tipos de Producto: ".concat(tiposProducto.length));
          console.log("- Materiales: ".concat(materiales.length));
          console.log("- Productos: ".concat(productos.length));
          console.log("- Reparaciones: ".concat(reparaciones.length));
          console.log("- Clientes: ".concat(clientes.length));
          console.log("- Grupos: ".concat(grupos.length));
          console.log("- Items de Cotizaci\xF3n: ".concat(items.length));
          console.log("\n🔑 Credenciales de acceso:");
          console.log("- Admin: admin@test.com / password");
          console.log("- Vendedor: vendedor@test.com / password");
          _context.next = 123;
          break;

        case 120:
          _context.prev = 120;
          _context.t0 = _context["catch"](0);
          console.error("❌ Error:", _context.t0);

        case 123:
          _context.prev = 123;
          _context.next = 126;
          return regeneratorRuntime.awrap(mongoose.disconnect());

        case 126:
          console.log("🔌 Conexión cerrada");
          return _context.finish(123);

        case 128:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 120, 123, 128]]);
} // Ejecutar la función


seedDatabase();
//# sourceMappingURL=seed-completo-real.dev.js.map
