"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    correo_corporativo: "",
    contrasena: "",
  });

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const response = await fetch('/api/auth/verificar-sesion');
        if (response.ok) {
          const data = await response.json();
          if (data.usuario) {
            // sesión activa, redirigir al dashboard
            toast.info('Sesión activa', {
              description: `Bienvenido de nuevo, ${data.usuario.nombres}`
            });
            setTimeout(() => router.push('/'), 500);
          }
        }
      } catch (error) {
        // No hay sesión guardada o error al verificar
        console.log('No hay sesión guardada');
      }
    };

    verificarSesion();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error al escribir
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          recordar: isChecked
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al iniciar sesión");
        toast.error("¡Error al iniciar sesión!", {
          description: data.error || "Verifique sus credenciales e inténtelo de nuevo."
        });
        return;
      }

      // Guardar datos del usuario en localStorage (temporal)
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      // Notificación de éxito
      toast.success("¡Bienvenido!", {
        description: `Saludos ${data.usuario.nombres}`
      });

      // Redirigir al dashboard (raíz con sesión)
      setTimeout(() => router.push("/"), 500);

    } catch (err) {
      setError("Error de conexión. Intente nuevamente.");
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor. Intente de nuevo."
      });
      console.error("Error en login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      {/* Logo y fondo para móvil */}
      <div className="lg:hidden relative w-full py-5 bg-brand-150 dark:bg-white/5">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/shape/grid-01.svg"
            alt="Background"
            fill
            className="object-cover opacity-90"
          />
        </div>
        <div className="relative z-20 flex justify-center">
          <Image
            width={150}
            height={40}
            src="/images/logo/auth-logo2 (2).svg"
            alt="Logo"
            className="mx-auto"
          />
        </div>
      </div>

      <div className="flex flex-col lg:justify-center flex-1 w-full max-w-md mx-auto px-6 lg:px-0 pt-6 lg:pt-0">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar sesión
            </h1>
          </div>
          <div>
            {error && (
              <div className="mb-4 p-3 text-sm text-error-600 bg-error-50 dark:bg-error-900/20 dark:text-error-400 rounded-lg border border-error-200 dark:border-error-800">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Correo electrónico <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    name="correo_corporativo"
                    defaultValue={formData.correo_corporativo}
                    onChange={handleChange}
                    placeholder="info@institucion.com"
                    type="email"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label>
                    Contraseña <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      name="contrasena"
                      defaultValue={formData.contrasena}
                      onChange={handleChange}
                      type={showPassword ? "text" : "password"}
                      placeholder="Contraseña"
                      disabled={loading}
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
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Mantener sesión iniciada
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    ¿Olvidó la contraseña?
                  </Link>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full px-4 py-3 text-sm font-semibold rounded-lg transition-colors bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                ¿Sin una cuenta? {""}
                <Link
                  href="/registro"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Regístrarse
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
