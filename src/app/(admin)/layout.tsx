"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);

  // Verificar autenticación de forma sincrónica
  useEffect(() => {
    const verificarAuth = async () => {
      try {
        // Verificar cookie del servidor
        const response = await fetch('/api/auth/verificar-sesion');
        const data = await response.json();
        
        if (!data.usuario) {
          // No hay sesión, redirigir sin renderizar
          router.replace("/sesion");
          return;
        }
        
        // Guardar en localStorage si no existe
        const usuarioLocal = localStorage.getItem("usuario");
        if (!usuarioLocal) {
          localStorage.setItem("usuario", JSON.stringify(data.usuario));
        }
        
        // Sesión válida, permitir renderizado
        setVerificando(false);
      } catch (error) {
        console.error("Error verificando sesión:", error);
        router.replace("/sesion");
      }
    };

    verificarAuth();
  }, [router]);

  // No renderizar nada mientras se verifica
  if (verificando) {
    return null;
  }

  // Clase dinámica para el margen del contenido principal basado en el estado de la barra lateral
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[250px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      {/* Barra lateral y fondo */}
      <AppSidebar />
      <Backdrop />
      {/* Área de contenido principal */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Encabezado */}
        <AppHeader />
        {/* Contenido de la página */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}
