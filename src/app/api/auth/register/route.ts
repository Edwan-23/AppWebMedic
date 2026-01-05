import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registroUsuarioSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos de entrada con Zod
    const validatedData = registroUsuarioSchema.parse(body);

    // Verificar si el correo ya existe
    const correoExistente = await (prisma as any).usuarios.findUnique({
      where: { correo_corporativo: validatedData.correo_corporativo },
      select: { id: true },
    });

    if (correoExistente) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado" },
        { status: 400 }
      );
    }

    // Verificar si la cédula ya existe
    const cedulaExistente = await (prisma as any).usuarios.findUnique({
      where: { cedula: validatedData.cedula },
      select: { id: true },
    });

    if (cedulaExistente) {
      return NextResponse.json(
        { error: "La cédula ya está registrada" },
        { status: 400 }
      );
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(validatedData.contrasena, 10);

    // Buscar el rol estándar
    const rolEstandar = await (prisma as any).roles.findFirst({
      where: { nombre: "Usuario" },
      select: { id: true },
    });

    // Convertir fecha de nacimiento a Date si existe
    let fechaNacimiento = null;
    if (validatedData.fecha_nacimiento) {
      fechaNacimiento = new Date(validatedData.fecha_nacimiento);
    }

    // Crear usuario en la base de datos
    const nuevoUsuario = await (prisma as any).usuarios.create({
      data: {
        nombres: validatedData.nombres,
        apellidos: validatedData.apellidos,
        fecha_nacimiento: fechaNacimiento,
        sexo: validatedData.sexo,
        cedula: validatedData.cedula,
        correo_corporativo: validatedData.correo_corporativo,
        celular: validatedData.celular,
        numero_tarjeta_profesional: validatedData.numero_tarjeta_profesional,
        rol_id: BigInt(2), // Rol estándar por defecto
        hospital_id: validatedData.hospital_id ? BigInt(validatedData.hospital_id) : null,
        estado_base_id: BigInt(1), // Estado activo por defecto
        contrasena: hashedPassword,
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        correo_corporativo: true,
        cedula: true,
        created_at: true,
      },
    });

    return NextResponse.json(
      {
        message: "Usuario registrado exitosamente",
        usuario: {
          ...nuevoUsuario,
          id: nuevoUsuario.id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);

    // Errores de validación de Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          detalles: error.issues.map((err: any) => ({
            campo: err.path.join("."),
            mensaje: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Error genérico
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}
