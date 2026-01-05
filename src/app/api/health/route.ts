import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Verifica la conexión por medio de una consulta simple
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'success',
      message: 'Conexión a PostgreSQL exitosa',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Error al conectar con la base de datos',
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
