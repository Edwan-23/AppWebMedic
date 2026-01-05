import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Obtener la cookie de sesión
    const sesionCookie = request.cookies.get('sesion_usuario');

    if (!sesionCookie || !sesionCookie.value) {
      return NextResponse.json(
        { mensaje: "No hay sesión activa", usuario: null },
        { status: 200 }
      );
    }

    // Parsear los datos del usuario
    const usuario = JSON.parse(sesionCookie.value);

    return NextResponse.json(
      {
        mensaje: "Sesión activa encontrada",
        usuario: usuario
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error al verificar sesión:", error);
    return NextResponse.json(
      { mensaje: "Error al verificar sesión", usuario: null },
      { status: 500 }
    );
  }
}
