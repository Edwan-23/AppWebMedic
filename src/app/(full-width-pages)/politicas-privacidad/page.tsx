"use client";
import { Metadata } from "next";
import { useRouter } from "next/navigation";



export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-dark rounded-2xl shadow-theme-lg p-8 md:p-12">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 mb-6"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver
        </button>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Políticas de Privacidad
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              1. Introducción
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Con la plataforma Medifarma, nos comprometemos a proteger su privacidad. 
              Esta Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos la información personal.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              2. Información que Recopilamos
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Recopilamos diferentes tipos de información:
            </p>
            
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3 mt-6">
              2.1 Información del Usuario
            </h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-4">
              <li>Nombre completo</li>
              <li>Cédula de identidad</li>
              <li>Correo electrónico corporativo</li>
              <li>Número de celular</li>
              <li>Número de tarjeta profesional</li>
              <li>Fecha de nacimiento</li>
              <li>Hospital de afiliación</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3 mt-6">
              2.2 Información de Uso (Pendiente)
            </h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-4">
              <li>Registros de acceso al sistema</li>
              <li>Direcciones IP</li>
              <li>Tipo de navegador y dispositivo</li>
              <li>Páginas visitadas y acciones realizadas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              3. Cómo Usamos la Información
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-4">
              <li>Proporcionar y mantener los servicios del sistema</li>
              <li>Gestionar el acceso y autenticación de usuarios</li>
              <li>Facilitar la adquisición y gestión de medicamentos</li>
              <li>Mejorar la seguridad y prevenir fraudes</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
              <li>Realizar análisis estadísticos y mejorar nuestros servicios</li>
              <li>Comunicar actualizaciones importantes del sistema</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              4. Compartir Información
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No vendemos ni alquilamos información personal. Compartimos información solo en los siguientes casos:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-4">
              <li><strong>Personal autorizado del hospital:</strong> Profesionales de la salud con necesidad legítima de acceso</li>
              <li><strong>Proveedores de servicios:</strong> Empresas que nos ayudan a operar el sistema bajo estrictos acuerdos de confidencialidad</li>
              <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley o para proteger derechos y seguridad</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              5. Seguridad de los Datos
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Implementamos medidas de seguridad técnicas y organizativas para proteger la información:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-4">
              <li>Cifrado de datos en tránsito y en reposo</li>
              <li>Autenticación de dos factores para accesos críticos</li>
              <li>Auditorías de seguridad regulares</li>
              <li>Control de acceso basado en roles</li>
              <li>Copias de seguridad automáticas y cifradas</li>
              <li>Monitoreo continuo de amenazas de seguridad</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              6. Derechos de los Usuarios
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Los usuarios tienen derecho a:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-4">
              <li>Acceder a su información personal almacenada</li>
              <li>Solicitar corrección de datos inexactos</li>
              <li>Solicitar eliminación de datos cuando sea aplicable</li>
              <li>Oponerse al procesamiento de ciertos datos</li>
              <li>Solicitar portabilidad de datos</li>
              <li>Retirar el consentimiento en cualquier momento</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              7. Retención de datos
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Conservamos la información personal solo durante el tiempo necesario para cumplir con los fines 
              para los que fue recopilada, incluidos los requisitos legales, contables o de informes. 
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              8. Cookies y Tecnologías Similares
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Utilizamos cookies y tecnologías similares para mejorar la experiencia del usuario, 
              recordar preferencias y analizar el uso del sistema. Puede configurar su navegador 
              para rechazar cookies, aunque esto puede afectar la funcionalidad del sistema.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              9. Cambios a esta Política
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos sobre 
              cambios significativos publicando la nueva política en el sistema y actualizando la 
              fecha de &ldquo;Última actualización&rdquo; en la parte superior de esta página.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              10. Contacto
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Para preguntas, solicitudes o inquietudes sobre esta Política de Privacidad o el 
              manejo de sus datos personales, contáctenos:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Oficial de Protección de Datos</strong><br />
                Email: privacidad@medifarma.com<br />
                Teléfono: +57 (300) 000-0000<br />
              </p>
            </div>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Al utilizar este sistema, usted acepta esta Política de Privacidad y el procesamiento de sus datos conforme a ella.
          </p>
        </div>
      </div>
    </div>
  );
}
