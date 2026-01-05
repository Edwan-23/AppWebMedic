import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    // Desactivar avisos cuya fecha de finalización ya pasó
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

    // Obtener solo avisos publicados y vigentes
    const avisos = await prisma.avisos.findMany({
      where: {
        publicado: true,
        fecha: {
          gte: fechaActual,
        },
      },
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        fecha: true,
        created_at: true,
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    const avisosFormateados = avisos.map((aviso) => ({
      id: aviso.id.toString(),
      titulo: aviso.titulo,
      descripcion: aviso.descripcion,
      fecha: aviso.fecha.toISOString(),
      created_at: aviso.created_at?.toISOString(),
    }));

    return NextResponse.json(avisosFormateados);
  } catch (error) {
    console.error("Error al obtener avisos publicados:", error);
    return NextResponse.json(
      { error: "Error al obtener avisos publicados" },
      { status: 500 }
    );
  }
}
