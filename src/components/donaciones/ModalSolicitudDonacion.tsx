"use client";

import { useState } from "react";
import Image from "next/image";

interface ModalSolicitudDonacionProps {
  donacion: any;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function ModalSolicitudDonacion({
  donacion,
  onClose,
  onConfirm,
  loading
}: ModalSolicitudDonacionProps) {
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Confirmar Solicitud de Donación</h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Información de la donación */}
          <div className="space-y-4">
            <div className="flex gap-4">
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
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {donacion.principioactivo}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {donacion.cantidadcum} {donacion.unidadmedida}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Hospital Donante</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {donacion.hospitales?.nombre}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tipo de Donación</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {donacion.tipo_donacion?.nombre || "Donación"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cantidad Disponible</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {donacion.cantidad} {donacion.unidad_dispensacion?.nombre || "unidades"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de Expiración</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {formatearFecha(donacion.fecha_expiracion)}
                  </p>
                </div>
              </div>

              {donacion.descripcion && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Observaciones</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {donacion.descripcion}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Mensaje de confirmación */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex gap-3">
              <svg
                className="flex-shrink-0 w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-semibold">Información importante</p>
                <p className="mt-1">
                  Al confirmar la solicitud, el hospital donante será notificado y podrá procesar tu petición. 
                  Te notificaremos cuando haya una respuesta.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirmar Solicitud
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
