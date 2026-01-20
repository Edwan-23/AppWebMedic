import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <LandingHeader />

            {/* Sección Principal */}
            <section className="relative pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden">
                {/* Patrón de fondo */}
                <div className="absolute inset-0 -z-10">
                    <Image
                        src="/images/shape/grid-01.svg"
                        alt="Background"
                        fill
                        className="object-cover opacity-5 dark:opacity-10"
                    />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                            Gestión de{" "}
                            <span className="text-brand-500">Medicamentos</span> entre
                            Hospitales
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                            Sistema que conecta hospitales para optimizar la
                            distribución de medicamentos, reducir desperdicios y mejorar el
                            acceso a medicina esencial.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/registro"
                                className="w-full sm:w-auto px-8 py-4 text-base font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition shadow-theme-xs"
                            >
                                Comenzar ahora
                            </Link>
                            <Link
                                href="/sesion"
                                className="w-full sm:w-auto px-8 py-4 text-base font-medium text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            >
                                Iniciar sesión
                            </Link>
                        </div>
                    </div>

                    {/* Imagen/Ilustración Principal */}
                    <div className="mt-16 lg:mt-10 max-w-7xl mx-auto">

                        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-900/20 dark:to-blue-900/20 p-8 sm:p-12 lg:p-16">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Publicaciones
                                    </h3>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Intercambio
                                    </h3>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Envio prioritario
                                    </h3>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Donaciones
                                    </h3>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección Nosotros */}
            <section id="nosotros" className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            ¿Quiénes Somos?
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Somos una plataforma innovadora diseñada para revolucionar la
                            gestión de medicamentos entre hospitales en el sector salud de Colombia.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        Innovación
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Sistema para conectar hospitales y optimizar
                                        recursos farmacéuticos en tiempo real.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        Colaboración
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Facilitamos la cooperación entre instituciones de salud
                                        para mejor aprovechamiento de medicamentos.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        Seguridad
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Protección de datos y trazabilidad completa en cada
                                        transacción de medicamentos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-brand-500 p-12 lg:p-16">
                                <div className="relative z-10">
                                    <div className="text-white/90 text-6xl lg:text-7xl font-bold mb-4">
                                        100+
                                    </div>
                                    <p className="text-white/80 text-lg lg:text-xl">
                                        Hospitales conectados trabajando juntos por un mejor sistema
                                        de salud
                                    </p>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección Servicios */}
            <section id="servicios" className="py-16 lg:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Nuestros Servicios
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Herramientas completas para la gestión eficiente de medicamentos
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {/* Servicio 1 */}
                        <div className="relative bg-gradient-to-br from-white to-brand-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-8 shadow-lg overflow-hidden">
                            {/* Contenido */}
                            <h3 className="relative z-10 text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                Gestión de Inventario
                            </h3>
                            <p className="relative z-10 text-gray-600 dark:text-gray-400">
                                Control detallado de medicamentos disponibles, fechas de vencimiento, lotes y ubicaciones en tiempo real.
                            </p>
                        </div>



                        {/* Servicio 2 */}
                        <div className="relative bg-gradient-to-br from-white to-brand-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-8 shadow-lg overflow-hidden">
                            <h3 className="relative z-10 text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                Intercambio entre Hospitales
                            </h3>
                            <p className="relative z-10 text-gray-600 dark:text-gray-400">
                                Plataforma para solicitar, donar y transferir medicamentos entre Hospitales de forma segura y trazable.
                            </p>
                        </div>


                        {/* Servicio 3 */}
                        <div className="relative bg-gradient-to-br from-white to-brand-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-8 shadow-lg overflow-hidden">
                            <h3 className="relative z-10 text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                Gestión de Pagos
                            </h3>
                            <p className="relative z-10 text-gray-600 dark:text-gray-400">
                                Sistema integrado para manejar transacciones, facturas y pagos
                                prioritarios entre hospitales.
                            </p>
                        </div>


                        {/* Servicio 4 */}
                        <div className="relative bg-gradient-to-br from-white to-brand-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-8 shadow-lg overflow-hidden">
                            <h3 className="relative z-10 text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                Logística y Envíos
                            </h3>
                            <p className="relative z-10 text-gray-600 dark:text-gray-400">
                                Seguimiento completo de envíos, coordinación de transportes y
                                gestión de rutas de entrega.
                            </p>
                        </div>


                        {/* Servicio 5 */}
                        <div className="relative bg-gradient-to-br from-white to-brand-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-8 shadow-lg overflow-hidden">
                            <h3 className="relative z-10 text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                Notificaciones en Tiempo Real
                            </h3>
                            <p className="relative z-10 text-gray-600 dark:text-gray-400">
                                Alertas instantáneas sobre nuevas publicaciones, solicitudes,
                                cambios de estado y avisos importantes.
                            </p>
                        </div>


                        {/* Servicio 6 */}
                        <div className="relative bg-gradient-to-br from-white to-brand-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-8 shadow-lg overflow-hidden">
                            <h3 className="relative z-10 text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                Reportes y Análisis
                            </h3>
                            <p className="relative z-10 text-gray-600 dark:text-gray-400">
                                Dashboards interactivos con estadísticas, gráficos y reportes
                                detallados para mejor toma de decisiones.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Sección Objetivos */}
            <section id="objetivos" className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Nuestros Objetivos
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Transformando la salud a través de la tecnología
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-brand-500 text-white rounded-lg flex items-center justify-center font-semibold">
                                    1
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Optimizar la distribución de medicamentos
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Reducir el desperdicio y mejorar la disponibilidad de
                                        medicamentos mediante una red colaborativa entre hospitales.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-brand-500 text-white rounded-lg flex items-center justify-center font-semibold">
                                    2
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Facilitar el acceso a tratamientos
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Conectar instituciones para que pacientes puedan acceder a
                                        medicamentos esenciales cuando más los necesitan.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-brand-500 text-white rounded-lg flex items-center justify-center font-semibold">
                                    3
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Promover la transparencia y trazabilidad
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Garantizar un registro completo de cada transacción con
                                        total seguridad y cumplimiento normativo.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-brand-500 text-white rounded-lg flex items-center justify-center font-semibold">
                                    4
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Reducir costos operativos
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Minimizar pérdidas por medicamentos vencidos y optimizar
                                        inversiones en inventarios hospitalarios.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-brand-500 text-white rounded-lg flex items-center justify-center font-semibold">
                                    5
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Fortalecer la colaboración interinstitucional
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Crear una red sólida de cooperación que beneficie a todo el
                                        sector salud y a los pacientes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección CTA */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto bg-brand-500 rounded-2xl p-12 lg:p-16 text-center shadow-2xl">

                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            ¿Listo para transformar la gestión de medicamentos?
                        </h2>
                        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                            Únete a nuestra red de hospitales y comienza a optimizar recursos
                            hoy mismo.
                        </p>
                        <Link
                            href="/registro"
                            className="inline-block px-8 py-4 text-base font-medium text-brand-500 bg-white rounded-lg hover:bg-gray-50 transition shadow-lg"
                        >
                            Crear cuenta gratis
                        </Link>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
}
