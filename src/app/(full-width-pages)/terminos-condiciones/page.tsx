import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Dashboard Hospitalario",
  description: "Términos y condiciones de uso del sistema de gestión de medicamentos",
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-dark rounded-2xl shadow-theme-lg p-8 md:p-12">
        <Link
          href="/registro"
          className="inline-flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 mb-6"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver al registro
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Términos y Condiciones
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              1. Aceptación de los términos
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Al acceder y utilizar la plataforma Hospitalaria, usted acepta estar sujeto a estos Términos y Condiciones, 
              todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes locales aplicables.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              2. Uso del sistema
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              El sistema está diseñado exclusivamente para la gestión de medicamentos entre los hospitales registrados y los encargado de estos, 
              comprometiendose a:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-4">
              <li>Utilizar el sistema únicamente para fines profesionales y autorizados</li>
              <li>Mantener la confidencialidad de sus credenciales de acceso</li>
              <li>No compartir información sensible con terceros no autorizados</li>
              <li>Cumplir con todas las normativas de protección de datos de salud</li>
              <li>Reportar cualquier actividad sospechosa o brecha de seguridad</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              3. Responsabilidades del usuario
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Cada usuario es responsable de:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-4">
              <li>La exactitud de la información ingresada al sistema</li>
              <li>El uso apropiado de los datos de medicamentos publicados</li>
              <li>La actualización oportuna de la información de solicitudes</li>
              <li>El cumplimiento de protocolos de seguridad establecidos para los envios</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              4. Privacidad y protección de datos
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              El sistema cumple con las normativas de protección de datos de salud, siendo la información médica tratada 
              con el máximo nivel de confidencialidad y seguridad.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              5. Limitación de Responsabilidad
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              El sistema se proporciona con las garantías basicas de funcionalidad. No nos hacemos responsables por:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-4">
              <li>Interrupciones del servicio por mantenimiento o causas técnicas</li>
              <li>Pérdida de datos debido a factores externos</li>
              <li>Decisiones médicas tomadas basándose en la información del sistema</li>
              <li>Uso indebido del sistema por parte de usuarios no autorizados</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              6. Modificaciones del servicio
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Nos reservamos el derecho de modificar o discontinuar el servicio en cualquier momento, 
              con o sin previo aviso. No seremos responsables ante usted ni ante terceros por cualquier 
              modificación, suspensión o discontinuación del servicio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              7. Terminación de Cuenta
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Podemos terminar o suspender su acceso al sistema inmediatamente, sin previo aviso, 
              por cualquier razón, incluyendo las violaciones de estos Términos y Condiciones.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              8. Contacto
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Para preguntas sobre estos Términos y Condiciones, por favor contacte a:
            </p> 
            <p className="text-gray-600 dark:text-gray-400">
              Email: soporte@medifarma.com<br />
              Celular: +57 (300) 000-0000
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Al utilizar este sistema, usted acepta estos Términos y Condiciones en su totalidad.
          </p>
        </div>
      </div>
    </div>
  );
}
