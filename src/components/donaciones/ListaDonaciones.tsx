"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";
import ImageUpload from "@/components/form/ImageUpload";

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
  municipios?: { nombre: string };
}

interface UnidadDispensacion {
  id: number;
  nombre: string;
}

interface Envio {
  id: number;
  estado_envio?: {
    estado?: string;
  };
}

interface Donacion {
  id: number;
  descripcion: string | null;
  cantidad: number;
  created_at: string;
  updated_at: string | null;
  imagen: string | null;
  hospital_id: number;
  hospital_origen_id: number | null;
  medicamento_id: number;
  unidad_dispensacion_id: number | null;
  envio_id: number | null;
  medicamentos?: Medicamento;
  hospitales?: Hospital;
  hospital_origen?: Hospital;
  unidad_dispensacion?: UnidadDispensacion;
  envio?: Envio;
}

export default function ListaDonaciones() {
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [hospitales, setHospitales] = useState<Hospital[]>([]);
  const [unidadesDispensacion, setUnidadesDispensacion] = useState<UnidadDispensacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFormularioEnvio, setMostrarFormularioEnvio] = useState(false);
  const [donacionParaEnvio, setDonacionParaEnvio] = useState<Donacion | null>(null);

  // Estados para búsqueda de medicamentos
  const [busquedaMedicamento, setBusquedaMedicamento] = useState("");
  const [mostrarDropdownMedicamentos, setMostrarDropdownMedicamentos] = useState(false);
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState<Medicamento | null>(null);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoDonaciones, setTipoDonaciones] = useState<"enviadas" | "recibidas">("enviadas");

  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Formulario de donación
  const [formData, setFormData] = useState({
    medicamento_id: "",
    hospital_destino_id: "",
    descripcion: "",
    cantidad: "",
    unidad_dispensacion_id: "",
    imagen: ""
  });

  // Formulario de envío
  const [formEnvio, setFormEnvio] = useState({
    transporte_id: "",
    fecha_recoleccion: "",
    fecha_entrega_estimada: "",
    descripcion: ""
  });

  const [transportes, setTransportes] = useState<any[]>([]);

  const cargarDonaciones = useCallback(async () => {
    if (!usuario?.hospital_id) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        tipo: tipoDonaciones,
        hospital_id: usuario.hospital_id.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filtroEstado && { estado: filtroEstado })
      });

      const response = await fetch(`/api/donaciones?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDonaciones(data.donaciones || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        toast.error("Error al cargar donaciones");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [usuario?.hospital_id, page, searchTerm, filtroEstado, tipoDonaciones]);

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      const user = JSON.parse(usuarioData);
      setUsuario(user);
    }
    cargarDatosIniciales();

    // Leer parámetro de la URL para establecer el toggle
    const urlParams = new URLSearchParams(window.location.search);
    const tipoParam = urlParams.get("tipo");
    if (tipoParam === "recibidas") {
      setTipoDonaciones("recibidas");
    }

    // Listener para actualización desde notificaciones
    const handleActualizarDatos = () => {
      // Si viene de una notificación de donación, establecer toggle en recibidas
      const urlParams = new URLSearchParams(window.location.search);
      const tipoParam = urlParams.get("tipo");
      if (tipoParam === "recibidas") {
        setTipoDonaciones("recibidas");
      }
      cargarDonaciones();
    };

    window.addEventListener('actualizarDatos', handleActualizarDatos);

    return () => {
      window.removeEventListener('actualizarDatos', handleActualizarDatos);
    };
  }, []);

  useEffect(() => {
    if (usuario) {
      cargarDonaciones();
    }
  }, [usuario, filtroEstado, searchTerm, tipoDonaciones, page, cargarDonaciones]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.medicamento-dropdown-container')) {
        setMostrarDropdownMedicamentos(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      const [resMed, resHospitales, resUnidades, resTransportes] = await Promise.all([
        fetch("/api/medicamentos"),
        fetch("/api/hospitales"),
        fetch("/api/unidad-dispensacion"),
        fetch("/api/transporte")
      ]);

      if (resMed.ok) {
        const data = await resMed.json();
        setMedicamentos(data.medicamentos || []);
      }

      if (resHospitales.ok) {
        const data = await resHospitales.json();
        setHospitales(data.hospitales || []);
      }

      if (resUnidades.ok) {
        const data = await resUnidades.json();
        setUnidadesDispensacion(data.unidades || data);
      }

      if (resTransportes.ok) {
        const data = await resTransportes.json();
        setTransportes(data.transportes || []);
      }
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeEnvio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormEnvio(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.medicamento_id || !formData.hospital_destino_id || !formData.cantidad || !formData.unidad_dispensacion_id) {
      toast.error("¡Campos requeridos!", {
        description: "Completa todos los campos obligatorios."
      });
      return;
    }

    const loadingToast = toast.loading("Creando donación...");

    try {
      const response = await fetch("/api/donaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicamento_id: parseInt(formData.medicamento_id),
          hospital_origen_id: parseInt(usuario?.hospital_id),
          hospital_destino_id: parseInt(formData.hospital_destino_id),
          cantidad: parseInt(formData.cantidad),
          unidad_dispensacion_id: parseInt(formData.unidad_dispensacion_id),
          descripcion: formData.descripcion || undefined,
          imagen: formData.imagen || undefined
        })
      });

      if (response.ok) {
        toast.success("¡Donación creada exitosamente!", {
          description: "La donación ha sido registrada."
        });
        setMostrarFormulario(false);
        setFormData({
          medicamento_id: "",
          hospital_destino_id: "",
          descripcion: "",
          cantidad: "",
          unidad_dispensacion_id: "",
          imagen: ""
        });
        cargarDonaciones();
      } else {
        const error = await response.json();
        toast.error("Error al crear donación", {
          description: error.error || "Intenta nuevamente"
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear donación");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleSubmitEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!donacionParaEnvio) return;

    if (!formEnvio.transporte_id || !formEnvio.fecha_recoleccion || !formEnvio.fecha_entrega_estimada) {
      toast.error("Completa todos los campos del envío");
      return;
    }

    const loadingToast = toast.loading("Creando envío...");

    try {
      const response = await fetch("/api/donaciones/envio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donacion_id: donacionParaEnvio.id,
          transporte_id: parseInt(formEnvio.transporte_id),
          fecha_recoleccion: formEnvio.fecha_recoleccion,
          fecha_entrega_estimada: formEnvio.fecha_entrega_estimada,
          descripcion: formEnvio.descripcion,
          encargado_logistica_id: null // Se puede agregar después
        })
      });

      if (response.ok) {
        toast.success("¡Envío creado!", {
          description: "El envío ha sido registrado correctamente."
        });
        setMostrarFormularioEnvio(false);
        setDonacionParaEnvio(null);
        setFormEnvio({
          transporte_id: "",
          fecha_recoleccion: "",
          fecha_entrega_estimada: "",
          descripcion: ""
        });
        cargarDonaciones();
      } else {
        const error = await response.json();
        toast.error("Error al crear envío", {
          description: error.error
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const abrirFormularioEnvio = (donacion: Donacion) => {
    setDonacionParaEnvio(donacion);
    setMostrarFormularioEnvio(true);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getEstadoBadge = (donacion: Donacion) => {
    if (!donacion.envio_id) {
      return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Pendiente</span>;
    }

    const estado = donacion.envio?.estado_envio?.estado;
    if (estado === "Entregado") {
      return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Completada</span>;
    }

    return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">En proceso</span>;
  };

  // Ya no necesitamos filtrar en el frontend porque el backend lo hace
  const donacionesFiltradas = donaciones;

  return (
    <div className="space-y-6">
      {/* Toggle para cambiar entre Mis Donaciones y Donaciones Recibidas */}
      <div className="mb-6 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg w-fit mx-auto">
        <button
          onClick={() => {
            setTipoDonaciones("enviadas");
            setPage(1);
          }}
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${tipoDonaciones === "enviadas"
              ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-md"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
        >
          <span className="flex items-center gap-2">
            Mis Donaciones
          </span>
        </button>
        <button
          onClick={() => {
            setTipoDonaciones("recibidas");
            setPage(1);
          }}
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${tipoDonaciones === "recibidas"
              ? "bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-md"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
        >
          <span className="flex items-center gap-2">
            Donaciones Recibidas
          </span>
        </button>
      </div>



      {/* Filtros y búsqueda */}
      <div className="space-y-3">
        {/* Filtros de estado y búsqueda */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {/* Botones de filtro por estado */}
          <button
            onClick={() => {
              setFiltroEstado(filtroEstado === "pendiente" ? "" : "pendiente");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtroEstado === "pendiente"
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
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtroEstado === "proceso"
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
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtroEstado === "completada"
                ? "bg-green-500 text-white"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
          >
            Completadas
          </button>

          {/* Botón Nueva Donación - Debajo de Completadas en móvil, al lado en desktop */}
          <button
            onClick={() => {
              setMostrarFormulario(true);
              setBusquedaMedicamento("");
              setMedicamentoSeleccionado(null);
              setMostrarDropdownMedicamentos(false);
            }}
            className="sm:hidden w-full px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:ring-4 focus:ring-brand-300 font-medium transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Donación
          </button>

          <input
            type="text"
            placeholder="Buscar medicamento de la donación..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="flex-1 min-w-[200px] px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
          />

          {/* Botón Nueva Donación - Solo desktop */}
          <button
            onClick={() => {
              setMostrarFormulario(true);
              setBusquedaMedicamento("");
              setMedicamentoSeleccionado(null);
              setMostrarDropdownMedicamentos(false);
            }}
            className="hidden sm:flex px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:ring-4 focus:ring-brand-300 font-medium transition-colors items-center gap-2 text-sm whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Donación
          </button>
        </div>
      </div>
      {/* Lista de donaciones */}
      <div>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando donaciones...</p>
          </div>
        ) : donacionesFiltradas.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay donaciones</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No se encontraron donaciones.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {donacionesFiltradas.map((donacion) => {
              const esReceptor = Number(donacion.hospital_id) === Number(usuario?.hospital_id);
              
              return (
              <div
                key={donacion.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col">
                  <div className="flex items-start gap-4">
                    {/* Imagen de la donación (solo para receptor) */}
                    {esReceptor && donacion.imagen && (
                      <div className="flex-shrink-0">
                        <div className="aspect-square w-24 h-24 lg:w-32 lg:h-32 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                          <Image
                            src={donacion.imagen}
                            alt={donacion.medicamentos?.nombre || "Donación"}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {donacion.medicamentos?.nombre}
                      </h3>
                      {getEstadoBadge(donacion)}
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Fecha: {new Date(donacion.created_at).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>

                    <div className="space-y-2 text-sm">
                      {/* Mostrar De: solo en Donaciones Recibidas, Para: solo en Mis Donaciones */}
                      {tipoDonaciones === "recibidas" && donacion.hospital_origen && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7a3 3 0 013-3h8a3 3 0 013 3v14M9 10h.01M15 10h.01M10 21v-6h4v6M12 8v3M10.5 9.5h3" />
                          </svg>
                          <span className="font-medium">De:</span>
                          <span>{donacion.hospital_origen.nombre}</span>
                        </div>
                      )}
                      {tipoDonaciones === "enviadas" && donacion.hospitales && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7a3 3 0 013-3h8a3 3 0 013 3v14M9 10h.01M15 10h.01M10 21v-6h4v6M12 8v3M10.5 9.5h3" />
                          </svg>
                          <span className="font-medium">Para:</span>
                          <span>{donacion.hospitales.nombre}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="font-medium">{donacion.cantidad}</span>
                        <span>{donacion.unidad_dispensacion?.nombre || "unidades"}</span>
                      </div>

                      {donacion.descripcion && (
                        <p className="text-gray-600 dark:text-gray-400 mt-2">{donacion.descripcion}</p>
                      )}

                      {/* Estado de envío para receptor (solo móvil) */}
                      {Number(donacion.hospital_id) === Number(usuario?.hospital_id) && !donacion.envio_id && (
                        <div className="sm:hidden mt-3">
                          <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-lg text-sm font-medium">
                            Proceso de Envío
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botones para DONANTE - al lado del contenido */}
                  {Number(donacion.hospital_origen_id) === Number(usuario?.hospital_id) && (
                    <div className="flex sm:flex-col gap-2 mt-4 sm:mt-0">
                      {!donacion.envio_id ? (
                        <button
                          onClick={() => abrirFormularioEnvio(donacion)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium transition-colors"
                        >
                          Iniciar Envío
                        </button>
                      ) : (
                        <button
                          onClick={() => window.location.href = `/envios?id=${donacion.envio_id}`}
                          className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                        >
                          Seguimiento
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Botones para RECEPTOR - al final de la tarjeta */}
                {Number(donacion.hospital_id) === Number(usuario?.hospital_id) && Number(donacion.hospital_origen_id) !== Number(usuario?.hospital_id) && donacion.envio_id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => window.location.href = `/envios?id=${donacion.envio_id}`}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                    >
                      Ver Seguimiento
                    </button>
                  </div>
                )}
              </div>
            </div>
            );
            })}
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 rounded-lg mt-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Página <span className="font-medium">{page}</span> de{" "}
              <span className="font-medium">{totalPages}</span>
            </p>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="relative inline-flex items-center rounded-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Modal - Nueva Donación */}
      <Modal isOpen={mostrarFormulario} onClose={() => {
        setMostrarFormulario(false);
        // Resetear estados de búsqueda
        setBusquedaMedicamento("");
        setMedicamentoSeleccionado(null);
        setMostrarDropdownMedicamentos(false);
      }} className="max-w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Nueva Donación</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            Envíe una donación de medicamentos a otro hospital
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative medicamento-dropdown-container">
              <Label>Medicamento *</Label>
              <input
                type="text"
                value={medicamentoSeleccionado ? `${medicamentoSeleccionado.nombre} - ${medicamentoSeleccionado.referencia}` : busquedaMedicamento}
                onChange={(e) => {
                  setBusquedaMedicamento(e.target.value);
                  setMostrarDropdownMedicamentos(true);
                  setMedicamentoSeleccionado(null);
                  setFormData(prev => ({ ...prev, medicamento_id: "" }));
                }}
                onFocus={() => setMostrarDropdownMedicamentos(true)}
                placeholder="Buscar medicamento..."
                required
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
              {mostrarDropdownMedicamentos && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {medicamentos
                    .filter(med =>
                      med.nombre.toLowerCase().includes(busquedaMedicamento.toLowerCase()) ||
                      med.referencia.toLowerCase().includes(busquedaMedicamento.toLowerCase())
                    )
                    .slice(0, 50)
                    .map(med => (
                      <button
                        key={med.id}
                        type="button"
                        onClick={() => {
                          setMedicamentoSeleccionado(med);
                          setBusquedaMedicamento("");
                          setFormData(prev => ({ ...prev, medicamento_id: med.id.toString() }));
                          setMostrarDropdownMedicamentos(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="font-medium">{med.nombre}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Ref: {med.referencia}</div>
                      </button>
                    ))}
                  {medicamentos.filter(med =>
                    med.nombre.toLowerCase().includes(busquedaMedicamento.toLowerCase()) ||
                    med.referencia.toLowerCase().includes(busquedaMedicamento.toLowerCase())
                  ).length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                        No se encontraron medicamentos
                      </div>
                    )}
                </div>
              )}
            </div>

            <div>
              <Label>Hospital Destino *</Label>
              <select
                name="hospital_destino_id"
                value={formData.hospital_destino_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value="">Seleccione un hospital</option>
                {hospitales.filter(h => h.id !== usuario?.hospital_id).map(hospital => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cantidad *</Label>
                <input
                  type="number"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                />
              </div>

              <div>
                <Label>Unidad *</Label>
                <select
                  name="unidad_dispensacion_id"
                  value={formData.unidad_dispensacion_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                >
                  <option value="">Seleccione</option>
                  {unidadesDispensacion.map(unidad => (
                    <option key={unidad.id} value={unidad.id}>
                      {unidad.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label>Descripción</Label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                placeholder="Información adicional sobre la donación..."
              />
            </div>

            <div>
              <ImageUpload
                onImageChange={(url) => setFormData(prev => ({ ...prev, imagen: url || "" }))}
                currentImage={formData.imagen}
                label="Imagen de la donación (opcional)"
                tipo="donacion"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  // Resetear búsqueda
                  setBusquedaMedicamento("");
                  setMedicamentoSeleccionado(null);
                  setMostrarDropdownMedicamentos(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:ring-4 focus:ring-brand-300 font-medium transition-colors"
              >
                Crear Donación
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal - Iniciar Envío */}
      <Modal isOpen={mostrarFormularioEnvio} onClose={() => setMostrarFormularioEnvio(false)} className="max-w-[600px]">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Iniciar Envío</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Completa la información del envío para {donacionParaEnvio?.medicamentos?.nombre}
          </p>

          <form onSubmit={handleSubmitEnvio} className="space-y-4">
            <div>
              <Label>Transporte *</Label>
              <select
                name="transporte_id"
                value={formEnvio.transporte_id}
                onChange={handleChangeEnvio}
                required
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value="">Seleccione un transporte</option>
                {transportes.map(trans => (
                  <option key={trans.id} value={trans.id}>
                    {trans.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha de Recolección *</Label>
                <input
                  type="date"
                  name="fecha_recoleccion"
                  value={formEnvio.fecha_recoleccion}
                  onChange={handleChangeEnvio}
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                />
              </div>

              <div>
                <Label>Fecha Entrega Estimada *</Label>
                <input
                  type="date"
                  name="fecha_entrega_estimada"
                  value={formEnvio.fecha_entrega_estimada}
                  onChange={handleChangeEnvio}
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                />
              </div>
            </div>

            <div>
              <Label>Descripción</Label>
              <textarea
                name="descripcion"
                value={formEnvio.descripcion}
                onChange={handleChangeEnvio}
                rows={3}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                placeholder="Información adicional del envío..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setMostrarFormularioEnvio(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:ring-4 focus:ring-brand-300 font-medium transition-colors"
              >
                Crear Envío
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
