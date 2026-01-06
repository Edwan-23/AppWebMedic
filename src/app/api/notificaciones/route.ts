import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const notificacionSchema = z.object({
  titulo: z.string().max(100),
  mensaje: z.string(),
  tipo: z.string().max(50),
  hospital_id: z.number(),
  referencia_id: z.number().optional(),
  referencia_tipo: z.string().max(50).optional()
});

// GET /api/notificaciones - Obtener notificaciones por hospital
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get("hospital_id");

    if (!hospitalId) {
      return NextResponse.json(
        { error: "hospital_id es requerido" },
        { status: 400 }
      );
    }

    // Limpieza automática antes de consultar
    await limpiarNotificacionesAntiguas(BigInt(hospitalId));

    const where: any = {
      hospital_id: BigInt(hospitalId)
    };

    // Obtener solo las últimas 7 notificaciones
    const notificaciones = await prisma.notificaciones.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 7
    });

    return NextResponse.json({
      success: true,
      notificaciones: notificaciones.map((n: any) => ({
        id: Number(n.id),
        titulo: n.titulo,
        mensaje: n.mensaje,
        tipo: n.tipo,
        hospital_id: Number(n.hospital_id),
        leida: n.leida,
        referencia_id: n.referencia_id ? Number(n.referencia_id) : null,
        referencia_tipo: n.referencia_tipo,
        created_at: n.created_at
      }))
    });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener notificaciones" },
      { status: 500 }
    );
  }
}

// Función de limpieza automática
async function limpiarNotificacionesAntiguas(hospitalId: bigint) {
  try {
    const ahora = new Date();
    const hace5Dias = new Date(ahora.getTime() - 5 * 24 * 60 * 60 * 1000);
    const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Eliminar notificaciones leídas con más de 5 días
    await prisma.notificaciones.deleteMany({
      where: {
        hospital_id: hospitalId,
        leida: true,
        created_at: {
          lt: hace5Dias
        }
      }
    });

    // Eliminar notificaciones con más de 30 días (independiente de si están leídas)
    await prisma.notificaciones.deleteMany({
      where: {
        hospital_id: hospitalId,
        created_at: {
          lt: hace30Dias
        }
      }
    });

    // Mantener solo las últimas 20 notificaciones por usuario
    // Obtener todas las notificaciones del hospital ordenadas
    const todasNotificaciones = await prisma.notificaciones.findMany({
      where: { hospital_id: hospitalId },
      orderBy: { created_at: "desc" },
      select: { id: true }
    });

    // Si hay más de 20, eliminar las más antiguas
    if (todasNotificaciones.length > 20) {
      const idsAEliminar = todasNotificaciones
        .slice(20)
        .map((n: any) => n.id);

      await prisma.notificaciones.deleteMany({
        where: {
          id: { in: idsAEliminar }
        }
      });
    }
  } catch (error) {
    console.error("Error en limpieza de notificaciones:", error);
  }
}

// POST /api/notificaciones - Crear nueva notificación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validacion = notificacionSchema.safeParse(body);
    if (!validacion.success) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: validacion.error.issues },
        { status: 400 }
      );
    }

    const { titulo, mensaje, tipo, hospital_id, referencia_id, referencia_tipo } = validacion.data;

    const nuevaNotificacion = await prisma.notificaciones.create({
      data: {
        titulo,
        mensaje,
        tipo,
        hospital_id: BigInt(hospital_id),
        referencia_id: referencia_id ? BigInt(referencia_id) : null,
        referencia_tipo: referencia_tipo || null
      }
    });

    return NextResponse.json({
      success: true,
      notificacion: {
        id: Number(nuevaNotificacion.id),
        titulo: nuevaNotificacion.titulo,
        mensaje: nuevaNotificacion.mensaje,
        tipo: nuevaNotificacion.tipo,
        hospital_id: Number(nuevaNotificacion.hospital_id),
        leida: nuevaNotificacion.leida,
        referencia_id: nuevaNotificacion.referencia_id ? Number(nuevaNotificacion.referencia_id) : null,
        referencia_tipo: nuevaNotificacion.referencia_tipo,
        created_at: nuevaNotificacion.created_at
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error al crear notificación:", error);
    return NextResponse.json(
      { error: "Error al crear notificación" },
      { status: 500 }
    );
  }
}
