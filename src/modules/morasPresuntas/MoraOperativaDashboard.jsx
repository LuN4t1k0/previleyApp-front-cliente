"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DateRangePicker } from "@tremor/react";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import apiService from "@/app/api/apiService";
import IndicadoresOperativos from "@/components/dashboard/mora-operativo/IndicadoresOperativos";
import DistribucionEstadoOperativo from "@/components/dashboard/mora-operativo/DistribucionEstadoOperativo";
import DistribucionMotivoOperativo from "@/components/dashboard/mora-operativo/DistribucionMotivoOperativo";
import DistribucionEntidadOperativo from "@/components/dashboard/mora-operativo/DistribucionEntidadOperativo";
import PriorizacionEntidades from "@/components/dashboard/mora-operativo/PriorizacionEntidades";
import PriorizacionGestiones from "@/components/dashboard/mora-operativo/PriorizacionGestiones";
import HistoricoOperativo from "@/components/dashboard/mora-operativo/HistoricoOperativo";
import ResumenCasosOperativos from "@/components/dashboard/mora-operativo/ResumenCasosOperativos";
import InstitucionesOperativo from "@/components/dashboard/mora-operativo/InstitucionesOperativo";
import TopTrabajadoresDeuda from "@/components/dashboard/mora-analitico/TopTrabajadoresDeuda";
import DistribucionRecuperadoTipo from "@/components/dashboard/mora-analitico/DistribucionRecuperadoTipo";
import ExportarResumenGlobal from "@/components/dashboard/mora-analitico/ExportarResumenGlobal";
import DashboardMoraAnaliticoSkeleton from "@/components/skeleton/DashboardMoraAnaliticoSkeleton";
import ServiceTimeline from "@/components/servicios/ServiceTimeline";
import {
  RiBuildingLine,
  RiCalendarLine,
  RiFilterLine,
} from "@remixicon/react";

