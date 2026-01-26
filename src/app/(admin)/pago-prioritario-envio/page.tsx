"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";

interface MedioPago {
  id: number;
  nombre: string;
  descripcion?: string;
  icono?: string;
}

interface Transporte {
  id: number;
  nombre: string;
}

interface DatosSolicitud {
  solicitud_id: number;
  publicacion_id: number;
  medicamento_nombre: string;
  cantidad: number;
  hospital_origen: string;
  hospital_destino_id: number;
}

export default function PagoPrioritarioEnvio() {
  const router = useRouter();

  const [mediosPago, setMediosPago] = useState<MedioPago[]>([]);
  const [transportes, setTransportes] = useState<Transporte[]>([]);
  const [datosSolicitud, setDatosSolicitud] = useState<DatosSolicitud | null>(null);
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

  const [formData, setFormData] = useState({
    nombre_completo: "",
    correo: "",
    cedula: "",
    telefono: "",
    medio_pago_id: "",
    transporte_id: "",
    fecha_recoleccion: "",
    fecha_entrega_estimada: "",
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
    const solicitudTemp = sessionStorage.getItem('solicitudEnvioPrioritario');
    if (solicitudTemp) {
      setDatosSolicitud(JSON.parse(solicitudTemp));
      cargarDatos();
    } else {
      toast.error("No se encontraron datos de solicitud");
      router.push("/solicitudes");
    }
  }, [router]);

  const cargarDatos = async () => {
    try {
      const [resMedios, resTransportes] = await Promise.all([
        fetch("/api/medios-pago"),
        fetch("/api/transporte")
      ]);

      if (resMedios.ok) {
        const data = await resMedios.json();
        setMediosPago(data.mediosPago || []);
      }

      if (resTransportes.ok) {
        const data = await resTransportes.json();
        console.log("Transportes recibidos:", data);
        const transportesArray = Array.isArray(data) ? data : (data.transportes || []);
        setTransportes(transportesArray);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar datos");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre_completo || !formData.correo || !formData.cedula || !formData.medio_pago_id || 
        !formData.transporte_id || !formData.fecha_recoleccion || !formData.fecha_entrega_estimada) {
      toast.error("Campos requeridos", {
        description: "Completa todos los campos obligatorios"
      });
      return;
    }

    // Validar que fecha de entrega sea posterior a recolección
    if (new Date(formData.fecha_entrega_estimada) <= new Date(formData.fecha_recoleccion)) {
      toast.error("Fechas inválidas", {
        description: "La fecha de entrega debe ser posterior a la fecha de recolección"
      });
      return;
    }

    if (!datosSolicitud) {
      toast.error("Error", { description: "No se encontraron datos de solicitud" });
      return;
    }

    const loadingToast = toast.loading("Procesando pago y creando envío...");
    setLoading(true);

    try {
      // 1. Crear el pago
      const pagosResponse = await fetch("/api/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monto: MONTO_PRIORITARIO,
          medio_pago_id: parseInt(formData.medio_pago_id),
          nombre_completo: formData.nombre_completo,
          correo: formData.correo,
          cedula: formData.cedula,
          telefono: formData.telefono || undefined,
          observaciones: formData.observaciones || undefined,
          solicitud_id: datosSolicitud.solicitud_id
        })
      });

      if (!pagosResponse.ok) {
        const errorData = await pagosResponse.json();
        throw new Error(errorData.error || "Error al procesar el pago");
      }

      const pagoData = await pagosResponse.json();

      // 2. Obtener el estado de envío "En preparación"
      const estadosResponse = await fetch("/api/estado-envio");
      if (!estadosResponse.ok) {
        throw new Error("Error al obtener estados de envío");
      }
      const estados = await estadosResponse.json();
      const estadoEnPreparacion = estados.find((e: any) => 
        e.estado?.toLowerCase() === "en preparación" || 
        e.guia?.toLowerCase().includes("preparación")
      );

      if (!estadoEnPreparacion) {
        throw new Error("Estado 'En preparación' no encontrado");
      }

      // 3. Crear el envío asociado al pago
      const envioResponse = await fetch("/api/envios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          solicitud_id: datosSolicitud.solicitud_id,
          hospital_origen_id: datosSolicitud.hospital_destino_id,
          descripcion: `Envío prioritario - ${datosSolicitud.medicamento_nombre}`,
          transporte_id: parseInt(formData.transporte_id),
          fecha_recoleccion: formData.fecha_recoleccion,
          fecha_entrega_estimada: formData.fecha_entrega_estimada,
          estado_envio_id: estadoEnPreparacion.id
        })
      });

      if (!envioResponse.ok) {
        const errorData = await envioResponse.json();
        throw new Error(errorData.error || "Error al crear el envío");
      }

      const envioData = await envioResponse.json();

      // 4. Asociar el pago al envío
      await fetch(`/api/pagos/${pagoData.pago.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          envio_id: envioData.envio.id
        })
      });

      // Limpiar sessionStorage
      sessionStorage.removeItem('solicitudEnvioPrioritario');
      
      toast.success("¡Envío prioritario creado exitosamente!", {
        description: `Transacción: ${pagoData.pago.transaccion}`,
        id: loadingToast,
        duration: 5000
      });

      // Redirigir a seguimiento del envío
      setTimeout(() => {
        router.push(`/envios?envio_id=${envioData.envio.id}`);
      }, 2000);

    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Error al procesar", {
        description: error.message || "No se pudo completar la operación",
        id: loadingToast
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Envío Prioritario
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Completa el pago para activar el seguimiento en tiempo real de tu envío
          </p>
        </div>

        {/* Información del medicamento */}
        {datosSolicitud && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resumen del Pedido
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Medicamento:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {datosSolicitud.medicamento_nombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Cantidad:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {datosSolicitud.cantidad} unidades
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Hospital origen:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {datosSolicitud.hospital_origen}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Costo del envío:</span>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ${MONTO_PRIORITARIO.toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de pago y envío */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Información de Pago y Envío
          </h2>

          <div className="space-y-6">
            {/* Datos personales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nombre completo *</Label>
                <input
                  type="text"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
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
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
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
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />
              </div>

              <div>
                <Label>Teléfono</Label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />
              </div>
            </div>

            {/* Medio de pago */}
            <div>
              <Label>Medio de pago *</Label>
              <Select
                name="medio_pago_id"
                value={formData.medio_pago_id}
                onChange={(value) => setFormData(prev => ({ ...prev, medio_pago_id: value }))}
                options={mediosPago.map(medio => ({ value: String(medio.id), label: medio.nombre }))}
                placeholder="Seleccione un medio de pago"
                required
              />
            </div>

            {/* Información del transporte */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Detalles del Transporte
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Transporte *</Label>
                  <Select
                    name="transporte_id"
                    value={formData.transporte_id}
                    onChange={(value) => setFormData(prev => ({ ...prev, transporte_id: value }))}
                    options={Array.isArray(transportes) ? transportes.map(t => ({ value: String(t.id), label: t.nombre })) : []}
                    placeholder="Seleccione empresa de transporte"
                    required
                  />
                </div>

                <div>
                  <Label>Fecha de recolección *</Label>
                  <input
                    type="date"
                    name="fecha_recoleccion"
                    value={formData.fecha_recoleccion}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>

                <div>
                  <Label>Fecha de entrega estimada *</Label>
                  <input
                    type="date"
                    name="fecha_entrega_estimada"
                    value={formData.fecha_entrega_estimada}
                    onChange={handleChange}
                    min={formData.fecha_recoleccion || new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>
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
                placeholder="Instrucciones especiales o comentarios..."
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />
            </div>

            {/* Aviso importante */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                    Beneficios del envío prioritario
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                    <li>Seguimiento en tiempo real del envío</li>
                    <li>Notificaciones automáticas en cada etapa</li>
                    <li>Barra de progreso visual</li>
                    <li>PIN de seguridad para la entrega</li>
                    <li>Soporte prioritario</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Procesando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Pagar ${MONTO_PRIORITARIO.toLocaleString('es-CO')}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
