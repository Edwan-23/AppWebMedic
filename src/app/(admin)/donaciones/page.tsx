import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ListaDonaciones from "@/components/donaciones/ListaDonaciones";
import React, { Suspense } from "react";

export const metadata = {
  title: "Donaciones",
  description: "Gestión de donaciones de medicamentos"
};

export default function DonacionesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Donaciones" />
      <div className="space-y-6">
        <ComponentCard title="Gestión de Donaciones de Medicamentos">
          <Suspense fallback={<div className="text-center py-4">Cargando...</div>}>
            <ListaDonaciones />
          </Suspense>
        </ComponentCard>
      </div>
    </div>
  );
}
