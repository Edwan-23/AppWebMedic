import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificarClientes } from "../../notificaciones/stream/route";
import { z } from "zod";

// Schema de validación
const crearConSolicitudSchema = z.object({
  solicitud: z.object({
    publicacion_id: z.number(),
    hospital_id: z.number(),
    medicamento_id: z.number(),
    descripcion: z.string()
  }),
  pago: z.object({
    monto: z.number().positive(),
    medio_pago_id: z.number(),
    nombre_completo: z.string().min(3),
    correo: z.string().email(),
    cedula: z.string().min(5),
    telefono: z.string().optional(),
    direccion: z.string().optional(),
    observaciones: z.string().optional()
  })
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos
    const validacion = crearConSolicitudSchema.safeParse(body);
    if (!validacion.success) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: validacion.error.issues },
        { status: 400 }
      );
    }

    const { solicitud: datosSolicitud, pago: datosPago } = validacion.data;

    // Obtener estado inicial para la solicitud
    const estadoPendiente = await prisma.estado_envio.findFirst({
      where: { 
        OR: [
          { estado: "Pendiente" },
          { id: BigInt(1) }
        ]
      }
    });

    // Obtener estado "Solicitado" para la publicación
    const estadoSolicitado = await prisma.estado_publicacion.findFirst({
      where: { nombre: { contains: "Solicitado", mode: "insensitive" } }
    });

    // Obtener estado "Empaquetando" para el envío
    const estadoEmpaquetando = await prisma.estado_envio.findFirst({
      where: { estado: { contains: "Empaquetando", mode: "insensitive" } }
    });

    // Obtener transporte por defecto
    const transporte = await prisma.transporte.findFirst();

    // Obtener la publicación para conocer el hospital origen (vendedor)
    const publicacion = await prisma.publicaciones.findUnique({
      where: { id: BigInt(datosSolicitud.publicacion_id) },
      select: { hospital_id: true }
    });

    if (!publicacion) {
      return NextResponse.json(
        { error: "Publicación no encontrada" },
        { status: 404 }
      );
    }

    // Crear solicitud + pago + envío + actualizar publicación en una transacción
    const resultado = await prisma.$transaction(async (tx: any) => {
      // 1. Crear la solicitud
      const nuevaSolicitud = await tx.solicitudes.create({
        data: {
          publicacion_id: BigInt(datosSolicitud.publicacion_id),
          hospital_id: BigInt(datosSolicitud.hospital_id),
          hospital_origen_id: publicacion.hospital_id ? BigInt(publicacion.hospital_id) : null, // Hospital que vende
          medicamento_id: BigInt(datosSolicitud.medicamento_id),
          descripcion: datosSolicitud.descripcion
        }
      });

      // 2. Generar ID de transacción único
      const transaccionId = `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      // 3. Crear el envío prioritario automáticamente
      const nuevoEnvio = await tx.envio.create({
        data: {
          solicitud_id: nuevaSolicitud.id,
          transporte_id: transporte ? transporte.id : BigInt(1),
          estado_envio_id: estadoEmpaquetando ? estadoEmpaquetando.id : BigInt(1),
          descripcion: `Envío prioritario - Pago ${transaccionId}`,
          fecha_recoleccion: new Date(),
          fecha_entrega_estimada: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // +2 días
        }
      });

      // 4. Crear el pago como COMPLETADO (ya pagó externamente)
      const nuevoPago = await tx.pagos.create({
        data: {
          solicitud_id: nuevaSolicitud.id,
          envio_id: nuevoEnvio.id,
          monto: datosPago.monto,
          medio_pago_id: BigInt(datosPago.medio_pago_id),
          nombre_completo: datosPago.nombre_completo,
          correo: datosPago.correo,
          cedula: datosPago.cedula,
          telefono: datosPago.telefono || null,
          observaciones: datosPago.observaciones || null,
          transaccion: transaccionId,
          estado: "Completado" // Directamente completado porque ya pagó
        },
        include: {
          medio_pago: true,
          solicitudes: {
            include: {
              medicamentos: { select: { nombre: true } },
              hospitales: { select: { nombre: true } }
            }
          }
        }
      });

      // 5. Actualizar estado de la publicación a "Solicitado"
      if (estadoSolicitado && datosSolicitud.publicacion_id) {
        await tx.publicaciones.update({
          where: { id: BigInt(datosSolicitud.publicacion_id) },
          data: { estado_publicacion_id: estadoSolicitado.id }
        });
      }

      return { solicitud: nuevaSolicitud, pago: nuevoPago, envio: nuevoEnvio };
    });

    // Crear notificación de pago completado
    try {
      const medicamento = resultado.pago.solicitudes?.medicamentos?.nombre || "medicamento";
      const hospitalSolicitante = resultado.pago.solicitudes?.hospitales?.nombre || "Un hospital";

      // Notificar al hospital origen (quien publicó) sobre el pago
      if (datosSolicitud.publicacion_id) {
        const publicacion = await prisma.publicaciones.findUnique({
          where: { id: BigInt(datosSolicitud.publicacion_id) }
        });

        if (publicacion && publicacion.hospital_id) {
          const nuevaNotificacion = await prisma.notificaciones.create({
            data: {
              titulo: "Pago recibido",
              mensaje: `${hospitalSolicitante} ha completado el pago de $${datosPago.monto.toLocaleString()} por ${medicamento}`,
              tipo: "pago",
              hospital_id: publicacion.hospital_id,
              referencia_id: resultado.pago.id,
              referencia_tipo: "pago"
            }
          });
          
          console.log('[NOTIF] Enviando notificación de pago recibido:', {
            hospital_id: publicacion.hospital_id.toString(),
            notificacion_id: nuevaNotificacion.id.toString()
          });
          
          await notificarClientes(publicacion.hospital_id, {
            id: Number(nuevaNotificacion.id),
            titulo: nuevaNotificacion.titulo,
            mensaje: nuevaNotificacion.mensaje,
            tipo: nuevaNotificacion.tipo,
            hospital_id: Number(publicacion.hospital_id),
            usuario_id: null,
            leida: false,
            referencia_id: Number(resultado.pago.id),
            referencia_tipo: "pago",
            created_at: nuevaNotificacion.created_at
          });
        }
      }

      // Notificar al hospital que realizó el pago
      if (datosSolicitud.hospital_id) {
        const notificacionPagoExitoso = await prisma.notificaciones.create({
          data: {
            titulo: "Pago Exitoso",
            mensaje: `Tu pago de $${datosPago.monto.toLocaleString()} por ${medicamento} ha sido procesado correctamente. Transacción: ${resultado.pago.transaccion}. Revisa los detalles en tu facturación.`,
            tipo: "pago_exitoso",
            hospital_id: BigInt(datosSolicitud.hospital_id),
            referencia_id: resultado.pago.id,
            referencia_tipo: "facturacion"
          }
        });

        console.log('[NOTIF] Enviando notificación de pago exitoso:', {
          hospital_id: datosSolicitud.hospital_id,
          notificacion_id: notificacionPagoExitoso.id.toString()
        });

        await notificarClientes(BigInt(datosSolicitud.hospital_id), {
          id: Number(notificacionPagoExitoso.id),
          titulo: notificacionPagoExitoso.titulo,
          mensaje: notificacionPagoExitoso.mensaje,
          tipo: notificacionPagoExitoso.tipo,
          hospital_id: Number(datosSolicitud.hospital_id),
          usuario_id: null,
          leida: false,
          referencia_id: Number(resultado.pago.id),
          referencia_tipo: "facturacion",
          created_at: notificacionPagoExitoso.created_at
        });
      }
    } catch (notifError) {
      console.error("Error al crear notificación de pago:", notifError);
    }

    // Serializar BigInt
    const pagoSerializado = {
      ...resultado.pago,
      id: Number(resultado.pago.id),
      solicitud_id: resultado.pago.solicitud_id ? Number(resultado.pago.solicitud_id) : null,
      medio_pago_id: resultado.pago.medio_pago_id ? Number(resultado.pago.medio_pago_id) : null,
      envio_id: resultado.pago.envio_id ? Number(resultado.pago.envio_id) : null,
      medio_pago: resultado.pago.medio_pago ? {
        ...resultado.pago.medio_pago,
        id: Number(resultado.pago.medio_pago.id)
      } : null,
      solicitudes: resultado.pago.solicitudes ? {
        ...resultado.pago.solicitudes,
        id: Number(resultado.pago.solicitudes.id),
        publicacion_id: resultado.pago.solicitudes.publicacion_id ? Number(resultado.pago.solicitudes.publicacion_id) : null,
        hospital_id: resultado.pago.solicitudes.hospital_id ? Number(resultado.pago.solicitudes.hospital_id) : null,
        hospital_origen_id: resultado.pago.solicitudes.hospital_origen_id ? Number(resultado.pago.solicitudes.hospital_origen_id) : null,
        medicamento_id: resultado.pago.solicitudes.medicamento_id ? Number(resultado.pago.solicitudes.medicamento_id) : null
      } : null
    };

    return NextResponse.json({
      success: true,
      pago: pagoSerializado,
      solicitud_id: Number(resultado.solicitud.id)
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error al crear solicitud con pago:", error);
    
    // Error de validación de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Ya existe un registro con estos datos" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error al procesar la solicitud y pago" },
      { status: 500 }
    );
  }
}
