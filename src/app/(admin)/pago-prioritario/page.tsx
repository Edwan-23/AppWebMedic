"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Label from "@/components/form/Label";

interface MedioPago {
  id: number;
  nombre: string;
  descripcion?: string;
  icono?: string;
}

interface DatosSolicitud {
  publicacion_id: number;
  hospital_id: number;
  medicamento_id: number;
  descripcion: string;
  medicamento_nombre: string;
  cantidad: number;
  hospital_origen: string;
}

export default function PagoPrioritario() {
  const router = useRouter();

  const [mediosPago, setMediosPago] = useState<MedioPago[]>([]);
  const [datosSolicitud, setDatosSolicitud] = useState<DatosSolicitud | null>(null);
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

  const [formData, setFormData] = useState({
    nombre_completo: "",
    correo: "",
    cedula: "",
    telefono: "",
    direccion: "",
    medio_pago_id: "",
    observaciones: ""
  });

  const MONTO_PRIORITARIO = 50000; // $50,000 COP

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      const user = JSON.parse(usuarioData);
      setUsuario(user);
      
      // Pre-llenar datos del usuario
      setFormData(prev => ({
        ...prev,
        nombre_completo: `${user.nombres} ${user.apellidos}`,
        correo: user.correo_corporativo,
        cedula: user.cedula,
        telefono: user.celular || ""
      }));
    }

    // Cargar datos de la solicitud desde sessionStorage
    const solicitudTemp = sessionStorage.getItem('solicitudPrioritaria');
    if (solicitudTemp) {
      setDatosSolicitud(JSON.parse(solicitudTemp));
      cargarMediosPago();
    } else {
      toast.error("No se encontraron datos de solicitud");
      router.push("/publicaciones");
    }
  }, [router]);

  const cargarMediosPago = async () => {
    try {
      const resMedios = await fetch("/api/medios-pago");
      if (resMedios.ok) {
        const data = await resMedios.json();
        setMediosPago(data.mediosPago || []);
      }
    } catch (error) {
      console.error("Error al cargar medios de pago:", error);
      toast.error("Error al cargar medios de pago");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre_completo || !formData.correo || !formData.cedula || !formData.medio_pago_id) {
      toast.error("Campos requeridos", {
        description: "Completa todos los campos obligatorios"
      });
      return;
    }

    if (!datosSolicitud) {
      toast.error("Error", { description: "No se encontraron datos de solicitud" });
      return;
    }

    const loadingToast = toast.loading("Procesando pago y creando solicitud...");
    setLoading(true);

    try {
      // Crear solicitud + pago en una sola transacción
      const response = await fetch("/api/pagos/crear-con-solicitud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Datos de la solicitud (asegurar que sean números)
          solicitud: {
            publicacion_id: Number(datosSolicitud.publicacion_id),
            hospital_id: Number(datosSolicitud.hospital_id),
            medicamento_id: Number(datosSolicitud.medicamento_id),
            descripcion: datosSolicitud.descripcion
          },
          // Datos del pago
          pago: {
            monto: MONTO_PRIORITARIO,
            medio_pago_id: parseInt(formData.medio_pago_id),
            nombre_completo: formData.nombre_completo,
            correo: formData.correo,
            cedula: formData.cedula,
            telefono: formData.telefono || undefined,
            direccion: formData.direccion || undefined,
            observaciones: formData.observaciones || undefined
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Limpiar sessionStorage
        sessionStorage.removeItem('solicitudPrioritaria');
        
        toast.success("¡Pago registrado exitosamente!", {
          description: `ID de transacción: ${data.pago.transaccion}`,
          id: loadingToast,
          duration: 5000
        });

        // Redirigir a solicitudes
        setTimeout(() => {
          router.push("/solicitudes");
        }, 2000);
      } else {
        const error = await response.json();
        console.error("Error del servidor:", error);
        
        // Mostrar detalles de validación si existen
        let descripcion = error.error || "Error desconocido";
        if (error.detalles && error.detalles.length > 0) {
          descripcion = error.detalles.map((d: any) => 
            `${d.path.join('.')}: ${d.message}`
          ).join(', ');
        }
        
        toast.error("Error al procesar el pago", {
          description: descripcion,
          id: loadingToast,
          duration: 5000
        });
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      toast.error("Error de conexión", {
        description: "No se pudo procesar el pago",
        id: loadingToast
      });
    } finally {
      setLoading(false);
    }
  };

  const getIconoMedioPago = (icono?: string) => {
    // Iconos SVG para cada medio de pago
    const iconos: { [key: string]: React.ReactNode } = {
      'pse': (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      'credit-card': (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
      'cash': (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      )
    };

    return iconos[icono || 'credit-card'] || iconos['credit-card'];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-500 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pago Prioritario
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Complete la información para procesar su solicitud prioritaria
          </p>
        </div>

        {/* Detalles de la solicitud */}
        {datosSolicitud && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
              Detalles de la Solicitud
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-600 dark:text-blue-400 font-medium">Medicamento:</p>
                <p className="text-blue-900 dark:text-blue-100">{datosSolicitud.medicamento_nombre}</p>
              </div>
              <div>
                <p className="text-blue-600 dark:text-blue-400 font-medium">Cantidad:</p>
                <p className="text-blue-900 dark:text-blue-100">{datosSolicitud.cantidad} unidades</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-blue-600 dark:text-blue-400 font-medium">Hospital Donante:</p>
                <p className="text-blue-900 dark:text-blue-100">{datosSolicitud.hospital_origen}</p>
              </div>
            </div>
          </div>
        )}

        {/* Card de monto */}
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand-100 text-sm font-medium">Monto a pagar</p>
              <p className="text-4xl font-bold mt-1">
                ${MONTO_PRIORITARIO.toLocaleString('es-CO')}
              </p>
              <p className="text-brand-100 text-sm mt-1">COP - Pesos Colombianos</p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Datos personales */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Datos del pagador
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre completo *</Label>
                    <input
                      type="text"
                      name="nombre_completo"
                      value={formData.nombre_completo}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    />
                  </div>

                  <div>
                    <Label>Cédula *</Label>
                    <input
                      type="text"
                      name="cedula"
                      value={formData.cedula}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    />
                  </div>

                  <div>
                    <Label>Correo electrónico *</Label>
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    />
                  </div>

                  <div>
                    <Label>Teléfono</Label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="3001234567"
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    />
                  </div>

                </div>
              </div>

              {/* Medio de pago */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Medio de pago *
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {mediosPago.map(medio => (
                    <label
                      key={medio.id}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.medio_pago_id === medio.id.toString()
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-brand-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="medio_pago_id"
                        value={medio.id}
                        checked={formData.medio_pago_id === medio.id.toString()}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="text-brand-500">
                        {getIconoMedioPago(medio.icono)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {medio.nombre}
                        </p>
                        {medio.descripcion && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {medio.descripcion}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <Label>Observaciones</Label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Información adicional sobre el pago..."
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 text-sm font-semibold text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Procesando..." : "Confirmar Pago"}
              </button>
            </div>
          </form>

          {/* Nota informativa */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Nota importante:</p>
                <p>
                  Al confirmar el pago, se registrará la solicitud como <strong>Prioritaria</strong>. 
                  se verificará el pago y activará el envío en un máximo de 24 horas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
