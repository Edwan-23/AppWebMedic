import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const roles = await (prisma as any).roles.findMany({
      select: {
        id: true,
        nombre: true,
      },
      orderBy: {
        nombre: "asc",
      },
    });

    return NextResponse.json(
      roles.map((rol: { id: number; nombre: string }) => ({
        id: rol.id.toString(),
        nombre: rol.nombre,
      }))
    );
  } catch (error) {
    console.error("Error al obtener roles:", error);
    return NextResponse.json(
      { error: "Error al obtener roles" },
      { status: 500 }
    );
  }
}
