"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DateRangePicker } from "@tremor/react";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import ServiceTimeline from "@/components/servicios/ServiceTimeline";
import DashboardMoraAnaliticoSkeleton from "@/components/skeleton/DashboardMoraAnaliticoSkeleton";
import { RiBuildingLine, RiCalendarLine } from "@remixicon/react";

const MoraGestionesDashboard = () => {
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [empresaInput, setEmpresaInput] = useState("");
  const lastEmpresaLabel = useRef("");
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
    lastEmpresaLabel.current = label;
  }, [empresaOptions, empresaSeleccionada]);

  const handleEmpresaInputChange = useCallback(
    (value) => {
      setEmpresaInput(value);
      const normalized = value.trim().toLowerCase();
      if (!normalized) {
        setEmpresaSeleccionada("");
        return;
      }

      const byLabel = empresaOptions.find((option) => option.label.toLowerCase() === normalized);
      if (byLabel) {
        if (byLabel.rut !== empresaSeleccionada) {
          setEmpresaSeleccionada(byLabel.rut);
        }
        if (value !== byLabel.label) {
          setEmpresaInput(byLabel.label);
        }
        lastEmpresaLabel.current = byLabel.label;
        return;
      }

      const normalizedRut = normalized.replace(/[^\dk]/gi, "");
      const byRut = empresaOptions.find(
        (option) => option.rutNormalized === normalizedRut
      );
      if (byRut) {
        if (byRut.rut !== empresaSeleccionada) {
          setEmpresaSeleccionada(byRut.rut);
        }
        setEmpresaInput(byRut.label);
        lastEmpresaLabel.current = byRut.label;
      }
    },
    [empresaOptions, empresaSeleccionada]
  );

  const handleEmpresaFocus = useCallback(() => {
    setEmpresaInput("");
  }, []);

  const handleEmpresaBlur = useCallback(() => {
    if (!empresaInput) {
      setEmpresaInput(lastEmpresaLabel.current || "");
    }
  }, [empresaInput]);

  if (loadingEmpresas && !empresaSeleccionada) {
    return <DashboardMoraAnaliticoSkeleton />;
  }

  return (
    <div className="theme-mora">
      <main className="dashboard-gradient min-h-screen px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-8">
          <section className="glass-panel rounded-[2.5rem] p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--theme-primary)]">
                  Gestiones
                </span>
                <h1 className="text-3xl font-semibold text-[color:var(--text-primary)] md:text-4xl">
                  Trazabilidad de gestiones
                </h1>
                <p className="text-sm text-[color:var(--text-secondary)] md:text-base">
                  Línea de tiempo con las gestiones realizadas y su estado actual.
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
                      handleEmpresaFocus();
                    }}
                    onBlur={handleEmpresaBlur}
                    list="mora-gestiones-empresas"
                    disabled={loadingEmpresas}
                  />
                  <datalist id="mora-gestiones-empresas">
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
            <ServiceTimeline
              empresaRut={empresaSeleccionada}
              serviceKey="mora"
              dateRange={dateRange}
            />
          ) : (
            <section className="rounded-3xl border border-white/70 bg-white/80 p-6 text-center shadow-sm backdrop-blur">
              <p className="text-sm text-[color:var(--text-secondary)]">
                Selecciona una empresa para visualizar la trazabilidad de gestiones.
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default MoraGestionesDashboard;
