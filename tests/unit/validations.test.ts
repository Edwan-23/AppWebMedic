import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema de validación para publicaciones (ejemplo)
const publicacionSchema = z.object({
  hospital_id: z.number().positive(),
  medicamento_id: z.number().positive(),
  tipo_publicacion_id: z.number().positive(),
  cantidad: z.number().positive().int(),
  precio: z.number().positive().optional(),
  descripcion: z.string().min(10).optional(),
  reg_invima: z.string().optional(),
  fecha_expiracion: z.string().optional(),
});

describe('Validaciones Zod - Publicaciones', () => {
  it('✅ Valida publicación correcta', () => {
    const data = {
      hospital_id: 1,
      medicamento_id: 1,
      tipo_publicacion_id: 1,
      cantidad: 100,
      precio: 5000,
      descripcion: 'Medicamento en buen estado',
    };

    const result = publicacionSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('❌ Rechaza cantidad negativa', () => {
    const data = {
      hospital_id: 1,
      medicamento_id: 1,
      tipo_publicacion_id: 1,
      cantidad: -10,
    };

    const result = publicacionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('❌ Rechaza cantidad decimal', () => {
    const data = {
      hospital_id: 1,
      medicamento_id: 1,
      tipo_publicacion_id: 1,
      cantidad: 10.5,
    };

    const result = publicacionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('❌ Rechaza precio negativo', () => {
    const data = {
      hospital_id: 1,
      medicamento_id: 1,
      tipo_publicacion_id: 1,
      cantidad: 100,
      precio: -1000,
    };

    const result = publicacionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('❌ Rechaza descripción muy corta', () => {
    const data = {
      hospital_id: 1,
      medicamento_id: 1,
      tipo_publicacion_id: 1,
      cantidad: 100,
      descripcion: 'Corto',
    };

    const result = publicacionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('❌ Rechaza campos requeridos faltantes', () => {
    const data = {
      cantidad: 100,
    };

    const result = publicacionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

// Schema de validación para solicitudes
const solicitudSchema = z.object({
  hospital_id: z.number().positive(),
  publicacion_id: z.number().positive(),
  cantidad: z.number().positive().int(),
  observaciones: z.string().optional(),
});

describe('Validaciones Zod - Solicitudes', () => {
  it('✅ Valida solicitud correcta', () => {
    const data = {
      hospital_id: 1,
      publicacion_id: 1,
      cantidad: 10,
    };

    const result = solicitudSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('❌ Rechaza cantidad cero', () => {
    const data = {
      hospital_id: 1,
      publicacion_id: 1,
      cantidad: 0,
    };

    const result = solicitudSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
