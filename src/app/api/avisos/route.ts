import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificarClientes } from "../notificaciones/stream/route";

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
    const { titulo, descripcion, fecha, usuario_id, publicado = false } = body;

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
        publicado,
      },
      include: {
        usuarios: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            hospital_id: true,
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

    // Si se publica, enviar notificación SSE a todos los hospitales
    if (publicado) {
      // Obtener todos los hospitales
      const hospitales = await prisma.hospitales.findMany({
        select: { id: true },
      });

      // Crear notificación y enviar SSE a cada hospital
      for (const hospital of hospitales) {
        // Guardar notificación en la base de datos
        const notificacionGuardada = await prisma.notificaciones.create({
          data: {
            titulo: `Nuevo aviso: ${titulo}`,
            mensaje: descripcion,
            tipo: "aviso",
            hospital_id: hospital.id,
            referencia_id: nuevoAviso.id,
            referencia_tipo: "aviso",
            leida: false,
          },
        });

        // Enviar notificación SSE
        await notificarClientes(hospital.id, {
          id: Number(notificacionGuardada.id),
          titulo: `Nuevo aviso: ${titulo}`,
          mensaje: descripcion,
          tipo: "aviso",
          hospital_id: Number(hospital.id),
          leida: false,
          referencia_id: Number(nuevoAviso.id),
          referencia_tipo: "aviso",
          created_at: notificacionGuardada.created_at.toISOString(),
        });
      }
    }

    return NextResponse.json(avisoFormateado, { status: 201 });
  } catch (error) {
    console.error("Error al crear aviso:", error);
    return NextResponse.json(
      { error: "Error al crear aviso" },
      { status: 500 }
    );
  }
}
