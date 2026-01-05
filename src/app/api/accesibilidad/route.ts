import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Obtener preferencias de accesibilidad del usuario
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get("usuario_id");

    if (!usuarioId) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    let preferencias = await prisma.preferencias_accesibilidad.findUnique({
      where: { usuario_id: BigInt(usuarioId) },
    });

    // Si no existen preferencias, crear valores por defecto
    if (!preferencias) {
      preferencias = await prisma.preferencias_accesibilidad.create({
        data: {
          usuario_id: BigInt(usuarioId),
          contraste_desactivado: false,
          contraste_brillante: false,
          contraste_invertido: false,
          tamano_texto: 100,
          zoom_pantalla: 100,
        },
      });
    }

    // Convertir BigInt a string para JSON
    const preferenciasFormateadas = {
      id: preferencias.id.toString(),
      usuario_id: preferencias.usuario_id.toString(),
      contraste_desactivado: preferencias.contraste_desactivado,
      contraste_brillante: preferencias.contraste_brillante,
      contraste_invertido: preferencias.contraste_invertido,
      tamano_texto: preferencias.tamano_texto,
      zoom_pantalla: preferencias.zoom_pantalla,
      created_at: preferencias.created_at,
      updated_at: preferencias.updated_at,
    };

    return NextResponse.json(preferenciasFormateadas);
  } catch (error) {
    console.error("Error al obtener preferencias de accesibilidad:", error);
    return NextResponse.json(
      { error: "Error al obtener preferencias de accesibilidad" },
      { status: 500 }
    );
  }
}

// Actualizar preferencias de accesibilidad del usuario
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      usuario_id,
      contraste_desactivado,
      contraste_brillante,
      contraste_invertido,
      tamano_texto,
      zoom_pantalla,
    } = body;

    if (!usuario_id) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    // Validar rangos
    if (tamano_texto < 80 || tamano_texto > 200) {
      return NextResponse.json(
        { error: "El tamaño de texto debe estar entre 80% y 200%" },
        { status: 400 }
      );
    }

    if (zoom_pantalla < 80 || zoom_pantalla > 200) {
      return NextResponse.json(
        { error: "El zoom debe estar entre 80% y 200%" },
        { status: 400 }
      );
    }

    // Actualizar o crear preferencias
    const preferencias = await prisma.preferencias_accesibilidad.upsert({
      where: { usuario_id: BigInt(usuario_id) },
      update: {
        contraste_desactivado: contraste_desactivado ?? false,
        contraste_brillante: contraste_brillante ?? false,
        contraste_invertido: contraste_invertido ?? false,
        tamano_texto: tamano_texto ?? 100,
        zoom_pantalla: zoom_pantalla ?? 100,
        updated_at: new Date(),
      },
      create: {
        usuario_id: BigInt(usuario_id),
        contraste_desactivado: contraste_desactivado ?? false,
        contraste_brillante: contraste_brillante ?? false,
        contraste_invertido: contraste_invertido ?? false,
        tamano_texto: tamano_texto ?? 100,
        zoom_pantalla: zoom_pantalla ?? 100,
      },
    });

    // Convertir BigInt a string para JSON
    const preferenciasFormateadas = {
      id: preferencias.id.toString(),
      usuario_id: preferencias.usuario_id.toString(),
      contraste_desactivado: preferencias.contraste_desactivado,
      contraste_brillante: preferencias.contraste_brillante,
      contraste_invertido: preferencias.contraste_invertido,
      tamano_texto: preferencias.tamano_texto,
      zoom_pantalla: preferencias.zoom_pantalla,
      updated_at: preferencias.updated_at,
    };

    return NextResponse.json(preferenciasFormateadas);
  } catch (error) {
    console.error("Error al actualizar preferencias de accesibilidad:", error);
    return NextResponse.json(
      { error: "Error al actualizar preferencias de accesibilidad" },
      { status: 500 }
    );
  }
}
