import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const medidas = await prisma.medida_medicamento.findMany({
      select: {
        id: true,
        nombre: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    const medidasFormateadas = medidas.map((medida) => ({
      id: medida.id.toString(),
      nombre: medida.nombre,
    }));

    return NextResponse.json(medidasFormateadas);
  } catch (error) {
    console.error("Error al obtener medidas de medicamentos:", error);
    return NextResponse.json(
      { error: "Error al obtener medidas de medicamentos" },
      { status: 500 }
    );
  }
}
