import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

// Crear pool de conexiones de PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Crear adaptador de Prisma
const adapter = new PrismaPg(pool);

// Instanciar PrismaClient con el adaptador
const prisma = new PrismaClient({
    adapter,
});

// Función para hashear contraseñas
async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

// 1. Departamentos
async function seedDepartamentos() {
    console.log('Creando departamentos...');

    await prisma.departamentos.upsert({
        where: { id: 5 },
        update: {},
        create: { id: 5, nombre: 'ANTIOQUIA' }
    });

    await prisma.departamentos.upsert({
        where: { id: 8 },
        update: {},
        create: { id: 8, nombre: 'ATLÁNTICO' }
    });

    await prisma.departamentos.upsert({
        where: { id: 11 },
        update: {},
        create: { id: 11, nombre: 'BOGOTÁ, D.C.' }
    });

    await prisma.departamentos.upsert({
        where: { id: 13 },
        update: {},
        create: { id: 13, nombre: 'BOLÍVAR' }
    });

    await prisma.departamentos.upsert({
        where: { id: 15 },
        update: {},
        create: { id: 15, nombre: 'BOYACÁ' }
    });

    await prisma.departamentos.upsert({
        where: { id: 17 },
        update: {},
        create: { id: 17, nombre: 'CALDAS' }
    });

    await prisma.departamentos.upsert({
        where: { id: 18 },
        update: {},
        create: { id: 18, nombre: 'CAQUETÁ' }
    });

    await prisma.departamentos.upsert({
        where: { id: 19 },
        update: {},
        create: { id: 19, nombre: 'CAUCA' }
    });

    await prisma.departamentos.upsert({
        where: { id: 20 },
        update: {},
        create: { id: 20, nombre: 'CESAR' }
    });

    await prisma.departamentos.upsert({
        where: { id: 23 },
        update: {},
        create: { id: 23, nombre: 'CÓRDOBA' }
    });

    await prisma.departamentos.upsert({
        where: { id: 25 },
        update: {},
        create: { id: 25, nombre: 'CUNDINAMARCA' }
    });

    await prisma.departamentos.upsert({
        where: { id: 27 },
        update: {},
        create: { id: 27, nombre: 'CHOCÓ' }
    });

    await prisma.departamentos.upsert({
        where: { id: 41 },
        update: {},
        create: { id: 41, nombre: 'HUILA' }
    });

    await prisma.departamentos.upsert({
        where: { id: 44 },
        update: {},
        create: { id: 44, nombre: 'LA GUAJIRA' }
    });

    await prisma.departamentos.upsert({
        where: { id: 47 },
        update: {},
        create: { id: 47, nombre: 'MAGDALENA' }
    });

    await prisma.departamentos.upsert({
        where: { id: 50 },
        update: {},
        create: { id: 50, nombre: 'META' }
    });

    await prisma.departamentos.upsert({
        where: { id: 52 },
        update: {},
        create: { id: 52, nombre: 'NARIÑO' }
    });

    await prisma.departamentos.upsert({
        where: { id: 54 },
        update: {},
        create: { id: 54, nombre: 'NORTE DE SANTANDER' }
    });

    await prisma.departamentos.upsert({
        where: { id: 63 },
        update: {},
        create: { id: 63, nombre: 'QUINDIO' }
    });

    await prisma.departamentos.upsert({
        where: { id: 66 },
        update: {},
        create: { id: 66, nombre: 'RISARALDA' }
    });

    await prisma.departamentos.upsert({
        where: { id: 68 },
        update: {},
        create: { id: 68, nombre: 'SANTANDER' }
    });

    await prisma.departamentos.upsert({
        where: { id: 70 },
        update: {},
        create: { id: 70, nombre: 'SUCRE' }
    });

    await prisma.departamentos.upsert({
        where: { id: 73 },
        update: {},
        create: { id: 73, nombre: 'TOLIMA' }
    });

    await prisma.departamentos.upsert({
        where: { id: 76 },
        update: {},
        create: { id: 76, nombre: 'VALLE DEL CAUCA' }
    });

    await prisma.departamentos.upsert({
        where: { id: 81 },
        update: {},
        create: { id: 81, nombre: 'ARAUCA' }
    });

    await prisma.departamentos.upsert({
        where: { id: 85 },
        update: {},
        create: { id: 85, nombre: 'CASANARE' }
    });

    await prisma.departamentos.upsert({
        where: { id: 86 },
        update: {},
        create: { id: 86, nombre: 'PUTUMAYO' }
    });

    await prisma.departamentos.upsert({
        where: { id: 88 },
        update: {},
        create: {
            id: 88,
            nombre: 'ARCHIPIÉLAGO DE SAN ANDRÉS, PROVIDENCIA Y SANTA CATALINA'
        }
    });

    await prisma.departamentos.upsert({
        where: { id: 91 },
        update: {},
        create: { id: 91, nombre: 'AMAZONAS' }
    });

    await prisma.departamentos.upsert({
        where: { id: 94 },
        update: {},
        create: { id: 94, nombre: 'GUAINÍA' }
    });

    await prisma.departamentos.upsert({
        where: { id: 95 },
        update: {},
        create: { id: 95, nombre: 'GUAVIARE' }
    });

    await prisma.departamentos.upsert({
        where: { id: 97 },
        update: {},
        create: { id: 97, nombre: 'VAUPÉS' }
    });

    await prisma.departamentos.upsert({
        where: { id: 99 },
        update: {},
        create: { id: 99, nombre: 'VICHADA' }
    });

    console.log('✅ Departamentos creados');
}

// 2. Estado Base
async function seedEstadoBase() {
    console.log('Creando estado_base...');

    await prisma.estado_base.upsert({
        where: { nombre: 'Activo' },
        update: {},
        create: {
            nombre: 'Activo',
            descripcion: 'Entidad activa en el sistema'
        }
    });

    await prisma.estado_base.upsert({
        where: { nombre: 'Ausente' },
        update: {},
        create: {
            nombre: 'Ausente',
            descripcion: 'Entidad inactiva en el sistema'
        }
    });

    await prisma.estado_base.upsert({
        where: { nombre: 'Suspendido' },
        update: {},
        create: {
            nombre: 'Suspendido',
            descripcion: 'Entidad suspendida temporalmente'
        }
    });

    console.log('✅ Estados base creados');
}

// 3. Estado Envío
async function seedEstadoEnvio() {
    console.log('Creando estado_envio...');

    await prisma.estado_envio.upsert({
        where: { guia: '15' },
        update: {},
        create: {
            guia: '15',
            descripcion: 'Alistando y empaque del medicamentos',
            estado: 'Empaquetando'
        }
    });

    await prisma.estado_envio.upsert({
        where: { guia: '20' },
        update: {},
        create: {
            guia: '20',
            descripcion: 'Inicio del recorrido del paquete solicitado',
            estado: 'En Tránsito'
        }
    });

    await prisma.estado_envio.upsert({
        where: { guia: '30' },
        update: {},
        create: {
            guia: '30',
            descripcion: 'Traslado del medicamento al sitio de destino',
            estado: 'Distribución'
        }
    });

    await prisma.estado_envio.upsert({
        where: { guia: '35' },
        update: {},
        create: {
            guia: '35',
            descripcion: 'Medicamento entregado con exito',
            estado: 'Entregado'
        }
    });

    console.log('✅ Estados de envío creados');
}

// 4. Tipo Envío
async function seedTipoEnvio() {
    console.log('Creando tipo_envio...');
    await prisma.tipo_envio.upsert({
        where: { nombre: 'Estándar' },
        update: {},
        create: {
            nombre: 'Estándar',
            descripcion: 'Envío estándar sin costo, coordinación directa entre hospitales'
        }
    });

    await prisma.tipo_envio.upsert({
        where: { nombre: 'Prioritario' },
        update: {},
        create: {
            nombre: 'Prioritario',
            descripcion: 'Envío prioritario con seguimiento en tiempo real y transporte especializado'
        }
    });

    console.log('✅ Tipos de envío creados');
}

// 5. Estado Publicación
async function seedEstadoPublicacion() {
    console.log('Creando estado_publicacion...');

    await prisma.estado_publicacion.upsert({
        where: { nombre: 'Disponible' },
        update: {},
        create: {
            nombre: 'Disponible',
            descripcion: 'Publicación disponible para solicitudes'
        }
    });

    await prisma.estado_publicacion.upsert({
        where: { nombre: 'Pendiente' },
        update: {},
        create: {
            nombre: 'Pendiente',
            descripcion: 'Publicación pendiente de revisión'
        }
    });

    await prisma.estado_publicacion.upsert({
        where: { nombre: 'Solicitado' },
        update: {},
        create: {
            nombre: 'Solicitado',
            descripcion: 'Publicación ha sido solicitada por un usuario'
        }
    });

    await prisma.estado_publicacion.upsert({
        where: { nombre: 'Caducado' },
        update: {},
        create: {
            nombre: 'Caducado',
            descripcion: 'Publicación ha caducado y no está disponible'
        }
    });

    await prisma.estado_publicacion.upsert({
        where: { nombre: 'Eliminado' },
        update: {},
        create: {
            nombre: 'Eliminado',
            descripcion: 'Publicación ha sido eliminada'
        }
    });

    await prisma.estado_publicacion.upsert({
        where: { nombre: 'Concretada' },
        update: {},
        create: {
            nombre: 'Concretada',
            descripcion: 'Publicación concretada mediante solicitud'
        }
    });

    console.log('✅ Estados de publicación creados');
}

// 6. Tipos de Solicitud
async function seedTipoSolicitud() {
    console.log('Creando tipo_solicitud...');

    await prisma.tipo_solicitud.upsert({
        where: { nombre: 'compra' },
        update: {},
        create: {
            nombre: 'compra',
            descripcion: 'Solicitud para comprar medicamento'
        }
    });

    await prisma.tipo_solicitud.upsert({
        where: { nombre: 'intercambio' },
        update: {},
        create: {
            nombre: 'intercambio',
            descripcion: 'Solicitud para intercambiar medicamento'
        }
    });

    await prisma.tipo_solicitud.upsert({
        where: { nombre: 'prestamo' },
        update: {},
        create: {
            nombre: 'prestamo',
            descripcion: 'Solicitud de préstamo temporal de medicamento'
        }
    });

    console.log('✅ Tipos de solicitud creados');
}

// 7. Estados de Solicitud
async function seedEstadoSolicitud() {
    console.log('Creando estado_solicitud...');

    await prisma.estado_solicitud.upsert({
        where: { nombre: 'Pendiente' },
        update: {},
        create: {
            nombre: 'Pendiente',
            descripcion: 'Solicitud pendiente de revisión'
        }
    });

    await prisma.estado_solicitud.upsert({
        where: { nombre: 'Aceptada' },
        update: {},
        create: {
            nombre: 'Aceptada',
            descripcion: 'Solicitud aceptada y en proceso'
        }
    });

    await prisma.estado_solicitud.upsert({
        where: { nombre: 'Rechazada' },
        update: {},
        create: {
            nombre: 'Rechazada',
            descripcion: 'Solicitud rechazada'
        }
    });

    console.log('✅ Estados de solicitud creados');
}


// 8. Medios de Pago
async function seedMediosPago() {
    console.log('Creando medios_pago...');

    await prisma.medios_pago.upsert({
        where: { nombre: 'Tarjeta de Crédito' },
        update: {},
        create: {
            nombre: 'Tarjeta de Crédito',
            descripcion: 'Visa, Mastercard, American Express',
            activo: true,
            icono: 'credit-card'
        }
    });

    await prisma.medios_pago.upsert({
        where: { nombre: 'PSE' },
        update: {},
        create: {
            nombre: 'PSE',
            descripcion: 'Pago a través de PSE',
            activo: true,
            icono: 'pse'
        }
    });

    await prisma.medios_pago.upsert({
        where: { nombre: 'Nequi' },
        update: {},
        create: {
            nombre: 'Nequi',
            descripcion: 'Pago a través de Nequi',
            activo: true,
            icono: 'nequi'
        }
    });

    await prisma.medios_pago.upsert({
        where: { nombre: 'Daviplata' },
        update: {},
        create: {
            nombre: 'Daviplata',
            descripcion: 'Pago a través de Daviplata',
            activo: true,
            icono: 'daviplata'
        }
    });

    console.log('✅ Medios de pago creados');
}

