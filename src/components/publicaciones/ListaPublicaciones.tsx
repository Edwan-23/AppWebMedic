"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";
import ImageUpload from "@/components/form/ImageUpload";
import DatePicker from "@/components/form/date-picker";

interface Medicamento {
  id: number;
  nombre: string;
  referencia: string;
  concentracion: number;
  tipo_medicamento?: { nombre: string };
  medida_medicamento?: { nombre: string };
}

interface TipoPublicacion {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface EstadoPublicacion {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface UnidadDispensacion {
  id: number;
  nombre: string;
}

interface Aviso {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  created_at: string;
}

interface Publicacion {
  id: number;
  descripcion: string | null;
  cantidad: number;
  reg_invima: string;
  unidad_dispensacion_id: number | null;
  fecha_expiracion: string;
  fecha_creacion: string;
  created_at?: string;
  imagen?: string | null;
  medicamentos?: Medicamento;
  estado_publicacion?: EstadoPublicacion;
  tipo_publicacion?: TipoPublicacion;
  unidad_dispensacion?: UnidadDispensacion;
  hospitales?: {
    id?: number;
    nombre: string;
    direccion?: string;
    celular?: string;
    telefono?: string;
    municipios?: { nombre: string };
  };
}

interface ListaPublicacionesProps {
  initialData?: Publicacion[];
}

export default function ListaPublicaciones({ initialData = [] }: ListaPublicacionesProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>(initialData);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [tiposPublicacion, setTiposPublicacion] = useState<TipoPublicacion[]>([]);
  const [estadosPublicacion, setEstadosPublicacion] = useState<EstadoPublicacion[]>([]);
  const [unidadesDispensacion, setUnidadesDispensacion] = useState<UnidadDispensacion[]>([]);
  const [avisosPublicados, setAvisosPublicados] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSolicitud, setLoadingSolicitud] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalSolicitud, setMostrarModalSolicitud] = useState(false);
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState<Publicacion | null>(null);
  const [publicacionASolicitar, setPublicacionASolicitar] = useState<Publicacion | null>(null);
  const [metodoEnvio, setMetodoEnvio] = useState<"estandar" | "prioritario">("estandar");
  const [detallesVisibles, setDetallesVisibles] = useState<{ [key: number]: boolean }>({});

  // Estados para búsqueda de medicamentos
  const [busquedaMedicamento, setBusquedaMedicamento] = useState("");
  const [mostrarDropdownMedicamentos, setMostrarDropdownMedicamentos] = useState(false);
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState<Medicamento | null>(null);

  // Paginación y filtros
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [misPublicaciones, setMisPublicaciones] = useState(searchParams.get("mispublicaciones") === "true");

  // Ordenamiento
  const [orderByCreacion, setOrderByCreacion] = useState<"asc" | "desc">("desc");
  const [orderByExpiracion, setOrderByExpiracion] = useState<"asc" | "desc" | null>(null);

  // Formulario
  const [formData, setFormData] = useState({
    medicamento_id: "",
    descripcion: "",
    cantidad: "",
    reg_invima: "",
    unidad_dispensacion_id: "",
    fecha_expiracion: "",
    tipo_publicacion_id: "",
    estado_publicacion_id: "1", // Por defecto "Disponible"
    imagen: null as string | null
  });

  const [formDataEditar, setFormDataEditar] = useState({
    medicamento_id: "",
    descripcion: "",
    cantidad: "",
    reg_invima: "",
    unidad_dispensacion_id: "",
    fecha_expiracion: "",
    tipo_publicacion_id: "",
    estado_publicacion_id: "",
    imagen: null as string | null
  });

