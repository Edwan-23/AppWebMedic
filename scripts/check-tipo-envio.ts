import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    console.log('Verificando tipos de envío...');
    const tiposEnvio = await prisma.tipo_envio.findMany();
    
    console.log(`\nTotal de registros: ${tiposEnvio.length}`);
    
    tiposEnvio.forEach(tipo => {
      console.log(`\nID: ${tipo.id}`);
      console.log(`Nombre: ${tipo.nombre}`);
      console.log(`Descripción: ${tipo.descripcion}`);
    });

    // Si no hay registros, insertarlos
    if (tiposEnvio.length === 0) {
      console.log('\n⚠️  No hay tipos de envío. Insertando...');
      
      await prisma.tipo_envio.createMany({
        data: [
          {
            nombre: 'Estándar',
            descripcion: 'Envío estándar sin costo, coordinación directa entre hospitales'
          },
          {
            nombre: 'Prioritario',
            descripcion: 'Envío prioritario con seguimiento en tiempo real y transporte especializado'
          }
        ]
      });
      
      console.log('✅ Tipos de envío insertados correctamente');
      
      const nuevos = await prisma.tipo_envio.findMany();
      nuevos.forEach(tipo => {
        console.log(`\nID: ${tipo.id}`);
        console.log(`Nombre: ${tipo.nombre}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
