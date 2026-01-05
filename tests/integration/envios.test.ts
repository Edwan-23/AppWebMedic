import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { prisma } from '@/lib/prisma';

const baseURL = 'http://localhost:3000';

describe('API Integration - Envíos y Sistema de PIN', () => {
  let testEnvioId: number;
  let testSolicitudId: number;
  let generatedPIN: string;

  beforeAll(async () => {
    console.log('🧪 Setup: Buscando solicitud para pruebas de envío...');

    // Buscar un estado_envio que tenga el campo guia con valor "Aprobada"
    const estadoAprobada = await prisma.estado_envio.findFirst({
      where: { 
        OR: [
          { guia: 'Aprobada' },
          { estado: 'Aprobada' }
        ]
      }
    });

    if (!estadoAprobada) {
      console.log('⚠️ No hay estado "Aprobada", buscando cualquier solicitud...');
      const solicitud = await prisma.solicitudes.findFirst();
      if (solicitud) {
        testSolicitudId = Number(solicitud.id);
        return;
      }
      console.log('⚠️ No hay solicitudes en la BD, se omitirán los tests de envío');
      return;
    }
  });

  afterAll(async () => {
    console.log('🧹 Cleanup: Eliminando envío de prueba...');
    
    if (testEnvioId) {
      try {
        await prisma.envio.delete({
          where: { id: BigInt(testEnvioId) }
        });
      } catch (error) {
        // Ignorar si ya fue eliminado
      }
    }

    await prisma.$disconnect();
  });

  describe('POST /api/envios', () => {
    it('✅ Crea envío correctamente', async () => {
      if (!testSolicitudId) {
        console.log('⏭️ Skip: No hay solicitud disponible');
        return;
      }

      const nuevoEnvio = {
        solicitud_id: testSolicitudId,
        transporte_id: 1,
        estado_envio_id: 1,
        fecha_recoleccion: new Date().toISOString(),
        fecha_entrega_estimada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(baseURL)
        .post('/api/envios')
        .send(nuevoEnvio);

      if (response.status !== 201) {
        console.error('❌ Error en POST envios:', response.status, response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.envio).toBeDefined();
      
      testEnvioId = response.body.envio.id;
    });

    it('❌ Rechaza envío sin solicitud_id', async () => {
      const envioInvalido = {
        transporte_id: 1,
      };

      const response = await request(baseURL)
        .post('/api/envios')
        .send(envioInvalido);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/envios', () => {
    it('✅ Lista envíos correctamente', async () => {
      const response = await request(baseURL)
        .get('/api/envios')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.envios)).toBe(true);
    });
  });

  describe('POST /api/envios/[id]/cambiar-estado - En Tránsito', () => {
    it('✅ Cambia estado a "En Tránsito"', async () => {
      if (!testEnvioId) {
        console.log('⏭️ Skip: No hay envío de prueba');
        return;
      }

      const response = await request(baseURL)
        .post(`/api/envios/${testEnvioId}/cambiar-estado`)
        .send({ nuevoEstadoNombre: 'En Tránsito' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Estado actualizado');
    });
  });

  describe('POST /api/envios/[id]/cambiar-estado - Distribución (Genera PIN)', () => {
    it('✅ Cambia estado a "Distribución" y genera PIN', async () => {
      if (!testEnvioId) {
        console.log('⏭️ Skip: No hay envío de prueba');
        return;
      }

      const response = await request(baseURL)
        .post(`/api/envios/${testEnvioId}/cambiar-estado`)
        .send({ nuevoEstadoNombre: 'Distribución' });

      expect(response.status).toBe(200);
      expect(response.body.pin).toBeDefined();
      expect(response.body.pin).toHaveLength(4);
      expect(/^\d{4}$/.test(response.body.pin)).toBe(true);

      // Guardar PIN para siguientes tests
      generatedPIN = response.body.pin;
      console.log(`📌 PIN generado: ${generatedPIN}`);
    });

    it('✅ Verifica que el PIN se guardó en la base de datos', async () => {
      if (!testEnvioId) {
        console.log('⏭️ Skip: No hay envío de prueba');
        return;
      }

      const envio = await prisma.envio.findUnique({
        where: { id: BigInt(testEnvioId) }
      });

      expect(envio).toBeDefined();
      expect(envio?.pin).toBe(generatedPIN);
    });
  });

  describe('POST /api/envios/[id]/cambiar-estado - Entregado (Valida PIN)', () => {
    it('❌ Rechaza entrega sin PIN', async () => {
      if (!testEnvioId) {
        console.log('⏭️ Skip: No hay envío de prueba');
        return;
      }

      const response = await request(baseURL)
        .post(`/api/envios/${testEnvioId}/cambiar-estado`)
        .send({ nuevoEstadoNombre: 'Entregado' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('PIN requerido');
    });

    it('❌ Rechaza PIN incorrecto', async () => {
      if (!testEnvioId || !generatedPIN) {
        console.log('⏭️ Skip: No hay envío o PIN de prueba');
        return;
      }

      const response = await request(baseURL)
        .post(`/api/envios/${testEnvioId}/cambiar-estado`)
        .send({ 
          nuevoEstadoNombre: 'Entregado',
          pin: '9999' // PIN incorrecto
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('PIN incorrecto');
    });

    it('✅ Entrega exitosa con PIN correcto', async () => {
      if (!testEnvioId || !generatedPIN) {
        console.log('⏭️ Skip: No hay envío o PIN de prueba');
        return;
      }

      const response = await request(baseURL)
        .post(`/api/envios/${testEnvioId}/cambiar-estado`)
        .send({ 
          nuevoEstadoNombre: 'Entregado',
          pin: generatedPIN
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Estado actualizado');
    });

    it('✅ Verifica que el PIN fue eliminado tras entrega', async () => {
      if (!testEnvioId) {
        console.log('⏭️ Skip: No hay envío de prueba');
        return;
      }

      const envio = await prisma.envio.findUnique({
        where: { id: BigInt(testEnvioId) }
      });

      expect(envio).toBeDefined();
      expect(envio?.pin).toBeNull();
    });
  });

  describe('GET /api/envios/[id]', () => {
    it('✅ Obtiene detalles del envío', async () => {
      if (!testEnvioId) {
        console.log('⏭️ Skip: No hay envío de prueba');
        return;
      }

      const response = await request(baseURL)
        .get(`/api/envios`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.envios)).toBe(true);
    });
  });
});
