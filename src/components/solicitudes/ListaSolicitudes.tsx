"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface Medicamento {
  id: number;
  nombre: string;
  referencia: string;
  tipo_medicamento?: { nombre: string };
  medida_medicamento?: { nombre: string };
}

interface Hospital {
  id: number;
  nombre: string;
  direccion?: string;
  celular?: string;
  telefono?: string;
  municipios?: { nombre: string };
}

interface EstadoEnvio {
  id: number;
  guia: string;
  estado?: string;
  descripcion?: string;
}

interface Publicacion {
  id: number;
  cantidad: number;
  fecha_expiracion: string;
  hospitales?: Hospital;
}

interface Envio {
  id: number;
  updated_at?: string;
  estado_envio?: {
    id: number;
    estado?: string;
    guia?: string;
  };
}

interface Solicitud {
  id: number;
  descripcion: string | null;
  created_at: string;
  medicamentos?: Medicamento;
  hospitales?: Hospital;
  publicaciones?: Publicacion;
  envios_realizados?: Envio[];
}

export default function ListaSolicitudes() {
  const searchParams = useSearchParams();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [detallesVisibles, setDetallesVisibles] = useState<{ [key: number]: boolean }>({});

  // Filtros
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"" | "pendiente" | "completada">("");
  const [misSolicitudes, setMisSolicitudes] = useState(true); // Por defecto mostrar solo mis solicitudes

  const cargarSolicitudes = useCallback(async () => {
    if (!usuario) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(filtroEstado && { estado: filtroEstado }),
        ...(misSolicitudes && usuario.hospital_id && { hospital_id: usuario.hospital_id.toString() })
      });

      const res = await fetch(`/api/solicitudes?${params}`);
      if (!res.ok) throw new Error("Error al cargar solicitudes");

      const data = await res.json();
      setSolicitudes(data.solicitudes);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  }, [usuario, page, searchTerm, filtroEstado, misSolicitudes]);

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      setUsuario(JSON.parse(usuarioData));
    }
  }, []);

  useEffect(() => {
    // Listener para actualización desde notificaciones
    const handleActualizarDatos = () => {
      cargarSolicitudes();
    };

    window.addEventListener('actualizarDatos', handleActualizarDatos);

    return () => {
      window.removeEventListener('actualizarDatos', handleActualizarDatos);
    };
  }, [cargarSolicitudes]);

  useEffect(() => {
    if (usuario) {
      cargarSolicitudes();
    }
  }, [page, searchTerm, filtroEstado, misSolicitudes, usuario, cargarSolicitudes]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setFiltroEstado("");
    setMisSolicitudes(true);
    setPage(1);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatearFechaHora = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getEstadoBadgeColor = (estado?: string) => {
    if (!estado) return "bg-gray-100 text-gray-800";
    
    switch (estado.toLowerCase()) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "en preparación":
        return "bg-blue-100 text-blue-800";
      case "en tránsito":
        return "bg-indigo-100 text-indigo-800";
      case "entregado":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

  const toggleDetalles = (id: number) => {
    setDetallesVisibles(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Filtros superiores */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Botones de filtro rápido */}
        <button
          onClick={() => {
            setMisSolicitudes(true);
            setFiltroEstado("");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            misSolicitudes && !filtroEstado
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          Mis Solicitudes
        </button>

        <button
          onClick={() => {
            setFiltroEstado("pendiente");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtroEstado === "pendiente"
              ? "bg-yellow-500 text-white"
              : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          Pendientes
        </button>

        <button
          onClick={() => {
            setFiltroEstado("completada");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtroEstado === "completada"
              ? "bg-green-500 text-white"
              : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          Completadas
        </button>

        {/* Buscador */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar por medicamento o descripción..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Botón limpiar filtros */}
        {(searchTerm || filtroEstado) && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Lista de solicitudes */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando solicitudes...</p>
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay solicitudes</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No se encontraron solicitudes con los filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((solicitud) => (
            <div
              key={solicitud.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Información principal */}
                  <div className="flex-1 space-y-3">
                    {/* Medicamento */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {solicitud.medicamentos?.nombre || "Medicamento no especificado"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ref: {solicitud.medicamentos?.referencia || "N/A"}
                        {solicitud.medicamentos?.tipo_medicamento && (
                          <span className="ml-2">
                            • {solicitud.medicamentos.tipo_medicamento.nombre}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Descripción */}
                    {solicitud.descripcion && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Descripción:</span> {solicitud.descripcion}
                      </p>
                    )}

                    {/* Fecha de solicitud */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Solicitado: {formatearFecha(solicitud.created_at)}</span>
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getEstadoBadgeColor(
                        solicitud.envios_realizados && solicitud.envios_realizados.length > 0
                          ? solicitud.envios_realizados[0].estado_envio?.estado
                          : undefined
                      )}`}
                    >
                      {/* Mostrar el estado del envío si existe, sino "Pendiente" */}
                      {solicitud.envios_realizados && solicitud.envios_realizados.length > 0
                        ? solicitud.envios_realizados[0].estado_envio?.estado || "Pendiente"
                        : "Pendiente"}
                    </span>

                    {/* Botón de Seguimiento o Fecha de Entrega */}
                    {solicitud.envios_realizados && solicitud.envios_realizados.length > 0 && (
                      solicitud.envios_realizados[0].estado_envio?.estado?.toLowerCase() === "entregado" ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 dark:text-gray-500">Entregado el:</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {solicitud.envios_realizados[0].updated_at 
                                ? formatearFechaHora(solicitud.envios_realizados[0].updated_at)
                                : "Fecha no disponible"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <a
                          href={`/envios?envio_id=${solicitud.envios_realizados[0].id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          Seguimiento
                        </a>
                      )
                    )}
                  </div>
                </div>

                {/* Botón para mostrar/ocultar datos del hospital */}
                {solicitud.publicaciones?.hospitales && (
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <button
                      onClick={() => toggleDetalles(solicitud.id)}
                      className="flex items-center justify-between w-full text-left group"
                    >
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-brand-600">
                        Datos del Hospital
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                          detallesVisibles[solicitud.id] ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Panel desplegable con información del hospital */}
                    {detallesVisibles[solicitud.id] && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3 animate-in slide-in-from-top">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Nombre */}
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hospital</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {solicitud.publicaciones.hospitales.nombre}
                              </p>
                            </div>
                            <button
                              onClick={() => copiarAlPortapapeles(solicitud.publicaciones!.hospitales!.nombre, "Nombre")}
                              className="ml-2 p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded transition-colors"
                              title="Copiar nombre"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>

                          {/* Dirección */}
                          {solicitud.publicaciones.hospitales.direccion && (
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dirección</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {solicitud.publicaciones.hospitales.direccion}
                                </p>
                              </div>
                              <button
                                onClick={() => copiarAlPortapapeles(solicitud.publicaciones!.hospitales!.direccion!, "Dirección")}
                                className="ml-2 p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded transition-colors"
                                title="Copiar dirección"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          )}

                          {/* Celular */}
                          {solicitud.publicaciones.hospitales.celular && (
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Celular</p>
                                <a
                                  href={`tel:${solicitud.publicaciones.hospitales.celular}`}
                                  className="font-medium text-brand-600 hover:underline"
                                >
                                  {solicitud.publicaciones.hospitales.celular}
                                </a>
                              </div>
                              <button
                                onClick={() => copiarAlPortapapeles(solicitud.publicaciones!.hospitales!.celular!, "Celular")}
                                className="ml-2 p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded transition-colors"
                                title="Copiar celular"
                              >
                                <Image 
                                  src="/images/icons/copy.svg" 
                                  alt="Copiar" 
                                  width={16} 
                                  height={16}
                                  className="w-4 h-4"
                                />
                              </button>
                            </div>
                          )}

                          {/* Teléfono */}
                          {solicitud.publicaciones.hospitales.telefono && (
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Teléfono</p>
                                <a
                                  href={`tel:${solicitud.publicaciones.hospitales.telefono}`}
                                  className="font-medium text-brand-600 hover:underline"
                                >
                                  {solicitud.publicaciones.hospitales.telefono}
                                </a>
                              </div>
                              <button
                                onClick={() => copiarAlPortapapeles(solicitud.publicaciones!.hospitales!.telefono!, "Teléfono")}
                                className="ml-2 p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded transition-colors"
                                title="Copiar teléfono"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 rounded-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Anterior</span>
              <Image 
                src="/images/icons/chevron-left.svg" 
                alt="Anterior" 
                width={20} 
                height={20}
                className="h-5 w-5"
              />
            </button>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Página <span className="font-medium">{page}</span> de{" "}
              <span className="font-medium">{totalPages}</span>
            </p>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="relative inline-flex items-center rounded-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Siguiente</span>
              <Image 
                src="/images/icons/chevron-right.svg" 
                alt="Siguiente" 
                width={20} 
                height={20}
                className="h-5 w-5"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
