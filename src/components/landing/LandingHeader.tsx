"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo/auth-logo2 (2).svg"
              alt="Logo"
              width={180}
              height={40}
              className="h-8 lg:h-20 w-auto"
            />
          </Link>

          {/* Navegación escritorio */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("nosotros")}
              className="text-sm font-medium text-gray-700 hover:text-brand-500 dark:text-gray-300 dark:hover:text-brand-400 transition"
            >
              Nosotros
            </button>
            <button
              onClick={() => scrollToSection("servicios")}
              className="text-sm font-medium text-gray-700 hover:text-brand-500 dark:text-gray-300 dark:hover:text-brand-400 transition"
            >
              Servicios
            </button>
            <button
              onClick={() => scrollToSection("objetivos")}
              className="text-sm font-medium text-gray-700 hover:text-brand-500 dark:text-gray-300 dark:hover:text-brand-400 transition"
            >
              Objetivos
            </button>
          </nav>

          {/* Botones escritorio */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              href="/sesion"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-brand-500 dark:text-gray-300 dark:hover:text-brand-400 transition"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="px-6 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition shadow-theme-xs"
            >
              Registrarse
            </Link>
          </div>

          {/* Botón menú móvil */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 dark:text-gray-300"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection("nosotros")}
                className="text-left px-4 py-2 text-sm font-medium text-gray-700 hover:text-brand-500 dark:text-gray-300 dark:hover:text-brand-400 transition"
              >
                Nosotros
              </button>
              <button
                onClick={() => scrollToSection("servicios")}
                className="text-left px-4 py-2 text-sm font-medium text-gray-700 hover:text-brand-500 dark:text-gray-300 dark:hover:text-brand-400 transition"
              >
                Servicios
              </button>
              <button
                onClick={() => scrollToSection("objetivos")}
                className="text-left px-4 py-2 text-sm font-medium text-gray-700 hover:text-brand-500 dark:text-gray-300 dark:hover:text-brand-400 transition"
              >
                Objetivos
              </button>
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/sesion"
                  className="px-4 py-2.5 text-sm font-medium text-center text-gray-700 hover:text-brand-500 dark:text-gray-300 dark:hover:text-brand-400 transition border border-gray-300 dark:border-gray-700 rounded-lg"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  className="px-4 py-2.5 text-sm font-medium text-center text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition shadow-theme-xs"
                >
                  Registrarse
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
