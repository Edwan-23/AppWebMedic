"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import AccessibilityMenu from "@/components/header/AccessibilityMenu";
import { useSidebar } from "@/context/SidebarContext";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

interface Usuario {
  hospitales?: {
    nombre: string;
  };
}

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [nombreHospital, setNombreHospital] = useState<string>("");

  const { isMobileOpen, isExpanded, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      const usuario: Usuario = JSON.parse(usuarioData);
      setNombreHospital((usuario.hospitales?.nombre || "Sistema Hospitalario").toUpperCase());
    }

    // Detectar si es desktop
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex items-center justify-between w-full gap-4 px-3 py-3 lg:px-6 lg:py-4">
        {/* Botón - visible en el lado izquierdo */}
        <button
          className="flex items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
          onClick={handleToggle}
          aria-label="Toggle Sidebar"
          title={
            isDesktop 
              ? (isExpanded ? "Contraer" : "Expandir")
              : (isMobileOpen ? "Cerrar menú" : "Abrir menú")
          }
        >
            {/* MOBILE: Mostrar X si está abierto, Logo si está cerrado */}
            {!isDesktop && isMobileOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : !isDesktop ? (
              // Mobile - Logo (menú cerrado)
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3 7C3 6.44772 3.44772 6 4 6H20C20.5523 6 21 6.44772 21 7C21 7.55228 20.5523 8 20 8H4C3.44772 8 3 7.55228 3 7ZM3 12C3 11.4477 3.44772 11 4 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H4C3.44772 13 3 12.5523 3 12ZM4 16C3.44772 16 3 16.4477 3 17C3 17.5523 3.44772 18 4 18H20C20.5523 18 21 17.5523 21 17C21 16.4477 20.5523 16 20 16H4Z"
                  fill="currentColor"
                />
              </svg>
            ) : isExpanded ? (
              // Desktop - Expandido: Mostrar icono de "colapsar/anclar a la izquierda"
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 3C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5ZM5 5H9V19H5V5ZM11 7H18V9H11V7ZM11 11H18V13H11V11ZM11 15H18V17H11V15Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              // Desktop - Colapsado: Mostrar icono de "expandir/desanclar"
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 3C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5ZM5 5H9V19H5V5ZM11 5H19V19H11V5Z"
                  fill="currentColor"
                  opacity="0.4"
                />
                <path
                  d="M13 11L16 12L13 13V11Z"
                  fill="currentColor"
                />
                <circle cx="15.5" cy="12" r="0.5" fill="currentColor"/>
                <circle cx="17" cy="12" r="0.5" fill="currentColor"/>
              </svg>
            )}
        </button>

        {/* Nombre del hospital - solo desktop en el centro */}
        <div className="flex-1 hidden text-center lg:block">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {nombreHospital}
          </h2>
        </div>

        {/* Opciones siempre visibles - accesibilidad, notificaciones, usuario */}
        <div className="flex items-center gap-2 2xsm:gap-3">
          {/* <!-- Modo oscuro --> */}
          <ThemeToggleButton /> 
          {/* <!-- Menú de accesibilidad --> */}
          <AccessibilityMenu />
          {/* <!-- Botón de calendario --> */}
          <Link
            href="/calendario"
            className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            title="Calendario"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </Link>

          <NotificationDropdown /> 
          {/* <!-- Area menu de notificaciones --> */}
          
          {/* <!-- Area del Usuario --> */}
          <UserDropdown /> 
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
