"use client";
import { EcommerceMetrics } from "@/components/dashboard/Metricas";
import React, { useEffect, useState } from "react";
import MonthlyTarget from "@/components/dashboard/Objetivo";
import MonthlySalesChart from "@/components/dashboard/GraficoMensual";
import StatisticsChart from "@/components/dashboard/GraficoEstadistico";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      const userData = JSON.parse(usuario);
      setUsuarioActual(userData);
      
      // Redirigir si no es admin
      if (userData.rol_id !== "1") {
        router.push("/profile");
      }
    }
    setIsLoading(false);
  }, [router]);

  // Mostrar carga mientras verifica el rol
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // No mostrar dashboard si no es admin
  if (!usuarioActual || usuarioActual.rol_id !== "1") {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Grid: Estadísticas + Facturación */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Métricas circulares */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6">
            Estadísticas Generales
          </h2>
          <EcommerceMetrics />
        </div>

        {/* Facturación Total */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
          <MonthlyTarget />
        </div>
      </div>

      {/* Grid de gráficas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Publicaciones por Mes */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <MonthlySalesChart />
        </div>

        {/* Envíos Entregados vs Recibidos */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <StatisticsChart />
        </div>
      </div>
    </div>
  );
}
