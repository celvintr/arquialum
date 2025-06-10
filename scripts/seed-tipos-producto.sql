-- Crear colección de tipos de producto
db.tipos_producto.insertMany([
  {
    nombre: "Ventana",
    descripcion: "Ventanas de diferentes materiales y estilos",
    estado: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nombre: "Puerta",
    descripcion: "Puertas de acceso y interiores",
    estado: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nombre: "Barandal",
    descripcion: "Barandales de seguridad y decorativos",
    estado: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nombre: "Mampara",
    descripcion: "Mamparas para baño y divisiones",
    estado: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nombre: "Fachada",
    descripcion: "Elementos de fachada y revestimiento",
    estado: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

-- Crear colección de proveedores
db.proveedores.insertMany([
  {
    nombre: "Aluminios del Norte",
    contacto: "Juan Pérez",
    telefono: "+52 81 1234 5678",
    email: "contacto@aluminiosdelnorte.com",
    direccion: "Av. Industrial 123, Monterrey, NL",
    estado: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nombre: "PVC Sistemas",
    contacto: "María González",
    telefono: "+52 33 9876 5432",
    email: "ventas@pvcsistemas.com",
    direccion: "Calle Revolución 456, Guadalajara, JAL",
    estado: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nombre: "Vidrios Templados SA",
    contacto: "Carlos Rodríguez",
    telefono: "+52 55 5555 1234",
    email: "info@vidriostemplados.com",
    direccion: "Blvd. Manuel Ávila Camacho 789, CDMX",
    estado: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nombre: "Herrajes y Accesorios",
    contacto: "Ana López",
    telefono: "+52 81 8888 9999",
    email: "ventas@herrajesyaccesorios.com",
    direccion: "Zona Industrial, Apodaca, NL",
    estado: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
