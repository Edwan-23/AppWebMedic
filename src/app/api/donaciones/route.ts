import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Filtrar por hospital (Mis Donaciones o Recibidas)
    if (hospitalId) {
      const tipo = searchParams.get("tipo") || "";
      
      if (tipo === "recibidas") {
        // Donaciones recibidas: donde soy el hospital_origen_id
        where.hospital_origen_id = BigInt(hospitalId);
        where.estado_donacion = { nombre: "Concretado" };
      } else {
        // Mis donaciones: donde soy el hospital_id (donante)
        where.hospital_id = BigInt(hospitalId);
        if (estado) {
          where.estado_donacion = { nombre: estado };
        }
      }
    } else {
      // Vista principal: excluir las que están "Solicitado" y "Concretado"
      if (estado) {
        where.estado_donacion = { nombre: estado };
      } else {
        where.estado_donacion = {
          nombre: {
            notIn: ["Solicitado", "Concretado"]
          }
        };
      }
    }

    // Configurar ordenamiento
    const orderByClause = orderBy === "fecha_expiracion" 
      ? { fecha_expiracion: order }
      : { created_at: order };

    // Obtener donaciones con paginación
    const [donaciones, total] = await Promise.all([
      (prisma as any).donaciones.findMany({
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
              email: true,
              municipios: {
                select: { nombre: true }
              }
            }
          },
          hospital_origen: {
            select: {
              id: true,
              nombre: true,
              direccion: true,
              celular: true,
              telefono: true,
              email: true,
              municipios: {
                select: { nombre: true }
              }
            }
          },
          estado_donacion: {
            select: {
              id: true,
              nombre: true
            }
          },
          tipo_donacion: {
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
      (prisma as any).donaciones.count({ where })
    ]);

    // Convertir BigInt a number y fechas a ISO string
    const donacionesData = donaciones.map((don: any) => ({
      id: Number(don.id),
      hospital_id: don.hospital_id ? Number(don.hospital_id) : null,
      hospital_origen_id: don.hospital_origen_id ? Number(don.hospital_origen_id) : null,
      descripcion: don.descripcion,
      tipo_donacion_id: don.tipo_donacion_id ? Number(don.tipo_donacion_id) : null,
      cantidad: don.cantidad,
      unidad_dispensacion_id: don.unidad_dispensacion_id ? Number(don.unidad_dispensacion_id) : null,
      estado_donacion_id: don.estado_donacion_id ? Number(don.estado_donacion_id) : null,
      envio_id: don.envio_id ? Number(don.envio_id) : null,
      created_at: don.created_at ? new Date(don.created_at).toISOString() : null,
      updated_at: don.updated_at ? new Date(don.updated_at).toISOString() : null,
      
      // Campos manuales obligatorios
      reg_invima: don.reg_invima,
      lote: don.lote,
      cum: don.cum,
      fecha_fabricacion: don.fecha_fabricacion ? new Date(don.fecha_fabricacion).toISOString() : null,
      fecha_expiracion: don.fecha_expiracion ? new Date(don.fecha_expiracion).toISOString() : null,
      
      // Imágenes obligatorias
      imagen_invima: don.imagen_invima,
      imagen_lote_vencimiento: don.imagen_lote_vencimiento,
      imagen_principio_activo: don.imagen_principio_activo,
      
      // Campos de la API
      principioactivo: don.principioactivo,
      cantidadcum: don.cantidadcum,
      unidadmedida: don.unidadmedida,
      formafarmaceutica: don.formafarmaceutica,
      titular: don.titular,
      descripcioncomercial: don.descripcioncomercial,
      
      hospitales: don.hospitales ? {
        id: Number(don.hospitales.id),
        nombre: don.hospitales.nombre,
        direccion: don.hospitales.direccion,
        celular: don.hospitales.celular,
        telefono: don.hospitales.telefono,
        email: don.hospitales.email,
        municipios: don.hospitales.municipios
      } : null,
      hospital_origen: don.hospital_origen ? {
        id: Number(don.hospital_origen.id),
        nombre: don.hospital_origen.nombre,
        direccion: don.hospital_origen.direccion,
        celular: don.hospital_origen.celular,
        telefono: don.hospital_origen.telefono,
        email: don.hospital_origen.email,
        municipios: don.hospital_origen.municipios
      } : null,
      estado_donacion: don.estado_donacion ? {
        id: Number(don.estado_donacion.id),
        nombre: don.estado_donacion.nombre
      } : null,
      tipo_donacion: don.tipo_donacion ? {
        id: Number(don.tipo_donacion.id),
        nombre: don.tipo_donacion.nombre
      } : null,
      unidad_dispensacion: don.unidad_dispensacion ? {
        id: Number(don.unidad_dispensacion.id),
        nombre: don.unidad_dispensacion.nombre
      } : null
    }));

    return NextResponse.json({
      donaciones: donacionesData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error al obtener donaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener donaciones" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva donación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar campos obligatorios
    const requiredFields = [
      'hospital_id', 'cantidad', 'reg_invima', 'lote', 'cum',
      'fecha_fabricacion', 'fecha_expiracion', 'imagen_invima',
      'imagen_lote_vencimiento', 'imagen_principio_activo',
      'principioactivo', 'unidad_dispensacion_id'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `El campo ${field} es requerido` },
          { status: 400 }
        );
      }
    }

    // Obtener estado "Disponible" por defecto
    const estadoDisponible = await prisma.estado_donacion.findUnique({
      where: { nombre: "Disponible" }
    });

    if (!estadoDisponible) {
      return NextResponse.json(
        { error: "Estado 'Disponible' no encontrado en la base de datos" },
        { status: 500 }
      );
    }

    // Crear la donación
    const nuevaDonacion = await prisma.donaciones.create({
      data: {
        hospital_id: BigInt(body.hospital_id),
        cantidad: body.cantidad,
        unidad_dispensacion_id: body.unidad_dispensacion_id ? BigInt(body.unidad_dispensacion_id) : null,
        descripcion: body.descripcion || null,
        estado_donacion_id: estadoDisponible.id,
        tipo_donacion_id: body.tipo_donacion_id ? BigInt(body.tipo_donacion_id) : null,
        
        // Campos manuales obligatorios
        reg_invima: body.reg_invima,
        lote: body.lote,
        cum: body.cum,
        fecha_fabricacion: new Date(body.fecha_fabricacion),
        fecha_expiracion: new Date(body.fecha_expiracion),
        
        // Imágenes obligatorias
        imagen_invima: body.imagen_invima,
        imagen_lote_vencimiento: body.imagen_lote_vencimiento,
        imagen_principio_activo: body.imagen_principio_activo,
        
        // Campos de la API
        principioactivo: body.principioactivo,
        cantidadcum: body.cantidadcum || null,
        unidadmedida: body.unidadmedida || null,
        formafarmaceutica: body.formafarmaceutica || null,
        titular: body.titular || null,
        descripcioncomercial: body.descripcioncomercial || null
      },
      include: {
        hospitales: true,
        estado_donacion: true,
        tipo_donacion: true,
        unidad_dispensacion: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Donación creada exitosamente",
      donacion: {
        id: Number(nuevaDonacion.id),
        hospital_id: Number(nuevaDonacion.hospital_id),
        cantidad: nuevaDonacion.cantidad,
        principioactivo: nuevaDonacion.principioactivo,
        estado_donacion: nuevaDonacion.estado_donacion?.nombre
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error al crear donación:", error);
    return NextResponse.json(
      { error: "Error al crear la donación" },
      { status: 500 }
    );
  }
}