// 9. Municipios (depende de departamentos)
async function seedMunicipios() {
    console.log('Creando municipios...');

    const municipios = [

        {
            id: 1,
            nombre: 'Abriaquí',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 2,
            nombre: 'Acacías',
            departamento_id: 50,
            estado: 1,
        },
        {
            id: 3,
            nombre: 'Acandí',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 4,
            nombre: 'Acevedo',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 5,
            nombre: 'Achí',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 6,
            nombre: 'Agrado',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 7,
            nombre: 'Agua de Dios',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 8,
            nombre: 'Aguachica',
            departamento_id: 20,
            estado: 1,
        },
        {
            id: 9,
            nombre: 'Aguada',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 10,
            nombre: 'Aguadas',
            departamento_id: 17,
            estado: 1,
        },
        {
            id: 11,
            nombre: 'Aguazul',
            departamento_id: 85,
            estado: 1,
        },
        {
            id: 12,
            nombre: 'Agustín Codazzi',
            departamento_id: 20,
            estado: 1,
        },
        {
            id: 13,
            nombre: 'Aipe',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 14,
            nombre: 'Albania',
            departamento_id: 18,
            estado: 1,
        },
        {
            id: 15,
            nombre: 'Albania',
            departamento_id: 44,
            estado: 1,
        },
        {
            id: 16,
            nombre: 'Albania',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 17,
            nombre: 'Albán',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 18,
            nombre: 'Albán (San José)',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 19,
            nombre: 'Alcalá',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 20,
            nombre: 'Alejandria',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 21,
            nombre: 'Algarrobo',
            departamento_id: 47,
            estado: 1,
        },
        {
            id: 22,
            nombre: 'Algeciras',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 23,
            nombre: 'Almaguer',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 24,
            nombre: 'Almeida',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 25,
            nombre: 'Alpujarra',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 26,
            nombre: 'Altamira',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 27,
            nombre: 'Alto Baudó (Pie de Pato)',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 28,
            nombre: 'Altos del Rosario',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 29,
            nombre: 'Alvarado',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 30,
            nombre: 'Amagá',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 31,
            nombre: 'Amalfi',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 32,
            nombre: 'Ambalema',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 33,
            nombre: 'Anapoima',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 34,
            nombre: 'Ancuya',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 35,
            nombre: 'Andalucía',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 36,
            nombre: 'Andes',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 37,
            nombre: 'Angelópolis',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 38,
            nombre: 'Angostura',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 39,
            nombre: 'Anolaima',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 40,
            nombre: 'Anorí',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 41,
            nombre: 'Anserma',
            departamento_id: 17,
            estado: 1,
        },
        {
            id: 42,
            nombre: 'Ansermanuevo',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 43,
            nombre: 'Anzoátegui',
            departamento_id: 73,
            estado: 1,
        },

        {
            id: 44,
            nombre: 'Anzá',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 45,
            nombre: 'Apartadó',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 46,
            nombre: 'Apulo',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 47,
            nombre: 'Apía',
            departamento_id: 66,
            estado: 1,
        },
        {
            id: 48,
            nombre: 'Aquitania',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 49,
            nombre: 'Aracataca',
            departamento_id: 47,
            estado: 1,
        },
        {
            id: 50,
            nombre: 'Aranzazu',
            departamento_id: 17,
            estado: 1,
        },
        {
            id: 51,
            nombre: 'Aratoca',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 52,
            nombre: 'Arauca',
            departamento_id: 81,
            estado: 1,
        },
        {
            id: 53,
            nombre: 'Arauquita',
            departamento_id: 81,
            estado: 1,
        },
        {
            id: 54,
            nombre: 'Arbeláez',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 55,
            nombre: 'Arboleda (Berruecos)',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 56,
            nombre: 'Arboledas',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 57,
            nombre: 'Arboletes',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 58,
            nombre: 'Arcabuco',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 59,
            nombre: 'Arenal',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 60,
            nombre: 'Argelia',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 61,
            nombre: 'Argelia',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 62,
            nombre: 'Argelia',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 63,
            nombre: 'Ariguaní (El Difícil)',
            departamento_id: 47,
            estado: 1,
        },
        {
            id: 64,
            nombre: 'Arjona',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 65,
            nombre: 'Armenia',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 66,
            nombre: 'Armenia',
            departamento_id: 63,
            estado: 1,
        },
        {
            id: 67,
            nombre: 'Armero (Guayabal)',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 68,
            nombre: 'Arroyohondo',
            departamento_id: 13,
            estado: 1,
        },


        {
            id: 69,
            nombre: 'Astrea',
            departamento_id: 20,
            estado: 1,
        },
        {
            id: 70,
            nombre: 'Ataco',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 71,
            nombre: 'Atrato (Yuto)',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 72,
            nombre: 'Ayapel',
            departamento_id: 23,
            estado: 1,
        },
        {
            id: 73,
            nombre: 'Bagadó',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 74,
            nombre: 'Bahía Solano (Mútis)',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 75,
            nombre: 'Bajo Baudó (Pizarro)',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 76,
            nombre: 'Balboa',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 77,
            nombre: 'Balboa',
            departamento_id: 66,
            estado: 1,
        },
        {
            id: 78,
            nombre: 'Baranoa',
            departamento_id: 8,
            estado: 1,
        },
        {
            id: 79,
            nombre: 'Baraya',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 80,
            nombre: 'Barbacoas',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 81,
            nombre: 'Barbosa',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 82,
            nombre: 'Barbosa',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 83,
            nombre: 'Barichara',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 84,
            nombre: 'Barranca de Upía',
            departamento_id: 50,
            estado: 1,
        },
        {
            id: 85,
            nombre: 'Barrancabermeja',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 86,
            nombre: 'Barrancas',
            departamento_id: 44,
            estado: 1,
        },
        {
            id: 87,
            nombre: 'Barranco de Loba',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 88,
            nombre: 'Barranquilla',
            departamento_id: 8,
            estado: 1,
        },
        {
            id: 89,
            nombre: 'Becerríl',
            departamento_id: 20,
            estado: 1,
        },
        {
            id: 90,
            nombre: 'Belalcázar',
            departamento_id: 17,
            estado: 1,
        },
        {
            id: 91,
            nombre: 'Bello',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 92,
            nombre: 'Belmira',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 93,
            nombre: 'Beltrán',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 94,
            nombre: 'Belén',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 95,
            nombre: 'Belén',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 96,
            nombre: 'Belén de Bajirá',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 97,
            nombre: 'Belén de Umbría',
            departamento_id: 66,
            estado: 1,
        },
        {
            id: 98,
            nombre: 'Belén de los Andaquíes',
            departamento_id: 18,
            estado: 1,
        },
        {
            id: 99,
            nombre: 'Berbeo',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 100,
            nombre: 'Betania',
            departamento_id: 5,
            estado: 1,
        },


        {
            id: 101,
            nombre: 'Beteitiva',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 102,
            nombre: 'Betulia',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 103,
            nombre: 'Betulia',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 104,
            nombre: 'Bituima',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 105,
            nombre: 'Boavita',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 106,
            nombre: 'Bochalema',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 107,
            nombre: 'Bogotá D.C.',
            departamento_id: 11,
            estado: 1,
        },
        {
            id: 108,
            nombre: 'Bojacá',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 109,
            nombre: 'Bojayá (Bellavista)',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 110,
            nombre: 'Bolívar',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 111,
            nombre: 'Bolívar',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 112,
            nombre: 'Bolívar',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 113,
            nombre: 'Bolívar',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 114,
            nombre: 'Bosconia',
            departamento_id: 20,
            estado: 1,
        },
        {
            id: 115,
            nombre: 'Boyacá',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 116,
            nombre: 'Briceño',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 117,
            nombre: 'Briceño',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 118,
            nombre: 'Bucaramanga',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 119,
            nombre: 'Bucarasica',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 120,
            nombre: 'Buenaventura',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 121,
            nombre: 'Buenavista',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 122,
            nombre: 'Buenavista',
            departamento_id: 23,
            estado: 1,
        },
        {
            id: 123,
            nombre: 'Buenavista',
            departamento_id: 63,
            estado: 1,
        },
        {
            id: 124,
            nombre: 'Buenavista',
            departamento_id: 70,
            estado: 1,
        },
        {
            id: 125,
            nombre: 'Buenos Aires',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 126,
            nombre: 'Buesaco',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 127,
            nombre: 'Buga',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 128,
            nombre: 'Bugalagrande',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 129,
            nombre: 'Burítica',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 130,
            nombre: 'Busbanza',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 131,
            nombre: 'Cabrera',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 132,
            nombre: 'Cabrera',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 133,
            nombre: 'Cabuyaro',
            departamento_id: 50,
            estado: 1,
        },
        {
            id: 134,
            nombre: 'Cachipay',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 135,
            nombre: 'Caicedo',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 136,
            nombre: 'Caicedonia',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 137,
            nombre: 'Caimito',
            departamento_id: 70,
            estado: 1,
        },
        {
            id: 138,
            nombre: 'Cajamarca',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 139,
            nombre: 'Cajibío',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 140,
            nombre: 'Cajicá',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 141,
            nombre: 'Calamar',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 142,
            nombre: 'Calamar',
            departamento_id: 95,
            estado: 1,
        },
        {
            id: 143,
            nombre: 'Calarcá',
            departamento_id: 63,
            estado: 1,
        },
        {
            id: 144,
            nombre: 'Caldas',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 145,
            nombre: 'Caldas',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 146,
            nombre: 'Caldono',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 147,
            nombre: 'California',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 148,
            nombre: 'Calima (Darién)',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 149,
            nombre: 'Caloto',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 150,
            nombre: 'Calí',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 151,
            nombre: 'Campamento',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 152,
            nombre: 'Campo de la Cruz',
            departamento_id: 8,
            estado: 1,
        },
        {
            id: 153,
            nombre: 'Campoalegre',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 154,
            nombre: 'Campohermoso',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 155,
            nombre: 'Canalete',
            departamento_id: 23,
            estado: 1,
        },
        {
            id: 156,
            nombre: 'Candelaria',
            departamento_id: 8,
            estado: 1,
        },
        {
            id: 157,
            nombre: 'Candelaria',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 158,
            nombre: 'Cantagallo',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 159,
            nombre: 'Cantón de San Pablo',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 160,
            nombre: 'Caparrapí',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 161,
            nombre: 'Capitanejo',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 162,
            nombre: 'Caracolí',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 163,
            nombre: 'Caramanta',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 164,
            nombre: 'Carcasí',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 165,
            nombre: 'Carepa',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 166,
            nombre: 'Carmen de Apicalá',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 167,
            nombre: 'Carmen de Carupa',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 168,
            nombre: 'Carmen de Viboral',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 169,
            nombre: 'Carmen del Darién (CURBARADÓ)',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 170,
            nombre: 'Carolina',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 171,
            nombre: 'Cartagena',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 172,
            nombre: 'Cartagena del Chairá',
            departamento_id: 18,
            estado: 1,
        },
        {
            id: 173,
            nombre: 'Cartago',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 174,
            nombre: 'Carurú',
            departamento_id: 97,
            estado: 1,
        },
        {
            id: 175,
            nombre: 'Casabianca',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 176,
            nombre: 'Castilla la Nueva',
            departamento_id: 50,
            estado: 1,
        },
        {
            id: 177,
            nombre: 'Caucasia',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 178,
            nombre: 'Cañasgordas',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 179,
            nombre: 'Cepita',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 180,
            nombre: 'Cereté',
            departamento_id: 23,
            estado: 1,
        },
        {
            id: 181,
            nombre: 'Cerinza',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 182,
            nombre: 'Cerrito',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 183,
            nombre: 'Cerro San Antonio',
            departamento_id: 47,
            estado: 1,
        },
        {
            id: 184,
            nombre: 'Chachaguí',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 185,
            nombre: 'Chaguaní',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 186,
            nombre: 'Chalán',
            departamento_id: 70,
            estado: 1,
        },
        {
            id: 187,
            nombre: 'Chaparral',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 188,
            nombre: 'Charalá',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 189,
            nombre: 'Charta',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 190,
            nombre: 'Chigorodó',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 191,
            nombre: 'Chima',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 192,
            nombre: 'Chimichagua',
            departamento_id: 20,
            estado: 1,
        },
        {
            id: 193,
            nombre: 'Chimá',
            departamento_id: 23,
            estado: 1,
        },
        {
            id: 194,
            nombre: 'Chinavita',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 195,
            nombre: 'Chinchiná',
            departamento_id: 17,
            estado: 1,
        },
        {
            id: 196,
            nombre: 'Chinácota',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 197,
            nombre: 'Chinú',
            departamento_id: 23,
            estado: 1,
        },
        {
            id: 198,
            nombre: 'Chipaque',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 199,
            nombre: 'Chipatá',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 200,
            nombre: 'Chiquinquirá',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 201,
            nombre: 'Chiriguaná',
            departamento_id: 20,
            estado: 1,
        },
        {
            id: 202,
            nombre: 'Chiscas',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 203,
            nombre: 'Chita',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 204,
            nombre: 'Chitagá',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 205,
            nombre: 'Chitaraque',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 206,
            nombre: 'Chivatá',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 207,
            nombre: 'Chivolo',
            departamento_id: 47,
            estado: 1,
        },
        {
            id: 208,
            nombre: 'Choachí',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 209,
            nombre: 'Chocontá',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 210,
            nombre: 'Chámeza',
            departamento_id: 85,
            estado: 1,
        },
        {
            id: 211,
            nombre: 'Chía',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 212,
            nombre: 'Chíquiza',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 213,
            nombre: 'Chívor',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 214,
            nombre: 'Cicuco',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 215,
            nombre: 'Cimitarra',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 216,
            nombre: 'Circasia',
            departamento_id: 63,
            estado: 1,
        },
        {
            id: 217,
            nombre: 'Cisneros',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 218,
            nombre: 'Ciénaga',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 219,
            nombre: 'Ciénaga',
            departamento_id: 47,
            estado: 1,
        },
        {
            id: 220,
            nombre: 'Ciénaga de Oro',
            departamento_id: 23,
            estado: 1,
        },
        {
            id: 221,
            nombre: 'Clemencia',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 222,
            nombre: 'Cocorná',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 223,
            nombre: 'Coello',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 224,
            nombre: 'Cogua',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 225,
            nombre: 'Colombia',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 226,
            nombre: 'Colosó (Ricaurte)',
            departamento_id: 70,
            estado: 1,
        },
        {
            id: 227,
            nombre: 'Colón',
            departamento_id: 86,
            estado: 1,
        },
        {
            id: 228,
            nombre: 'Colón (Génova)',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 229,
            nombre: 'Concepción',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 230,
            nombre: 'Concepción',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 231,
            nombre: 'Concordia',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 232,
            nombre: 'Concordia',
            departamento_id: 47,
            estado: 1,
        },
        {
            id: 233,
            nombre: 'Condoto',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 234,
            nombre: 'Confines',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 235,
            nombre: 'Consaca',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 236,
            nombre: 'Contadero',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 237,
            nombre: 'Contratación',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 238,
            nombre: 'Convención',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 239,
            nombre: 'Copacabana',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 240,
            nombre: 'Coper',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 241,
            nombre: 'Cordobá',
            departamento_id: 63,
            estado: 1,
        },
        {
            id: 242,
            nombre: 'Corinto',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 243,
            nombre: 'Coromoro',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 244,
            nombre: 'Corozal',
            departamento_id: 70,
            estado: 1,
        },
        {
            id: 245,
            nombre: 'Corrales',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 246,
            nombre: 'Cota',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 247,
            nombre: 'Cotorra',
            departamento_id: 23,
            estado: 1,
        },
        {
            id: 248,
            nombre: 'Covarachía',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 249,
            nombre: 'Coveñas',
            departamento_id: 70,
            estado: 1,
        },
        {
            id: 250,
            nombre: 'Coyaima',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 251,
            nombre: 'Cravo Norte',
            departamento_id: 81,
            estado: 1,
        },
        {
            id: 252,
            nombre: 'Cuaspud (Carlosama)',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 253,
            nombre: 'Cubarral',
            departamento_id: 50,
            estado: 1,
        },
        {
            id: 254,
            nombre: 'Cubará',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 255,
            nombre: 'Cucaita',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 256,
            nombre: 'Cucunubá',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 257,
            nombre: 'Cucutilla',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 258,
            nombre: 'Cuitiva',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 259,
            nombre: 'Cumaral',
            departamento_id: 50,
            estado: 1,
        },
        {
            id: 260,
            nombre: 'Cumaribo',
            departamento_id: 99,
            estado: 1,
        },
        {
            id: 261,
            nombre: 'Cumbal',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 262,
            nombre: 'Cumbitara',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 263,
            nombre: 'Cunday',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 264,
            nombre: 'Curillo',
            departamento_id: 18,
            estado: 1,
        },
        {
            id: 265,
            nombre: 'Curití',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 266,
            nombre: 'Curumaní',
            departamento_id: 20,
            estado: 1,
        },
        {
            id: 267,
            nombre: 'Cáceres',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 268,
            nombre: 'Cáchira',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 269,
            nombre: 'Cácota',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 270,
            nombre: 'Cáqueza',
            departamento_id: 25,
            estado: 1,
        },


        {
            id: 271,
            nombre: 'Cértegui',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 272,
            nombre: 'Cómbita',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 273,
            nombre: 'Córdoba',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 274,
            nombre: 'Córdoba',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 275,
            nombre: 'Cúcuta',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 276,
            nombre: 'Dabeiba',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 277,
            nombre: 'Dagua',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 278,
            nombre: 'Dibulla',
            departamento_id: 44,
            estado: 1,
        },
        {
            id: 279,
            nombre: 'Distracción',
            departamento_id: 44,
            estado: 1,
        },
        {
            id: 280,
            nombre: 'Dolores',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 281,
            nombre: 'Don Matías',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 282,
            nombre: 'Dos Quebradas',
            departamento_id: 66,
            estado: 1,
        },
        {
            id: 283,
            nombre: 'Duitama',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 284,
            nombre: 'Durania',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 285,
            nombre: 'Ebéjico',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 286,
            nombre: 'El Bagre',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 287,
            nombre: 'El Banco',
            departamento_id: 47,
            estado: 1,
        },
        {
            id: 288,
            nombre: 'El Cairo',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 289,
            nombre: 'El Calvario',
            departamento_id: 50,
            estado: 1,
        },
        {
            id: 290,
            nombre: 'El Carmen',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 291,
            nombre: 'El Carmen',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 292,
            nombre: 'El Carmen de Atrato',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 293,
            nombre: 'El Carmen de Bolívar',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 294,
            nombre: 'El Castillo',
            departamento_id: 50,
            estado: 1,
        },
        {
            id: 295,
            nombre: 'El Cerrito',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 296,
            nombre: 'El Charco',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 297,
            nombre: 'El Cocuy',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 298,
            nombre: 'El Colegio',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 299,
            nombre: 'El Copey',
            departamento_id: 20,
            estado: 1,
        },
        {
            id: 300,
            nombre: 'El Doncello',
            departamento_id: 18,
            estado: 1,
        },
        {
            id: 301,
            nombre: 'El Dorado',
            departamento_id: 50,
            estado: 1,
        },
        {
            id: 302,
            nombre: 'El Dovio',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 303,
            nombre: 'El Espino',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 304,
            nombre: 'El Guacamayo',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 305,
            nombre: 'El Guamo',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 306,
            nombre: 'El Molino',
            departamento_id: 44,
            estado: 1,
        },
        {
            id: 307,
            nombre: 'El Paso',
            departamento_id: 20,
            estado: 1,
        },
        {
            id: 308,
            nombre: 'El Paujil',
            departamento_id: 18,
            estado: 1,
        },
        {
            id: 309,
            nombre: 'El Peñol',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 310,
            nombre: 'El Peñon',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 311,
            nombre: 'El Peñon',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 312,
            nombre: 'El Peñón',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 313,
            nombre: 'El Piñon',
            departamento_id: 47,
            estado: 1,
        },
        {
            id: 314,
            nombre: 'El Playón',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 315,
            nombre: 'El Retorno',
            departamento_id: 95,
            estado: 1,
        },
        {
            id: 316,
            nombre: 'El Retén',
            departamento_id: 47,
            estado: 1,
        },
        {
            id: 317,
            nombre: 'El Roble',
            departamento_id: 70,
            estado: 1,
        },
        {
            id: 318,
            nombre: 'El Rosal',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 319,
            nombre: 'El Rosario',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 320,
            nombre: 'El Tablón de Gómez',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 321,
            nombre: 'El Tambo',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 322,
            nombre: 'El Tambo',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 323,
            nombre: 'El Tarra',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 324,
            nombre: 'El Zulia',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 325,
            nombre: 'El Águila',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 326,
            nombre: 'Elías',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 327,
            nombre: 'Encino',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 328,
            nombre: 'Enciso',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 329,
            nombre: 'Entrerríos',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 330,
            nombre: 'Envigado',
            departamento_id: 5,
            estado: 1,
        },


        {
            id: 331,
            nombre: 'Espinal',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 332,
            nombre: 'Facatativá',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 333,
            nombre: 'Falan',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 334,
            nombre: 'Filadelfia',
            departamento_id: 17,
            estado: 1,
        },
        {
            id: 335,
            nombre: 'Filandia',
            departamento_id: 63,
            estado: 1,
        },
        {
            id: 336,
            nombre: 'Firavitoba',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 337,
            nombre: 'Flandes',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 338,
            nombre: 'Florencia',
            departamento_id: 18,
            estado: 1,
        },
        {
            id: 339,
            nombre: 'Florencia',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 340,
            nombre: 'Floresta',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 341,
            nombre: 'Florida',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 342,
            nombre: 'Floridablanca',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 343,
            nombre: 'Florián',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 344,
            nombre: 'Fonseca',
            departamento_id: 44,
            estado: 1,
        },
        {
            id: 345,
            nombre: 'Fortúl',
            departamento_id: 81,
            estado: 1,
        },
        {
            id: 346,
            nombre: 'Fosca',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 347,
            nombre: 'Francisco Pizarro',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 348,
            nombre: 'Fredonia',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 349,
            nombre: 'Fresno',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 350,
            nombre: 'Frontino',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 351,
            nombre: 'Fuente de Oro',
            departamento_id: 50,
            estado: 1,
        },
        {
            id: 352,
            nombre: 'Fundación',
            departamento_id: 47,
            estado: 1,
        },
        {
            id: 353,
            nombre: 'Funes',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 354,
            nombre: 'Funza',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 355,
            nombre: 'Fusagasugá',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 356,
            nombre: 'Fómeque',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 357,
            nombre: 'Fúquene',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 358,
            nombre: 'Gachalá',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 359,
            nombre: 'Gachancipá',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 360,
            nombre: 'Gachantivá',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 361,
            nombre: 'Gachetá',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 362,
            nombre: 'Galapa',
            departamento_id: 8,
            estado: 1,
        },
        {
            id: 363,
            nombre: 'Galeras (Nueva Granada)',
            departamento_id: 70,
            estado: 1,
        },
        {
            id: 364,
            nombre: 'Galán',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 365,
            nombre: 'Gama',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 366,
            nombre: 'Gamarra',
            departamento_id: 20,
            estado: 1,
        },
        {
            id: 367,
            nombre: 'Garagoa',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 368,
            nombre: 'Garzón',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 369,
            nombre: 'Gigante',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 370,
            nombre: 'Ginebra',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 371,
            nombre: 'Giraldo',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 372,
            nombre: 'Girardot',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 373,
            nombre: 'Girardota',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 374,
            nombre: 'Girón',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 375,
            nombre: 'Gonzalez',
            departamento_id: 20,
            estado: 1,
        },
        {
            id: 376,
            nombre: 'Gramalote',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 377,
            nombre: 'Granada',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 378,
            nombre: 'Granada',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 379,
            nombre: 'Granada',
            departamento_id: 50,
            estado: 1,
        },
        {
            id: 380,
            nombre: 'Guaca',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 381,
            nombre: 'Guacamayas',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 382,
            nombre: 'Guacarí',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 383,
            nombre: 'Guachavés',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 384,
            nombre: 'Guachené',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 385,
            nombre: 'Guachetá',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 386,
            nombre: 'Guachucal',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 387,
            nombre: 'Guadalupe',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 388,
            nombre: 'Guadalupe',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 389,
            nombre: 'Guadalupe',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 390,
            nombre: 'Guaduas',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 391,
            nombre: 'Guaitarilla',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 392,
            nombre: 'Gualmatán',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 393,
            nombre: 'Guamal',
            departamento_id: 47,
            estado: 1,
        },
        {
            id: 394,
            nombre: 'Guamal',
            departamento_id: 50,
            estado: 1,
        },
        {
            id: 395,
            nombre: 'Guamo',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 396,
            nombre: 'Guapota',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 397,
            nombre: 'Guapí',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 398,
            nombre: 'Guaranda',
            departamento_id: 70,
            estado: 1,
        },
        {
            id: 399,
            nombre: 'Guarne',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 400,
            nombre: 'Guasca',
            departamento_id: 25,
            estado: 1,
        },


        {
            id: 401,
            nombre: 'Guatapé',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 402,
            nombre: 'Guataquí',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 403,
            nombre: 'Guatavita',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 404,
            nombre: 'Guateque',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 405,
            nombre: 'Guavatá',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 406,
            nombre: 'Guayabal de Siquima',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 407,
            nombre: 'Guayabetal',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 408,
            nombre: 'Guayatá',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 409,
            nombre: 'Guepsa',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 410,
            nombre: 'Guicán',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 411,
            nombre: 'Gutiérrez',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 412,
            nombre: 'Guática',
            departamento_id: 66,
            estado: 1,
        },
        {
            id: 413,
            nombre: 'Gámbita',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 414,
            nombre: 'Gámeza',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 415,
            nombre: 'Génova',
            departamento_id: 63,
            estado: 1,
        },
        {
            id: 416,
            nombre: 'Gómez Plata',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 417,
            nombre: 'Hacarí',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 418,
            nombre: 'Hatillo de Loba',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 419,
            nombre: 'Hato',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 420,
            nombre: 'Hato Corozal',
            departamento_id: 85,
            estado: 1,
        },
        {
            id: 421,
            nombre: 'Hatonuevo',
            departamento_id: 44,
            estado: 1,
        },
        {
            id: 422,
            nombre: 'Heliconia',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 423,
            nombre: 'Herrán',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 424,
            nombre: 'Herveo',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 425,
            nombre: 'Hispania',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 426,
            nombre: 'Hobo',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 427,
            nombre: 'Honda',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 428,
            nombre: 'Ibagué',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 429,
            nombre: 'Icononzo',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 430,
            nombre: 'Iles',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 431,
            nombre: 'Imúes',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 432,
            nombre: 'Inzá',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 433,
            nombre: 'Inírida',
            departamento_id: 94,
            estado: 1,
        },
        {
            id: 434,
            nombre: 'Ipiales',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 435,
            nombre: 'Isnos',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 436,
            nombre: 'Istmina',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 437,
            nombre: 'Itagüí',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 438,
            nombre: 'Ituango',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 439,
            nombre: 'Izá',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 440,
            nombre: 'Jambaló',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 441,
            nombre: 'Jamundí',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 442,
            nombre: 'Jardín',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 443,
            nombre: 'Jenesano',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 444,
            nombre: 'Jericó',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 445,
            nombre: 'Jericó',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 446,
            nombre: 'Jerusalén',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 447,
            nombre: 'Jesús María',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 448,
            nombre: 'Jordán',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 449,
            nombre: 'Juan de Acosta',
            departamento_id: 8,
            estado: 1,
        },
        {
            id: 450,
            nombre: 'Junín',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 451,
            nombre: 'Juradó',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 452,
            nombre: 'La Apartada y La Frontera',
            departamento_id: 23,
            estado: 1,
        },
        {
            id: 453,
            nombre: 'La Argentina',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 454,
            nombre: 'La Belleza',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 455,
            nombre: 'La Calera',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 456,
            nombre: 'La Capilla',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 457,
            nombre: 'La Ceja',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 458,
            nombre: 'La Celia',
            departamento_id: 66,
            estado: 1,
        },
        {
            id: 459,
            nombre: 'La Cruz',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 460,
            nombre: 'La Cumbre',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 461,
            nombre: 'La Dorada',
            departamento_id: 17,
            estado: 1,
        },
        {
            id: 462,
            nombre: 'La Esperanza',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 463,
            nombre: 'La Estrella',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 464,
            nombre: 'La Florida',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 465,
            nombre: 'La Gloria',
            departamento_id: 20,
            estado: 1,
        },
        {
            id: 466,
            nombre: 'La Jagua de Ibirico',
            departamento_id: 20,
            estado: 1,
        },
        {
            id: 467,
            nombre: 'La Jagua del Pilar',
            departamento_id: 44,
            estado: 1,
        },
        {
            id: 468,
            nombre: 'La Llanada',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 469,
            nombre: 'La Macarena',
            departamento_id: 50,
            estado: 1,
        },
        {
            id: 470,
            nombre: 'La Merced',
            departamento_id: 17,
            estado: 1,
        },
        {
            id: 471,
            nombre: 'La Mesa',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 472,
            nombre: 'La Montañita',
            departamento_id: 18,
            estado: 1,
        },
        {
            id: 473,
            nombre: 'La Palma',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 474,
            nombre: 'La Paz',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 475,
            nombre: 'La Paz (Robles)',
            departamento_id: 20,
            estado: 1,
        },
        {
            id: 476,
            nombre: 'La Peña',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 477,
            nombre: 'La Pintada',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 478,
            nombre: 'La Plata',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 479,
            nombre: 'La Playa',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 480,
            nombre: 'La Primavera',
            departamento_id: 99,
            estado: 1,
        },
        {
            id: 481,
            nombre: 'La Salina',
            departamento_id: 85,
            estado: 1,
        },
        {
            id: 482,
            nombre: 'La Sierra',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 483,
            nombre: 'La Tebaida',
            departamento_id: 63,
            estado: 1,
        },
        {
            id: 484,
            nombre: 'La Tola',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 485,
            nombre: 'La Unión',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 486,
            nombre: 'La Unión',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 487,
            nombre: 'La Unión',
            departamento_id: 70,
            estado: 1,
        },
        {
            id: 488,
            nombre: 'La Unión',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 489,
            nombre: 'La Uvita',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 490,
            nombre: 'La Vega',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 491,
            nombre: 'La Vega',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 492,
            nombre: 'La Victoria',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 493,
            nombre: 'La Victoria',
            departamento_id: 17,
            estado: 1,
        },
        {
            id: 494,
            nombre: 'La Victoria',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 495,
            nombre: 'La Virginia',
            departamento_id: 66,
            estado: 1,
        },
        {
            id: 496,
            nombre: 'Labateca',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 497,
            nombre: 'Labranzagrande',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 498,
            nombre: 'Landázuri',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 499,
            nombre: 'Lebrija',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 500,
            nombre: 'Leiva',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 501,
            nombre: 'Lejanías',
            departamento_id: 50,
            estado: 1,
        },
        {
            id: 502,
            nombre: 'Lenguazaque',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 503,
            nombre: 'Leticia',
            departamento_id: 91,
            estado: 1,
        },
        {
            id: 504,
            nombre: 'Liborina',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 505,
            nombre: 'Linares',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 506,
            nombre: 'Lloró',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 507,
            nombre: 'Lorica',
            departamento_id: 23,
            estado: 1,
        },
        {
            id: 508,
            nombre: 'Los Córdobas',
            departamento_id: 23,
            estado: 1,
        },
        {
            id: 509,
            nombre: 'Los Palmitos',
            departamento_id: 70,
            estado: 1,
        },
        {
            id: 510,
            nombre: 'Los Patios',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 511,
            nombre: 'Los Santos',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 512,
            nombre: 'Lourdes',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 513,
            nombre: 'Luruaco',
            departamento_id: 8,
            estado: 1,
        },
        {
            id: 514,
            nombre: 'Lérida',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 515,
            nombre: 'Líbano',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 516,
            nombre: 'López (Micay)',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 517,
            nombre: 'Macanal',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 518,
            nombre: 'Macaravita',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 519,
            nombre: 'Maceo',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 520,
            nombre: 'Machetá',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 521,
            nombre: 'Madrid',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 522,
            nombre: 'Magangué',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 523,
            nombre: 'Magüi (Payán)',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 524,
            nombre: 'Mahates',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 525,
            nombre: 'Maicao',
            departamento_id: 44,
            estado: 1,
        },
        {
            id: 526,
            nombre: 'Majagual',
            departamento_id: 70,
            estado: 1,
        },
        {
            id: 527,
            nombre: 'Malambo',
            departamento_id: 8,
            estado: 1,
        },
        {
            id: 528,
            nombre: 'Mallama (Piedrancha)',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 529,
            nombre: 'Manatí',
            departamento_id: 8,
            estado: 1,
        },
        {
            id: 530,
            nombre: 'Manaure',
            departamento_id: 44,
            estado: 1,
        },
        {
            id: 531,
            nombre: 'Manaure Balcón del Cesar',
            departamento_id: 20,
            estado: 1,
        },
        {
            id: 532,
            nombre: 'Manizales',
            departamento_id: 17,
            estado: 1,
        },
        {
            id: 533,
            nombre: 'Manta',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 534,
            nombre: 'Manzanares',
            departamento_id: 17,
            estado: 1,
        },
        {
            id: 535,
            nombre: 'Maní',
            departamento_id: 85,
            estado: 1,
        },
        {
            id: 536,
            nombre: 'Mapiripan',
            departamento_id: 50,
            estado: 1,
        },
        {
            id: 537,
            nombre: 'Margarita',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 538,
            nombre: 'Marinilla',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 539,
            nombre: 'Maripí',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 540,
            nombre: 'Mariquita',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 541,
            nombre: 'Marmato',
            departamento_id: 17,
            estado: 1,
        },
        {
            id: 542,
            nombre: 'Marquetalia',
            departamento_id: 17,
            estado: 1,
        },
        {
            id: 543,
            nombre: 'Marsella',
            departamento_id: 66,
            estado: 1,
        },
        {
            id: 544,
            nombre: 'Marulanda',
            departamento_id: 17,
            estado: 1,
        },
        {
            id: 545,
            nombre: 'María la Baja',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 546,
            nombre: 'Matanza',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 547,
            nombre: 'Medellín',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 548,
            nombre: 'Medina',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 549,
            nombre: 'Medio Atrato',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 550,
            nombre: 'Medio Baudó',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 551,
            nombre: 'Medio San Juan (ANDAGOYA)',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 552,
            nombre: 'Melgar',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 553,
            nombre: 'Mercaderes',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 554,
            nombre: 'Mesetas',
            departamento_id: 50,
            estado: 1,
        },
        {
            id: 555,
            nombre: 'Milán',
            departamento_id: 18,
            estado: 1,
        },
        {
            id: 556,
            nombre: 'Miraflores',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 557,
            nombre: 'Miraflores',
            departamento_id: 95,
            estado: 1,
        },
        {
            id: 558,
            nombre: 'Miranda',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 559,
            nombre: 'Mistrató',
            departamento_id: 66,
            estado: 1,
        },
        {
            id: 560,
            nombre: 'Mitú',
            departamento_id: 97,
            estado: 1,
        },
        {
            id: 561,
            nombre: 'Mocoa',
            departamento_id: 86,
            estado: 1,
        },
        {
            id: 562,
            nombre: 'Mogotes',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 563,
            nombre: 'Molagavita',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 564,
            nombre: 'Momil',
            departamento_id: 23,
            estado: 1,
        },
        {
            id: 565,
            nombre: 'Mompós',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 566,
            nombre: 'Mongua',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 567,
            nombre: 'Monguí',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 568,
            nombre: 'Moniquirá',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 569,
            nombre: 'Montebello',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 570,
            nombre: 'Montecristo',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 571,
            nombre: 'Montelíbano',
            departamento_id: 23,
            estado: 1,
        },
        {
            id: 572,
            nombre: 'Montenegro',
            departamento_id: 63,
            estado: 1,
        },
        {
            id: 573,
            nombre: 'Monteria',
            departamento_id: 23,
            estado: 1,
        },
        {
            id: 574,
            nombre: 'Monterrey',
            departamento_id: 85,
            estado: 1,
        },
        {
            id: 575,
            nombre: 'Morales',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 576,
            nombre: 'Morales',
            departamento_id: 19,
            estado: 1,
        },
        {
            id: 577,
            nombre: 'Morelia',
            departamento_id: 18,
            estado: 1,
        },
        {
            id: 578,
            nombre: 'Morroa',
            departamento_id: 70,
            estado: 1,
        },
        {
            id: 579,
            nombre: 'Mosquera',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 580,
            nombre: 'Mosquera',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 581,
            nombre: 'Motavita',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 582,
            nombre: 'Moñitos',
            departamento_id: 23,
            estado: 1,
        },
        {
            id: 583,
            nombre: 'Murillo',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 584,
            nombre: 'Murindó',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 585,
            nombre: 'Mutatá',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 586,
            nombre: 'Mutiscua',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 587,
            nombre: 'Muzo',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 588,
            nombre: 'Málaga',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 589,
            nombre: 'Nariño',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 590,
            nombre: 'Nariño',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 591,
            nombre: 'Nariño',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 592,
            nombre: 'Natagaima',
            departamento_id: 73,
            estado: 1,
        },
        {
            id: 593,
            nombre: 'Nechí',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 594,
            nombre: 'Necoclí',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 595,
            nombre: 'Neira',
            departamento_id: 17,
            estado: 1,
        },
        {
            id: 596,
            nombre: 'Neiva',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 597,
            nombre: 'Nemocón',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 598,
            nombre: 'Nilo',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 599,
            nombre: 'Nimaima',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 600,
            nombre: 'Nobsa',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 601,
            nombre: 'Nocaima',
            departamento_id: 25,
            estado: 1,
        },
        {
            id: 602,
            nombre: 'Norcasia',
            departamento_id: 17,
            estado: 1,
        },
        {
            id: 603,
            nombre: 'Norosí',
            departamento_id: 13,
            estado: 1,
        },
        {
            id: 604,
            nombre: 'Novita',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 605,
            nombre: 'Nueva Granada',
            departamento_id: 47,
            estado: 1,
        },
        {
            id: 606,
            nombre: 'Nuevo Colón',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 607,
            nombre: 'Nunchía',
            departamento_id: 85,
            estado: 1,
        },
        {
            id: 608,
            nombre: 'Nuquí',
            departamento_id: 27,
            estado: 1,
        },
        {
            id: 609,
            nombre: 'Nátaga',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 610,
            nombre: 'Obando',
            departamento_id: 76,
            estado: 1,
        },
        {
            id: 611,
            nombre: 'Ocamonte',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 612,
            nombre: 'Ocaña',
            departamento_id: 54,
            estado: 1,
        },
        {
            id: 613,
            nombre: 'Oiba',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 614,
            nombre: 'Oicatá',
            departamento_id: 15,
            estado: 1,
        },
        {
            id: 615,
            nombre: 'Olaya',
            departamento_id: 5,
            estado: 1,
        },
        {
            id: 616,
            nombre: 'Olaya Herrera',
            departamento_id: 52,
            estado: 1,
        },
        {
            id: 617,
            nombre: 'Onzaga',
            departamento_id: 68,
            estado: 1,
        },
        {
            id: 618,
            nombre: 'Oporapa',
            departamento_id: 41,
            estado: 1,
        },
        {
            id: 619,
            nombre: 'Orito',
            departamento_id: 86,
            estado: 1,
        },
        {
            id: 620,
            nombre: 'Orocué',
            departamento_id: 85,
            estado: 1,
        },


        {
            id: 621,
            nombre: 'Ortega',
            departamento_id: 73,
            estado: 1
        },
        {
            id: 622,
            nombre: 'Ospina',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 623,
            nombre: 'Otanche',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 624,
            nombre: 'Ovejas',
            departamento_id: 70,
            estado: 1
        },
        {
            id: 625,
            nombre: 'Pachavita',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 626,
            nombre: 'Pacho',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 627,
            nombre: 'Padilla',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 628,
            nombre: 'Paicol',
            departamento_id: 41,
            estado: 1
        },
        {
            id: 629,
            nombre: 'Pailitas',
            departamento_id: 20,
            estado: 1
        },
        {
            id: 630,
            nombre: 'Paime',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 631,
            nombre: 'Paipa',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 632,
            nombre: 'Pajarito',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 633,
            nombre: 'Palermo',
            departamento_id: 41,
            estado: 1
        },
        {
            id: 634,
            nombre: 'Palestina',
            departamento_id: 17,
            estado: 1
        },
        {
            id: 635,
            nombre: 'Palestina',
            departamento_id: 41,
            estado: 1
        },
        {
            id: 636,
            nombre: 'Palmar',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 637,
            nombre: 'Palmar de Varela',
            departamento_id: 8,
            estado: 1
        },
        {
            id: 638,
            nombre: 'Palmas del Socorro',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 639,
            nombre: 'Palmira',
            departamento_id: 76,
            estado: 1
        },
        {
            id: 640,
            nombre: 'Palmito',
            departamento_id: 70,
            estado: 1
        },
        {
            id: 641,
            nombre: 'Palocabildo',
            departamento_id: 73,
            estado: 1
        },
        {
            id: 642,
            nombre: 'Pamplona',
            departamento_id: 54,
            estado: 1
        },
        {
            id: 643,
            nombre: 'Pamplonita',
            departamento_id: 54,
            estado: 1
        },
        {
            id: 644,
            nombre: 'Pandi',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 645,
            nombre: 'Panqueba',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 646,
            nombre: 'Paratebueno',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 647,
            nombre: 'Pasca',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 648,
            nombre: 'Patía (El Bordo)',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 649,
            nombre: 'Pauna',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 650,
            nombre: 'Paya',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 651,
            nombre: 'Paz de Ariporo',
            departamento_id: 85,
            estado: 1
        },
        {
            id: 652,
            nombre: 'Paz de Río',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 653,
            nombre: 'Pedraza',
            departamento_id: 47,
            estado: 1
        },
        {
            id: 654,
            nombre: 'Pelaya',
            departamento_id: 20,
            estado: 1
        },
        {
            id: 655,
            nombre: 'Pensilvania',
            departamento_id: 17,
            estado: 1
        },
        {
            id: 656,
            nombre: 'Peque',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 657,
            nombre: 'Pereira',
            departamento_id: 66,
            estado: 1
        },
        {
            id: 658,
            nombre: 'Pesca',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 659,
            nombre: 'Peñol',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 660,
            nombre: 'Piamonte',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 661,
            nombre: 'Pie de Cuesta',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 662,
            nombre: 'Piedras',
            departamento_id: 73,
            estado: 1
        },
        {
            id: 663,
            nombre: 'Piendamó',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 664,
            nombre: 'Pijao',
            departamento_id: 63,
            estado: 1
        },
        {
            id: 665,
            nombre: 'Pijiño',
            departamento_id: 47,
            estado: 1
        },
        {
            id: 666,
            nombre: 'Pinchote',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 667,
            nombre: 'Pinillos',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 668,
            nombre: 'Piojo',
            departamento_id: 8,
            estado: 1
        },
        {
            id: 669,
            nombre: 'Pisva',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 670,
            nombre: 'Pital',
            departamento_id: 41,
            estado: 1
        },
        {
            id: 671,
            nombre: 'Pitalito',
            departamento_id: 41,
            estado: 1
        },
        {
            id: 672,
            nombre: 'Pivijay',
            departamento_id: 47,
            estado: 1
        },
        {
            id: 673,
            nombre: 'Planadas',
            departamento_id: 73,
            estado: 1
        },
        {
            id: 674,
            nombre: 'Planeta Rica',
            departamento_id: 23,
            estado: 1
        },
        {
            id: 675,
            nombre: 'Plato',
            departamento_id: 47,
            estado: 1
        },
        {
            id: 676,
            nombre: 'Policarpa',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 677,
            nombre: 'Polonuevo',
            departamento_id: 8,
            estado: 1
        },
        {
            id: 678,
            nombre: 'Ponedera',
            departamento_id: 8,
            estado: 1
        },
        {
            id: 679,
            nombre: 'Popayán',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 680,
            nombre: 'Pore',
            departamento_id: 85,
            estado: 1
        },
        {
            id: 681,
            nombre: 'Potosí',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 682,
            nombre: 'Pradera',
            departamento_id: 76,
            estado: 1
        },
        {
            id: 683,
            nombre: 'Prado',
            departamento_id: 73,
            estado: 1
        },
        {
            id: 684,
            nombre: 'Providencia',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 685,
            nombre: 'Providencia',
            departamento_id: 88,
            estado: 1
        },
        {
            id: 686,
            nombre: 'Pueblo Bello',
            departamento_id: 20,
            estado: 1
        },
        {
            id: 687,
            nombre: 'Pueblo Nuevo',
            departamento_id: 23,
            estado: 1
        },
        {
            id: 688,
            nombre: 'Pueblo Rico',
            departamento_id: 66,
            estado: 1
        },
        {
            id: 689,
            nombre: 'Pueblorrico',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 690,
            nombre: 'Puebloviejo',
            departamento_id: 47,
            estado: 1
        },
        {
            id: 691,
            nombre: 'Puente Nacional',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 692,
            nombre: 'Puerres',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 693,
            nombre: 'Puerto Asís',
            departamento_id: 86,
            estado: 1
        },
        {
            id: 694,
            nombre: 'Puerto Berrío',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 695,
            nombre: 'Puerto Boyacá',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 696,
            nombre: 'Puerto Caicedo',
            departamento_id: 86,
            estado: 1
        },
        {
            id: 697,
            nombre: 'Puerto Carreño',
            departamento_id: 99,
            estado: 1
        },
        {
            id: 698,
            nombre: 'Puerto Colombia',
            departamento_id: 8,
            estado: 1
        },
        {
            id: 699,
            nombre: 'Puerto Concordia',
            departamento_id: 50,
            estado: 1
        },
        {
            id: 700,
            nombre: 'Puerto Escondido',
            departamento_id: 23,
            estado: 1
        },
        {
            id: 701,
            nombre: 'Puerto Gaitán',
            departamento_id: 50,
            estado: 1
        },
        {
            id: 702,
            nombre: 'Puerto Guzmán',
            departamento_id: 86,
            estado: 1
        },
        {
            id: 703,
            nombre: 'Puerto Leguízamo',
            departamento_id: 86,
            estado: 1
        },
        {
            id: 704,
            nombre: 'Puerto Libertador',
            departamento_id: 23,
            estado: 1
        },
        {
            id: 705,
            nombre: 'Puerto Lleras',
            departamento_id: 50,
            estado: 1
        },
        {
            id: 706,
            nombre: 'Puerto López',
            departamento_id: 50,
            estado: 1
        },
        {
            id: 707,
            nombre: 'Puerto Nare',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 708,
            nombre: 'Puerto Nariño',
            departamento_id: 91,
            estado: 1
        },
        {
            id: 709,
            nombre: 'Puerto Parra',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 710,
            nombre: 'Puerto Rico',
            departamento_id: 18,
            estado: 1
        },
        {
            id: 711,
            nombre: 'Puerto Rico',
            departamento_id: 50,
            estado: 1
        },
        {
            id: 712,
            nombre: 'Puerto Rondón',
            departamento_id: 81,
            estado: 1
        },
        {
            id: 713,
            nombre: 'Puerto Salgar',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 714,
            nombre: 'Puerto Santander',
            departamento_id: 54,
            estado: 1
        },
        {
            id: 715,
            nombre: 'Puerto Tejada',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 716,
            nombre: 'Puerto Triunfo',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 717,
            nombre: 'Puerto Wilches',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 718,
            nombre: 'Pulí',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 719,
            nombre: 'Pupiales',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 720,
            nombre: 'Puracé (Coconuco)',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 721,
            nombre: 'Purificación',
            departamento_id: 73,
            estado: 1
        },
        {
            id: 722,
            nombre: 'Purísima',
            departamento_id: 23,
            estado: 1
        },
        {
            id: 723,
            nombre: 'Pácora',
            departamento_id: 17,
            estado: 1
        },
        {
            id: 724,
            nombre: 'Páez',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 725,
            nombre: 'Páez (Belalcazar)',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 726,
            nombre: 'Páramo',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 727,
            nombre: 'Quebradanegra',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 728,
            nombre: 'Quetame',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 729,
            nombre: 'Quibdó',
            departamento_id: 27,
            estado: 1
        },
        {
            id: 730,
            nombre: 'Quimbaya',
            departamento_id: 63,
            estado: 1
        },
        {
            id: 731,
            nombre: 'Quinchía',
            departamento_id: 66,
            estado: 1
        },
        {
            id: 732,
            nombre: 'Quipama',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 733,
            nombre: 'Quipile',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 734,
            nombre: 'Ragonvalia',
            departamento_id: 54,
            estado: 1
        },
        {
            id: 735,
            nombre: 'Ramiriquí',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 736,
            nombre: 'Recetor',
            departamento_id: 85,
            estado: 1
        },
        {
            id: 737,
            nombre: 'Regidor',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 738,
            nombre: 'Remedios',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 739,
            nombre: 'Remolino',
            departamento_id: 47,
            estado: 1
        },
        {
            id: 740,
            nombre: 'Repelón',
            departamento_id: 8,
            estado: 1
        },
        {
            id: 741,
            nombre: 'Restrepo',
            departamento_id: 50,
            estado: 1
        },
        {
            id: 742,
            nombre: 'Restrepo',
            departamento_id: 76,
            estado: 1
        },
        {
            id: 743,
            nombre: 'Retiro',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 744,
            nombre: 'Ricaurte',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 745,
            nombre: 'Ricaurte',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 746,
            nombre: 'Rio Negro',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 747,
            nombre: 'Rioblanco',
            departamento_id: 73,
            estado: 1
        },
        {
            id: 748,
            nombre: 'Riofrío',
            departamento_id: 76,
            estado: 1
        },
        {
            id: 749,
            nombre: 'Riohacha',
            departamento_id: 44,
            estado: 1
        },
        {
            id: 750,
            nombre: 'Risaralda',
            departamento_id: 17,
            estado: 1
        },
        {
            id: 751,
            nombre: 'Rivera',
            departamento_id: 41,
            estado: 1
        },
        {
            id: 752,
            nombre: 'Roberto Payán (San José)',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 753,
            nombre: 'Roldanillo',
            departamento_id: 76,
            estado: 1
        },
        {
            id: 754,
            nombre: 'Roncesvalles',
            departamento_id: 73,
            estado: 1
        },
        {
            id: 755,
            nombre: 'Rondón',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 756,
            nombre: 'Rosas',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 757,
            nombre: 'Rovira',
            departamento_id: 73,
            estado: 1
        },
        {
            id: 758,
            nombre: 'Ráquira',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 759,
            nombre: 'Río Iró',
            departamento_id: 27,
            estado: 1
        },
        {
            id: 760,
            nombre: 'Río Quito',
            departamento_id: 27,
            estado: 1
        },
        {
            id: 761,
            nombre: 'Río Sucio',
            departamento_id: 17,
            estado: 1
        },
        {
            id: 762,
            nombre: 'Río Viejo',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 763,
            nombre: 'Río de oro',
            departamento_id: 20,
            estado: 1
        },
        {
            id: 764,
            nombre: 'Ríonegro',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 765,
            nombre: 'Ríosucio',
            departamento_id: 27,
            estado: 1
        },
        {
            id: 766,
            nombre: 'Sabana de Torres',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 767,
            nombre: 'Sabanagrande',
            departamento_id: 8,
            estado: 1
        },
        {
            id: 768,
            nombre: 'Sabanalarga',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 769,
            nombre: 'Sabanalarga',
            departamento_id: 8,
            estado: 1
        },
        {
            id: 770,
            nombre: 'Sabanalarga',
            departamento_id: 85,
            estado: 1
        },
        {
            id: 771,
            nombre: 'Sabanas de San Angel (SAN ANGE',
            departamento_id: 47,
            estado: 1
        },
        {
            id: 772,
            nombre: 'Sabaneta',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 773,
            nombre: 'Saboyá',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 774,
            nombre: 'Sahagún',
            departamento_id: 23,
            estado: 1
        },
        {
            id: 775,
            nombre: 'Saladoblanco',
            departamento_id: 41,
            estado: 1
        },
        {
            id: 776,
            nombre: 'Salamina',
            departamento_id: 17,
            estado: 1
        },
        {
            id: 777,
            nombre: 'Salamina',
            departamento_id: 47,
            estado: 1
        },
        {
            id: 778,
            nombre: 'Salazar',
            departamento_id: 54,
            estado: 1
        },
        {
            id: 779,
            nombre: 'Saldaña',
            departamento_id: 73,
            estado: 1
        },
        {
            id: 780,
            nombre: 'Salento',
            departamento_id: 63,
            estado: 1
        },
        {
            id: 781,
            nombre: 'Salgar',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 782,
            nombre: 'Samacá',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 783,
            nombre: 'Samaniego',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 784,
            nombre: 'Samaná',
            departamento_id: 17,
            estado: 1
        },
        {
            id: 785,
            nombre: 'Sampués',
            departamento_id: 70,
            estado: 1
        },
        {
            id: 786,
            nombre: 'San Agustín',
            departamento_id: 41,
            estado: 1
        },
        {
            id: 787,
            nombre: 'San Alberto',
            departamento_id: 20,
            estado: 1
        },
        {
            id: 788,
            nombre: 'San Andrés',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 789,
            nombre: 'San Andrés Sotavento',
            departamento_id: 23,
            estado: 1
        },
        {
            id: 790,
            nombre: 'San Andrés de Cuerquía',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 791,
            nombre: 'San Antero',
            departamento_id: 23,
            estado: 1
        },
        {
            id: 792,
            nombre: 'San Antonio',
            departamento_id: 73,
            estado: 1
        },
        {
            id: 793,
            nombre: 'San Antonio de Tequendama',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 794,
            nombre: 'San Benito',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 795,
            nombre: 'San Benito Abad',
            departamento_id: 70,
            estado: 1
        },
        {
            id: 796,
            nombre: 'San Bernardo',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 797,
            nombre: 'San Bernardo',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 798,
            nombre: 'San Bernardo del Viento',
            departamento_id: 23,
            estado: 1
        },
        {
            id: 799,
            nombre: 'San Calixto',
            departamento_id: 54,
            estado: 1
        },
        {
            id: 800,
            nombre: 'San Carlos',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 801,
            nombre: 'San Carlos',
            departamento_id: 23,
            estado: 1
        },
        {
            id: 802,
            nombre: 'San Carlos de Guaroa',
            departamento_id: 50,
            estado: 1
        },
        {
            id: 803,
            nombre: 'San Cayetano',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 804,
            nombre: 'San Cayetano',
            departamento_id: 54,
            estado: 1
        },
        {
            id: 805,
            nombre: 'San Cristobal',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 806,
            nombre: 'San Diego',
            departamento_id: 20,
            estado: 1
        },
        {
            id: 807,
            nombre: 'San Eduardo',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 808,
            nombre: 'San Estanislao',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 809,
            nombre: 'San Fernando',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 810,
            nombre: 'San Francisco',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 811,
            nombre: 'San Francisco',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 812,
            nombre: 'San Francisco',
            departamento_id: 86,
            estado: 1
        },
        {
            id: 813,
            nombre: 'San Gíl',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 814,
            nombre: 'San Jacinto',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 815,
            nombre: 'San Jacinto del Cauca',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 816,
            nombre: 'San Jerónimo',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 817,
            nombre: 'San Joaquín',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 818,
            nombre: 'San José',
            departamento_id: 17,
            estado: 1
        },
        {
            id: 819,
            nombre: 'San José de Miranda',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 820,
            nombre: 'San José de Montaña',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 821,
            nombre: 'San José de Pare',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 822,
            nombre: 'San José de Uré',
            departamento_id: 23,
            estado: 1
        },
        {
            id: 823,
            nombre: 'San José del Fragua',
            departamento_id: 18,
            estado: 1
        },
        {
            id: 824,
            nombre: 'San José del Guaviare',
            departamento_id: 95,
            estado: 1
        },
        {
            id: 825,
            nombre: 'San José del Palmar',
            departamento_id: 27,
            estado: 1
        },
        {
            id: 826,
            nombre: 'San Juan de Arama',
            departamento_id: 50,
            estado: 1
        },
        {
            id: 827,
            nombre: 'San Juan de Betulia',
            departamento_id: 70,
            estado: 1
        },
        {
            id: 828,
            nombre: 'San Juan de Nepomuceno',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 829,
            nombre: 'San Juan de Pasto',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 830,
            nombre: 'San Juan de Río Seco',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 831,
            nombre: 'San Juan de Urabá',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 832,
            nombre: 'San Juan del Cesar',
            departamento_id: 44,
            estado: 1
        },
        {
            id: 833,
            nombre: 'San Juanito',
            departamento_id: 50,
            estado: 1
        },
        {
            id: 834,
            nombre: 'San Lorenzo',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 835,
            nombre: 'San Luis',
            departamento_id: 73,
            estado: 1
        },
        {
            id: 836,
            nombre: 'San Luís',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 837,
            nombre: 'San Luís de Gaceno',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 838,
            nombre: 'San Luís de Palenque',
            departamento_id: 85,
            estado: 1
        },
        {
            id: 839,
            nombre: 'San Marcos',
            departamento_id: 70,
            estado: 1
        },
        {
            id: 840,
            nombre: 'San Martín',
            departamento_id: 20,
            estado: 1
        },
        {
            id: 841,
            nombre: 'San Martín',
            departamento_id: 50,
            estado: 1
        },
        {
            id: 842,
            nombre: 'San Martín de Loba',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 843,
            nombre: 'San Mateo',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 844,
            nombre: 'San Miguel',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 845,
            nombre: 'San Miguel',
            departamento_id: 86,
            estado: 1
        },
        {
            id: 846,
            nombre: 'San Miguel de Sema',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 847,
            nombre: 'San Onofre',
            departamento_id: 70,
            estado: 1
        },
        {
            id: 848,
            nombre: 'San Pablo',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 849,
            nombre: 'San Pablo',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 850,
            nombre: 'San Pablo de Borbur',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 851,
            nombre: 'San Pedro',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 852,
            nombre: 'San Pedro',
            departamento_id: 70,
            estado: 1
        },
        {
            id: 853,
            nombre: 'San Pedro',
            departamento_id: 76,
            estado: 1
        },
        {
            id: 854,
            nombre: 'San Pedro de Cartago',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 855,
            nombre: 'San Pedro de Urabá',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 856,
            nombre: 'San Pelayo',
            departamento_id: 23,
            estado: 1
        },
        {
            id: 857,
            nombre: 'San Rafael',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 858,
            nombre: 'San Roque',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 859,
            nombre: 'San Sebastián',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 860,
            nombre: 'San Sebastián de Buenavista',
            departamento_id: 47,
            estado: 1
        },
        {
            id: 861,
            nombre: 'San Vicente',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 862,
            nombre: 'San Vicente del Caguán',
            departamento_id: 18,
            estado: 1
        },
        {
            id: 863,
            nombre: 'San Vicente del Chucurí',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 864,
            nombre: 'San Zenón',
            departamento_id: 47,
            estado: 1
        },
        {
            id: 865,
            nombre: 'Sandoná',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 866,
            nombre: 'Santa Ana',
            departamento_id: 47,
            estado: 1
        },
        {
            id: 867,
            nombre: 'Santa Bárbara',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 868,
            nombre: 'Santa Bárbara',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 869,
            nombre: 'Santa Bárbara (Iscuandé)',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 870,
            nombre: 'Santa Bárbara de Pinto',
            departamento_id: 47,
            estado: 1
        },


        {
            id: 871,
            nombre: 'Santa Catalina',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 872,
            nombre: 'Santa Fé de Antioquia',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 873,
            nombre: 'Santa Genoveva de Docorodó',
            departamento_id: 27,
            estado: 1
        },
        {
            id: 874,
            nombre: 'Santa Helena del Opón',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 875,
            nombre: 'Santa Isabel',
            departamento_id: 73,
            estado: 1
        },
        {
            id: 876,
            nombre: 'Santa Lucía',
            departamento_id: 8,
            estado: 1
        },
        {
            id: 877,
            nombre: 'Santa Marta',
            departamento_id: 47,
            estado: 1
        },
        {
            id: 878,
            nombre: 'Santa María',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 879,
            nombre: 'Santa María',
            departamento_id: 41,
            estado: 1
        },
        {
            id: 880,
            nombre: 'Santa Rosa',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 881,
            nombre: 'Santa Rosa',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 882,
            nombre: 'Santa Rosa de Cabal',
            departamento_id: 66,
            estado: 1
        },
        {
            id: 883,
            nombre: 'Santa Rosa de Osos',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 884,
            nombre: 'Santa Rosa de Viterbo',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 885,
            nombre: 'Santa Rosa del Sur',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 886,
            nombre: 'Santa Rosalía',
            departamento_id: 99,
            estado: 1
        },
        {
            id: 887,
            nombre: 'Santa Sofía',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 888,
            nombre: 'Santana',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 889,
            nombre: 'Santander de Quilichao',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 890,
            nombre: 'Santiago',
            departamento_id: 54,
            estado: 1
        },
        {
            id: 891,
            nombre: 'Santiago',
            departamento_id: 86,
            estado: 1
        },
        {
            id: 892,
            nombre: 'Santo Domingo',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 893,
            nombre: 'Santo Tomás',
            departamento_id: 8,
            estado: 1
        },
        {
            id: 894,
            nombre: 'Santuario',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 895,
            nombre: 'Santuario',
            departamento_id: 66,
            estado: 1
        },
        {
            id: 896,
            nombre: 'Sapuyes',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 897,
            nombre: 'Saravena',
            departamento_id: 81,
            estado: 1
        },
        {
            id: 898,
            nombre: 'Sardinata',
            departamento_id: 54,
            estado: 1
        },
        {
            id: 899,
            nombre: 'Sasaima',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 900,
            nombre: 'Sativanorte',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 901,
            nombre: 'Sativasur',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 902,
            nombre: 'Segovia',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 903,
            nombre: 'Sesquilé',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 904,
            nombre: 'Sevilla',
            departamento_id: 76,
            estado: 1
        },
        {
            id: 905,
            nombre: 'Siachoque',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 906,
            nombre: 'Sibaté',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 907,
            nombre: 'Sibundoy',
            departamento_id: 86,
            estado: 1
        },
        {
            id: 908,
            nombre: 'Silos',
            departamento_id: 54,
            estado: 1
        },
        {
            id: 909,
            nombre: 'Silvania',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 910,
            nombre: 'Silvia',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 911,
            nombre: 'Simacota',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 912,
            nombre: 'Simijaca',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 913,
            nombre: 'Simití',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 914,
            nombre: 'Sincelejo',
            departamento_id: 70,
            estado: 1
        },
        {
            id: 915,
            nombre: 'Sincé',
            departamento_id: 70,
            estado: 1
        },
        {
            id: 916,
            nombre: 'Sipí',
            departamento_id: 27,
            estado: 1
        },
        {
            id: 917,
            nombre: 'Sitionuevo',
            departamento_id: 47,
            estado: 1
        },
        {
            id: 918,
            nombre: 'Soacha',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 919,
            nombre: 'Soatá',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 920,
            nombre: 'Socha',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 921,
            nombre: 'Socorro',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 922,
            nombre: 'Socotá',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 923,
            nombre: 'Sogamoso',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 924,
            nombre: 'Solano',
            departamento_id: 18,
            estado: 1
        },
        {
            id: 925,
            nombre: 'Soledad',
            departamento_id: 8,
            estado: 1
        },
        {
            id: 926,
            nombre: 'Solita',
            departamento_id: 18,
            estado: 1
        },
        {
            id: 927,
            nombre: 'Somondoco',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 928,
            nombre: 'Sonsón',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 929,
            nombre: 'Sopetrán',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 930,
            nombre: 'Soplaviento',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 931,
            nombre: 'Sopó',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 932,
            nombre: 'Sora',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 933,
            nombre: 'Soracá',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 934,
            nombre: 'Sotaquirá',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 935,
            nombre: 'Sotara (Paispamba)',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 936,
            nombre: 'Sotomayor (Los Andes)',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 937,
            nombre: 'Suaita',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 938,
            nombre: 'Suan',
            departamento_id: 8,
            estado: 1
        },
        {
            id: 939,
            nombre: 'Suaza',
            departamento_id: 41,
            estado: 1
        },
        {
            id: 940,
            nombre: 'Subachoque',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 941,
            nombre: 'Sucre',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 942,
            nombre: 'Sucre',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 943,
            nombre: 'Sucre',
            departamento_id: 70,
            estado: 1
        },
        {
            id: 944,
            nombre: 'Suesca',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 945,
            nombre: 'Supatá',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 946,
            nombre: 'Supía',
            departamento_id: 17,
            estado: 1
        },
        {
            id: 947,
            nombre: 'Suratá',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 948,
            nombre: 'Susa',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 949,
            nombre: 'Susacón',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 950,
            nombre: 'Sutamarchán',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 951,
            nombre: 'Sutatausa',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 952,
            nombre: 'Sutatenza',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 953,
            nombre: 'Suárez',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 954,
            nombre: 'Suárez',
            departamento_id: 73,
            estado: 1
        },
        {
            id: 955,
            nombre: 'Sácama',
            departamento_id: 85,
            estado: 1
        },
        {
            id: 956,
            nombre: 'Sáchica',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 957,
            nombre: 'Tabio',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 958,
            nombre: 'Tadó',
            departamento_id: 27,
            estado: 1
        },
        {
            id: 959,
            nombre: 'Talaigua Nuevo',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 960,
            nombre: 'Tamalameque',
            departamento_id: 20,
            estado: 1
        },
        {
            id: 961,
            nombre: 'Tame',
            departamento_id: 81,
            estado: 1
        },
        {
            id: 962,
            nombre: 'Taminango',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 963,
            nombre: 'Tangua',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 964,
            nombre: 'Taraira',
            departamento_id: 97,
            estado: 1
        },
        {
            id: 965,
            nombre: 'Tarazá',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 966,
            nombre: 'Tarqui',
            departamento_id: 41,
            estado: 1
        },
        {
            id: 967,
            nombre: 'Tarso',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 968,
            nombre: 'Tasco',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 969,
            nombre: 'Tauramena',
            departamento_id: 85,
            estado: 1
        },
        {
            id: 970,
            nombre: 'Tausa',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 971,
            nombre: 'Tello',
            departamento_id: 41,
            estado: 1
        },
        {
            id: 972,
            nombre: 'Tena',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 973,
            nombre: 'Tenerife',
            departamento_id: 47,
            estado: 1
        },
        {
            id: 974,
            nombre: 'Tenjo',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 975,
            nombre: 'Tenza',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 976,
            nombre: 'Teorama',
            departamento_id: 54,
            estado: 1
        },
        {
            id: 977,
            nombre: 'Teruel',
            departamento_id: 41,
            estado: 1
        },
        {
            id: 978,
            nombre: 'Tesalia',
            departamento_id: 41,
            estado: 1
        },
        {
            id: 979,
            nombre: 'Tibacuy',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 980,
            nombre: 'Tibaná',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 981,
            nombre: 'Tibasosa',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 982,
            nombre: 'Tibirita',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 983,
            nombre: 'Tibú',
            departamento_id: 54,
            estado: 1
        },
        {
            id: 984,
            nombre: 'Tierralta',
            departamento_id: 23,
            estado: 1
        },
        {
            id: 985,
            nombre: 'Timaná',
            departamento_id: 41,
            estado: 1
        },
        {
            id: 986,
            nombre: 'Timbiquí',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 987,
            nombre: 'Timbío',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 988,
            nombre: 'Tinjacá',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 989,
            nombre: 'Tipacoque',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 990,
            nombre: 'Tiquisio (Puerto Rico)',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 991,
            nombre: 'Titiribí',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 992,
            nombre: 'Toca',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 993,
            nombre: 'Tocaima',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 994,
            nombre: 'Tocancipá',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 995,
            nombre: 'Toguí',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 996,
            nombre: 'Toledo',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 997,
            nombre: 'Toledo',
            departamento_id: 54,
            estado: 1
        },
        {
            id: 998,
            nombre: 'Tolú',
            departamento_id: 70,
            estado: 1
        },
        {
            id: 999,
            nombre: 'Tolú Viejo',
            departamento_id: 70,
            estado: 1
        },
        {
            id: 1000,
            nombre: 'Tona',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 1001,
            nombre: 'Topagá',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 1002,
            nombre: 'Topaipí',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 1003,
            nombre: 'Toribío',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 1004,
            nombre: 'Toro',
            departamento_id: 76,
            estado: 1
        },
        {
            id: 1005,
            nombre: 'Tota',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 1006,
            nombre: 'Totoró',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 1007,
            nombre: 'Trinidad',
            departamento_id: 85,
            estado: 1
        },
        {
            id: 1008,
            nombre: 'Trujillo',
            departamento_id: 76,
            estado: 1
        },
        {
            id: 1009,
            nombre: 'Tubará',
            departamento_id: 8,
            estado: 1
        },
        {
            id: 1010,
            nombre: 'Tuchín',
            departamento_id: 23,
            estado: 1
        },
        {
            id: 1011,
            nombre: 'Tulúa',
            departamento_id: 76,
            estado: 1
        },
        {
            id: 1012,
            nombre: 'Tumaco',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 1013,
            nombre: 'Tunja',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 1014,
            nombre: 'Tunungua',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 1015,
            nombre: 'Turbaco',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 1016,
            nombre: 'Turbaná',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 1017,
            nombre: 'Turbo',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 1018,
            nombre: 'Turmequé',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 1019,
            nombre: 'Tuta',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 1020,
            nombre: 'Tutasá',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 1021,
            nombre: 'Támara',
            departamento_id: 85,
            estado: 1
        },
        {
            id: 1022,
            nombre: 'Támesis',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 1023,
            nombre: 'Túquerres',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 1024,
            nombre: 'Ubalá',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 1025,
            nombre: 'Ubaque',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 1026,
            nombre: 'Ubaté',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 1027,
            nombre: 'Ulloa',
            departamento_id: 76,
            estado: 1
        },
        {
            id: 1028,
            nombre: 'Une',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 1029,
            nombre: 'Unguía',
            departamento_id: 27,
            estado: 1
        },
        {
            id: 1030,
            nombre: 'Unión Panamericana (ÁNIMAS)',
            departamento_id: 27,
            estado: 1
        },
        {
            id: 1031,
            nombre: 'Uramita',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 1032,
            nombre: 'Uribe',
            departamento_id: 50,
            estado: 1
        },
        {
            id: 1033,
            nombre: 'Uribia',
            departamento_id: 44,
            estado: 1
        },
        {
            id: 1034,
            nombre: 'Urrao',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 1035,
            nombre: 'Urumita',
            departamento_id: 44,
            estado: 1
        },
        {
            id: 1036,
            nombre: 'Usiacuri',
            departamento_id: 8,
            estado: 1
        },
        {
            id: 1037,
            nombre: 'Valdivia',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 1038,
            nombre: 'Valencia',
            departamento_id: 23,
            estado: 1
        },
        {
            id: 1039,
            nombre: 'Valle de San José',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 1040,
            nombre: 'Valle de San Juan',
            departamento_id: 73,
            estado: 1
        },
        {
            id: 1041,
            nombre: 'Valle del Guamuez',
            departamento_id: 86,
            estado: 1
        },
        {
            id: 1042,
            nombre: 'Valledupar',
            departamento_id: 20,
            estado: 1
        },
        {
            id: 1043,
            nombre: 'Valparaiso',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 1044,
            nombre: 'Valparaiso',
            departamento_id: 18,
            estado: 1
        },
        {
            id: 1045,
            nombre: 'Vegachí',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 1046,
            nombre: 'Venadillo',
            departamento_id: 73,
            estado: 1
        },
        {
            id: 1047,
            nombre: 'Venecia',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 1048,
            nombre: 'Venecia (Ospina Pérez)',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 1049,
            nombre: 'Ventaquemada',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 1050,
            nombre: 'Vergara',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 1051,
            nombre: 'Versalles',
            departamento_id: 76,
            estado: 1
        },
        {
            id: 1052,
            nombre: 'Vetas',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 1053,
            nombre: 'Viani',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 1054,
            nombre: 'Vigía del Fuerte',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 1055,
            nombre: 'Vijes',
            departamento_id: 76,
            estado: 1
        },
        {
            id: 1056,
            nombre: 'Villa Caro',
            departamento_id: 54,
            estado: 1
        },
        {
            id: 1057,
            nombre: 'Villa Rica',
            departamento_id: 19,
            estado: 1
        },
        {
            id: 1058,
            nombre: 'Villa de Leiva',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 1059,
            nombre: 'Villa del Rosario',
            departamento_id: 54,
            estado: 1
        },
        {
            id: 1060,
            nombre: 'Villagarzón',
            departamento_id: 86,
            estado: 1
        },
        {
            id: 1061,
            nombre: 'Villagómez',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 1062,
            nombre: 'Villahermosa',
            departamento_id: 73,
            estado: 1
        },
        {
            id: 1063,
            nombre: 'Villamaría',
            departamento_id: 17,
            estado: 1
        },
        {
            id: 1064,
            nombre: 'Villanueva',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 1065,
            nombre: 'Villanueva',
            departamento_id: 44,
            estado: 1
        },
        {
            id: 1066,
            nombre: 'Villanueva',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 1067,
            nombre: 'Villanueva',
            departamento_id: 85,
            estado: 1
        },
        {
            id: 1068,
            nombre: 'Villapinzón',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 1069,
            nombre: 'Villarrica',
            departamento_id: 73,
            estado: 1
        },
        {
            id: 1070,
            nombre: 'Villavicencio',
            departamento_id: 50,
            estado: 1
        },
        {
            id: 1071,
            nombre: 'Villavieja',
            departamento_id: 41,
            estado: 1
        },
        {
            id: 1072,
            nombre: 'Villeta',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 1073,
            nombre: 'Viotá',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 1074,
            nombre: 'Viracachá',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 1075,
            nombre: 'Vista Hermosa',
            departamento_id: 50,
            estado: 1
        },
        {
            id: 1076,
            nombre: 'Viterbo',
            departamento_id: 17,
            estado: 1
        },
        {
            id: 1077,
            nombre: 'Vélez',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 1078,
            nombre: 'Yacopí',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 1079,
            nombre: 'Yacuanquer',
            departamento_id: 52,
            estado: 1
        },
        {
            id: 1080,
            nombre: 'Yaguará',
            departamento_id: 41,
            estado: 1
        },
        {
            id: 1081,
            nombre: 'Yalí',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 1082,
            nombre: 'Yarumal',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 1083,
            nombre: 'Yolombó',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 1084,
            nombre: 'Yondó (Casabe)',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 1085,
            nombre: 'Yopal',
            departamento_id: 85,
            estado: 1
        },
        {
            id: 1086,
            nombre: 'Yotoco',
            departamento_id: 76,
            estado: 1
        },
        {
            id: 1087,
            nombre: 'Yumbo',
            departamento_id: 76,
            estado: 1
        },
        {
            id: 1088,
            nombre: 'Zambrano',
            departamento_id: 13,
            estado: 1
        },
        {
            id: 1089,
            nombre: 'Zapatoca',
            departamento_id: 68,
            estado: 1
        },
        {
            id: 1090,
            nombre: 'Zapayán (PUNTA DE PIEDRAS)',
            departamento_id: 47,
            estado: 1
        },
        {
            id: 1091,
            nombre: 'Zaragoza',
            departamento_id: 5,
            estado: 1
        },
        {
            id: 1092,
            nombre: 'Zarzal',
            departamento_id: 76,
            estado: 1
        },
        {
            id: 1093,
            nombre: 'Zetaquirá',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 1094,
            nombre: 'Zipacón',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 1095,
            nombre: 'Zipaquirá',
            departamento_id: 25,
            estado: 1
        },
        {
            id: 1096,
            nombre: 'Zona Bananera (PRADO - SEVILLA',
            departamento_id: 47,
            estado: 1
        },
        {
            id: 1097,
            nombre: 'Ábrego',
            departamento_id: 54,
            estado: 1
        },
        {
            id: 1098,
            nombre: 'Íquira',
            departamento_id: 41,
            estado: 1
        },
        {
            id: 1099,
            nombre: 'Úmbita',
            departamento_id: 15,
            estado: 1
        },
        {
            id: 1100,
            nombre: 'Útica',
            departamento_id: 25,
            estado: 1
        }
    ];

    await prisma.municipios.createMany({
        data: municipios,
        skipDuplicates: true
    });

    console.log('✅ Municipios creados');
}

