import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Obtener todos los hospitales
    const todosLosHospitales = await prisma.hospitales.findMany({
      select: {
        id: true,
        nombre: true,
        rut: true,
        municipios: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        nombre: "asc",
      },
    });

    // Obtener hospitales que ya tienen usuarios asignados
    const hospitalesConUsuarios = await prisma.usuarios.findMany({
      where: {
        hospital_id: {
          not: null,
        },
      },
      select: {
        hospital_id: true,
      },
      distinct: ["hospital_id"],
    });

    // Crear un Set con los IDs de hospitales que ya tienen usuarios
    const hospitalesOcupados = new Set(
      hospitalesConUsuarios.map((u: any) => u.hospital_id?.toString())
    );

    // Filtrar hospitales disponibles (sin usuarios asignados)
    const hospitalesDisponibles = todosLosHospitales.filter(
      (hospital: any) => !hospitalesOcupados.has(hospital.id.toString())
    );

    // Formatear respuesta
    const hospitalesFormateados = hospitalesDisponibles.map((hospital: any) => ({
      id: hospital.id.toString(),
      nombre: hospital.nombre,
      rut: hospital.rut,
      municipio: hospital.municipios?.nombre || null,
    }));

    return NextResponse.json(hospitalesFormateados);
  } catch (error) {
    console.error("Error al obtener hospitales disponibles:", error);
    return NextResponse.json(
      { error: "Error al obtener hospitales disponibles" },
      { status: 500 }
    );
  }
}
