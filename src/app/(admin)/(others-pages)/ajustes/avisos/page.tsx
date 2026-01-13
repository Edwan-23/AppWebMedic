"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PencilIcon, TrashBinIcon } from "@/icons/index";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import DatePicker from "@/components/form/date-picker";

interface Aviso {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  publicado: boolean;
  created_at: string;
  updated_at: string;
  usuario: {
    id: string;
    nombre_completo: string;
  } | null;
}

export default function AvisosPage() {
  const router = useRouter();
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [totalAvisos, setTotalAvisos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [avisoSeleccionado, setAvisoSeleccionado] = useState<Aviso | null>(null);
  const [avisoAEliminar, setAvisoAEliminar] = useState<{
    id: string;
    titulo: string;
  } | null>(null);
  const [avisoAPublicar, setAvisoAPublicar] = useState<{
    id: string;
    titulo: string;
    publicado: boolean;
  } | null>(null);

  const { isOpen: isCreateOpen, openModal: openCreateModal, closeModal: closeCreateModal } = useModal();
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const { isOpen: isPublishOpen, openModal: openPublishModal, closeModal: closePublishModal } = useModal();

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
  });

  const [usuarioActual, setUsuarioActual] = useState<any>(null);

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      setUsuarioActual(JSON.parse(usuario));
    }
  }, []);

  useEffect(() => {
    if (usuarioActual) {
      cargarAvisos();
    }
  }, [usuarioActual]);

  const cargarAvisos = async () => {
    try {
      setCargando(true);
      const response = await fetch("/api/avisos");
      const data = await response.json();

      if (response.ok) {
        setAvisos(data.avisos);
        setTotalAvisos(data.total);
      } else {
        toast.error(data.error || "Error al cargar avisos");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar avisos");
    } finally {
      setCargando(false);
    }
  };

  const handleCrear = () => {
    if (totalAvisos >= 3) {
      toast.error("Límite alcanzado", {
        description: "Solo se permiten 3 avisos. Elimina uno para crear otro.",
      });
      return;
    }
    setFormData({
      titulo: "",
      descripcion: "",
      fecha: new Date().toISOString().split('T')[0],
    });
    openCreateModal();
  };

  const handleSubmitCrear = async () => {
    try {
      const response = await fetch("/api/avisos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          usuario_id: usuarioActual.id,
          publicado: false, // Guardar como borrador
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Aviso guardado como borrador");
        closeCreateModal();
        cargarAvisos();
      } else {
        toast.error(data.error || "Error al crear aviso");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear aviso");
    }
  };

  const handleSubmitCrearYPublicar = async () => {
    try {
      const response = await fetch("/api/avisos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          usuario_id: usuarioActual.id,
          publicado: true, // Publicar inmediatamente
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Aviso creado y publicado exitosamente");
        closeCreateModal();
        cargarAvisos();
      } else {
        toast.error(data.error || "Error al crear y publicar aviso");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear y publicar aviso");
    }
  };

  const handleEditar = async (aviso: Aviso) => {
    setAvisoSeleccionado(aviso);
    setFormData({
      titulo: aviso.titulo,
      descripcion: aviso.descripcion,
      fecha: new Date(aviso.fecha).toISOString().split('T')[0],
    });
    openEditModal();
  };

  const handleSubmitEditar = async () => {
    if (!avisoSeleccionado) return;

    try {
      const response = await fetch(`/api/avisos/${avisoSeleccionado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Aviso actualizado exitosamente");
        closeEditModal();
        cargarAvisos();
      } else {
        toast.error(data.error || "Error al actualizar aviso");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar aviso");
    }
  };

  const handlePublicar = (id: string, titulo: string, publicado: boolean) => {
    setAvisoAPublicar({ id, titulo, publicado });
    openPublishModal();
  };

  const confirmarPublicar = async () => {
    if (!avisoAPublicar) return;

    try {
      const response = await fetch(`/api/avisos/${avisoAPublicar.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicado: !avisoAPublicar.publicado,
        }),
      });

      if (response.ok) {
        toast.success(avisoAPublicar.publicado ? "Aviso desactivado" : "Aviso publicado exitosamente");
        closePublishModal();
        setAvisoAPublicar(null);
        cargarAvisos();
      } else {
        const data = await response.json();
        toast.error(data.error || "Error al cambiar estado");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cambiar estado del aviso");
    }
  };

  const handleEliminar = (id: string, titulo: string) => {
    setAvisoAEliminar({ id, titulo });
    openDeleteModal();
  };

  const confirmarEliminar = async () => {
    if (!avisoAEliminar) return;

    try {
      const response = await fetch(`/api/avisos/${avisoAEliminar.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Aviso eliminado exitosamente");
        closeDeleteModal();
        setAvisoAEliminar(null);
        cargarAvisos();
      } else {
        toast.error(data.error || "Error al eliminar aviso");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar aviso");
    }
  };

  if (!usuarioActual || usuarioActual.rol_id !== "1") {
    return null;
  }

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
              Gestión de Avisos
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Cree y administre hasta 3 avisos.
            </p>
          </div>
          <button
            onClick={handleCrear}
            disabled={totalAvisos >= 3}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Aviso {totalAvisos >= 3 && "(Límite alcanzado)"}
          </button>
        </div>

        {/* Tarjetas de Avisos */}
        <div className="space-y-4">
          {cargando ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Cargando avisos...</p>
            </div>
          ) : avisos.length === 0 ? (
            <div className="py-12 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                No hay avisos creados.
              </p>
            </div>
          ) : (
            avisos.map((aviso) => (
              <div
                key={aviso.id}
                className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {aviso.titulo}
                      </h4>
                      {aviso.publicado && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Publicado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {aviso.descripcion}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                      <span>
                        Fecha Finalización: {new Date(aviso.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      {aviso.usuario && (
                        <span>Por: {aviso.usuario.nombre_completo}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">

                    <button
                      onClick={() => handlePublicar(aviso.id, aviso.titulo, aviso.publicado)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${aviso.publicado
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50'
                        : 'bg-brand-500 text-white hover:bg-brand-600'
                        }`}
                    >
                      {aviso.publicado ? "Desactivado" : "Publicar"}
                    </button>
                    <button
                      onClick={() => handleEditar(aviso)}
                      className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      title="Editar"
                    >
                      <PencilIcon />
                    </button>
                    <button
                      onClick={() => handleEliminar(aviso.id, aviso.titulo)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      title="Eliminar"
                    >
                      <TrashBinIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Crear Aviso */}
      <Modal
        isOpen={isCreateOpen}
        onClose={closeCreateModal}
        className="max-w-2xl"
      >
        <div className="p-6">
          <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
            Crear Nuevo Aviso
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Título *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Título del aviso"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Fecha de Finalización *
              </label>
              <DatePicker
                id="fecha-finalizacion-crear"
                defaultDate={formData.fecha || undefined}
                onChange={(selectedDates) => {
                  if (selectedDates.length > 0) {
                    const date = selectedDates[0];
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    setFormData({ ...formData, fecha: `${year}-${month}-${day}` });
                  }
                }}
                minDate="today"
                placeholder="Seleccione una fecha"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                El aviso se desactiva automáticamente en esta fecha
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Descripción *
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Descripción del aviso"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={closeCreateModal}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitCrear}
                className="rounded-lg border border-brand-500 bg-white px-4 py-2 text-sm font-medium text-brand-500 hover:bg-brand-50 dark:border-brand-400 dark:bg-gray-800 dark:text-brand-400 dark:hover:bg-brand-900/20"
              >
                Guardar
              </button>
              <button
                onClick={handleSubmitCrearYPublicar}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Guardar y Publicar
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Editar Aviso */}
      <Modal
        isOpen={isEditOpen}
        onClose={closeEditModal}
        className="max-w-2xl"
      >
        <div className="p-6">
          <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
            Editar Aviso
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Título *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Fecha de Desactivación *
              </label>
              <DatePicker
                id="fecha-finalizacion-editar"
                defaultDate={formData.fecha || undefined}
                onChange={(selectedDates) => {
                  if (selectedDates.length > 0) {
                    const date = selectedDates[0];
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    setFormData({ ...formData, fecha: `${year}-${month}-${day}` });
                  }
                }}
                minDate="today"
                placeholder="Seleccione una fecha"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                El aviso se desactiva automáticamente en esta fecha
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Descripción *
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={closeEditModal}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitEditar}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Eliminar */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmarEliminar}
        title="Eliminar Aviso"
        message={`¿Está seguro de que desea eliminar el aviso <b>${avisoAEliminar?.titulo}</b>? Esta acción no se puede deshacer.`}
      />

      {/* Modal Publicar/Desactivar */}
      <ConfirmModal
        isOpen={isPublishOpen}
        onClose={closePublishModal}
        onConfirm={confirmarPublicar}
        title={avisoAPublicar?.publicado ? "Desactivar Aviso" : "Publicar Aviso"}
        message={avisoAPublicar?.publicado
          ? `¿Desea desactivar el aviso <b>${avisoAPublicar?.titulo}</b>? Dejará de mostrarse en la sección de Publicaciones.`
          : `¿Desea publicar el aviso <b>${avisoAPublicar?.titulo}</b>? Se mostrará en la sección de Publicaciones hasta la fecha de desactivación.`
        }
      />
    </div>
  );
}
