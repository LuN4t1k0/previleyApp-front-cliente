"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DateRangePicker } from "@tremor/react";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import apiService from "@/app/api/apiService";
import IndicadoresOperativos from "@/components/dashboard/mora-operativo/IndicadoresOperativos";
import DistribucionEstadoOperativo from "@/components/dashboard/mora-operativo/DistribucionEstadoOperativo";
import DistribucionMotivoOperativo from "@/components/dashboard/mora-operativo/DistribucionMotivoOperativo";
import DistribucionEntidadOperativo from "@/components/dashboard/mora-operativo/DistribucionEntidadOperativo";
import PendienteOperativoDetalle from "@/components/dashboard/mora-operativo/PendienteOperativoDetalle";
import PlanAccionOperativo from "@/components/dashboard/mora-operativo/PlanAccionOperativo";
import HistoricoOperativo from "@/components/dashboard/mora-operativo/HistoricoOperativo";
import ResumenCasosOperativos from "@/components/dashboard/mora-operativo/ResumenCasosOperativos";
import InstitucionesOperativo from "@/components/dashboard/mora-operativo/InstitucionesOperativo";
import TopTrabajadoresDeuda from "@/components/dashboard/mora-analitico/TopTrabajadoresDeuda";
import DistribucionRecuperadoTipo from "@/components/dashboard/mora-analitico/DistribucionRecuperadoTipo";
import ExportarResumenGlobal from "@/components/dashboard/mora-analitico/ExportarResumenGlobal";
import DashboardMoraAnaliticoSkeleton from "@/components/skeleton/DashboardMoraAnaliticoSkeleton";
import {
  RiBuildingLine,
  RiCalendarLine,
  RiFilterLine,
  RiStackLine,
} from "@remixicon/react";

const SectionPanel = ({ children, className = "" }) => (
  <section className={`rounded-lg border border-indigo-200 bg-white p-5 shadow-sm ${className}`}>
    {children}
  </section>
);

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
  }, [empresaSeleccionada, entidadSeleccionada]);

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

  const surface = "rounded-lg border border-indigo-200 bg-white p-5 text-center shadow-sm";

  return (
    <main className="min-h-screen bg-[#f6f6ff] text-slate-950">
      <header className="border-b border-indigo-100 bg-[#f6f6ff]">
        <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-5 px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                <span className="text-[11px] font-semibold uppercase text-emerald-700">
                  Dashboard Operativo
                </span>
              </div>
              <h1 className="text-3xl font-semibold text-slate-950 md:text-4xl">
                Mora presunta por empresa
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Prioriza entidades, gestiones y seguimiento de recuperaciones desde una vista de
                trabajo diaria.
              </p>
            </div>

            <div className="grid gap-3 text-sm font-medium text-slate-700 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-white px-4 py-2.5 shadow-sm">
                <RiBuildingLine className="h-4 w-4 text-slate-500" aria-hidden="true" />
                <span>{empresaSeleccionada || "Sin empresa seleccionada"}</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-white px-4 py-2.5 shadow-sm">
                <RiStackLine className="h-4 w-4 text-slate-500" aria-hidden="true" />
                <span>{entidadesDisponibles.length} entidades</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-6">
          <SectionPanel>
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(300px,1fr)_minmax(380px,1.15fr)_minmax(260px,0.9fr)]">
              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase text-slate-500">Empresa</span>
                <div className="relative flex min-h-[42px] items-center gap-3 rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm">
                  <RiBuildingLine className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder={loadingEmpresas ? "Cargando empresas..." : "Busca por nombre o RUT"}
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 placeholder:text-slate-400 outline-none"
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
              </label>

              <fieldset className="flex flex-col gap-2">
                <legend className="text-[11px] font-semibold uppercase text-slate-500">Periodo</legend>
                <div className="flex min-h-[42px] items-center gap-3 rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm">
                  <RiCalendarLine className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
                  <DateRangePicker
                    value={dateRange}
                    onValueChange={setDateRange}
                    enableClear
                    className="min-w-0 flex-1"
                  />
                </div>
              </fieldset>

              <label className="flex flex-col gap-2 lg:col-span-2 xl:col-span-1">
                <span className="text-[11px] font-semibold uppercase text-slate-500">Entidad</span>
                <select
                  className="min-h-[42px] rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none disabled:bg-slate-100 disabled:text-slate-400"
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
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-indigo-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
                <RiFilterLine className="h-5 w-5 text-slate-500" aria-hidden="true" />
                <span>Filtros activos:</span>
                {filtrosActivos.length === 0 ? (
                  <span>Sin filtros adicionales aplicados.</span>
                ) : null}
              </div>

              <button
                type="button"
                className="w-fit rounded-md border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-800 hover:border-indigo-500 hover:bg-indigo-50"
                onClick={() => {
                  setEntidadSeleccionada("");
                  setDateRange({ from: undefined, to: undefined });
                }}
              >
                Limpiar filtros
              </button>
            </div>

            {filtrosActivos.length > 0 ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {filtrosActivos.map((filtro) => (
                  <span
                    key={filtro.etiqueta}
                    className="inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-950"
                  >
                    {filtro.etiqueta}: {filtro.valor}
                  </span>
                ))}
              </div>
            ) : null}
          </SectionPanel>

          {empresaSeleccionada ? (
            <div className="space-y-6">
              <IndicadoresOperativos
                empresaRut={empresaSeleccionada}
                entidadId={entidadSeleccionada || undefined}
                dateRange={dateRange}
              />

              <PendienteOperativoDetalle
                empresaRut={empresaSeleccionada}
                entidadId={entidadSeleccionada || undefined}
                dateRange={dateRange}
                onSelectEntidad={(valor) => setEntidadSeleccionada(String(valor))}
              />

              <InstitucionesOperativo
                empresaRut={empresaSeleccionada}
                entidadId={entidadSeleccionada || undefined}
                dateRange={dateRange}
              />

              <PlanAccionOperativo
                empresaRut={empresaSeleccionada}
                entidadId={entidadSeleccionada || undefined}
                dateRange={dateRange}
              />

              <DistribucionEstadoOperativo
                empresaRut={empresaSeleccionada}
                entidadId={entidadSeleccionada || undefined}
                dateRange={dateRange}
              />

              <DistribucionMotivoOperativo
                empresaRut={empresaSeleccionada}
                entidadId={entidadSeleccionada || undefined}
                dateRange={dateRange}
              />

              <DistribucionEntidadOperativo
                empresaRut={empresaSeleccionada}
                entidadId={entidadSeleccionada || undefined}
                dateRange={dateRange}
              />

              <TopTrabajadoresDeuda empresaRut={empresaSeleccionada} />

              <DistribucionRecuperadoTipo empresaRut={empresaSeleccionada} />

              <HistoricoOperativo
                empresaRut={empresaSeleccionada}
                entidadId={entidadSeleccionada || undefined}
                dateRange={dateRange}
              />

              <ResumenCasosOperativos
                empresaRut={empresaSeleccionada}
                entidadId={entidadSeleccionada || undefined}
                dateRange={dateRange}
              />

              <ExportarResumenGlobal empresaRut={empresaSeleccionada} />
            </div>
          ) : (
            <section className={surface}>
              <p className="text-sm text-slate-500">
                Selecciona una empresa para visualizar indicadores operativos.
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
};

export default MoraOperativaDashboard;
