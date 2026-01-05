import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tipos = await (prisma as any).tipo_publicacion.findMany({
      orderBy: { nombre: 'asc' }
    });

    // Convertir BigInt a Number
    const tiposData = tipos.map((tipo: any) => ({
      id: Number(tipo.id),
      nombre: tipo.nombre,
      descripcion: tipo.descripcion
    }));

    return NextResponse.json(tiposData, { status: 200 });

  } catch (error) {
    console.error("Error al obtener tipos de publicación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
