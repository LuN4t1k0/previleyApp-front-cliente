"use client";

import { useState, useEffect } from "react";
import { RiDownloadLine, RiFileExcel2Line } from "@remixicon/react";
import apiService from "@/app/api/apiService";
import { downloadExcelFromJson } from "@/utils/exportUtils";
import { SectionCard } from "../mora-operativo/MoraOperativoUI";

const ExportarResumenGlobal = ({ empresaRut }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const res = await apiService.get(`/mora-dashboard/${empresaRut}/deuda-por-institucion`);
        const enriquecido = res.data.data.map((item) => {
          const porcentaje =
            item.deuda > 0 ? ((item.recuperado / item.deuda) * 100).toFixed(2) : "0.00";

          return {
            Institución: item.entidad,
            "Deuda Total": item.deuda,
            Recuperado: item.recuperado,
            "% Recuperado": porcentaje,
          };
        });
        setData(enriquecido);
      } catch (err) {
        console.error("❌ Error cargando resumen global:", err);
      }
    };

    if (empresaRut) fetchResumen();
  }, [empresaRut]);

  const handleExport = () => {
    downloadExcelFromJson(data, "Resumen Instituciones", "resumen_global_instituciones");
  };

  if (!data.length) return null;

  return (
    <SectionCard>
      <div className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
            <RiFileExcel2Line className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-xl font-semibold text-slate-950">Exportación consolidada</h3>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              Descarga un Excel con el resumen por institución.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex w-fit items-center gap-2 rounded-md border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-800 hover:bg-indigo-50"
        >
          <RiDownloadLine className="h-4 w-4" aria-hidden="true" />
          Exportar Excel
        </button>
      </div>
    </SectionCard>
  );
};

export default ExportarResumenGlobal;
