import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validación
const envioSchema = z.object({
  donacion_id: z.number(),
  transporte_id: z.number(),
  fecha_recoleccion: z.string(),
  fecha_entrega_estimada: z.string(),
  descripcion: z.string().optional(),
  encargado_logistica_id: z.number().nullable().optional()
});

// POST - Crear envío para una donación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos
    const validatedData = envioSchema.parse(body);

    // Verificar que la donación existe
    const donacion = await prisma.donaciones.findUnique({
      where: { id: BigInt(validatedData.donacion_id) }
    });

    if (!donacion) {
      return NextResponse.json(
        { error: "Donación no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la donación no tiene envío ya asignado
    if (donacion.envio_id) {
      return NextResponse.json(
        { error: "Esta donación ya tiene un envío asignado" },
        { status: 400 }
      );
    }

    // Obtener el estado "Empaquetando" como estado inicial
    const estadoInicial = await prisma.estado_envio.findFirst({
      where: {
        estado: "Empaquetando"
      }
    });

    if (!estadoInicial) {
      return NextResponse.json(
        { error: "No se encontró el estado 'Empaquetando' en la base de datos" },
        { status: 500 }
      );
    }

    // Crear envío
    const nuevoEnvio = await prisma.envio.create({
      data: {
        solicitud_id: undefined,
        transporte_id: BigInt(validatedData.transporte_id),
        estado_envio_id: BigInt(estadoInicial.id),
        fecha_recoleccion: new Date(validatedData.fecha_recoleccion),
        fecha_entrega_estimada: new Date(validatedData.fecha_entrega_estimada),
        descripcion: validatedData.descripcion || null,
        encargado_logistica_id: validatedData.encargado_logistica_id 
          ? BigInt(validatedData.encargado_logistica_id) 
          : null
      }
    });

    // Actualizar la donación con el envío creado
    await prisma.donaciones.update({
      where: { id: BigInt(validatedData.donacion_id) },
      data: { envio_id: nuevoEnvio.id }
    });

    return NextResponse.json({
      message: "Envío creado exitosamente",
      envio: {
        id: Number(nuevoEnvio.id),
        transporte_id: Number(nuevoEnvio.transporte_id),
        estado_envio_id: Number(nuevoEnvio.estado_envio_id),
        fecha_recoleccion: nuevoEnvio.fecha_recoleccion ? nuevoEnvio.fecha_recoleccion.toISOString() : null,
        fecha_entrega_estimada: nuevoEnvio.fecha_entrega_estimada ? nuevoEnvio.fecha_entrega_estimada.toISOString() : null,
        descripcion: nuevoEnvio.descripcion,
        created_at: nuevoEnvio.created_at ? nuevoEnvio.created_at.toISOString() : new Date().toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error al crear envío:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear envío" },
      { status: 500 }
    );
  }
}
