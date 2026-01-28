"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import ImageUpload from "@/components/form/ImageUpload";
import DatePicker from "@/components/form/date-picker";
import BuscadorMedicamentos from "@/components/publicaciones/BuscadorMedicamentos";
import TarjetaDonacion from "@/components/donaciones/TarjetaDonacion";
import ModalSolicitudDonacion from "@/components/donaciones/ModalSolicitudDonacion";

export default function ListaDonaciones() {
  const router = useRouter();
  const [donaciones, setDonaciones] = useState<any[]>([]);
  const [tiposDonacion, setTiposDonacion] = useState<any[]>([]);
  const [estadosDonacion, setEstadosDonacion] = useState<any[]>([]);
  const [unidadesDispensacion, setUnidadesDispensacion] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [vistaActual, setVistaActual] = useState<"todas" | "mias" | "recibidas">("todas");

  // Modal solicitud
  const [donacionASolicitar, setDonacionASolicitar] = useState<any>(null);
  const [mostrarModalSolicitud, setMostrarModalSolicitud] = useState(false);
  const [loadingSolicitud, setLoadingSolicitud] = useState(false);

  // Formulario
  const [formData, setFormData] = useState({
    descripcion: "",
    cantidad: "",
    reg_invima: "",
    lote: "",
    cum: "",
    fecha_fabricacion: "",
    fecha_expiracion: "",
    imagen_invima: null as string | null,
    imagen_lote_vencimiento: null as string | null,
    imagen_principio_activo: null as string | null,
    unidad_dispensacion_id: "",
    tipo_donacion_id: "",
    principioactivo: "",
    cantidadcum: "",
    unidadmedida: "",
    formafarmaceutica: "",
    titular: "",
    descripcioncomercial: ""
  });

  const cargarDonaciones = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(estadoFilter && { estado: estadoFilter })
      });

      // Determinar tipo según la vista actual
      if (vistaActual === "mias" && usuario?.hospital_id) {
        params.append("hospital_id", usuario.hospital_id.toString());
      } else if (vistaActual === "recibidas" && usuario?.hospital_id) {
        params.append("hospital_id", usuario.hospital_id.toString());
        params.append("tipo", "recibidas");
      }

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
  }, [page, searchTerm, estadoFilter, vistaActual, usuario?.hospital_id]);

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      setUsuario(JSON.parse(usuarioData));
    }
    cargarDatosIniciales();

    // Listener para actualización desde notificaciones
    const handleActualizarDatos = () => {
      cargarDonaciones();
    };
    window.addEventListener('actualizarDatos', handleActualizarDatos);
    return () => {
      window.removeEventListener('actualizarDatos', handleActualizarDatos);
    };
  }, [cargarDonaciones]);

  useEffect(() => {
    if (usuario) {
      cargarDonaciones();
    }
  }, [usuario, page, searchTerm, estadoFilter, vistaActual, cargarDonaciones]);

  const cargarDatosIniciales = async () => {
    try {
      const [resTipo, resEstado, resUnidades] = await Promise.all([
        fetch("/api/tipo-donacion"),
        fetch("/api/estado-donacion"),
        fetch("/api/unidad-dispensacion")
      ]);

      if (resTipo.ok) {
        const dataTipo = await resTipo.json();
        setTiposDonacion(dataTipo);
      }

      if (resEstado.ok) {
        const dataEstado = await resEstado.json();
        setEstadosDonacion(dataEstado);
      }

      if (resUnidades.ok) {
        const dataUnidades = await resUnidades.json();
        setUnidadesDispensacion(dataUnidades);
      }
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        description: "Debes subir las 3 imágenes obligatorias."
      });
      return;
    }

    const loadingToast = toast.loading("Creando donación...");

    try {
      const response = await fetch("/api/donaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cantidad: parseInt(formData.cantidad),
          hospital_id: usuario?.hospital_id,
          tipo_donacion_id: formData.tipo_donacion_id ? parseInt(formData.tipo_donacion_id) : null,
          unidad_dispensacion_id: formData.unidad_dispensacion_id ? parseInt(formData.unidad_dispensacion_id) : null
        })
      });

      if (response.ok) {
        toast.success("¡Donación creada!", {
          description: "La donación ha sido publicada correctamente.",
          id: loadingToast
        });
        setMostrarFormulario(false);
        cargarDonaciones();
        // Limpiar formulario
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
          tipo_donacion_id: "",
          principioactivo: "",
          cantidadcum: "",
          unidadmedida: "",
          formafarmaceutica: "",
          titular: "",
          descripcioncomercial: ""
        });
      } else {
        const error = await response.json();
        toast.error("Error al crear donación", {
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
    setPage(1);
  };

  const handleSolicitar = (donacion: any) => {
    setDonacionASolicitar(donacion);
    setMostrarModalSolicitud(true);
  };

  const confirmarSolicitud = async () => {
    if (!usuario || !donacionASolicitar) {
      toast.error("Error", { description: "Usuario no autenticado" });
      return;
    }

    if (loadingSolicitud) return;
    setLoadingSolicitud(true);

    const loadingToast = toast.loading("Enviando solicitud...");

    try {
      const response = await fetch(`/api/donaciones/${donacionASolicitar.id}/solicitar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospital_id: usuario.hospital_id
        })
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error("Error al solicitar donación", {
          description: data.error || "Intenta nuevamente",
          id: loadingToast
        });
        setLoadingSolicitud(false);
        return;
      }

      toast.success("¡Solicitud enviada!", {
        description: "Tu solicitud ha sido enviada al hospital donante",
        id: loadingToast
      });

      setMostrarModalSolicitud(false);
      setDonacionASolicitar(null);
      await cargarDonaciones();
      setLoadingSolicitud(false);

    } catch (error) {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor",
        id: loadingToast
      });
      setLoadingSolicitud(false);
    }
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

    if (diferenciaMilisegundos <= 0) {
      return {
        texto: "Expirado",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-900/20"
      };
    }

    const diferenciaDias = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

    if (diferenciaDias < 90) {
      const meses = Math.floor(diferenciaDias / 30);
      const dias = diferenciaDias % 30;
      let texto = diferenciaDias < 30 ? `${diferenciaDias} días` : `${meses} meses`;
      if (dias > 0 && diferenciaDias >= 30) texto += ` y ${dias} días`;
      return {
        texto,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-900/20"
      };
    } else if (diferenciaDias <= 365) {
      const meses = Math.floor(diferenciaDias / 30);
      return {
        texto: `${meses} meses`,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-900/20"
      };
    } else {
      const años = Math.floor(diferenciaDias / 365);
      const mesesRestantes = Math.floor((diferenciaDias % 365) / 30);
      let texto = años === 1 ? "1 año" : `${años} años`;
      if (mesesRestantes > 0) texto += ` y ${mesesRestantes} meses`;
      return {
        texto,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-900/20"
      };
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

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda, filtros y botones */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col flex-1 gap-3 lg:flex-row lg:items-center">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Buscar donaciones..."
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
              ...estadosDonacion.map(estado => ({ value: estado.nombre, label: estado.nombre }))
            ]}
            placeholder="Todos los estados"
          />

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
            onClick={() => setVistaActual("mias")}
            className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors rounded-lg ${vistaActual === "mias"
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Mis Donaciones
          </button>

          <button
            onClick={() => setVistaActual("recibidas")}
            className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors rounded-lg ${vistaActual === "recibidas"
              ? "bg-purple-500 text-white hover:bg-purple-600"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            Donaciones Recibidas
          </button>

          {vistaActual !== "todas" && (
            <button
              onClick={() => setVistaActual("todas")}
              className="px-4 py-3 text-sm font-semibold text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Ver Todas
            </button>
          )}

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
            {mostrarFormulario ? "Cancelar" : "Nueva Donación"}
          </button>
        </div>
      </div>

      {/* Formulario de Nueva Donación */}
      {mostrarFormulario && (
        <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
            Nueva Donación de Medicamento
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
                        cantidad: medicamento.cantidad,
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
                      id="fecha_fabricacion_crear_donacion"
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
                      id="fecha_expiracion_crear_donacion"
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

                  <div>
                    <Label>Tipo de Donación</Label>
                    <Select
                      name="tipo_donacion_id"
                      value={formData.tipo_donacion_id}
                      onChange={(value) => setFormData(prev => ({ ...prev, tipo_donacion_id: value }))}
                      options={tiposDonacion.map(tipo => ({ value: String(tipo.id), label: tipo.nombre }))}
                      placeholder="Seleccione un tipo"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: Cantidad a donar */}
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                Cantidad a donar
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
                    tipo="donacion"
                  />
                  <ImageUpload
                    label="Lote y Fecha de Vencimiento *"
                    onImageChange={(url) => setFormData(prev => ({ ...prev, imagen_lote_vencimiento: url }))}
                    currentImage={formData.imagen_lote_vencimiento}
                    tipo="donacion"
                  />
                  <ImageUpload
                    label="Principio Activo *"
                    onImageChange={(url) => setFormData(prev => ({ ...prev, imagen_principio_activo: url }))}
                    currentImage={formData.imagen_principio_activo}
                    tipo="donacion"
                  />
                </div>
              </div>
            </div>

            {/* Mensaje informativo */}
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
                <p className="font-semibold">Valide los datos antes de publicar</p>
                <p className="mt-1">
                  La información de la donación debe ser precisa y verificable, puesto que se publica en tiempo real.
                </p>
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
                Publicar Donación
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de donaciones */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 rounded-full border-brand-500 border-t-transparent animate-spin"></div>
        </div>
      ) : donaciones.length === 0 ? (
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
          <p className="text-gray-500 dark:text-gray-400">No se encontraron donaciones</p>
        </div>
      ) : (
        <div className="space-y-4">
          {donaciones.map((donacion) => (
            <TarjetaDonacion
              key={donacion.id}
              donacion={donacion}
              usuario={usuario}
              formatearFecha={formatearFecha}
              calcularTiempoRestante={calcularTiempoRestante}
              handleSolicitar={handleSolicitar}
              copiarAlPortapapeles={copiarAlPortapapeles}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal de confirmación de solicitud */}
      {mostrarModalSolicitud && donacionASolicitar && (
        <ModalSolicitudDonacion
          donacion={donacionASolicitar}
          onClose={() => {
            setMostrarModalSolicitud(false);
            setDonacionASolicitar(null);
            setLoadingSolicitud(false);
          }}
          onConfirm={confirmarSolicitud}
          loading={loadingSolicitud}
        />
      )}
    </div>
  );
}
