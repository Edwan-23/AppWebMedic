import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const publicacionId = BigInt(id);

    const publicacion = await (prisma as any).publicaciones.findUnique({
      where: { id: publicacionId },
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
    });

    if (!publicacion) {
      return NextResponse.json(
        { error: "Publicación no encontrada" },
        { status: 404 }
      );
    }

    // Convertir BigInt a number
    const publicacionData = {
      id: Number(publicacion.id),
      hospital_id: publicacion.hospital_id ? Number(publicacion.hospital_id) : null,
      medicamento_id: publicacion.medicamento_id ? Number(publicacion.medicamento_id) : null,
      descripcion: publicacion.descripcion,
      imagen: publicacion.imagen,
      tipo_publicacion_id: publicacion.tipo_publicacion_id ? Number(publicacion.tipo_publicacion_id) : null,
      cantidad: publicacion.cantidad,
      reg_invima: publicacion.reg_invima,
      unidad_dispensacion_id: publicacion.unidad_dispensacion_id ? Number(publicacion.unidad_dispensacion_id) : null,
      fecha_expiracion: publicacion.fecha_expiracion ? new Date(publicacion.fecha_expiracion).toISOString() : null,
      estado_publicacion_id: publicacion.estado_publicacion_id ? Number(publicacion.estado_publicacion_id) : null,
      created_at: publicacion.created_at ? new Date(publicacion.created_at).toISOString() : null,
      updated_at: publicacion.updated_at ? new Date(publicacion.updated_at).toISOString() : null,
      hospitales: publicacion.hospitales ? {
        id: Number(publicacion.hospitales.id),
        nombre: publicacion.hospitales.nombre,
        direccion: publicacion.hospitales.direccion,
        celular: publicacion.hospitales.celular,
        telefono: publicacion.hospitales.telefono,
        municipios: publicacion.hospitales.municipios
      } : null,
      medicamentos: publicacion.medicamentos ? {
        id: Number(publicacion.medicamentos.id),
        nombre: publicacion.medicamentos.nombre,
        referencia: publicacion.medicamentos.referencia,
        concentracion: publicacion.medicamentos.concentracion,
        tipo_medicamento: publicacion.medicamentos.tipo_medicamento,
        medida_medicamento: publicacion.medicamentos.medida_medicamento
      } : null,
      estado_publicacion: publicacion.estado_publicacion ? {
        id: Number(publicacion.estado_publicacion.id),
        nombre: publicacion.estado_publicacion.nombre
      } : null,
      tipo_publicacion: publicacion.tipo_publicacion ? {
        id: Number(publicacion.tipo_publicacion.id),
        nombre: publicacion.tipo_publicacion.nombre
      } : null,
      unidad_dispensacion: publicacion.unidad_dispensacion ? {
        id: Number(publicacion.unidad_dispensacion.id),
        nombre: publicacion.unidad_dispensacion.nombre
      } : null
    };

    return NextResponse.json({
      success: true,
      publicacion: publicacionData
    }, { status: 200 });

  } catch (error) {
    console.error("Error al obtener publicación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const publicacionId = BigInt(id);

    // Preparar objeto de actualización
    const dataToUpdate: any = {
      updated_at: new Date()
    };

    // Solo actualizar estado si se envía únicamente estado_publicacion_id
    if (body.estado_publicacion_id && Object.keys(body).length === 1) {
      dataToUpdate.estado_publicacion_id = BigInt(body.estado_publicacion_id);
    } else {
      if (!body.fecha_expiracion) {
        return NextResponse.json(
          { error: "La fecha de expiración es requerida" },
          { status: 400 }
        );
      }

      // Parsear fecha 
      const [year, month, day] = body.fecha_expiracion.split('-').map(Number);
      const fechaExpiracion = new Date(year, month - 1, day);

      // Validar que la fecha sea válida
      if (isNaN(fechaExpiracion.getTime())) {
        return NextResponse.json(
          { error: "Formato de fecha inválido" },
          { status: 400 }
        );
      }

      dataToUpdate.medicamento_id = body.medicamento_id ? BigInt(body.medicamento_id) : undefined;
      dataToUpdate.descripcion = body.descripcion || null;
      dataToUpdate.imagen = body.imagen !== undefined ? body.imagen : undefined;
      dataToUpdate.tipo_publicacion_id = body.tipo_publicacion_id ? BigInt(body.tipo_publicacion_id) : undefined;
      dataToUpdate.cantidad = body.cantidad;
      dataToUpdate.reg_invima = body.reg_invima || null;
      dataToUpdate.unidad_dispensacion_id = body.unidad_dispensacion_id ? BigInt(body.unidad_dispensacion_id) : undefined;
      dataToUpdate.fecha_expiracion = fechaExpiracion;
      dataToUpdate.estado_publicacion_id = body.estado_publicacion_id ? BigInt(body.estado_publicacion_id) : undefined;
    }

    // Actualizar publicación
    const publicacionActualizada = await (prisma as any).publicaciones.update({
      where: { id: publicacionId },
      data: dataToUpdate,
      include: {
        hospitales: true,
        medicamentos: true,
        estado_publicacion: true,
        tipo_publicacion: true,
        unidad_dispensacion: true
      }
    });

    // Convertir BigInt a string y fechas a ISO string
    const publicacionData = {
      id: publicacionActualizada.id.toString(),
      hospital_id: publicacionActualizada.hospital_id?.toString(),
      medicamento_id: publicacionActualizada.medicamento_id?.toString(),
      descripcion: publicacionActualizada.descripcion,
      imagen: publicacionActualizada.imagen,
      tipo_publicacion_id: publicacionActualizada.tipo_publicacion_id?.toString(),
      cantidad: publicacionActualizada.cantidad,
      reg_invima: publicacionActualizada.reg_invima,
      fecha_expiracion: publicacionActualizada.fecha_expiracion ? new Date(publicacionActualizada.fecha_expiracion).toISOString() : null,
      estado_publicacion_id: publicacionActualizada.estado_publicacion_id?.toString(),
      created_at: publicacionActualizada.created_at ? new Date(publicacionActualizada.created_at).toISOString() : null,
      updated_at: publicacionActualizada.updated_at ? new Date(publicacionActualizada.updated_at).toISOString() : null
    };

    return NextResponse.json(
      { 
        mensaje: "Publicación actualizada exitosamente",
        publicacion: publicacionData
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error al actualizar publicación:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Publicación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const publicacionId = BigInt(id);

    await (prisma as any).publicaciones.delete({
      where: { id: publicacionId }
    });

    return NextResponse.json(
      { mensaje: "Publicación eliminada exitosamente" },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error al eliminar publicación:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Publicación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