  const cargarPublicaciones = useCallback(async () => {
    setLoading(true);
    try {
      // Leer el parámetro directamente de la URL para asegurar sincronización
      const esMisPublicaciones = searchParams.get("mispublicaciones") === "true";
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(estadoFilter && { estado: estadoFilter }),
        ...(esMisPublicaciones && usuario?.hospital_id && { hospital_id: usuario.hospital_id.toString() }),
        ...(orderByExpiracion ? { orderBy: "fecha_expiracion", order: orderByExpiracion } : { orderBy: "created_at", order: orderByCreacion })
      });

      const response = await fetch(`/api/publicaciones?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPublicaciones(data.publicaciones);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast.error("Error al cargar publicaciones");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [searchParams, page, searchTerm, estadoFilter, usuario?.hospital_id, orderByExpiracion, orderByCreacion]);

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      setUsuario(JSON.parse(usuarioData));
    }
    cargarDatosIniciales();
    cargarAvisosPublicados();

    // Listener para actualización desde notificaciones
    const handleActualizarDatos = () => {
      cargarPublicaciones();
    };

    window.addEventListener('actualizarDatos', handleActualizarDatos);

    return () => {
      window.removeEventListener('actualizarDatos', handleActualizarDatos);
    };
  }, [cargarPublicaciones]);

  // Sincronizar estado con parámetro URL
  useEffect(() => {
    const esFiltroDeMisPublicaciones = searchParams.get("mispublicaciones") === "true";
    if (esFiltroDeMisPublicaciones !== misPublicaciones) {
      setMisPublicaciones(esFiltroDeMisPublicaciones);
      setPage(1);
    }
  }, [searchParams, misPublicaciones, setPage, setMisPublicaciones]);

  useEffect(() => {
    if (usuario) {
      cargarPublicaciones();
    }
  }, [page, searchTerm, estadoFilter, searchParams, orderByCreacion, orderByExpiracion, usuario, cargarPublicaciones]);

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
      const [resMed, resTipo, resEstado, resUnidades] = await Promise.all([
        fetch("/api/medicamentos"),
        fetch("/api/tipo-publicacion"),
        fetch("/api/estado-publicacion"),
        fetch("/api/unidad-dispensacion")
      ]);

      if (resMed.ok) {
        const dataMed = await resMed.json();
        // La API ahora devuelve { medicamentos: [], total: number }
        setMedicamentos(dataMed.medicamentos || dataMed);
      }

      if (resTipo.ok) {
        const dataTipo = await resTipo.json();
        setTiposPublicacion(dataTipo);
      }

      if (resEstado.ok) {
        const dataEstado = await resEstado.json();
        setEstadosPublicacion(dataEstado);
      }

      if (resUnidades.ok) {
        const dataUnidades = await resUnidades.json();
        setUnidadesDispensacion(dataUnidades);
      }
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
    }
  };

  const cargarAvisosPublicados = async () => {
    try {
      const response = await fetch("/api/avisos/publicados");
      if (response.ok) {
        const data = await response.json();
        setAvisosPublicados(data);
      }
    } catch (error) {
      console.error("Error al cargar avisos publicados:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.medicamento_id || !formData.cantidad || !formData.fecha_expiracion || !formData.tipo_publicacion_id) {
      toast.error("¡Campos requeridos!", {
        description: "Completa todos los campos obligatorios."
      });
      return;
    }

    const loadingToast = toast.loading("Creando publicación...");

    try {
      const response = await fetch("/api/publicaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cantidad: parseInt(formData.cantidad),
          hospital_id: usuario?.hospital_id,
          medicamento_id: parseInt(formData.medicamento_id),
          tipo_publicacion_id: parseInt(formData.tipo_publicacion_id),
          estado_publicacion_id: parseInt(formData.estado_publicacion_id),
          imagen: formData.imagen
        })
      });

      if (response.ok) {
        toast.success("¡Publicación creada!", {
          description: "El medicamento ha sido publicado correctamente.",
          id: loadingToast
        });
        setMostrarFormulario(false);
        cargarPublicaciones();
        setFormData({
          medicamento_id: "",
          descripcion: "",
          cantidad: "",
          reg_invima: "",
          unidad_dispensacion_id: "",
          fecha_expiracion: "",
          tipo_publicacion_id: "",
          estado_publicacion_id: "1",
          imagen: null
        });
      } else {
        const error = await response.json();
        toast.error("Error al crear publicación", {
          description: error.error,
          id: loadingToast
        });
      }
    } catch (error) {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor.",
        id: loadingToast
      });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setEstadoFilter("");
    setMisPublicaciones(false);
    setPage(1);
  };

  const toggleOrderByCreacion = () => {
    setOrderByExpiracion(null);
    setOrderByCreacion(prev => prev === "asc" ? "desc" : "asc");
    setPage(1);
  };

  const toggleOrderByExpiracion = () => {
    // Si está null, activarlo en asc, si no, alternar entre asc y desc
    if (orderByExpiracion === null) {
      setOrderByCreacion("desc");
      setOrderByExpiracion("asc");
    } else {
      setOrderByExpiracion(prev => prev === "asc" ? "desc" : "asc");
    }
    setPage(1);
  };

  const toggleDetalles = (publicacionId: number) => {
    setDetallesVisibles(prev => ({
      ...prev,
      [publicacionId]: !prev[publicacionId]
    }));
  };

  const abrirModalEditar = (publicacion: Publicacion) => {
    setPublicacionSeleccionada(publicacion);
    setFormDataEditar({
      medicamento_id: publicacion.medicamentos?.id?.toString() || "",
      descripcion: publicacion.descripcion || "",
      cantidad: publicacion.cantidad?.toString() || "",
      reg_invima: publicacion.reg_invima || "",
      unidad_dispensacion_id: publicacion.unidad_dispensacion_id?.toString() || "",
      fecha_expiracion: publicacion.fecha_expiracion ? new Date(publicacion.fecha_expiracion).toISOString().split('T')[0] : "",
      tipo_publicacion_id: publicacion.tipo_publicacion?.id?.toString() || "",
      estado_publicacion_id: publicacion.estado_publicacion?.id?.toString() || "",
      imagen: publicacion.imagen || null
    });
    setMostrarModalEditar(true);
  };

  const cerrarModalEditar = () => {
    setMostrarModalEditar(false);
    setPublicacionSeleccionada(null);
    setFormDataEditar({
      medicamento_id: "",
      descripcion: "",
      cantidad: "",
      reg_invima: "",
      unidad_dispensacion_id: "",
      fecha_expiracion: "",
      tipo_publicacion_id: "",
      estado_publicacion_id: "",
      imagen: null
    });
  };

  const handleChangeEditar = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormDataEditar(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicacionSeleccionada) return;

    if (!formDataEditar.medicamento_id || !formDataEditar.cantidad || !formDataEditar.reg_invima || !formDataEditar.fecha_expiracion || !formDataEditar.tipo_publicacion_id) {
      toast.error("¡Campos requeridos!", {
        description: "Completa todos los campos obligatorios."
      });
      return;
    }

    const loadingToast = toast.loading("Actualizando publicación...");

    try {
      const response = await fetch(`/api/publicaciones/${publicacionSeleccionada.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formDataEditar,
          cantidad: parseInt(formDataEditar.cantidad),
          reg_invima: parseInt(formDataEditar.reg_invima),
          medicamento_id: parseInt(formDataEditar.medicamento_id),
          tipo_publicacion_id: parseInt(formDataEditar.tipo_publicacion_id),
          estado_publicacion_id: parseInt(formDataEditar.estado_publicacion_id),
          imagen: formDataEditar.imagen
        })
      });

      if (response.ok) {
        toast.success("¡Publicación actualizada!", {
          description: "Los cambios se guardaron correctamente.",
          id: loadingToast
        });
        cerrarModalEditar();
        cargarPublicaciones();
      } else {
        const error = await response.json();
        toast.error("Error al actualizar", {
          description: error.error,
          id: loadingToast
        });
      }
    } catch (error) {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor.",
        id: loadingToast
      });
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

  const abrirModalSolicitud = (publicacion: Publicacion) => {
    setPublicacionASolicitar(publicacion);
    setMetodoEnvio("estandar");
    setMostrarModalSolicitud(true);
  };

  const cerrarModalSolicitud = () => {
    setPublicacionASolicitar(null);
    setMostrarModalSolicitud(false);
    setLoadingSolicitud(false);
  };

  const confirmarSolicitud = async () => {
    if (!usuario || !publicacionASolicitar) {
      toast.error("Error", { description: "Usuario no autenticado" });
      return;
    }

    if (loadingSolicitud) return; // Prevenir múltiples clics
    setLoadingSolicitud(true);

    const loadingToast = toast.loading("Enviando solicitud...");

    try {
      // 1. Obtener el ID del estado "Solicitado"
      const resEstados = await fetch("/api/estado-publicacion");
      if (!resEstados.ok) {
        throw new Error("No se pudieron cargar los estados");
      }
      const estados = await resEstados.json();
      const estadoSolicitado = estados.find((e: any) => e.nombre.toLowerCase() === "solicitado");

      if (!estadoSolicitado) {
        toast.error("Error de configuración", {
          description: "No se encontró el estado 'Solicitado' en la base de datos",
          id: loadingToast
        });
        setLoadingSolicitud(false);
        return;
      }

      // 2. Si es prioritario, NO crear solicitud aún, solo guardar datos y redirigir a pago
      if (metodoEnvio === "prioritario") {
        // Guardar datos temporalmente en sessionStorage
        const datosSolicitudTemporal = {
          publicacion_id: publicacionASolicitar.id,
          hospital_id: usuario.hospital_id,
          medicamento_id: publicacionASolicitar.medicamentos?.id,
          descripcion: `Solicitud de ${publicacionASolicitar.medicamentos?.nombre} - Método: Prioritario`,
          medicamento_nombre: publicacionASolicitar.medicamentos?.nombre,
          cantidad: publicacionASolicitar.cantidad,
          hospital_origen: publicacionASolicitar.hospitales?.nombre
        };

        sessionStorage.setItem('solicitudPrioritaria', JSON.stringify(datosSolicitudTemporal));

        toast.info("Redirigiendo a pago...", {
          description: "Completa el pago para confirmar tu solicitud prioritaria",
          id: loadingToast,
          duration: 2000
        });

        // Cerrar modal
        cerrarModalSolicitud();

        // Redirigir a página de pago
        setTimeout(() => {
          router.push('/pago-prioritario');
        }, 500);
        return;
      }

      // 3. Para envío estándar, crear la solicitud normalmente
      const resSolicitud = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicacion_id: publicacionASolicitar.id,
          hospital_id: usuario.hospital_id,
          medicamento_id: publicacionASolicitar.medicamentos?.id,
          descripcion: `Solicitud de ${publicacionASolicitar.medicamentos?.nombre} - Método: Estándar`
        })
      });

      if (!resSolicitud.ok) {
        const dataSolicitud = await resSolicitud.json();
        toast.error("Error al enviar solicitud", {
          description: dataSolicitud.error || "Intenta nuevamente",
          id: loadingToast
        });
        setLoadingSolicitud(false);
        return;
      }

      // 4. Para envío estándar, actualizar el estado de la publicación a "Solicitado"
      const resActualizar = await fetch(`/api/publicaciones/${publicacionASolicitar.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado_publicacion_id: estadoSolicitado.id
        })
      });

      if (!resActualizar.ok) {
        console.error("Error al actualizar estado de publicación");
        // Continuar aunque falle la actualización del estado
      }

      toast.success("¡Solicitud enviada!", {
        description: `Se ha solicitado ${publicacionASolicitar.medicamentos?.nombre}`,
        id: loadingToast
      });

      cerrarModalSolicitud();
      // Recargar para actualizar la lista y remover la publicación solicitada
      await cargarPublicaciones();

    } catch (error) {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor",
        id: loadingToast
      });
      setLoadingSolicitud(false);
    }
  };

  const handleSolicitar = async (publicacion: Publicacion) => {
    abrirModalSolicitud(publicacion);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      {/* Avisos Publicados */}
      {avisosPublicados.length > 0 && (
        <div className="space-y-3">
          {avisosPublicados.map((aviso) => (
            <div
              key={aviso.id}
              className="rounded-xl border-l-4 border-l-brand-500 bg-brand-50 p-4 dark:bg-brand-900/10 dark:border-l-brand-400"
            >
              <div className="flex items-start gap-3">
                <svg
                  className="h-6 w-6 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {aviso.titulo}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {aviso.descripcion}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Barra de búsqueda, filtros y botón */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col flex-1 gap-3 lg:flex-row lg:items-center">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Buscador"
              className="w-full px-4 py-3 pl-10 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
            <svg
              className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Filtro Estado */}
          <select
            value={estadoFilter}
            onChange={(e) => { setEstadoFilter(e.target.value); setPage(1); }}
            className="px-3 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="">Todos los estados</option>
            {estadosPublicacion.map(estado => (
              <option key={estado.id} value={estado.nombre}>{estado.nombre}</option>
            ))}
          </select>

          {/* Ordenar por Fecha de Creación */}
          <button
            onClick={toggleOrderByCreacion}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${orderByExpiracion === null
              ? "bg-brand-500 text-white hover:bg-brand-600"
              : "border-2 border-gray-300 text-gray-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-brand-500 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
              }`}
          >
            <Image 
              src="/images/icons/calendar.svg" 
              alt="Calendario" 
              width={16} 
              height={16}
              className="w-4 h-4"
            />
            Fecha Creación
            {orderByExpiracion === null && (
              <Image 
                src="/images/icons/arrow-up.svg" 
                alt="Ordenar" 
                width={16} 
                height={16}
                className={`w-4 h-4 transition-transform ${orderByCreacion === "desc" ? "rotate-180" : ""}`}
              />
            )}
          </button>

          {/* Ordenar por Fecha de Vencimiento */}
          <button
            onClick={toggleOrderByExpiracion}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${orderByExpiracion !== null
              ? "bg-brand-500 text-white hover:bg-brand-600"
              : "border-2 border-gray-300 text-gray-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-brand-500 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
              }`}
          >
            <Image 
              src="/images/icons/clock.svg" 
              alt="Reloj" 
              width={16} 
              height={16}
              className="w-4 h-4"
            />
            Vencimiento
            {orderByExpiracion !== null && (
              <Image 
                src="/images/icons/arrow-up.svg" 
                alt="Ordenar" 
                width={16} 
                height={16}
                className={`w-4 h-4 transition-transform ${orderByExpiracion === "desc" ? "rotate-180" : ""}`}
              />
            )}
          </button>

          {/* Botón Limpiar filtros */}
          {(searchTerm || estadoFilter) && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-3 text-sm text-gray-600 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (misPublicaciones) {
                // Si está activo, quitar el parámetro
                router.push('/publicaciones');
              } else {
                // Si no está activo, agregarlo
                router.push('/publicaciones?mispublicaciones=true');
              }
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors rounded-lg ${misPublicaciones
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Mis Publicaciones
          </button>
          <button
            onClick={() => {
              setMostrarFormulario(!mostrarFormulario);
              // Resetear estados de búsqueda al cerrar
              if (mostrarFormulario) {
                setBusquedaMedicamento("");
                setMedicamentoSeleccionado(null);
                setMostrarDropdownMedicamentos(false);
              }
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white transition-colors rounded-lg ${mostrarFormulario
              ? "bg-red-500 hover:bg-red-600"
              : "bg-brand-500 hover:bg-brand-600"
              }`}
          >
            {mostrarFormulario ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
            {mostrarFormulario ? "Cancelar" : "Nueva Publicación"}
          </button>
        </div>
      </div>

      {/* Formulario de Nueva Publicación */}
      {mostrarFormulario && (
        <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
            Nueva Publicación de Medicamento
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">

              <div>
                <Label>Tipo de Publicación *</Label>
                <select
                  name="tipo_publicacion_id"
                  value={formData.tipo_publicacion_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                >
                  <option value="">Seleccione tipo</option>
                  {tiposPublicacion.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                  ))}
                </select>
              </div>

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
                <Label>Unidad de dispensación *</Label>
                <select
                  name="unidad_dispensacion_id"
                  value={formData.unidad_dispensacion_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                >
                  <option value="">Seleccione una unidad</option>
                  {unidadesDispensacion.map(unidad => (
                    <option key={unidad.id} value={unidad.id}>
                      {unidad.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Cantidad *</Label>
                <input
                  type="number"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleChange}
                  min="1"
                  placeholder="0"
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                />
              </div>

              <div>
                <Label>Registro INVIMA *</Label>
                <input
                  type="text"
                  name="reg_invima"
                  value={formData.reg_invima}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                />
              </div>

              <div>
                <DatePicker
                  id="fecha_expiracion_crear"
                  label="Fecha de Expiración *"
                  placeholder="Seleccione una fecha"
                  defaultDate={formData.fecha_expiracion || undefined}
                  minDate={new Date()}
                  onChange={(selectedDates) => {
                    if (selectedDates && selectedDates.length > 0) {
                      const fecha = selectedDates[0];
                      const fechaFormateada = fecha.toISOString().split('T')[0];
                      setFormData(prev => ({ ...prev, fecha_expiracion: fechaFormateada }));
                    }
                  }}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <Label>Descripción</Label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Detalles adicionales sobre el medicamento..."
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <ImageUpload
                  onImageChange={(base64) => setFormData(prev => ({ ...prev, imagen: base64 }))}
                  currentImage={formData.imagen}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="px-6 py-3 text-sm font-semibold text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-3 text-sm font-semibold text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600"
              >
                Publicar Medicamento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de publicaciones */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 rounded-full border-brand-500 border-t-transparent animate-spin"></div>
        </div>
      ) : publicaciones.length === 0 ? (
        <div className="py-12 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">No se encontraron publicaciones</p>
        </div>
      ) : (
        <div className="space-y-4">
          {publicaciones.map((pub) => (
            <div
              key={pub.id}
              className="overflow-hidden transition-shadow border border-gray-200 rounded-2xl dark:border-gray-800 hover:shadow-lg"
            >
              {/* Contenedor principal horizontal */}
              <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-start lg:justify-between">

                {/* Sección imagen + info básica (móvil) / Solo imagen (desktop) */}
                <div className="flex gap-3 lg:block">
                  {/* Imagen de la publicación */}
                  {pub.imagen && (
                    <div className="flex-shrink-0">
                      <div className="aspect-square w-24 h-24 lg:w-32 lg:h-32 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <Image
                          src={pub.imagen}
                          alt={pub.medicamentos?.nombre || "Medicamento"}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Info básica al lado de la imagen (móvil) */}
                  <div className="flex-1 min-w-0 lg:hidden">
                    <h3 className="mb-1 text-base font-semibold text-gray-800 dark:text-white line-clamp-2">
                      {pub.medicamentos?.nombre}
                    </h3>
                    <div className="flex flex-col gap-1.5 text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        Ref: {pub.medicamentos?.referencia}
                      </span>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="font-medium">{pub.cantidad}</span> {pub.unidad_dispensacion?.nombre || "unidades"}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Vencimiento: <span className="font-medium">{formatearFecha(pub.fecha_expiracion)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del medicamento (solo desktop o resto info móvil) */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    {/* Icono de medicamento (solo si no hay imagen) */}
                    {!pub.imagen && (
                      <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-lg bg-brand-50 dark:bg-brand-900/20">
                        <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                    )}

                    {/* Detalles del medicamento */}
                    <div className="flex-1 min-w-0">
                      {/* Título (solo desktop) */}
                      <h3 className="hidden lg:block mb-1 text-lg font-semibold text-gray-800 dark:text-white">
                        {pub.medicamentos?.nombre}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
                        {/* Referencia solo desktop */}
                        <span className="hidden lg:inline-block px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                          {pub.medicamentos?.referencia}
                        </span>
                        {pub.medicamentos?.tipo_medicamento && (
                          <span className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                            {pub.medicamentos.tipo_medicamento.nombre}
                          </span>
                        )}
                        <span className="px-2 py-1 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                          {pub.tipo_publicacion?.nombre}
                        </span>
                      </div>

                      {pub.descripcion && (
                        <p className="text-sm text-gray-600 line-clamp-2 dark:text-gray-400">
                          {pub.descripcion}
                        </p>
                      )}

                      {/* Info compacta (solo desktop o info adicional móvil) */}
                      <div className="flex flex-wrap gap-4 mt-3 text-sm">
                        {/* Cantidad solo desktop */}
                        <div className="hidden lg:flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Image 
                            src="/images/icons/box.svg" 
                            alt="Cantidad" 
                            width={16} 
                            height={16}
                            className="w-4 h-4"
                          />
                          <span className="font-medium">{pub.cantidad}</span> {pub.unidad_dispensacion?.nombre || "unidades"}
                        </div>
                        {/* Fecha de expiración solo desktop */}
                        <div className="hidden lg:flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Image 
                            src="/images/icons/calendar.svg" 
                            alt="Vencimiento" 
                            width={16} 
                            height={16}
                            className="w-4 h-4"
                          />
                          Vencimiento: <span className="font-medium">{formatearFecha(pub.fecha_expiracion)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Image 
                            src="/images/icons/document-text.svg" 
                            alt="INVIMA" 
                            width={16} 
                            height={16}
                            className="w-4 h-4"
                          />
                          INVIMA: <span className="font-medium">{pub.reg_invima}</span>
                        </div>

                        {pub.medicamentos?.medida_medicamento && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Image 
                              src="/images/icons/beaker.svg" 
                              alt="Concentración" 
                              width={16} 
                              height={16}
                              className="w-4 h-4"
                            />
                            {pub.medicamentos.concentracion} {pub.medicamentos.medida_medicamento.nombre}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección derecha: Estado y Acciones */}
                <div className="flex flex-col items-end gap-3 lg:min-w-[200px]">
                  {/* Badge de estado y fecha juntos en móvil */}
                  <div className="flex items-center justify-between w-full gap-3 lg:flex-col lg:items-end lg:w-auto">
                    {/* Fecha de publicación (primero en móvil) */}
                    {pub.created_at && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Image 
                          src="/images/icons/clock.svg" 
                          alt="Fecha" 
                          width={14} 
                          height={14}
                          className="w-3.5 h-3.5"
                        />
                        <span>{formatearFecha(pub.created_at)}</span>
                      </div>
                    )}

                    {/* Badge de estado */}
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${pub.estado_publicacion?.nombre === "Disponible"
                        ? "bg-success-50 text-success-600 dark:bg-success-900/20"
                        : pub.estado_publicacion?.nombre === "Pendiente"
                          ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20"
                          : pub.estado_publicacion?.nombre === "Solicitado"
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                            : pub.estado_publicacion?.nombre === "Caducado"
                              ? "bg-warning-50 text-warning-600 dark:bg-warning-900/20"
                              : pub.estado_publicacion?.nombre === "Eliminado"
                                ? "bg-error-50 text-error-600 dark:bg-error-900/20"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800"
                        }`}
                    >
                      {pub.estado_publicacion?.nombre}
                    </span>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-wrap gap-2 lg:flex-col lg:w-full">
                    {/* Botón Solicitar o Editar según sea propio */}
                    {Number(usuario?.hospital_id) === Number(pub.hospitales?.id) ? (
                      <button
                        onClick={() => abrirModalEditar(pub)}
                        className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600 lg:w-full"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                    ) : (
                      pub.estado_publicacion?.nombre !== "Solicitado" && (
                        <button
                          onClick={() => handleSolicitar(pub)}
                          className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-success-500 hover:bg-success-600 lg:w-full"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Solicitar
                        </button>
                      )
                    )}

                    {/* Botón Detalles */}
                    <button
                      onClick={() => toggleDetalles(pub.id)}
                      className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-medium transition-colors border border-gray-300 rounded-lg text-brand-600 hover:bg-brand-50 dark:border-gray-700 dark:hover:bg-brand-900/20 lg:w-full"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {detallesVisibles[pub.id] ? "Ocultar" : "Detalles"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Panel de detalles desplegable */}
              {detallesVisibles[pub.id] && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">
                    Información del Hospital
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {/* Nombre del hospital */}
                    <div className="flex items-start gap-2">
                      <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Hospital</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                          {pub.hospitales?.nombre}
                        </p>
                      </div>
                    </div>

                    {/* Ubicación */}
                    {pub.hospitales?.municipios?.nombre && (
                      <div className="flex items-start gap-2">
                        <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Ubicación</p>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            {pub.hospitales.municipios.nombre}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Dirección con copiar */}
                    {pub.hospitales?.direccion && (
                      <div className="flex items-start gap-2">
                        <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Dirección</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                              {pub.hospitales.direccion}
                            </p>
                            <button
                              onClick={() => copiarAlPortapapeles(pub.hospitales!.direccion!, "Dirección")}
                              className="flex-shrink-0 p-1 transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                              title="Copiar dirección"
                            >
                              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Celular con copiar */}
                    {pub.hospitales?.celular && (
                      <div className="flex items-start gap-2">
                        <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Celular</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                              {pub.hospitales.celular}
                            </p>
                            <button
                              onClick={() => copiarAlPortapapeles(pub.hospitales!.celular!, "Celular")}
                              className="flex-shrink-0 p-1 transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                              title="Copiar celular"
                            >
                              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Teléfono con copiar */}
                    {pub.hospitales?.telefono && (
                      <div className="flex items-start gap-2">
                        <svg className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                              {pub.hospitales.telefono}
                            </p>
                            <button
                              onClick={() => copiarAlPortapapeles(pub.hospitales!.telefono!, "Teléfono")}
                              className="flex-shrink-0 p-1 transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                              title="Copiar teléfono"
                            >
                              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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

      {/* Modal de Edición */}
      <Modal isOpen={mostrarModalEditar} onClose={cerrarModalEditar} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Editar Publicación
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Actualiza la información del medicamento publicado.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleUpdate}>
            <div className="px-2 pb-3 overflow-y-auto custom-scrollbar max-h-[450px]">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Medicamento *</Label>
                  <select
                    name="medicamento_id"
                    value={formDataEditar.medicamento_id}
                    onChange={handleChangeEditar}
                    required
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <option value="">Seleccione un medicamento</option>
                    {medicamentos.map(med => (
                      <option key={med.id} value={med.id}>
                        {med.nombre} - {med.referencia}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Tipo de Publicación *</Label>
                  <select
                    name="tipo_publicacion_id"
                    value={formDataEditar.tipo_publicacion_id}
                    onChange={handleChangeEditar}
                    required
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <option value="">Seleccione tipo</option>
                    {tiposPublicacion.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Estado *</Label>
                  <select
                    name="estado_publicacion_id"
                    value={formDataEditar.estado_publicacion_id}
                    onChange={handleChangeEditar}
                    required
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <option value="">Seleccione estado</option>
                    {estadosPublicacion.map(estado => (
                      <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Cantidad *</Label>
                  <input
                    type="number"
                    name="cantidad"
                    value={formDataEditar.cantidad}
                    onChange={handleChangeEditar}
                    min="1"
                    placeholder="0"
                    required
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Unidad de dispensación *</Label>
                  <select
                    name="unidad_dispensacion_id"
                    value={formDataEditar.unidad_dispensacion_id}
                    onChange={handleChangeEditar}
                    required
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <option value="">Seleccione una unidad</option>
                    {unidadesDispensacion.map(unidad => (
                      <option key={unidad.id} value={unidad.id}>
                        {unidad.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <DatePicker
                    id="fecha_expiracion_editar"
                    label="Fecha de Expiración *"
                    placeholder="Seleccione una fecha"
                    defaultDate={formDataEditar.fecha_expiracion || undefined}
                    minDate={new Date()}
                    onChange={(selectedDates) => {
                      if (selectedDates && selectedDates.length > 0) {
                        const fecha = selectedDates[0];
                        const fechaFormateada = fecha.toISOString().split('T')[0];
                        setFormDataEditar(prev => ({ ...prev, fecha_expiracion: fechaFormateada }));
                      }
                    }}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Descripción</Label>
                  <textarea
                    name="descripcion"
                    value={formDataEditar.descripcion}
                    onChange={handleChangeEditar}
                    rows={3}
                    placeholder="Detalles adicionales sobre el medicamento..."
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>

                <div className="col-span-2">
                  <ImageUpload
                    onImageChange={(base64) => setFormDataEditar(prev => ({ ...prev, imagen: base64 }))}
                    currentImage={formDataEditar.imagen}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <button
                type="button"
                onClick={cerrarModalEditar}
                className="px-4 py-3 text-sm font-semibold text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-3 text-sm font-semibold text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600"
              >
                Actualizar
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Solicitud */}
      <Modal isOpen={mostrarModalSolicitud} onClose={cerrarModalSolicitud} className="max-w-[500px] m-4">
        <div className="relative w-full p-6 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-8">
          <div className="mb-6">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Solicitar Medicamento
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {publicacionASolicitar?.medicamentos?.nombre}
            </p>
          </div>

          <div className="mb-6">
            <h5 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
              Método de envío
            </h5>

            <div className="space-y-3">
              {/* Opción Estándar */}
              <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                <input
                  type="radio"
                  name="metodoEnvio"
                  value="estandar"
                  checked={metodoEnvio === "estandar"}
                  onChange={(e) => setMetodoEnvio(e.target.value as "estandar" | "prioritario")}
                  className="w-5 h-5 mt-0.5 text-brand-500 focus:ring-brand-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Estándar</span>
                    <span className="text-sm font-semibold text-green-600">Gratis</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Entrega en 5-7 días hábiles. Sin costo adicional.
                  </p>
                </div>
              </label>

              {/* Opción Prioritario */}
              <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                <input
                  type="radio"
                  name="metodoEnvio"
                  value="prioritario"
                  checked={metodoEnvio === "prioritario"}
                  onChange={(e) => setMetodoEnvio(e.target.value as "estandar" | "prioritario")}
                  className="w-5 h-5 mt-0.5 text-brand-500 focus:ring-brand-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Prioritario</span>
                    <span className="text-sm font-semibold text-brand-600">$50.000 COP</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Entrega en 1-2 días hábiles. Envío express.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              type="button"
              onClick={cerrarModalSolicitud}
              className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarSolicitud}
              disabled={loadingSolicitud}
              className="flex-1 px-4 py-3 text-sm font-semibold text-white transition-colors rounded-lg bg-success-500 hover:bg-success-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingSolicitud ? "Procesando..." : "Confirmar Solicitud"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
