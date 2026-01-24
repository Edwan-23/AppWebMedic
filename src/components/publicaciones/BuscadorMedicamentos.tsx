"use client";

import { useState, useEffect } from "react";
import Label from "@/components/form/Label";

interface MedicamentoSeleccionado {
  principioactivo: string;
  cantidadcum: string;
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
  // Estados para cada filtro
  const [busquedaPrincipio, setBusquedaPrincipio] = useState("");
  const [principioactivo, setPrincipioactivo] = useState(medicamentoInicial?.principioactivo || "");
  const [cantidadcum, setCantidadcum] = useState(medicamentoInicial?.cantidadcum || "");
  const [unidadmedida, setUnidadmedida] = useState(medicamentoInicial?.unidadmedida || "");
  const [unidadreferencia, setUnidadreferencia] = useState("");
  const [titular, setTitular] = useState(medicamentoInicial?.titular || "");
  const [descripcioncomercial, setDescripcioncomercial] = useState(medicamentoInicial?.descripcioncomercial || "");
  const [formafarmaceutica, setFormafarmaceutica] = useState(medicamentoInicial?.formafarmaceutica || "");

  // Opciones disponibles para cada filtro
  const [opcionesPrincipio, setOpcionesPrincipio] = useState<string[]>([]);
  const [opcionesCantidad, setOpcionesCantidad] = useState<string[]>([]);
  const [opcionesUnidadMedida, setOpcionesUnidadMedida] = useState<string[]>([]);
  const [opcionesUnidadReferencia, setOpcionesUnidadReferencia] = useState<string[]>([]);
  const [opcionesTitular, setOpcionesTitular] = useState<string[]>([]);
  const [opcionesDescripcion, setOpcionesDescripcion] = useState<string[]>([]);
  const [opcionesFormaFarmaceutica, setOpcionesFormaFarmaceutica] = useState<string[]>([]);

  // Estados de carga y dropdowns
  const [loadingPrincipio, setLoadingPrincipio] = useState(false);
  const [loadingCantidad, setLoadingCantidad] = useState(false);
  const [loadingUnidadMedida, setLoadingUnidadMedida] = useState(false);
  const [loadingUnidadReferencia, setLoadingUnidadReferencia] = useState(false);
  const [loadingTitular, setLoadingTitular] = useState(false);
  const [loadingDescripcion, setLoadingDescripcion] = useState(false);
  const [loadingFormaFarmaceutica, setLoadingFormaFarmaceutica] = useState(false);

  const [showDropdownPrincipio, setShowDropdownPrincipio] = useState(false);
  const [showDropdownCantidad, setShowDropdownCantidad] = useState(false);
  const [showDropdownUnidadMedida, setShowDropdownUnidadMedida] = useState(false);
  const [showDropdownUnidadReferencia, setShowDropdownUnidadReferencia] = useState(false);
  const [showDropdownTitular, setShowDropdownTitular] = useState(false);
  const [showDropdownDescripcion, setShowDropdownDescripcion] = useState(false);
  const [showDropdownFormaFarmaceutica, setShowDropdownFormaFarmaceutica] = useState(false);

