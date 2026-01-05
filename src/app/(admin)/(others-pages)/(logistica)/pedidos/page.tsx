import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ListaPedidos from "@/components/logistica/ListaPedidos";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const metadata: Metadata = {
  title: "Pedidos",
  description: "Gestión de pedidos recibidos",
};

export default function PedidosPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Pedidos" />
      <div className="space-y-6">
        <ComponentCard title="Pedidos Recibidos">
          <Suspense fallback={<div className="text-center py-4">Cargando...</div>}>
            <ListaPedidos />
          </Suspense>
        </ComponentCard>
      </div>
    </div>
  );
}
