"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ComparacionMes {
  mes: string;
  total: number;
}

export default function StatisticsChart() {
  const [enviosEntregados, setEnviosEntregados] = useState<ComparacionMes[]>([]);
  const [enviosRecibidos, setEnviosRecibidos] = useState<ComparacionMes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const response = await fetch("/api/dashboard/metricas");
        if (response.ok) {
          const data = await response.json();
          setEnviosEntregados(data.comparacion.enviosEntregados || []);
          setEnviosRecibidos(data.comparacion.enviosRecibidos || []);
        }
      } catch (error) {
        console.error("Error al cargar comparación:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Combinar todos los meses únicos
  const todosMeses = Array.from(new Set([
    ...enviosEntregados.map(s => s.mes),
    ...enviosRecibidos.map(d => d.mes)
  ])).sort();

  // Preparar datos para el gráfico
  const mesesLabels = todosMeses.map(mes => {
    const [year, month] = mes.split('-');
    const fecha = new Date(parseInt(year), parseInt(month) - 1);
    return fecha.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' });
  });

  const datosEnviosEntregados = todosMeses.map(mes => {
    const dato = enviosEntregados.find(s => s.mes === mes);
    return dato ? dato.total : 0;
  });

  const datosEnviosRecibidos = todosMeses.map(mes => {
    const dato = enviosRecibidos.find(d => d.mes === mes);
    return dato ? dato.total : 0;
  });

  const options: ApexOptions = {
    colors: ["#465FFF", "#22C55E"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 335,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: mesesLabels,
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
    grid: {
      borderColor: "#E4E7EC",
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: undefined,
        inverseColors: true,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 90, 100],
      },
    },
    tooltip: {
      x: {
        show: true,
      },
      y: {
        formatter: (val: number) => `${val} envíos`,
      },
    },
  };

  const series = [
    {
      name: "Envíos Entregados",
      data: datosEnviosEntregados,
    },
    {
      name: "Envíos Recibidos",
      data: datosEnviosRecibidos,
    },
  ];

  return (
    <div className="p-5 md:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 text-center">
          Envíos Entregados vs Envíos Recibidos
        </h3>
        <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400 text-center">
          Comparación mensual de envíos procesados
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[335px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      ) : todosMeses.length > 0 ? (
        <div className="mt-4">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={335}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-[335px] text-gray-500 dark:text-gray-400">
          No hay datos disponibles
        </div>
      )}
    </div>
  );
}
