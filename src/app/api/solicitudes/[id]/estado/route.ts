import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificarClientes } from "@/app/api/notificaciones/stream/route";

/**
 * @deprecated Este endpoint está obsoleto.
 * El estado ahora se maneja directamente en el envío asociado.
 * Usar /api/envios/[id]/cambiar-estado en su lugar.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const solicitudId = BigInt(id);
    const body = await request.json();
    const { nuevoEstado } = body;

    if (!nuevoEstado) {
      return NextResponse.json(
        { error: "El nuevo estado es requerido" },
        { status: 400 }
      );
    }

    // Buscar el estado por nombre (permitir variaciones)
    const estado = await prisma.estado_envio.findFirst({
      where: { 
        OR: [
          { estado: nuevoEstado },
          { guia: nuevoEstado },
          { estado: { contains: nuevoEstado, mode: 'insensitive' } },
          { guia: { contains: nuevoEstado, mode: 'insensitive' } }
        ]
      }
    });

    if (!estado) {
      return NextResponse.json(
        { error: `Estado "${nuevoEstado}" no encontrado` },
        { status: 404 }
      );
    }

    // Actualizar la solicitud
    const solicitudActualizada = await prisma.solicitudes.update({
      where: { id: solicitudId },
      data: {}, // No hay campo estado_envio_id para actualizar
      include: {
        hospitales: {
          select: {
            id: true,
            nombre: true
          }
        },
        medicamentos: {
          select: {
            nombre: true
          }
        }
      }
    });

    // Si se aprobó la solicitud, actualizar estado de publicación a "Solicitado"
    if (nuevoEstado === 'Aprobada' && solicitudActualizada.publicacion_id) {
      const estadoSolicitado = await prisma.estado_publicacion.findFirst({
        where: { nombre: "Solicitado" }
      });

      if (estadoSolicitado) {
        await prisma.publicaciones.update({
          where: { id: solicitudActualizada.publicacion_id },
          data: { estado_publicacion_id: estadoSolicitado.id }
        });
      }

      // Notificar al hospital solicitante
      try {
        if (!solicitudActualizada.hospital_id) {
          console.log('⚠️ No se puede notificar: hospital_id es null');
        } else {
          const medicamento = solicitudActualizada.medicamentos?.nombre || "medicamento";
          const hospitalOrigen = solicitudActualizada.hospitales?.nombre || "Un hospital";

          const nuevaNotificacion = await prisma.notificaciones.create({
            data: {
              titulo: "Solicitud aprobada",
              mensaje: `${hospitalOrigen} ha aprobado tu solicitud de ${medicamento}`,
              tipo: "solicitud_aprobada",
              hospital_id: solicitudActualizada.hospital_id,
              referencia_id: solicitudActualizada.id,
              referencia_tipo: "solicitud"
            }
          });

          await notificarClientes(solicitudActualizada.hospital_id, {
            id: Number(nuevaNotificacion.id),
            titulo: nuevaNotificacion.titulo,
            mensaje: nuevaNotificacion.mensaje,
            tipo: nuevaNotificacion.tipo,
            hospital_id: Number(solicitudActualizada.hospital_id),
            leida: false,
            referencia_id: Number(solicitudActualizada.id),
            referencia_tipo: "solicitud",
            created_at: nuevaNotificacion.created_at
          });
        }
      } catch (notifError) {
        console.error("Error al crear notificación:", notifError);
      }
    }

    // Serializar BigInt
    const solicitudSerializable = {
      ...solicitudActualizada,
      id: Number(solicitudActualizada.id),
      publicacion_id: solicitudActualizada.publicacion_id ? Number(solicitudActualizada.publicacion_id) : null,
      hospital_id: Number(solicitudActualizada.hospital_id),
      medicamento_id: Number(solicitudActualizada.medicamento_id),
    };

    return NextResponse.json({ 
      success: true, 
      solicitud: solicitudSerializable 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error al actualizar estado de solicitud:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar estado de solicitud" },
      { status: 500 }
    );
  }
}
