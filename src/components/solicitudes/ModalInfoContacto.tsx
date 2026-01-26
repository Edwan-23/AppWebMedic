"use client";

import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";

interface Hospital {
  nombre: string;
  direccion?: string;
  celular?: string;
  telefono?: string;
  correo?: string;
  municipios?: { nombre: string };
}

interface ModalInfoContactoProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalDestino?: Hospital;
  medicamentoNombre?: string;
  cantidad?: number;
  esHospitalOrigen?: boolean; 
}

export default function ModalInfoContacto({
  isOpen,
  onClose,
  hospitalDestino,
  medicamentoNombre,
  cantidad,
  esHospitalOrigen = false
}: ModalInfoContactoProps) {
  
  const copiarAlPortapapeles = async (texto: string, tipo: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success(`${tipo} copiado`, {
        description: `${texto} copiado al portapapeles`
      });
    } catch (error) {
      toast.error("Error al copiar");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {esHospitalOrigen ? "Información del Hospital Solicitante" : "Envío Estándar Seleccionado"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {esHospitalOrigen 
                  ? "Datos de contacto del hospital que solicitó el medicamento"
                  : "Información de contacto para coordinar la entrega"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Información del medicamento */}
        {!esHospitalOrigen && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Medicamento aprobado
            </h3>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-200">
              {medicamentoNombre}
            </p>
            {cantidad && (
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Cantidad: {cantidad} unidades
              </p>
            )}
          </div>
        )}

        {/* Información del hospital */}
        {hospitalDestino && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Datos de contacto del hospital
            </h3>

            {/* Hospital */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hospital</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {hospitalDestino.nombre}
                  </p>
                </div>
              </div>

              {/* Dirección */}
              {hospitalDestino.direccion && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Dirección</p>
                    <p className="text-base text-gray-900 dark:text-white">
                      {hospitalDestino.direccion}
                      {hospitalDestino.municipios && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {' • '}{hospitalDestino.municipios.nombre}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Teléfonos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hospitalDestino.celular && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Celular</p>
                      <button
                        onClick={() => copiarAlPortapapeles(hospitalDestino.celular!, 'Celular')}
                        className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {hospitalDestino.celular}
                      </button>
                    </div>
                  </div>
                )}

                {hospitalDestino.telefono && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                      <button
                        onClick={() => copiarAlPortapapeles(hospitalDestino.telefono!, 'Teléfono')}
                        className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {hospitalDestino.telefono}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Correo */}
              {hospitalDestino.correo && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Correo electrónico</p>
                    <button
                      onClick={() => copiarAlPortapapeles(hospitalDestino.correo!, 'Correo')}
                      className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {hospitalDestino.correo}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Instrucciones */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                    Próximos pasos
                  </h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1 list-disc list-inside">
                    <li>Contacta al hospital usando la información proporcionada</li>
                    <li>Coordina fecha y hora de entrega</li>
                    <li>Acuerda el método de transporte</li>
                    <li>Confirma la recepción del medicamento</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botón de cerrar */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </Modal>
  );
}
