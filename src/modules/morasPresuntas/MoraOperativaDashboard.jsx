"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardHeader, DashboardContext, DashboardBody, DashboardFilters, DashboardPeriodFilter, DashboardStatus, dashboardFieldClass, dashboardControlClass } from "@/components/dashboard/ServiceDashboardLayout";
import DashboardYearSelect from "@/components/dashboard/DashboardYearSelect";
import { getDashboardYearRange } from "@/services/dashboardYear.mjs";
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
  RiFilterLine,
  RiStackLine,
} from "@remixicon/react";

const MoraOperativaDashboard = () => {
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [empresaInput, setEmpresaInput] = useState("");
  const lastEmpresaLabel = useRef("");

  const [entidadesDisponibles, setEntidadesDisponibles] = useState([]);
  const [entidadSeleccionada, setEntidadSeleccionada] = useState("");
  const [cargandoEntidades, setCargandoEntidades] = useState(false);
  const [year, setYear] = useState("");
  const [manualDateRange, setManualDateRange] = useState({ from: undefined, to: undefined });
  const dateRange = useMemo(() => getDashboardYearRange(year) || manualDateRange, [year, manualDateRange]);

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
    if (year) {
      filtros.push({ etiqueta: "Año", valor: year });
    } else if (manualDateRange?.from || manualDateRange?.to) {
      const inicio = manualDateRange?.from?.toLocaleDateString("es-CL") || "-";
      const fin = manualDateRange?.to?.toLocaleDateString("es-CL") || "-";
      filtros.push({ etiqueta: "Periodo", valor: `${inicio} → ${fin}` });
    }
    return filtros;
  }, [entidadSeleccionada, year, manualDateRange, entidadesDisponibles]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <DashboardHeader kind="Dashboard Operativo" title="Mora presunta por empresa" description="Prioriza entidades, gestiones y seguimiento de recuperaciones desde una vista de trabajo diaria.">
        <DashboardContext><RiBuildingLine className="h-4 w-4" />{empresaSeleccionada || "Sin empresa seleccionada"}</DashboardContext>
        <DashboardContext><RiStackLine className="h-4 w-4" />{entidadesDisponibles.length} entidades</DashboardContext>
      </DashboardHeader>
      <DashboardBody>
          <DashboardFilters footer={<>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                  setYear("");
                  setManualDateRange({ from: undefined, to: undefined });
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
          </>}>
              <label className={dashboardFieldClass}>
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

              <DashboardYearSelect serviceKey="mora" empresaRut={empresaSeleccionada} enabled={Boolean(empresaSeleccionada)}
                value={year}
                className="min-w-0 [&_select]:min-h-[42px]"
                customRange={!year && Boolean(manualDateRange?.from || manualDateRange?.to)}
                onChange={(value) => {
                  setYear(value);
                  setManualDateRange({ from: undefined, to: undefined });
                }}
              />

              <DashboardPeriodFilter value={manualDateRange} onChange={(value) => {
                setYear("");
                setManualDateRange(value);
              }} />

              <label className={dashboardFieldClass}>
                <span className="text-[11px] font-semibold uppercase text-slate-500">Entidad</span>
                <select
                  className={dashboardControlClass}
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
          </DashboardFilters>

          {loadingEmpresas && !empresaSeleccionada ? (
            <DashboardMoraAnaliticoSkeleton />
          ) : empresaSeleccionada ? (
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

              <TopTrabajadoresDeuda empresaRut={empresaSeleccionada} dateRange={dateRange} />

              <DistribucionRecuperadoTipo empresaRut={empresaSeleccionada} dateRange={dateRange} />

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

              <ExportarResumenGlobal empresaRut={empresaSeleccionada} dateRange={dateRange} />
            </div>
          ) : (
            <DashboardStatus>Selecciona una empresa para visualizar indicadores operativos.</DashboardStatus>
          )}
      </DashboardBody>
    </main>
  );
};

export default MoraOperativaDashboard;
