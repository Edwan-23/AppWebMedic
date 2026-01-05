"use client";
import React, { useEffect, useState } from "react";
import { BoxIconLine, GroupIcon, HeartIcon, TableIcon, BoxCubeIcon, CheckCircleIcon } from "@/icons";

interface Metricas {
  totalUsuarios: number;
  totalHospitales: number;
  totalDonaciones: number;
  totalPublicaciones: number;
  totalFacturado: number;
  totalMedicamentos: number;
  publicacionesDisponibles: number;
}

export const EcommerceMetrics = () => {
  const [metricas, setMetricas] = useState<Metricas>({
    totalUsuarios: 0,
    totalHospitales: 0,
    totalDonaciones: 0,
    totalPublicaciones: 0,
    totalFacturado: 0,
    totalMedicamentos: 0,
    publicacionesDisponibles: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        const response = await fetch("/api/dashboard/metricas");
        if (response.ok) {
          const data = await response.json();
          setMetricas(data.metricas);
        }
      } catch (error) {
        console.error("Error al cargar métricas:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarMetricas();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CO').format(num);
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">

      {/* Total Usuarios */}
      <div className="h-48 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900/40 dark:to-brand-900/20 p-6 shadow-lg flex items-center justify-center">
        <div className="flex flex-col items-center">
          <h4 className="font-bold text-4xl text-brand-900 dark:text-brand-100">
            {loading ? "..." : formatNumber(metricas.totalUsuarios)}
          </h4>
          <p className="mt-4 text-sm font-medium text-brand-800 dark:text-brand-200 text-center">
            Total Usuarios
          </p>
        </div>
      </div>


      {/* Total Hospitales */}
      <div className="h-48 rounded-2xl bg-gradient-to-br from-success-100 to-success-50 dark:from-success-900/40 dark:to-success-900/20 p-6 shadow-lg flex items-center justify-center">
        <div className="flex flex-col items-center">
          <h4 className="font-bold text-4xl text-success-900 dark:text-success-100">
            {loading ? "..." : formatNumber(metricas.totalHospitales)}
          </h4>
          <p className="mt-4 text-sm font-medium text-success-800 dark:text-success-200 text-center">
            Total Hospitales
          </p>
        </div>
      </div>

      {/* Total Donaciones */}
      <div className="h-48 rounded-2xl bg-gradient-to-br from-error-100 to-error-50 dark:from-error-900/40 dark:to-error-900/20 p-6 shadow-lg flex items-center justify-center">
        <div className="flex flex-col items-center">
          <h4 className="font-bold text-4xl text-error-900 dark:text-error-100">
            {loading ? "..." : formatNumber(metricas.totalDonaciones)}
          </h4>
          <p className="mt-4 text-sm font-medium text-error-800 dark:text-error-200 text-center">
            Total Donaciones
          </p>
        </div>
      </div>

      {/* Total Publicaciones */}
      <div className="h-48 rounded-2xl bg-gradient-to-br from-warning-100 to-warning-50 dark:from-warning-900/40 dark:to-warning-900/20 p-6 shadow-lg flex items-center justify-center">
        <div className="flex flex-col items-center">
          <h4 className="font-bold text-4xl text-warning-900 dark:text-warning-100">
            {loading ? "..." : formatNumber(metricas.totalPublicaciones)}
          </h4>
          <p className="mt-4 text-sm font-medium text-warning-800 dark:text-warning-200 text-center">
            Total Publicaciones
          </p>
        </div>
      </div>

      {/* Total Medicamentos */}

<div className="h-48 rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg flex items-center justify-center">
  <div className="flex flex-col items-center">
    
    <h4 className="font-bold text-4xl text-black dark:text-white">
      {loading ? "..." : formatNumber(metricas.totalMedicamentos)}
    </h4>

    <p className="mt-4 text-sm font-medium text-black dark:text-gray-300 text-center">
      Total Medicamentos
    </p>

  </div>
</div>

      {/* Publicaciones Disponibles */}
      <div className="h-48 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-900/20 p-6 shadow-lg flex items-center justify-center">
        <div className="flex flex-col items-center">
          <h4 className="font-bold text-4xl text-purple-900 dark:text-purple-100">
            {loading ? "..." : formatNumber(metricas.publicacionesDisponibles)}
          </h4>
          <p className="mt-4 text-sm font-medium text-purple-800 dark:text-purple-200 text-center">
            Publicaciones Disponibles
          </p>
        </div>
      </div>

    </div>
  );
};
