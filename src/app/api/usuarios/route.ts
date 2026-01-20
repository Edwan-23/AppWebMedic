import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Función para obtener la hora actual de Bogotá, Colombia (UTC-5)
function obtenerHoraBogota(): Date {
  const ahora = new Date();
  // Convertir a hora de Bogotá (UTC-5)
  const horaBogota = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  return horaBogota;
}

export async function GET(request: NextRequest) {
  try {
    // Obtener los IDs de los estados
    const estadoActivo = await (prisma as any).estado_base.findFirst({
      where: { nombre: "Activo" }
    });
    const estadoAusente = await (prisma as any).estado_base.findFirst({
      where: { nombre: "Ausente" }
    });

    if (!estadoActivo || !estadoAusente) {
      return NextResponse.json(
        { error: "Estados no configurados correctamente" },
        { status: 500 }
      );
    }

    // Actualizar usuarios que no han ingresado en más de 30 días
    const horaBogota = obtenerHoraBogota();
    const hace30Dias = new Date(horaBogota);
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    await (prisma as any).usuarios.updateMany({
      where: {
        ultimo_ingreso: {
          lt: hace30Dias,
          not: null
        },
        estado_base_id: estadoActivo.id,
      },
      data: {
        estado_base_id: estadoAusente.id,
        updated_at: horaBogota
      }
    });

    // Consulta optimizada con select para traer solo campos necesarios
    const usuarios = await (prisma as any).usuarios.findMany({
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        cedula: true,
        correo_corporativo: true,
        celular: true,
        rol_id: true,
        hospital_id: true,
        estado_base_id: true,
        ultimo_ingreso: true,
        created_at: true,
        roles: {
          select: {
            id: true,
            nombre: true,
          },
        },
        hospitales: {
          select: {
            id: true,
            nombre: true,
          },
        },
        estado_base: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Calcular estadísticas
    const totalActivos = usuarios.filter(
      (u: any) => u.estado_base_id === estadoActivo.id
    ).length;

    const totalAusentes = usuarios.filter(
      (u: any) => u.estado_base_id === estadoAusente.id
    ).length;

    const totalSuspendidos = usuarios.filter(
      (u: any) => u.estado_base?.nombre === "Suspendido"
    ).length;

    // Convertir BigInt a string
    const usuariosFormateados = usuarios.map((usuario: any) => ({
      id: usuario.id.toString(),
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      cedula: usuario.cedula,
      correo_corporativo: usuario.correo_corporativo,
      celular: usuario.celular,
      rol_id: usuario.rol_id?.toString(),
      hospital_id: usuario.hospital_id?.toString(),
      estado_base_id: usuario.estado_base_id?.toString(),
      ultimo_ingreso: usuario.ultimo_ingreso,
      created_at: usuario.created_at,
      rol: usuario.roles
        ? {
            id: usuario.roles.id.toString(),
            nombre: usuario.roles.nombre,
          }
        : null,
      hospital: usuario.hospitales
        ? {
            id: usuario.hospitales.id.toString(),
            nombre: usuario.hospitales.nombre,
          }
        : null,
      estado_base: usuario.estado_base
        ? {
            id: usuario.estado_base.id.toString(),
            nombre: usuario.estado_base.nombre,
          }
        : null,
    }));

    return NextResponse.json(
      {
        usuarios: usuariosFormateados,
        total: usuariosFormateados.length,
        activos: totalActivos,
        ausentes: totalAusentes,
        suspendidos: totalSuspendidos,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
