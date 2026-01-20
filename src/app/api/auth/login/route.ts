import { NextRequest, NextResponse } from "next/server";
import { inicioSesionSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Función para obtener la hora actual de Bogotá, Colombia (UTC-5)
function obtenerHoraBogota(): Date {
  const ahora = new Date();
  // Convertir a hora de Bogotá (UTC-5)
  const horaBogota = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  return horaBogota;
}

// Extender el schema para incluir el campo recordar
const inicioSesionConRecordarSchema = inicioSesionSchema.extend({
  recordar: z.boolean().optional().default(false)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada con Zod
    const validacion = inicioSesionConRecordarSchema.safeParse(body);
    
    if (!validacion.success) {
      return NextResponse.json(
        { 
          error: "Datos inválidos", 
          detalles: validacion.error.issues 
        },
        { status: 400 }
      );
    }

    const { correo_corporativo, contrasena, recordar } = validacion.data;

    // Buscar usuario por correo
    const usuario = await (prisma as any).usuarios.findUnique({
      where: { correo_corporativo },
      include: {
        roles: {
          select: { id: true, nombre: true }
        },
        hospitales: {
          select: { id: true, nombre: true }
        }
      }
    });

    // Verificar si el usuario existe
    if (!usuario) {
      return NextResponse.json(
        { error: "Correo o contraseña incorrectos" },
        { status: 401 }
      );
    }

    // Verificar si el usuario está suspendido (solo el estado Suspendido con id 3 impide el ingreso)
    if (usuario.estado_base_id === BigInt(3)) {
      return NextResponse.json(
        { error: "Usuario suspendido. Contacte al administrador" },
        { status: 403 }
      );
    }

    // Verificar contraseña
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    
    if (!contrasenaValida) {
      return NextResponse.json(
        { error: "Correo o contraseña incorrectos" },
        { status: 401 }
      );
    }

    // Actualizar último ingreso del usuario y estado si estaba Ausente
    const horaBogota = obtenerHoraBogota();
    const datosActualizar: any = {
      ultimo_ingreso: horaBogota,
      updated_at: horaBogota
    };

    // Si el usuario estaba Ausente (id 2), cambiarlo a Activo (id 1)
    if (usuario.estado_base_id && usuario.estado_base_id.toString() === '2') {
      datosActualizar.estado_base_id = BigInt(1);
    }

    await (prisma as any).usuarios.update({
      where: { id: usuario.id },
      data: datosActualizar
    });

    // Preparar datos del usuario (sin contraseña y con BigInt convertidos)
    const datosUsuario = {
      id: usuario.id.toString(),
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      fecha_nacimiento: usuario.fecha_nacimiento,
      sexo: usuario.sexo,
      cedula: usuario.cedula,
      correo_corporativo: usuario.correo_corporativo,
      celular: usuario.celular,
      numero_tarjeta_profesional: usuario.numero_tarjeta_profesional,
      rol_id: usuario.rol_id?.toString() || null,
      hospital_id: usuario.hospital_id?.toString() || null,
      estado_base_id: usuario.estado_base_id?.toString() || null,
      created_at: usuario.created_at,
      updated_at: usuario.updated_at,
      roles: usuario.roles ? {
        id: usuario.roles.id.toString(),
        nombre: usuario.roles.nombre
      } : null,
      hospitales: usuario.hospitales ? {
        id: usuario.hospitales.id.toString(),
        nombre: usuario.hospitales.nombre
      } : null,
    };

    // Crear respuesta con cookies
    const response = NextResponse.json(
      {
        mensaje: "Inicio de sesión exitoso",
        usuario: datosUsuario
      },
      { status: 200 }
    );

    // Configurar duración de la cookie según la opción "recordar"
    const maxAge = recordar ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 días recordados, sin activar es 1 día normal

    // Guardar sesión en cookie httpOnly
    response.cookies.set('sesion_usuario', JSON.stringify(datosUsuario), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: maxAge,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
