-- Script para crear un usuario de prueba en MongoDB
-- Ejecutar en MongoDB Compass o shell

use desarrollo;

// Crear un usuario de prueba
db.users.insertOne({
  name: "Admin Test",
  email: "admin@test.com",
  password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Crear un vendedor de prueba
db.users.insertOne({
  name: "Vendedor Test",
  email: "vendedor@test.com", 
  password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
  role: "vendedor",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

console.log("✅ Usuarios de prueba creados:");
console.log("Admin: admin@test.com / password");
console.log("Vendedor: vendedor@test.com / password");
