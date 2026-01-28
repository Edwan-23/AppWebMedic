import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tiposDonacion = await prisma.tipo_donacion.findMany({
      orderBy: {
        id: "asc"
      }
    });

    return NextResponse.json(tiposDonacion);
  } catch (error) {
    console.error("Error al obtener tipos de donación:", error);
    return NextResponse.json(
      { error: "Error al obtener tipos de donación" },
      { status: 500 }
    );
  }
}