const MoraOperativaDashboard = () => {
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [empresaInput, setEmpresaInput] = useState("");
  const lastEmpresaLabel = useRef("");

  const [entidadesDisponibles, setEntidadesDisponibles] = useState([]);
  const [entidadSeleccionada, setEntidadSeleccionada] = useState("");
  const [cargandoEntidades, setCargandoEntidades] = useState(false);
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

  useEffect(() => {
    const fetchEntidades = async () => {
      if (!empresaSeleccionada) {
        setEntidadesDisponibles([]);
        setEntidadSeleccionada("");
        return;
      }

      try {
        setCargandoEntidades(true);
        const res = await apiService.get(
          `/mora-dashboard/operativo/distribucion-estado-por-entidad`,
          { params: { empresaRut: empresaSeleccionada } }
        );
        const data = res.data.data || [];
        const vistos = new Set();
        const opciones = [];

        data.forEach((item) => {
          if (!item.entidadId || vistos.has(item.entidadId)) return;
          vistos.add(item.entidadId);
          opciones.push({
            value: String(item.entidadId),
            label: item.entidadNombre || item.entidad || "Entidad sin nombre",
          });
        });

        setEntidadesDisponibles(opciones.sort((a, b) => a.label.localeCompare(b.label, "es")));
        if (!opciones.find((op) => op.value === entidadSeleccionada)) {
          setEntidadSeleccionada("");
        }
      } catch (error) {
        console.error("Error cargando entidades disponibles", error);
        setEntidadesDisponibles([]);
        setEntidadSeleccionada("");
      } finally {
        setCargandoEntidades(false);
      }
    };

    fetchEntidades();
  }, [empresaSeleccionada]);

  const filtrosActivos = useMemo(() => {
    const filtros = [];
    if (entidadSeleccionada) {
      const match = entidadesDisponibles.find((item) => item.value === entidadSeleccionada);
      filtros.push({ etiqueta: "Entidad", valor: match?.label || entidadSeleccionada });
    }
    if (dateRange?.from || dateRange?.to) {
      const inicio = dateRange?.from?.toLocaleDateString("es-CL") || "-";
      const fin = dateRange?.to?.toLocaleDateString("es-CL") || "-";
      filtros.push({ etiqueta: "Periodo", valor: `${inicio} → ${fin}` });
    }
    return filtros;
  }, [entidadSeleccionada, dateRange, entidadesDisponibles]);

  if (loadingEmpresas && !empresaSeleccionada) {
    return <DashboardMoraAnaliticoSkeleton />;
  }

  const surface =
    "rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur";

  return (
    <div className="theme-mora">
      <main className="dashboard-gradient min-h-screen px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-8">
          <section className="glass-panel rounded-[2.5rem] p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--theme-primary)]">
                  Panel operativo
                </span>
                <h1 className="text-3xl font-semibold text-[color:var(--text-primary)] md:text-4xl">
                  Dashboard operativo de mora presunta
                </h1>
                <p className="text-sm text-[color:var(--text-secondary)] md:text-base">
                  Prioriza entidades, gestiones y seguimiento de recuperaciones en tiempo real.
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
                    list="mora-operativo-empresas"
                    disabled={loadingEmpresas}
                  />
                  <datalist id="mora-operativo-empresas">
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

          <section className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 text-sm font-semibold text-[color:var(--text-primary)]">
                <RiFilterLine className="h-5 w-5 text-[color:var(--theme-primary)]" aria-hidden="true" />
                <span>Filtros activos</span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  className="min-w-[240px] rounded-2xl border border-white/70 bg-white/95 px-3 py-2 text-sm text-[color:var(--text-primary)] shadow-sm"
                  value={entidadSeleccionada}
                  onChange={(event) => setEntidadSeleccionada(event.target.value)}
                  disabled={cargandoEntidades || entidadesDisponibles.length === 0}
                >
                  <option value="">
                    {cargandoEntidades ? "Cargando entidades..." : "Todas las entidades"}
                  </option>
                  {entidadesDisponibles.map((entidad) => (
                    <option key={entidad.value} value={entidad.value}>
                      {entidad.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="text-xs font-semibold text-[color:var(--theme-primary)] hover:underline"
                  onClick={() => {
                    setEntidadSeleccionada("");
                    setDateRange({ from: undefined, to: undefined });
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            </div>

            {filtrosActivos.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {filtrosActivos.map((filtro) => (
                  <span
                    key={filtro.etiqueta}
                    className="inline-flex items-center rounded-full bg-[color:var(--theme-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--theme-primary)]"
                  >
                    {filtro.etiqueta}: {filtro.valor}
                  </span>
                ))}
              </div>
            )}
          </section>

          {empresaSeleccionada ? (
            <div className="space-y-8">
              <section className={surface}>
                <IndicadoresOperativos
                  empresaRut={empresaSeleccionada}
                  entidadId={entidadSeleccionada || undefined}
                  dateRange={dateRange}
                />
              </section>

              <section className={surface}>
                <InstitucionesOperativo
                  empresaRut={empresaSeleccionada}
                  entidadId={entidadSeleccionada || undefined}
                  dateRange={dateRange}
                />
              </section>

              <section className={surface}>
                <DistribucionEstadoOperativo
                  empresaRut={empresaSeleccionada}
                  entidadId={entidadSeleccionada || undefined}
                  dateRange={dateRange}
                />
              </section>

              <section className={surface}>
                <DistribucionMotivoOperativo
                  empresaRut={empresaSeleccionada}
                  entidadId={entidadSeleccionada || undefined}
                  dateRange={dateRange}
                />
              </section>

              <section className={surface}>
                <DistribucionEntidadOperativo
                  empresaRut={empresaSeleccionada}
                  entidadId={entidadSeleccionada || undefined}
                  dateRange={dateRange}
                />
              </section>

              <section className={surface}>
                <PriorizacionGestiones
                  empresaRut={empresaSeleccionada}
                  entidadId={entidadSeleccionada || undefined}
                  dateRange={dateRange}
                  onSelectGestion={(gestion) => {
                    if (gestion?.entidadId) {
                      setEntidadSeleccionada(String(gestion.entidadId));
                    }
                  }}
                />
              </section>

              <section className={surface}>
                <PriorizacionEntidades
                  empresaRut={empresaSeleccionada}
                  entidadId={entidadSeleccionada || undefined}
                  dateRange={dateRange}
                  onSelectEntidad={(valor) => setEntidadSeleccionada(String(valor))}
                />
              </section>

              <section className={surface}>
                <TopTrabajadoresDeuda empresaRut={empresaSeleccionada} />
              </section>

              <section className={surface}>
                <DistribucionRecuperadoTipo empresaRut={empresaSeleccionada} />
              </section>

              <section className={surface}>
                <HistoricoOperativo
                  empresaRut={empresaSeleccionada}
                  entidadId={entidadSeleccionada || undefined}
                  dateRange={dateRange}
                />
              </section>

              <ServiceTimeline
                empresaRut={empresaSeleccionada}
                serviceKey="mora"
                dateRange={dateRange}
              />

              <section className={surface}>
                <ResumenCasosOperativos
                  empresaRut={empresaSeleccionada}
                  entidadId={entidadSeleccionada || undefined}
                  dateRange={dateRange}
                />
              </section>

              <section className={surface}>
                <ExportarResumenGlobal empresaRut={empresaSeleccionada} />
              </section>
            </div>
          ) : (
            <section className={`${surface} text-center`}>
              <p className="text-sm text-[color:var(--text-secondary)]">
                Selecciona una empresa para visualizar indicadores operativos.
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default MoraOperativaDashboard;
