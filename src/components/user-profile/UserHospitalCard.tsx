"use client";
import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { toast } from "sonner";

interface Hospital {
  id: string;
  rut: string;
  nombre: string;
  direccion: string;
  telefono?: string;
  celular?: string;
  correo?: string;
  director?: string;
  departamentos?: {
    nombre: string;
  };
  municipios?: {
    nombre: string;
  };
  estado_base?: {
    nombre: string;
  };
}

export default function UserHospitalCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    celular: "",
    correo: "",
    director: ""
  });

  useEffect(() => {
    const cargarHospital = async () => {
      const usuarioData = localStorage.getItem("usuario");
      if (usuarioData) {
        const usuario = JSON.parse(usuarioData);
        const hospitalId = usuario.hospital_id;
        
        if (hospitalId) {
          try {
            const response = await fetch(`/api/hospitales/${hospitalId}`);
            if (response.ok) {
              const data = await response.json();
              setHospital(data);
              setFormData({
                nombre: data.nombre || "",
                direccion: data.direccion || "",
                telefono: data.telefono || "",
                celular: data.celular || "",
                correo: data.correo || "",
                director: data.director || ""
              });
            } else {
              toast.error("Error al cargar hospital", {
                description: "No se pudo obtener la información del hospital."
              });
            }
          } catch (error) {
            console.error("Error al cargar hospital:", error);
            toast.error("Error de conexión", {
              description: "No se pudo conectar con el servidor."
            });
          }
        }
      }
      setLoading(false);
    };

    cargarHospital();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    // Validación para teléfono (solo números, máximo 10)
    if (name === "telefono") {
      const numeros = value.replace(/[^0-9]/g, "");
      setFormData(prev => ({ ...prev, [name]: numeros.slice(0, 10) }));
    } 
    // Validación para celular (solo números, máximo 10)
    else if (name === "celular") {
      const numeros = value.replace(/[^0-9]/g, "");
      setFormData(prev => ({ ...prev, [name]: numeros.slice(0, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formData.nombre || formData.nombre.length < 3) {
      nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres";
    }

    if (!formData.direccion || formData.direccion.length < 5) {
      nuevosErrores.direccion = "La dirección debe tener al menos 5 caracteres";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.correo && !emailRegex.test(formData.correo)) {
      nuevosErrores.correo = "Ingrese un correo electrónico válido";
    }

    if (formData.telefono && (formData.telefono.length < 7 || formData.telefono.length > 10)) {
      nuevosErrores.telefono = "El teléfono debe tener entre 7 y 10 dígitos";
    }

    if (formData.celular && formData.celular.length !== 10) {
      nuevosErrores.celular = "El celular debe tener exactamente 10 dígitos";
    }

    setErrors(nuevosErrores);
    
    if (Object.keys(nuevosErrores).length > 0) {
      toast.error("¡Revisa los campos!", {
        description: "Hay errores en el formulario que debes corregir."
      });
    }
    
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    // Mostrar loading
    const loadingToast = toast.loading("Actualizando información del hospital...");
    
    try {
      const response = await fetch(`/api/hospitales/${hospital?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const resultado = await response.json();
        
        // Actualizar estado
        setHospital(resultado.hospital);
        
        // Actualizar localStorage con el hospital actualizado
        const usuarioData = localStorage.getItem("usuario");
        if (usuarioData) {
          const usuario = JSON.parse(usuarioData);
          usuario.hospitales = resultado.hospital;
          localStorage.setItem("usuario", JSON.stringify(usuario));
        }
        
        // Cerrar modal
        closeModal();
        
        // Notificación de éxito
        toast.success("¡Hospital actualizado!", {
          description: "La información del hospital ha sido actualizada correctamente.",
          id: loadingToast
        });
        
        // Recargar página para reflejar cambios
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const error = await response.json();
        
        // Mostrar errores específicos si vienen del servidor
        if (error.detalles) {
          const nuevosErrores: Record<string, string> = {};
          error.detalles.forEach((detalle: any) => {
            const campo = detalle.path[0];
            nuevosErrores[campo] = detalle.message;
          });
          setErrors(nuevosErrores);
          
          toast.error("Error de validación", {
            description: "Verifica los campos marcados en rojo.",
            id: loadingToast
          });
        } else {
          toast.error("Error al actualizar", {
            description: error.error || "No se pudieron guardar los cambios.",
            id: loadingToast
          });
        }
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor. Intenta de nuevo.",
        id: loadingToast
      });
    }
  };

  if (loading) {
    return <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">Cargando...</div>;
  }

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Información del Hospital
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Nombre del Hospital
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {hospital?.nombre || "No especificado"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                RUT
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {hospital?.rut || "No especificado"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Dirección
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {hospital?.direccion || "No especificado"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Departamento
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {hospital?.departamentos?.nombre || "No especificado"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Municipio
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {hospital?.municipios?.nombre || "No especificado"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Teléfono
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {hospital?.telefono || "No especificado"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Celular
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {hospital?.celular || "No especificado"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Correo Electrónico
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {hospital?.correo || "No especificado"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Director
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {hospital?.director || "No especificado"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Estado
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {hospital?.estado_base?.nombre || "No especificado"}
              </p>
            </div>
          </div>
        </div>          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Editar
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Editar Información del Hospital
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Actualice los datos del hospital para mantener la información al día.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="px-2 overflow-y-auto custom-scrollbar h-[450px]">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Nombre del Hospital</Label>
                  <Input 
                    type="text" 
                    name="nombre"
                    defaultValue={formData.nombre}
                    onChange={handleChange}
                    disabled
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>
                  )}
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>RUT</Label>
                  <Input type="text" defaultValue={hospital?.rut} disabled />
                </div>

                <div className="col-span-2">
                  <Label>Dirección</Label>
                  <Input 
                    type="text" 
                    name="direccion"
                    defaultValue={formData.direccion}
                    onChange={handleChange}
                    disabled
                  />
                  {errors.direccion && (
                    <p className="mt-1 text-xs text-red-500">{errors.direccion}</p>
                  )}
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Teléfono</Label>
                  <input
                    type="text" 
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    maxLength={10}
                    className="w-full px-4 py-3 text-sm font-normal text-gray-700 bg-white border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                  {errors.telefono && (
                    <p className="mt-1 text-xs text-red-500">{errors.telefono}</p>
                  )}
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Celular</Label>
                  <input
                    type="text" 
                    name="celular"
                    value={formData.celular}
                    onChange={handleChange}
                    maxLength={10}
                    className="w-full px-4 py-3 text-sm font-normal text-gray-700 bg-white border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                  {errors.celular && (
                    <p className="mt-1 text-xs text-red-500">{errors.celular}</p>
                  )}
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Correo Electrónico</Label>
                  <Input 
                    type="email" 
                    name="correo"
                    defaultValue={formData.correo}
                    onChange={handleChange}
                  />
                  {errors.correo && (
                    <p className="mt-1 text-xs text-red-500">{errors.correo}</p>
                  )}
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Director</Label>
                  <Input 
                    type="text" 
                    name="director"
                    defaultValue={formData.director}
                    onChange={handleChange}
                  />
                  {errors.director && (
                    <p className="mt-1 text-xs text-red-500">{errors.director}</p>
                  )}
                </div>

                {/* Mensaje informativo */}
                <div className="col-span-2 mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xm text-blue-700 dark:text-blue-300">
                      <strong>Información:</strong> Si alguno de los datos está incorrecto, por favor contacte a <a href="mailto:soporte@hospital.com" className="underline font-medium">soporte@hospital.com</a> para realizar los cambios pertinentes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-3 text-sm font-semibold rounded-lg transition-colors border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="px-4 py-3 text-sm font-semibold rounded-lg transition-colors bg-brand-500 text-white hover:bg-brand-600"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
