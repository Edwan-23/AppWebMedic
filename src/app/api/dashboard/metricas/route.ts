import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Total de usuarios
    const totalUsuarios = await prisma.usuarios.count();

    // Total de hospitales
    const totalHospitales = await prisma.hospitales.count();

    // Total de donaciones
    const totalDonaciones = await prisma.donaciones.count();

    // Total de publicaciones
    const totalPublicaciones = await prisma.publicaciones.count();

    // Total de medicamentos
    const totalMedicamentos = await prisma.medicamentos.count();

    // Total de solicitudes
    const totalSolicitudes = await prisma.solicitudes.count();

    // Publicaciones disponibles (total publicaciones - solicitudes)
    const publicacionesDisponibles = totalPublicaciones - totalSolicitudes;

    // Total facturado (suma de todos los pagos completados)
    const facturacion = await prisma.pagos.aggregate({
      where: {
        estado: "Completado"
      },
      _sum: {
        monto: true
      }
    });

    const totalFacturado = facturacion._sum?.monto ? Number(facturacion._sum.monto) : 0;

    // Publicaciones por mes (últimos 12 meses)
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - 12);

    const publicacionesPorMes = await prisma.$queryRaw<Array<{ mes: string; total: bigint }>>`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as mes,
        COUNT(*) as total
      FROM publicaciones
      WHERE created_at >= ${fechaInicio}
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY mes ASC
    `;

    // Comparación: Envíos Entregados vs Envíos Recibidos por mes
    const enviosEntregadosPorMes = await prisma.$queryRaw<Array<{ mes: string; total: bigint }>>`
      SELECT 
        TO_CHAR(e.created_at, 'YYYY-MM') as mes,
        COUNT(*) as total
      FROM envio e
      INNER JOIN estado_envio ee ON e.estado_envio_id = ee.id
      WHERE e.created_at >= ${fechaInicio}
        AND ee.estado = 'Entregado'
      GROUP BY TO_CHAR(e.created_at, 'YYYY-MM')
      ORDER BY mes ASC
    `;

    const enviosRecibidosPorMes = await prisma.$queryRaw<Array<{ mes: string; total: bigint }>>`
      SELECT 
        TO_CHAR(e.created_at, 'YYYY-MM') as mes,
        COUNT(*) as total
      FROM envio e
      INNER JOIN estado_envio ee ON e.estado_envio_id = ee.id
      WHERE e.created_at >= ${fechaInicio}
        AND ee.estado IN ('Entregado', 'En camino', 'Empaquetando')
      GROUP BY TO_CHAR(e.created_at, 'YYYY-MM')
      ORDER BY mes ASC
    `;

    return NextResponse.json({
      metricas: {
        totalUsuarios,
        totalHospitales,
        totalDonaciones,
        totalPublicaciones,
        totalFacturado,
        totalMedicamentos,
        publicacionesDisponibles
      },
      publicacionesPorMes: publicacionesPorMes.map((item: any) => ({
        mes: item.mes,
        total: Number(item.total)
      })),
      comparacion: {
        enviosEntregados: enviosEntregadosPorMes.map((item: any) => ({
          mes: item.mes,
          total: Number(item.total)
        })),
        enviosRecibidos: enviosRecibidosPorMes.map((item: any) => ({
          mes: item.mes,
          total: Number(item.total)
        }))
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error al obtener métricas del dashboard:", error);
    return NextResponse.json(
      { error: "Error al obtener métricas" },
      { status: 500 }
    );
  }
}
