export const hospitalTest = {
  id: BigInt(1),
  nombre: "Hospital Test",
  direccion: "Calle Test 123",
  telefono: "3001234567",
  email: "test@hospital.com",
  created_at: new Date(),
  updated_at: new Date(),
};

export const usuarioTest = {
  id: BigInt(1),
  nombre: "Usuario Test",
  email: "usuario@test.com",
  password: "hashedPassword123",
  rol: "admin",
  hospital_id: BigInt(1),
  created_at: new Date(),
  updated_at: new Date(),
};

export const medicamentoTest = {
  id: BigInt(1),
  nombre: "Acetaminofén",
  descripcion: "Analgésico y antipirético",
  fabricante: "Farmacia Test",
  created_at: new Date(),
  updated_at: new Date(),
};

export const publicacionTest = {
  hospital_id: 1,
  medicamento_id: 1,
  tipo_publicacion_id: 1,
  cantidad: 100,
  precio: 5000,
  descripcion: "Medicamento en buen estado",
  reg_invima: "2024-001",
  fecha_expiracion: new Date("2026-12-31"),
};

export const solicitudTest = {
  hospital_id: 1,
  publicacion_id: 1,
  cantidad: 10,
  observaciones: "Solicitud de prueba",
};
