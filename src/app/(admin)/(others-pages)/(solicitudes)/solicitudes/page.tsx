import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ListaSolicitudes from "@/components/solicitudes/ListaSolicitudes";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const metadata: Metadata = {
  title: "Solicitudes",
  description: "Gestión de solicitudes de medicamentos",
};

export default function SolicitudesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Solicitudes" />
      <div className="space-y-6">
        <ComponentCard title="Mis Solicitudes de Medicamentos">
          <Suspense fallback={<div className="text-center py-4">Cargando...</div>}>
            <ListaSolicitudes />
          </Suspense>
        </ComponentCard>
      </div>
    </div>
  );
}
