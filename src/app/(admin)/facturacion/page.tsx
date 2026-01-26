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
        </div>
        <ListaPagos/>
      </div>
    </div>
  );
}
