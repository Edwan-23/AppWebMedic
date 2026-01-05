import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { prisma } from '@/lib/prisma';

const baseURL = 'http://localhost:3000';

describe('API Integration - Notificaciones', () => {
  let testHospitalId: number;
  let testNotificacionId: number;

  beforeAll(async () => {
    console.log('🧪 Setup: Buscando hospital para pruebas...');

    const hospital = await prisma.hospitales.findFirst();
    if (!hospital) {
      throw new Error('Se requiere al menos un hospital en la BD de test');
    }

    testHospitalId = Number(hospital.id);
  });

  afterAll(async () => {
    console.log('🧹 Cleanup: Eliminando notificaciones de prueba...');
    
    if (testNotificacionId) {
      try {
        await prisma.notificaciones.delete({
          where: { id: BigInt(testNotificacionId) }
        });
      } catch (error) {
        // Ignorar si ya fue eliminada
      }
    }

    await prisma.$disconnect();
  });

  describe('POST /api/notificaciones', () => {
    it('✅ Crea notificación correctamente', async () => {
      const nuevaNotificacion = {
        hospital_id: testHospitalId,
        tipo: 'publicacion',
        titulo: 'Test Notificación',
        mensaje: 'Esta es una notificación de prueba',
      };

      const response = await request(baseURL)
        .post('/api/notificaciones')
        .send(nuevaNotificacion);

      if (response.status !== 201) {
        console.error('❌ Error en POST notificaciones:', response.status, response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.notificacion).toBeDefined();
      
      testNotificacionId = response.body.notificacion.id;
    });

    it('❌ Rechaza notificación sin hospital_id', async () => {
      const notificacionInvalida = {
        tipo: 'publicacion',
        titulo: 'Test',
        mensaje: 'Test',
      };

      const response = await request(baseURL)
        .post('/api/notificaciones')
        .send(notificacionInvalida);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/notificaciones', () => {
    it('✅ Obtiene notificaciones del hospital', async () => {
      const response = await request(baseURL)
        .get('/api/notificaciones')
        .query({ hospital_id: testHospitalId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.notificaciones)).toBe(true);
    });

    it('✅ Limita a máximo 7 notificaciones', async () => {
      const response = await request(baseURL)
        .get('/api/notificaciones')
        .query({ hospital_id: testHospitalId });

      expect(response.status).toBe(200);
      expect(response.body.notificaciones.length).toBeLessThanOrEqual(7);
    });

    it('❌ Requiere hospital_id', async () => {
      const response = await request(baseURL)
        .get('/api/notificaciones');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('hospital_id');
    });
  });

  describe('PATCH /api/notificaciones/[id]', () => {
    it('✅ Marca notificación como leída', async () => {
      if (!testNotificacionId) {
        console.log('⏭️ Skip: No hay notificación de prueba');
        return;
      }

      const response = await request(baseURL)
        .patch(`/api/notificaciones/${testNotificacionId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verificar en BD
      const notificacion = await prisma.notificaciones.findUnique({
        where: { id: BigInt(testNotificacionId) }
      });

      expect(notificacion?.leida).toBe(true);
    });

    it('❌ Error 404 para notificación inexistente', async () => {
      const response = await request(baseURL)
        .patch('/api/notificaciones/999999');

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/notificaciones/[id]', () => {
    it('✅ Elimina notificación correctamente', async () => {
      if (!testNotificacionId) {
        console.log('⏭️ Skip: No hay notificación de prueba');
        return;
      }

      const response = await request(baseURL)
        .delete(`/api/notificaciones/${testNotificacionId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verificar eliminación
      const notificacion = await prisma.notificaciones.findUnique({
        where: { id: BigInt(testNotificacionId) }
      });

      expect(notificacion).toBeNull();

      testNotificacionId = 0;
    });
  });

  describe('Limpieza Automática de Notificaciones', () => {
    it('✅ Limita notificaciones a 20 por hospital', async () => {
      // Este test valida la lógica de limpieza en GET
      const response = await request(baseURL)
        .get('/api/notificaciones')
        .query({ hospital_id: testHospitalId });

      expect(response.status).toBe(200);
      
      // Verificar en BD que no hay más de 20
      const count = await prisma.notificaciones.count({
        where: { hospital_id: BigInt(testHospitalId) }
      });

      expect(count).toBeLessThanOrEqual(20);
    });
  });

  describe('Tipos de Notificaciones', () => {
    const tiposValidos = [
      'publicacion',
      'solicitud',
      'donacion',
      'envio',
      'estado_envio',
      'pago',
      'pin_envio'
    ];

    tiposValidos.forEach(tipo => {
      it(`✅ Acepta tipo "${tipo}"`, async () => {
        const notificacion = {
          hospital_id: testHospitalId,
          tipo,
          titulo: `Test ${tipo}`,
          mensaje: `Notificación de prueba para ${tipo}`,
        };

        const response = await request(baseURL)
          .post('/api/notificaciones')
          .send(notificacion);

        expect(response.status).toBe(201);

        // Cleanup
        if (response.body.notificacion?.id) {
          await prisma.notificaciones.delete({
            where: { id: BigInt(response.body.notificacion.id) }
          });
        }
      });
    });
  });
});
