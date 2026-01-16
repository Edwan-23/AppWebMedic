import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const encargadoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(50),
  apellido: z.string().min(1, "El apellido es obligatorio").max(50),
  cedula: z.number().int("La cédula debe ser un número entero"),
  correo: z.string().email("Correo inválido").max(50).optional().nullable(),
  celular: z.string().min(1, "El celular es obligatorio").max(10),
  hospital_id: z.number().int()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get("hospital_id");

    if (!hospitalId || hospitalId === "null" || hospitalId === "undefined") {
      return NextResponse.json(
        { error: "hospital_id es requerido" },
        { status: 400 }
      );
    }

    const encargado = await prisma.encargado_logistica.findFirst({
      where: { hospital_id: BigInt(hospitalId) }
    });

    if (!encargado) {
      return NextResponse.json({ encargado: null });
    }

    return NextResponse.json({
      success: true,
      encargado: {
        id: Number(encargado.id),
        nombre: encargado.nombre,
        apellido: encargado.apellido,
        cedula: encargado.cedula,
        correo: encargado.correo,
        celular: encargado.celular,
        hospital_id: Number(encargado.hospital_id)
      }
    });
  } catch (error) {
    console.error("Error al obtener encargado:", error);
    return NextResponse.json(
      { error: "Error al obtener encargado" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Datos recibidos en POST:", body);

    const validacion = encargadoSchema.safeParse(body);
    if (!validacion.success) {
      console.error("Error de validación:", validacion.error.issues);
      return NextResponse.json(
        { error: "Datos inválidos", detalles: validacion.error.issues },
        { status: 400 }
      );
    }

    const { nombre, apellido, cedula, correo, celular, hospital_id } = validacion.data;

    // Verificar si ya existe un encargado para este hospital
    const existente = await prisma.encargado_logistica.findFirst({
      where: { hospital_id: BigInt(hospital_id) }
    });

    if (existente) {
      console.log("Ya existe un encargado para el hospital:", hospital_id);
      return NextResponse.json(
        { error: "Ya existe un encargado registrado para este hospital" },
        { status: 400 }
      );
    }

    const nuevoEncargado = await prisma.encargado_logistica.create({
      data: {
        nombre,
        apellido,
        cedula,
        correo: correo || null,
        celular,
        hospital_id: BigInt(hospital_id),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log("Encargado creado exitosamente:", nuevoEncargado.id);

    return NextResponse.json({
      success: true,
      encargado: {
        id: Number(nuevoEncargado.id),
        nombre: nuevoEncargado.nombre,
        apellido: nuevoEncargado.apellido,
        cedula: nuevoEncargado.cedula,
        correo: nuevoEncargado.correo,
        celular: nuevoEncargado.celular,
        hospital_id: Number(nuevoEncargado.hospital_id)
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error al crear encargado:", error);
    return NextResponse.json(
      { error: "Error al crear encargado", detalles: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
