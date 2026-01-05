import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { prisma } from '@/lib/prisma';

const baseURL = 'http://localhost:3000';

describe('E2E - Flujo Completo: Publicar → Solicitar → Enviar → Pagar', () => {
  let hospitalOrigenId: number;
  let hospitalDestinoId: number;
  let medicamentoId: number;
  let publicacionId: number;
  let solicitudId: number;
  let envioId: number;
  let generatedPIN: string;

  beforeAll(async () => {
    console.log('E2E Setup: Preparando datos para flujo completo...');

    // Obtener 2 hospitales diferentes
    const hospitales = await prisma.hospitales.findMany({ take: 2 });
    if (hospitales.length < 2) {
      throw new Error('Se requieren al menos 2 hospitales en la BD de test');
    }

    hospitalOrigenId = Number(hospitales[0].id);
    hospitalDestinoId = Number(hospitales[1].id);

    // Obtener un medicamento
    const medicamento = await prisma.medicamentos.findFirst();
    if (!medicamento) {
      throw new Error('Se requiere al menos un medicamento en la BD de test');
    }

    medicamentoId = Number(medicamento.id);

    console.log(`✅ Hospital Origen: ${hospitalOrigenId}`);
    console.log(`✅ Hospital Destino: ${hospitalDestinoId}`);
    console.log(`✅ Medicamento: ${medicamentoId}`);
  });

  it('📝 Paso 1: Hospital Origen publica medicamento', async () => {
    const publicacion = {
      hospital_id: hospitalOrigenId,
      medicamento_id: medicamentoId,
      tipo_publicacion_id: 1, // Venta
      cantidad: 100,
      descripcion: 'Medicamento disponible para prueba E2E',
      reg_invima: 'E2E-TEST-001',
      fecha_expiracion: '2026-12-31',
    };

    const response = await request(baseURL)
      .post('/api/publicaciones')
      .send(publicacion);

    if (response.status !== 201) {
      console.error('❌ Error en POST publicaciones:', response.status, response.body);
    }

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    
    publicacionId = response.body.publicacion.id;
    console.log(`✅ Publicación creada: ID ${publicacionId}`);
  });

  it('📋 Paso 2: Hospital Destino solicita el medicamento', async () => {
    expect(publicacionId).toBeDefined();

    const solicitud = {
      hospital_id: hospitalDestinoId,
      publicacion_id: publicacionId,
      medicamento_id: medicamentoId,
      cantidad: 50,
      observaciones: 'Solicitud de prueba E2E',
    };

    const response = await request(baseURL)
      .post('/api/solicitudes')
      .send(solicitud);

    if (response.status !== 201) {
      console.error('❌ Error en POST solicitudes:', response.status, response.body);
    }

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    
    solicitudId = response.body.solicitud.id;
    console.log(`✅ Solicitud creada: ID ${solicitudId}`);
  });

  it('✅ Paso 3: Hospital Origen aprueba la solicitud', async () => {
    expect(solicitudId).toBeDefined();

    // Intentar encontrar un estado de aprobación en la BD
    const estadoAprobacion = await prisma.estado_envio.findFirst({
      where: {
        OR: [
          { estado: { contains: 'Aprobad', mode: 'insensitive' } },
          { guia: { contains: 'Aprobad', mode: 'insensitive' } },
          { estado: { contains: 'Acepta', mode: 'insensitive' } },
          { guia: { contains: 'Acepta', mode: 'insensitive' } }
        ]
      }
    });

    if (!estadoAprobacion) {
      console.log('⏭️ Skip Paso 3: No existe estado de aprobación en BD');
      return;
    }

    const nuevoEstado = estadoAprobacion.estado || estadoAprobacion.guia || 'Aprobado';

    const response = await request(baseURL)
      .patch(`/api/solicitudes/${solicitudId}/estado`)
      .send({ nuevoEstado });

    if (response.status !== 200) {
      console.error('❌ Error en PATCH solicitudes/estado:', response.status, response.body);
    }

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    console.log(`✅ Solicitud aprobada: ID ${solicitudId} con estado "${nuevoEstado}"`);
  });

  it('🚚 Paso 4: Crear envío para la solicitud', async () => {
    expect(solicitudId).toBeDefined();

    const envio = {
      solicitud_id: solicitudId,
      transporte_id: 1,
      estado_envio_id: 1,
      fecha_recoleccion: new Date().toISOString(),
      fecha_entrega_estimada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const response = await request(baseURL)
      .post('/api/envios')
      .send(envio);

    if (response.status !== 201) {
      console.error('❌ Error en POST envios:', response.status, response.body);
    }

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    
    envioId = response.body.envio.id;
    console.log(`✅ Envío creado: ID ${envioId}`);
  });

  it('🚛 Paso 5: Cambiar estado a "En Tránsito"', async () => {
    expect(envioId).toBeDefined();

    const response = await request(baseURL)
      .post(`/api/envios/${envioId}/cambiar-estado`)
      .send({ nuevoEstadoNombre: 'En Tránsito' });

    expect(response.status).toBe(200);
    console.log(`✅ Estado cambiado: En Tránsito`);
  });

  it('📦 Paso 6: Cambiar estado a "Distribución" (Genera PIN)', async () => {
    expect(envioId).toBeDefined();

    const response = await request(baseURL)
      .post(`/api/envios/${envioId}/cambiar-estado`)
      .send({ nuevoEstadoNombre: 'Distribución' });

    expect(response.status).toBe(200);
    expect(response.body.pin).toBeDefined();
    expect(response.body.pin).toHaveLength(4);

    generatedPIN = response.body.pin;
    console.log(`✅ Estado: Distribución - PIN: ${generatedPIN}`);
  });

  it('✅ Paso 7: Confirmar entrega con PIN', async () => {
    expect(envioId).toBeDefined();
    expect(generatedPIN).toBeDefined();

    const response = await request(baseURL)
      .post(`/api/envios/${envioId}/cambiar-estado`)
      .send({ 
        nuevoEstadoNombre: 'Entregado',
        pin: generatedPIN
      });

    expect(response.status).toBe(200);
    console.log(`✅ Envío entregado con PIN correcto`);
  });

  it('💳 Paso 8: Procesar pago de la solicitud', async () => {
    expect(solicitudId).toBeDefined();

    const pago = {
      solicitud_id: solicitudId,
      monto: 500000,
      medio_pago_id: 1,
      nombre_completo: 'Usuario Test E2E',
      correo: 'test@e2e.com',
      cedula: '123456789',
    };

    const response = await request(baseURL)
      .post('/api/pagos')
      .send(pago);

    if (response.status !== 201) {
      console.error('❌ Error en POST pagos:', response.status, response.body);
    }

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    
    console.log(`✅ Pago procesado: ID ${response.body.pago.id}`);
  });

  it('🧹 Cleanup: Eliminar datos de prueba E2E', async () => {
    console.log('🧹 Limpiando datos de prueba E2E...');

    // Eliminar en orden inverso debido a relaciones (de hijo a padre)
    try {
      // 1. Eliminar pagos primero (dependen de solicitudes)
      if (solicitudId) {
        await prisma.pagos.deleteMany({ where: { solicitud_id: BigInt(solicitudId) } });
      }

      // 2. Eliminar envíos (dependen de solicitudes)
      if (envioId) {
        await prisma.envio.deleteMany({ where: { id: BigInt(envioId) } });
      }
      
      // 3. Eliminar solicitudes (dependen de publicaciones)
      if (solicitudId) {
        await prisma.solicitudes.deleteMany({ where: { id: BigInt(solicitudId) } });
      }
      
      // 4. Eliminar publicaciones (último)
      if (publicacionId) {
        await prisma.publicaciones.deleteMany({ where: { id: BigInt(publicacionId) } });
      }

      console.log('✅ Datos de prueba E2E eliminados');
    } catch (error) {
      console.error('⚠️ Error en cleanup:', error);
    }
  });
});
