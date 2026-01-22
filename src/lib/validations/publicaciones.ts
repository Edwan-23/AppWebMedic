import { z } from "zod";

export const publicacionCreateSchema = z.object({
  hospital_id: z.number().positive(),
  tipo_publicacion_id: z.number().positive(),
  cantidad: z.number().positive(),
  reg_invima: z.string().min(1, "Registro INVIMA es requerido"),
  fecha_expiracion: z.string().min(1, "Fecha de expiración es requerida"),
  unidad_dispensacion_id: z.number().positive(),
  descripcion: z.string().optional(),
  imagen: z.string().optional(),
  
  // Campos de la API de datos.gov.co
  principioactivo: z.string().min(1, "Principio activo es requerido"),
  cantidadcum: z.string().min(1, "Cantidad CUM es requerida"),
  unidadmedida: z.string().min(1, "Unidad de medida es requerida"),
  formafarmaceutica: z.string().min(1, "Forma farmacéutica es requerida"),
  titular: z.string().min(1, "Titular es requerido"),
  descripcioncomercial: z.string().min(1, "Descripción comercial es requerida"),
});

export const publicacionUpdateSchema = z.object({
  cantidad: z.number().positive().optional(),
  reg_invima: z.string().min(1).optional(),
  fecha_expiracion: z.string().min(1).optional(),
  unidad_dispensacion_id: z.number().positive().optional(),
  descripcion: z.string().optional(),
  imagen: z.string().optional(),
  estado_publicacion_id: z.number().positive().optional(),
  
  // Campos de la API (generalmente no se editan, pero se permiten)
  principioactivo: z.string().min(1).optional(),
  cantidadcum: z.string().min(1).optional(),
  unidadmedida: z.string().min(1).optional(),
  formafarmaceutica: z.string().min(1).optional(),
  titular: z.string().min(1).optional(),
  descripcioncomercial: z.string().min(1).optional(),
});

export type PublicacionCreate = z.infer<typeof publicacionCreateSchema>;
export type PublicacionUpdate = z.infer<typeof publicacionUpdateSchema>;
