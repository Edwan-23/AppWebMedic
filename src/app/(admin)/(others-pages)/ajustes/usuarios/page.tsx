"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PencilIcon, EyeIcon, TrashBinIcon, CloseIcon } from "@/icons/index";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import ConfirmModal from "@/components/common/ConfirmModal";

interface Usuario {
  id: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  correo_corporativo: string;
  celular: string;
  fecha_nacimiento?: string;
  sexo?: string;
  numero_tarjeta_profesional?: string;
  rol_id?: string;
  hospital_id?: string;
  rol?: {
    id: string;
    nombre: string;
  };
  hospital?: {
    id: string;
    nombre: string;
    rut?: string;
    direccion?: string;
  };
  estado_base?: {
    id: string;
    nombre: string;
  };
  ultimo_ingreso?: string;
  created_at?: string;
  updated_at?: string;
}

export default function UsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalActivos, setTotalActivos] = useState(0);
  const [totalAusentes, setTotalAusentes] = useState(0);
  const [totalSuspendidos, setTotalSuspendidos] = useState(0);
  const [usuarioActual, setUsuarioActual] = useState<any>(null);

  // Estados para modales
  const { isOpen: isVerOpen, openModal: openVerModal, closeModal: closeVerModal } = useModal();
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const { isOpen: isSuspendOpen, openModal: openSuspendModal, closeModal: closeSuspendModal } = useModal();
  const { isOpen: isActivateOpen, openModal: openActivateModal, closeModal: closeActivateModal } = useModal();
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<{ id: string; nombre: string } | null>(null);
  const [usuarioASuspender, setUsuarioASuspender] = useState<{ id: string; nombre: string } | null>(null);
  const [usuarioAActivar, setUsuarioAActivar] = useState<{ id: string; nombre: string } | null>(null);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    correo_corporativo: "",
    celular: "",
  });
  const [erroresValidacion, setErroresValidacion] = useState({
    correo_corporativo: "",
    celular: "",
  });

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 10;

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      const user = JSON.parse(usuarioData);
      setUsuarioActual(user);

      if (user.rol_id !== "1") {
        router.push("/");
        return;
      }
      cargarUsuarios();
    } else {
      router.push("/sesion");
    }
  }, [router]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/usuarios");

      if (!response.ok) {
        throw new Error("Error al cargar usuarios");
      }

      const data = await response.json();
      setUsuarios(data.usuarios);
      setTotalUsuarios(data.total);
      setTotalActivos(data.activos);
      setTotalAusentes(data.ausentes);
      setTotalSuspendidos(data.suspendidos);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleVer = async (id: string) => {
    try {
      const response = await fetch(`/api/usuarios/${id}`);
      if (!response.ok) throw new Error("Error al cargar usuario");

      const data = await response.json();
      setUsuarioSeleccionado(data);
      openVerModal();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar información del usuario");
    }
  };

  const handleEditar = async (id: string) => {
    try {
      const response = await fetch(`/api/usuarios/${id}`);
      if (!response.ok) throw new Error("Error al cargar usuario");

      const data = await response.json();
      setUsuarioSeleccionado(data);
      setFormData({
        nombres: data.nombres || "",
        apellidos: data.apellidos || "",
        correo_corporativo: data.correo_corporativo || "",
        celular: data.celular || "",
      });
      openEditModal();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar información del usuario");
    }
  };

  const handleActualizar = async () => {
    if (!usuarioSeleccionado) return;

    // Validaciones
    const errores = {
      correo_corporativo: "",
      celular: "",
    };

    // Validar correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo_corporativo || !emailRegex.test(formData.correo_corporativo)) {
      errores.correo_corporativo = "El correo debe tener un formato válido (ejemplo@dominio.com)";
    }

    // Validar celular
    if (formData.celular) {
      if (!/^\d+$/.test(formData.celular)) {
        errores.celular = "El celular solo debe contener números";
      } else if (formData.celular.length !== 10) {
        errores.celular = "El celular debe tener 10 dígitos";
      }
    }

    // Si hay errores, mostrarlos y no continuar
    if (errores.correo_corporativo || errores.celular) {
      setErroresValidacion(errores);
      toast.error("Por favor corrija los errores en el formulario");
      return;
    }

    // Limpiar errores
    setErroresValidacion({ correo_corporativo: "", celular: "" });

    try {
      const response = await fetch(`/api/usuarios/${usuarioSeleccionado.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar");
      }

      toast.success("Usuario actualizado exitosamente");
      closeEditModal();
      cargarUsuarios();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error al actualizar usuario");
    }
  };

  const handleEliminar = (id: string, nombreCompleto: string) => {
    setUsuarioAEliminar({ id, nombre: nombreCompleto });
    openDeleteModal();
  };

  const confirmarEliminar = async () => {
    if (!usuarioAEliminar) return;

    try {
      const response = await fetch(`/api/usuarios/${usuarioAEliminar.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar usuario");
      }

      toast.success("Usuario eliminado exitosamente");
      closeDeleteModal();
      setUsuarioAEliminar(null);
      cargarUsuarios();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar usuario");
    }
  };

  const handleSuspender = (id: string, nombreCompleto: string) => {
    setUsuarioASuspender({ id, nombre: nombreCompleto });
    openSuspendModal();
  };

  const confirmarSuspender = async () => {
    if (!usuarioASuspender) return;

    try {
      const response = await fetch(`/api/usuarios/${usuarioASuspender.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_base_id: "3" }), // Estado Suspendido
      });

      if (!response.ok) {
        throw new Error("Error al suspender usuario");
      }

      toast.success("Usuario suspendido exitosamente");
      closeSuspendModal();
      setUsuarioASuspender(null);
      closeEditModal(); 
      cargarUsuarios();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al suspender usuario");
    }
  };

  const handleActivar = (id: string, nombreCompleto: string) => {
    setUsuarioAActivar({ id, nombre: nombreCompleto });
    openActivateModal();
  };

  const confirmarActivar = async () => {
    if (!usuarioAActivar) return;

    try {
      const response = await fetch(`/api/usuarios/${usuarioAActivar.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_base_id: "1" }), // Estado Activo
      });

      if (!response.ok) {
        throw new Error("Error al activar usuario");
      }

      toast.success("Usuario activado exitosamente");
      closeActivateModal();
      setUsuarioAActivar(null);
      closeEditModal(); 
      cargarUsuarios();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al activar usuario");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando usuarios...</div>
      </div>
    );
  }

  if (!usuarioActual || usuarioActual.rol_id !== "1") {
    return null;
  }

  // Calcular paginación
  const totalPaginas = Math.ceil(totalUsuarios / usuariosPorPagina);
  const indiceInicio = (paginaActual - 1) * usuariosPorPagina;
  const indiceFin = indiceInicio + usuariosPorPagina;
  const usuariosPaginados = usuarios.slice(indiceInicio, indiceFin);

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="mb-3 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Gestión de Usuarios
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Administra todos los usuarios registrados en el sistema
            </p>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Usuarios
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white">
                  {totalUsuarios}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center dark:bg-brand-900/30">
                <svg className="h-10 w-10 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Activos
                </p>
                <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                  {totalActivos}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center dark:bg-green-900/30">
                <svg className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ausentes
                </p>
                <p className="mt-2 text-3xl font-bold text-orange-500 dark:text-orange-400">
                  {totalAusentes}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center dark:bg-orange-900/30">
                <svg className="h-10 w-10 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Suspendidos
                </p>
                <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                  {totalSuspendidos}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center dark:bg-red-900/30">
                <svg className="h-10 w-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30">
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Nombre Completo
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Cédula
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Celular
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Rol
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Hospital
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Estado
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Último Ingreso
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Fecha Creación
                </th>
                <th className="pb-3 text-center text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {usuariosPaginados.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                >
                  <td className="py-4 text-sm font-medium text-gray-800 dark:text-white">
                    {usuario.nombres} {usuario.apellidos}
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                    {usuario.cedula}
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                    {usuario.celular || "N/A"}
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                    {usuario.rol?.nombre || "N/A"}
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                    {usuario.hospital?.nombre || "N/A"}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        usuario.estado_base?.nombre === "Activo"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : usuario.estado_base?.nombre === "Ausente"
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {usuario.estado_base?.nombre || "N/A"}
                    </span>
                  </td>

                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                    {usuario.ultimo_ingreso
                      ? new Date(usuario.ultimo_ingreso).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                      : "N/A"}
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                    {usuario.created_at
                      ? new Date(usuario.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                      : "N/A"}
                  </td>

                  <td className="py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleVer(usuario.id)}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                        title="Ver"
                      >
                        <EyeIcon />
                      </button>
                      <button
                        onClick={() => handleEditar(usuario.id)}
                        className="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                        title="Editar"
                      >
                        <PencilIcon />
                      </button>
                      {usuario.rol_id !== "1" && (
                        <button
                          onClick={() =>
                            handleEliminar(
                              usuario.id,
                              `${usuario.nombres} ${usuario.apellidos}`
                            )
                          }
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          title="Eliminar"
                        >
                          <TrashBinIcon />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>


          {/* Modal Ver Usuario */}
          <Modal isOpen={isVerOpen} onClose={closeVerModal} className="max-w-2xl">
            {usuarioSeleccionado && (
              <div className="p-6">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
                  Información del Usuario
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">NOMBRES</p>
                    <p className="mt-1 text-sm text-gray-800 dark:text-white">{usuarioSeleccionado.nombres}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">APELLIDOS</p>
                    <p className="mt-1 text-sm text-gray-800 dark:text-white">{usuarioSeleccionado.apellidos}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">CÉDULA</p>
                    <p className="mt-1 text-sm text-gray-800 dark:text-white">{usuarioSeleccionado.cedula}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">SEXO</p>
                    <p className="mt-1 text-sm text-gray-800 dark:text-white">{usuarioSeleccionado.sexo || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">FECHA DE NACIMIENTO</p>
                    <p className="mt-1 text-sm text-gray-800 dark:text-white">
                      {usuarioSeleccionado.fecha_nacimiento
                        ? new Date(usuarioSeleccionado.fecha_nacimiento).toLocaleDateString('es-ES')
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">CORREO CORPORATIVO</p>
                    <p className="mt-1 text-sm text-gray-800 dark:text-white">{usuarioSeleccionado.correo_corporativo}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">CELULAR</p>
                    <p className="mt-1 text-sm text-gray-800 dark:text-white">{usuarioSeleccionado.celular || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">TARJETA PROFESIONAL</p>
                    <p className="mt-1 text-sm text-gray-800 dark:text-white">{usuarioSeleccionado.numero_tarjeta_profesional || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">ROL</p>
                    <p className="mt-1 text-sm text-gray-800 dark:text-white">{usuarioSeleccionado.rol?.nombre || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">ESTADO</p>
                    <p className="mt-1 text-sm text-gray-800 dark:text-white">{usuarioSeleccionado.estado_base?.nombre || "N/A"}</p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">HOSPITAL</p>
                    <p className="mt-1 text-sm text-gray-800 dark:text-white">{usuarioSeleccionado.hospital?.nombre || "N/A"}</p>
                    {usuarioSeleccionado.hospital?.direccion && (
                      <p className="mt-1 text-xs text-gray-500">{usuarioSeleccionado.hospital.direccion}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeVerModal}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </Modal>

          {/* Modal Editar Usuario */}
          <Modal isOpen={isEditOpen} onClose={closeEditModal} className="max-w-2xl">
            {usuarioSeleccionado && (
              <div className="p-6">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
                  Editar Usuario
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="nombres">Nombres *</Label>
                    <Input
                      id="nombres"
                      type="text"
                      defaultValue={formData.nombres}
                      onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="apellidos">Apellidos *</Label>
                    <Input
                      id="apellidos"
                      type="text"
                      defaultValue={formData.apellidos}
                      onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="correo">Correo Corporativo *</Label>
                    <Input
                      id="correo"
                      type="email"
                      defaultValue={formData.correo_corporativo}
                      onChange={(e) => {
                        setFormData({ ...formData, correo_corporativo: e.target.value });
                        if (erroresValidacion.correo_corporativo) {
                          setErroresValidacion({ ...erroresValidacion, correo_corporativo: "" });
                        }
                      }}
                    />
                    {erroresValidacion.correo_corporativo && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {erroresValidacion.correo_corporativo}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="celular">Celular</Label>
                    <input
                      id="celular"
                      type="tel"
                      maxLength={10}
                      pattern="[0-9]*"
                      value={formData.celular}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, celular: value });
                        if (erroresValidacion.celular) {
                          setErroresValidacion({ ...erroresValidacion, celular: "" });
                        }
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/[^0-9]/g, '');
                      }}
                      placeholder="3001234567"
                      className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 bg-white text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                    {erroresValidacion.celular && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {erroresValidacion.celular}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-between gap-3">
                  <div>
                    {usuarioSeleccionado.rol_id !== "1" && (
                      usuarioSeleccionado.estado_base?.id === "3" ? (
                        <button
                          onClick={() => handleActivar(usuarioSeleccionado.id, `${usuarioSeleccionado.nombres} ${usuarioSeleccionado.apellidos}`)}
                          className="rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 dark:border-green-700 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-green-900/20"
                        >
                          Activar Usuario
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspender(usuarioSeleccionado.id, `${usuarioSeleccionado.nombres} ${usuarioSeleccionado.apellidos}`)}
                          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          Suspender Usuario
                        </button>
                      )
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={closeEditModal}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleActualizar}
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                    >
                      Actualizar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Modal>

          {/* Modal Confirmar Eliminación */}
          <ConfirmModal
            isOpen={isDeleteOpen}
            onClose={closeDeleteModal}
            onConfirm={confirmarEliminar}
            title="Eliminar Usuario"
            message={`¿Está seguro de eliminar al usuario <b>${usuarioAEliminar?.nombre}</b>? Esta acción no se puede deshacer.`}
            confirmText="Eliminar"
            cancelText="Cancelar"
            variant="danger"
          />

          {/* Modal Confirmar Suspensión */}
          <ConfirmModal
            isOpen={isSuspendOpen}
            onClose={closeSuspendModal}
            onConfirm={confirmarSuspender}
            title="Suspender Usuario"
            message={`¿Está seguro de suspender al usuario <b>${usuarioASuspender?.nombre}</b>? El usuario no podrá acceder al sistema hasta que sea reactivado.`}
            confirmText="Suspender"
            cancelText="Cancelar"
            variant="warning"
          />

          {/* Modal Confirmar Activación */}
          <ConfirmModal
            isOpen={isActivateOpen}
            onClose={closeActivateModal}
            onConfirm={confirmarActivar}
            title="Activar Usuario"
            message={`¿Está seguro de activar al usuario <b>${usuarioAActivar?.nombre}</b>? El usuario podrá acceder al sistema nuevamente.`}
            confirmText="Activar"
            cancelText="Cancelar"
            variant="info"
          />

          {usuarios.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No hay usuarios registrados
              </p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-400">
              Mostrando {indiceInicio + 1} a {Math.min(indiceFin, totalUsuarios)} de {totalUsuarios} usuarios
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => {
                  // Mostrar solo algunas páginas alrededor de la actual
                  if (
                    numero === 1 ||
                    numero === totalPaginas ||
                    (numero >= paginaActual - 1 && numero <= paginaActual + 1)
                  ) {
                    return (
                      <button
                        key={numero}
                        onClick={() => cambiarPagina(numero)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${paginaActual === numero
                            ? "bg-brand-500 text-white"
                            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          }`}
                      >
                        {numero}
                      </button>
                    );
                  } else if (
                    numero === paginaActual - 2 ||
                    numero === paginaActual + 2
                  ) {
                    return (
                      <span key={numero} className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
