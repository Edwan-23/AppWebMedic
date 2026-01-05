import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ListaPublicaciones from "@/components/publicaciones/ListaPublicaciones";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Publicaciones",
  description: "Centro de publicaciones de medicamentos",
};

export default function PublicacionesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Publicaciones" />
      <div className="space-y-6">
        <ComponentCard title="Centro de Publicaciones">
          <ListaPublicaciones/>
        </ComponentCard>
      </div>
    </div>
  );
}
