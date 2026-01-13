import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificarClientes } from "../../notificaciones/stream/route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const aviso = await prisma.avisos.findUnique({
      where: {
        id: BigInt(id),
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

    if (!aviso) {
      return NextResponse.json(
        { error: "Aviso no encontrado" },
        { status: 404 }
      );
    }

    const avisoFormateado = {
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
    };

    return NextResponse.json(avisoFormateado);
  } catch (error) {
    console.error("Error al obtener aviso:", error);
    return NextResponse.json(
      { error: "Error al obtener aviso" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { titulo, descripcion, fecha, publicado } = body;

    // Obtener el estado actual del aviso antes de actualizar
    const avisoAnterior = await prisma.avisos.findUnique({
      where: { id: BigInt(id) },
      select: { publicado: true },
    });

    const avisoActualizado = await prisma.avisos.update({
      where: {
        id: BigInt(id),
      },
      data: {
        ...(titulo && { titulo }),
        ...(descripcion && { descripcion }),
        ...(fecha && { fecha: new Date(fecha) }),
        ...(publicado !== undefined && { publicado }),
        updated_at: new Date(),
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
      id: avisoActualizado.id.toString(),
      titulo: avisoActualizado.titulo,
      descripcion: avisoActualizado.descripcion,
      fecha: avisoActualizado.fecha.toISOString(),
      publicado: avisoActualizado.publicado,
      created_at: avisoActualizado.created_at?.toISOString(),
      updated_at: avisoActualizado.updated_at?.toISOString(),
      usuario: avisoActualizado.usuarios ? {
        id: avisoActualizado.usuarios.id.toString(),
        nombre_completo: `${avisoActualizado.usuarios.nombres} ${avisoActualizado.usuarios.apellidos}`,
      } : null,
    };

    // Si se acaba de publicar (pasó de false a true), enviar notificación SSE a todos los hospitales
    if (publicado === true && avisoAnterior && !avisoAnterior.publicado) {
      // Obtener todos los hospitales
      const hospitales = await prisma.hospitales.findMany({
        select: { id: true },
      });

      // Crear notificación y enviar SSE a cada hospital
      for (const hospital of hospitales) {
        // Guardar notificación en la base de datos
        const notificacionGuardada = await prisma.notificaciones.create({
          data: {
            titulo: `Nuevo aviso: ${avisoActualizado.titulo}`,
            mensaje: avisoActualizado.descripcion,
            tipo: "aviso",
            hospital_id: hospital.id,
            referencia_id: avisoActualizado.id,
            referencia_tipo: "aviso",
            leida: false,
          },
        });

        // Enviar notificación SSE
        await notificarClientes(hospital.id, {
          id: Number(notificacionGuardada.id),
          titulo: `Nuevo aviso: ${avisoActualizado.titulo}`,
          mensaje: avisoActualizado.descripcion,
          tipo: "aviso",
          hospital_id: Number(hospital.id),
          leida: false,
          referencia_id: Number(avisoActualizado.id),
          referencia_tipo: "aviso",
          created_at: notificacionGuardada.created_at.toISOString(),
        });
      }
    }

    return NextResponse.json(avisoFormateado);
  } catch (error) {
    console.error("Error al actualizar aviso:", error);
    return NextResponse.json(
      { error: "Error al actualizar aviso" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.avisos.delete({
      where: {
        id: BigInt(id),
      },
    });

    return NextResponse.json({ message: "Aviso eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar aviso:", error);
    return NextResponse.json(
      { error: "Error al eliminar aviso" },
      { status: 500 }
    );
  }
}
