import { Suspense } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import ListaEnvios from "@/components/logistica/ListaEnvios";

export const metadata = {
    title: "Envíos",
    description: "Gestión y seguimiento de envíos"
};

const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Logística", path: "/pedidos" },
    { label: "Envíos", path: "/envios" }
];

export default function EnviosPage() {
    return (
        <>
            <PageBreadcrumb pageTitle="Envíos" />
            <div className="space-y-6">
                <ComponentCard title="Gestión de Envíos">
                    <Suspense fallback={<div>Cargando...</div>}>
                        <ListaEnvios />
                    </Suspense>
                </ComponentCard>
            </div>
        </>
    );
}
