"use client";

import React, { useState, useEffect } from "react";
import { Title, Flex, DateRangePicker, Divider } from "@tremor/react";
import useUserData from "@/hooks/useUserData";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import IndicadoresEjecutivos from "@/components/dashboard/mora-analitico/IndicadoresEjecutivos";
import StackedPorEstadoPrevired from "@/components/dashboard/mora-analitico/StackedPorEstadoPrevired";

import EvolucionRecuperacion from "@/components/dashboard/mora-analitico/EvolucionRecuperacion";
import TopTrabajadoresDeuda from "@/components/dashboard/mora-analitico/TopTrabajadoresDeuda";
import EntidadesMasRiesgosas from "@/components/dashboard/mora-analitico/EntidadesMasRiesgosas";

import ComparativoMensual from "@/components/dashboard/mora-analitico/ComparativoMensual";
import DistribucionRecuperadoTipo from "@/components/dashboard/mora-analitico/DistribucionRecuperadoTipo";
import CasosPorEstado from "@/components/dashboard/mora-analitico/CasosPorEstado";
import ExportarResumenGlobal from "@/components/dashboard/mora-analitico/ExportarResumenGlobal";
import InstitucionesConsolidado from "@/components/dashboard/mora-analitico/InstitucionesConsolidado";
import DistribucionEstadoDetalle from "@/components/dashboard/mora-analitico/DistribucionEstadoDetalle";
import DashboardMoraAnaliticoSkeleton from "@/components/skeleton/DashboardMoraAnaliticoSkeleton";

const PagexDashboard = () => {
  const { id } = useUserData();
  const { empresas, loading } = useEmpresasPermitidas();
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    if (empresas.length > 0 && !empresaSeleccionada) {
      setEmpresaSeleccionada(empresas[0].empresaRut);
    }
  }, [empresas]);

  if (loading || !empresaSeleccionada) return <DashboardMoraAnaliticoSkeleton />;

  return (
    <div className="p-6 space-y-8">
      <Flex justifyContent="between" alignItems="center">
        <Title>📊 Dashboard Analítico de Mora Presunta</Title>
        <DateRangePicker
          value={dateRange}
          onValueChange={setDateRange}
          enableClear
        />
      </Flex>

      {empresas.length > 1 && (
        <select
          className="p-2 border rounded"
          value={empresaSeleccionada || ""}
          onChange={(e) => setEmpresaSeleccionada(e.target.value)}
        >
          <option value="">Selecciona una Empresa</option>
          {empresas.map((emp) => (
            <option key={emp.empresaRut} value={emp.empresaRut}>
              {emp.nombre}
            </option>
          ))}
        </select>
      )}

      {empresaSeleccionada && (
        <>
          <IndicadoresEjecutivos
            empresaRut={empresaSeleccionada}
            iconSet="remix"
          />
          <Divider />

          <InstitucionesConsolidado empresaRut={empresaSeleccionada} />
          <Divider />

          <DistribucionEstadoDetalle empresaRut={empresaSeleccionada} />
          <Divider />

          <StackedPorEstadoPrevired empresaRut={empresaSeleccionada} />
          <Divider />

          <EntidadesMasRiesgosas empresaRut={empresaSeleccionada} />
          <Divider />

          <TopTrabajadoresDeuda empresaRut={empresaSeleccionada} />
          <Divider />

          <ComparativoMensual empresaRut={empresaSeleccionada} />
          <Divider />

          <DistribucionRecuperadoTipo empresaRut={empresaSeleccionada} />
          <Divider />

          <EvolucionRecuperacion empresaRut={empresaSeleccionada} />
          <Divider />

          <CasosPorEstado empresaRut={empresaSeleccionada} />
          <Divider />

          <ExportarResumenGlobal empresaRut={empresaSeleccionada} />
          <Divider />

          {/* Más bloques visuales aquí */}
        </>
      )}
    </div>
  );
};

export default PagexDashboard;
