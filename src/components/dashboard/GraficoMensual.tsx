"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface PublicacionMes {
  mes: string;
  total: number;
}

export default function MonthlySalesChart() {
  const [datosPublicaciones, setDatosPublicaciones] = useState<PublicacionMes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const response = await fetch("/api/dashboard/metricas");
        if (response.ok) {
          const data = await response.json();
          setDatosPublicaciones(data.publicacionesPorMes || []);
        }
      } catch (error) {
        console.error("Error al cargar publicaciones por mes:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Preparar datos para el gráfico
  const meses = datosPublicaciones.map(item => {
    const [year, month] = item.mes.split('-');
    const fecha = new Date(parseInt(year), parseInt(month) - 1);
    return fecha.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' });
  });

  const cantidades = datosPublicaciones.map(item => item.total);

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: meses,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: true,
      },
      y: {
        formatter: (val: number) => `${val} publicaciones`,
      },
    },
  };

  const series = [
    {
      name: "Publicaciones",
      data: cantidades,
    },
  ];

  return (
    <div className="p-5 md:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 text-center">
          Publicaciones por Mes
        </h3>
        <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400 text-center">
          Actividad mensual de publicaciones
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[250px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      ) : datosPublicaciones.length > 0 ? (
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={250}
        />
      ) : (
        <div className="flex items-center justify-center h-[250px] text-gray-500 dark:text-gray-400">
          No hay datos disponibles
        </div>
      )}
    </div>
  );
}
