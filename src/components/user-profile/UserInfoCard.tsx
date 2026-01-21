"use client";
import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";
import { toast } from "sonner";

interface Usuario {
  id: string;
  nombres: string;
  apellidos: string;
  correo_corporativo: string;
  celular?: string;
  cedula: string;
  sexo?: string;
  fecha_nacimiento?: string;
  numero_tarjeta_profesional?: string;
  hospital_id?: string;
  roles?: {
    nombre: string;
  };
  hospitales?: {
    id: string;
    nombre: string;
  };
}

interface Hospital {
  id: string;
  nombre: string;
}

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [hospitales, setHospitales] = useState<Hospital[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    sexo: "",
    fecha_nacimiento: "",
    correo_corporativo: "",
    celular: "",
    numero_tarjeta_profesional: "",
    hospital_id: ""
  });

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      const user = JSON.parse(usuarioData);
      setUsuario(user);
      setFormData({
        nombres: user.nombres || "",
        apellidos: user.apellidos || "",
        sexo: user.sexo || "",
        fecha_nacimiento: user.fecha_nacimiento ? user.fecha_nacimiento.split('T')[0] : "",
        correo_corporativo: user.correo_corporativo || "",
        celular: user.celular || "",
        numero_tarjeta_profesional: user.numero_tarjeta_profesional || "",
        hospital_id: user.hospital_id || ""
      });
    }
  }, []);

  useEffect(() => {
    // Cargar hospitales
    const cargarHospitales = async () => {
      try {
        const response = await fetch("/api/hospitales");
        if (response.ok) {
          const data = await response.json();
          setHospitales(data.hospitales || []);
        } else {
          toast.error("Error al cargar hospitales", {
            description: "No se pudieron cargar los hospitales disponibles."
          });
        }
      } catch (error) {
        console.error("Error al cargar hospitales:", error);
        toast.error("Error de conexión", {
          description: "No se pudo conectar con el servidor."
        });
      }
    };
    
    if (isOpen) {
      cargarHospitales();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    // Validación para celular (solo números, máximo 10)
    if (name === "celular") {
      const numeros = value.replace(/[^0-9]/g, "");
      setFormData(prev => ({ ...prev, [name]: numeros.slice(0, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formData.nombres || formData.nombres.length < 2) {
      nuevosErrores.nombres = "Los nombres deben tener al menos 2 caracteres";
    }

    if (!formData.apellidos || formData.apellidos.length < 2) {
      nuevosErrores.apellidos = "Los apellidos deben tener al menos 2 caracteres";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo_corporativo || !emailRegex.test(formData.correo_corporativo)) {
      nuevosErrores.correo_corporativo = "Ingrese un correo electrónico válido (ejemplo@dominio.com)";
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
    
    // Validar formulario
    if (!validarFormulario()) {
      return;
    }
    
    // Mostrar loading
    const loadingToast = toast.loading("Actualizando información...");
    
    try {
      const response = await fetch(`/api/usuarios/${usuario?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const usuarioActualizado = await response.json();
        
        // Actualizar localStorage
        localStorage.setItem("usuario", JSON.stringify(usuarioActualizado.usuario));
        
        // Actualizar estado
        setUsuario(usuarioActualizado.usuario);
        
        // Cerrar modal
        closeModal();
        
        // Notificación de éxito
        toast.success("¡Información actualizada!", {
          description: "Datos personales actualizados correctamente.",
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

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return "No especificado";
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Información Personal
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Nombres
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {usuario?.nombres || "No especificado"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Apellidos
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {usuario?.apellidos || "No especificado"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Correo Corporativo
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {usuario?.correo_corporativo || "No especificado"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Celular
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {usuario?.celular || "No especificado"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Cédula
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {usuario?.cedula || "No especificado"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Sexo
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {usuario?.sexo || "No especificado"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Fecha de Nacimiento
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatearFecha(usuario?.fecha_nacimiento)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Tarjeta Profesional
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {usuario?.numero_tarjeta_profesional || "No especificado"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Rol
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {usuario?.roles?.nombre || "Usuario"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Hospital
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {usuario?.hospitales?.nombre || "No especificado"}
              </p>
            </div>
          </div>
        </div>

        <button
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

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Editar Información Personal
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Actualice sus datos para mantener su perfil al día.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Nombres</Label>
                  <Input 
                    type="text" 
                    name="nombres"
                    defaultValue={formData.nombres}
                    onChange={handleChange}
                    disabled
                  />
                  {errors.nombres && (
                    <p className="mt-1 text-xs text-red-500">{errors.nombres}</p>
                  )}
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Apellidos</Label>
                  <Input 
                    type="text" 
                    name="apellidos"
                    defaultValue={formData.apellidos}
                    onChange={handleChange}
                    disabled
                  />
                  {errors.apellidos && (
                    <p className="mt-1 text-xs text-red-500">{errors.apellidos}</p>
                  )}
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Cédula</Label>
                  <Input 
                    type="text" 
                    defaultValue={usuario?.cedula} 
                    disabled 
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Sexo</Label>
                  <Select
                    name="sexo"
                    value={formData.sexo}
                    onChange={(value) => setFormData((prev) => ({ ...prev, sexo: value }))}
                    options={[
                      { value: "Hombre", label: "Hombre" },
                      { value: "Mujer", label: "Mujer" },
                      { value: "Otro", label: "Otro" }
                    ]}
                    placeholder="Seleccione"
                  />
                  {errors.sexo && (
                    <p className="mt-1 text-xs text-red-500">{errors.sexo}</p>
                  )}
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <DatePicker
                    id="fecha_nacimiento_editar"
                    label="Fecha de Nacimiento"
                    placeholder="Seleccione una fecha"
                    defaultDate={formData.fecha_nacimiento || undefined}
                    maxDate={new Date()}
                    position="auto"
                    onChange={(selectedDates) => {
                      if (selectedDates && selectedDates.length > 0) {
                        const fecha = selectedDates[0];
                        const fechaFormateada = fecha.toISOString().split('T')[0];
                        setFormData(prev => ({ ...prev, fecha_nacimiento: fechaFormateada }));
                      }
                    }}
                  />
                  {errors.fecha_nacimiento && (
                    <p className="mt-1 text-xs text-red-500">{errors.fecha_nacimiento}</p>
                  )}
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Correo Corporativo</Label>
                  <Input 
                    type="email" 
                    name="correo_corporativo"
                    defaultValue={formData.correo_corporativo}
                    onChange={handleChange}
                  />
                  {errors.correo_corporativo && (
                    <p className="mt-1 text-xs text-red-500">{errors.correo_corporativo}</p>
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
                  <Label>Tarjeta Profesional</Label>
                  <Input 
                    type="text" 
                    name="numero_tarjeta_profesional"
                    defaultValue={formData.numero_tarjeta_profesional}
                    onChange={handleChange}
                    disabled
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Hospital</Label>
                  <Input 
                    type="text" 
                    defaultValue={usuario?.hospitales?.nombre || "No especificado"}
                    disabled
                  />
                </div>

                {/* Mensaje informativo */}
                <div className="col-span-2 mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Información:</strong> Si alguno de los datos restringidos es incorrecto, por favor contacte a <a href="mailto:soporte@hospital.com" className="underline font-medium">soporte@hospital.com</a> para realizar los cambios pertinentes.
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
    </div>
  );
}