  // Búsqueda de principio activo
  useEffect(() => {
    if (busquedaPrincipio.trim().length >= 3) {
      console.log(`[BuscadorMedicamentos] Iniciando búsqueda para: "${busquedaPrincipio}"`);
      const timer = setTimeout(() => {
        buscarPrincipios();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      console.log(`[BuscadorMedicamentos] Búsqueda muy corta (${busquedaPrincipio.length} caracteres)`);
    }
  }, [busquedaPrincipio]);

  // Cuando se selecciona principio activo, buscar cantidades
  useEffect(() => {
    if (principioactivo) {
      buscarCantidades();
    } else {
      resetearDesdePrincipio();
    }
  }, [principioactivo]);

  // Cuando se selecciona cantidad, buscar unidades de medida
  useEffect(() => {
    if (cantidadcum && principioactivo) {
      buscarUnidadesMedida();
    } else if (!cantidadcum) {
      resetearDesdeCantidad();
    }
  }, [cantidadcum]);

  // Cuando se selecciona unidad de medida, buscar unidades de referencia
  useEffect(() => {
    if (unidadmedida && cantidadcum && principioactivo) {
      buscarUnidadesReferencia();
    } else if (!unidadmedida) {
      resetearDesdeUnidadMedida();
    }
  }, [unidadmedida]);

  // Cuando se selecciona unidad de referencia, buscar titulares
  useEffect(() => {
    if (unidadreferencia && unidadmedida && cantidadcum && principioactivo) {
      buscarTitulares();
    } else if (!unidadreferencia) {
      resetearDesdeUnidadReferencia();
    }
  }, [unidadreferencia]);

  // Cuando se selecciona titular, buscar descripciones comerciales
  useEffect(() => {
    if (titular && unidadreferencia && unidadmedida && cantidadcum && principioactivo) {
      buscarDescripciones();
    } else if (!titular) {
      resetearDesdeTitular();
    }
  }, [titular]);

  // Cuando se selecciona descripción comercial, buscar forma farmacéutica
  useEffect(() => {
    if (descripcioncomercial && titular && unidadreferencia && unidadmedida && cantidadcum && principioactivo) {
      buscarFormaFarmaceutica();
    }
  }, [descripcioncomercial]);

  // Cuando se completan todos los campos, notificar al padre
  useEffect(() => {
    if (principioactivo && cantidadcum && unidadmedida && formafarmaceutica && titular && descripcioncomercial) {
      onMedicamentoSeleccionado({
        principioactivo,
        cantidadcum,
        unidadmedida,
        formafarmaceutica,
        titular,
        descripcioncomercial
      });
    }
  }, [principioactivo, cantidadcum, unidadmedida, formafarmaceutica, titular, descripcioncomercial]);

  const buscarPrincipios = async () => {
    setLoadingPrincipio(true);
    try {
      const url = `/api/medicamentos/buscar?filtro=principioactivo&principioactivo=${encodeURIComponent(busquedaPrincipio)}`;
      console.log(`[BuscadorMedicamentos] Llamando API: ${url}`);
      const response = await fetch(url);
      console.log(`[BuscadorMedicamentos] Respuesta status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`[BuscadorMedicamentos] Encontrados ${data.length} principios activos`);
        setOpcionesPrincipio(data);
        setShowDropdownPrincipio(true);
      } else {
        const errorData = await response.json();
        console.error("[BuscadorMedicamentos] Error al buscar principios activos:", errorData);
        alert(`Error en la búsqueda: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("[BuscadorMedicamentos] Error al buscar principios activos:", error);
      alert("No se pudo conectar con la API de medicamentos. Verifique su conexión a Internet.");
    } finally {
      setLoadingPrincipio(false);
    }
  };

  const buscarCantidades = async () => {
    setLoadingCantidad(true);
    try {
      const response = await fetch(`/api/medicamentos/buscar?filtro=cantidadcum&principioactivo=${encodeURIComponent(principioactivo)}`);
      if (response.ok) {
        const data = await response.json();
        setOpcionesCantidad(data);
      }
    } catch (error) {
      console.error("Error al buscar cantidades:", error);
    } finally {
      setLoadingCantidad(false);
    }
  };

  const buscarUnidadesMedida = async () => {
    setLoadingUnidadMedida(true);
    try {
      const response = await fetch(`/api/medicamentos/buscar?filtro=unidadmedida&principioactivo=${encodeURIComponent(principioactivo)}&cantidadcum=${encodeURIComponent(cantidadcum)}`);
      if (response.ok) {
        const data = await response.json();
        setOpcionesUnidadMedida(data);
      }
    } catch (error) {
      console.error("Error al buscar unidades de medida:", error);
    } finally {
      setLoadingUnidadMedida(false);
    }
  };

  const buscarUnidadesReferencia = async () => {
    setLoadingUnidadReferencia(true);
    try {
      const response = await fetch(`/api/medicamentos/buscar?filtro=unidadreferencia&principioactivo=${encodeURIComponent(principioactivo)}&cantidadcum=${encodeURIComponent(cantidadcum)}&unidadmedida=${encodeURIComponent(unidadmedida)}`);
      if (response.ok) {
        const data = await response.json();
        setOpcionesUnidadReferencia(data);
      }
    } catch (error) {
      console.error("Error al buscar unidades de referencia:", error);
    } finally {
      setLoadingUnidadReferencia(false);
    }
  };

  const buscarTitulares = async () => {
    setLoadingTitular(true);
    try {
      const response = await fetch(`/api/medicamentos/buscar?filtro=titular&principioactivo=${encodeURIComponent(principioactivo)}&cantidadcum=${encodeURIComponent(cantidadcum)}&unidadmedida=${encodeURIComponent(unidadmedida)}&unidadreferencia=${encodeURIComponent(unidadreferencia)}`);
      if (response.ok) {
        const data = await response.json();
        setOpcionesTitular(data);
      }
    } catch (error) {
      console.error("Error al buscar titulares:", error);
    } finally {
      setLoadingTitular(false);
    }
  };

  const buscarDescripciones = async () => {
    setLoadingDescripcion(true);
    try {
      const response = await fetch(`/api/medicamentos/buscar?filtro=descripcioncomercial&principioactivo=${encodeURIComponent(principioactivo)}&cantidadcum=${encodeURIComponent(cantidadcum)}&unidadmedida=${encodeURIComponent(unidadmedida)}&unidadreferencia=${encodeURIComponent(unidadreferencia)}&titular=${encodeURIComponent(titular)}`);
      if (response.ok) {
        const data = await response.json();
        setOpcionesDescripcion(data);
      }
    } catch (error) {
      console.error("Error al buscar descripciones:", error);
    } finally {
      setLoadingDescripcion(false);
    }
  };

  const buscarFormaFarmaceutica = async () => {
    setLoadingFormaFarmaceutica(true);
    try {
      const response = await fetch(`/api/medicamentos/buscar?filtro=formafarmaceutica&principioactivo=${encodeURIComponent(principioactivo)}&cantidadcum=${encodeURIComponent(cantidadcum)}&unidadmedida=${encodeURIComponent(unidadmedida)}&unidadreferencia=${encodeURIComponent(unidadreferencia)}&titular=${encodeURIComponent(titular)}`);
      if (response.ok) {
        const data = await response.json();
        setOpcionesFormaFarmaceutica(data);
        if (data.length === 1) {
          setFormafarmaceutica(data[0]);
        }
      }
    } catch (error) {
      console.error("Error al buscar forma farmacéutica:", error);
    } finally {
      setLoadingFormaFarmaceutica(false);
    }
  };

  const resetearDesdePrincipio = () => {
    setCantidadcum("");
    setUnidadmedida("");
    setUnidadreferencia("");
    setTitular("");
    setDescripcioncomercial("");
    setFormafarmaceutica("");
    setOpcionesCantidad([]);
    setOpcionesUnidadMedida([]);
    setOpcionesUnidadReferencia([]);
    setOpcionesTitular([]);
    setOpcionesDescripcion([]);
    setOpcionesFormaFarmaceutica([]);
  };

  const resetearDesdeCantidad = () => {
    setUnidadmedida("");
    setUnidadreferencia("");
    setTitular("");
    setDescripcioncomercial("");
    setFormafarmaceutica("");
    setOpcionesUnidadMedida([]);
    setOpcionesUnidadReferencia([]);
    setOpcionesTitular([]);
    setOpcionesDescripcion([]);
    setOpcionesFormaFarmaceutica([]);
  };

  const resetearDesdeUnidadMedida = () => {
    setUnidadreferencia("");
    setTitular("");
    setDescripcioncomercial("");
    setFormafarmaceutica("");
    setOpcionesUnidadReferencia([]);
    setOpcionesTitular([]);
    setOpcionesDescripcion([]);
    setOpcionesFormaFarmaceutica([]);
  };

  const resetearDesdeUnidadReferencia = () => {
    setTitular("");
    setDescripcioncomercial("");
    setFormafarmaceutica("");
    setOpcionesTitular([]);
    setOpcionesDescripcion([]);
    setOpcionesFormaFarmaceutica([]);
  };

  const resetearDesdeTitular = () => {
    setDescripcioncomercial("");
    setFormafarmaceutica("");
    setOpcionesDescripcion([]);
    setOpcionesFormaFarmaceutica([]);
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Filtro 1: Principio Activo */}
      <div className="relative">
        <Label>Principio Activo *</Label>
        <input
          type="text"
          value={principioactivo || busquedaPrincipio}
          onChange={(e) => {
            setBusquedaPrincipio(e.target.value);
            setPrincipioactivo("");
            setShowDropdownPrincipio(false);
          }}
          onFocus={() => {
            if (opcionesPrincipio.length > 0) {
              setShowDropdownPrincipio(true);
            }
          }}
          placeholder="Escriba al menos 3 caracteres..."
          required
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        />
        {loadingPrincipio && (
          <div className="absolute right-3 top-10">
            <div className="w-5 h-5 border-2 rounded-full border-brand-500 border-t-transparent animate-spin"></div>
          </div>
        )}
        {busquedaPrincipio.length >= 3 && !loadingPrincipio && opcionesPrincipio.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No se encontraron medicamentos con "{busquedaPrincipio}"
            </p>
          </div>
        )}
        {showDropdownPrincipio && opcionesPrincipio.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {opcionesPrincipio.map((opcion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setPrincipioactivo(opcion);
                  setBusquedaPrincipio("");
                  setShowDropdownPrincipio(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                {opcion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filtro 2: Cantidad CUM */}
      <div className="relative">
        <Label>Cantidad CUM *</Label>
        <select
          value={cantidadcum}
          onChange={(e) => setCantidadcum(e.target.value)}
          disabled={!principioactivo || loadingCantidad}
          required
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Seleccione cantidad</option>
          {opcionesCantidad.map((opcion, index) => (
            <option key={index} value={opcion}>{opcion}</option>
          ))}
        </select>
        {loadingCantidad && (
          <div className="absolute right-3 top-10">
            <div className="w-5 h-5 border-2 rounded-full border-brand-500 border-t-transparent animate-spin"></div>
          </div>
        )}
      </div>

      {/* Filtro 3: Unidad de Medida */}
      <div className="relative">
        <Label>Unidad de Medida *</Label>
        <select
          value={unidadmedida}
          onChange={(e) => setUnidadmedida(e.target.value)}
          disabled={!cantidadcum || loadingUnidadMedida}
          required
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Seleccione unidad</option>
          {opcionesUnidadMedida.map((opcion, index) => (
            <option key={index} value={opcion}>{opcion}</option>
          ))}
        </select>
        {loadingUnidadMedida && (
          <div className="absolute right-3 top-10">
            <div className="w-5 h-5 border-2 rounded-full border-brand-500 border-t-transparent animate-spin"></div>
          </div>
        )}
      </div>

      {/* Filtro 4: Unidad de Referencia */}
      <div className="relative">
        <Label>Unidad de Referencia *</Label>
        <select
          value={unidadreferencia}
          onChange={(e) => setUnidadreferencia(e.target.value)}
          disabled={!unidadmedida || loadingUnidadReferencia}
          required
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Seleccione referencia</option>
          {opcionesUnidadReferencia.map((opcion, index) => (
            <option key={index} value={opcion}>{opcion}</option>
          ))}
        </select>
        {loadingUnidadReferencia && (
          <div className="absolute right-3 top-10">
            <div className="w-5 h-5 border-2 rounded-full border-brand-500 border-t-transparent animate-spin"></div>
          </div>
        )}
      </div>

      {/* Filtro 5: Titular (Laboratorio) */}
      <div className="relative">
        <Label>Titular (Laboratorio) *</Label>
        <select
          value={titular}
          onChange={(e) => setTitular(e.target.value)}
          disabled={!unidadreferencia || loadingTitular}
          required
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Seleccione titular</option>
          {opcionesTitular.map((opcion, index) => (
            <option key={index} value={opcion}>{opcion}</option>
          ))}
        </select>
        {loadingTitular && (
          <div className="absolute right-3 top-10">
            <div className="w-5 h-5 border-2 rounded-full border-brand-500 border-t-transparent animate-spin"></div>
          </div>
        )}
      </div>

      {/* Filtro 6: Descripción Comercial */}
      <div className="relative">
        <Label>Descripción Comercial *</Label>
        <select
          value={descripcioncomercial}
          onChange={(e) => setDescripcioncomercial(e.target.value)}
          disabled={!titular || loadingDescripcion}
          required
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Seleccione descripción</option>
          {opcionesDescripcion.map((opcion, index) => (
            <option key={index} value={opcion}>{opcion}</option>
          ))}
        </select>
        {loadingDescripcion && (
          <div className="absolute right-3 top-10">
            <div className="w-5 h-5 border-2 rounded-full border-brand-500 border-t-transparent animate-spin"></div>
          </div>
        )}
      </div>

      {/* Información de Forma Farmacéutica (se obtiene automáticamente) */}
      {formafarmaceutica && (
        <div className="md:col-span-2 lg:col-span-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold text-green-800 dark:text-green-300">Medicamento identificado</span>
          </div>
          <p className="mt-2 text-sm text-green-700 dark:text-green-400">
            <strong>Forma Farmacéutica:</strong> {formafarmaceutica}
          </p>
        </div>
      )}
    </div>
  );
}
