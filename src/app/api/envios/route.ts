import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificarClientes } from "../notificaciones/stream/route";
import { z } from "zod";

const envioSchema = z.object({
  solicitud_id: z.number(),
  hospital_origen_id: z.number().optional(),
  descripcion: z.string().optional(),
  transporte_id: z.number(),
  fecha_recoleccion: z.string(),
  fecha_entrega_estimada: z.string(),
  estado_envio_id: z.number(),
  encargado_logistica_id: z.number().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
    const validacion = envioSchema.safeParse(body);
    if (!validacion.success) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: validacion.error.issues },
        { status: 400 }
      );
    }

    const { solicitud_id, hospital_origen_id, descripcion, transporte_id, fecha_recoleccion, fecha_entrega_estimada, estado_envio_id, encargado_logistica_id } = validacion.data;

    // Verificar que la solicitud existe
    const solicitud = await prisma.solicitudes.findUnique({
      where: { id: BigInt(solicitud_id) }
    });

    if (!solicitud) {
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      );
    }

    // Crear el envío
    const nuevoEnvio = await prisma.envio.create({
      data: {
        solicitud_id: BigInt(solicitud_id),
        descripcion: descripcion || null,
        transporte_id: BigInt(transporte_id),
        fecha_recoleccion: new Date(fecha_recoleccion),
        fecha_entrega_estimada: new Date(fecha_entrega_estimada),
        encargado_logistica_id: encargado_logistica_id ? BigInt(encargado_logistica_id) : null,
        estado_envio_id: BigInt(estado_envio_id)
      },
      include: {
        transporte: true,
        estado_envio: true
      }
    });

    // Actualizar solo el hospital_origen_id de la solicitud
    await prisma.solicitudes.update({
      where: { id: BigInt(solicitud_id) },
      data: { 
        hospital_origen_id: hospital_origen_id ? BigInt(hospital_origen_id) : null
      }
    });

    // Crear notificación para el hospital solicitante sobre el seguimiento
    try {
      const solicitud = await prisma.solicitudes.findUnique({
        where: { id: BigInt(solicitud_id) },
        include: {
          medicamentos: true,
          hospitales: true
        }
      });

      if (solicitud && solicitud.hospital_id) {
        const medicamento = solicitud.medicamentos?.nombre || "medicamento";

        const nuevaNotificacion = await prisma.notificaciones.create({
          data: {
            titulo: "Pedido en seguimiento",
            mensaje: `Tu solicitud de ${medicamento} ya tiene seguimiento de envío y está siendo procesada`,
            tipo: "envio",
            hospital_id: solicitud.hospital_id,
            referencia_id: nuevoEnvio.id,
            referencia_tipo: "envio"
          }
        });
        
        await notificarClientes(solicitud.hospital_id, {
          id: Number(nuevaNotificacion.id),
          titulo: nuevaNotificacion.titulo,
          mensaje: nuevaNotificacion.mensaje,
          tipo: nuevaNotificacion.tipo,
          hospital_id: Number(solicitud.hospital_id),
          usuario_id: null,
          leida: false,
          referencia_id: Number(nuevoEnvio.id),
          referencia_tipo: "envio",
          created_at: nuevaNotificacion.created_at
        });
      }
    } catch (notifError) {
      console.error("Error al crear notificación:", notifError);
    }

    return NextResponse.json({
      success: true,
      envio: {
        id: Number(nuevoEnvio.id),
        descripcion: nuevoEnvio.descripcion,
        solicitud_id: Number(nuevoEnvio.solicitud_id),
        transporte_id: Number(nuevoEnvio.transporte_id),
        fecha_recoleccion: nuevoEnvio.fecha_recoleccion,
        fecha_entrega_estimada: nuevoEnvio.fecha_entrega_estimada,
        encargado_logistica_id: nuevoEnvio.encargado_logistica_id ? Number(nuevoEnvio.encargado_logistica_id) : null,
        estado_envio_id: Number(nuevoEnvio.estado_envio_id),
        transporte: nuevoEnvio.transporte ? {
          id: Number(nuevoEnvio.transporte.id),
          nombre: nuevoEnvio.transporte.nombre
        } : null,
        estado_envio: nuevoEnvio.estado_envio ? {
          id: Number(nuevoEnvio.estado_envio.id),
          estado: nuevoEnvio.estado_envio.estado,
          guia: nuevoEnvio.estado_envio.guia
        } : null
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error al crear envío:", error);
    return NextResponse.json(
      { error: "Error al crear el envío" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const solicitudId = searchParams.get("solicitud_id");
    const hospitalId = searchParams.get("hospital_id");
    const envioId = searchParams.get("envio_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};
    
    // Si se solicita un envío específico por ID
    if (envioId) {
      where.id = BigInt(envioId);
    }
    
    if (solicitudId) {
      where.solicitud_id = BigInt(solicitudId);
    }

    // Si se filtra por hospital, traer envíos de solicitudes O donaciones relacionadas con ese hospital
    if (hospitalId && hospitalId !== "null" && hospitalId !== "undefined") {
      where.OR = [
        {
          solicitudes: {
            OR: [
              { hospital_id: BigInt(hospitalId) }, // Hospital que solicitó (recibe)
              { hospital_origen_id: BigInt(hospitalId) } // Hospital que envía la solicitud
            ]
          }
        },
        {
          donaciones: {
            some: {
              OR: [
                { hospital_id: BigInt(hospitalId) }, // Hospital receptor de la donación
                { hospital_origen_id: BigInt(hospitalId) } // Hospital donante (origen)
              ]
            }
          }
        }
      ];
    }

    // @ts-ignore - Prisma types don't fully reflect the schema relations
    const [totalRecords, envios] = await Promise.all([
      prisma.envio.count({ where }),
      prisma.envio.findMany({
        where,
        skip,
        take: limit,
        include: {
          transporte: true,
          estado_envio: true,
          solicitudes: {
            include: {
              hospitales: true,
              hospital_origen: true,
              tipo_solicitud: true,
              estado_solicitud: true,
              tipo_envio: true,
              publicaciones: {
                include: {
                  hospitales: true,
                  unidad_dispensacion: true,
                  estado_publicacion: true,
                  tipo_publicacion: true
                }
              }
            }
          },
          donaciones: {
            include: {
              hospitales: true,
              hospital_origen: true,
              unidad_dispensacion: true
            }
          }
        },
        orderBy: { created_at: "desc" }
      })
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return NextResponse.json({
      success: true,
      envios: envios.map((e: any) => ({
        id: Number(e.id),
        descripcion: e.descripcion,
        solicitud_id: e.solicitud_id ? Number(e.solicitud_id) : null,
        transporte_id: Number(e.transporte_id),
        fecha_recoleccion: e.fecha_recoleccion,
        fecha_entrega_estimada: e.fecha_entrega_estimada,
        encargado_logistica_id: e.encargado_logistica_id ? Number(e.encargado_logistica_id) : null,
        estado_envio_id: Number(e.estado_envio_id),
        created_at: e.created_at,
        pin: e.pin || null,
        transporte: e.transporte ? {
          id: Number(e.transporte.id),
          nombre: e.transporte.nombre
        } : null,
        estado_envio: e.estado_envio ? {
          id: Number(e.estado_envio.id),
          estado: e.estado_envio.estado,
          guia: e.estado_envio.guia
        } : null,
        solicitudes: e.solicitudes ? {
          id: Number(e.solicitudes.id),
          hospital_id: Number(e.solicitudes.hospital_id),
          hospital_origen_id: e.solicitudes.hospital_origen_id ? Number(e.solicitudes.hospital_origen_id) : null,
          descripcion: e.solicitudes.descripcion,
          cantidad: e.solicitudes.publicaciones?.cantidad || null,
          unidad_dispensacion_id: e.solicitudes.publicaciones?.unidad_dispensacion_id ? Number(e.solicitudes.publicaciones.unidad_dispensacion_id) : null,
          unidad_dispensacion: e.solicitudes.publicaciones?.unidad_dispensacion ? {
            id: Number(e.solicitudes.publicaciones.unidad_dispensacion.id),
            nombre: e.solicitudes.publicaciones.unidad_dispensacion.nombre
          } : null,
          medicamento: e.solicitudes.publicaciones?.principioactivo || "Medicamento no especificado",
          hospitales: e.solicitudes.hospitales ? {
            id: Number(e.solicitudes.hospitales.id),
            nombre: e.solicitudes.hospitales.nombre,
            direccion: e.solicitudes.hospitales.direccion
          } : null,
          hospital_origen: e.solicitudes.hospital_origen ? {
            id: Number(e.solicitudes.hospital_origen.id),
            nombre: e.solicitudes.hospital_origen.nombre,
            direccion: e.solicitudes.hospital_origen.direccion
          } : null
        } : null,
        donaciones: e.donaciones && e.donaciones.length > 0 ? e.donaciones.map((donacion: any) => ({
          id: Number(donacion.id),
          descripcion: donacion.descripcion,
          cantidad: donacion.cantidad,
          hospital_origen_id: donacion.hospital_origen_id ? Number(donacion.hospital_origen_id) : null,
          unidad_dispensacion_id: donacion.unidad_dispensacion_id ? Number(donacion.unidad_dispensacion_id) : null,
          unidad_dispensacion: donacion.unidad_dispensacion ? {
            id: Number(donacion.unidad_dispensacion.id),
            nombre: donacion.unidad_dispensacion.nombre
          } : null,
          medicamentos: donacion.medicamentos ? {
            id: Number(donacion.medicamentos.id),
            nombre: donacion.medicamentos.nombre,
            referencia: donacion.medicamentos.referencia
          } : null,
          hospitales: donacion.hospitales ? {
            id: Number(donacion.hospitales.id),
            nombre: donacion.hospitales.nombre,
            direccion: donacion.hospitales.direccion
          } : null,
          hospital_origen: donacion.hospital_origen ? {
            id: Number(donacion.hospital_origen.id),
            nombre: donacion.hospital_origen.nombre,
            direccion: donacion.hospital_origen.direccion
          } : null
        })) : null
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        limit
      }
    });

  } catch (error) {
    console.error("Error al obtener envíos:", error);
    return NextResponse.json(
      { error: "Error al obtener envíos" },
      { status: 500 }
    );
  }
}
