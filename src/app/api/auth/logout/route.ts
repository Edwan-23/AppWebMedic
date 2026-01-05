import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { mensaje: "Sesión cerrada exitosamente" },
      { status: 200 }
    );

    // Eliminar la cookie de sesión
    response.cookies.delete('sesion_usuario');

    return response;

  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}
