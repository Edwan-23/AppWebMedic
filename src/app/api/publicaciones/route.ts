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
        { principioactivo: { contains: search, mode: 'insensitive' } },
        { descripcioncomercial: { contains: search, mode: 'insensitive' } },
        { titular: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filtrar por hospital (Mis Publicaciones)
    if (hospitalId) {
      where.hospital_id = BigInt(hospitalId);
      // En Mis Publicaciones, mostrar todas incluidas las solicitadas y concretadas
      if (estado) {
        where.estado_publicacion = { nombre: estado };
      }
    } else {
      // Si NO , excluir las que están "Solicitadas" y "Concretadas"
      if (estado) {
        // Si hay un filtro de estado específico, usarlo pero asegurar que no sea "Solicitado" ni "Concretada"
        where.estado_publicacion = { nombre: estado };
      } else {
        // Sin filtro de estado, excluir "Solicitado" y "Concretada"
        where.estado_publicacion = {
          nombre: {
            notIn: ["Solicitado", "Concretada"]
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
      descripcion: pub.descripcion,
      tipo_publicacion_id: pub.tipo_publicacion_id ? Number(pub.tipo_publicacion_id) : null,
      cantidad: pub.cantidad,
      unidad_dispensacion_id: pub.unidad_dispensacion_id ? Number(pub.unidad_dispensacion_id) : null,
      estado_publicacion_id: pub.estado_publicacion_id ? Number(pub.estado_publicacion_id) : null,
      created_at: pub.created_at ? new Date(pub.created_at).toISOString() : null,
      updated_at: pub.updated_at ? new Date(pub.updated_at).toISOString() : null,
      
      // Campos manuales
      reg_invima: pub.reg_invima,
      lote: pub.lote,
      fecha_fabricacion: pub.fecha_fabricacion ? new Date(pub.fecha_fabricacion).toISOString() : null,
      fecha_expiracion: pub.fecha_expiracion ? new Date(pub.fecha_expiracion).toISOString() : null,
      
      // Imágenes
      imagen_invima: pub.imagen_invima,
      imagen_lote_vencimiento: pub.imagen_lote_vencimiento,
      imagen_principio_activo: pub.imagen_principio_activo,
      
      // Campos de la API
      expedientecum: pub.expedientecum,
      consecutivocum: pub.consecutivocum,
      principioactivo: pub.principioactivo,
      cantidad_medicamento: pub.cantidad_medicamento,
      unidadmedida: pub.unidadmedida,
      formafarmaceutica: pub.formafarmaceutica,
      titular: pub.titular,
      descripcioncomercial: pub.descripcioncomercial,
      
      hospitales: pub.hospitales ? {
        id: Number(pub.hospitales.id),
        nombre: pub.hospitales.nombre,
        direccion: pub.hospitales.direccion,
        celular: pub.hospitales.celular,
        telefono: pub.hospitales.telefono,
        municipios: pub.hospitales.municipios
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

    // Validar fecha de fabricación
    if (!body.fecha_fabricacion) {
      return NextResponse.json(
        { error: "La fecha de fabricación es requerida" },
        { status: 400 }
      );
    }

    // Validar campos obligatorios
    if (!body.lote || !body.imagen_invima || !body.imagen_lote_vencimiento || !body.imagen_principio_activo) {
      return NextResponse.json(
        { error: "Lote y las 3 imágenes son obligatorias" },
        { status: 400 }
      );
    }

    // Parsear fechas correctamente
    const [yearExp, monthExp, dayExp] = body.fecha_expiracion.split('-').map(Number);
    const fechaExpiracion = new Date(yearExp, monthExp - 1, dayExp);

    const [yearFab, monthFab, dayFab] = body.fecha_fabricacion.split('-').map(Number);
    const fechaFabricacion = new Date(yearFab, monthFab - 1, dayFab);

    // Validar que las fechas sean válidas
    if (isNaN(fechaExpiracion.getTime()) || isNaN(fechaFabricacion.getTime())) {
      return NextResponse.json(
        { error: "Formato de fecha inválido" },
        { status: 400 }
      );
    }
    
    const nuevaPublicacion = await (prisma as any).publicaciones.create({
      data: {
        descripcion: body.descripcion || null,
        cantidad: body.cantidad,
        
        // Campos manuales obligatorios
        reg_invima: body.reg_invima,
        lote: body.lote,
        fecha_fabricacion: fechaFabricacion,
        fecha_expiracion: fechaExpiracion,
        
        // Imágenes obligatorias
        imagen_invima: body.imagen_invima,
        imagen_lote_vencimiento: body.imagen_lote_vencimiento,
        imagen_principio_activo: body.imagen_principio_activo,
        
        // Campos de la API de datos.gov.co
        expedientecum: body.expedientecum || null,
        consecutivocum: body.consecutivocum || null,
        principioactivo: body.principioactivo || null,
        cantidad_medicamento: body.cantidad_medicamento || null,
        unidadmedida: body.unidadmedida || null,
        formafarmaceutica: body.formafarmaceutica || null,
        titular: body.titular || null,
        descripcioncomercial: body.descripcioncomercial || null,
        
        // Relaciones usando connect
        ...(body.hospital_id && {
          hospitales: { connect: { id: BigInt(body.hospital_id) } }
        }),
        ...(body.tipo_publicacion_id && {
          tipo_publicacion: { connect: { id: BigInt(body.tipo_publicacion_id) } }
        }),
        ...(body.unidad_dispensacion_id && {
          unidad_dispensacion: { connect: { id: BigInt(body.unidad_dispensacion_id) } }
        }),
        estado_publicacion: {
          connect: { id: body.estado_publicacion_id ? BigInt(body.estado_publicacion_id) : BigInt(1) }
        }
      },
      include: {
        hospitales: true,
        estado_publicacion: true,
        tipo_publicacion: true,
        unidad_dispensacion: true
      }
    });

    // Crear notificación para OTROS hospitales sobre nueva publicación
    try {
      const medicamento = nuevaPublicacion.principioactivo || "medicamento";
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

      // Crear notificación individualmente para cada hospital y enviar SSE
      for (const otroHospital of otrosHospitales) {
        // Guardar notificación en la base de datos
        const notificacionGuardada = await prisma.notificaciones.create({
          data: {
            titulo: `Nueva publicación: ${medicamento}`,
            mensaje: `${hospital} ha publicado ${tipo.toLowerCase()}: ${medicamento} (${body.cantidad} unidades disponibles)`,
            tipo: "publicacion",
            hospital_id: otroHospital.id,
            referencia_id: nuevaPublicacion.id,
            referencia_tipo: "publicacion",
            leida: false,
          },
        });

        // Enviar notificación SSE con el ID
        await notificarClientes(otroHospital.id, {
          id: Number(notificacionGuardada.id),
          titulo: notificacionGuardada.titulo,
          mensaje: notificacionGuardada.mensaje,
          tipo: notificacionGuardada.tipo,
          hospital_id: Number(otroHospital.id),
          leida: false,
          referencia_id: Number(nuevaPublicacion.id),
          referencia_tipo: "publicacion",
          created_at: notificacionGuardada.created_at.toISOString(),
        });
      }
    } catch (notifError) {
      console.error("Error al crear notificaciones:", notifError);
    }

    // Convertir BigInt a string y fechas a ISO string
    const publicacionData = {
      id: nuevaPublicacion.id.toString(),
      hospital_id: nuevaPublicacion.hospital_id?.toString(),
      descripcion: nuevaPublicacion.descripcion,
      imagen: nuevaPublicacion.imagen,
      tipo_publicacion_id: nuevaPublicacion.tipo_publicacion_id?.toString(),
      cantidad: nuevaPublicacion.cantidad,
      reg_invima: nuevaPublicacion.reg_invima,
      fecha_expiracion: nuevaPublicacion.fecha_expiracion ? new Date(nuevaPublicacion.fecha_expiracion).toISOString() : null,
      estado_publicacion_id: nuevaPublicacion.estado_publicacion_id?.toString(),
      created_at: nuevaPublicacion.created_at ? new Date(nuevaPublicacion.created_at).toISOString() : null,
      updated_at: nuevaPublicacion.updated_at ? new Date(nuevaPublicacion.updated_at).toISOString() : null,
      
      // Campos de la API
      principioactivo: nuevaPublicacion.principioactivo,
      cantidadcum: nuevaPublicacion.cantidadcum,
      unidadmedida: nuevaPublicacion.unidadmedida,
      formafarmaceutica: nuevaPublicacion.formafarmaceutica,
      titular: nuevaPublicacion.titular,
      descripcioncomercial: nuevaPublicacion.descripcioncomercial
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
    console.error("❌ Error al crear publicación:", error);
    console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack');
    console.error("❌ Error message:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}