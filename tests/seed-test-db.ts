/**
 * Script para poblar la base de datos de test con datos mínimos
 * Ejecutar: pnpm tsx tests/seed-test-db.ts
 */

import { config } from 'dotenv';
import path from 'path';

// Cargar .env.test PRIMERO
config({ path: path.resolve(process.cwd(), '.env.test') });

// Configurar DATABASE_URL antes de importar prisma
if (!process.env.DATABASE_URL_TEST) {
  throw new Error('DATABASE_URL_TEST no está definida en .env.test');
}

process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
console.log('📦 Usando BD:', process.env.DATABASE_URL);

// AHORA importar prisma
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🌱 Poblando base de datos de test...');
  
  try {
    // Limpiar tablas dependientes primero
    await prisma.solicitudes.deleteMany({});
    await prisma.publicaciones.deleteMany({});
    await prisma.notificaciones.deleteMany({});
    await prisma.pagos.deleteMany({});
    await prisma.envio.deleteMany({});
    
    // Crear departamentos
    const dpto = await prisma.departamentos.findFirst() || await prisma.departamentos.create({
      data: {
        nombre: 'Cundinamarca'
      }
    });

    // Crear municipios
    const mun = await prisma.municipios.findFirst() || await prisma.municipios.create({
      data: {
        nombre: 'Bogotá',
        departamento_id: dpto.id,
        estado: 1
      }
    });

    // Crear estado_base
    const estadoBase = await prisma.estado_base.findFirst() || await prisma.estado_base.create({
      data: {
        nombre: 'Activo',
        descripcion: 'Estado activo'
      }
    });

    // Crear hospitales
    let hospital1 = await prisma.hospitales.findFirst({ where: { rut: '900123456-7' } });
    if (!hospital1) {
      hospital1 = await prisma.hospitales.create({
        data: {
          rut: '900123456-7',
          nombre: 'Hospital Test 1',
          direccion: 'Calle 123',
          departamento_id: dpto.id,
          municipio_id: mun.id,
          telefono: '3001234567',
          correo: 'test1@hospital.com',
          estado_id: estadoBase.id,
          director: 'Dr. Test 1'
        }
      });
    }

    let hospital2 = await prisma.hospitales.findFirst({ where: { rut: '900123456-8' } });
    if (!hospital2) {
      hospital2 = await prisma.hospitales.create({
        data: {
          rut: '900123456-8',
          nombre: 'Hospital Test 2',
          direccion: 'Calle 456',
          departamento_id: dpto.id,
          municipio_id: mun.id,
          telefono: '3001234568',
          correo: 'test2@hospital.com',
          estado_id: estadoBase.id,
          director: 'Dr. Test 2'
        }
      });
    }

    // Crear tipo_medicamento
    const tipoMed = await prisma.tipo_medicamento.findFirst() || await prisma.tipo_medicamento.create({
      data: {
        nombre: 'Analgésico',
        descripcion: 'Medicamento para el dolor'
      }
    });

    // Crear medida_medicamento
    let medida = await prisma.medida_medicamento.findFirst({ where: { nombre: 'mg' } });
    if (!medida) {
      medida = await prisma.medida_medicamento.create({
        data: {
          nombre: 'mg',
          descripcion: 'Miligramos'
        }
      });
    }

    // Crear medicamentos
    let medicamento = await prisma.medicamentos.findFirst({ where: { referencia: 'MED-TEST-001' } });
    if (!medicamento) {
      medicamento = await prisma.medicamentos.create({
        data: {
          nombre: 'Ibuprofeno Test',
          referencia: 'MED-TEST-001',
          tipo_medicamento_id: tipoMed.id,
          concentracion: 500,
          medida_medicamento_id: medida.id,
          descripcion: 'Medicamento de prueba'
        }
      });
    }

    // Crear tipo_publicacion
    let tipoPublicacion = await prisma.tipo_publicacion.findFirst({ where: { nombre: 'Venta' } });
    if (!tipoPublicacion) {
      tipoPublicacion = await prisma.tipo_publicacion.create({
        data: {
          nombre: 'Venta',
          descripcion: 'Publicación para venta'
        }
      });
    }

    // Crear estado_publicacion
    let estadoPublicacion = await prisma.estado_publicacion.findFirst({ where: { nombre: 'Disponible' } });
    if (!estadoPublicacion) {
      estadoPublicacion = await prisma.estado_publicacion.create({
        data: {
          nombre: 'Disponible',
          descripcion: 'Publicación disponible'
        }
      });
    }

    // Crear unidad_dispensacion
    const unidadDispensacion = await prisma.unidad_dispensacion.findFirst() || await prisma.unidad_dispensacion.create({
      data: {
        nombre: 'Caja'
      }
    });

    // Crear estados de envío
    let estadoEnvio2 = await prisma.estado_envio.findFirst({ where: { guia: 'Aprobada' } });
    if (!estadoEnvio2) {
      estadoEnvio2 = await prisma.estado_envio.create({
        data: {
          guia: 'Aprobada',
          descripcion: 'Solicitud aprobada',
          estado: 'Aprobada'
        }
      });
    }

    // Verificar otros estados de envío
    const estadosNecesarios = [
      { guia: 'Pendiente', descripcion: 'Envío pendiente', estado: 'Pendiente' },
      { guia: 'En Tránsito', descripcion: 'Envío en tránsito', estado: 'En Tránsito' },
      { guia: 'Distribución', descripcion: 'Envío en distribución', estado: 'Distribución' },
      { guia: 'Entregado', descripcion: 'Envío entregado', estado: 'Entregado' }
    ];

    for (const e of estadosNecesarios) {
      const exists = await prisma.estado_envio.findFirst({ where: { guia: e.guia } });
      if (!exists) {
        await prisma.estado_envio.create({ data: e });
      }
    }

    // Crear transporte
    const transporte = await prisma.transporte.findFirst() || await prisma.transporte.create({
      data: {
        nombre: 'Transporte Test',
        descripcion: 'Empresa de transporte de prueba'
      }
    });

    // Crear una solicitud aprobada para tests de envío
    const publicacion = await prisma.publicaciones.create({
      data: {
        hospital_id: hospital1.id,
        medicamento_id: medicamento.id,
        tipo_publicacion_id: tipoPublicacion.id,
        estado_publicacion_id: estadoPublicacion.id,
        unidad_dispensacion_id: unidadDispensacion.id,
        descripcion: 'Publicación de prueba',
        cantidad: 100,
        fecha_expiracion: new Date('2026-12-31'),
        reg_invima: 'INVIMA-TEST-001'
      }
    });

    const solicitud = await prisma.solicitudes.create({
      data: {
        descripcion: 'Solicitud de prueba',
        publicacion_id: publicacion.id,
        hospital_id: hospital2.id,
        medicamento_id: medicamento.id,
        hospital_origen_id: hospital1.id
      }
    });

    console.log('✅ Base de datos de test poblada exitosamente');
    console.log(`   - Hospitales: 2`);
    console.log(`   - Medicamentos: 1`);
    console.log(`   - Estados envío: 5`);
    console.log(`   - Solicitud aprobada: ${solicitud.id}`);
  } catch (error) {
    console.error('Error durante el seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error al poblar BD de test:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