// 10. Roles
async function seedRoles() {
    console.log('👥 Seeding roles...');

    await prisma.roles.upsert({
        where: { nombre: 'Admin' },
        update: {},
        create: {
            nombre: 'Admin'
        }
    });

    await prisma.roles.upsert({
        where: { nombre: 'Estandar' },
        update: {},
        create: {
            nombre: 'Estandar'
        }
    });
    console.log('✅ Roles creados');
}

// 11. Tipo Publicación
async function seedTipoPublicacion() {
    console.log('Creando tipo_publicacion...');

    await prisma.tipo_publicacion.upsert({
        where: { nombre: 'Crítico' },
        update: {},
        create: {
            nombre: 'Crítico',
            descripcion: 'Vencimiento en menos de 3 meses'
        }
    });

    await prisma.tipo_publicacion.upsert({
        where: { nombre: 'Normal' },
        update: {},
        create: {
            nombre: 'Normal',
            descripcion: 'Vencimiento entre 3 a 12 meses'
        }
    });

    await prisma.tipo_publicacion.upsert({
        where: { nombre: 'Óptimo' },
        update: {},
        create: {
            nombre: 'Óptimo',
            descripcion: 'Vencimiento mayor a 12 meses'
        }
    });


    console.log('✅ Tipos de publicación creados');
}

