import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { prisma } from '@/lib/prisma';

// Base URL de la aplicación Next.js
const baseURL = 'http://localhost:3000';

describe('API Integration - Publicaciones', () => {
  let testHospitalId: number;
  let testMedicamentoId: number;
  let testTipoPublicacionId: number;
  let testPublicacionId: number;

  beforeAll(async () => {
    // Setup: Crear datos de prueba
    console.log('🧪 Setup: Creando datos de prueba...');

    // Verificar que existan datos básicos
    const hospital = await prisma.hospitales.findFirst();
    const medicamento = await prisma.medicamentos.findFirst();
    const tipoPublicacion = await prisma.tipo_publicacion.findFirst({
      where: { nombre: 'Venta' }
    });

    if (!hospital || !medicamento) {
      console.log('⚠️ Faltan datos básicos (hospital, medicamento), se omitirán algunos tests');
    }
    
    if (!tipoPublicacion) {
      console.log('⚠️ No existe tipo_publicacion "Venta", se omitirán tests de creación');
    }

    testHospitalId = hospital ? Number(hospital.id) : 0;
    testMedicamentoId = medicamento ? Number(medicamento.id) : 0;
    testTipoPublicacionId = tipoPublicacion ? Number(tipoPublicacion.id) : 0;
  });

  afterAll(async () => {
    // Cleanup: Limpiar datos de prueba creados
    console.log('🧹 Cleanup: Eliminando publicaciones de prueba...');
    
    if (testPublicacionId) {
      try {
        await prisma.publicaciones.delete({
          where: { id: BigInt(testPublicacionId) }
        });
      } catch (error) {
        // Ignorar si ya fue eliminada
      }
    }

    await prisma.$disconnect();
  });

  describe('POST /api/publicaciones', () => {
    it('✅ Crea publicación correctamente', async () => {
      if (!testHospitalId || !testMedicamentoId || !testTipoPublicacionId) {
        console.log('⏭️ Skip: Faltan datos básicos (hospital, medicamento, tipo_publicacion)');
        return;
      }

      const nuevaPublicacion = {
        hospital_id: testHospitalId,
        medicamento_id: testMedicamentoId,
        tipo_publicacion_id: 1,
        cantidad: 100,
        precio: 5000,
        descripcion: 'Medicamento de prueba para testing',
        reg_invima: 'TEST-2024-001',
        fecha_expiracion: '2026-12-31',
      };

      const response = await request(baseURL)
        .post('/api/publicaciones')
        .send(nuevaPublicacion);

      if (response.status !== 201) {
        console.error('❌ Error en POST publicaciones:', response.status, response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body.mensaje).toBe('Publicación creada exitosamente');
      expect(response.body.publicacion).toBeDefined();
      
      testPublicacionId = parseInt(response.body.publicacion.id);
    });

    it('❌ Rechaza publicación sin campos requeridos', async () => {
      const publicacionInvalida = {
        cantidad: 100,
      };

      const response = await request(baseURL)
        .post('/api/publicaciones')
        .send(publicacionInvalida);

      expect(response.status).toBe(400);
    });

    it('❌ Rechaza cantidad negativa', async () => {
      const publicacionInvalida = {
        hospital_id: testHospitalId,
        medicamento_id: testMedicamentoId,
        tipo_publicacion_id: 1,
        cantidad: -10,
      };

      const response = await request(baseURL)
        .post('/api/publicaciones')
        .send(publicacionInvalida);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/publicaciones', () => {
    it('✅ Obtiene lista de publicaciones', async () => {
      const response = await request(baseURL)
        .get('/api/publicaciones')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.publicaciones)).toBe(true);
    });

    it('✅ Filtra publicaciones por estado', async () => {
      const response = await request(baseURL)
        .get('/api/publicaciones')
        .query({ estado: 'Disponible' });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('✅ Busca publicaciones por nombre', async () => {
      const response = await request(baseURL)
        .get('/api/publicaciones')
        .query({ search: 'Acetaminofén' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/publicaciones/[id]', () => {
    it('✅ Obtiene publicación por ID', async () => {
      if (!testPublicacionId) {
        console.log('⏭️ Skip: No hay publicación de prueba creada');
        return;
      }

      const response = await request(baseURL)
        .get(`/api/publicaciones/${testPublicacionId}`);

      expect(response.status).toBe(200);
      expect(response.body.publicacion).toBeDefined();
      expect(parseInt(response.body.publicacion.id)).toBe(testPublicacionId);
    });

    it('❌ Error 404 para publicación inexistente', async () => {
      const response = await request(baseURL)
        .get('/api/publicaciones/999999');

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/publicaciones/[id]', () => {
    it('✅ Elimina publicación correctamente', async () => {
      if (!testPublicacionId) {
        console.log('⏭️ Skip: No hay publicación de prueba creada');
        return;
      }

      const response = await request(baseURL)
        .delete(`/api/publicaciones/${testPublicacionId}`);

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBeDefined();

      // Verificar que fue eliminada
      const verificacion = await request(baseURL)
        .get(`/api/publicaciones/${testPublicacionId}`);

      expect(verificacion.status).toBe(404);

      // Marcar como eliminada para evitar cleanup duplicado
      testPublicacionId = 0;
    });
  });
});
