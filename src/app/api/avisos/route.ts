import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    // Despublicar avisos cuya fecha de finalización ya pasó
    await prisma.avisos.updateMany({
      where: {
        publicado: true,
        fecha: {
          lt: fechaActual,
        },
      },
      data: {
        publicado: false,
      },
    });

    const avisos = await prisma.avisos.findMany({
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        fecha: true,
        publicado: true,
        created_at: true,
        updated_at: true,
        usuarios: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 3, // Máximo 3 avisos
    });

    const avisosFormateados = avisos.map((aviso: any) => ({
      id: aviso.id.toString(),
      titulo: aviso.titulo,
      descripcion: aviso.descripcion,
      fecha: aviso.fecha.toISOString(),
      publicado: aviso.publicado,
      created_at: aviso.created_at?.toISOString(),
      updated_at: aviso.updated_at?.toISOString(),
      usuario: aviso.usuarios ? {
        id: aviso.usuarios.id.toString(),
        nombre_completo: `${aviso.usuarios.nombres} ${aviso.usuarios.apellidos}`,
      } : null,
    }));

    return NextResponse.json({
      avisos: avisosFormateados,
      total: avisosFormateados.length,
    });
  } catch (error) {
    console.error("Error al obtener avisos:", error);
    return NextResponse.json(
      { error: "Error al obtener avisos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titulo, descripcion, fecha, usuario_id } = body;

    if (!titulo || !descripcion || !fecha || !usuario_id) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar que no haya más de 3 avisos
    const totalAvisos = await prisma.avisos.count();
    if (totalAvisos >= 3) {
      return NextResponse.json(
        { error: "Ya existen 3 avisos. Elimina uno para crear otro." },
        { status: 400 }
      );
    }

    const nuevoAviso = await prisma.avisos.create({
      data: {
        titulo,
        descripcion,
        fecha: new Date(fecha),
        usuario_id: BigInt(usuario_id),
        publicado: false,
      },
      include: {
        usuarios: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
      },
    });

    const avisoFormateado = {
      id: nuevoAviso.id.toString(),
      titulo: nuevoAviso.titulo,
      descripcion: nuevoAviso.descripcion,
      fecha: nuevoAviso.fecha.toISOString(),
      publicado: nuevoAviso.publicado,
      created_at: nuevoAviso.created_at?.toISOString(),
      updated_at: nuevoAviso.updated_at?.toISOString(),
      usuario: nuevoAviso.usuarios ? {
        id: nuevoAviso.usuarios.id.toString(),
        nombre_completo: `${nuevoAviso.usuarios.nombres} ${nuevoAviso.usuarios.apellidos}`,
      } : null,
    };

    return NextResponse.json(avisoFormateado, { status: 201 });
  } catch (error) {
    console.error("Error al crear aviso:", error);
    return NextResponse.json(
      { error: "Error al crear aviso" },
      { status: 500 }
    );
  }
}
