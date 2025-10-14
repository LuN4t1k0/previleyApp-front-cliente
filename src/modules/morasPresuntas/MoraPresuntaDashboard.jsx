"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DateRangePicker } from "@tremor/react";
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
import { RiBuildingLine, RiCalendarLine } from "@remixicon/react";

const MoraPresuntaDashboard = () => {
  useUserData(); // mantenemos la carga de datos del usuario por consistencia
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();

  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [empresaInput, setEmpresaInput] = useState("");
  const lastValidLabelRef = useRef("");
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });

  const empresaOptions = useMemo(
    () =>
      (empresas || [])
        .map((empresa) => ({
          rut: empresa.empresaRut,
          nombre: empresa.nombre,
          label: `${empresa.nombre} (${empresa.empresaRut})`,
          rutNormalized: empresa.empresaRut.replace(/[^\dk]/gi, "").toLowerCase(),
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "es")),
    [empresas]
  );

  useEffect(() => {
    if (empresaOptions.length > 0 && !empresaSeleccionada) {
      setEmpresaSeleccionada(empresaOptions[0].rut);
    }
  }, [empresaOptions, empresaSeleccionada]);

  useEffect(() => {
    const match = empresaOptions.find((option) => option.rut === empresaSeleccionada);
    const label = match ? match.label : "";
    setEmpresaInput(label);
    lastValidLabelRef.current = label;
  }, [empresaOptions, empresaSeleccionada]);

  const handleEmpresaInputChange = useCallback(
    (value) => {
      setEmpresaInput(value);
      const normalizedValue = value.trim().toLowerCase();
      if (!normalizedValue) {
        setEmpresaSeleccionada("");
        return;
      }

      const matchByLabel = empresaOptions.find(
        (option) => option.label.toLowerCase() === normalizedValue
      );
      if (matchByLabel) {
        if (matchByLabel.rut !== empresaSeleccionada) {
          setEmpresaSeleccionada(matchByLabel.rut);
        }
        if (matchByLabel.label !== value) {
          setEmpresaInput(matchByLabel.label);
        }
        lastValidLabelRef.current = matchByLabel.label;
        return;
      }

      const normalizedRut = normalizedValue.replace(/[^\dk]/gi, "");
      const matchByRut = empresaOptions.find(
        (option) => option.rutNormalized === normalizedRut
      );
      if (matchByRut) {
        if (matchByRut.rut !== empresaSeleccionada) {
          setEmpresaSeleccionada(matchByRut.rut);
        }
        setEmpresaInput(matchByRut.label);
        lastValidLabelRef.current = matchByRut.label;
      }
    },
    [empresaOptions, empresaSeleccionada]
  );

  const handleEmpresaInputFocus = useCallback(() => {
    setEmpresaInput("");
  }, []);

  const handleEmpresaInputBlur = useCallback(() => {
    if (!empresaInput) {
      setEmpresaInput(lastValidLabelRef.current || "");
    }
  }, [empresaInput]);

  if (loadingEmpresas && !empresaSeleccionada) {
    return <DashboardMoraAnaliticoSkeleton />;
  }

  const surface =
    "rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur";

  return (
    <div className="theme-mora">
      <main className="dashboard-gradient min-h-screen px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <section className="rounded-3xl border border-white/60 bg-white/65 p-6 shadow-elevated backdrop-blur md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--theme-primary)]">
                  Panel Mora Presunta
                </span>
                <h1 className="text-3xl font-semibold text-[color:var(--text-primary)] md:text-4xl">
                  Dashboard analítico operativo
                </h1>
                <p className="text-sm text-[color:var(--text-secondary)] md:text-base">
                  Monitorea recuperaciones, estados y focos de riesgo para cada empresa autorizada.
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex min-w-[260px] flex-1 items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-2 text-sm shadow-sm">
                  <RiBuildingLine className="h-5 w-5 text-[color:var(--theme-primary)]" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder={
                      loadingEmpresas ? "Cargando empresas..." : "Busca por nombre o RUT"
                    }
                    className="flex-1 bg-transparent text-sm text-[color:var(--text-primary)] placeholder:text-gray-400 outline-none"
                    value={empresaInput}
                    onChange={(event) => handleEmpresaInputChange(event.target.value)}
                    onFocus={(event) => {
                      event.target.select();
                      handleEmpresaInputFocus();
                    }}
                    onBlur={handleEmpresaInputBlur}
                    list="empresas-mora-options"
                    disabled={loadingEmpresas}
                  />
                  <datalist id="empresas-mora-options">
                    {empresaOptions.map((empresa) => (
                      <option key={empresa.rut} value={empresa.label} />
                    ))}
                  </datalist>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-2 text-sm shadow-sm">
                  <RiCalendarLine className="h-5 w-5 text-[color:var(--theme-primary)]" aria-hidden="true" />
                  <DateRangePicker
                    value={dateRange}
                    onValueChange={setDateRange}
                    enableClear
                    className="min-w-[220px]"
                  />
                </div>
              </div>
            </div>
          </section>

          {empresaSeleccionada ? (
            <div className="space-y-8">
              <section className={surface}>
                <IndicadoresEjecutivos empresaRut={empresaSeleccionada} iconSet="remix" />
              </section>

              <section className={surface}>
                <InstitucionesConsolidado empresaRut={empresaSeleccionada} />
              </section>

              <section className={surface}>
                <DistribucionEstadoDetalle empresaRut={empresaSeleccionada} />
              </section>

              <section className={surface}>
                <StackedPorEstadoPrevired empresaRut={empresaSeleccionada} />
              </section>

              <section className={surface}>
                <EntidadesMasRiesgosas empresaRut={empresaSeleccionada} />
              </section>

              <section className={surface}>
                <TopTrabajadoresDeuda empresaRut={empresaSeleccionada} />
              </section>

              <section className={surface}>
                <ComparativoMensual empresaRut={empresaSeleccionada} />
              </section>

              <section className={surface}>
                <DistribucionRecuperadoTipo empresaRut={empresaSeleccionada} />
              </section>

              <section className={surface}>
                <EvolucionRecuperacion empresaRut={empresaSeleccionada} />
              </section>

              <section className={surface}>
                <CasosPorEstado empresaRut={empresaSeleccionada} />
              </section>

              <section className={surface}>
                <ExportarResumenGlobal empresaRut={empresaSeleccionada} />
              </section>
            </div>
          ) : (
            <section className={`${surface} text-center`}>
              <p className="text-sm text-[color:var(--text-secondary)]">
                Selecciona una empresa para visualizar indicadores de mora.
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default MoraPresuntaDashboard;
