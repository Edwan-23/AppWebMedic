import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/notificaciones/[id] - Marcar notificación como leída
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notificacionId = parseInt(id);

    if (isNaN(notificacionId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const notificacion = await prisma.notificaciones.update({
      where: { id: BigInt(notificacionId) },
      data: { leida: true }
    });

    return NextResponse.json({
      success: true,
      notificacion: {
        id: Number(notificacion.id),
        leida: notificacion.leida
      }
    });
  } catch (error: any) {
    console.error("Error al marcar notificación:", error);
    
    // Prisma error P2025: Record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Error al actualizar notificación" },
      { status: 500 }
    );
  }
}

// DELETE /api/notificaciones/[id] - Eliminar notificación
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notificacionId = parseInt(id);

    if (isNaN(notificacionId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    await prisma.notificaciones.delete({
      where: { id: BigInt(notificacionId) }
    });

    return NextResponse.json({
      success: true,
      message: "Notificación eliminada"
    });
  } catch (error) {
    console.error("Error al eliminar notificación:", error);
    return NextResponse.json(
      { error: "Error al eliminar notificación" },
      { status: 500 }
    );
  }
}
