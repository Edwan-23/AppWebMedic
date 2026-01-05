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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    const validacion = encargadoSchema.safeParse(body);
    if (!validacion.success) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: validacion.error.issues },
        { status: 400 }
      );
    }

    const { nombre, apellido, cedula, correo, celular, hospital_id } = validacion.data;

    const encargadoActualizado = await prisma.encargado_logistica.update({
      where: { id: BigInt(id) },
      data: {
        nombre,
        apellido,
        cedula,
        correo: correo || null,
        celular,
        hospital_id: BigInt(hospital_id),
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      encargado: {
        id: Number(encargadoActualizado.id),
        nombre: encargadoActualizado.nombre,
        apellido: encargadoActualizado.apellido,
        cedula: encargadoActualizado.cedula,
        correo: encargadoActualizado.correo,
        celular: encargadoActualizado.celular,
        hospital_id: Number(encargadoActualizado.hospital_id)
      }
    });

  } catch (error) {
    console.error("Error al actualizar encargado:", error);
    return NextResponse.json(
      { error: "Error al actualizar encargado" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar si hay envíos asociados a este encargado
    const enviosAsociados = await prisma.envio.count({
      where: { encargado_logistica_id: BigInt(id) }
    });

    if (enviosAsociados > 0) {
      return NextResponse.json(
        { 
          error: "No se puede eliminar el encargado porque tiene envíos asociados",
          detalles: `Hay ${enviosAsociados} envío(s) asignado(s) a este encargado`
        },
        { status: 400 }
      );
    }

    await prisma.encargado_logistica.delete({
      where: { id: BigInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: "Encargado eliminado correctamente"
    });

  } catch (error: any) {
    console.error("Error al eliminar encargado:", error);
    
    // Manejar error de constraint de FK
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "No se puede eliminar el encargado porque tiene envíos asociados" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al eliminar encargado" },
      { status: 500 }
    );
  }
}
