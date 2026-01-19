"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminRoot() {
  const router = useRouter();

  useEffect(() => {
    // Verificar rol del usuario y redirigir apropiadamente
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      const userData = JSON.parse(usuario);
      
      // Si es admin (rol_id = 1), ir al dashboard
      if (userData.rol_id === "1") {
        router.replace("/dashboard");
      } else {
        // Si es usuario normal, ir a publicaciones
        router.replace("/publicaciones");
      }
    } else {
      // Sin sesión, redirigir al login
      router.replace("/sesion");
    }
  }, [router]);

  // Mostrar loading mientras redirige
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Redirigiendo...</p>
      </div>
    </div>
  );
}
