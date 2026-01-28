"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Label from "@/components/form/Label";

interface MedicamentoSeleccionado {
  principioactivo: string;
  expedientecum: string;
  consecutivocum: string;
  cantidad: string;
  unidadmedida: string;
  formafarmaceutica: string;
  titular: string;
  descripcioncomercial: string;
}

interface BuscadorMedicamentosProps {
  onMedicamentoSeleccionado: (medicamento: MedicamentoSeleccionado) => void;
  medicamentoInicial?: MedicamentoSeleccionado | null;
}

export default function BuscadorMedicamentos({
  onMedicamentoSeleccionado,
  medicamentoInicial
}: BuscadorMedicamentosProps) {
  // Estados para cada filtro ( Expediente → Consecutivo → Principio Activo → siguientes...)
  const [busquedaExpediente, setBusquedaExpediente] = useState("");
  const [expedientecum, setExpedientecum] = useState(medicamentoInicial?.expedientecum || "");
  const [consecutivocum, setConsecutivocum] = useState(medicamentoInicial?.consecutivocum || "");
  const [principioactivo, setPrincipioactivo] = useState(medicamentoInicial?.principioactivo || "");
  const [cantidad, setCantidad] = useState(medicamentoInicial?.cantidad || "");
  const [unidadmedida, setUnidadmedida] = useState(medicamentoInicial?.unidadmedida || "");
  const [formafarmaceutica, setFormafarmaceutica] = useState(medicamentoInicial?.formafarmaceutica || "");
  const [titular, setTitular] = useState(medicamentoInicial?.titular || "");
  const [descripcioncomercial, setDescripcioncomercial] = useState(medicamentoInicial?.descripcioncomercial || "");

  // Opciones disponibles para cada filtro
  const [opcionesExpediente, setOpcionesExpediente] = useState<string[]>([]);
  const [opcionesConsecutivo, setOpcionesConsecutivo] = useState<string[]>([]);
  const [opcionesPrincipio, setOpcionesPrincipio] = useState<string[]>([]);
  const [opcionesCantidad, setOpcionesCantidad] = useState<string[]>([]);
  const [opcionesUnidadMedida, setOpcionesUnidadMedida] = useState<string[]>([]);
  const [opcionesFormaFarmaceutica, setOpcionesFormaFarmaceutica] = useState<string[]>([]);
  const [opcionesTitular, setOpcionesTitular] = useState<string[]>([]);
  const [opcionesDescripcion, setOpcionesDescripcion] = useState<string[]>([]);

  // Estados de carga y sugerencias
  const [loadingExpediente, setLoadingExpediente] = useState(false);
  const [loadingConsecutivo, setLoadingConsecutivo] = useState(false);
  const [loadingPrincipio, setLoadingPrincipio] = useState(false);
  const [loadingCantidad, setLoadingCantidad] = useState(false);
  const [loadingUnidadMedida, setLoadingUnidadMedida] = useState(false);
  const [loadingFormaFarmaceutica, setLoadingFormaFarmaceutica] = useState(false);
  const [loadingTitular, setLoadingTitular] = useState(false);
  const [loadingDescripcion, setLoadingDescripcion] = useState(false);

  const [mostrarSugerenciasExpediente, setMostrarSugerenciasExpediente] = useState(false);

  // Verificar si todos los campos están completos
  const medicamentoCompleto =
    expedientecum &&
    consecutivocum &&
    principioactivo &&
    cantidad &&
    unidadmedida &&
    formafarmaceutica &&
    titular &&
    descripcioncomercial;

  // Llamar al callback cuando se completan todos los campos
  useEffect(() => {
    if (medicamentoCompleto) {
      onMedicamentoSeleccionado({
        principioactivo,
        expedientecum,
        consecutivocum,
        cantidad,
        unidadmedida,
        formafarmaceutica,
        titular,
        descripcioncomercial,
      });
    }
  }, [medicamentoCompleto]);

  // 1. Buscar expedientes cuando se escriben al menos 3 dígitos
  useEffect(() => {
    if (busquedaExpediente.length >= 3) {
      const timer = setTimeout(async () => {
        setLoadingExpediente(true);
        const busquedaActual = busquedaExpediente; // Capturar el valor actual
        try {
          const response = await fetch(
            `/api/medicamentos/buscar?filtro=expedientecum&busqueda=${encodeURIComponent(busquedaActual)}`
          );
          const data = await response.json();
          // Solo actualizar si la búsqueda no ha cambiado
          if (busquedaActual === busquedaExpediente && data.opciones) {
            setOpcionesExpediente(data.opciones);
            setMostrarSugerenciasExpediente(true);
          }
        } catch (error) {
          console.error("Error buscando expedientes:", error);
          toast.error("Error al buscar expedientes");
        } finally {
          if (busquedaActual === busquedaExpediente) {
            setLoadingExpediente(false);
          }
        }
      }, 500); // Aumentar debounce a 500ms para evitar búsquedas innecesarias
      return () => clearTimeout(timer);
    } else {
      setOpcionesExpediente([]);
      setMostrarSugerenciasExpediente(false);
      setLoadingExpediente(false);
    }
  }, [busquedaExpediente]);

  // 2. Obtener consecutivos cuando se selecciona expediente
  useEffect(() => {
    if (expedientecum) {
      const fetchConsecutivos = async () => {
        setLoadingConsecutivo(true);
        try {
          const response = await fetch(
            `/api/medicamentos/buscar?filtro=consecutivocum&expedientecum=${encodeURIComponent(expedientecum)}`
          );
          const data = await response.json();
          if (data.opciones) {
            setOpcionesConsecutivo(data.opciones);
          }
        } catch (error) {
          console.error("Error obteniendo consecutivos:", error);
          toast.error("Error al obtener consecutivos");
        } finally {
          setLoadingConsecutivo(false);
        }
      };
      fetchConsecutivos();

      // Resetear campos posteriores
      setConsecutivocum("");
      setPrincipioactivo("");
      setCantidad("");
      setUnidadmedida("");
      setFormafarmaceutica("");
      setTitular("");
      setDescripcioncomercial("");
    }
  }, [expedientecum]);

  // 3. Obtener principios activos cuando se selecciona consecutivo
  useEffect(() => {
    if (consecutivocum && expedientecum) {
      const fetchPrincipios = async () => {
        setLoadingPrincipio(true);
        try {
          const response = await fetch(
            `/api/medicamentos/buscar?filtro=principioactivo&expedientecum=${encodeURIComponent(expedientecum)}&consecutivocum=${encodeURIComponent(consecutivocum)}`
          );
          const data = await response.json();
          if (data.opciones) {
            setOpcionesPrincipio(data.opciones);
          }
        } catch (error) {
          console.error("Error obteniendo principios activos:", error);
          toast.error("Error al obtener principios activos");
        } finally {
          setLoadingPrincipio(false);
        }
      };
      fetchPrincipios();

      // Resetear campos posteriores
      setPrincipioactivo("");
      setCantidad("");
      setUnidadmedida("");
      setFormafarmaceutica("");
      setTitular("");
      setDescripcioncomercial("");
    }
  }, [consecutivocum, expedientecum]);

  // 4. Obtener cantidades cuando se selecciona principio activo
  useEffect(() => {
    if (principioactivo && consecutivocum && expedientecum) {
      const fetchCantidades = async () => {
        setLoadingCantidad(true);
        try {
          const response = await fetch(
            `/api/medicamentos/buscar?filtro=cantidad&expedientecum=${encodeURIComponent(expedientecum)}&consecutivocum=${encodeURIComponent(consecutivocum)}&principioactivo=${encodeURIComponent(principioactivo)}`
          );
          const data = await response.json();
          if (data.opciones) {
            setOpcionesCantidad(data.opciones);
          }
        } catch (error) {
          console.error("Error obteniendo cantidades:", error);
          toast.error("Error al obtener cantidades");
        } finally {
          setLoadingCantidad(false);
        }
      };
      fetchCantidades();

      // Resetear campos posteriores
      setCantidad("");
      setUnidadmedida("");
      setFormafarmaceutica("");
      setTitular("");
      setDescripcioncomercial("");
    }
  }, [principioactivo, consecutivocum, expedientecum]);

  // 5. Obtener unidades de medida cuando se selecciona cantidad
  useEffect(() => {
    if (cantidad && principioactivo && consecutivocum && expedientecum) {
      const fetchUnidadesMedida = async () => {
        setLoadingUnidadMedida(true);
        try {
          const response = await fetch(
            `/api/medicamentos/buscar?filtro=unidadmedida&expedientecum=${encodeURIComponent(expedientecum)}&consecutivocum=${encodeURIComponent(consecutivocum)}&principioactivo=${encodeURIComponent(principioactivo)}&cantidad=${encodeURIComponent(cantidad)}`
          );
          const data = await response.json();
          if (data.opciones) {
            setOpcionesUnidadMedida(data.opciones);
          }
        } catch (error) {
          console.error("Error obteniendo unidades de medida:", error);
          toast.error("Error al obtener unidades de medida");
        } finally {
          setLoadingUnidadMedida(false);
        }
      };
      fetchUnidadesMedida();

      // Resetear campos posteriores
      setUnidadmedida("");
      setFormafarmaceutica("");
      setTitular("");
      setDescripcioncomercial("");
    }
  }, [cantidad, principioactivo, consecutivocum, expedientecum]);

  // 6. Obtener formas farmacéuticas cuando se selecciona unidad de medida
  useEffect(() => {
    if (unidadmedida && cantidad && principioactivo && consecutivocum && expedientecum) {
      const fetchFormasFarmaceuticas = async () => {
        setLoadingFormaFarmaceutica(true);
        try {
          const response = await fetch(
            `/api/medicamentos/buscar?filtro=formafarmaceutica&expedientecum=${encodeURIComponent(expedientecum)}&consecutivocum=${encodeURIComponent(consecutivocum)}&principioactivo=${encodeURIComponent(principioactivo)}&cantidad=${encodeURIComponent(cantidad)}&unidadmedida=${encodeURIComponent(unidadmedida)}`
          );
          const data = await response.json();
          if (data.opciones) {
            setOpcionesFormaFarmaceutica(data.opciones);
          }
        } catch (error) {
          console.error("Error obteniendo formas farmacéuticas:", error);
          toast.error("Error al obtener formas farmacéuticas");
        } finally {
          setLoadingFormaFarmaceutica(false);
        }
      };
      fetchFormasFarmaceuticas();

      // Resetear campos posteriores
      setFormafarmaceutica("");
      setTitular("");
      setDescripcioncomercial("");
    }
  }, [unidadmedida, cantidad, principioactivo, consecutivocum, expedientecum]);

  // 7. Obtener titulares cuando se selecciona forma farmacéutica
  useEffect(() => {
    if (formafarmaceutica && unidadmedida && cantidad && principioactivo && consecutivocum && expedientecum) {
      const fetchTitulares = async () => {
        setLoadingTitular(true);
        try {
          const response = await fetch(
            `/api/medicamentos/buscar?filtro=titular&expedientecum=${encodeURIComponent(expedientecum)}&consecutivocum=${encodeURIComponent(consecutivocum)}&principioactivo=${encodeURIComponent(principioactivo)}&cantidad=${encodeURIComponent(cantidad)}&unidadmedida=${encodeURIComponent(unidadmedida)}&formafarmaceutica=${encodeURIComponent(formafarmaceutica)}`
          );
          const data = await response.json();
          if (data.opciones) {
            setOpcionesTitular(data.opciones);
          }
        } catch (error) {
          console.error("Error obteniendo titulares:", error);
          toast.error("Error al obtener titulares");
        } finally {
          setLoadingTitular(false);
        }
      };
      fetchTitulares();

      // Resetear campos posteriores
      setTitular("");
      setDescripcioncomercial("");
    }
  }, [formafarmaceutica, unidadmedida, cantidad, principioactivo, consecutivocum, expedientecum]);

  // 8. Obtener descripciones comerciales cuando se selecciona titular
  useEffect(() => {
    if (titular && formafarmaceutica && unidadmedida && cantidad && principioactivo && consecutivocum && expedientecum) {
      const fetchDescripciones = async () => {
        setLoadingDescripcion(true);
        try {
          const response = await fetch(
            `/api/medicamentos/buscar?filtro=descripcioncomercial&expedientecum=${encodeURIComponent(expedientecum)}&consecutivocum=${encodeURIComponent(consecutivocum)}&principioactivo=${encodeURIComponent(principioactivo)}&cantidad=${encodeURIComponent(cantidad)}&unidadmedida=${encodeURIComponent(unidadmedida)}&formafarmaceutica=${encodeURIComponent(formafarmaceutica)}&titular=${encodeURIComponent(titular)}`
          );
          const data = await response.json();
          if (data.opciones) {
            setOpcionesDescripcion(data.opciones);
          }
        } catch (error) {
          console.error("Error obteniendo descripciones:", error);
          toast.error("Error al obtener descripciones");
        } finally {
          setLoadingDescripcion(false);
        }
      };
      fetchDescripciones();

      // Resetear campo posterior
      setDescripcioncomercial("");
    }
  }, [titular, formafarmaceutica, unidadmedida, cantidad, principioactivo, consecutivocum, expedientecum]);

  const handleSeleccionExpediente = (valor: string) => {
    setExpedientecum(valor);
    setBusquedaExpediente(valor);
    setMostrarSugerenciasExpediente(false);
  };

  const handleInputExpediente = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/[^0-9]/g, ''); // Solo números
    setBusquedaExpediente(valor);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Paso 1: Expediente CUM - Input con autocompletado */}
      <div className="relative">
        <Label htmlFor="expedientecum">Expediente CUM *</Label>
        <input
          type="text"
          id="expedientecum"
          value={busquedaExpediente}
          onChange={handleInputExpediente}
          placeholder="Escriba al menos 3 dígitos..."
          className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
        {loadingExpediente && (
          <div className="mt-2 text-sm text-meta-3">Buscando...</div>
        )}
        {mostrarSugerenciasExpediente && opcionesExpediente.length > 0 && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark">
            {opcionesExpediente.map((opcion) => (
              <div
                key={opcion}
                onClick={() => handleSeleccionExpediente(opcion)}
                className="cursor-pointer px-5 py-3 hover:bg-gray-2 dark:hover:bg-meta-4"
              >
                {opcion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paso 2: Consecutivo CUM */}
      <div>
        <Label htmlFor="consecutivocum">Consecutivo CUM *</Label>
        <select
          id="consecutivocum"
          value={consecutivocum}
          onChange={(e) => setConsecutivocum(e.target.value)}
          disabled={!expedientecum || loadingConsecutivo || opcionesConsecutivo.length === 0}
          className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="">
            {!expedientecum
              ? "Primero seleccione el expediente"
              : loadingConsecutivo
                ? "Cargando..."
                : opcionesConsecutivo.length === 0
                  ? "No hay consecutivos disponibles"
                  : "Seleccione un consecutivo"}
          </option>
          {opcionesConsecutivo.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      </div>

      {/* Paso 3: Principio Activo */}
      <div>
        <Label htmlFor="principioactivo">Principio Activo *</Label>
        <select
          id="principioactivo"
          value={principioactivo}
          onChange={(e) => setPrincipioactivo(e.target.value)}
          disabled={!consecutivocum || loadingPrincipio || opcionesPrincipio.length === 0}
          className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="">
            {!consecutivocum
              ? "Primero seleccione el consecutivo"
              : loadingPrincipio
                ? "Cargando..."
                : opcionesPrincipio.length === 0
                  ? "No hay principios activos disponibles"
                  : "Seleccione un principio activo"}
          </option>
          {opcionesPrincipio.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      </div>

      {/* Paso 4: Cantidad */}
      <div>
        <Label htmlFor="cantidad">Cantidad *</Label>
        <select
          id="cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          disabled={!principioactivo || loadingCantidad || opcionesCantidad.length === 0}
          className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="">
            {!principioactivo
              ? "Primero seleccione el principio activo"
              : loadingCantidad
                ? "Cargando..."
                : opcionesCantidad.length === 0
                  ? "No hay cantidades disponibles"
                  : "Seleccione una cantidad"}
          </option>
          {opcionesCantidad.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      </div>

      {/* Paso 5: Unidad de Medida */}
      <div>
        <Label htmlFor="unidadmedida">Unidad de Medida *</Label>
        <select
          id="unidadmedida"
          value={unidadmedida}
          onChange={(e) => setUnidadmedida(e.target.value)}
          disabled={!cantidad || loadingUnidadMedida || opcionesUnidadMedida.length === 0}
          className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="">
            {!cantidad
              ? "Primero seleccione la cantidad"
              : loadingUnidadMedida
                ? "Cargando..."
                : opcionesUnidadMedida.length === 0
                  ? "No hay unidades disponibles"
                  : "Seleccione una unidad"}
          </option>
          {opcionesUnidadMedida.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      </div>

      {/* Paso 6: Forma Farmacéutica */}
      <div>
        <Label htmlFor="formafarmaceutica">Forma Farmacéutica *</Label>
        <select
          id="formafarmaceutica"
          value={formafarmaceutica}
          onChange={(e) => setFormafarmaceutica(e.target.value)}
          disabled={!unidadmedida || loadingFormaFarmaceutica || opcionesFormaFarmaceutica.length === 0}
          className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="">
            {!unidadmedida
              ? "Primero seleccione la unidad de medida"
              : loadingFormaFarmaceutica
                ? "Cargando..."
                : opcionesFormaFarmaceutica.length === 0
                  ? "No hay formas farmacéuticas disponibles"
                  : "Seleccione una forma"}
          </option>
          {opcionesFormaFarmaceutica.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      </div>

      {/* Paso 7: Titular */}
      <div>
        <Label htmlFor="titular">Titular/Laboratorio *</Label>
        <select
          id="titular"
          value={titular}
          onChange={(e) => setTitular(e.target.value)}
          disabled={!formafarmaceutica || loadingTitular || opcionesTitular.length === 0}
          className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="">
            {!formafarmaceutica
              ? "Primero seleccione la forma farmacéutica"
              : loadingTitular
                ? "Cargando..."
                : opcionesTitular.length === 0
                  ? "No hay titulares disponibles"
                  : "Seleccione un titular"}
          </option>
          {opcionesTitular.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      </div>

      {/* Paso 8: Descripción Comercial */}
      <div>
        <Label htmlFor="descripcioncomercial">Descripción Comercial *</Label>
        <select
          id="descripcioncomercial"
          value={descripcioncomercial}
          onChange={(e) => setDescripcioncomercial(e.target.value)}
          disabled={!titular || loadingDescripcion || opcionesDescripcion.length === 0}
          className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="">
            {!titular
              ? "Primero seleccione el titular"
              : loadingDescripcion
                ? "Cargando..."
                : opcionesDescripcion.length === 0
                  ? "No hay descripciones disponibles"
                  : "Seleccione una descripción"}
          </option>
          {opcionesDescripcion.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      </div>

{/* Indicador de medicamento completo */}
<div className="flex flex-col justify-end w-full">

  {/* Espaciador para alinear con los Labels */}
  <div className="h-[22px]" />

  {medicamentoCompleto && (
    <div className="flex items-center gap-3 w-full bg-green-100 px-4 py-3 rounded-md">
      <svg
        className="w-6 h-6 text-green-600 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <span className="text-green-700 font-semibold text-sm">
        Medicamento encontrado
      </span>
    </div>
  )}
</div>


    </div>
  );
}
