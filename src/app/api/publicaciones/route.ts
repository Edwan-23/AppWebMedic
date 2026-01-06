import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificarClientes } from "../notificaciones/stream/route";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const estado = searchParams.get("estado") || "";
    const hospitalId = searchParams.get("hospital_id") || "";
    const orderBy = searchParams.get("orderBy") || "created_at";
    const order = searchParams.get("order") || "desc";
    
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { descripcion: { contains: search, mode: 'insensitive' } },
        { medicamentos: { nombre: { contains: search, mode: 'insensitive' } } },
        { medicamentos: { referencia: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Filtrar por hospital (Mis Publicaciones)
    if (hospitalId) {
      where.hospital_id = BigInt(hospitalId);
      // En Mis Publicaciones, mostrar todas incluidas las solicitadas
      if (estado) {
        where.estado_publicacion = { nombre: estado };
      }
    } else {
      // Si NO es "Mis Publicaciones", excluir las que están "Solicitadas"
      if (estado) {
        // Si hay un filtro de estado específico, usarlo pero asegurar que no sea "Solicitado"
        where.estado_publicacion = { nombre: estado };
      } else {
        // Sin filtro de estado, excluir "Solicitado"
        where.estado_publicacion = {
          nombre: {
            not: "Solicitado"
          }
        };
      }
    }

    // Configurar ordenamiento
    const orderByClause = orderBy === "fecha_expiracion" 
      ? { fecha_expiracion: order }
      : { created_at: order };

    // Obtener publicaciones con paginación
    const [publicaciones, total] = await Promise.all([
      (prisma as any).publicaciones.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderByClause,
        include: {
          hospitales: {
            select: {
              id: true,
              nombre: true,
              direccion: true,
              celular: true,
              telefono: true,
              municipios: {
                select: { nombre: true }
              }
            }
          },
          medicamentos: {
            select: {
              id: true,
              nombre: true,
              referencia: true,
              concentracion: true,
              tipo_medicamento: {
                select: { nombre: true }
              },
              medida_medicamento: {
                select: { nombre: true }
              }
            }
          },
          estado_publicacion: {
            select: {
              id: true,
              nombre: true
            }
          },
          tipo_publicacion: {
            select: {
              id: true,
              nombre: true
            }
          },
          unidad_dispensacion: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      }),
      (prisma as any).publicaciones.count({ where })
    ]);

    // Convertir BigInt a number y fechas a ISO string
    const publicacionesData = publicaciones.map((pub: any) => ({
      id: Number(pub.id),
      hospital_id: pub.hospital_id ? Number(pub.hospital_id) : null,
      medicamento_id: pub.medicamento_id ? Number(pub.medicamento_id) : null,
      descripcion: pub.descripcion,
      imagen: pub.imagen,
      tipo_publicacion_id: pub.tipo_publicacion_id ? Number(pub.tipo_publicacion_id) : null,
      cantidad: pub.cantidad,
      reg_invima: pub.reg_invima,
      unidad_dispensacion_id: pub.unidad_dispensacion_id ? Number(pub.unidad_dispensacion_id) : null,
      fecha_expiracion: pub.fecha_expiracion ? new Date(pub.fecha_expiracion).toISOString() : null,
      estado_publicacion_id: pub.estado_publicacion_id ? Number(pub.estado_publicacion_id) : null,
      created_at: pub.created_at ? new Date(pub.created_at).toISOString() : null,
      updated_at: pub.updated_at ? new Date(pub.updated_at).toISOString() : null,
      hospitales: pub.hospitales ? {
        id: Number(pub.hospitales.id),
        nombre: pub.hospitales.nombre,
        direccion: pub.hospitales.direccion,
        celular: pub.hospitales.celular,
        telefono: pub.hospitales.telefono,
        municipios: pub.hospitales.municipios
      } : null,
      medicamentos: pub.medicamentos ? {
        id: Number(pub.medicamentos.id),
        nombre: pub.medicamentos.nombre,
        referencia: pub.medicamentos.referencia,
        concentracion: pub.medicamentos.concentracion,
        tipo_medicamento: pub.medicamentos.tipo_medicamento,
        medida_medicamento: pub.medicamentos.medida_medicamento
      } : null,
      estado_publicacion: pub.estado_publicacion ? {
        id: Number(pub.estado_publicacion.id),
        nombre: pub.estado_publicacion.nombre
      } : null,
      tipo_publicacion: pub.tipo_publicacion ? {
        id: Number(pub.tipo_publicacion.id),
        nombre: pub.tipo_publicacion.nombre
      } : null,
      unidad_dispensacion: pub.unidad_dispensacion ? {
        id: Number(pub.unidad_dispensacion.id),
        nombre: pub.unidad_dispensacion.nombre
      } : null
    }));

    return NextResponse.json({
      success: true,
      publicaciones: publicacionesData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error al obtener publicaciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar fecha de expiración
    if (!body.fecha_expiracion) {
      return NextResponse.json(
        { error: "La fecha de expiración es requerida" },
        { status: 400 }
      );
    }

    // Parsear fecha correctamente
    const [year, month, day] = body.fecha_expiracion.split('-').map(Number);
    const fechaExpiracion = new Date(year, month - 1, day);

    // Validar que la fecha sea válida
    if (isNaN(fechaExpiracion.getTime())) {
      return NextResponse.json(
        { error: "Formato de fecha inválido" },
        { status: 400 }
      );
    }
    
    const nuevaPublicacion = await (prisma as any).publicaciones.create({
      data: {
        hospital_id: body.hospital_id ? BigInt(body.hospital_id) : null,
        medicamento_id: body.medicamento_id ? BigInt(body.medicamento_id) : null,
        descripcion: body.descripcion || null,
        imagen: body.imagen || null,
        tipo_publicacion_id: body.tipo_publicacion_id ? BigInt(body.tipo_publicacion_id) : null,
        cantidad: body.cantidad,
        reg_invima: body.reg_invima || null,
        unidad_dispensacion_id: body.unidad_dispensacion_id ? BigInt(body.unidad_dispensacion_id) : null,
        fecha_expiracion: fechaExpiracion,
        estado_publicacion_id: body.estado_publicacion_id ? BigInt(body.estado_publicacion_id) : BigInt(1)
      },
      include: {
        hospitales: true,
        medicamentos: true,
        estado_publicacion: true,
        tipo_publicacion: true,
        unidad_dispensacion: true
      }
    });

    // Crear notificación para OTROS hospitales sobre nueva publicación
    try {
      const medicamento = nuevaPublicacion.medicamentos?.nombre || "medicamento";
      const hospital = nuevaPublicacion.hospitales?.nombre || "un hospital";
      const tipo = nuevaPublicacion.tipo_publicacion?.nombre || "medicamento";

      // Obtener todos los hospitales EXCEPTO el que publicó
      const otrosHospitales = await prisma.hospitales.findMany({
        where: {
          id: {
            not: nuevaPublicacion.hospital_id || BigInt(0)
          },
          estado_id: BigInt(1) // Solo hospitales activos
        },
        select: {
          id: true
        }
      });

      // Crear notificación para cada hospital
      const notificaciones = otrosHospitales.map((h: any) => ({
        titulo: `Nueva publicación: ${medicamento}`,
        mensaje: `${hospital} ha publicado ${tipo.toLowerCase()}: ${medicamento} (${body.cantidad} unidades disponibles)`,
        tipo: "publicacion",
        hospital_id: h.id,
        referencia_id: nuevaPublicacion.id,
        referencia_tipo: "publicacion"
      }));

      if (notificaciones.length > 0) {
        await prisma.notificaciones.createMany({
          data: notificaciones
        });
        
        // Notificar a cada hospital vía SSE
        for (const notif of notificaciones) {
          await notificarClientes(notif.hospital_id, {
            id: 0, // El ID real no se conoce con createMany
            titulo: notif.titulo,
            mensaje: notif.mensaje,
            tipo: notif.tipo,
            hospital_id: Number(notif.hospital_id),
            leida: false,
            referencia_id: Number(nuevaPublicacion.id),
            referencia_tipo: "publicacion",
            created_at: new Date()
          });
        }
      }
    } catch (notifError) {
      console.error("Error al crear notificaciones:", notifError);
    }

    // Convertir BigInt a string y fechas a ISO string
    const publicacionData = {
      id: nuevaPublicacion.id.toString(),
      hospital_id: nuevaPublicacion.hospital_id?.toString(),
      medicamento_id: nuevaPublicacion.medicamento_id?.toString(),
      descripcion: nuevaPublicacion.descripcion,
      imagen: nuevaPublicacion.imagen,
      tipo_publicacion_id: nuevaPublicacion.tipo_publicacion_id?.toString(),
      cantidad: nuevaPublicacion.cantidad,
      reg_invima: nuevaPublicacion.reg_invima,
      fecha_expiracion: nuevaPublicacion.fecha_expiracion ? new Date(nuevaPublicacion.fecha_expiracion).toISOString() : null,
      estado_publicacion_id: nuevaPublicacion.estado_publicacion_id?.toString(),
      created_at: nuevaPublicacion.created_at ? new Date(nuevaPublicacion.created_at).toISOString() : null,
      updated_at: nuevaPublicacion.updated_at ? new Date(nuevaPublicacion.updated_at).toISOString() : null
    };

    return NextResponse.json(
      { 
        success: true,
        mensaje: "Publicación creada exitosamente",
        publicacion: publicacionData
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("❌❌❌ Error al crear publicación:", error);
    console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack');
    console.error("❌ Error message:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}