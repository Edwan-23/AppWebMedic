import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas | no requieren autenticación
  const rutasPublicas = ['/sesion', '/registro', '/terminos-condiciones', '/politicas-privacidad'];
  
  // Verificar si la ruta actual es pública
  const esRutaPublica = rutasPublicas.some(ruta => pathname.startsWith(ruta));

  // Si es ruta pública, permitir acceso
  if (esRutaPublica) {
    return NextResponse.next();
  }

  // Verificar si hay cookie de sesión
  const sesionCookie = request.cookies.get('sesion_usuario');

  // Si no hay sesión y no es ruta pública, redirigir a login
  if (!sesionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/sesion';
    return NextResponse.redirect(url);
  }

  // Si hay sesión, permitir acceso
  return NextResponse.next();
}

// Rutas a proteger el middleware
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - api (rutas API)
     * - _next/static
     * - _next/image 
     * - favicon.ico
     * - public
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*|$).*)',
  ],
};
