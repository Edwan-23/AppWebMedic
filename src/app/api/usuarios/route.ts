import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
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

    // Contar usuarios activos (estado_base_id === 1)
    const totalActivos = usuarios.filter(
      (u: any) => u.estado_base_id === BigInt(1)
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
