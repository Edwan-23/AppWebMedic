import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const hospitales = await (prisma as any).hospitales.findMany({
      select: {
        id: true,
        rut: true,
        nombre: true,
        direccion: true,
        telefono: true,
        celular: true,
        correo: true,
        director: true,
        estado_id: true,
        departamento_id: true,
        municipio_id: true,
        created_at: true,
        estado_base: {
          select: {
            id: true,
            nombre: true,
          },
        },
        departamentos: {
          select: {
            id: true,
            nombre: true,
          },
        },
        municipios: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const hospitalesFormateados = hospitales.map((hospital: any) => ({
      ...hospital,
      id: hospital.id.toString(),
      estado_id: hospital.estado_id?.toString() || null,
      departamento_id: hospital.departamento_id?.toString() || null,
      municipio_id: hospital.municipio_id?.toString() || null,
      estado_base: hospital.estado_base ? {
        id: hospital.estado_base.id.toString(),
        nombre: hospital.estado_base.nombre,
      } : null,
      departamentos: hospital.departamentos ? {
        id: hospital.departamentos.id.toString(),
        nombre: hospital.departamentos.nombre,
      } : null,
      municipios: hospital.municipios ? {
        id: hospital.municipios.id.toString(),
        nombre: hospital.municipios.nombre,
      } : null,
    }));

    const total = hospitalesFormateados.length;
    const activos = hospitalesFormateados.filter(
      (h: any) => h.estado_base?.nombre === "Activo"
    ).length;

    return NextResponse.json({
      hospitales: hospitalesFormateados,
      total,
      activos,
    });
  } catch (error) {
    console.error("Error al obtener hospitales:", error);
    return NextResponse.json(
      { error: "Error al obtener hospitales" },
      { status: 500 }
    );
  }
}
