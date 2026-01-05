import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Esquema de validación con Zod
const eventoSchema = z.object({
  titulo: z.string().min(1, "El título es requerido").max(255),
  color: z.string().min(1, "El color es requerido").max(20),
  fecha_inicio: z.string().min(1, "La fecha de inicio es requerida"),
  fecha_fin: z.string().min(1, "La fecha de fin es requerida"),
  usuario_id: z.number().positive("El ID del usuario es requerido"),
});

// GET - Obtener eventos del calendario (filtrados por usuario)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get("usuario_id");

    if (!usuarioId) {
      return NextResponse.json(
        { error: "El ID del usuario es requerido" },
        { status: 400 }
      );
    }

    const eventos = await prisma.eventos_calendario.findMany({
      where: {
        usuario_id: BigInt(usuarioId),
      },
      orderBy: {
        fecha_inicio: "asc",
      },
    });

    // Serializar BigInt a Number
    const eventosSerializados = eventos.map((evento) => ({
      id: Number(evento.id),
      titulo: evento.titulo,
      color: evento.color,
      fecha_inicio: evento.fecha_inicio,
      fecha_fin: evento.fecha_fin,
      usuario_id: Number(evento.usuario_id),
      created_at: evento.created_at,
      updated_at: evento.updated_at,
    }));

    return NextResponse.json({
      success: true,
      eventos: eventosSerializados,
    });
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    return NextResponse.json(
      { error: "Error al obtener eventos del calendario" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo evento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos con Zod
    const validacion = eventoSchema.safeParse(body);

    if (!validacion.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          detalles: validacion.error.issues,
        },
        { status: 400 }
      );
    }

    const datos = validacion.data;

    // Crear el evento
    const nuevoEvento = await prisma.eventos_calendario.create({
      data: {
        titulo: datos.titulo,
        color: datos.color,
        fecha_inicio: new Date(datos.fecha_inicio),
        fecha_fin: new Date(datos.fecha_fin),
        usuario_id: BigInt(datos.usuario_id),
      },
    });

    return NextResponse.json({
      success: true,
      mensaje: "Evento creado exitosamente",
      evento: {
        id: Number(nuevoEvento.id),
        titulo: nuevoEvento.titulo,
        color: nuevoEvento.color,
        fecha_inicio: nuevoEvento.fecha_inicio,
        fecha_fin: nuevoEvento.fecha_fin,
        usuario_id: Number(nuevoEvento.usuario_id),
      },
    });
  } catch (error) {
    console.error("Error al crear evento:", error);
    return NextResponse.json(
      { error: "Error al crear evento" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar evento existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...datos } = body;

    if (!id) {
      return NextResponse.json(
        { error: "El ID del evento es requerido" },
        { status: 400 }
      );
    }

    // Validar datos
    const validacion = eventoSchema.safeParse(datos);

    if (!validacion.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          detalles: validacion.error.issues,
        },
        { status: 400 }
      );
    }

    const datosValidados = validacion.data;

    // Actualizar el evento
    const eventoActualizado = await prisma.eventos_calendario.update({
      where: {
        id: BigInt(id),
      },
      data: {
        titulo: datosValidados.titulo,
        color: datosValidados.color,
        fecha_inicio: new Date(datosValidados.fecha_inicio),
        fecha_fin: new Date(datosValidados.fecha_fin),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      mensaje: "Evento actualizado exitosamente",
      evento: {
        id: Number(eventoActualizado.id),
        titulo: eventoActualizado.titulo,
        color: eventoActualizado.color,
        fecha_inicio: eventoActualizado.fecha_inicio,
        fecha_fin: eventoActualizado.fecha_fin,
        usuario_id: Number(eventoActualizado.usuario_id),
      },
    });
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    return NextResponse.json(
      { error: "Error al actualizar evento" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar evento
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "El ID del evento es requerido" },
        { status: 400 }
      );
    }

    await prisma.eventos_calendario.delete({
      where: {
        id: BigInt(id),
      },
    });

    return NextResponse.json({
      success: true,
      mensaje: "Evento eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar evento:", error);
    return NextResponse.json(
      { error: "Error al eliminar evento" },
      { status: 500 }
    );
  }
}