// 12. Transporte
async function seedTransporte() {
    console.log('Creando transporte...');

    await prisma.transporte.upsert({
        where: { nombre: 'Auto-estandar' },
        update: {},
        create: {
            nombre: 'Auto-estandar',
            descripcion: 'Transporte por vía terrestre'
        }
    });

    await prisma.transporte.upsert({
        where: { nombre: 'Auto-especializado' },
        update: {},
        create: {
            nombre: 'Auto-especializado',
            descripcion: 'Transporte por vía terrestre'
        }
    });

    await prisma.transporte.upsert({
        where: { nombre: 'Moto' },
        update: {},
        create: {
            nombre: 'Moto',
            descripcion: 'Transporte por vía terrestre'
        }
    });

    console.log('✅ Transportes creados');
}

// 13. Unidad Dispensación
async function seedUnidadDispensacion() {
    console.log('Creando unidad_dispensacion...');

    await prisma.unidad_dispensacion.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            nombre: 'Tabletas'
        }
    });

    await prisma.unidad_dispensacion.upsert({
        where: { id: 2 },
        update: {},
        create: {
            id: 2,
            nombre: 'Cápsulas'
        }
    });

    await prisma.unidad_dispensacion.upsert({
        where: { id: 3 },
        update: {},
        create: {
            id: 3,
            nombre: 'Viales'
        }
    });

    await prisma.unidad_dispensacion.upsert({
        where: { id: 4 },
        update: {},
        create: {
            id: 4,
            nombre: 'Ampollas'
        }
    });

    await prisma.unidad_dispensacion.upsert({
        where: { id: 5 },
        update: {},
        create: {
            id: 5,
            nombre: 'Frascos'
        }
    });

    await prisma.unidad_dispensacion.upsert({
        where: { id: 6 },
        update: {},
        create: {
            id: 6,
            nombre: 'Sobres'
        }
    });

    await prisma.unidad_dispensacion.upsert({
        where: { id: 7 },
        update: {},
        create: {
            id: 7,
            nombre: 'Jarabes'
        }
    });

    await prisma.unidad_dispensacion.upsert({
        where: { id: 8 },
        update: {},
        create: {
            id: 8,
            nombre: 'Unidades'
        }
    });

    console.log('✅ Unidades de dispensación creadas');
}

