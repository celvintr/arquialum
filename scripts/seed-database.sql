-- Script para crear datos de prueba en MongoDB
-- Este script se puede ejecutar después de configurar la base de datos

-- Crear usuario administrador
db.users.insertOne({
  name: "Administrador",
  email: "admin@demo.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LQ4YCOuLQv3c1yqBWVHxkd0LQ4YCOuLQv3c1yq", // 123456
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

-- Crear proveedores de ejemplo
db.proveedores.insertMany([
  {
    nombre: "Naufar",
    contacto: "Juan Pérez",
    telefono: "555-0001",
    email: "contacto@naufar.com",
    direccion: "Av. Industrial 123",
    ciudad: "Guadalajara",
    pais: "México",
    tipoMateriales: ["aluminio", "vidrio"],
    descuentoGeneral: 5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nombre: "Vitro",
    contacto: "María García",
    telefono: "555-0002", 
    email: "ventas@vitro.com",
    direccion: "Blvd. Cristal 456",
    ciudad: "Monterrey",
    pais: "México",
    tipoMateriales: ["vidrio", "cristal"],
    descuentoGeneral: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

-- Crear materiales de ejemplo
db.materiales.insertMany([
  {
    nombre: "Perfil de Aluminio 2x1",
    descripcion: "Perfil de aluminio para marcos de ventana",
    categoria: "aluminio",
    costo: 85.50,
    unidadMedida: "metro",
    formula: "(ancho + alto) * 2",
    proveedor: {
      id: ObjectId(), // Se debe reemplazar con ID real del proveedor
      nombre: "Naufar",
      descuento: 5
    },
    variantes: [
      {
        tipo: "color_aluminio",
        nombre: "Natural",
        codigo: "ALU-NAT",
        precioUnitario: 85.50,
        descuento: 0,
        isActive: true
      },
      {
        tipo: "color_aluminio", 
        nombre: "Blanco",
        codigo: "ALU-BLA",
        precioUnitario: 95.50,
        descuento: 0,
        isActive: true
      }
    ],
    stock: 500,
    stockMinimo: 50,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nombre: "Vidrio Claro 6mm",
    descripcion: "Vidrio transparente de 6mm de grosor",
    categoria: "vidrio",
    costo: 120.00,
    unidadMedida: "m2",
    formula: "ancho * alto",
    proveedor: {
      id: ObjectId(), // Se debe reemplazar con ID real del proveedor
      nombre: "Vitro",
      descuento: 3
    },
    variantes: [
      {
        tipo: "tipo_vidrio",
        nombre: "Claro",
        codigo: "VID-CLA-6",
        precioUnitario: 120.00,
        descuento: 0,
        isActive: true
      },
      {
        tipo: "tipo_vidrio",
        nombre: "Bronce",
        codigo: "VID-BRO-6", 
        precioUnitario: 135.00,
        descuento: 0,
        isActive: true
      }
    ],
    stock: 200,
    stockMinimo: 20,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
