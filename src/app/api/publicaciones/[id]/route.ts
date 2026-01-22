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
      descripcion: publicacion.descripcion,
      tipo_publicacion_id: publicacion.tipo_publicacion_id ? Number(publicacion.tipo_publicacion_id) : null,
      cantidad: publicacion.cantidad,
      unidad_dispensacion_id: publicacion.unidad_dispensacion_id ? Number(publicacion.unidad_dispensacion_id) : null,
      estado_publicacion_id: publicacion.estado_publicacion_id ? Number(publicacion.estado_publicacion_id) : null,
      created_at: publicacion.created_at ? new Date(publicacion.created_at).toISOString() : null,
      updated_at: publicacion.updated_at ? new Date(publicacion.updated_at).toISOString() : null,
      
      // Campos manuales
      reg_invima: publicacion.reg_invima,
      lote: publicacion.lote,
      cum: publicacion.cum,
      fecha_fabricacion: publicacion.fecha_fabricacion ? new Date(publicacion.fecha_fabricacion).toISOString() : null,
      fecha_expiracion: publicacion.fecha_expiracion ? new Date(publicacion.fecha_expiracion).toISOString() : null,
      
      // Imágenes
      imagen_invima: publicacion.imagen_invima,
      imagen_lote_vencimiento: publicacion.imagen_lote_vencimiento,
      imagen_principio_activo: publicacion.imagen_principio_activo,
      
      // Campos de la API
      principioactivo: publicacion.principioactivo,
      cantidadcum: publicacion.cantidadcum,
      unidadmedida: publicacion.unidadmedida,
      formafarmaceutica: publicacion.formafarmaceutica,
      titular: publicacion.titular,
      descripcioncomercial: publicacion.descripcioncomercial,
      
      hospitales: publicacion.hospitales ? {
        id: Number(publicacion.hospitales.id),
        nombre: publicacion.hospitales.nombre,
        direccion: publicacion.hospitales.direccion,
        celular: publicacion.hospitales.celular,
        telefono: publicacion.hospitales.telefono,
        municipios: publicacion.hospitales.municipios
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
      const [yearExp, monthExp, dayExp] = body.fecha_expiracion.split('-').map(Number);
      const fechaExpiracion = new Date(yearExp, monthExp - 1, dayExp);

      // Validar que la fecha sea válida
      if (isNaN(fechaExpiracion.getTime())) {
        return NextResponse.json(
          { error: "Formato de fecha de expiración inválido" },
          { status: 400 }
        );
      }

      dataToUpdate.descripcion = body.descripcion || null;
      dataToUpdate.tipo_publicacion_id = body.tipo_publicacion_id ? BigInt(body.tipo_publicacion_id) : undefined;
      dataToUpdate.cantidad = body.cantidad;
      dataToUpdate.fecha_expiracion = fechaExpiracion;
      dataToUpdate.estado_publicacion_id = body.estado_publicacion_id ? BigInt(body.estado_publicacion_id) : undefined;
      dataToUpdate.unidad_dispensacion_id = body.unidad_dispensacion_id ? BigInt(body.unidad_dispensacion_id) : undefined;
      
      // Campos manuales obligatorios
      if (body.reg_invima !== undefined) dataToUpdate.reg_invima = body.reg_invima;
      if (body.lote !== undefined) dataToUpdate.lote = body.lote;
      if (body.cum !== undefined) dataToUpdate.cum = body.cum;
      
      // Fecha de fabricación
      if (body.fecha_fabricacion) {
        const [yearFab, monthFab, dayFab] = body.fecha_fabricacion.split('-').map(Number);
        const fechaFabricacion = new Date(yearFab, monthFab - 1, dayFab);
        if (!isNaN(fechaFabricacion.getTime())) {
          dataToUpdate.fecha_fabricacion = fechaFabricacion;
        }
      }
      
      // Imágenes
      if (body.imagen_invima !== undefined) dataToUpdate.imagen_invima = body.imagen_invima;
      if (body.imagen_lote_vencimiento !== undefined) dataToUpdate.imagen_lote_vencimiento = body.imagen_lote_vencimiento;
      if (body.imagen_principio_activo !== undefined) dataToUpdate.imagen_principio_activo = body.imagen_principio_activo;
      
      // Campos de la API (permitir actualización si se envían)
      if (body.principioactivo !== undefined) dataToUpdate.principioactivo = body.principioactivo;
      if (body.cantidadcum !== undefined) dataToUpdate.cantidadcum = body.cantidadcum;
      if (body.unidadmedida !== undefined) dataToUpdate.unidadmedida = body.unidadmedida;
      if (body.formafarmaceutica !== undefined) dataToUpdate.formafarmaceutica = body.formafarmaceutica;
      if (body.titular !== undefined) dataToUpdate.titular = body.titular;
      if (body.descripcioncomercial !== undefined) dataToUpdate.descripcioncomercial = body.descripcioncomercial;
    }

    // Actualizar publicación
    const publicacionActualizada = await (prisma as any).publicaciones.update({
      where: { id: publicacionId },
      data: dataToUpdate,
      include: {
        hospitales: true,
        estado_publicacion: true,
        tipo_publicacion: true,
        unidad_dispensacion: true
      }
    });

    // Convertir BigInt a string y fechas a ISO string
    const publicacionData = {
      id: publicacionActualizada.id.toString(),
      hospital_id: publicacionActualizada.hospital_id?.toString(),
      descripcion: publicacionActualizada.descripcion,
      tipo_publicacion_id: publicacionActualizada.tipo_publicacion_id?.toString(),
      cantidad: publicacionActualizada.cantidad,
      
      // Campos manuales
      reg_invima: publicacionActualizada.reg_invima,
      lote: publicacionActualizada.lote,
      cum: publicacionActualizada.cum,
      fecha_fabricacion: publicacionActualizada.fecha_fabricacion ? new Date(publicacionActualizada.fecha_fabricacion).toISOString() : null,
      fecha_expiracion: publicacionActualizada.fecha_expiracion ? new Date(publicacionActualizada.fecha_expiracion).toISOString() : null,
      
      // Imágenes
      imagen_invima: publicacionActualizada.imagen_invima,
      imagen_lote_vencimiento: publicacionActualizada.imagen_lote_vencimiento,
      imagen_principio_activo: publicacionActualizada.imagen_principio_activo,
      
      estado_publicacion_id: publicacionActualizada.estado_publicacion_id?.toString(),
      created_at: publicacionActualizada.created_at ? new Date(publicacionActualizada.created_at).toISOString() : null,
      updated_at: publicacionActualizada.updated_at ? new Date(publicacionActualizada.updated_at).toISOString() : null,
      
      // Campos de la API
      principioactivo: publicacionActualizada.principioactivo,
      cantidadcum: publicacionActualizada.cantidadcum,
      unidadmedida: publicacionActualizada.unidadmedida,
      formafarmaceutica: publicacionActualizada.formafarmaceutica,
      titular: publicacionActualizada.titular,
      descripcioncomercial: publicacionActualizada.descripcioncomercial
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

    // Verificar si la publicación existe y obtener su imagen
    const publicacion = await (prisma as any).publicaciones.findUnique({
      where: { id: publicacionId },
      select: {
        id: true,
        imagen: true
      }
    });

    if (!publicacion) {
      return NextResponse.json(
        { error: "Publicación no encontrada" },
        { status: 404 }
      );
    }

    // Verificar si tiene solicitudes asociadas
    const solicitudesCount = await (prisma as any).solicitudes.count({
      where: { publicacion_id: publicacionId }
    });

    if (solicitudesCount > 0) {
      // Verificar si alguna solicitud tiene envíos
      const solicitudesConEnvios = await (prisma as any).solicitudes.findMany({
        where: { publicacion_id: publicacionId },
        include: {
          envio: true
        }
      });

      const tieneEnvios = solicitudesConEnvios.some((sol: any) => sol.envio && sol.envio.length > 0);

      if (tieneEnvios) {
        return NextResponse.json(
          { 
            error: "No se puede eliminar la publicación porque tiene envíos asociados",
            tipo: "envios"
          },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          { 
            error: "No se puede eliminar la publicación porque tiene solicitudes asociadas",
            tipo: "solicitudes"
          },
          { status: 409 }
        );
      }
    }

    // No tiene relaciones, proceder con eliminación completa
    await (prisma as any).publicaciones.delete({
      where: { id: publicacionId }
    });

    // Eliminar imagen física si existe
    if (publicacion.imagen && publicacion.imagen.startsWith('/images/publicaciones/')) {
      try {
        const fs = require('fs');
        const path = require('path');
        const imagePath = path.join(process.cwd(), 'public', publicacion.imagen);
        
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (imageError) {
        console.error("Error al eliminar imagen:", imageError);
        // No fallar la operación si la imagen no se puede eliminar
      }
    }

    return NextResponse.json(
      { mensaje: "Publicación eliminada completamente" },
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

    if (error.code === 'P2003') {
      return NextResponse.json(
        { 
          error: "No se puede eliminar la publicación porque tiene registros relacionados",
          tipo: "general"
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
