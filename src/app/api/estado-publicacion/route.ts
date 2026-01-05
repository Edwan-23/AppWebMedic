import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const estados = await (prisma as any).estado_publicacion.findMany({
      orderBy: { id: 'desc' }
    });

    // Convertir BigInt a Number
    const estadosData = estados.map((estado: any) => ({
      id: Number(estado.id),
      nombre: estado.nombre,
      descripcion: estado.descripcion
    }));

    return NextResponse.json(estadosData, { status: 200 });

  } catch (error) {
    console.error("Error al obtener estados:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
