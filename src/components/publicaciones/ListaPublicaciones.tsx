"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { Modal } from "@/components/ui/modal";
import ConfirmModal from "@/components/common/ConfirmModal";
import ImageUpload from "@/components/form/ImageUpload";
import DatePicker from "@/components/form/date-picker";
import BuscadorMedicamentos from "@/components/publicaciones/BuscadorMedicamentos";
import TarjetaPublicacion from "@/components/publicaciones/TarjetaPublicacion";
import ModalTipoSolicitud from "@/components/publicaciones/ModalTipoSolicitud";
import ModalConfirmacionSolicitud, { DatosSolicitud } from "@/components/publicaciones/ModalConfirmacionSolicitud";

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
  unidad_dispensacion_id: number | null;
  fecha_creacion: string;
  created_at?: string;

  // Campos manuales obligatorios
  reg_invima: string;
  lote: string;
  cum: string;
  fecha_fabricacion: string;
  fecha_expiracion: string;

  // Imágenes obligatorias
  imagen_invima: string;
  imagen_lote_vencimiento: string;
  imagen_principio_activo: string;

  // Campos de la API
  principioactivo?: string;
  cantidadcum?: string;
  unidadmedida?: string;
  formafarmaceutica?: string;
  titular?: string;
  descripcioncomercial?: string;

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
  const [tiposPublicacion, setTiposPublicacion] = useState<TipoPublicacion[]>([]);
  const [estadosPublicacion, setEstadosPublicacion] = useState<EstadoPublicacion[]>([]);
  const [unidadesDispensacion, setUnidadesDispensacion] = useState<UnidadDispensacion[]>([]);
  const [avisosPublicados, setAvisosPublicados] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSolicitud, setLoadingSolicitud] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [mostrarModalBienvenida, setMostrarModalBienvenida] = useState(false);
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState<Publicacion | null>(null);
  const [publicacionASolicitar, setPublicacionASolicitar] = useState<Publicacion | null>(null);
  
  // Estados de solicitud tipificada
  const [mostrarModalTipoSolicitud, setMostrarModalTipoSolicitud] = useState(false);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [tipoSolicitudSeleccionado, setTipoSolicitudSeleccionado] = useState<"compra" | "intercambio" | "prestamo" | null>(null);
  const [misPublicacionesParaIntercambio, setMisPublicacionesParaIntercambio] = useState<Publicacion[]>([]);
  const [solicitudesRealizadas, setSolicitudesRealizadas] = useState(0);
  const [contadoresSolicitudes, setContadoresSolicitudes] = useState<Record<string, number>>({});

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
    descripcion: "",
    cantidad: "",

    // Campos manuales obligatorios
    reg_invima: "",
    lote: "",
    cum: "",
    fecha_fabricacion: "",
    fecha_expiracion: "",

    // Imágenes obligatorias
    imagen_invima: null as string | null,
    imagen_lote_vencimiento: null as string | null,
    imagen_principio_activo: null as string | null,

    unidad_dispensacion_id: "",
    tipo_publicacion_id: "",
    estado_publicacion_id: "1", // Por defecto "Disponible"

    // Campos de la API
    principioactivo: "",
    cantidadcum: "",
    unidadmedida: "",
    formafarmaceutica: "",
    titular: "",
    descripcioncomercial: ""
  });

  const [formDataEditar, setFormDataEditar] = useState({
    descripcion: "",
    cantidad: "",

    // Campos manuales obligatorios
    reg_invima: "",
    lote: "",
    cum: "",
    fecha_fabricacion: "",
    fecha_expiracion: "",

    // Imágenes obligatorias
    imagen_invima: null as string | null,
    imagen_lote_vencimiento: null as string | null,
    imagen_principio_activo: null as string | null,

    unidad_dispensacion_id: "",
    tipo_publicacion_id: "",
    estado_publicacion_id: "",

    // Campos de la API
    principioactivo: "",
    cantidadcum: "",
    unidadmedida: "",
    formafarmaceutica: "",
    titular: "",
    descripcioncomercial: ""
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
        
        // Cargar contadores de solicitudes para cada publicación
        if (usuario?.hospital_id && data.publicaciones.length > 0) {
          cargarContadores(data.publicaciones);
        }
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

  const cargarContadores = async (publicaciones: Publicacion[]) => {
    if (!usuario?.hospital_id) return;
    
    try {
      // Cargar contadores en paralelo para todas las publicaciones
      const contadores = await Promise.all(
        publicaciones.map(async (pub) => {
          try {
            const res = await fetch(
              `/api/solicitudes?publicacion_id=${pub.id}&hospital_id=${usuario.hospital_id}&count_only=true`
            );
            if (res.ok) {
              const data = await res.json();
              return { id: pub.id, count: data.count || 0 };
            }
          } catch (error) {
            console.error(`Error al cargar contador para publicación ${pub.id}:`, error);
          }
          return { id: pub.id, count: 0 };
        })
      );
      
      // Convertir array a objeto para búsqueda rápida
      const contadoresMap: Record<string, number> = {};
      contadores.forEach(({ id, count }) => {
        contadoresMap[id.toString()] = count;
      });
      
      setContadoresSolicitudes(contadoresMap);
    } catch (error) {
      console.error("Error al cargar contadores:", error);
    }
  };

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      setUsuario(JSON.parse(usuarioData));
    }

    // Verificar si es la primera vez en publicaciones
    const primeraVezPublicaciones = localStorage.getItem("primeraVezPublicaciones");
    if (!primeraVezPublicaciones) {
      setMostrarModalBienvenida(true);
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
      cargarMisPublicaciones(); // Cargar publicaciones
    }
  }, [page, searchTerm, estadoFilter, searchParams, orderByCreacion, orderByExpiracion, usuario, cargarPublicaciones]);

  const cargarMisPublicaciones = async () => {
    if (!usuario?.hospital_id) return;

    try {
      const params = new URLSearchParams({
        hospital_id: usuario.hospital_id.toString(),
        limit: "100", // Cargar hasta 100 publicaciones propias
        estado: "disponible" // Solo disponibles para intercambiar
      });

      const response = await fetch(`/api/publicaciones?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMisPublicacionesParaIntercambio(data.publicaciones || []);
      }
    } catch (error) {
      console.error("Error al cargar mis publicaciones:", error);
    }
  };

  const cargarDatosIniciales = async () => {
    try {
      const [resTipo, resEstado, resUnidades] = await Promise.all([
        fetch("/api/tipo-publicacion"),
        fetch("/api/estado-publicacion"),
        fetch("/api/unidad-dispensacion")
      ]);

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

  // Función para calcular el tipo de publicación según la fecha de expiración
  const calcularTipoPublicacion = (fechaExpiracion: string): { id: number; nombre: string; color: string } => {
    if (!fechaExpiracion) return { id: 2, nombre: "Normal", color: "text-yellow-600 dark:text-yellow-400" };

    const hoy = new Date();
    const fechaExp = new Date(fechaExpiracion);
    const diferenciaMeses = (fechaExp.getFullYear() - hoy.getFullYear()) * 12 + (fechaExp.getMonth() - hoy.getMonth());

    if (diferenciaMeses < 3) {
      return { id: 1, nombre: "Crítico", color: "text-red-600 dark:text-red-400" };
    } else if (diferenciaMeses >= 3 && diferenciaMeses <= 12) {
      return { id: 2, nombre: "Normal", color: "text-yellow-600 dark:text-yellow-400" };
    } else {
      return { id: 3, nombre: "Óptimo", color: "text-green-600 dark:text-green-400" };
    }
  };

  // Función para obtener colores del tipo de publicación por ID
  const obtenerColorTipoPublicacion = (tipoId: number): { bg: string; text: string } => {
    switch (tipoId) {
      case 1: // Crítico
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          text: "text-red-600 dark:text-red-400"
        };
      case 2: // Normal
        return {
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          text: "text-yellow-600 dark:text-yellow-400"
        };
      case 3: // Óptimo
        return {
          bg: "bg-green-50 dark:bg-green-900/20",
          text: "text-green-600 dark:text-green-400"
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-800",
          text: "text-gray-600 dark:text-gray-400"
        };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.principioactivo || !formData.cantidad || !formData.fecha_expiracion) {
      toast.error("¡Campos requeridos!", {
        description: "Completa todos los campos obligatorios, incluyendo el medicamento."
      });
      return;
    }

    // Validar campos manuales obligatorios
    if (!formData.reg_invima || !formData.lote || !formData.cum || !formData.fecha_fabricacion) {
      toast.error("¡Campos requeridos!", {
        description: "Completa: Registro INVIMA, Lote, CUM y Fecha de Fabricación."
      });
      return;
    }

    // Validar las 3 imágenes obligatorias
    if (!formData.imagen_invima || !formData.imagen_lote_vencimiento || !formData.imagen_principio_activo) {
      toast.error("¡Imágenes requeridas!", {
        description: "Debes subir las 3 imágenes obligatorias (INVIMA, Lote/Vencimiento, Principio Activo)."
      });
      return;
    }

    const loadingToast = toast.loading("Creando publicación...");

    // Calcular automáticamente el tipo de publicación basado en la fecha de expiración
    const tipoCalculado = calcularTipoPublicacion(formData.fecha_expiracion);

    try {
      const response = await fetch("/api/publicaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cantidad: parseInt(formData.cantidad),
          hospital_id: usuario?.hospital_id,
          tipo_publicacion_id: tipoCalculado.id, // Usar el tipo calculado automáticamente
          estado_publicacion_id: parseInt(formData.estado_publicacion_id),
          unidad_dispensacion_id: formData.unidad_dispensacion_id ? parseInt(formData.unidad_dispensacion_id) : null
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
          descripcion: "",
          cantidad: "",
          reg_invima: "",
          lote: "",
          cum: "",
          fecha_fabricacion: "",
          fecha_expiracion: "",
          imagen_invima: null,
          imagen_lote_vencimiento: null,
          imagen_principio_activo: null,
          unidad_dispensacion_id: "",
          tipo_publicacion_id: "",
          estado_publicacion_id: "1",
          principioactivo: "",
          cantidadcum: "",
          unidadmedida: "",
          formafarmaceutica: "",
          titular: "",
          descripcioncomercial: ""
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

  const abrirModalEditar = (publicacion: Publicacion) => {
    setPublicacionSeleccionada(publicacion);
    setFormDataEditar({
      descripcion: publicacion.descripcion || "",
      cantidad: publicacion.cantidad?.toString() || "",
      reg_invima: publicacion.reg_invima || "",
      lote: publicacion.lote || "",
      cum: publicacion.cum || "",
      fecha_fabricacion: publicacion.fecha_fabricacion || "",
      fecha_expiracion: publicacion.fecha_expiracion || "",
      imagen_invima: publicacion.imagen_invima || null,
      imagen_lote_vencimiento: publicacion.imagen_lote_vencimiento || null,
      imagen_principio_activo: publicacion.imagen_principio_activo || null,
      unidad_dispensacion_id: publicacion.unidad_dispensacion?.id?.toString() || "",
      tipo_publicacion_id: publicacion.tipo_publicacion?.id?.toString() || "",
      estado_publicacion_id: publicacion.estado_publicacion?.id?.toString() || "",
      principioactivo: publicacion.principioactivo || "",
      cantidadcum: publicacion.cantidadcum || "",
      unidadmedida: publicacion.unidadmedida || "",
      formafarmaceutica: publicacion.formafarmaceutica || "",
      titular: publicacion.titular || "",
      descripcioncomercial: publicacion.descripcioncomercial || ""
    });
    setMostrarModalEditar(true);
  };

  const cerrarModalEditar = () => {
    setMostrarModalEditar(false);
    setPublicacionSeleccionada(null);
    setFormDataEditar({
      descripcion: "",
      cantidad: "",
      reg_invima: "",
      lote: "",
      cum: "",
      fecha_fabricacion: "",
      fecha_expiracion: "",
      imagen_invima: null,
      imagen_lote_vencimiento: null,
      imagen_principio_activo: null,
      unidad_dispensacion_id: "",
      tipo_publicacion_id: "",
      estado_publicacion_id: "",
      principioactivo: "",
      cantidadcum: "",
      unidadmedida: "",
      formafarmaceutica: "",
      titular: "",
      descripcioncomercial: ""
    });
  };

  const handleChangeEditar = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormDataEditar(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicacionSeleccionada) return;

    if (!formDataEditar.principioactivo || !formDataEditar.cantidad || !formDataEditar.reg_invima || !formDataEditar.fecha_expiracion) {
      toast.error("¡Campos requeridos!", {
        description: "Completa todos los campos obligatorios."
      });
      return;
    }

    // Calcular automáticamente el tipo de publicación
    const tipoCalculado = calcularTipoPublicacion(formDataEditar.fecha_expiracion);

    const loadingToast = toast.loading("Actualizando publicación...");

    try {
      const response = await fetch(`/api/publicaciones/${publicacionSeleccionada.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formDataEditar,
          cantidad: parseInt(formDataEditar.cantidad),
          tipo_publicacion_id: tipoCalculado.id,
          estado_publicacion_id: parseInt(formDataEditar.estado_publicacion_id),
          unidad_dispensacion_id: formDataEditar.unidad_dispensacion_id ? parseInt(formDataEditar.unidad_dispensacion_id) : null
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

  const handleEliminarPublicacion = () => {
    if (!publicacionSeleccionada) return;
    setMostrarModalEliminar(true);
  };

  const confirmarEliminarPublicacion = async () => {
    if (!publicacionSeleccionada) return;

    const loadingToast = toast.loading("Verificando publicación...");

    try {
      const response = await fetch(`/api/publicaciones/${publicacionSeleccionada.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        toast.success("¡Publicación eliminada!", {
          description: "La publicación se eliminó completamente.",
          id: loadingToast
        });
        setMostrarModalEliminar(false);
        cerrarModalEditar();
        cargarPublicaciones();
      } else {
        const error = await response.json();

        // Mostrar advertencia específica según el tipo de relación
        if (response.status === 409) {
          if (error.tipo === "envios") {
            toast.warning("No se puede eliminar", {
              description: "Esta publicación tiene envíos asociados. No es posible eliminarla para mantener el historial de envíos.",
              id: loadingToast,
              duration: 6000
            });
          } else if (error.tipo === "solicitudes") {
            toast.warning("No se puede eliminar", {
              description: "Esta publicación tiene solicitudes asociadas. No es posible eliminarla para mantener el historial de solicitudes.",
              id: loadingToast,
              duration: 6000
            });
          } else {
            toast.warning("No se puede eliminar", {
              description: error.error || "Esta publicación tiene registros relacionados.",
              id: loadingToast,
              duration: 5000
            });
          }
        } else {
          toast.error("Error al eliminar", {
            description: error.error || "No se pudo eliminar la publicación.",
            id: loadingToast
          });
        }

        setMostrarModalEliminar(false);
      }
    } catch (error) {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor.",
        id: loadingToast
      });
      setMostrarModalEliminar(false);
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

  const handleCerrarModalBienvenida = () => {
    localStorage.setItem("primeraVezPublicaciones", "true");
    setMostrarModalBienvenida(false);
  };

  const handleIrAPerfil = () => {
    localStorage.setItem("primeraVezPublicaciones", "true");
    setMostrarModalBienvenida(false);
    router.push("/perfil");
  };

  const abrirModalSolicitud = async (publicacion: Publicacion) => {
    setPublicacionASolicitar(publicacion);
    
    // Obtener el contador de solicitudes realizadas
    if (usuario?.hospital_id) {
      try {
        const res = await fetch(
          `/api/solicitudes?publicacion_id=${publicacion.id}&hospital_id=${usuario.hospital_id}&count_only=true`
        );
        
        if (res.ok) {
          const data = await res.json();
          setSolicitudesRealizadas(data.count || 0);
        }
      } catch (error) {
        console.error("Error al obtener contador de solicitudes:", error);
        setSolicitudesRealizadas(0);
      }
    }
    
    setMostrarModalTipoSolicitud(true);
  };

  const cerrarModalSolicitud = () => {
    setPublicacionASolicitar(null);
    setMostrarModalTipoSolicitud(false);
    setMostrarModalConfirmacion(false);
    setTipoSolicitudSeleccionado(null);
    setLoadingSolicitud(false);
  };

  const handleSeleccionarTipoSolicitud = (tipo: "compra" | "intercambio" | "prestamo") => {
    setTipoSolicitudSeleccionado(tipo);
    setMostrarModalTipoSolicitud(false);
    setMostrarModalConfirmacion(true);
  };

  const handleVolverATipoSolicitud = () => {
    setMostrarModalConfirmacion(false);
    setMostrarModalTipoSolicitud(true);
    setTipoSolicitudSeleccionado(null);
  };

  const confirmarSolicitud = async (datosSolicitud: DatosSolicitud) => {
    if (!usuario || !publicacionASolicitar) {
      toast.error("Error", { description: "Usuario no autenticado" });
      return;
    }

    if (loadingSolicitud) return;
    setLoadingSolicitud(true);

    const loadingToast = toast.loading("Enviando solicitud...");

    try {
      // Crear la solicitud con los nuevos campos tipificados
      const resSolicitud = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicacion_id: publicacionASolicitar.id,
          hospital_id: usuario.hospital_id,
          tipo_solicitud: datosSolicitud.tipo_solicitud,
          propuesta_descripcion: datosSolicitud.propuesta_descripcion,
          valor_propuesto: datosSolicitud.valor_propuesto,
          medicamento_intercambio: datosSolicitud.medicamento_intercambio,
          cantidad_intercambio: datosSolicitud.cantidad_intercambio,
          fecha_devolucion_estimada: datosSolicitud.fecha_devolucion_estimada
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

      const tipoTexto = datosSolicitud.tipo_solicitud === "compra" ? "compra" : 
                        datosSolicitud.tipo_solicitud === "intercambio" ? "intercambio" : "préstamo";

      toast.success("¡Solicitud enviada!", {
        description: `Tu solicitud de ${tipoTexto} ha sido enviada al hospital`,
        id: loadingToast
      });

      cerrarModalSolicitud();
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

  const calcularTiempoRestante = (fechaExpiracion: string) => {
    const ahora = new Date();
    const expiracion = new Date(fechaExpiracion);
    const diferenciaMilisegundos = expiracion.getTime() - ahora.getTime();

    // Si ya expiró
    if (diferenciaMilisegundos <= 0) {
      return {
        texto: "Expirado",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-900/20"
      };
    }

    const diferenciaDias = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
    const diferenciaHoras = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60));

    // Calcular años, meses y días restantes
    const años = Math.floor(diferenciaDias / 365);
    const mesesRestantes = Math.floor((diferenciaDias % 365) / 30);
    const diasRestantes = diferenciaDias % 30;

    let texto = "";
    let color = "";
    let bgColor = "";

    // Menos de 3 meses (90 días) - ROJO
    if (diferenciaDias < 90) {
      color = "text-red-600 dark:text-red-400";
      bgColor = "bg-red-50 dark:bg-red-900/20";

      if (diferenciaDias < 1) {
        texto = `${diferenciaHoras} ${diferenciaHoras === 1 ? 'hora' : 'horas'}`;
      } else if (diferenciaDias < 30) {
        texto = `${diferenciaDias} ${diferenciaDias === 1 ? 'día' : 'días'}`;
      } else {
        const meses = Math.floor(diferenciaDias / 30);
        const dias = diferenciaDias % 30;
        texto = meses === 1 ? '1 mes' : `${meses} meses`;
        if (dias > 0) {
          texto += ` y ${dias} ${dias === 1 ? 'día' : 'días'}`;
        }
      }
    }
    // De 3 a 12 meses (90-365 días) - NARANJA
    else if (diferenciaDias <= 365) {
      color = "text-orange-600 dark:text-orange-400";
      bgColor = "bg-orange-50 dark:bg-orange-900/20";
      const meses = Math.floor(diferenciaDias / 30);
      const dias = diferenciaDias % 30;
      texto = meses === 1 ? '1 mes' : `${meses} meses`;
      if (dias > 0) {
        texto += ` y ${dias} ${dias === 1 ? 'día' : 'días'}`;
      }
    }
    // Más de 12 meses - VERDE
    else {
      color = "text-green-600 dark:text-green-400";
      bgColor = "bg-green-50 dark:bg-green-900/20";

      if (años > 0) {
        texto = años === 1 ? '1 año' : `${años} años`;
        if (mesesRestantes > 0) {
          texto += ` y ${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'}`;
        }
      } else {
        const meses = Math.floor(diferenciaDias / 30);
        const dias = diferenciaDias % 30;
        texto = meses === 1 ? '1 mes' : `${meses} meses`;
        if (dias > 0) {
          texto += ` y ${dias} ${dias === 1 ? 'día' : 'días'}`;
        }
      }
    }

    return { texto, color, bgColor };
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
          <Select
            value={estadoFilter}
            onChange={(value) => { setEstadoFilter(value); setPage(1); }}
            options={[
              { value: "", label: "Todos los estados" },
              ...estadosPublicacion.map(estado => ({ value: estado.nombre, label: estado.nombre }))
            ]}
            placeholder="Todos los estados"
          />

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
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
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
            {/* SECCIÓN 1: Datos del medicamento */}
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                Datos del medicamento
              </h3>
              <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                {/* Buscador de Medicamentos */}
                <div className="mb-6">
                  <BuscadorMedicamentos
                    onMedicamentoSeleccionado={(medicamento) => {
                      setFormData(prev => ({
                        ...prev,
                        principioactivo: medicamento.principioactivo,
                        cantidadcum: medicamento.cantidadcum,
                        unidadmedida: medicamento.unidadmedida,
                        formafarmaceutica: medicamento.formafarmaceutica,
                        titular: medicamento.titular,
                        descripcioncomercial: medicamento.descripcioncomercial
                      }));
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <Label>Registro INVIMA *</Label>
                    <input
                      type="text"
                      name="reg_invima"
                      value={formData.reg_invima}
                      onChange={handleChange}
                      placeholder="Ej: INVIMA2024M-0012345"
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    />
                  </div>

                  <div>
                    <Label>Lote *</Label>
                    <input
                      type="text"
                      name="lote"
                      value={formData.lote}
                      onChange={handleChange}
                      placeholder="Ej: L202401"
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    />
                  </div>

                  <div>
                    <Label>CUM *</Label>
                    <input
                      type="text"
                      name="cum"
                      value={formData.cum}
                      onChange={handleChange}
                      placeholder="Código Único de Medicamento"
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    />
                  </div>

                  <div>
                    <DatePicker
                      id="fecha_fabricacion_crear"
                      label="Fecha de Fabricación *"
                      placeholder="Seleccione una fecha"
                      defaultDate={formData.fecha_fabricacion || undefined}
                      maxDate={new Date()}
                      onChange={(selectedDates) => {
                        if (selectedDates && selectedDates.length > 0) {
                          const fecha = selectedDates[0];
                          const fechaFormateada = fecha.toISOString().split('T')[0];
                          setFormData(prev => ({ ...prev, fecha_fabricacion: fechaFormateada }));
                        }
                      }}
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

                  {/* Tipo de Publicación Automático (Solo lectura) */}
                  <div>
                    <Label>Tipo de Publicación</Label>
                    <div className="flex items-center w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                      {formData.fecha_expiracion ? (
                        (() => {
                          const tipoCalculado = calcularTipoPublicacion(formData.fecha_expiracion);
                          return (
                            <span className={`font-semibold ${tipoCalculado.color}`}>
                              {tipoCalculado.nombre}
                            </span>
                          );
                        })()
                      ) : (
                        <span className="text-gray-400">Seleccione fecha de expiración</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: Cantidad a publicar */}
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                Cantidad a publicar
              </h3>
              <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <Label>Unidad de dispensación *</Label>
                    <Select
                      name="unidad_dispensacion_id"
                      value={formData.unidad_dispensacion_id}
                      onChange={(value) => setFormData(prev => ({ ...prev, unidad_dispensacion_id: value }))}
                      options={unidadesDispensacion.map(unidad => ({ value: String(unidad.id), label: unidad.nombre }))}
                      placeholder="Seleccione una unidad"
                      required
                    />
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
                    <Label>Observación</Label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Detalles adicionales..."
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: Imágenes del medicamento */}
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                Imágenes del medicamento
              </h3>
              <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ImageUpload
                    label="Registro INVIMA *"
                    onImageChange={(url) => setFormData(prev => ({ ...prev, imagen_invima: url }))}
                    currentImage={formData.imagen_invima}
                    tipo="publicacion"
                  />
                  <ImageUpload
                    label="Lote y Fecha de Vencimiento *"
                    onImageChange={(url) => setFormData(prev => ({ ...prev, imagen_lote_vencimiento: url }))}
                    currentImage={formData.imagen_lote_vencimiento}
                    tipo="publicacion"
                  />
                  <ImageUpload
                    label="Principio Activo *"
                    onImageChange={(url) => setFormData(prev => ({ ...prev, imagen_principio_activo: url }))}
                    currentImage={formData.imagen_principio_activo}
                    tipo="publicacion"
                  />
                </div>
              </div>
            </div>

            {/* Mensaje informativo de validación */}
            <div className="flex gap-3 p-4 mt-6 border rounded-lg bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
              <svg
                className="flex-shrink-0 w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-semibold">Valide los datos antes de ser publicados</p>
                <p className="mt-1">
                  La información registrada del medicamento debe ser precisa y verificable, puesto que son publicados en tiempo real en el sistema.                </p>
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
            <TarjetaPublicacion
              key={pub.id}
              pub={pub}
              usuario={usuario}
              formatearFecha={formatearFecha}
              calcularTiempoRestante={calcularTiempoRestante}
              abrirModalEditar={abrirModalEditar}
              handleSolicitar={handleSolicitar}
              copiarAlPortapapeles={copiarAlPortapapeles}
              solicitudesRealizadas={contadoresSolicitudes[pub.id.toString()] || 0}
            />
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

              {/* SECCIÓN 1: Datos del medicamento */}
              <div className="mb-6">
                <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
                  Datos del medicamento
                </h3>
                <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                  {/* Información del medicamento (solo lectura) */}
                  <div className="mb-4">
                    <Label>Medicamento</Label>
                    <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {formDataEditar.principioactivo}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formDataEditar.descripcioncomercial}
                      </p>
                      <div className="flex gap-2 mt-2 text-xs">
                        <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {formDataEditar.formafarmaceutica}
                        </span>
                        <span className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                          {formDataEditar.cantidadcum} {formDataEditar.unidadmedida}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <Label>Registro INVIMA *</Label>
                      <input
                        type="text"
                        name="reg_invima"
                        value={formDataEditar.reg_invima}
                        onChange={handleChangeEditar}
                        placeholder="Ej: INVIMA2024M-0012345"
                        required
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      />
                    </div>

                    <div>
                      <Label>Lote *</Label>
                      <input
                        type="text"
                        name="lote"
                        value={formDataEditar.lote}
                        onChange={handleChangeEditar}
                        placeholder="Ej: L202401"
                        required
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      />
                    </div>

                    <div>
                      <Label>CUM *</Label>
                      <input
                        type="text"
                        name="cum"
                        value={formDataEditar.cum}
                        onChange={handleChangeEditar}
                        placeholder="Código Único de Medicamento"
                        required
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      />
                    </div>

                    <div>
                      <DatePicker
                        id="fecha_fabricacion_editar"
                        label="Fecha de Fabricación *"
                        placeholder="Seleccione una fecha"
                        defaultDate={formDataEditar.fecha_fabricacion || undefined}
                        maxDate={new Date()}
                        onChange={(selectedDates) => {
                          if (selectedDates && selectedDates.length > 0) {
                            const fecha = selectedDates[0];
                            const fechaFormateada = fecha.toISOString().split('T')[0];
                            setFormDataEditar(prev => ({ ...prev, fecha_fabricacion: fechaFormateada }));
                          }
                        }}
                      />
                    </div>

                    <div>
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

                    {/* Tipo de Publicación Automático (Solo lectura) */}
                    <div>
                      <Label>Tipo de Publicación</Label>
                      <div className="flex items-center w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                        {formDataEditar.fecha_expiracion ? (
                          (() => {
                            const tipoCalculado = calcularTipoPublicacion(formDataEditar.fecha_expiracion);
                            return (
                              <span className={`font-semibold ${tipoCalculado.color}`}>
                                {tipoCalculado.nombre}
                              </span>
                            );
                          })()
                        ) : (
                          <span className="text-gray-400">Seleccione fecha de expiración</span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <Label>Estado *</Label>
                      <Select
                        name="estado_publicacion_id"
                        value={formDataEditar.estado_publicacion_id}
                        onChange={(value) => setFormDataEditar(prev => ({ ...prev, estado_publicacion_id: value }))}
                        options={estadosPublicacion.map(estado => ({ value: String(estado.id), label: estado.nombre }))}
                        placeholder="Seleccione estado"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: Cantidad a publicar */}
              <div className="mb-6">
                <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
                  Cantidad a publicar
                </h3>
                <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div>
                      <Label>Unidad de dispensación *</Label>
                      <Select
                        name="unidad_dispensacion_id"
                        value={formDataEditar.unidad_dispensacion_id}
                        onChange={(value) => setFormDataEditar(prev => ({ ...prev, unidad_dispensacion_id: value }))}
                        options={unidadesDispensacion.map(unidad => ({ value: String(unidad.id), label: unidad.nombre }))}
                        placeholder="Seleccione una unidad"
                        required
                      />
                    </div>

                    <div>
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

                    <div className="col-span-1 lg:col-span-3">
                      <Label>Observación</Label>
                      <textarea
                        name="descripcion"
                        value={formDataEditar.descripcion}
                        onChange={handleChangeEditar}
                        rows={3}
                        placeholder="Detalles adicionales..."
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: Imágenes del medicamento */}
              <div className="mb-6">
                <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
                  Imágenes del medicamento
                </h3>
                <div className="pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ImageUpload
                      label="Registro INVIMA *"
                      onImageChange={(url) => setFormDataEditar(prev => ({ ...prev, imagen_invima: url }))}
                      currentImage={formDataEditar.imagen_invima}
                      tipo="publicacion"
                    />
                    <ImageUpload
                      label="Lote y Fecha de Vencimiento *"
                      onImageChange={(url) => setFormDataEditar(prev => ({ ...prev, imagen_lote_vencimiento: url }))}
                      currentImage={formDataEditar.imagen_lote_vencimiento}
                      tipo="publicacion"
                    />
                    <ImageUpload
                      label="Principio Activo *"
                      onImageChange={(url) => setFormDataEditar(prev => ({ ...prev, imagen_principio_activo: url }))}
                      currentImage={formDataEditar.imagen_principio_activo}
                      tipo="publicacion"
                    />
                  </div>
                </div>
              </div>

            </div>
            <div className="flex items-center justify-between gap-3 px-2 mt-6">
              {/* Botón Eliminar a la izquierda */}
              <button
                type="button"
                onClick={handleEliminarPublicacion}
                className="px-4 py-3 text-sm font-semibold text-white transition-colors rounded-lg bg-error-500 hover:bg-error-600"
              >
                Eliminar Publicación
              </button>

              {/* Botones de acción a la derecha */}
              <div className="flex items-center gap-3">
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
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal 1: Selección de tipo de solicitud */}
      <ModalTipoSolicitud
        isOpen={mostrarModalTipoSolicitud}
        onClose={cerrarModalSolicitud}
        onSelectTipo={handleSeleccionarTipoSolicitud}
        publicacion={publicacionASolicitar}
        solicitudesRealizadas={solicitudesRealizadas}
        limiteMaximo={3}
      />

      {/* Modal 2: Confirmación con campos específicos */}
      {tipoSolicitudSeleccionado && (
        <ModalConfirmacionSolicitud
          isOpen={mostrarModalConfirmacion}
          onClose={cerrarModalSolicitud}
          onBack={handleVolverATipoSolicitud}
          onConfirm={confirmarSolicitud}
          tipoSolicitud={tipoSolicitudSeleccionado}
          publicacion={publicacionASolicitar}
          misPublicaciones={misPublicacionesParaIntercambio}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmModal
        isOpen={mostrarModalEliminar}
        onClose={() => setMostrarModalEliminar(false)}
        onConfirm={confirmarEliminarPublicacion}
        title="Eliminar Publicación"
        message={`¿Estás seguro de que deseas eliminar la publicación de "${publicacionSeleccionada?.principioactivo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />

      {/* Modal de Bienvenida - Verificación de Datos */}
      <Modal isOpen={mostrarModalBienvenida} onClose={handleCerrarModalBienvenida} className="max-w-[550px] m-4">
        <div className="relative w-full p-6 bg-white rounded-3xl dark:bg-gray-900 lg:p-8">
          <div className="flex items-start gap-1 mb-8">
            <div className="flex-1">
              <h4 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Verifique sus datos de contacto
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Antes de publicar o solicitar medicamentos, es importante que confirme y garantice que tanto los <span className="font-semibold text-gray-800 dark:text-gray-300">datos personales</span> como los del <span className="font-semibold text-gray-800 dark:text-gray-300">hospital</span> estén actualizados.
              </p>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Esta información será utilizada como contacto para concretar las solicitudes de medicamentos.
              </p>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-semibold">Instrucción:</span> Puedes validar y actualizar tu información en la sección de <span className="font-semibold">Perfil</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleCerrarModalBienvenida}
              className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Más tarde
            </button>
            <button
              onClick={handleIrAPerfil}
              className="flex-1 px-4 py-3 text-sm font-semibold text-white transition-colors rounded-lg bg-brand-600 hover:bg-brand-700"
            >
              Ir a Perfil
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
