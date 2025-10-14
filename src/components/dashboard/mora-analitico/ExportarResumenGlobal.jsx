"use client";

import { useState, useEffect } from "react";
import { Card, Title, Text, Button } from "@tremor/react";
import apiService from "@/app/api/apiService";
import { downloadExcelFromJson } from "@/utils/exportUtils";

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
    <Card>
      <div className="flex items-center justify-between mb-2">
        <div>
          <Title>📥 Exportación Consolidada</Title>
          <Text className="text-sm text-gray-500">
            Descarga un Excel con el resumen por institución.
          </Text>
        </div>
        <Button onClick={handleExport}>Exportar como Excel</Button>
      </div>
    </Card>
  );
};

export default ExportarResumenGlobal;