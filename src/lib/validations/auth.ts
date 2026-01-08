import { z } from "zod";

export const registroUsuarioSchema = z.object({
  nombres: z
    .string()
    .min(2, "Los nombres deben tener al menos 2 caracteres")
    .max(50, "Los nombres no pueden exceder 50 caracteres"),
  
  apellidos: z
    .string()
    .min(2, "Los apellidos deben tener al menos 2 caracteres")
    .max(50, "Los apellidos no pueden exceder 50 caracteres"),
  
  fecha_nacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 100;
    }, "Debe ser mayor de 18 años")
    .optional(),
  
  sexo: z
    .enum(["Hombre", "Mujer", "Otro"], {
      message: "Seleccione un sexo válido",
    })
    .optional(),
  
  cedula: z
    .string()
    .min(8, "La cédula debe tener al menos 8 dígitos")
    .max(12, "La cédula no puede exceder 12 dígitos")
    .regex(/^[0-9]+$/, "Solo se permiten números"),
  
  correo_corporativo: z
    .string()
    .email("Correo electrónico inválido")
    .toLowerCase(),
  
  celular: z
    .string()
    .length(10, "El celular debe tener exactamente 10 dígitos")
    .regex(/^[0-9]+$/, "Solo se permiten números")
    .optional(),
  
  numero_tarjeta_profesional: z
    .string()
    .max(50, "El número de tarjeta profesional no puede exceder 50 caracteres")
    .optional(),
  
  hospital_id: z
    .number()
    .int("El hospital debe ser un número entero")
    .positive("Debe seleccionar un hospital")
    .optional(),
  
  contrasena: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "al menos una mayúscula, una minúscula y un número"
    ),
  
  confirmar_contrasena: z.string(),
}).refine((data) => data.contrasena === data.confirmar_contrasena, {
  message: "Las contraseñas no coinciden",
  path: ["confirmar_contrasena"],
});

export type RegistroUsuarioInput = z.infer<typeof registroUsuarioSchema>;

// Schema para inicio de sesión
export const inicioSesionSchema = z.object({
  correo_corporativo: z
    .string()
    .min(1, "El correo es requerido")
    .email("Correo electrónico inválido")
    .toLowerCase(),
  
  contrasena: z
    .string()
    .min(1, "La contraseña es requerida"),
  
  recordar: z.boolean().optional(),
});

export type InicioSesionInput = z.infer<typeof inicioSesionSchema>;
