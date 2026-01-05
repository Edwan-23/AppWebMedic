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
  created_at?: string;
  updated_at?: string;
}

export default function UsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalActivos, setTotalActivos] = useState(0);
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  
  // Estados para modales
  const { isOpen: isVerOpen, openModal: openVerModal, closeModal: closeVerModal } = useModal();
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<{ id: string; nombre: string } | null>(null);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
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
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Usuarios Activos
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white">
                  {totalActivos}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Usuarios Inactivos
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white">
                  {totalUsuarios - totalActivos}
                </p>
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
                  Correo
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
                    {usuario.correo_corporativo}
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
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {usuario.estado_base?.nombre || "N/A"}
                    </span>
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
                  onChange={(e) => setFormData({ ...formData, correo_corporativo: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="celular">Celular</Label>
                <Input
                  id="celular"
                  type="text"
                  defaultValue={formData.celular}
                  onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
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
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                          paginaActual === numero
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
