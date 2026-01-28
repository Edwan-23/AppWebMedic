"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

interface TarjetaDonacionProps {
  donacion: any;
  usuario: any;
  formatearFecha: (fecha: string) => string;
  calcularTiempoRestante: (fecha: string) => { texto: string; color: string; bgColor: string };
  abrirModalEditar?: (donacion: any) => void;
  handleSolicitar: (donacion: any) => void;
  copiarAlPortapapeles: (texto: string, label: string) => void;
}

export default function TarjetaDonacion({
  donacion,
  usuario,
  formatearFecha,
  calcularTiempoRestante,
  abrirModalEditar,
  handleSolicitar,
  copiarAlPortapapeles
}: TarjetaDonacionProps) {
  const [detallesMedicamentoVisible, setDetallesMedicamentoVisible] = useState(false);
  const [descripcionCompleta, setDescripcionCompleta] = useState(false);
  const [hospitalVisible, setHospitalVisible] = useState(false);

  // Función para obtener colores del tipo de donación
  const obtenerColorTipoDonacion = (tipoNombre: string): { bg: string; text: string } => {
    switch (tipoNombre) {
      case "Donación":
        return { 
          bg: "bg-purple-50 dark:bg-purple-900/20", 
          text: "text-purple-600 dark:text-purple-400" 
        };
      case "Excedente":
        return { 
          bg: "bg-blue-50 dark:bg-blue-900/20", 
          text: "text-blue-600 dark:text-blue-400" 
        };
      default:
        return { 
          bg: "bg-gray-50 dark:bg-gray-800", 
          text: "text-gray-600 dark:text-gray-400" 
        };
    }
  };

  const coloresTipo = obtenerColorTipoDonacion(donacion.tipo_donacion?.nombre || "Donación");
  
  // Verificar si la descripción necesita botón "ver más"
  const descripcionLarga = donacion.descripcion && donacion.descripcion.length > 100;
  const descripcionMostrar = descripcionCompleta || !descripcionLarga 
    ? donacion.descripcion 
    : donacion.descripcion?.substring(0, 100) + "...";

  // Determinar si el usuario puede solicitar esta donación
  const puedeEditar = Number(usuario?.hospital_id) === Number(donacion.hospitales?.id);
  const puedeSolicitar = !puedeEditar && donacion.estado_donacion?.nombre === "Disponible";

  return (
    <div className="overflow-hidden transition-shadow border border-gray-200 rounded-2xl dark:border-gray-800 hover:shadow-lg bg-white dark:bg-gray-900">
      {/* Contenedor principal */}
      <div className="p-6">
        {/* Layout: Contenido principal a la izquierda, indicativos a la derecha */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* CONTENIDO PRINCIPAL (IZQUIERDA) */}
          <div className="flex-1 min-w-0">
            {/* Imagen y Nombre del medicamento */}
            <div className="flex gap-4 mb-4">
              {/* Imagen */}
              {donacion.imagen_principio_activo && (
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 overflow-hidden border-2 border-gray-200 rounded-lg aspect-square dark:border-gray-700">
                    <Image
                      src={donacion.imagen_principio_activo}
                      alt={donacion.principioactivo || "Medicamento"}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              )}
              
              {/* Nombre del medicamento + Cantidad */}
              <div className="flex-1 min-w-0">
                <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
                  {donacion.principioactivo} - {donacion.cantidadcum} {donacion.unidadmedida}
                </h3>
              </div>
            </div>

            {/* Detalles con iconos (4 campos) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {/* Titular */}
              {donacion.titular && (
                <div className="flex items-start gap-2">
                  <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Titular</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{donacion.titular}</p>
                  </div>
                </div>
              )}
              
              {/* Forma Farmacéutica */}
              {donacion.formafarmaceutica && (
                <div className="flex items-start gap-2">
                  <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Forma Farmacéutica</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{donacion.formafarmaceutica}</p>
                  </div>
                </div>
              )}
              
              {/* Fecha de Fabricación */}
              {donacion.fecha_fabricacion && (
                <div className="flex items-start gap-2">
                  <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de Fabricación</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{formatearFecha(donacion.fecha_fabricacion)}</p>
                  </div>
                </div>
              )}
              
              {/* Fecha de Expiración */}
              {donacion.fecha_expiracion && (
                <div className="flex items-start gap-2">
                  <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de Expiración</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{formatearFecha(donacion.fecha_expiracion)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Línea divisoria con botón "ver más" para detalles del medicamento */}
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
              <button
                onClick={() => setDetallesMedicamentoVisible(!detallesMedicamentoVisible)}
                className="text-xs text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors px-2"
              >
                {detallesMedicamentoVisible ? "ver menos" : "ver más"}
              </button>
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
            </div>

            {/* Panel desplegable: Detalles adicionales del medicamento */}
            {detallesMedicamentoVisible && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {donacion.reg_invima && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Registro INVIMA</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{donacion.reg_invima}</p>
                    </div>
                  )}
                  {donacion.lote && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Lote</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{donacion.lote}</p>
                    </div>
                  )}
                  {donacion.cum && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">CUM</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{donacion.cum}</p>
                    </div>
                  )}
                  {donacion.descripcioncomercial && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Descripción Comercial</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{donacion.descripcioncomercial}</p>
                    </div>
                  )}
                </div>
                
                {/* Imágenes adicionales */}
                <div className="mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Documentación</p>
                  <div className="grid grid-cols-2 gap-2">
                    {donacion.imagen_invima && (
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">INVIMA</p>
                        <div className="relative w-full h-32 overflow-hidden border border-gray-200 rounded-lg dark:border-gray-700">
                          <Image
                            src={donacion.imagen_invima}
                            alt="Registro INVIMA"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                    {donacion.imagen_lote_vencimiento && (
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Lote y Vencimiento</p>
                        <div className="relative w-full h-32 overflow-hidden border border-gray-200 rounded-lg dark:border-gray-700">
                          <Image
                            src={donacion.imagen_lote_vencimiento}
                            alt="Lote y Vencimiento"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Cantidad a donar */}
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Cantidad a donar
              </h4>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-primary">
                  {donacion.cantidad}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {donacion.unidad_dispensacion?.nombre || "unidades"}
                </span>
              </div>
              
              {/* Descripción/Observaciones con límite de 100 caracteres */}
              {donacion.descripcion && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {descripcionMostrar}
                  </p>
                  {descripcionLarga && (
                    <button
                      onClick={() => setDescripcionCompleta(!descripcionCompleta)}
                      className="text-xs text-primary hover:underline mt-1"
                    >
                      {descripcionCompleta ? "ver menos" : "ver más"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* INDICATIVOS (DERECHA EN DESKTOP, ABAJO EN MÓVIL) */}
          <div className="lg:w-64 flex flex-col gap-3 lg:border-l lg:border-gray-200 lg:dark:border-gray-700 lg:pl-6">
            {/* Tags: Tipo de donación + Tiempo restante */}
            <div className="flex lg:flex-col flex-row flex-wrap gap-2">
              {/* Tipo de donación con color dinámico */}
              <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ${coloresTipo.bg} ${coloresTipo.text}`}>
                {donacion.tipo_donacion?.nombre || "Donación"}
              </span>
              
              {/* Tiempo restante de caducidad */}
              {(() => {
                const tiempoRestante = calcularTiempoRestante(donacion.fecha_expiracion);
                return (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${tiempoRestante.bgColor} ${tiempoRestante.color}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tiempoRestante.texto}
                  </span>
                );
              })()}
            </div>

            {/* Fecha de publicación */}
            {donacion.created_at && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">Publicado el {formatearFecha(donacion.created_at)}</span>
              </div>
            )}

            {/* Estado */}
            <div>
              <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${
                donacion.estado_donacion?.nombre === "Disponible"
                  ? "bg-success-50 text-success-600 dark:bg-success-900/20"
                  : donacion.estado_donacion?.nombre === "Solicitado"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                    : donacion.estado_donacion?.nombre === "Concretado"
                      ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20"
                      : donacion.estado_donacion?.nombre === "Cancelado"
                        ? "bg-error-50 text-error-600 dark:bg-error-900/20"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800"
              }`}>
                {donacion.estado_donacion?.nombre || "Sin estado"}
              </span>
            </div>

            {/* Botones de acción */}
            <div className="flex lg:flex-col gap-2 mt-auto lg:pt-4">
              {/* Botón Solicitar o Editar */}
              {puedeEditar && abrirModalEditar ? (
                <button
                  onClick={() => abrirModalEditar(donacion)}
                  className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
              ) : puedeSolicitar ? (
                <button
                  onClick={() => handleSolicitar(donacion)}
                  className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-success-500 hover:bg-success-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Solicitar
                </button>
              ) : null}

              {/* Botón Hospital */}
              <button
                onClick={() => setHospitalVisible(!hospitalVisible)}
                className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                title="Datos del hospital"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="hidden lg:inline">{hospitalVisible ? "Ocultar" : "Hospital"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Panel desplegable: DATOS DEL HOSPITAL */}
      {hospitalVisible && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">
            Información del Hospital
          </h4>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {/* Nombre del hospital */}
            {donacion.hospitales?.nombre && (
              <div className="flex items-start gap-2">
                <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Hospital</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {donacion.hospitales.nombre}
                  </p>
                </div>
              </div>
            )}

            {/* Ubicación */}
            {donacion.hospitales?.municipios?.nombre && (
              <div className="flex items-start gap-2">
                <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ubicación</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {donacion.hospitales.municipios.nombre}
                  </p>
                </div>
              </div>
            )}

            {/* Dirección con copiar */}
            {donacion.hospitales?.direccion && (
              <div className="flex items-start gap-2">
                <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Dirección</p>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {donacion.hospitales.direccion}
                    </p>
                    <button
                      onClick={() => copiarAlPortapapeles(donacion.hospitales.direccion, "Dirección")}
                      className="flex-shrink-0 p-1 text-gray-400 transition-colors hover:text-primary"
                      title="Copiar dirección"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Teléfono con copiar */}
            {donacion.hospitales?.telefono && (
              <div className="flex items-start gap-2">
                <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {donacion.hospitales.telefono}
                    </p>
                    <button
                      onClick={() => copiarAlPortapapeles(donacion.hospitales.telefono, "Teléfono")}
                      className="flex-shrink-0 p-1 text-gray-400 transition-colors hover:text-primary"
                      title="Copiar teléfono"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Email con copiar */}
            {donacion.hospitales?.email && (
              <div className="flex items-start gap-2">
                <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {donacion.hospitales.email}
                    </p>
                    <button
                      onClick={() => copiarAlPortapapeles(donacion.hospitales.email, "Email")}
                      className="flex-shrink-0 p-1 text-gray-400 transition-colors hover:text-primary"
                      title="Copiar email"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
