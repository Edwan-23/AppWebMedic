"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EyeIcon, PencilIcon, TrashBinIcon } from "@/icons/index";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import ConfirmModal from "@/components/common/ConfirmModal";

interface Hospital {
  id: string;
  rut: string;
  nombre: string;
  direccion: string;
  telefono: string | null;
  celular: string | null;
  correo: string | null;
  director: string | null;
  estado_id: string | null;
  departamento_id: string | null;
  municipio_id: string | null;
  created_at: string;
  estado_base: {
    id: string;
    nombre: string;
  } | null;
  departamentos: {
    id: string;
    nombre: string;
  } | null;
  municipios: {
    id: string;
    nombre: string;
  } | null;
}

export default function HospitalesPage() {
  const router = useRouter();
  const [hospitales, setHospitales] = useState<Hospital[]>([]);
  const [totalHospitales, setTotalHospitales] = useState(0);
  const [totalActivos, setTotalActivos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [hospitalSeleccionado, setHospitalSeleccionado] =
    useState<Hospital | null>(null);
  const [hospitalAEliminar, setHospitalAEliminar] = useState<{
    id: string;
    nombre: string;
  } | null>(null);

  const { isOpen: isVerOpen, openModal: openVerModal, closeModal: closeVerModal } = useModal();
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();

  const [formData, setFormData] = useState({
    nombre: "",
    rut: "",
    direccion: "",
    telefono: "",
    celular: "",
    correo: "",
    director: "",
  });
  
  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const hospitalesPorPagina = 10;

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
      cargarHospitales();
    }
  }, [usuarioActual]);

  const cargarHospitales = async () => {
    try {
      setCargando(true);
      const response = await fetch("/api/hospitales");
      const data = await response.json();

      if (response.ok) {
        setHospitales(data.hospitales);
        setTotalHospitales(data.total);
        setTotalActivos(data.activos);
      } else {
        toast.error(data.error || "Error al cargar hospitales");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar hospitales");
    } finally {
      setCargando(false);
    }
  };

  const handleVer = async (id: string) => {
    try {
      const response = await fetch(`/api/hospitales/${id}`);
      const data = await response.json();

      if (response.ok) {
        setHospitalSeleccionado(data);
        openVerModal();
      } else {
        toast.error(data.error || "Error al cargar hospital");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar hospital");
    }
  };

  const handleEditar = async (id: string) => {
    try {
      const response = await fetch(`/api/hospitales/${id}`);
      const data = await response.json();

      if (response.ok) {
        setHospitalSeleccionado(data);
        setFormData({
          nombre: data.nombre || "",
          rut: data.rut || "",
          direccion: data.direccion || "",
          telefono: data.telefono || "",
          celular: data.celular || "",
          correo: data.correo || "",
          director: data.director || "",
        });
        openEditModal();
      } else {
        toast.error(data.error || "Error al cargar hospital");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar hospital");
    }
  };

  const handleActualizar = async () => {
    if (!hospitalSeleccionado) return;

    try {
      const response = await fetch(`/api/hospitales/${hospitalSeleccionado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Hospital actualizado exitosamente");
        closeEditModal();
        cargarHospitales();
      } else {
        toast.error(data.error || "Error al actualizar hospital");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar hospital");
    }
  };

  const handleEliminar = (id: string, nombre: string) => {
    setHospitalAEliminar({ id, nombre });
    openDeleteModal();
  };

  const confirmarEliminar = async () => {
    if (!hospitalAEliminar) return;

    try {
      const response = await fetch(`/api/hospitales/${hospitalAEliminar.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Hospital eliminado exitosamente");
        closeDeleteModal();
        setHospitalAEliminar(null);
        cargarHospitales();
      } else {
        toast.error(data.error || "Error al eliminar hospital");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar hospital");
    }
  };

  if (!usuarioActual || usuarioActual.rol_id !== "1") {
    return null;
  }

  // Calcular paginación
  const totalPaginas = Math.ceil(totalHospitales / hospitalesPorPagina);
  const indiceInicio = (paginaActual - 1) * hospitalesPorPagina;
  const indiceFin = indiceInicio + hospitalesPorPagina;
  const hospitalesPaginados = hospitales.slice(indiceInicio, indiceFin);

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
              Gestión de Hospitales
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Administra todos los hospitales registrados en el sistema
            </p>
          </div>
        </div>

      {/* Tarjetas de estadísticas */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-800/50">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Hospitales
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white">
              {totalHospitales}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Hospitales Activos
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
                Hospitales Inactivos
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white">
                {totalHospitales - totalActivos}
              </p>
            </div>
          </div>
        </div>
      </div>

        {/* Tabla de hospitales */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30">
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Nombre
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Ubicación
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Teléfono
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Celular
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Director
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
              {hospitalesPaginados.map((hospital) => (
                <tr
                  key={hospital.id}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                >
                  <td className="py-4 text-sm font-medium text-gray-800 dark:text-white">
                    {hospital.nombre}
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                    {hospital.municipios?.nombre || "N/A"}
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                    {hospital.telefono || "N/A"}
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                    {hospital.celular || "N/A"}
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                    {hospital.director || "N/A"}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        hospital.estado_base?.nombre === "Activo"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {hospital.estado_base?.nombre || "N/A"}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                    {hospital.created_at
                      ? new Date(hospital.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : "N/A"}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleVer(hospital.id)}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                        title="Ver"
                      >
                        <EyeIcon />
                      </button>
                      <button
                        onClick={() => handleEditar(hospital.id)}
                        className="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                        title="Editar"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() =>
                          handleEliminar(hospital.id, hospital.nombre)
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Cargando hospitales...</p>
            </div>
          )}

          {!cargando && hospitales.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No hay hospitales registrados en el sistema
              </p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
            <div className="text-sm text-gray-700 dark:text-gray-400">
              Mostrando {indiceInicio + 1} a {Math.min(indiceFin, totalHospitales)} de {totalHospitales} hospitales
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

      {/* Modal Ver */}
      <Modal isOpen={isVerOpen} onClose={closeVerModal} className="max-w-2xl">
        {hospitalSeleccionado && (
          <div className="p-6">
            <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
              Detalles del Hospital
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  RUT
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {hospitalSeleccionado.rut}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {hospitalSeleccionado.nombre}
                </p>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dirección
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {hospitalSeleccionado.direccion}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Departamento
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {hospitalSeleccionado.departamentos?.nombre || "N/A"}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Municipio
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {hospitalSeleccionado.municipios?.nombre || "N/A"}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Teléfono
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {hospitalSeleccionado.telefono || "N/A"}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Celular
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {hospitalSeleccionado.celular || "N/A"}
                </p>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Correo
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {hospitalSeleccionado.correo || "N/A"}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Director
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {hospitalSeleccionado.director || "N/A"}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estado
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {hospitalSeleccionado.estado_base?.nombre || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Editar */}
      <Modal
        isOpen={isEditOpen}
        onClose={closeEditModal}
        className="max-w-2xl"
      >
        <div className="p-6">
          <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
            Editar Hospital
          </h3>
          
          <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre
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
                RUT
              </label>
              <input
                type="text"
                value={formData.rut}
                onChange={(e) =>
                  setFormData({ ...formData, rut: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Director
              </label>
              <input
                type="text"
                value={formData.director}
                onChange={(e) =>
                  setFormData({ ...formData, director: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Dirección
              </label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Teléfono
              </label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Celular
              </label>
              <input
                type="text"
                value={formData.celular}
                onChange={(e) =>
                  setFormData({ ...formData, celular: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Correo
              </label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) =>
                  setFormData({ ...formData, correo: e.target.value })
                }
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
        title="Eliminar Hospital"
        message={`¿Está seguro de que desea eliminar el hospital <b>${hospitalAEliminar?.nombre}</b>? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
