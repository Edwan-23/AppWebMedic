"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";

interface Hospital {
    nombre: string;
    direccion?: string;
    celular?: string;
    telefono?: string;
    correo?: string;
    municipios?: { nombre: string };
}

interface ModalSeleccionEnvioProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (tipoEnvio: "estandar" | "prioritario") => void;
    hospitalDestino?: Hospital;
    medicamentoNombre?: string;
}

export default function ModalSeleccionEnvio({
    isOpen,
    onClose,
    onConfirm,
    hospitalDestino,
    medicamentoNombre
}: ModalSeleccionEnvioProps) {
    const [seleccionado, setSeleccionado] = useState<"estandar" | "prioritario" | null>(null);

    const handleConfirmar = () => {
        if (seleccionado) {
            onConfirm(seleccionado);
        }
    };

    const handleClose = () => {
        setSeleccionado(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-4xl">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Selecciona el Tipo de Envío
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tu solicitud para <span className="font-semibold">{medicamentoNombre}</span> ha sido aprobada.
                        <br />
                        Ahora elige cómo deseas recibir el medicamento.
                    </p>
                </div>

                {/* Opciones de envío */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Envío Estándar */}
                    <div
                        onClick={() => setSeleccionado("estandar")}
                        className={`border-2 rounded-lg p-6 transition-all cursor-pointer bg-white dark:bg-gray-800 ${
                            seleccionado === "estandar"
                                ? "border-blue-500 dark:border-blue-500 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800"
                                : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
                        }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg transition-colors ${
                                seleccionado === "estandar"
                                    ? "bg-blue-500"
                                    : "bg-blue-100 dark:bg-blue-900/30"
                            }`}>
                                <svg className={`w-8 h-8 transition-colors ${
                                    seleccionado === "estandar"
                                        ? "text-white"
                                        : "text-blue-600 dark:text-blue-400"
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                                    seleccionado === "estandar"
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-gray-900 dark:text-white"
                                }`}>
                                    Envío Estándar
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    Coordinación directa entre hospitales. Sin costo adicional.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Plazo de entrega largo</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Sin costo adicional</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Acuerdo mutuo</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Verás la información de contacto del hospital para coordinar la entrega.
                            </p>
                        </div>
                    </div>

                    {/* Envío Prioritario */}
                    <div
                        onClick={() => setSeleccionado("prioritario")}
                        className={`border-2 rounded-lg p-6 transition-all cursor-pointer bg-white dark:bg-gray-800 relative overflow-hidden ${
                            seleccionado === "prioritario"
                                ? "border-orange-500 dark:border-orange-500 shadow-lg ring-2 ring-orange-200 dark:ring-orange-800"
                                : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md"
                        }`}
                    >
                        {/* Badge recomendado */}
                        <div className="absolute top-4 right-4">
                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded">
                                Recomendado
                            </span>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg transition-colors ${
                                seleccionado === "prioritario"
                                    ? "bg-orange-500"
                                    : "bg-orange-100 dark:bg-orange-900/30"
                            }`}>
                                <svg className={`w-8 h-8 transition-colors ${
                                    seleccionado === "prioritario"
                                        ? "text-white"
                                        : "text-orange-600 dark:text-orange-400"
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                                    seleccionado === "prioritario"
                                        ? "text-orange-600 dark:text-orange-400"
                                        : "text-gray-900 dark:text-white"
                                }`}>
                                    Envío Prioritario
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    Entrega rápida con seguimiento en tiempo real.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Seguimiento en tiempo real</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Entrega garantizada</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Barra de progreso del envío</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>PIN de seguridad</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Incluye servicio de transporte especializado
                                </p>
                                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                    $50,000
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información del hospital destino */}
                {hospitalDestino && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Hospital de origen
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {hospitalDestino.nombre}
                        </p>
                        {hospitalDestino.municipios && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {hospitalDestino.municipios.nombre}
                            </p>
                        )}
                    </div>
                )}

                {/* Botones de acción */}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirmar}
                        disabled={!seleccionado}
                        className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${
                            seleccionado
                                ? seleccionado === "estandar"
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-orange-600 hover:bg-orange-700"
                                : "bg-gray-400 cursor-not-allowed"
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmar {seleccionado === "estandar" ? "Envío Estándar" : seleccionado === "prioritario" ? "Envío Prioritario" : "Selección"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
