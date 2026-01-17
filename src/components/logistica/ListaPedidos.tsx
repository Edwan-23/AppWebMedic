"use client";

import { useState, useEffect, useCallback } from "react";
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

interface Transporte {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface Envio {
  id: number;
  estado_envio?: EstadoEnvio;
}

interface Pedido {
  id: number;
  descripcion: string | null;
  created_at: string;
  medicamentos?: Medicamento;
  hospitales?: Hospital;
  publicaciones?: Publicacion;
  envios_realizados?: Envio[];
}

interface FormularioEnvio {
  descripcion: string;
  transporte_id: string;
  solicitud_id: number;
  fecha_recoleccion: string;
  fecha_entrega_estimada: string;
  estado_envio_id: string;
}

export default function ListaPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [formularioVisible, setFormularioVisible] = useState<{ [key: number]: boolean }>({});
  const [transportes, setTransportes] = useState<Transporte[]>([]);
  const [estadosEnvio, setEstadosEnvio] = useState<EstadoEnvio[]>([]);
  const [enviando, setEnviando] = useState(false);

  // Estado para cada formulario de envío
  const [formularios, setFormularios] = useState<{ [key: number]: FormularioEnvio }>({});

  // Filtros
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"" | "pendiente" | "proceso" | "completada">("");
  const cargarPedidos = useCallback(async () => {
    if (!usuario) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(filtroEstado && { estado: filtroEstado }),
        // Filtrar por publicaciones del hospital del usuario (pedidos recibidos)
        ...(usuario.hospital_id && { publicacion_hospital_id: usuario.hospital_id.toString() })
      });

      const res = await fetch(`/api/solicitudes?${params}`);
      if (!res.ok) throw new Error("Error al cargar pedidos");

