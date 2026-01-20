import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const actualizarUsuarioSchema = z.object({
  nombres: z.string().min(2).max(50),
  apellidos: z.string().min(2).max(50),
  sexo: z.enum(["Hombre", "Mujer", "Otro"]).optional(),
  fecha_nacimiento: z.string().optional(),
  correo_corporativo: z.string().email(),
  celular: z.string().length(10).regex(/^[0-9]+$/).optional(),
  numero_tarjeta_profesional: z.string().max(50).optional(),
  hospital_id: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const usuarioId = BigInt(id);

    const usuario = await (prisma as any).usuarios.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        fecha_nacimiento: true,
        sexo: true,
        cedula: true,
        correo_corporativo: true,
        celular: true,
        numero_tarjeta_profesional: true,
        rol_id: true,
        hospital_id: true,
        estado_base_id: true,
        created_at: true,
        updated_at: true,
        roles: {
          select: {
            id: true,
            nombre: true,
          },
        },
        hospitales: {
          select: {
            id: true,
            nombre: true,
            rut: true,
            direccion: true,
          },
        },
        estado_base: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Convertir BigInt a string
    const usuarioFormateado = {
      id: usuario.id.toString(),
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      fecha_nacimiento: usuario.fecha_nacimiento,
      sexo: usuario.sexo,
      cedula: usuario.cedula,
      correo_corporativo: usuario.correo_corporativo,
      celular: usuario.celular,
      numero_tarjeta_profesional: usuario.numero_tarjeta_profesional,
      rol_id: usuario.rol_id?.toString(),
      hospital_id: usuario.hospital_id?.toString(),
      estado_base_id: usuario.estado_base_id?.toString(),
      created_at: usuario.created_at,
      updated_at: usuario.updated_at,
      rol: usuario.roles
        ? {
            id: usuario.roles.id.toString(),
            nombre: usuario.roles.nombre,
          }
        : null,
      hospital: usuario.hospitales
        ? {
            id: usuario.hospitales.id.toString(),
            nombre: usuario.hospitales.nombre,
            rut: usuario.hospitales.rut,
            direccion: usuario.hospitales.direccion,
          }
        : null,
      estado_base: usuario.estado_base
        ? {
            id: usuario.estado_base.id.toString(),
            nombre: usuario.estado_base.nombre,
          }
        : null,
    };

    return NextResponse.json(usuarioFormateado, { status: 200 });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await context.params;
    const usuarioId = BigInt(id);

    // Validar datos
    const validacion = actualizarUsuarioSchema.safeParse(body);
    if (!validacion.success) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: validacion.error.issues },
        { status: 400 }
      );
    }

    const datos = validacion.data;

    // Preparar datos para actualizar
    const datosActualizar: any = {
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      correo_corporativo: datos.correo_corporativo,
    };

    if (datos.sexo) datosActualizar.sexo = datos.sexo;
    if (datos.celular) datosActualizar.celular = datos.celular;
    if (datos.numero_tarjeta_profesional) 
      datosActualizar.numero_tarjeta_profesional = datos.numero_tarjeta_profesional;
    if (datos.hospital_id) 
      datosActualizar.hospital_id = BigInt(datos.hospital_id);
    if (datos.fecha_nacimiento) 
      datosActualizar.fecha_nacimiento = new Date(datos.fecha_nacimiento);

    // Actualizar usuario
    const usuarioActualizado = await (prisma as any).usuarios.update({
      where: { id: usuarioId },
      data: datosActualizar,
      include: {
        roles: {
          select: { id: true, nombre: true }
        },
        hospitales: {
          select: { id: true, nombre: true }
        }
      }
    });

    // Seriales a la respuesta
    const datosUsuario = {
      id: usuarioActualizado.id.toString(),
      nombres: usuarioActualizado.nombres,
      apellidos: usuarioActualizado.apellidos,
      fecha_nacimiento: usuarioActualizado.fecha_nacimiento,
      sexo: usuarioActualizado.sexo,
      cedula: usuarioActualizado.cedula,
      correo_corporativo: usuarioActualizado.correo_corporativo,
      celular: usuarioActualizado.celular,
      numero_tarjeta_profesional: usuarioActualizado.numero_tarjeta_profesional,
      rol_id: usuarioActualizado.rol_id?.toString() || null,
      hospital_id: usuarioActualizado.hospital_id?.toString() || null,
      estado_base_id: usuarioActualizado.estado_base_id?.toString() || null,
      created_at: usuarioActualizado.created_at,
      updated_at: usuarioActualizado.updated_at,
      roles: usuarioActualizado.roles ? {
        id: usuarioActualizado.roles.id.toString(),
        nombre: usuarioActualizado.roles.nombre
      } : null,
      hospitales: usuarioActualizado.hospitales ? {
        id: usuarioActualizado.hospitales.id.toString(),
        nombre: usuarioActualizado.hospitales.nombre
      } : null,
    };

    return NextResponse.json(
      { 
        mensaje: "Usuario actualizado correctamente",
        usuario: datosUsuario 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await context.params;
    const usuarioId = BigInt(id);

    // Validar que se envíe estado_base_id
    if (!body.estado_base_id) {
      return NextResponse.json(
        { error: "estado_base_id es requerido" },
        { status: 400 }
      );
    }

    const estadoBaseId = BigInt(body.estado_base_id);

    // Verificar si el usuario existe
    const usuario = await (prisma as any).usuarios.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar estado del usuario
    const usuarioActualizado = await (prisma as any).usuarios.update({
      where: { id: usuarioId },
      data: {
        estado_base_id: estadoBaseId,
      },
      include: {
        estado_base: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        mensaje: "Estado del usuario actualizado correctamente",
        usuario: {
          id: usuarioActualizado.id.toString(),
          estado_base_id: usuarioActualizado.estado_base_id.toString(),
          estado_base: {
            id: usuarioActualizado.estado_base.id.toString(),
            nombre: usuarioActualizado.estado_base.nombre,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar estado del usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const usuarioId = BigInt(id);

    // Verificar si el usuario existe
    const usuario = await (prisma as any).usuarios.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar usuario
    await (prisma as any).usuarios.delete({
      where: { id: usuarioId },
    });

    return NextResponse.json(
      { mensaje: "Usuario eliminado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
