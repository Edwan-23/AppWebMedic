import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
