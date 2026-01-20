"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import ConfirmModal from "@/components/common/ConfirmModal";
import Select from "@/components/form/Select";

interface EncargadoLogistica {
  id: number;
  nombre: string;
  apellido: string;
  cedula: number;
  correo?: string;
  celular: number;
  hospital_id?: number;
}

interface Medicamento {
  id: number;
  nombre: string;
  referencia: string;
}

interface Hospital {
  id: number;
  nombre: string;
}

interface Solicitud {
  id: number;
  hospital_id?: number;
  hospital_origen_id?: number;
  descripcion?: string;
  cantidad?: number;
  unidad_dispensacion_id?: number;
  medicamentos?: Medicamento;
  hospitales?: Hospital;
  hospital_origen?: Hospital;
  unidad_dispensacion?: {
    id: number;
    nombre: string;
  };
}

interface Donacion {
  id: number;
  descripcion?: string;
  cantidad: number;
  hospital_origen_id?: number;
  medicamentos?: Medicamento;
  hospitales?: Hospital;
  unidad_dispensacion_id?: number;
  unidad_dispensacion?: {
    id: number;
    nombre: string;
  };
}

interface EstadoEnvio {
  id: number;
  estado?: string;
  guia: string;
}

interface Transporte {
  id: number;
  nombre: string;
}

interface Envio {
  id: number;
  descripcion?: string;
  fecha_recoleccion?: string;
  fecha_entrega_estimada?: string;
  created_at: string;
  pin?: string | null;
  transporte?: Transporte;
  estado_envio?: EstadoEnvio;
  solicitudes?: Solicitud;
  donaciones?: Donacion[];
  encargado_logistica_id?: number;
}

interface FormularioEncargado {
  nombre: string;
  apellido: string;
  cedula: string;
  correo: string;
  celular: string;
}

