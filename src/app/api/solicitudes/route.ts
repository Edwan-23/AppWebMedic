import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificarClientes } from "../notificaciones/stream/route";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const estadoFiltro = searchParams.get("estado") || "";
    const hospitalId = searchParams.get("hospital_id") || "";
    const publicacionHospitalId = searchParams.get("publicacion_hospital_id") || "";

    const skip = (page - 1) * limit;

    // Construir filtros dinámicos
    const where: any = {};

    // Filtro por hospital (mis solicitudes)
    if (hospitalId) {
      where.hospital_id = BigInt(hospitalId);
    }

    // Filtro por hospital de publicación (pedidos recibidos)
    if (publicacionHospitalId) {
      where.publicaciones = {
        hospital_id: BigInt(publicacionHospitalId)
      };
    }

    // Filtro por estado (pendientes, proceso o completadas)
    if (estadoFiltro) {
      if (estadoFiltro === "pendiente") {
        // Solicitudes sin envío o con publicación en estado Solicitado
        where.OR = [
          { envio: { none: {} } }, // Sin envío asociado
          { publicaciones: { estado_publicacion: { nombre: "Solicitado" } } }
        ];
      } else if (estadoFiltro === "proceso") {
        // Solicitudes con envío en proceso
        where.envio = {
          some: {
            estado_envio: {
              estado: {
                in: ["En preparación", "En tránsito", "Distribución"]
              }
            }
          }
        };
      } else if (estadoFiltro === "completada") {
        // Solicitudes con envío entregado
        where.envio = {
          some: {
            estado_envio: {
              estado: "Entregado"
            }
          }
        };
      }
    }

    // Búsqueda por medicamento o descripción
    if (search) {
      where.OR = [
        { descripcion: { contains: search, mode: "insensitive" } },
        { medicamentos: { nombre: { contains: search, mode: "insensitive" } } },
        { medicamentos: { referencia: { contains: search, mode: "insensitive" } } }
      ];
    }

    // Contar total de solicitudes
    const total = await prisma.solicitudes.count({ where });

    // Obtener solicitudes con relaciones
    const solicitudes = await prisma.solicitudes.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "desc" },
      include: {
        medicamentos: {
          select: {
            id: true,
            nombre: true,
            referencia: true,
            tipo_medicamento: { select: { nombre: true } },
            medida_medicamento: { select: { nombre: true } }
          }
        },
        hospitales: {
          select: {
            id: true,
            nombre: true,
            direccion: true,
            celular: true,
            telefono: true,
            municipios: { select: { nombre: true } }
          }
        },
        publicaciones: {
          select: {
            id: true,
            cantidad: true,
            reg_invima: true,
            fecha_expiracion: true,
            hospitales: {
              select: {
                id: true,
                nombre: true,
                direccion: true,
                celular: true,
                telefono: true
              }
            }
          }
        },
        envio: {
          select: {
            id: true,
            estado_envio: {
              select: {
                id: true,
                estado: true,
                guia: true
              }
            }
          }
        }
      }
    });

    // Convertir BigInt a Number
    const solicitudesSerializables = solicitudes.map((solicitud) => ({
      id: Number(solicitud.id),
      publicacion_id: solicitud.publicacion_id ? Number(solicitud.publicacion_id) : null,
      hospital_id: solicitud.hospital_id ? Number(solicitud.hospital_id) : null,
      medicamento_id: solicitud.medicamento_id ? Number(solicitud.medicamento_id) : null,
      descripcion: solicitud.descripcion,
      created_at: solicitud.created_at?.toISOString(),
      updated_at: solicitud.updated_at?.toISOString(),
      medicamentos: solicitud.medicamentos ? {
        id: Number(solicitud.medicamentos.id),
        nombre: solicitud.medicamentos.nombre,
        referencia: solicitud.medicamentos.referencia,
        tipo_medicamento: solicitud.medicamentos.tipo_medicamento,
        medida_medicamento: solicitud.medicamentos.medida_medicamento
      } : null,
      hospitales: solicitud.hospitales ? {
        id: Number(solicitud.hospitales.id),
        nombre: solicitud.hospitales.nombre,
        direccion: solicitud.hospitales.direccion,
        celular: solicitud.hospitales.celular,
        telefono: solicitud.hospitales.telefono,
        municipios: solicitud.hospitales.municipios
      } : null,
      publicaciones: solicitud.publicaciones ? {
        id: Number(solicitud.publicaciones.id),
        cantidad: solicitud.publicaciones.cantidad,
        reg_invima: solicitud.publicaciones.reg_invima,
        fecha_expiracion: solicitud.publicaciones.fecha_expiracion,
        hospitales: solicitud.publicaciones.hospitales ? {
          id: Number(solicitud.publicaciones.hospitales.id),
          nombre: solicitud.publicaciones.hospitales.nombre,
          direccion: solicitud.publicaciones.hospitales.direccion,
          celular: solicitud.publicaciones.hospitales.celular,
          telefono: solicitud.publicaciones.hospitales.telefono
        } : null
      } : null,
      envios_realizados: solicitud.envio ? solicitud.envio.map((e: any) => ({
        id: Number(e.id),
        estado_envio: e.estado_envio ? {
          id: Number(e.estado_envio.id),
          estado: e.estado_envio.estado,
          guia: e.estado_envio.guia
        } : null
      })) : []
    }));

    return NextResponse.json({
      solicitudes: solicitudesSerializables,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    return NextResponse.json(
      { error: "Error al obtener solicitudes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicacion_id, hospital_id, medicamento_id, descripcion } = body;

    // Validaciones básicas
    if (!hospital_id || !medicamento_id) {
      return NextResponse.json(
        { error: "Hospital y medicamento son requeridos" },
        { status: 400 }
      );
    }

    // Crear la solicitud con estado inicial "Pendiente"
    // Si no encuentra el estado, usar ID 1 por defecto
    const estadoPendiente = await prisma.estado_envio.findFirst({
      where: { 
        OR: [
          { estado: "Pendiente" },
          { id: BigInt(1) }
        ]
      }
    });

    const nuevaSolicitud = await prisma.solicitudes.create({
      data: {
        publicacion_id: publicacion_id ? BigInt(publicacion_id) : null,
        hospital_id: BigInt(hospital_id),
        medicamento_id: BigInt(medicamento_id),
        descripcion: descripcion || null,
      },
      include: {
        medicamentos: {
          select: {
            nombre: true,
            referencia: true
          }
        },
        hospitales: {
          select: {
            nombre: true
          }
        },
      }
    });

    // Crear notificación si la solicitud es de una publicación (hospital origen)
    try {
      if (publicacion_id) {
        const publicacion = await prisma.publicaciones.findUnique({
          where: { id: BigInt(publicacion_id) },
          include: {
            hospitales: true
          }
        });

        if (publicacion && publicacion.hospital_id) {
          const hospitalSolicitante = nuevaSolicitud.hospitales?.nombre || "Un hospital";
          const medicamento = nuevaSolicitud.medicamentos?.nombre || "medicamento";

          const nuevaNotificacion = await prisma.notificaciones.create({
            data: {
              titulo: "Nueva solicitud de medicamento",
              mensaje: `${hospitalSolicitante} ha solicitado tu publicación de ${medicamento}`,
              tipo: "solicitud",
              hospital_id: publicacion.hospital_id,
              referencia_id: nuevaSolicitud.id,
              referencia_tipo: "solicitud"
            }
          });
          
          await notificarClientes(publicacion.hospital_id, {
            id: Number(nuevaNotificacion.id),
            titulo: nuevaNotificacion.titulo,
            mensaje: nuevaNotificacion.mensaje,
            tipo: nuevaNotificacion.tipo,
            hospital_id: Number(publicacion.hospital_id),
            leida: false,
            referencia_id: Number(nuevaSolicitud.id),
            referencia_tipo: "solicitud",
            created_at: nuevaNotificacion.created_at
          });
        }
      }
    } catch (notifError) {
      console.error("Error al crear notificación:", notifError);
    }

    // Serial BigInt
    const solicitudSerializable = {
      ...nuevaSolicitud,
      id: Number(nuevaSolicitud.id),
      publicacion_id: nuevaSolicitud.publicacion_id ? Number(nuevaSolicitud.publicacion_id) : null,
      hospital_id: Number(nuevaSolicitud.hospital_id),
      medicamento_id: Number(nuevaSolicitud.medicamento_id)
    };

    return NextResponse.json({ 
      success: true, 
      solicitud: solicitudSerializable 
    }, { status: 201 });

  } catch (error) {
    console.error("Error al crear solicitud:", error);
    return NextResponse.json(
      { error: "Error al crear solicitud" },
      { status: 500 }
    );
  }
}
