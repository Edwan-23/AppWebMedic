import { Metadata } from "next";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import ListaPagos from "@/components/facturacion/ListaPagos";

export const metadata: Metadata = {
  title: "Facturación",
  description: "Gestión de pagos prioritarios y facturación"
};

export default function FacturacionPage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Facturación"
      />

      <div className="rounded-lg bg-white dark:bg-gray-800 shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Historial de Pagos
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Administre y valide los pagos de las solicitudes prioritarias
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Los pagos registrados crean envíos automáticamente
            </span>
          </div>
        </div>
        <ListaPagos/>
      </div>
    </div>
  );
}