// 14. Usuario Admin 
async function seedUsuarios() {
    console.log('Creando usuario master...');

    const hashedPassword = await hashPassword('Admin-25**');

    await prisma.usuarios.upsert({
        where: { correo_corporativo: 'admin@hospital.com' },
        update: {},
        create: {
            nombres: 'Administrador',
            apellidos: 'Sistema',
            sexo: 'Masculino',
            cedula: '1000000000',
            correo_corporativo: 'admin@hospital.com',
            celular: '3001234567',
            numero_tarjeta_profesional: 'TP-00001',
            rol_id: 1,
            hospital_id: 1,
            estado_base_id: 1,
            contrasena: hashedPassword,
            fecha_nacimiento: new Date('1990-01-01'),
            ultimo_ingreso: new Date()
        }
    });

    console.log('✅ Usuario master creado');
}

// 15. Hospital
async function seedHospital() {
    console.log('Creando hospital...');
    await prisma.hospitales.upsert({
        where: { rut: '0001' },
        update: {},
        create: {
            rut: '0001',
            nombre: 'Sistema Hospitalario',
            direccion: 'Av 123 # 45 - 67',
            telefono: '6012345678',
            celular: '3001234567',
            correo: 'admin@sistema.com',
            departamento_id: 11,
            municipio_id: 107,
            director: 'Administrador',
            estado_id: 1
        }
    });
    console.log('✅ Hospital creado');
}

// Función principal
async function main() {
    console.log('🌱 Iniciando seed de base de datos...\n');

    try {
        // Orden de ejecución 

        await seedEstadoBase();
        await seedEstadoEnvio();
        await seedEstadoPublicacion();
        await seedTipoSolicitud();
        await seedEstadoSolicitud();
        await seedTipoEnvio();
        await seedMediosPago();
        await seedRoles();
        await seedTipoPublicacion();
        await seedTransporte();
        await seedUnidadDispensacion();
        await seedDepartamentos();
        await seedMunicipios();
        await seedHospital();
        await seedUsuarios();

        console.log('\n✅ Seed completado exitosamente!');
        console.log('📝 NOTA: Los medicamentos de la API de datos.gov.co');
    } catch (error) {
        console.error('Error durante el seed:', error);
        throw error;
    }
}

// Ejecutar seed
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
