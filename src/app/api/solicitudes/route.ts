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
    const publicacionId = searchParams.get("publicacion_id") || "";
    const countOnly = searchParams.get("count_only") === "true";

    // Si solo se solicita el conteo de solicitudes para una publicación específica
    if (countOnly && publicacionId && hospitalId) {
      const count = await prisma.solicitudes.count({
        where: {
          publicacion_id: BigInt(publicacionId),
          hospital_origen_id: BigInt(hospitalId)
        }
      });
      
      return NextResponse.json({ count });
    }

    const skip = (page - 1) * limit;

    // Construir filtros dinámicos
    const where: any = {};

    // Filtro por hospital origen (mis solicitudes - quien solicita)
    if (hospitalId && hospitalId !== "null" && hospitalId !== "undefined") {
      where.hospital_origen_id = BigInt(hospitalId);
    }

    // Filtro por hospital destino de publicación (solicitudes entrantes - quien recibe)
    if (publicacionHospitalId && publicacionHospitalId !== "null" && publicacionHospitalId !== "undefined") {
      where.publicaciones = {
        hospital_id: BigInt(publicacionHospitalId)
      };
    }

    // Filtro por estado (pendientes, proceso, completadas o historial)
    if (estadoFiltro) {
      if (estadoFiltro === "Pendiente") {
        // Solo solicitudes pendientes (sin aceptar)
        where.estado_solicitud = {
          nombre: "Pendiente"
        };
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
      } else if (estadoFiltro === "Completada") {
        // Solicitudes aceptadas (contrato realizado) o con envío entregado
        where.OR = [
          { estado_solicitud: { nombre: "Aceptada" } },
          {
            envio: {
              some: {
                estado_envio: {
                  estado: "Entregado"
                }
              }
            }
          }
        ];
      } else if (estadoFiltro === "Historial") {
        // Solicitudes rechazadas
        where.estado_solicitud = {
          nombre: "Rechazada"
        };
      }
    }

    // Búsqueda por descripción o propuesta
    if (search) {
      where.OR = [
        { propuesta_descripcion: { contains: search, mode: "insensitive" } },
        { medicamento_intercambio: { contains: search, mode: "insensitive" } }
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
            descripcion: true,
            principioactivo: true,
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
            updated_at: true,
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
    const solicitudesSerializables = solicitudes.map((solicitud: any) => ({
      id: Number(solicitud.id),
      publicacion_id: solicitud.publicacion_id ? Number(solicitud.publicacion_id) : null,
      hospital_id: solicitud.hospital_id ? Number(solicitud.hospital_id) : null,
      hospital_origen_id: solicitud.hospital_origen_id ? Number(solicitud.hospital_origen_id) : null,
      tipo_solicitud: solicitud.tipo_solicitud?.nombre || null,
      tipo_solicitud_id: solicitud.tipo_solicitud_id ? Number(solicitud.tipo_solicitud_id) : null,
      valor_propuesto: solicitud.valor_propuesto ? Number(solicitud.valor_propuesto) : null,
      medicamento_intercambio: solicitud.medicamento_intercambio,
      cantidad_intercambio: solicitud.cantidad_intercambio,
      fecha_devolucion_estimada: solicitud.fecha_devolucion_estimada ? solicitud.fecha_devolucion_estimada.toISOString() : null,
      propuesta_descripcion: solicitud.propuesta_descripcion,
      estado_solicitud: solicitud.estado_solicitud?.nombre || null,
      estado_solicitud_id: solicitud.estado_solicitud_id ? Number(solicitud.estado_solicitud_id) : null,
      created_at: solicitud.created_at?.toISOString(),
      updated_at: solicitud.updated_at?.toISOString(),
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
        descripcion: solicitud.publicaciones.descripcion,
        principioactivo: solicitud.publicaciones.principioactivo,
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
        updated_at: e.updated_at ? new Date(e.updated_at).toISOString() : null,
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
    const { 
      publicacion_id, 
      hospital_id, 
      tipo_solicitud,
      valor_propuesto,
      medicamento_intercambio,
      cantidad_intercambio,
      fecha_devolucion_estimada,
      propuesta_descripcion
    } = body;

    console.log("[API Solicitudes POST] Body recibido:", body);
    console.log("[API Solicitudes POST] Cantidad intercambio:", cantidad_intercambio, typeof cantidad_intercambio);

    // Validaciones básicas
    if (!hospital_id) {
      return NextResponse.json(
        { error: "Hospital es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el hospital existe
    const hospitalExiste = await prisma.hospitales.findUnique({
      where: { id: BigInt(hospital_id) }
    });

    if (!hospitalExiste) {
      return NextResponse.json(
        { error: "Hospital no encontrado" },
        { status: 404 }
      );
    }

    // Validar tipo_solicitud si se proporciona
    if (tipo_solicitud && !["compra", "intercambio", "prestamo"].includes(tipo_solicitud)) {
      return NextResponse.json(
        { error: "Tipo de solicitud inválido. Debe ser: compra, intercambio o prestamo" },
        { status: 400 }
      );
    }

    // Buscar el ID del tipo de solicitud
    let tipoSolicitudId = null;
    if (tipo_solicitud) {
      const tipoSol = await prisma.tipo_solicitud.findFirst({
        where: { nombre: tipo_solicitud }
      });
      
      if (!tipoSol) {
        return NextResponse.json(
          { error: "Tipo de solicitud no encontrado en el sistema" },
          { status: 400 }
        );
      }
      
      tipoSolicitudId = tipoSol.id;
    }

    // Validaciones específicas por tipo de solicitud
    if (tipo_solicitud) {
      // Propuesta descripción siempre requerida para solicitudes con tipo
      if (!propuesta_descripcion || propuesta_descripcion.trim() === "") {
        return NextResponse.json(
          { error: "La descripción de la propuesta es requerida" },
          { status: 400 }
        );
      }

      // Validaciones específicas para cada tipo
      if (tipo_solicitud === "compra") {
        if (!valor_propuesto || valor_propuesto <= 0) {
          return NextResponse.json(
            { error: "Para compras, debe especificar un valor propuesto válido" },
            { status: 400 }
          );
        }
      }

      if (tipo_solicitud === "intercambio") {
        // Validar que se proporcione medicamento y cantidad
        if (!medicamento_intercambio || medicamento_intercambio.trim() === "") {
          return NextResponse.json(
            { error: "Para intercambios, debe especificar el medicamento que ofrece" },
            { status: 400 }
          );
        }

        if (!cantidad_intercambio || cantidad_intercambio <= 0) {
          return NextResponse.json(
            { error: "Para intercambios, debe especificar una cantidad válida" },
            { status: 400 }
          );
        }
      }

      if (tipo_solicitud === "prestamo") {
        if (!fecha_devolucion_estimada) {
          return NextResponse.json(
            { error: "Para préstamos, debe especificar una fecha de devolución estimada" },
            { status: 400 }
          );
        }

        // Validar que la fecha sea futura
        const fechaDevolucion = new Date(fecha_devolucion_estimada);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaDevolucion <= hoy) {
          return NextResponse.json(
            { error: "La fecha de devolución debe ser posterior a hoy" },
            { status: 400 }
          );
        }
      }
    }

    // Crear la solicitud usando relaciones de Prisma
    const dataSolicitud: any = {
      hospital_origen: {
        connect: { id: BigInt(hospital_id) }
      }
    };

    // Conectar publicación si existe (esto establecerá hospital_id automáticamente vía relación)
    if (publicacion_id) {
      dataSolicitud.publicaciones = {
        connect: { id: BigInt(publicacion_id) }
      };
      
      // Obtener el hospital de la publicación para establecer hospital_id
      const publicacion = await prisma.publicaciones.findUnique({
        where: { id: BigInt(publicacion_id) },
        select: { hospital_id: true }
      });
      
      if (publicacion?.hospital_id) {
        dataSolicitud.hospitales = {
          connect: { id: publicacion.hospital_id }
        };
      }
    }

    // Agregar campos específicos del tipo de solicitud si existen
    if (tipo_solicitud && tipoSolicitudId) {
      // Conectar tipo de solicitud
      dataSolicitud.tipo_solicitud = {
        connect: { id: tipoSolicitudId }
      };
      
      // Conectar estado pendiente
      const estadoPendiente = await prisma.estado_solicitud.findFirst({
        where: { nombre: "Pendiente" }
      });
      
      if (estadoPendiente) {
        dataSolicitud.estado_solicitud = {
          connect: { id: estadoPendiente.id }
        };
      }
      
      dataSolicitud.propuesta_descripcion = propuesta_descripcion;

      if (tipo_solicitud === "compra" && valor_propuesto) {
        dataSolicitud.valor_propuesto = valor_propuesto;
      }

      if (tipo_solicitud === "intercambio") {
        if (medicamento_intercambio && cantidad_intercambio) {
          dataSolicitud.medicamento_intercambio = medicamento_intercambio;
          dataSolicitud.cantidad_intercambio = cantidad_intercambio;
          console.log("[API Solicitudes POST] Guardando intercambio:", {
            medicamento: medicamento_intercambio,
            cantidad: cantidad_intercambio
          });
        }
      }

      if (tipo_solicitud === "prestamo" && fecha_devolucion_estimada) {
        dataSolicitud.fecha_devolucion_estimada = new Date(fecha_devolucion_estimada);
      }
    }

    const nuevaSolicitud = await prisma.solicitudes.create({
      data: dataSolicitud,
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
        hospitales: {
          select: {
            nombre: true
          }
        },
        publicaciones: {
          select: {
            id: true,
            descripcion: true,
            principioactivo: true,
            cantidad: true
          }
        }
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
          const medicamento = publicacion.principioactivo || publicacion.descripcion || "medicamento";
          
          // Mensaje dinámico según el tipo de solicitud
          let mensaje = `${hospitalSolicitante} ha solicitado la publicación de ${medicamento}`;
          
          if (tipo_solicitud === "compra") {
            mensaje = `${hospitalSolicitante} desea comprar ${medicamento} por $${valor_propuesto}`;
          } else if (tipo_solicitud === "intercambio") {
            const medIntercambio = medicamento_intercambio || "un medicamento";
            const cantIntercambio = cantidad_intercambio || 0;
            mensaje = `${hospitalSolicitante} propone intercambiar ${medIntercambio} (${cantIntercambio} unidades) por ${medicamento}`;
          } else if (tipo_solicitud === "prestamo") {
            mensaje = `${hospitalSolicitante} solicita préstamo de ${medicamento}`;
          }

          const nuevaNotificacion = await prisma.notificaciones.create({
            data: {
              titulo: "Nueva solicitud de medicamento",
              mensaje,
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

    // Serializar BigInt correctamente
    const solicitudSerializable = {
      id: Number(nuevaSolicitud.id),
      publicacion_id: nuevaSolicitud.publicacion_id ? Number(nuevaSolicitud.publicacion_id) : null,
      hospital_id: nuevaSolicitud.hospital_id ? Number(nuevaSolicitud.hospital_id) : null,
      hospital_origen_id: nuevaSolicitud.hospital_origen_id ? Number(nuevaSolicitud.hospital_origen_id) : null,
      tipo_solicitud: nuevaSolicitud.tipo_solicitud?.nombre || null,
      tipo_solicitud_id: nuevaSolicitud.tipo_solicitud_id ? Number(nuevaSolicitud.tipo_solicitud_id) : null,
      valor_propuesto: nuevaSolicitud.valor_propuesto ? Number(nuevaSolicitud.valor_propuesto) : null,
      medicamento_intercambio: nuevaSolicitud.medicamento_intercambio,
      cantidad_intercambio: nuevaSolicitud.cantidad_intercambio,
      fecha_devolucion_estimada: nuevaSolicitud.fecha_devolucion_estimada?.toISOString() || null,
      propuesta_descripcion: nuevaSolicitud.propuesta_descripcion,
      estado_solicitud: nuevaSolicitud.estado_solicitud?.nombre || null,
      estado_solicitud_id: nuevaSolicitud.estado_solicitud_id ? Number(nuevaSolicitud.estado_solicitud_id) : null,
      created_at: nuevaSolicitud.created_at?.toISOString() || null,
      updated_at: nuevaSolicitud.updated_at?.toISOString() || null,
      hospitales: nuevaSolicitud.hospitales,
      publicaciones: nuevaSolicitud.publicaciones ? {
        id: Number(nuevaSolicitud.publicaciones.id),
        descripcion: nuevaSolicitud.publicaciones.descripcion,
        principioactivo: nuevaSolicitud.publicaciones.principioactivo,
        cantidad: nuevaSolicitud.publicaciones.cantidad
      } : null
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
