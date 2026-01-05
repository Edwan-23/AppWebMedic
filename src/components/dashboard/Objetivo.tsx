"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlyTarget() {
  const [totalFacturado, setTotalFacturado] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarFacturacion = async () => {
      try {
        const response = await fetch("/api/dashboard/metricas");
        if (response.ok) {
          const data = await response.json();
          setTotalFacturado(data.metricas.totalFacturado);
        }
      } catch (error) {
        console.error("Error al cargar facturación:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarFacturacion();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Calcular porcentaje de meta
  const meta = 5000000;
  const porcentaje = totalFacturado > 0 ? Math.min((totalFacturado / meta) * 100, 100) : 0;

  const series = [parseFloat(porcentaje.toFixed(2))];
  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5, 
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return val.toFixed(1) + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  };

  return (
    <>
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 text-center">
          Facturación Total
        </h3>
        <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400 text-center">
          Total recaudado en el sistema
        </p>
      </div>
        <div className="relative ">
          <div className="max-h-[330px]">
            {loading ? (
              <div className="flex items-center justify-center h-[330px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
              </div>
            ) : (
              <ReactApexChart
                options={options}
                series={series}
                type="radialBar"
                height={330}
              />
            )}
          </div>

          {!loading && (
            <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
              {formatCurrency(totalFacturado)}
            </span>
          )}
        </div>
        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          {loading ? "Cargando..." : `Se ha recaudado ${formatCurrency(totalFacturado)} en total. ${porcentaje >= 50 ? "¡Excelente trabajo!" : "Avancemos hacia la meta."}`}
        </p>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5 mt-5">
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Meta
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {formatCurrency(meta)}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Recaudado
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {loading ? "..." : formatCurrency(totalFacturado)}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Progreso
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {loading ? "..." : `${porcentaje.toFixed(1)}%`}
          </p>
        </div>
      </div>
    </>
  );
}
