"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";

interface ModalConfirmacionSolicitudProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onConfirm: (datos: DatosSolicitud) => void;
  tipoSolicitud: "compra" | "intercambio" | "prestamo";
  publicacion: any;
  misPublicaciones?: any[]; // Para intercambios
}

export interface DatosSolicitud {
  tipo_solicitud: "compra" | "intercambio" | "prestamo";
  propuesta_descripcion: string;
  valor_propuesto?: number;
  fecha_devolucion_estimada?: string;
  // Para intercambio manual
  medicamento_intercambio?: string;
  cantidad_intercambio?: number;
}

export default function ModalConfirmacionSolicitud({
  isOpen,
  onClose,
  onBack,
  onConfirm,
  tipoSolicitud,
  publicacion,
  misPublicaciones = []
}: ModalConfirmacionSolicitudProps) {
  
  const [propuestaDescripcion, setPropuestaDescripcion] = useState("");
  const [valorPropuesto, setValorPropuesto] = useState("");
  const [medicamentoIntercambio, setMedicamentoIntercambio] = useState("");
  const [cantidadIntercambio, setCantidadIntercambio] = useState("");
  const [fechaDevolucion, setFechaDevolucion] = useState("");

  const getTituloYDescripcion = () => {
    switch (tipoSolicitud) {
      case "compra":
        return {
          titulo: "Proponer Compra",
          descripcion: "Especifique el valor que está dispuesto a pagar por este medicamento",
        };
      case "intercambio":
        return {
          titulo: "Proponer Intercambio",
          descripcion: "Especifique el medicamento y cantidad que ofrece a cambio"
        };
      case "prestamo":
        return {
          titulo: "Solicitar Préstamo",
          descripcion: "Indique cuándo realizara la devolución de la misma cantidad del medicamento",
        };
    }
  };

  const info = getTituloYDescripcion();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const datos: DatosSolicitud = {
      tipo_solicitud: tipoSolicitud,
      propuesta_descripcion: propuestaDescripcion
    };

    if (tipoSolicitud === "compra") {
      datos.valor_propuesto = parseFloat(valorPropuesto);
    } else if (tipoSolicitud === "intercambio") {
      datos.medicamento_intercambio = medicamentoIntercambio;
      datos.cantidad_intercambio = parseInt(cantidadIntercambio);
      console.log("[ModalConfirmacion] Datos intercambio:", {
        medicamento_intercambio: medicamentoIntercambio,
        cantidad_intercambio: parseInt(cantidadIntercambio),
        cantidadIntercambio_raw: cantidadIntercambio
      });
    } else if (tipoSolicitud === "prestamo") {
      datos.fecha_devolucion_estimada = fechaDevolucion;
    }

    console.log("[ModalConfirmacion] Datos completos a enviar:", datos);
    onConfirm(datos);
  };

  const getIconColor = () => {
    switch (tipoSolicitud) {
      case "compra": return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
      case "intercambio": return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";
      case "prestamo": return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20";
    }
  };

  const getIcon = () => {
    switch (tipoSolicitud) {
      case "compra":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case "intercambio":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case "prestamo":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-6">
        {/* Header con icono */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-3 rounded-xl ${getIconColor()}`}>
            {getIcon()}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {info.titulo}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {info.descripcion}
            </p>
          </div>
        </div>

        {/* Info del medicamento */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Medicamento solicitado:</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {publicacion?.principioactivo}
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Cantidad: <span className="font-medium text-gray-900 dark:text-white">{publicacion?.cantidad}</span></span>
            <span>•</span>
            <span>Hospital: <span className="font-medium text-gray-900 dark:text-white">{publicacion?.hospitales?.nombre}</span></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campos específicos según el tipo */}
          {tipoSolicitud === "compra" && (
            <div>
              <Label>Valor Propuesto (COP) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                <input
                  type="number"
                  value={valorPropuesto}
                  onChange={(e) => setValorPropuesto(e.target.value)}
                  min="1"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                />
              </div>
            </div>
          )}

          {tipoSolicitud === "intercambio" && (
            <div className="space-y-4">
              <div>
                <Label>Medicamento que Ofrece *</Label>
                <input
                  type="text"
                  value={medicamentoIntercambio}
                  onChange={(e) => setMedicamentoIntercambio(e.target.value)}
                  placeholder="Ej: Paracetamol 500mg"
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <Label>Cantidad a Ofrecer *</Label>
                <input
                  type="number"
                  value={cantidadIntercambio}
                  onChange={(e) => setCantidadIntercambio(e.target.value)}
                  placeholder="Cantidad"
                  min="1"
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {tipoSolicitud === "prestamo" && (
            <div>
              <DatePicker
                id="fecha-devolucion-prestamo"
                label="Fecha de Devolución Estimada *"
                defaultDate={fechaDevolucion || undefined}
                onChange={(selectedDates) => {
                  if (selectedDates.length > 0) {
                    const date = selectedDates[0];
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    setFechaDevolucion(`${year}-${month}-${day}`);
                  }
                }}
                placeholder="Seleccioner fecha de devolución"
                minDate="today"
              />
            </div>
          )}

          {/* Descripción de la propuesta */}
          <div>
            <Label>Describa su propuesta *</Label>
            <textarea
              value={propuestaDescripcion}
              onChange={(e) => setPropuestaDescripcion(e.target.value)}
              rows={4}
              required
              placeholder="Explique los detalles de la propuesta, términos adicionales, o información relevante..."
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 resize-none"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
               El hospital evaluará la propuesta para tomar una decisión.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
            >
              ← Volver
            </button>
            <button
              type="submit"
              disabled={
                !propuestaDescripcion.trim() ||
                (tipoSolicitud === "compra" && (!valorPropuesto || parseFloat(valorPropuesto) <= 0)) ||
                (tipoSolicitud === "intercambio" && (!medicamentoIntercambio.trim() || !cantidadIntercambio || parseInt(cantidadIntercambio) <= 0)) ||
                (tipoSolicitud === "prestamo" && !fechaDevolucion)
              }
              className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:ring-4 focus:ring-brand-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar Solicitud
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
