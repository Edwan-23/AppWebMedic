"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

interface TarjetaPublicacionProps {
  pub: any;
  usuario: any;
  formatearFecha: (fecha: string) => string;
  calcularTiempoRestante: (fecha: string) => { texto: string; color: string; bgColor: string };
  abrirModalEditar: (pub: any) => void;
  handleSolicitar: (pub: any) => void;
  copiarAlPortapapeles: (texto: string, label: string) => void;
}

export default function TarjetaPublicacion({
  pub,
  usuario,
  formatearFecha,
  calcularTiempoRestante,
  abrirModalEditar,
  handleSolicitar,
  copiarAlPortapapeles
}: TarjetaPublicacionProps) {
  const [detallesVisible, setDetallesVisible] = useState(false);
  const [hospitalVisible, setHospitalVisible] = useState(false);

  // Función para obtener colores del tipo de publicación por ID
  const obtenerColorTipoPublicacion = (tipoId: number): { bg: string; text: string } => {
    switch (tipoId) {
      case 1: // Crítico
        return { 
          bg: "bg-red-50 dark:bg-red-900/20", 
          text: "text-red-600 dark:text-red-400" 
        };
      case 2: // Normal
        return { 
          bg: "bg-yellow-50 dark:bg-yellow-900/20", 
          text: "text-yellow-600 dark:text-yellow-400" 
        };
      case 3: // Óptimo
        return { 
          bg: "bg-green-50 dark:bg-green-900/20", 
          text: "text-green-600 dark:text-green-400" 
        };
      default:
        return { 
          bg: "bg-gray-50 dark:bg-gray-800", 
          text: "text-gray-600 dark:text-gray-400" 
        };
    }
  };

  const toggleDetalles = () => {
    if (!detallesVisible) {
      setHospitalVisible(false);
    }
    setDetallesVisible(!detallesVisible);
  };

  const toggleHospital = () => {
    if (!hospitalVisible) {
      setDetallesVisible(false);
    }
    setHospitalVisible(!hospitalVisible);
  };

  const coloresTipo = obtenerColorTipoPublicacion(pub.tipo_publicacion?.id || 2);

  return (
    <div className="overflow-hidden transition-shadow border border-gray-200 rounded-2xl dark:border-gray-800 hover:shadow-lg bg-white dark:bg-gray-900">
      {/* Contenedor principal */}
      <div className="p-6">
        <div className="flex gap-4">
          {/* Imagen del medicamento */}
          {pub.imagen_principio_activo && (
            <div className="flex-shrink-0">
              <div className="w-24 h-24 overflow-hidden border-2 border-gray-200 rounded-lg aspect-square dark:border-gray-700">
                <Image
                  src={pub.imagen_principio_activo}
                  alt={pub.principioactivo || "Medicamento"}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">
            {/* Nombre del medicamento + CUM */}
            <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
              {pub.principioactivo}
              {pub.cantidadcum && pub.unidadmedida && (
                <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                  ({pub.cantidadcum} {pub.unidadmedida})
                </span>
              )}
            </h3>

            {/* Detalles con iconos */}
            <div className="grid grid-cols-1 gap-2 mb-4 text-sm md:grid-cols-2">
              {pub.titular && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <svg className="flex-shrink-0 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="truncate">{pub.titular}</span>
                </div>
              )}
              {pub.formafarmaceutica && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <svg className="flex-shrink-0 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span>{pub.formafarmaceutica}</span>
                </div>
              )}
              {pub.fecha_fabricacion && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <svg className="flex-shrink-0 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Fabricación: {formatearFecha(pub.fecha_fabricacion)}
                </div>
              )}
              {pub.fecha_expiracion && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <svg className="flex-shrink-0 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Expiración: {formatearFecha(pub.fecha_expiracion)}
                </div>
              )}
            </div>

            {/* División sutil */}
            <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>

            {/* Cantidad a publicar */}
            <div className="mb-4">
              <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">Cantidad a publicar</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="flex-shrink-0 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="font-semibold">{pub.cantidad}</span> {pub.unidad_dispensacion?.nombre || "unidades"}
                </div>
                {pub.descripcion && (
                  <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                    <svg className="flex-shrink-0 w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="line-clamp-2">{pub.descripcion}</span>
                  </div>
                )}
              </div>
            </div>

            {/* División sutil */}
            <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>

            {/* Etiquetas: Tipo de publicación + Tiempo restante */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {/* Tipo de publicación con color */}
              <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${coloresTipo.bg} ${coloresTipo.text}`}>
                {pub.tipo_publicacion?.nombre}
              </span>

              {/* Tiempo restante de caducidad */}
              {(() => {
                const tiempoRestante = calcularTiempoRestante(pub.fecha_expiracion);
                return (
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 ${tiempoRestante.bgColor} ${tiempoRestante.color}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tiempoRestante.texto}
                  </span>
                );
              })()}
            </div>

            {/* Fecha de publicación */}
            {pub.created_at && (
              <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500 dark:text-gray-400">
                Publicado el {formatearFecha(pub.created_at)}
              </div>
            )}

            {/* Estado */}
            <div className="mb-4">
              <span className={`inline-block px-3 py-1.5 text-xs font-medium rounded-full ${
                pub.estado_publicacion?.nombre === "Disponible"
                  ? "bg-success-50 text-success-600 dark:bg-success-900/20"
                  : pub.estado_publicacion?.nombre === "Pendiente"
                    ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20"
                    : pub.estado_publicacion?.nombre === "Solicitado"
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                      : pub.estado_publicacion?.nombre === "Caducado"
                        ? "bg-warning-50 text-warning-600 dark:bg-warning-900/20"
                        : pub.estado_publicacion?.nombre === "Eliminado"
                          ? "bg-error-50 text-error-600 dark:bg-error-900/20"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800"
              }`}>
                {pub.estado_publicacion?.nombre}
              </span>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2">
              {/* Botón Solicitar o Editar */}
              {Number(usuario?.hospital_id) === Number(pub.hospitales?.id) ? (
                <button
                  onClick={() => abrirModalEditar(pub)}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
              ) : (
                pub.estado_publicacion?.nombre !== "Solicitado" && (
                  <button
                    onClick={() => handleSolicitar(pub)}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-success-500 hover:bg-success-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Solicitar
                  </button>
                )
              )}

              {/* Botón Detalles (más pequeño) */}
              <button
                onClick={toggleDetalles}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {detallesVisible ? "Ocultar" : "Detalles"}
              </button>

              {/* Botón Datos Hospital (con icono) */}
              <button
                onClick={toggleHospital}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                title="Datos del hospital"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {hospitalVisible ? "Ocultar" : "Hospital"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Panel desplegable de DETALLES del medicamento */}
      {detallesVisible && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">
            Información Detallada del Medicamento
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Registro INVIMA</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{pub.reg_invima}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Lote</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{pub.lote}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">CUM</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{pub.cum}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Descripción Comercial</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{pub.descripcioncomercial}</p>
            </div>
            {pub.descripcion && (
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Observaciones</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{pub.descripcion}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Panel desplegable de DATOS DEL HOSPITAL */}
      {hospitalVisible && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">
            Información del Hospital
          </h4>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {/* Nombre del hospital */}
            <div className="flex items-start gap-2">
              <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Hospital</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                  {pub.hospitales?.nombre}
                </p>
              </div>
            </div>

            {/* Ubicación */}
            {pub.hospitales?.municipios?.nombre && (
              <div className="flex items-start gap-2">
                <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ubicación</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {pub.hospitales.municipios.nombre}
                  </p>
                </div>
              </div>
            )}

            {/* Dirección con copiar */}
            {pub.hospitales?.direccion && (
              <div className="flex items-start gap-2">
                <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Dirección</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {pub.hospitales.direccion}
                    </p>
                    <button
                      onClick={() => copiarAlPortapapeles(pub.hospitales!.direccion!, "Dirección")}
                      className="flex-shrink-0 p-1 transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      title="Copiar dirección"
                    >
                      <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Celular con copiar */}
            {pub.hospitales?.celular && (
              <div className="flex items-start gap-2">
                <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Celular</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {pub.hospitales.celular}
                    </p>
                    <button
                      onClick={() => copiarAlPortapapeles(pub.hospitales!.celular!, "Celular")}
                      className="flex-shrink-0 p-1 transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      title="Copiar celular"
                    >
                      <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Teléfono con copiar */}
            {pub.hospitales?.telefono && (
              <div className="flex items-start gap-2">
                <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {pub.hospitales.telefono}
                    </p>
                    <button
                      onClick={() => copiarAlPortapapeles(pub.hospitales!.telefono!, "Teléfono")}
                      className="flex-shrink-0 p-1 transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      title="Copiar teléfono"
                    >
                      <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
