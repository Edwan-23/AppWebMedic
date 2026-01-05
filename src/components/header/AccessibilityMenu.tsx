"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import Switch from "../form/switch/Switch";
import { toast } from "sonner";

interface PreferenciasAccesibilidad {
  contraste_desactivado: boolean;
  contraste_brillante: boolean;
  contraste_invertido: boolean;
  tamano_texto: number;
  zoom_pantalla: number;
}

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [preferencias, setPreferencias] = useState<PreferenciasAccesibilidad>({
    contraste_desactivado: false,
    contraste_brillante: false,
    contraste_invertido: false,
    tamano_texto: 100,
    zoom_pantalla: 100,
  });

  const aplicarPreferencias = useCallback(() => {
    const root = document.documentElement;
    const body = document.body;

    // Aplicar contraste
    root.classList.remove(
      "accesibilidad-sin-color",
      "accesibilidad-brillante",
      "accesibilidad-invertido"
    );

    if (preferencias.contraste_desactivado) {
      root.classList.add("accesibilidad-sin-color");
    }
    if (preferencias.contraste_brillante) {
      root.classList.add("accesibilidad-brillante");
    }
    if (preferencias.contraste_invertido) {
      root.classList.add("accesibilidad-invertido");
    }

    // Tamaño de texto (solo aumenta el tamaño de letra)
    // variable CSS para que afecte a todos los elementos
    if (preferencias.tamano_texto !== 100) {
      root.style.setProperty('--accesibilidad-text-scale', (preferencias.tamano_texto / 100).toString());
    } else {
      root.style.removeProperty('--accesibilidad-text-scale');
    }

    // Aplicar zoom de pantalla 
    if (preferencias.zoom_pantalla !== 100) {
      body.style.transform = `scale(${preferencias.zoom_pantalla / 100})`;
      body.style.transformOrigin = 'top left';
      body.style.width = `${10000 / preferencias.zoom_pantalla}%`;
      body.style.minHeight = `${10000 / preferencias.zoom_pantalla}vh`;
    } else {
      body.style.transform = '';
      body.style.transformOrigin = '';
      body.style.width = '';
      body.style.minHeight = '';
    }
  }, [preferencias]);

  useEffect(() => {
    cargarPreferencias();
  }, []);

  useEffect(() => {
    aplicarPreferencias();
  }, [preferencias, aplicarPreferencias]);

  const cargarPreferencias = async () => {
    try {
      const usuarioData = localStorage.getItem("usuario");
      if (!usuarioData) return;

      const usuario = JSON.parse(usuarioData);
      const response = await fetch(
        `/api/accesibilidad?usuario_id=${usuario.id}`
      );

      if (response.ok) {
        const data = await response.json();
        setPreferencias({
          contraste_desactivado: data.contraste_desactivado,
          contraste_brillante: data.contraste_brillante,
          contraste_invertido: data.contraste_invertido,
          tamano_texto: data.tamano_texto,
          zoom_pantalla: data.zoom_pantalla,
        });
      }
    } catch (error) {
      console.error("Error al cargar preferencias:", error);
    }
  };

  const guardarPreferencias = async (nuevasPreferencias: PreferenciasAccesibilidad) => {
    try {
      const usuarioData = localStorage.getItem("usuario");
      if (!usuarioData) return;

      const usuario = JSON.parse(usuarioData);
      const response = await fetch("/api/accesibilidad", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario.id,
          ...nuevasPreferencias,
        }),
      });

      if (response.ok) {
        toast.success("Preferencias de accesibilidad guardadas");
      } else {
        toast.error("Error al guardar preferencias");
      }
    } catch (error) {
      console.error("Error al guardar preferencias:", error);
      toast.error("Error al guardar preferencias");
    }
  };

  const handleContrasteChange = async (
    tipo: 'contraste_desactivado' | 'contraste_brillante' | 'contraste_invertido',
    valor: boolean
  ) => {
    const nuevasPreferencias = { ...preferencias };

    // Solo permitir uno activo a la vez
    if (valor) {
      nuevasPreferencias.contraste_desactivado = false;
      nuevasPreferencias.contraste_brillante = false;
      nuevasPreferencias.contraste_invertido = false;
    }

    nuevasPreferencias[tipo] = valor;
    setPreferencias(nuevasPreferencias);
    await guardarPreferencias(nuevasPreferencias);
  };

  const handleTamanoTexto = async (incremento: number) => {
    const nuevoTamano = Math.max(80, Math.min(200, preferencias.tamano_texto + incremento));
    const nuevasPreferencias = { ...preferencias, tamano_texto: nuevoTamano };
    setPreferencias(nuevasPreferencias);
    await guardarPreferencias(nuevasPreferencias);
  };

  const handleZoomPantalla = async (incremento: number) => {
    const nuevoZoom = Math.max(80, Math.min(200, preferencias.zoom_pantalla + incremento));
    const nuevasPreferencias = { ...preferencias, zoom_pantalla: nuevoZoom };
    setPreferencias(nuevasPreferencias);
    await guardarPreferencias(nuevasPreferencias);
  };

  const restablecerAjustes = async () => {
    const preferenciasDefault: PreferenciasAccesibilidad = {
      contraste_desactivado: false,
      contraste_brillante: false,
      contraste_invertido: false,
      tamano_texto: 100,
      zoom_pantalla: 100,
    };
    setPreferencias(preferenciasDefault);
    await guardarPreferencias(preferenciasDefault);
    toast.success("Ajustes de accesibilidad restablecidos");
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Configuración de Accesibilidad"
      >
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9H15V22H13V16H11V22H9V9H3V7H21V9Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed left-4 right-4 top-18 flex w-auto flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-[20px] sm:w-[380px]"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Accesibilidad
          </h5>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-96 custom-scrollbar">
          {/* Contraste de Color */}
          <div>
            <h6 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Contraste de Color
            </h6>
            <div className="space-y-3">
              <Switch
                key={`sin-color-${preferencias.contraste_desactivado}`}
                label="Pantalla sin color"
                checked={preferencias.contraste_desactivado}
                onChange={(checked) => handleContrasteChange("contraste_desactivado", checked)}
              />
              <Switch
                key={`brillante-${preferencias.contraste_brillante}`}
                label="Contraste brillante"
                checked={preferencias.contraste_brillante}
                onChange={(checked) => handleContrasteChange("contraste_brillante", checked)}
              />
              <Switch
                key={`invertido-${preferencias.contraste_invertido}`}
                label="Contraste invertido"
                checked={preferencias.contraste_invertido}
                onChange={(checked) => handleContrasteChange("contraste_invertido", checked)}
              />
            </div>
          </div>

          {/* Tamaño del Texto */}
          <div>
            <h6 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Tamaño del Texto
            </h6>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleTamanoTexto(-10)}
                disabled={preferencias.tamano_texto <= 80}
                className="flex items-center justify-center w-10 h-10 text-gray-700 transition border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 10H16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <div className="flex-1 text-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {preferencias.tamano_texto}%
                </span>
              </div>
              <button
                onClick={() => handleTamanoTexto(10)}
                disabled={preferencias.tamano_texto >= 200}
                className="flex items-center justify-center w-10 h-10 text-gray-700 transition border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 4V16M4 10H16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Ampliar Pantalla */}
          <div>
            <h6 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Ampliar Pantalla
            </h6>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleZoomPantalla(-10)}
                disabled={preferencias.zoom_pantalla <= 80}
                className="flex items-center justify-center w-10 h-10 text-gray-700 transition border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="9"
                    cy="9"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M13 13L17 17"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7 9H11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <div className="flex-1 text-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {preferencias.zoom_pantalla}%
                </span>
              </div>
              <button
                onClick={() => handleZoomPantalla(10)}
                disabled={preferencias.zoom_pantalla >= 200}
                className="flex items-center justify-center w-10 h-10 text-gray-700 transition border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="9"
                    cy="9"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M13 13L17 17"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 7V11M7 9H11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Botón Restablecer */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={restablecerAjustes}
              className="w-full px-4 py-2.5 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600"
            >
              Restablecer ajustes
            </button>
          </div>
        </div>
      </Dropdown>
    </div>
  );
}
