import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const estadosDonacion = await prisma.estado_donacion.findMany({
      orderBy: {
        id: "asc"
      }
    });

    return NextResponse.json(estadosDonacion);
  } catch (error) {
    console.error("Error al obtener estados de donación:", error);
    return NextResponse.json(
      { error: "Error al obtener estados de donación" },
      { status: 500 }
    );
  }
}