export default function ListaEnvios() {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [encargado, setEncargado] = useState<EncargadoLogistica | null>(null);
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para el cambio de estado y PIN
  const [modalCambiarEstado, setModalCambiarEstado] = useState(false);
  const [envioSeleccionado, setEnvioSeleccionado] = useState<Envio | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<string>("");
  const [pinIngresado, setPinIngresado] = useState("");
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [pinGenerado, setPinGenerado] = useState<string | null>(null);
  const [mostrarPin, setMostrarPin] = useState(false);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [filtroRol, setFiltroRol] = useState<"" | "recibiendo" | "enviando">("");
  const [ordenRecoleccion, setOrdenRecoleccion] = useState<"asc" | "desc">("desc");
  const [envioDestacado, setEnvioDestacado] = useState<number | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);

  const [formulario, setFormulario] = useState<FormularioEncargado>({
    nombre: "",
    apellido: "",
    cedula: "",
    correo: "",
    celular: ""
  });

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      const user = JSON.parse(usuarioData);
      setUsuario(user);
      cargarEncargado(user.hospital_id);
      cargarEnvios(user.hospital_id);
    }

    // Detectar si hay un ID de envío en la URL
    const params = new URLSearchParams(window.location.search);
    const envioId = params.get("id") || params.get("envio_id");
    if (envioId) {
      setEnvioDestacado(parseInt(envioId));
      // Scroll al envío después de cargar
      setTimeout(() => {
        const elemento = document.getElementById(`envio-${envioId}`);
        if (elemento) {
          elemento.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);
    }

    // Listener para actualización desde notificaciones
    const handleActualizarDatos = (event: any) => {
      const usuarioData = localStorage.getItem("usuario");
      if (usuarioData) {
        const user = JSON.parse(usuarioData);
        cargarEnvios(user.hospital_id);
      }
    };

    window.addEventListener('actualizarDatos', handleActualizarDatos);

    return () => {
      window.removeEventListener('actualizarDatos', handleActualizarDatos);
    };
  }, [page]);

  const cargarEncargado = async (hospitalId: number) => {
    try {
      const res = await fetch(`/api/encargado-logistica?hospital_id=${hospitalId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.encargado) {
        setEncargado(data.encargado);
      }
    } catch (error) {
      console.error("Error al cargar encargado:", error);
    }
  };

  const cargarEnvios = async (hospitalId: number) => {
    setLoading(true);
    try {
      // Detectar si hay un envío específico en la URL
      const params = new URLSearchParams(window.location.search);
      const envioIdUrl = params.get("id") || params.get("envio_id");
      
      let url = `/api/envios?hospital_id=${hospitalId}&page=${page}&limit=10`;
      
      // Si hay un envio_id específico, solo cargar ese envío
      if (envioIdUrl) {
        url = `/api/envios?envio_id=${envioIdUrl}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al cargar envíos");
      const data = await res.json();
      setEnvios(data.envios || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar los envíos");
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar URL y recargar todos los envíos
  const limpiarURLYRecargar = () => {
    // Eliminar parámetros de la URL
    const nuevaUrl = window.location.pathname;
    window.history.replaceState({}, '', nuevaUrl);
    
    // Limpiar el envío destacado
    setEnvioDestacado(null);
    
    // Recargar todos los envíos del hospital
    if (usuario?.hospital_id) {
      cargarEnvios(parseInt(usuario.hospital_id));
    }
  };

  // Manejar cambio de filtro de rol
  const cambiarFiltroRol = (nuevoFiltro: "" | "recibiendo" | "enviando") => {
    limpiarURLYRecargar();
    setFiltroRol(filtroRol === nuevoFiltro ? "" : nuevoFiltro);
  };

  // Manejar cambio de filtro de estado
  const cambiarFiltroEstado = (nuevoEstado: string) => {
    limpiarURLYRecargar();
    setFiltroEstado(nuevoEstado);
  };

  const abrirModal = (editar = false) => {
    if (editar && encargado) {
      setFormulario({
        nombre: encargado.nombre,
        apellido: encargado.apellido,
        cedula: encargado.cedula.toString(),
        correo: encargado.correo || "",
        celular: encargado.celular.toString()
      });
      setModoEdicion(true);
    } else {
      setFormulario({
        nombre: "",
        apellido: "",
        cedula: "",
        correo: "",
        celular: ""
      });
      setModoEdicion(false);
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModoEdicion(false);
  };

  const actualizarCampo = (campo: keyof FormularioEncargado, valor: string) => {
    setFormulario(prev => ({ ...prev, [campo]: valor }));
  };

  const guardarEncargado = async () => {
    if (!formulario.nombre || !formulario.apellido || !formulario.cedula || !formulario.celular) {
      toast.error("Completa los campos obligatorios");
      return;
    }

    if (!usuario?.hospital_id) {
      toast.error("No se encontró información del hospital");
      return;
    }

    // Validar que cédula sea un número válido
    const cedulaNum = parseInt(formulario.cedula);

    if (isNaN(cedulaNum)) {
      toast.error("La cédula debe ser un número válido");
      return;
    }

    // Validar que celular tenga solo números
    if (!/^\d+$/.test(formulario.celular)) {
      toast.error("El celular debe contener solo números");
      return;
    }

    // Validar que hospital_id sea un número
    const hospitalId = Number(usuario.hospital_id);
    if (isNaN(hospitalId)) {
      toast.error("ID del hospital inválido");
      return;
    }

    setGuardando(true);
    try {
      const url = modoEdicion ? `/api/encargado-logistica/${encargado?.id}` : "/api/encargado-logistica";
      const method = modoEdicion ? "PUT" : "POST";

      const payload = {
        nombre: formulario.nombre,
        apellido: formulario.apellido,
        cedula: cedulaNum,
        correo: formulario.correo || null,
        celular: formulario.celular,
        hospital_id: hospitalId
      };

      console.log("Enviando payload:", payload);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error del servidor:", errorData);
        throw new Error(errorData.error || "Error al guardar encargado");
      }

      const data = await res.json();
      setEncargado(data.encargado);
      toast.success(modoEdicion ? "Encargado actualizado" : "Encargado registrado correctamente");
      cerrarModal();
    } catch (error: any) {
      console.error("Error completo:", error);
      toast.error(error.message || "Error al guardar el encargado");
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminacion = async () => {
    if (!encargado) return;

    setEliminando(true);
    try {
      const res = await fetch(`/api/encargado-logistica/${encargado.id}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al eliminar el encargado");
        return;
      }

      setEncargado(null);
      setModalEliminar(false);
      toast.success("Encargado eliminado correctamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar el encargado");
    } finally {
      setEliminando(false);
    }
  };

  // Función para iniciar el cambio de estado
  const iniciarCambioEstado = (envio: Envio, estadoNuevo: string) => {
    setEnvioSeleccionado(envio);
    setNuevoEstado(estadoNuevo);
    setPinIngresado("");
    setPinGenerado(null);
    setMostrarPin(false);
    
    // Si el nuevo estado es "Entregado", mostrar el modal para ingresar PIN
    if (estadoNuevo.toLowerCase() === "entregado") {
      setModalCambiarEstado(true);
    } else {
      // Para otros estados, cambiar directamente
      cambiarEstadoEnvio(envio.id, estadoNuevo);
    }
  };

  // Función para cambiar el estado del envío
  const cambiarEstadoEnvio = async (envioId: number, estadoNuevo: string, pin?: string) => {
    setCambiandoEstado(true);
    try {
      const res = await fetch(`/api/envios/${envioId}/cambiar-estado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nuevoEstadoNombre: estadoNuevo,
          ...(pin && { pin })
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al cambiar el estado");
        return;
      }

      toast.success(`Estado actualizado a ${estadoNuevo}`);

      // Recargar los envíos
      if (usuario?.hospital_id) {
        await cargarEnvios(usuario.hospital_id);
      }

      // Cerrar modal si estaba abierto
      setModalCambiarEstado(false);
      setPinIngresado("");

    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cambiar el estado");
    } finally {
      setCambiandoEstado(false);
    }
  };

  // Función para confirmar entrega con PIN
  const confirmarEntregaConPin = async () => {
    if (!envioSeleccionado || !pinIngresado) {
      toast.error("Ingresa el PIN de 4 dígitos");
      return;
    }

    if (pinIngresado.length !== 4) {
      toast.error("El PIN debe tener 4 dígitos");
      return;
    }

    await cambiarEstadoEnvio(envioSeleccionado.id, nuevoEstado, pinIngresado);
  };

  // Función para obtener el siguiente estado permitido
  const obtenerSiguienteEstado = (estadoActual?: string): string | null => {
    if (!estadoActual) return null;

    const estadoLower = estadoActual.toLowerCase();

    if (estadoLower === "empaquetando") return "En tránsito";
    if (estadoLower === "en tránsito") return "Distribución";
    if (estadoLower === "distribución") return "Entregado";

    return null; // Ya está entregado
  };

  // Función para verificar si se puede cambiar el estado
  const puedeCambiarEstado = (envio: Envio): boolean => {
    const rol = obtenerRolEnvio(envio);
    const estadoActual = envio.estado_envio?.estado?.toLowerCase();

    // Solo quien ENVÍA puede cambiar el estado hasta "Distribución"
    if (rol !== 'enviando') return false;

    // No se puede cambiar si ya está entregado
    if (estadoActual === 'entregado') return false;

    // requiere PIN
    return true;
  };

  const getEstadoBadgeColor = (estado?: string) => {
    if (!estado) return "bg-gray-100 text-gray-800";

    switch (estado.toLowerCase()) {
      case "empaquetando":
      case "en preparación":
        return "bg-yellow-100 text-yellow-800";
      case "en tránsito":
        return "bg-blue-100 text-blue-800";
      case "distribución":
        return "bg-indigo-100 text-indigo-800";
      case "entregado":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Estados del proceso de envío (4 estados)
  const estadosProgreso = [
    {
      nombre: "Empaquetando",
      icono: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      nombre: "En tránsito",
      icono: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      )
    },
    {
      nombre: "Distribución",
      icono: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      nombre: "Entregado",
      icono: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const obtenerIndiceEstado = (estado?: string) => {
    if (!estado) return -1;
    return estadosProgreso.findIndex(e => e.nombre.toLowerCase() === estado.toLowerCase());
  };

  // Obtener porcentaje de progreso basado en la suma acumulativa de guia
  const obtenerPorcentajeProgreso = (estadoActual?: string): number => {
    if (!estadoActual) return 0;

    const indice = obtenerIndiceEstado(estadoActual);
    if (indice < 0) return 0;

    // Porcentaje acumulativo según el estado
    const porcentajes = [25, 50, 75, 100];
    return porcentajes[indice] || 0;
  };

  const obtenerRolEnvio = (envio: Envio): 'recibiendo' | 'enviando' | null => {
    if (!usuario) return null;
    
    // Si es una solicitud
    if (envio.solicitudes) {
      // Si mi hospital es el origen (quien envía), estoy ENVIANDO
      if (envio.solicitudes.hospital_origen_id && Number(envio.solicitudes.hospital_origen_id) === Number(usuario.hospital_id)) {
        return 'enviando';
      }
      // Si mi hospital es el destino (quien solicitó), estoy RECIBIENDO
      if (envio.solicitudes.hospital_id && Number(envio.solicitudes.hospital_id) === Number(usuario.hospital_id)) {
        return 'recibiendo';
      }
    }
    
    // Si es una donación
    if (envio.donaciones && envio.donaciones.length > 0) {
      const donacion = envio.donaciones[0];
      
      // Si mi hospital es el origen (donante), estoy ENVIANDO
      if (donacion.hospital_origen_id && Number(donacion.hospital_origen_id) === Number(usuario.hospital_id)) {
        return 'enviando';
      }
      // Si mi hospital es el destino, estoy RECIBIENDO
      if (donacion.hospitales?.id && Number(donacion.hospitales.id) === Number(usuario.hospital_id)) {
        return 'recibiendo';
      }
    }
    
    return null;
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const enviosFiltrados = envios
    .filter((envio) => {
      let cumpleFiltros = true;

      // Filtro por estado
      if (filtroEstado && envio.estado_envio?.estado !== filtroEstado) {
        cumpleFiltros = false;
      }

      // Filtro por rol (Recibiendo/Enviando)
      if (filtroRol) {
        const rol = obtenerRolEnvio(envio);
        if (rol !== filtroRol) {
          cumpleFiltros = false;
        }
      }

      return cumpleFiltros;
    })
    .sort((a, b) => {
      // Ordenar por fecha de recolección
      const fechaA = a.fecha_recoleccion ? new Date(a.fecha_recoleccion).getTime() : 0;
      const fechaB = b.fecha_recoleccion ? new Date(b.fecha_recoleccion).getTime() : 0;

      if (ordenRecoleccion === "asc") {
        return fechaA - fechaB;
      } else {
        return fechaB - fechaA;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header - cada elemento apilado en móvil */}
      <div className="space-y-4">
        {/* Encargado logístico - ocupa todo el ancho */}
        {encargado && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {encargado.nombre} {encargado.apellido}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Encargado de Logística</p>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => abrirModal(true)}
                className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                title="Editar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => setModalEliminar(true)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Eliminar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Filtros apilados verticalmente en móvil, horizontal en desktop */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Select de estados */}
          <Select
            value={filtroEstado}
            onChange={(value) => cambiarFiltroEstado(value)}
            options={[
              { value: "", label: "Todos los estados" },
              { value: "Empaquetando", label: "Empaquetando" },
              { value: "En tránsito", label: "En tránsito" },
              { value: "Distribución", label: "Distribución" },
              { value: "Entregado", label: "Entregado" }
            ]}
            placeholder="Todos los estados"
            className="w-full sm:w-auto"
          />

          {/* Botones de Recibiendo/Enviando */}
          <div className="flex gap-2">
            <button
              onClick={() => cambiarFiltroRol("recibiendo")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filtroRol === "recibiendo"
                  ? "bg-green-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
            Recibiendo
            </button>
            <button
              onClick={() => cambiarFiltroRol("enviando")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filtroRol === "enviando"
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
            Enviando
            </button>
          </div>

          {/* Botón de ordenamiento por fecha de recolección */}
          <button
            onClick={() => setOrdenRecoleccion(prev => prev === "asc" ? "desc" : "asc")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-brand-500 text-white hover:bg-brand-600"
          >
            <Image 
              src="/images/icons/calendar.svg" 
              alt="Calendario" 
              width={16} 
              height={16}
              className="w-4 h-4"
            />
            Fecha Recolección
            <Image 
              src="/images/icons/arrow-up.svg" 
              alt="Ordenar" 
              width={16} 
              height={16}
              className={`w-4 h-4 transition-transform ${ordenRecoleccion === "desc" ? "rotate-180" : ""}`}
            />
          </button>

          {/* Botones y contador */}
          <div className="flex items-center gap-3 justify-between sm:justify-start flex-wrap">
            {(filtroEstado || filtroRol) && (
              <button
                onClick={() => {
                  limpiarURLYRecargar();
                  setFiltroEstado("");
                  setFiltroRol("");
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium text-sm whitespace-nowrap"
              >
                Limpiar filtros
              </button>
            )}

            {!encargado && (
              <button
                onClick={() => abrirModal(false)}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:ring-4 focus:ring-brand-300 font-medium transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Añadir persona
              </button>
            )}

            <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {enviosFiltrados.length} {enviosFiltrados.length === 1 ? 'envío' : 'envíos'}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de envíos - Timeline cronológico */}
      <div>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando envíos...</p>
          </div>
        ) : enviosFiltrados.length === 0 ? (
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
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay envíos</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filtroEstado ? 'No se encontraron envíos con los filtros aplicados.' : 'Los envíos que inicies aparecerán aquí.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {enviosFiltrados.map((envio, index) => {
              const indiceEstadoActual = obtenerIndiceEstado(envio.estado_envio?.estado);
              const porcentajeProgreso = obtenerPorcentajeProgreso(envio.estado_envio?.estado);
              const esDestacado = envio.id === envioDestacado;

              return (
                <div
                  key={envio.id}
                  id={`envio-${envio.id}`}
                  className={`border rounded-lg p-4 transition-all ${
                    esDestacado
                      ? 'bg-brand-50 dark:bg-brand-900/10 border-brand-400 dark:border-brand-700 shadow-lg'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md'
                  }`}
                >
                  {/* Header con información principal */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {envio.solicitudes?.medicamentos?.nombre || 
                         (envio.donaciones && envio.donaciones.length > 0 ? envio.donaciones[0].medicamentos?.nombre : "Medicamento no especificado")}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoBadgeColor(envio.estado_envio?.estado)}`}>
                        {envio.estado_envio?.estado}
                      </span>
                      
                      {/* Badge de Recibiendo/Enviando */}
                      {(() => {
                        const rol = obtenerRolEnvio(envio);
                        if (rol === 'recibiendo') {
                          return (
                            <span className="px-1 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Recibiendo
                            </span>
                          );
                        } else if (rol === 'enviando') {
                          return (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            Enviando
                            </span>
                          );
                        }
                        return null;
                      })()}
                      
                      {envio.donaciones && envio.donaciones.length > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400">
                          Donación
                        </span>
                      )}
                    </div>

                    {/* Fecha estimada */}
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Entrega estimada:</span> {envio.fecha_entrega_estimada ? formatearFecha(envio.fecha_entrega_estimada) : "Sin fecha"}
                    </div>
                  </div>

                  {/* Timeline horizontal de estados */}
                  <div className="mb-6">
                    <div className="relative px-5">
                      {/* Línea base gris continua */}
                      <div 
                        className="absolute h-0.5 bg-gray-300 dark:bg-gray-600 left-5 right-5"
                        style={{ top: '20px' }}
                      />
                      
                      {/* Línea de progreso coloreada que se llena */}
                      <div 
                        className="absolute h-0.5 left-5 transition-all duration-500"
                        style={{ 
                          top: '20px',
                          width: `calc(${(indiceEstadoActual / (estadosProgreso.length - 1)) * 100}% - 20px)`,
                          background: porcentajeProgreso >= 85
                            ? 'linear-gradient(to right, #10b981, #059669)'
                            : porcentajeProgreso >= 50
                              ? 'linear-gradient(to right, #3b82f6, #2563eb)'
                              : 'linear-gradient(to right, #f59e0b, #d97706)'
                        }}
                      />
                      
                      {/* Contenedor de los estados */}
                      <div className="flex items-start justify-between relative">
                        {estadosProgreso.map((estado, idx) => {
                          const completado = idx < indiceEstadoActual;
                          const esActual = idx === indiceEstadoActual;
                          const tooltipId = `${envio.id}-${idx}`;

                          return (
                            <div key={idx} className="flex flex-col items-center relative z-20">
                              {/* Icono */}
                              <div className="relative">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all border-2 ${
                                    esActual
                                      ? esDestacado
                                        ? 'bg-brand-500 border-brand-600 text-white shadow-lg scale-110 animate-[pulse_3s_ease-in-out]'
                                        : 'bg-brand-500 border-brand-600 text-white shadow-lg scale-110'
                                      : completado
                                        ? 'bg-green-500 border-green-600 text-white shadow'
                                        : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400 dark:bg-gray-800 dark:border-gray-600'
                                  }`}
                                  onMouseEnter={() => setTooltipVisible(tooltipId)}
                                  onMouseLeave={() => setTooltipVisible(null)}
                                  onClick={() => setTooltipVisible(tooltipVisible === tooltipId ? null : tooltipId)}
                                >
                                  {completado && !esActual ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    estado.icono
                                  )}
                                </div>

                                {/* Tooltip */}
                                {tooltipVisible === tooltipId && (
                                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <span>{estado.nombre}</span>
                                      {esActual && <span className="ml-1 px-1.5 py-0.5 bg-brand-500 rounded text-[10px]">• Actual</span>}
                                    </div>
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-2 h-2 bg-gray-900 rotate-45" />
                                  </div>
                                )}
                              </div>

                              {/* Nombre del estado debajo del icono */}
                              <div className="mt-2 text-[10px] sm:text-xs text-center text-gray-600 dark:text-gray-400 leading-tight px-1 min-h-[32px] flex items-center justify-center max-w-[60px] sm:max-w-[80px]">
                                <span className={`${esActual ? 'font-semibold text-brand-600 dark:text-brand-400' : ''}`}>
                                  {estado.nombre}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Barra de progreso general */}
                      <div className="mt-8">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-500 rounded-full"
                            style={{
                              width: `${porcentajeProgreso}%`,
                              background: porcentajeProgreso === 100
                                ? 'linear-gradient(to right, #10b981, #059669)'
                                : porcentajeProgreso >= 75
                                  ? 'linear-gradient(to right, #3b82f6, #2563eb)'
                                  : porcentajeProgreso >= 50
                                    ? 'linear-gradient(to right, #3b82f6, #2563eb)'
                                    : 'linear-gradient(to right, #f59e0b, #d97706)'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {envio.descripcion && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                      {envio.descripcion}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    {envio.transporte && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Transporte</p>
                        <p className="font-medium text-gray-900 dark:text-white">{envio.transporte.nombre}</p>
                      </div>
                    )}
                    {envio.fecha_recoleccion && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Recolección</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatearFecha(envio.fecha_recoleccion)}
                        </p>
                      </div>
                    )}
                    {envio.fecha_entrega_estimada && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Entrega estimada</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatearFecha(envio.fecha_entrega_estimada)}
                        </p>
                      </div>
                    )}
                    {envio.solicitudes?.hospitales && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Hospital solicitante</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {envio.solicitudes.hospitales.nombre}
                        </p>
                      </div>
                    )}
                    {envio.solicitudes?.cantidad && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Cantidad</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {envio.solicitudes.cantidad} {envio.solicitudes.unidad_dispensacion?.nombre || "unidades"}
                        </p>
                      </div>
                    )}
                    {envio.donaciones && envio.donaciones.length > 0 && envio.donaciones[0].hospitales && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Hospital receptor</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {envio.donaciones[0].hospitales.nombre}
                        </p>
                      </div>
                    )}
                    {envio.donaciones && envio.donaciones.length > 0 && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Cantidad</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {envio.donaciones[0].cantidad} {envio.donaciones[0].unidad_dispensacion?.nombre || "unidades"}
                        </p>
                      </div>
                    )}
                    {envio.encargado_logistica_id && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Encargado logística</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {encargado ? `${encargado.nombre} ${encargado.apellido}` : "No asignado"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Sección de PIN para receptor (cuando está en Distribución) */}
                  {(() => {
                    const rol = obtenerRolEnvio(envio);
                    const estadoActual = envio.estado_envio?.estado?.toLowerCase();
                    
                    // Mostrar PIN al receptor cuando está en Distribución
                    if (rol === 'recibiendo' && estadoActual === 'distribución' && envio.pin) {
                      return (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            <div className="flex-1">
                              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                                Código PIN
                              </h4>
                              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                                Entregar este código para confirmar la recepción del envío.
                              </p>
                              <div className="flex items-center gap-3">
                                <div className="px-3 py-2 bg-white dark:bg-gray-800 border-2 border-green-300 dark:border-green-700 rounded-lg">
                                  <div className="text-1xl font-bold tracking-wider text-green-600 dark:text-green-400 font-mono">
                                    {envio.pin}
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(envio.pin!);
                                    toast.success("PIN copiado al portapapeles");
                                  }}
                                  className="px-3 py-2 text-sm font-medium text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                >
                                  Copiar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Botones de cambio de estado (solo para quien envía) */}
                  {(() => {
                    const rol = obtenerRolEnvio(envio);
                    const estadoActual = envio.estado_envio?.estado;
                    const siguienteEstado = obtenerSiguienteEstado(estadoActual);

                    if (puedeCambiarEstado(envio) && siguienteEstado) {
                      return (
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => iniciarCambioEstado(envio, siguienteEstado)}
                            disabled={cambiandoEstado}
                            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {cambiandoEstado ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Actualizando...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Cambiar a: {siguienteEstado}
                              </>
                            )}
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para añadir/editar encargado */}
      {modalAbierto && (
        <>
          {/* Overlay que cubre toda la pantalla */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-hidden"
            style={{ zIndex: 99999, top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
            onClick={cerrarModal}
          ></div>

          {/* Contenedor del modal */}
          <div
            className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none overflow-y-auto"
            style={{ zIndex: 100000, top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {modoEdicion ? "Editar encargado" : "Añadir encargado de logística"}
                  </h2>
                  <button
                    onClick={cerrarModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formulario.nombre}
                      onChange={(e) => actualizarCampo("nombre", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      placeholder="Nombres del encargado"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formulario.apellido}
                      onChange={(e) => actualizarCampo("apellido", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      placeholder="Apellidos del encargado"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cédula <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formulario.cedula}
                      onChange={(e) => actualizarCampo("cedula", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      placeholder="Número de cédula"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Correo
                    </label>
                    <input
                      type="email"
                      value={formulario.correo}
                      onChange={(e) => actualizarCampo("correo", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Celular <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formulario.celular}
                      onChange={(e) => actualizarCampo("celular", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      placeholder="Número de celular"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={cerrarModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarEncargado}
                    disabled={guardando}
                    className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:ring-4 focus:ring-brand-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {guardando ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Guardando...
                      </>
                    ) : (
                      modoEdicion ? "Actualizar" : "Guardar"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal para ingresar PIN de entrega */}
      {modalCambiarEstado && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 99999 }}
            onClick={() => setModalCambiarEstado(false)}
          ></div>

          <div
            className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
            style={{ zIndex: 100000 }}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Confirmar Entrega
                  </h2>
                  <button
                    onClick={() => setModalCambiarEstado(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                          Solicita el PIN de entrega
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Quien entrega debe proporcionarle el PIN de 4 dígitos asignado.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Código PIN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={pinIngresado}
                      onChange={(e) => {
                        const valor = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setPinIngresado(valor);
                      }}
                      maxLength={4}
                      placeholder="••••"
                      className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white font-mono"
                      autoFocus
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Ingresa el código de 4 dígitos
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setModalCambiarEstado(false);
                      setPinIngresado("");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarEntregaConPin}
                    disabled={cambiandoEstado || pinIngresado.length !== 4}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {cambiandoEstado ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verificando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmar Entrega
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={modalEliminar}
        onClose={() => setModalEliminar(false)}
        onConfirm={confirmarEliminacion}
        title="¿Eliminar encargado?"
        message={`Esta acción no se puede deshacer. El encargado <span class="font-medium text-gray-900 dark:text-white">${encargado?.nombre} ${encargado?.apellido}</span> será eliminado permanentemente.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={eliminando}
        variant="danger"
      />

      {/* Paginación */}
      {!loading && totalPages > 1 && (
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
