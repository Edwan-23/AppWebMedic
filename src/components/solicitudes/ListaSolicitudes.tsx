"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import ConfirmModal from "@/components/common/ConfirmModal";

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
  descripcion?: string;
  principioactivo?: string;
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
  tipo_solicitud?: string | null;
  valor_propuesto?: number | null;
  medicamento_intercambio?: string | null;
  cantidad_intercambio?: number | null;
  fecha_devolucion_estimada?: string | null;
  propuesta_descripcion?: string | null;
  estado_solicitud?: string | null;
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
  const [modalAprobar, setModalAprobar] = useState<{ isOpen: boolean; solicitudId: number | null }>({ isOpen: false, solicitudId: null });
  const [modalRechazar, setModalRechazar] = useState<{ isOpen: boolean; solicitudId: number | null }>({ isOpen: false, solicitudId: null });
  const [loading2, setLoading2] = useState(false);

  // Filtros
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"" | "Pendiente" | "Completada" | "Historial">("Pendiente");
  const [tipoSolicitudes, setTipoSolicitudes] = useState<"enviadas" | "entrantes">("enviadas"); // Similar a donaciones

  const cargarSolicitudes = useCallback(async () => {
    if (!usuario) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        tipo: tipoSolicitudes, 
        ...(searchTerm && { search: searchTerm }),
        ...(filtroEstado && { estado: filtroEstado })
      });

      // Agregar parámetro según el tipo de vista
      if (tipoSolicitudes === "enviadas" && usuario.hospital_id) {
        params.append("hospital_id", usuario.hospital_id.toString());
      } else if (tipoSolicitudes === "entrantes" && usuario.hospital_id) {
        params.append("publicacion_hospital_id", usuario.hospital_id.toString());
      }

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
  }, [usuario, page, searchTerm, filtroEstado, tipoSolicitudes]);

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
  }, [page, searchTerm, filtroEstado, tipoSolicitudes, usuario, cargarSolicitudes]);



  const handleAprobar = async (solicitudId: number) => {
    setModalAprobar({ isOpen: true, solicitudId });
  };

  const confirmarAprobar = async () => {
    if (!modalAprobar.solicitudId) return;

    setLoading2(true);
    try {
      const res = await fetch(`/api/solicitudes/${modalAprobar.solicitudId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_solicitud: "Aceptada" })
      });

      if (!res.ok) throw new Error("Error al aprobar solicitud");

      toast.success("Solicitud aprobada exitosamente");
      setModalAprobar({ isOpen: false, solicitudId: null });
      cargarSolicitudes();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al aprobar la solicitud");
    } finally {
      setLoading2(false);
    }
  };

  const handleRechazar = async (solicitudId: number) => {
    setModalRechazar({ isOpen: true, solicitudId });
  };

  const confirmarRechazar = async () => {
    if (!modalRechazar.solicitudId) return;

    setLoading2(true);
    try {
      const res = await fetch(`/api/solicitudes/${modalRechazar.solicitudId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_solicitud: "Rechazada" })
      });

      if (!res.ok) throw new Error("Error al rechazar solicitud");

      toast.success("Solicitud rechazada");
      setModalRechazar({ isOpen: false, solicitudId: null });
      cargarSolicitudes();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al rechazar la solicitud");
    } finally {
      setLoading2(false);
    }
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
      {/* Toggle para cambiar entre Mis Solicitudes y Solicitudes Entrantes */}
      <div className="mb-6 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg w-fit mx-auto">
        <button
          onClick={() => {
            setTipoSolicitudes("enviadas");
            setPage(1);
          }}
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
            tipoSolicitudes === "enviadas"
              ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-md"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <span className="flex items-center gap-2">
            Mis Solicitudes
          </span>
        </button>
        <button
          onClick={() => {
            setTipoSolicitudes("entrantes");
            setPage(1);
          }}
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
            tipoSolicitudes === "entrantes"
              ? "bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-md"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <span className="flex items-center gap-2">
            Solicitudes Entrantes
          </span>
        </button>
      </div>

      {/* Filtros superiores */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Botones de filtro rápido */}
        <button
          onClick={() => {
            setFiltroEstado("Pendiente");
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
            setFiltroEstado("Completada");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtroEstado === "Completada"
              ? "bg-green-500 text-white"
              : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          Completadas
        </button>

        <button
          onClick={() => {
            setFiltroEstado("Historial");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            filtroEstado === "Historial"
              ? "bg-gray-500 text-white"
              : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Historial
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
                        {solicitud.publicaciones?.principioactivo || solicitud.publicaciones?.descripcion || "Medicamento no especificado"}
                      </h3>
                      {solicitud.publicaciones && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Cantidad disponible: {solicitud.publicaciones.cantidad}
                          {solicitud.publicaciones.fecha_expiracion && (
                            <span className="ml-2">
                              • Vence: {formatearFecha(solicitud.publicaciones.fecha_expiracion)}
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Tipo de solicitud y propuesta */}
                    {solicitud.tipo_solicitud && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            solicitud.tipo_solicitud === "compra" 
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : solicitud.tipo_solicitud === "intercambio"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                              : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                          }`}>
                            {solicitud.tipo_solicitud === "compra" && "💰 Compra"}
                            {solicitud.tipo_solicitud === "intercambio" && "🔄 Intercambio"}
                            {solicitud.tipo_solicitud === "prestamo" && "🤝 Préstamo"}
                          </span>
                        </div>
                        
                        {/* Información específica del tipo */}
                        {solicitud.tipo_solicitud === "compra" && solicitud.valor_propuesto && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Valor propuesto:</span> ${Number(solicitud.valor_propuesto).toLocaleString('es-CO')}
                          </p>
                        )}
                        
                        {solicitud.tipo_solicitud === "intercambio" && solicitud.medicamento_intercambio && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Ofrece:</span> {solicitud.medicamento_intercambio} 
                            ({solicitud.cantidad_intercambio} unidades)
                          </p>
                        )}
                        
                        {solicitud.tipo_solicitud === "prestamo" && solicitud.fecha_devolucion_estimada && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Devolución estimada:</span> {formatearFecha(solicitud.fecha_devolucion_estimada)}
                          </p>
                        )}
                        
                        {solicitud.propuesta_descripcion && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            "{solicitud.propuesta_descripcion}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Descripción (solo si no hay tipo de solicitud) */}
                    {!solicitud.tipo_solicitud && solicitud.descripcion && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Descripción:</span> {solicitud.descripcion}
                      </p>
                    )}

                    {/* Mostrar hospital según el tipo de vista */}
                    {tipoSolicitudes === "enviadas" && solicitud.publicaciones?.hospitales && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7a3 3 0 013-3h8a3 3 0 013 3v14M9 10h.01M15 10h.01M10 21v-6h4v6M12 8v3M10.5 9.5h3" />
                        </svg>
                        <span className="font-medium">Para:</span>
                        <span>{solicitud.publicaciones.hospitales.nombre}</span>
                      </div>
                    )}

                    {tipoSolicitudes === "entrantes" && solicitud.hospitales && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7a3 3 0 013-3h8a3 3 0 013 3v14M9 10h.01M15 10h.01M10 21v-6h4v6M12 8v3M10.5 9.5h3" />
                        </svg>
                        <span className="font-medium">De:</span>
                        <span>{solicitud.hospitales.nombre}</span>
                      </div>
                    )}

                    {/* Fecha de solicitud */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Solicitado: {formatearFecha(solicitud.created_at)}</span>
                    </div>
                  </div>

                  {/* Estado y Acciones */}
                  <div className="flex flex-col items-end gap-3">
                    {/* Badge de estado */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        solicitud.estado_solicitud === "Aceptada"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : solicitud.estado_solicitud === "rechazada"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : solicitud.envios_realizados && solicitud.envios_realizados.length > 0
                          ? getEstadoBadgeColor(solicitud.envios_realizados[0].estado_envio?.estado)
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {solicitud.estado_solicitud === "Aceptada" && "Contrato realizado"}
                      {solicitud.estado_solicitud === "Rechazada" && tipoSolicitudes === "enviadas" && "No concretado"}
                      {solicitud.estado_solicitud === "Rechazada" && tipoSolicitudes === "entrantes" && "Solicitud rechazada"}
                      {solicitud.estado_solicitud === "Pendiente" && tipoSolicitudes === "enviadas" && "Esperando respuesta"}
                      {solicitud.estado_solicitud === "Pendiente" && tipoSolicitudes === "entrantes" && "Pendiente"}
                      {solicitud.envios_realizados && solicitud.envios_realizados.length > 0 && 
                        solicitud.envios_realizados[0].estado_envio?.estado}
                    </span>

                    {/* Botones de acción para solicitudes entrantes pendientes */}
                    {tipoSolicitudes === "entrantes" && solicitud.estado_solicitud === "Pendiente" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAprobar(solicitud.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleRechazar(solicitud.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Rechazar
                        </button>
                      </div>
                    )}

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
                {((tipoSolicitudes === "enviadas" && solicitud.publicaciones?.hospitales) || 
                  (tipoSolicitudes === "entrantes" && solicitud.hospitales)) && (
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <button
                      onClick={() => toggleDetalles(solicitud.id)}
                      className="flex items-center justify-between w-full text-left group"
                    >
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-brand-600">
                        {tipoSolicitudes === "enviadas" ? "Datos del Hospital Publicador" : "Datos del Hospital Solicitante"}
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
                    {detallesVisibles[solicitud.id] && (() => {
                      const hospital = tipoSolicitudes === "enviadas" 
                        ? solicitud.publicaciones?.hospitales 
                        : solicitud.hospitales;
                      
                      if (!hospital) return null;

                      return (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3 animate-in slide-in-from-top">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Nombre */}
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hospital</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {hospital.nombre}
                              </p>
                            </div>
                            <button
                              onClick={() => copiarAlPortapapeles(hospital.nombre, "Nombre")}
                              className="ml-2 p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded transition-colors"
                              title="Copiar nombre"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>

                          {/* Dirección */}
                          {hospital.direccion && (
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dirección</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {hospital.direccion}
                                </p>
                              </div>
                              <button
                                onClick={() => copiarAlPortapapeles(hospital.direccion!, "Dirección")}
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
                          {hospital.celular && (
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Celular</p>
                                <a
                                  href={`tel:${hospital.celular}`}
                                  className="font-medium text-brand-600 hover:underline"
                                >
                                  {hospital.celular}
                                </a>
                              </div>
                              <button
                                onClick={() => copiarAlPortapapeles(hospital.celular!, "Celular")}
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
                          {hospital.telefono && (
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Teléfono</p>
                                <a
                                  href={`tel:${hospital.telefono}`}
                                  className="font-medium text-brand-600 hover:underline"
                                >
                                  {hospital.telefono}
                                </a>
                              </div>
                              <button
                                onClick={() => copiarAlPortapapeles(hospital.telefono!, "Teléfono")}
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
                      );
                    })()}
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

      {/* Modal de Confirmación - Aprobar */}
      <ConfirmModal
        isOpen={modalAprobar.isOpen}
        onClose={() => setModalAprobar({ isOpen: false, solicitudId: null })}
        onConfirm={confirmarAprobar}
        title="Aprobar Solicitud"
        message="¿Está seguro de aprobar esta solicitud? Esta acción notificará al hospital solicitante."
        confirmText="Sí, aprobar"
        cancelText="Cancelar"
        isLoading={loading2}
        variant="info"
      />

      {/* Modal de Confirmación - Rechazar */}
      <ConfirmModal
        isOpen={modalRechazar.isOpen}
        onClose={() => setModalRechazar({ isOpen: false, solicitudId: null })}
        onConfirm={confirmarRechazar}
        title="Rechazar Solicitud"
        message="¿Está seguro de rechazar esta solicitud? Esta acción moverá la solicitud al historial y notificará al hospital solicitante."
        confirmText="Sí, rechazar"
        cancelText="Cancelar"
        isLoading={loading2}
        variant="danger"
      />
    </div>
  );
}
