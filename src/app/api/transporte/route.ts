import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const transportes = await prisma.transporte.findMany({
      orderBy: { nombre: "asc" }
    });

    return NextResponse.json({
      success: true,
      transportes: transportes.map((t) => ({
        id: Number(t.id),
        nombre: t.nombre,
        descripcion: t.descripcion
      }))
    });
  } catch (error) {
    console.error("Error al obtener transportes:", error);
    return NextResponse.json(
      { error: "Error al obtener transportes" },
      { status: 500 }
    );
  }
}
