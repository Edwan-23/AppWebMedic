import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const estados = await prisma.estado_envio.findMany({
      orderBy: { id: "asc" }
    });

    const estadosSerializables = estados.map((estado) => ({
      ...estado,
      id: Number(estado.id)
    }));

    return NextResponse.json(estadosSerializables);
  } catch (error) {
    console.error("Error al obtener estados de envío:", error);
    return NextResponse.json(
      { error: "Error al obtener estados de envío" },
      { status: 500 }
    );
  }
}