      const data = await res.json();
      setPedidos(data.solicitudes);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  }, [usuario, page, searchTerm, filtroEstado]);
  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      setUsuario(JSON.parse(usuarioData));
    }
    cargarTransportes();
    cargarEstadosEnvio();
  }, []);

  useEffect(() => {
    if (usuario) {
      cargarPedidos();
    }
  }, [page, searchTerm, filtroEstado, usuario, cargarPedidos]);

  const cargarTransportes = async () => {
    try {
      const res = await fetch("/api/transporte");
      if (!res.ok) throw new Error("Error al cargar transportes");
      const data = await res.json();
      setTransportes(data.transportes || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar opciones de transporte");
    }
  };

  const cargarEstadosEnvio = async () => {
    try {
      const res = await fetch("/api/estado-envio");
      if (!res.ok) throw new Error("Error al cargar estados");
      const data = await res.json();
      setEstadosEnvio(data || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar estados de envío");
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFiltroEstado("");
    setPage(1);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getEstadoBadgeColor = (estado?: string) => {
    if (!estado) return "bg-gray-100 text-gray-800";
    
    switch (estado.toLowerCase()) {
      case "pendiente":
      case "solicitado":
        return "bg-yellow-100 text-yellow-800";
      case "en preparación":
      case "en proceso":
        return "bg-blue-100 text-blue-800";
      case "en tránsito":
        return "bg-indigo-100 text-indigo-800";
      case "entregado":
      case "completado":
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

  const toggleFormulario = (pedidoId: number) => {
    setFormularioVisible(prev => ({
      ...prev,
      [pedidoId]: !prev[pedidoId]
    }));

    // Inicializar formulario si no existe
    if (!formularios[pedidoId]) {
      const hoy = new Date();
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);

      setFormularios(prev => ({
        ...prev,
        [pedidoId]: {
          descripcion: "",
          transporte_id: "",
          solicitud_id: pedidoId,
          fecha_recoleccion: hoy.toISOString().split('T')[0],
          fecha_entrega_estimada: manana.toISOString().split('T')[0],
          estado_envio_id: ""
        }
      }));
    }
  };

  const actualizarFormulario = (pedidoId: number, campo: keyof FormularioEnvio, valor: string | number) => {
    setFormularios(prev => ({
      ...prev,
      [pedidoId]: {
        ...prev[pedidoId],
        [campo]: valor
      }
    }));
  };

  const iniciarEnvio = async (pedidoId: number) => {
    const form = formularios[pedidoId];
    
    if (!form.transporte_id) {
      toast.error("Selecciona un método de transporte");
      return;
    }

    if (!form.estado_envio_id) {
      toast.error("Selecciona un estado de envío");
      return;
    }

    if (!form.fecha_recoleccion || !form.fecha_entrega_estimada) {
      toast.error("Las fechas de recolección y entrega estimada son obligatorias");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/envios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          solicitud_id: pedidoId,
          hospital_origen_id: parseInt(usuario.hospital_id), // Hospital que envía
          descripcion: form.descripcion,
          transporte_id: parseInt(form.transporte_id),
          fecha_recoleccion: form.fecha_recoleccion,
          fecha_entrega_estimada: form.fecha_entrega_estimada,
          estado_envio_id: parseInt(form.estado_envio_id)
        })
      });

      if (!res.ok) throw new Error("Error al crear envío");

      const data = await res.json();
      toast.success("Envío iniciado correctamente");
      setFormularioVisible(prev => ({ ...prev, [pedidoId]: false }));
      
      // Recargar pedidos para actualizar el estado
      await cargarPedidos();
      
      // Redirigir a la vista de seguimiento
      if (data.envio?.id) {
        window.location.href = `/envios?id=${data.envio.id}`;
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al iniciar el envío");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros superiores */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Botones de filtro rápido */}
        <button
          onClick={() => {
            setFiltroEstado(filtroEstado === "pendiente" ? "" : "pendiente");
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
            setFiltroEstado(filtroEstado === "proceso" ? "" : "proceso");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtroEstado === "proceso"
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          En Proceso
        </button>

        <button
          onClick={() => {
            setFiltroEstado(filtroEstado === "completada" ? "" : "completada");
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

      {/* Lista de pedidos */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando pedidos...</p>
        </div>
      ) : pedidos.length === 0 ? (
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
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay pedidos</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No se encontraron pedidos con los filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Información principal */}
                  <div className="flex-1 space-y-3">
                    {/* Medicamento */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {pedido.medicamentos?.nombre || "Medicamento no especificado"} - {pedido.hospitales?.nombre || "N/A"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ref: {pedido.medicamentos?.referencia || "N/A"}
                        {pedido.medicamentos?.tipo_medicamento && (
                          <span className="ml-2">
                            • {pedido.medicamentos.tipo_medicamento.nombre} • Cantidad total: {pedido.publicaciones?.cantidad}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Descripción */}
                    {pedido.descripcion && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Descripción:</span> {pedido.descripcion}
                      </p>
                    )}

                    {/* Fecha del pedido */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Solicitado: {formatearFecha(pedido.created_at)}</span>
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getEstadoBadgeColor(
                        pedido.envios_realizados && pedido.envios_realizados.length > 0
                          ? pedido.envios_realizados[0].estado_envio?.estado
                          : undefined
                      )}`}
                    >
                      {pedido.envios_realizados && pedido.envios_realizados.length > 0
                        ? pedido.envios_realizados[0].estado_envio?.estado || "Pendiente"
                        : "Pendiente"}
                    </span>
                  </div>
                </div>

                {/* Botón para mostrar/ocultar formulario de envío o ir a seguimiento */}
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  {pedido.envios_realizados && pedido.envios_realizados.length > 0 ? (
                    <button
                      onClick={() => window.location.href = `/envios?id=${pedido.envios_realizados?.[0]?.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Seguimiento
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleFormulario(pedido.id)}
                      className={`px-4 py-2 rounded-lg focus:ring-4 font-medium transition-colors flex items-center gap-2 ${
                        formularioVisible[pedido.id]
                          ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-300"
                          : "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-300"
                      }`}
                    >
                      {formularioVisible[pedido.id] ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancelar
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Empezar envío
                        </>
                      )}
                    </button>
                  )}

                  {/* Formulario desplegable de envío */}
                  {formularioVisible[pedido.id] && formularios[pedido.id] && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4 animate-in slide-in-from-top">
                      {/* Descripción */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Descripción del envío
                        </label>
                        <textarea
                          value={formularios[pedido.id].descripcion}
                          onChange={(e) => actualizarFormulario(pedido.id, "descripcion", e.target.value)}
                          placeholder="Detalles adicionales del envío..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Método de transporte */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Método de transporte <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formularios[pedido.id].transporte_id}
                            onChange={(e) => actualizarFormulario(pedido.id, "transporte_id", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                          >
                            <option value="">Seleccionar transporte</option>
                            {transportes.map((transporte) => (
                              <option key={transporte.id} value={transporte.id}>
                                {transporte.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Fecha de recolección */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Fecha de recolección <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={formularios[pedido.id].fecha_recoleccion}
                            onChange={(e) => actualizarFormulario(pedido.id, "fecha_recoleccion", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                          />
                        </div>

                        {/* Fecha de entrega estimada */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Fecha de entrega estimada <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={formularios[pedido.id].fecha_entrega_estimada}
                            onChange={(e) => actualizarFormulario(pedido.id, "fecha_entrega_estimada", e.target.value)}
                            min={formularios[pedido.id].fecha_recoleccion}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                          />
                        </div>

                        {/* Estado de envío */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Estado de envío <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formularios[pedido.id].estado_envio_id}
                            onChange={(e) => actualizarFormulario(pedido.id, "estado_envio_id", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                          >
                            <option value="">Seleccionar estado</option>
                            {estadosEnvio.map((estado) => (
                              <option key={estado.id} value={estado.id}>
                                {estado.estado}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Botón Iniciar */}
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => iniciarEnvio(pedido.id)}
                          disabled={enviando}
                          className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:ring-4 focus:ring-brand-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {enviando ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Procesando...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Iniciar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Anterior</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <p className="text-sm text-gray-700">
              Página <span className="font-medium">{page}</span> de{" "}
              <span className="font-medium">{totalPages}</span>
            </p>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="relative inline-flex items-center rounded-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Siguiente</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
