"use client";

import { Modal } from "@/components/ui/modal";

interface ModalTipoSolicitudProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTipo: (tipo: "compra" | "intercambio" | "prestamo") => void;
  publicacion: any;
  solicitudesRealizadas?: number;
  limiteMaximo?: number;
}

export default function ModalTipoSolicitud({
  isOpen,
  onClose,
  onSelectTipo,
  publicacion,
  solicitudesRealizadas = 0,
  limiteMaximo = 3
}: ModalTipoSolicitudProps) {
  
  const tiposSolicitud = [
    {
      tipo: "compra" as const,
      titulo: "Comprar",
      descripcion: "Adquiere este medicamento mediante una acuerdo monetario",
      icono: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:border-green-800",
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      tipo: "intercambio" as const,
      titulo: "Intercambiar",
      descripcion: "Gestione uno de sus medicamentos por el publicado.",
      icono: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:border-blue-800",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      tipo: "prestamo" as const,
      titulo: "Préstamo",
      descripcion: "Solicite este medicamento en préstamo temporal",
      icono: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:border-orange-800",
      iconColor: "text-orange-600 dark:text-orange-400"
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ¿Cómo desea obtener este medicamento?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Selecciona el tipo de solicitud que deseas realizar para{" "}
          <span className="font-semibold">{publicacion?.principioactivo}</span>
        </p>

        {/* Contador de solicitudes */}
        <div className={`rounded-lg p-4 mb-6 border-2 ${
          solicitudesRealizadas >= limiteMaximo - 1
            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            : solicitudesRealizadas >= limiteMaximo - 2
            ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
            : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              solicitudesRealizadas >= limiteMaximo - 1
                ? "bg-red-100 dark:bg-red-900/30"
                : solicitudesRealizadas >= limiteMaximo - 2
                ? "bg-yellow-100 dark:bg-yellow-900/30"
                : "bg-blue-100 dark:bg-blue-900/30"
            }`}>
              <svg className={`w-5 h-5 ${
                solicitudesRealizadas >= limiteMaximo - 1
                  ? "text-red-600 dark:text-red-400"
                  : solicitudesRealizadas >= limiteMaximo - 2
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-blue-600 dark:text-blue-400"
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${
                solicitudesRealizadas >= limiteMaximo - 1
                  ? "text-red-800 dark:text-red-300"
                  : solicitudesRealizadas >= limiteMaximo - 2
                  ? "text-yellow-800 dark:text-yellow-300"
                  : "text-blue-800 dark:text-blue-300"
              }`}>
                Solicitudes disponibles: {limiteMaximo - solicitudesRealizadas} de {limiteMaximo}
              </p>
              <p className={`text-xs mt-1 ${
                solicitudesRealizadas >= limiteMaximo - 1
                  ? "text-red-700 dark:text-red-400"
                  : solicitudesRealizadas >= limiteMaximo - 2
                  ? "text-yellow-700 dark:text-yellow-400"
                  : "text-blue-700 dark:text-blue-400"
              }`}>
                {solicitudesRealizadas >= limiteMaximo - 1
                  ? "¡Última oportunidad! Después de esta solicitud no podrá hacer más solicitudes a este medicamento."
                  : solicitudesRealizadas >= limiteMaximo - 2
                  ? "Le quedan pocas solicitudes disponibles para este medicamento. Use sus oportunidades sabiamente."
                  : `Puede realizar hasta ${limiteMaximo - solicitudesRealizadas} solicitudes más para este medicamento (compra, intercambio o préstamo).`
                }
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiposSolicitud.map((item) => (
            <button
              key={item.tipo}
              onClick={() => onSelectTipo(item.tipo)}
              className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all ${item.color}`}
            >
              <div className={`mb-4 ${item.iconColor}`}>
                {item.icono}
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {item.titulo}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {item.descripcion}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}
