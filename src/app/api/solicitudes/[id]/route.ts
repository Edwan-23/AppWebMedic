import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificarClientes } from "../../notificaciones/stream/route";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { estado_solicitud, tipo_envio } = body;

    // Si se está actualizando el tipo de envío
    if (tipo_envio) {
      const nombreTipoEnvio = tipo_envio === "estandar" ? "Estándar" : "Prioritario";
      console.log("[PATCH Solicitud] Buscando tipo_envio:", nombreTipoEnvio);
      
      const tipoEnvioData = await prisma.tipo_envio.findFirst({
        where: { nombre: nombreTipoEnvio }
      });

      console.log("[PATCH Solicitud] Tipo envío encontrado:", tipoEnvioData);

      if (!tipoEnvioData) {
        // Verificar qué tipos existen
        const tiposDisponibles = await prisma.tipo_envio.findMany();
        console.log("[PATCH Solicitud] Tipos disponibles:", tiposDisponibles);
        
        return NextResponse.json(
          { error: `Tipo de envío '${nombreTipoEnvio}' no encontrado en la base de datos. Tipos disponibles: ${tiposDisponibles.map(t => t.nombre).join(', ') || 'ninguno'}` },
          { status: 400 }
        );
      }

      const solicitudActualizada = await prisma.solicitudes.update({
        where: { id: BigInt(id) },
        data: { tipo_envio_id: tipoEnvioData.id },
        include: {
          tipo_envio: true,
          hospital_origen: {
            select: {
              id: true,
              nombre: true
            }
          },
          publicaciones: {
            select: {
              id: true,
              hospital_id: true,
              principioactivo: true,
              descripcion: true
            }
          }
        }
      });

      // Crear notificación para el hospital que publicó
      if (solicitudActualizada.publicaciones?.hospital_id) {
        const hospitalSolicitante = solicitudActualizada.hospital_origen?.nombre || "Un hospital";
        const medicamento = solicitudActualizada.publicaciones.principioactivo || 
                           solicitudActualizada.publicaciones.descripcion || 
                           "medicamento";
        
        const tipoEnvioTexto = nombreTipoEnvio === "Estándar" ? "envío estándar" : "envío prioritario";
        const mensaje = `${hospitalSolicitante} ha seleccionado ${tipoEnvioTexto} para ${medicamento}`;

        const nuevaNotificacion = await prisma.notificaciones.create({
          data: {
            titulo: `Tipo de envío seleccionado: ${nombreTipoEnvio}`,
            mensaje,
            tipo: "envio",
            hospital_id: solicitudActualizada.publicaciones.hospital_id,
            referencia_id: solicitudActualizada.id,
            referencia_tipo: "solicitud"
          }
        });

        await notificarClientes(solicitudActualizada.publicaciones.hospital_id, {
          id: Number(nuevaNotificacion.id),
          titulo: nuevaNotificacion.titulo,
          mensaje: nuevaNotificacion.mensaje,
          tipo: nuevaNotificacion.tipo,
          hospital_id: Number(solicitudActualizada.publicaciones.hospital_id),
          leida: false,
          referencia_id: Number(solicitudActualizada.id),
          referencia_tipo: "solicitud",
          created_at: nuevaNotificacion.created_at
        });
      }

      return NextResponse.json({
        success: true,
        solicitud: {
          id: Number(solicitudActualizada.id),
          tipo_envio_id: solicitudActualizada.tipo_envio_id ? Number(solicitudActualizada.tipo_envio_id) : null,
          tipo_envio: solicitudActualizada.tipo_envio?.nombre || null
        }
      });
    }

    // Validar estado
    if (!estado_solicitud || !["Aceptada", "Rechazada"].includes(estado_solicitud)) {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
      );
    }

    // Buscar el ID del estado
    const estadoSol = await prisma.estado_solicitud.findFirst({
      where: { nombre: estado_solicitud }
    });

    if (!estadoSol) {
      return NextResponse.json(
        { error: "Estado de solicitud no encontrado" },
        { status: 400 }
      );
    }

    // Actualizar estado de la solicitud
    const solicitudActualizada = await prisma.solicitudes.update({
      where: { id: BigInt(id) },
      data: { 
        estado_solicitud: {
          connect: { id: estadoSol.id }
        }
      },
      include: {
        tipo_solicitud: {
          select: {
            id: true,
            nombre: true
          }
        },
        estado_solicitud: {
          select: {
            id: true,
            nombre: true
          }
        },
        hospitales: { select: { nombre: true } },
        hospital_origen: { select: { id: true, nombre: true } },
        publicaciones: {
          select: {
            id: true,
            principioactivo: true,
            descripcion: true
          }
        }
      }
    });

    // Si se acepta la solicitud, cambiar el estado de la publicación a "Concretada"
    if (solicitudActualizada.estado_solicitud?.nombre === "Aceptada" && solicitudActualizada.publicacion_id) {
      const estadoConcretada = await prisma.estado_publicacion.findFirst({
        where: { nombre: "Concretada" }
      });

      if (estadoConcretada) {
        await prisma.publicaciones.update({
          where: { id: solicitudActualizada.publicacion_id },
          data: { estado_publicacion_id: estadoConcretada.id }
        });
      }
    }

    // Crear notificación para el hospital que hizo la solicitud
    if (solicitudActualizada.hospital_origen?.id) {
      const medicamento = solicitudActualizada.publicaciones?.principioactivo || 
                         solicitudActualizada.publicaciones?.descripcion || 
                         "medicamento";
      
      const hospitalReceptor = solicitudActualizada.hospitales?.nombre || "Hospital";
      const mensaje = estado_solicitud === "Aceptada"
        ? `${hospitalReceptor} ha aceptado tu solicitud de ${medicamento}`
        : `${hospitalReceptor} ha rechazado tu solicitud de ${medicamento}`;

      const nuevaNotificacion = await prisma.notificaciones.create({
        data: {
          titulo: estado_solicitud === "Aceptada" ? "Solicitud aceptada" : "Solicitud rechazada",
          mensaje,
          tipo: "solicitud",
          hospital_id: solicitudActualizada.hospital_origen.id,
          referencia_id: solicitudActualizada.id,
          referencia_tipo: "solicitud"
        }
      });

      await notificarClientes(solicitudActualizada.hospital_origen.id, {
        id: Number(nuevaNotificacion.id),
        titulo: nuevaNotificacion.titulo,
        mensaje: nuevaNotificacion.mensaje,
        tipo: nuevaNotificacion.tipo,
        hospital_id: Number(solicitudActualizada.hospital_origen.id),
        leida: false,
        referencia_id: Number(solicitudActualizada.id),
        referencia_tipo: "solicitud",
        created_at: nuevaNotificacion.created_at
      });
    }

    return NextResponse.json({
      success: true,
      solicitud: {
        id: Number(solicitudActualizada.id),
        publicacion_id: solicitudActualizada.publicacion_id ? Number(solicitudActualizada.publicacion_id) : null,
        hospital_id: solicitudActualizada.hospital_id ? Number(solicitudActualizada.hospital_id) : null,
        hospital_origen_id: solicitudActualizada.hospital_origen_id ? Number(solicitudActualizada.hospital_origen_id) : null,
        tipo_solicitud: solicitudActualizada.tipo_solicitud?.nombre || null,
        tipo_solicitud_id: solicitudActualizada.tipo_solicitud_id ? Number(solicitudActualizada.tipo_solicitud_id) : null,
        valor_propuesto: solicitudActualizada.valor_propuesto ? Number(solicitudActualizada.valor_propuesto) : null,
        medicamento_intercambio: solicitudActualizada.medicamento_intercambio,
        cantidad_intercambio: solicitudActualizada.cantidad_intercambio,
        fecha_devolucion_estimada: solicitudActualizada.fecha_devolucion_estimada?.toISOString() || null,
        propuesta_descripcion: solicitudActualizada.propuesta_descripcion,
        estado_solicitud: solicitudActualizada.estado_solicitud?.nombre || null,
        estado_solicitud_id: solicitudActualizada.estado_solicitud_id ? Number(solicitudActualizada.estado_solicitud_id) : null,
        created_at: solicitudActualizada.created_at?.toISOString() || null,
        updated_at: solicitudActualizada.updated_at?.toISOString() || null,
        hospitales: solicitudActualizada.hospitales,
        hospital_origen: solicitudActualizada.hospital_origen ? {
          id: Number(solicitudActualizada.hospital_origen.id),
          nombre: solicitudActualizada.hospital_origen.nombre
        } : null,
        publicaciones: solicitudActualizada.publicaciones ? {
          id: Number(solicitudActualizada.publicaciones.id),
          principioactivo: solicitudActualizada.publicaciones.principioactivo,
          descripcion: solicitudActualizada.publicaciones.descripcion
        } : null
      }
    });

  } catch (error) {
    console.error("Error al actualizar solicitud:", error);
    return NextResponse.json(
      { error: "Error al actualizar solicitud" },
      { status: 500 }
    );
  }
}
