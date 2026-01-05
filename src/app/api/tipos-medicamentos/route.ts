import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tipos = await prisma.tipo_medicamento.findMany({
      select: {
        id: true,
        nombre: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    const tiposFormateados = tipos.map((tipo) => ({
      id: tipo.id.toString(),
      nombre: tipo.nombre,
    }));

    return NextResponse.json(tiposFormateados);
  } catch (error) {
    console.error("Error al obtener tipos de medicamentos:", error);
    return NextResponse.json(
      { error: "Error al obtener tipos de medicamentos" },
      { status: 500 }
    );
  }
}
