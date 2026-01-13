"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";

interface Pago {
  id: number;
  monto: number;
  estado: string;
  transaccion: string | null;
  nombre: string;
  email: string;
  cedula: string;
  telefono: string | null;
  observaciones: string | null;
  fecha_pago: string;
  medio_pago?: {
    id: number;
    nombre: string;
    icono: string | null;
  };
  solicitud?: {
    id: number;
    hospital: string;
    encargado: string;
    cantidad_enviada: number;
    unidad_enviada: string;
    medicamento: {
      nombre: string;
      tipo: string;
      concentracion: number;
      medida: string;
    };
  };
  envio?: {
    id: number;
    estado: string;
    transporte: string;
    fecha_entrega_estimada?: string;
  };
}

export default function ListaPagos() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [usuario, setUsuario] = useState<any>(null);
  const [pagoExpandido, setPagoExpandido] = useState<number | null>(null);
  const [tipoPagos, setTipoPagos] = useState<"realizados" | "recibidos">("recibidos"); // Default: pagos recibidos
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [estadisticas, setEstadisticas] = useState({
    pendientes: 0,
    completados: 0,
    totalRecaudado: 0
  });

  const cargarPagos = useCallback(async () => {
    try {
      setLoading(true);
      const usuarioData = localStorage.getItem("usuario");
      if (!usuarioData) return;

      const user = JSON.parse(usuarioData);
      const params = new URLSearchParams();

      if (user.hospital_id) {
        params.append("hospital_id", user.hospital_id.toString());
      }
      params.append("tipo", tipoPagos);
      params.append("page", page.toString());
      params.append("limit", "10");

      if (filtroEstado) {
        params.append("estado", filtroEstado);
      }

      if (busqueda) {
        params.append("transaccion", busqueda);
      }

      const response = await fetch(`/api/pagos?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPagos(data.pagos || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setEstadisticas(data.estadisticas || { pendientes: 0, completados: 0, totalRecaudado: 0 });
      }
    } catch (error) {
      console.error("Error al cargar pagos:", error);
      toast.error("Error al cargar pagos");
    } finally {
      setLoading(false);
    }
  }, [tipoPagos, page, filtroEstado, busqueda]);

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      setUsuario(JSON.parse(usuarioData));
    }
  }, []);

  useEffect(() => {
    if (usuario) {
      cargarPagos();
    }
  }, [usuario, tipoPagos, page, filtroEstado, busqueda, cargarPagos]);

  const generarPDF = (pagoId: number) => {
    // Abrir el PDF en una nueva pestaña
    window.open(`/api/pagos/${pagoId}/factura`, '_blank');
  };

  const getBadgeEstado = (estado: string) => {
    const estilos = {
      Pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      Completado: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      Fallido: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    };
    return estilos[estado as keyof typeof estilos] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Cargando pagos...</div>
      </div>
    );
  }

  return (
    <div>

      {/* Resumen */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
            Pendientes
          </div>
          <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-300 mt-1">
            {estadisticas.pendientes}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="text-green-600 dark:text-green-400 text-sm font-medium">
            Completados
          </div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-300 mt-1">
            {estadisticas.completados}
          </div>
        </div>
        <div className={`rounded-lg p-4 border ${
          tipoPagos === "recibidos" 
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
            : "bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800"
        }`}>
          <div className={`text-sm font-medium ${
            tipoPagos === "recibidos"
              ? "text-green-600 dark:text-green-400"
              : "text-brand-600 dark:text-brand-400"
          }`}>
            {tipoPagos === "recibidos" ? "Total Recaudado" : "Total Pagado"}
          </div>
          <div className={`text-2xl font-bold mt-1 ${
            tipoPagos === "recibidos"
              ? "text-green-900 dark:text-green-300"
              : "text-brand-900 dark:text-brand-300"
          }`}>
            ${estadisticas.totalRecaudado.toLocaleString('es-CO')}
          </div>
        </div>
      </div>

            {/* Toggle para cambiar entre Pagos Realizados y Recibidos */}
      <div className="mb-6 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg w-fit mx-auto">
        <button
          onClick={() => setTipoPagos("realizados")}
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
            tipoPagos === "realizados"
              ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-md"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <span className="flex items-center gap-2">
            Pagos Realizados
          </span>
        </button>
        <button
          onClick={() => setTipoPagos("recibidos")}
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
            tipoPagos === "recibidos"
              ? "bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-md"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <span className="flex items-center gap-2">
            Pagos Recibidos
          </span>
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-4">
        {/* Botones de filtro por estado */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setFiltroEstado(filtroEstado === "Pendiente" ? "" : "Pendiente");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtroEstado === "Pendiente"
                ? "bg-yellow-500 text-white"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Pendientes
          </button>

          <button
            onClick={() => {
              setFiltroEstado(filtroEstado === "Completado" ? "" : "Completado");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtroEstado === "Completado"
                ? "bg-green-500 text-white"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Completados
          </button>

          <button
            onClick={() => {
              setFiltroEstado(filtroEstado === "Fallido" ? "" : "Fallido");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtroEstado === "Fallido"
                ? "bg-red-500 text-white"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Fallidos
          </button>
        </div>

        {/* Búsqueda */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por transacción"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Transacción
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Pagador
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Medicamento
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Medio Pago
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Monto
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Estado
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {pagos.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron pagos
                </td>
              </tr>
            ) : (
              pagos.map((pago) => (
                <React.Fragment key={pago.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-4">
                      <div className="font-mono text-sm text-brand-600 dark:text-brand-400">
                        {pago.transaccion || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(pago.fecha_pago).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {pago.nombre}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        CC: {pago.cedula}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {pago.solicitud?.medicamento?.nombre || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {pago.medio_pago?.nombre || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${pago.monto.toLocaleString('es-CO')}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getBadgeEstado(pago.estado)}`}>
                        {pago.estado}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Botón Detalles */}
                        <button
                          onClick={() => setPagoExpandido(pagoExpandido === pago.id ? null : pago.id)}
                          className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all"
                          title={pagoExpandido === pago.id ? 'Cerrar detalles' : 'Ver detalles'}
                        >
                          {pagoExpandido === pago.id ? (
                            <Image 
                              src="/images/icons/arrow-up.svg" 
                              alt="Cerrar" 
                              width={20} 
                              height={20}
                              className="w-5 h-5"
                            />
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                        
                        {/* Botón Ver Envío */}
                        {pago.envio ? (
                          <a
                            href={`/envios?id=${pago.envio.id}`}
                            className="p-1.5 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded transition-all"
                            title="Ver envío"
                          >
                            <Image 
                              src="/images/icons/truck.svg" 
                              alt="Envío" 
                              width={20} 
                              height={20}
                              className="w-5 h-5"
                            />
                          </a>
                        ) : pago.estado === "Completado" ? (
                          <div className="p-1.5 text-gray-400 dark:text-gray-600" title="Procesando envío...">
                            <Image 
                              src="/images/icons/clock.svg" 
                              alt="Procesando" 
                              width={20} 
                              height={20}
                              className="w-5 h-5 animate-pulse"
                            />
                          </div>
                        ) : pago.estado === "Pendiente" ? (
                          <div className="p-1.5 text-yellow-600 dark:text-yellow-400" title="En verificación">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                        ) : (
                          <div className="p-1.5 text-red-600 dark:text-red-400" title="Pago fallido">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Botón PDF */}
                        <button
                          onClick={() => generarPDF(pago.id)}
                          className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                          title="Generar factura PDF"
                        >
                          <Image 
                            src="/images/icons/file-pdf.svg" 
                            alt="PDF" 
                            width={20} 
                            height={20}
                            className="w-5 h-5"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {pagoExpandido === pago.id && (
                    <tr key={`detalles-${pago.id}`} className="bg-gray-50 dark:bg-gray-900/30">
                      <td colSpan={8} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Información del Medicamento */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-300 mb-2 uppercase">Medicamento</h4>
                            <div className="space-y-1.5">
                              <p className="text-base text-gray-900 dark:text-white font-medium">{pago.solicitud?.medicamento?.nombre || "N/A"}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Tipo: {pago.solicitud?.medicamento?.tipo || "N/A"}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Concentración: {pago.solicitud?.medicamento?.concentracion || "N/A"} {pago.solicitud?.medicamento?.medida || ""}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-2">Cantidad enviada: {pago.solicitud?.cantidad_enviada || "N/A"} {pago.solicitud?.unidad_enviada || ""}</p>
                            </div>
                          </div>

                          {/* Hospital Destino */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-300 mb-2 uppercase">Hospital Destino</h4>
                            <div className="space-y-1.5">
                              <p className="text-base text-gray-900 dark:text-white font-medium">{pago.solicitud?.hospital || "N/A"}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Encargado: {pago.solicitud?.encargado || "N/A"}</p>
                            </div>
                          </div>

                          {/* Información del Envío */}
                          {pago.envio && (
                            <div>
                              <h4 className="text-sm font-bold text-gray-500 dark:text-gray-300 mb-2 uppercase">Envío</h4>
                              <div className="space-y-1.5">
                                <p className="text-base text-gray-900 dark:text-white font-medium">{pago.envio.estado || "N/A"}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Transporte: {pago.envio.transporte || "N/A"}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Fecha estimada: {pago.envio.fecha_entrega_estimada
                                    ? new Date(pago.envio.fecha_entrega_estimada).toLocaleDateString('es-CO')
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Información del Pago */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-300 mb-2 uppercase">Pago</h4>
                            <div className="space-y-1.5">
                              <p className="text-base text-brand-600 dark:text-brand-400 font-semibold">${pago.monto.toLocaleString('es-CO')}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Medio: {pago.medio_pago?.nombre || "N/A"}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">TRX: {pago.transaccion || "N/A"}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Fecha: {new Date(pago.fecha_pago).toLocaleString('es-CO')}
                              </p>
                            </div>
                          </div>

                          {/* Datos de Contacto */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-300 mb-2 uppercase">Contacto</h4>
                            <div className="space-y-1.5">
                              <p className="text-base text-gray-900 dark:text-white font-medium">{pago.nombre}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">CC: {pago.cedula}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{pago.email}</p>
                              {pago.telefono && <p className="text-sm text-gray-600 dark:text-gray-400">Tel: {pago.telefono}</p>}
                            </div>
                          </div>

                          {/* Observaciones */}
                          {pago.observaciones && (
                            <div>
                              <h4 className="text-sm font-bold text-gray-500 dark:text-gray-300 mb-2 uppercase">Observaciones</h4>
                              <div className="space-y-1.5">
                                <p className="text-base text-gray-900 dark:text-white">{pago.observaciones}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Página anterior"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
                        <p className="text-sm text-gray-700 dark:text-gray-300">
              Página <span className="font-medium">{page}</span> de{" "}
              <span className="font-medium">{totalPages}</span>
            </p>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Página siguiente"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
