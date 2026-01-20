"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Label from "@/components/form/Label";
import DatePicker from "@/components/form/date-picker";
import Select from "@/components/form/Select";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface Hospital {
  id: string;
  nombre: string;
  rut: string;
  municipio?: string;
}

interface ErroresValidacion {
  nombres?: string;
  apellidos?: string;
  cedula?: string;
  fecha_nacimiento?: string;
  sexo?: string;
  correo_corporativo?: string;
  celular?: string;
  numero_tarjeta_profesional?: string;
  hospital_id?: string;
  contrasena?: string;
  confirmar_contrasena?: string;
  terminos?: string;
}

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [erroresValidacion, setErroresValidacion] = useState<ErroresValidacion>({});

  const formRefs = {
    nombres: useRef<HTMLInputElement>(null),
    apellidos: useRef<HTMLInputElement>(null),
    cedula: useRef<HTMLInputElement>(null),
    fecha_nacimiento: useRef<HTMLDivElement>(null),
    sexo: useRef<HTMLDivElement>(null),
    correo_corporativo: useRef<HTMLInputElement>(null),
    celular: useRef<HTMLInputElement>(null),
    numero_tarjeta_profesional: useRef<HTMLInputElement>(null),
    hospital_id: useRef<HTMLDivElement>(null),
    contrasena: useRef<HTMLInputElement>(null),
    confirmar_contrasena: useRef<HTMLInputElement>(null),
    terminos: useRef<HTMLDivElement>(null),
  };

  const [hospitales, setHospitales] = useState<Hospital[]>([]);
  const [searchHospital, setSearchHospital] = useState("");
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [selectedHospitalName, setSelectedHospitalName] = useState("");

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    fecha_nacimiento: "",
    sexo: "",
    cedula: "",
    correo_corporativo: "",
    celular: "",
    numero_tarjeta_profesional: "",
    hospital_id: "",
    contrasena: "",
    confirmar_contrasena: "",
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar solo hospitales disponibles (sin usuarios asignados)
        const hospitalesRes = await fetch("/api/hospitales/disponibles");

        if (hospitalesRes.ok) {
          const hospitalesData = await hospitalesRes.json();
          // La API devuelve un array filtrado
          setHospitales(hospitalesData || []);
        } else {
          console.error("Error al cargar hospitales");
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    cargarDatos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo cuando el usuario escribe
    if (erroresValidacion[name as keyof ErroresValidacion]) {
      setErroresValidacion((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSearchHospital = (value: string) => {
    setSearchHospital(value);
    setShowHospitalDropdown(true);
    if (!value) {
      setFormData((prev) => ({ ...prev, hospital_id: "" }));
      setSelectedHospitalName("");
    }
  };

  const handleSelectHospital = (hospital: Hospital) => {
    setFormData((prev) => ({ ...prev, hospital_id: hospital.id }));
    setSelectedHospitalName(hospital.nombre);
    setSearchHospital("");
    setShowHospitalDropdown(false);
    // Limpiar error
    setErroresValidacion((prev) => ({ ...prev, hospital_id: undefined }));
  };

  const filteredHospitales = hospitales.filter((hospital) =>
    hospital.nombre.toLowerCase().includes(searchHospital.toLowerCase()) ||
    (hospital.municipio && hospital.municipio.toLowerCase().includes(searchHospital.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setErroresValidacion({});

    const nuevosErrores: ErroresValidacion = {};

    // Validar términos y condiciones
    if (!isChecked) {
      nuevosErrores.terminos = "Debe aceptar los términos y condiciones para continuar";
    }

    // Validar hospital
    if (!formData.hospital_id) {
      nuevosErrores.hospital_id = "Debe seleccionar un hospital";
    }

    // Validar nombres
    if (!formData.nombres.trim()) {
      nuevosErrores.nombres = "Los nombres son obligatorios";
    } else if (formData.nombres.trim().length < 2) {
      nuevosErrores.nombres = "Los nombres deben tener al menos 2 caracteres";
    }

    // Validar apellidos
    if (!formData.apellidos.trim()) {
      nuevosErrores.apellidos = "Los apellidos son obligatorios";
    } else if (formData.apellidos.trim().length < 2) {
      nuevosErrores.apellidos = "Los apellidos deben tener al menos 2 caracteres";
    }

    // Validar cédula
    if (!formData.cedula) {
      nuevosErrores.cedula = "La cédula es obligatoria";
    } else if (!/^\d{8,12}$/.test(formData.cedula)) {
      nuevosErrores.cedula = "La cédula debe tener entre 8 y 12 dígitos";
    }

    // Validar fecha de nacimiento
    if (!formData.fecha_nacimiento) {
      nuevosErrores.fecha_nacimiento = "La fecha de nacimiento es obligatoria";
    }

    // Validar sexo
    if (!formData.sexo) {
      nuevosErrores.sexo = "Debe seleccionar el sexo";
    }

    // Validar correo
    if (!formData.correo_corporativo) {
      nuevosErrores.correo_corporativo = "El correo corporativo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo_corporativo)) {
      nuevosErrores.correo_corporativo = "El correo debe tener un formato válido (ejemplo@dominio.com)";
    }

    // Validar celular
    if (!formData.celular) {
      nuevosErrores.celular = "El celular es obligatorio";
    } else if (!/^\d{10}$/.test(formData.celular)) {
      nuevosErrores.celular = "El celular debe tener exactamente 10 dígitos";
    }

    // Validar contraseña
    if (!formData.contrasena) {
      nuevosErrores.contrasena = "La contraseña es obligatoria";
    } else if (formData.contrasena.length < 8) {
      nuevosErrores.contrasena = "La contraseña debe tener al menos 8 caracteres";
    } else if (!/(?=.*[a-z])/.test(formData.contrasena)) {
      nuevosErrores.contrasena = "La contraseña debe contener al menos una letra minúscula";
    } else if (!/(?=.*[A-Z])/.test(formData.contrasena)) {
      nuevosErrores.contrasena = "La contraseña debe contener al menos una letra mayúscula";
    } else if (!/(?=.*\d)/.test(formData.contrasena)) {
      nuevosErrores.contrasena = "La contraseña debe contener al menos un número";
    } else if (!/(?=.*[@$!%*?&#._-])/.test(formData.contrasena)) {
      nuevosErrores.contrasena = "La contraseña debe contener al menos un símbolo (@$!%*?&#._-)";
    }

    // Validar confirmación de contraseña
    if (!formData.confirmar_contrasena) {
      nuevosErrores.confirmar_contrasena = "Debe confirmar la contraseña";
    } else if (formData.contrasena !== formData.confirmar_contrasena) {
      nuevosErrores.confirmar_contrasena = "Las contraseñas no coinciden";
    }

    // Si hay errores, mostrarlos y hacer scroll al primero
    if (Object.keys(nuevosErrores).length > 0) {
      setErroresValidacion(nuevosErrores);

      // Scroll al primer campo con error (después de actualizar el estado)
      setTimeout(() => {
        const primerCampoConError = Object.keys(nuevosErrores)[0] as keyof typeof formRefs;
        const ref = formRefs[primerCampoConError];
        if (ref?.current) {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Hacer focus si el elemento lo soporta
          setTimeout(() => {
            if (ref.current && 'focus' in ref.current && typeof ref.current.focus === 'function') {
              (ref.current as HTMLInputElement | HTMLSelectElement).focus();
            }
          }, 500);
        }
      }, 100);

      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          hospital_id: formData.hospital_id ? parseInt(formData.hospital_id) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.detalles) {
          const errores = data.detalles.map((d: any) => d.mensaje).join(", ");
          setError(errores);
        } else {
          setError(data.error || "Error al registrar usuario");
        }
        return;
      }

      setSuccess("Usuario registrado exitosamente. Redirigiendo...");
      toast.success("¡Registro exitoso!", {
        description: "Su cuenta ha sido creada. Redirigiendo al inicio de sesión..."
      });

      setTimeout(() => {
        window.location.href = "/sesion";
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto pb-8">
        <div>
          <div className="mt-6 mb-5 sm:mt-10 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Registrarse
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Completa el formulario para crear la cuenta en el sistema.
            </p>
          </div>
          <div>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800">
                <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
                <p className="text-sm text-success-600 dark:text-success-400">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <Label>
                      Nombres <span className="text-error-500">*</span>
                    </Label>
                    <input
                      ref={formRefs.nombres}
                      type="text"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      required
                      className={inputClasses}
                    />
                    {erroresValidacion.nombres && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{erroresValidacion.nombres}</p>
                    )}
                  </div>
                  <div>
                    <Label>
                      Apellidos <span className="text-error-500">*</span>
                    </Label>
                    <input
                      ref={formRefs.apellidos}
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      required
                      className={inputClasses}
                    />
                    {erroresValidacion.apellidos && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{erroresValidacion.apellidos}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <Label>
                      Cédula <span className="text-error-500">*</span>
                    </Label>
                    <input
                      ref={formRefs.cedula}
                      type="text"
                      name="cedula"
                      value={formData.cedula}
                      onChange={handleChange}
                      placeholder="1234567890"
                      required
                      minLength={8}
                      maxLength={12}
                      pattern="[0-9]*"
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/[^0-9]/g, '');
                      }}
                      className={inputClasses}
                    />
                    {erroresValidacion.cedula && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{erroresValidacion.cedula}</p>
                    )}
                  </div>
                  <div ref={formRefs.fecha_nacimiento}>
                    <Label>
                      Fecha de Nacimiento <span className="text-error-500">*</span>
                    </Label>
                    <DatePicker
                      id="fecha_nacimiento"
                      placeholder="Seleccione una fecha"
                      defaultDate={formData.fecha_nacimiento || undefined}
                      maxDate={new Date()}
                      onChange={(selectedDates) => {
                        if (selectedDates && selectedDates.length > 0) {
                          const fecha = selectedDates[0];
                          const fechaFormateada = fecha.toISOString().split('T')[0];
                          setFormData((prev) => ({
                            ...prev,
                            fecha_nacimiento: fechaFormateada
                          }));
                          // Limpiar error
                          setErroresValidacion((prev) => ({ ...prev, fecha_nacimiento: undefined }));
                        }
                      }}
                    />
                    {erroresValidacion.fecha_nacimiento && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{erroresValidacion.fecha_nacimiento}</p>
                    )}
                  </div>
                </div>

                <div ref={formRefs.sexo}>
                  <Label>
                    Sexo <span className="text-error-500">*</span>
                  </Label>
                  <Select
                    name="sexo"
                    value={formData.sexo}
                    onChange={(value) => setFormData((prev) => ({ ...prev, sexo: value }))}
                    options={[
                      { value: "Hombre", label: "Hombre" },
                      { value: "Mujer", label: "Mujer" },
                      { value: "Otro", label: "Otro" }
                    ]}
                    placeholder="Seleccione..."
                    required
                  />
                  {erroresValidacion.sexo && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{erroresValidacion.sexo}</p>
                  )}
                </div>

                <div>
                  <Label>
                    Correo Corporativo <span className="text-error-500">*</span>
                  </Label>
                  <input
                    ref={formRefs.correo_corporativo}
                    type="email"
                    name="correo_corporativo"
                    value={formData.correo_corporativo}
                    onChange={handleChange}
                    placeholder="ejemplo@hospital.com"
                    required
                    className={inputClasses}
                  />
                  {erroresValidacion.correo_corporativo && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{erroresValidacion.correo_corporativo}</p>
                  )}
                </div>

                <div>
                  <Label>
                    Celular <span className="text-error-500">*</span>
                  </Label>
                  <input
                    ref={formRefs.celular}
                    type="tel"
                    name="celular"
                    value={formData.celular}
                    onChange={handleChange}
                    placeholder="3001234567"
                    required
                    minLength={10}
                    maxLength={10}
                    pattern="[0-9]*"
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.value = target.value.replace(/[^0-9]/g, '');
                    }}
                    className={inputClasses}
                  />
                  {erroresValidacion.celular && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{erroresValidacion.celular}</p>
                  )}
                </div>

                <div>
                  <Label>Tarjeta Profesional</Label>
                  <input
                    type="text"
                    name="numero_tarjeta_profesional"
                    value={formData.numero_tarjeta_profesional}
                    onChange={handleChange}
                    placeholder="TP-12345"
                    className={inputClasses}
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Después de completar el registro, se validará su tarjeta profesional en Rethus para su aprobación y acceso a los servicios.</span>
                  </p>
                </div>

                <div className="relative" ref={formRefs.hospital_id}>
                  <Label>
                    Hospital <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    {selectedHospitalName ? (
                      <div className="relative">
                        <input
                          type="text"
                          value={selectedHospitalName}
                          readOnly
                          className={`${inputClasses} pr-10 cursor-pointer`}
                          onClick={() => {
                            setSelectedHospitalName("");
                            setFormData((prev) => ({ ...prev, hospital_id: "" }));
                            setShowHospitalDropdown(true);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedHospitalName("");
                            setFormData((prev) => ({ ...prev, hospital_id: "" }));
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={searchHospital}
                        onChange={(e) => handleSearchHospital(e.target.value)}
                        onFocus={() => setShowHospitalDropdown(true)}
                        placeholder="Buscar"
                        className={inputClasses}
                      />
                    )}
                    {showHospitalDropdown && !selectedHospitalName && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
                        {filteredHospitales.length > 0 ? (
                          filteredHospitales.map((hospital) => (
                            <div
                              key={hospital.id}
                              onClick={() => handleSelectHospital(hospital)}
                              className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                            >
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {hospital.nombre}
                              </p>
                              {hospital.municipio && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {hospital.municipio}
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            No se encontraron hospitales
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {showHospitalDropdown && !selectedHospitalName && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowHospitalDropdown(false)}
                    />
                  )}
                  {erroresValidacion.hospital_id && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{erroresValidacion.hospital_id}</p>
                  )}
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Si no encuentra el hospital en la lista, es porque ya fue registrado por otro usuario en el sistema. <em> Para mas información, contactarse al correo: soporte@hospital.com </em></span>
                  </p>
                </div>

                <div>
                  <Label>
                    Contraseña <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <input
                      ref={formRefs.contrasena}
                      type={showPassword ? "text" : "password"}
                      name="contrasena"
                      value={formData.contrasena}
                      onChange={handleChange}
                      placeholder="Mínimo 8 caracteres"
                      required
                      className={inputClasses}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                  {erroresValidacion.contrasena && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{erroresValidacion.contrasena}</p>
                  )}
                </div>

                <div>
                  <Label>
                    Confirmar Contraseña <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <input
                      ref={formRefs.confirmar_contrasena}
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmar_contrasena"
                      value={formData.confirmar_contrasena}
                      onChange={handleChange}
                      placeholder="Repite la contraseña"
                      required
                      className={inputClasses}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                  {erroresValidacion.confirmar_contrasena && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{erroresValidacion.confirmar_contrasena}</p>
                  )}
                </div>

                <div ref={formRefs.terminos}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      className="w-5 h-5 mt-0.5"
                      checked={isChecked}
                      onChange={(value) => {
                        setIsChecked(value);
                        if (value) {
                          setErroresValidacion((prev) => ({ ...prev, terminos: undefined }));
                        }
                      }}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Al crear una cuenta, aceptas los{" "}
                      <Link
                        href="/terminos-condiciones"
                        className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-500 underline"
                      >
                        Términos y Condiciones
                      </Link>{" "}
                      y nuestra{" "}
                      <Link
                        href="/politicas-privacidad"
                        className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-500 underline"
                      >
                        Política de Privacidad
                      </Link>
                    </p>
                  </div>
                  {erroresValidacion.terminos && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{erroresValidacion.terminos}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? "Registrando..." : "Registrarse"}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                ¿Ya tiene una cuenta?{" "}
                <Link
                  href="/sesion"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
