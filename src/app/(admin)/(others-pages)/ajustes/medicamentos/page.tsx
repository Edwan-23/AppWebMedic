"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PencilIcon, TrashBinIcon, PlusIcon } from "@/icons/index";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import Select from "@/components/form/Select";

interface Medicamento {
  id: string;
  nombre: string;
  referencia: string;
  concentracion: number;
  descripcion: string | null;
  tipo_medicamento_id: string | null;
  medida_medicamento_id: string | null;
  created_at: string;
  tipo_medicamento: {
    id: string;
    nombre: string;
  } | null;
  medida_medicamento: {
    id: string;
    nombre: string;
  } | null;
}

interface TipoMedicamento {
  id: string;
  nombre: string;
}

interface MedidaMedicamento {
  id: string;
  nombre: string;
}

export default function MedicamentosPage() {
  const router = useRouter();
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [totalMedicamentos, setTotalMedicamentos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] =
    useState<Medicamento | null>(null);
  const [medicamentoAEliminar, setMedicamentoAEliminar] = useState<{
    id: string;
    nombre: string;
  } | null>(null);
  const [tiposMedicamentos, setTiposMedicamentos] = useState<TipoMedicamento[]>([]);
  const [medidasMedicamentos, setMedidasMedicamentos] = useState<MedidaMedicamento[]>([]);

  const { isOpen: isAddOpen, openModal: openAddModal, closeModal: closeAddModal } = useModal();
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();

  const [formData, setFormData] = useState({
    nombre: "",
    referencia: "",
    concentracion: "",
    descripcion: "",
    tipo_medicamento_id: "",
    medida_medicamento_id: "",
  });
  
  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const medicamentosPorPagina = 10;

  // Obtener usuario actual
  const [usuarioActual, setUsuarioActual] = useState<any>(null);

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      setUsuarioActual(JSON.parse(usuario));
    }
  }, []);

  useEffect(() => {
    if (usuarioActual) {
      cargarMedicamentos();
      cargarTiposMedicamentos();
      cargarMedidasMedicamentos();
    }
  }, [usuarioActual]);

  const cargarMedicamentos = async () => {
    try {
      setCargando(true);
      const response = await fetch("/api/medicamentos");
      const data = await response.json();

      if (response.ok) {
        setMedicamentos(data.medicamentos);
        setTotalMedicamentos(data.total);
      } else {
        toast.error(data.error || "Error al cargar medicamentos");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar medicamentos");
    } finally {
      setCargando(false);
    }
  };

  const cargarTiposMedicamentos = async () => {
    try {
      const response = await fetch("/api/tipos-medicamentos");
      const data = await response.json();
      console.log("Tipos cargados:", data);
      setTiposMedicamentos(data);
    } catch (error) {
      console.error("Error al cargar tipos:", error);
    }
  };

  const cargarMedidasMedicamentos = async () => {
    try {
      const response = await fetch("/api/medidas-medicamentos");
      const data = await response.json();
      console.log("Medidas cargadas:", data);
      setMedidasMedicamentos(data);
    } catch (error) {
      console.error("Error al cargar medidas:", error);
    }
  };

  const handleAgregar = () => {
    setFormData({
      nombre: "",
      referencia: "",
      concentracion: "",
      descripcion: "",
      tipo_medicamento_id: "",
      medida_medicamento_id: "",
    });
    openAddModal();
  };

  const handleCrear = async () => {
    try {
      const response = await fetch("/api/medicamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          concentracion: parseInt(formData.concentracion),
          tipo_medicamento_id: formData.tipo_medicamento_id || null,
          medida_medicamento_id: formData.medida_medicamento_id || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Medicamento creado exitosamente");
        closeAddModal();
        cargarMedicamentos();
      } else {
        toast.error(data.error || "Error al crear medicamento");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear medicamento");
    }
  };

  const handleEditar = async (id: string) => {
    try {
      const response = await fetch(`/api/medicamentos/${id}`);
      const data = await response.json();

      if (response.ok) {
        setMedicamentoSeleccionado(data);
        setFormData({
          nombre: data.nombre || "",
          referencia: data.referencia || "",
          concentracion: data.concentracion?.toString() || "",
          descripcion: data.descripcion || "",
          tipo_medicamento_id: data.tipo_medicamento_id || "",
          medida_medicamento_id: data.medida_medicamento_id || "",
        });
        openEditModal();
      } else {
        toast.error(data.error || "Error al cargar medicamento");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar medicamento");
    }
  };

  const handleActualizar = async () => {
    if (!medicamentoSeleccionado) return;

    try {
      const response = await fetch(`/api/medicamentos/${medicamentoSeleccionado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          concentracion: parseInt(formData.concentracion),
          tipo_medicamento_id: formData.tipo_medicamento_id || null,
          medida_medicamento_id: formData.medida_medicamento_id || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Medicamento actualizado exitosamente");
        closeEditModal();
        cargarMedicamentos();
      } else {
        toast.error(data.error || "Error al actualizar medicamento");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar medicamento");
    }
  };

  const handleEliminar = (id: string, nombre: string) => {
    setMedicamentoAEliminar({ id, nombre });
    openDeleteModal();
  };

  const confirmarEliminar = async () => {
    if (!medicamentoAEliminar) return;

    try {
      const response = await fetch(`/api/medicamentos/${medicamentoAEliminar.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Medicamento eliminado exitosamente");
        closeDeleteModal();
        setMedicamentoAEliminar(null);
        cargarMedicamentos();
      } else {
        toast.error(data.error || "Error al eliminar medicamento");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar medicamento");
    }
  };

  if (!usuarioActual || usuarioActual.rol_id !== "1") {
    return null;
  }

  // Calcular paginación
  const totalPaginas = Math.ceil(totalMedicamentos / medicamentosPorPagina);
  const indiceInicio = (paginaActual - 1) * medicamentosPorPagina;
  const indiceFin = indiceInicio + medicamentosPorPagina;
  const medicamentosPaginados = medicamentos.slice(indiceInicio, indiceFin);

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
              Gestión de Medicamentos
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Administra todos los medicamentos registrados en el sistema
            </p>
          </div>
          <button
            onClick={handleAgregar}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Medicamento
          </button>
        </div>

        {/* Tarjeta de estadísticas */}
        <div className="mb-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Medicamentos
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white">
                  {totalMedicamentos}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de medicamentos */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30">
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Nombre
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Referencia
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Tipo
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Concentración
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Medida
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Descripción
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
              {medicamentosPaginados.map((medicamento) => (
                <tr
                  key={medicamento.id}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                >
                  <td className="py-4 text-sm font-medium text-gray-800 dark:text-white">
                    {medicamento.nombre}
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                    {medicamento.referencia}
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                    {medicamento.tipo_medicamento?.nombre || "N/A"}
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                    {medicamento.concentracion}
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                    {medicamento.medida_medicamento?.nombre || "N/A"}
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                    {medicamento.descripcion || "N/A"}
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                    {medicamento.created_at
                      ? new Date(medicamento.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : "N/A"}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditar(medicamento.id)}
                        className="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                        title="Editar"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() =>
                          handleEliminar(medicamento.id, medicamento.nombre)
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

          {cargando && (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Cargando medicamentos...</p>
            </div>
          )}

          {!cargando && medicamentos.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No hay medicamentos registrados en el sistema
              </p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
            <div className="text-sm text-gray-700 dark:text-gray-400">
              Mostrando {indiceInicio + 1} a {Math.min(indiceFin, totalMedicamentos)} de {totalMedicamentos} medicamentos
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Anterior
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => {
                  if (
                    numero === 1 ||
                    numero === totalPaginas ||
                    (numero >= paginaActual - 1 && numero <= paginaActual + 1)
                  ) {
                    return (
                      <button
                        key={numero}
                        onClick={() => cambiarPagina(numero)}
                        className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
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
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Agregar Medicamento */}
      <Modal
        isOpen={isAddOpen}
        onClose={closeAddModal}
        className="max-w-2xl"
      >
        <div className="p-6">
          <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
            Agregar Medicamento
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Nombre del medicamento"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Referencia *
                </label>
                <input
                  type="text"
                  value={formData.referencia}
                  onChange={(e) =>
                    setFormData({ ...formData, referencia: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Referencia única"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo de Medicamento
                </label>
                <Select
                  value={formData.tipo_medicamento_id}
                  onChange={(value) => setFormData({ ...formData, tipo_medicamento_id: value })}
                  options={tiposMedicamentos.map(tipo => ({ value: String(tipo.id), label: tipo.nombre }))}
                  placeholder="Seleccione un tipo"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Concentración *
                </label>
                <input
                  type="number"
                  value={formData.concentracion}
                  onChange={(e) =>
                    setFormData({ ...formData, concentracion: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Ej: 500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Medida
                </label>
                <Select
                  value={formData.medida_medicamento_id}
                  onChange={(value) => setFormData({ ...formData, medida_medicamento_id: value })}
                  options={medidasMedicamentos.map(medida => ({ value: String(medida.id), label: medida.nombre }))}
                  placeholder="Seleccione una medida"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Descripción del medicamento (opcional)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={closeAddModal}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrear}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Crear Medicamento
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Editar Medicamento */}
      <Modal
        isOpen={isEditOpen}
        onClose={closeEditModal}
        className="max-w-2xl"
      >
        <div className="p-6">
          <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
            Editar Medicamento
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Referencia *
                </label>
                <input
                  type="text"
                  value={formData.referencia}
                  onChange={(e) =>
                    setFormData({ ...formData, referencia: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo de Medicamento
                </label>
                <Select
                  value={formData.tipo_medicamento_id}
                  onChange={(value) => setFormData({ ...formData, tipo_medicamento_id: value })}
                  options={tiposMedicamentos.map(tipo => ({ value: String(tipo.id), label: tipo.nombre }))}
                  placeholder="Seleccione un tipo"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Concentración *
                </label>
                <input
                  type="number"
                  value={formData.concentracion}
                  onChange={(e) =>
                    setFormData({ ...formData, concentracion: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Medida
                </label>
                <Select
                  value={formData.medida_medicamento_id}
                  onChange={(value) => setFormData({ ...formData, medida_medicamento_id: value })}
                  options={medidasMedicamentos.map(medida => ({ value: String(medida.id), label: medida.nombre }))}
                  placeholder="Seleccione una medida"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={closeEditModal}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleActualizar}
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
        title="Eliminar Medicamento"
        message={`¿Está seguro de que desea eliminar el medicamento <b>${medicamentoAEliminar?.nombre}</b>? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
