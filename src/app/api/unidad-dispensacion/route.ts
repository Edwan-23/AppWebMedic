import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const unidades = await prisma.unidad_dispensacion.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });

    // Serializar BigInt a Number
    const unidadesSerializables = unidades.map(unidad => ({
      id: Number(unidad.id),
      nombre: unidad.nombre
    }));

    return NextResponse.json(unidadesSerializables);
  } catch (error) {
    console.error("Error al obtener unidades de dispensación:", error);
    return NextResponse.json(
      { error: "Error al cargar unidades de dispensación" },
      { status: 500 }
    );
  }
}
