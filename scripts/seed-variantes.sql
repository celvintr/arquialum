-- Crear colores PVC
INSERT INTO color_pvc (nombre, codigo, descripcion, isActive) VALUES
('Blanco', 'PVC-001', 'Color blanco estándar', true),
('Café', 'PVC-002', 'Color café oscuro', true),
('Negro', 'PVC-003', 'Color negro mate', true),
('Gris', 'PVC-004', 'Color gris medio', true);

-- Crear colores Aluminio
INSERT INTO color_aluminio (nombre, codigo, descripcion, isActive) VALUES
('Natural', 'ALU-001', 'Aluminio natural', true),
('Bronce', 'ALU-002', 'Aluminio color bronce', true),
('Negro', 'ALU-003', 'Aluminio negro', true),
('Blanco', 'ALU-004', 'Aluminio blanco', true);

-- Crear tipos de vidrio
INSERT INTO tipo_vidrio (nombre, descripcion, espesor, isActive) VALUES
('Claro 6mm', 'Vidrio claro de 6mm', 6, true),
('Bronce 6mm', 'Vidrio bronce de 6mm', 6, true),
('Templado 10mm', 'Vidrio templado de 10mm', 10, true),
('Laminado 6+6', 'Vidrio laminado 6+6mm', 12, true);
