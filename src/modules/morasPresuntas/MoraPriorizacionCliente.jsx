"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RiBuildingLine,
  RiCalendarLine,
  RiFileList3Line,
  RiListOrdered,
  RiMoneyDollarCircleLine,
  RiScales3Line,
} from "@remixicon/react";
import apiService from "@/app/api/apiService";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import { RiskPill, SectionCard, SectionHeader } from "@/components/dashboard/mora-operativo/MoraOperativoUI";

const clpFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const formatCLP = (value) => clpFormatter.format(Number(value || 0));
const formatNumber = (value) => Number(value || 0).toLocaleString("es-CL");

const getCurrentPeriodo = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const ordenarPrioridades = (items) =>
  [...items].sort((a, b) => {
    const ordenA = Number(a?.ordenActual || a?.ordenManual || 0);
    const ordenB = Number(b?.ordenActual || b?.ordenManual || 0);
    if (ordenA && ordenB) return ordenA - ordenB;
    if (ordenA) return -1;
    if (ordenB) return 1;
    return Number(b?.deudaPendiente || 0) - Number(a?.deudaPendiente || 0);
  });

const MoraPriorizacionCliente = () => {
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const [empresaRut, setEmpresaRut] = useState("");
  const [periodo, setPeriodo] = useState(() => getCurrentPeriodo());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const empresaOptions = useMemo(
    () =>
      (empresas || [])
        .map((empresa) => ({
          rut: empresa.empresaRut,
          label: `${empresa.nombre || empresa.empresaRut} (${empresa.empresaRut})`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "es")),
    [empresas]
  );

  const empresaRutActiva = empresaRut || empresaOptions[0]?.rut || "";

  useEffect(() => {
    const fetchPrioridades = async () => {
      if (!empresaRutActiva) {
        setItems([]);
        return;
      }

      try {
        setLoading(true);
        const res = await apiService.get("/prioridad-gestion-mora", {
          params: { empresaRut: empresaRutActiva, periodo },
        });
        setItems(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch (error) {
        console.error("Error cargando priorización cliente:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrioridades();
  }, [empresaRutActiva, periodo]);

  const prioridades = useMemo(() => ordenarPrioridades(items), [items]);

  const resumen = useMemo(() => {
    const totalPendiente = prioridades.reduce(
      (acc, item) => acc + Number(item.deudaPendiente || 0),
      0
    );
    const totalJudicial = prioridades.reduce(
      (acc, item) => acc + Number(item.montoJudicial || 0),
      0
    );
    const casosJudiciales = prioridades.reduce(
      (acc, item) => acc + Number(item.casosJudiciales || 0),
      0
    );
    const manuales = prioridades.filter(
      (item) => String(item.origenPrioridad || "").toLowerCase() === "manual"
    ).length;

    return {
      totalPendiente,
      totalJudicial,
      casosJudiciales,
      manuales,
      sugeridas: Math.max(0, prioridades.length - manuales),
    };
  }, [prioridades]);

  return (
    <main className="min-h-screen bg-[#f6f6ff] text-slate-950">
      <header className="border-b border-indigo-100 bg-[#f6f6ff]">
        <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-5 px-4 py-7 sm:px-6 lg:px-8">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              <span className="text-[11px] font-semibold uppercase text-emerald-700">
                Mora presunta
              </span>
            </div>
            <h1 className="text-3xl font-semibold text-slate-950 md:text-4xl">
                Plan de trabajo
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Consulta el orden vigente de focos pendientes definido para el periodo.
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-6">
          <section className="rounded-lg border border-indigo-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(320px,1fr)_220px]">
              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase text-slate-500">Empresa</span>
                <div className="flex min-h-[42px] items-center gap-3 rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm">
                  <RiBuildingLine className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  <select
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none"
                    value={empresaRutActiva}
                    disabled={loadingEmpresas || loading || empresaOptions.length === 0}
                    onChange={(event) => setEmpresaRut(event.target.value)}
                  >
                    {empresaOptions.map((empresa) => (
                      <option key={empresa.rut} value={empresa.rut}>
                        {empresa.label}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase text-slate-500">Periodo</span>
                <div className="flex min-h-[42px] items-center gap-3 rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm">
                  <RiCalendarLine className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  <input
                    type="month"
                    value={periodo}
                    disabled={loading}
                    onChange={(event) => setPeriodo(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none"
                  />
                </div>
              </label>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-lg border border-indigo-200 bg-white p-5 shadow-sm">
              <RiListOrdered className="h-5 w-5 text-indigo-700" aria-hidden="true" />
              <p className="mt-4 text-[11px] font-semibold uppercase text-slate-500">
                Prioridades
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {formatNumber(prioridades.length)}
              </p>
            </article>
            <article className="rounded-lg border border-indigo-200 bg-white p-5 shadow-sm">
              <RiMoneyDollarCircleLine className="h-5 w-5 text-emerald-700" aria-hidden="true" />
              <p className="mt-4 text-[11px] font-semibold uppercase text-slate-500">
                Pendiente priorizado
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {formatCLP(resumen.totalPendiente)}
              </p>
            </article>
            <article className="rounded-lg border border-red-200 bg-red-50 p-5 shadow-sm">
              <RiScales3Line className="h-5 w-5 text-red-800" aria-hidden="true" />
              <p className="mt-4 text-[11px] font-semibold uppercase text-red-900">
                Judicial pendiente
              </p>
              <p className="mt-2 text-2xl font-semibold text-red-950">
                {formatNumber(resumen.casosJudiciales)} casos
              </p>
              <p className="mt-2 text-sm text-red-900">{formatCLP(resumen.totalJudicial)}</p>
            </article>
            <article className="rounded-lg border border-indigo-200 bg-white p-5 shadow-sm">
              <RiFileList3Line className="h-5 w-5 text-slate-700" aria-hidden="true" />
              <p className="mt-4 text-[11px] font-semibold uppercase text-slate-500">
                Origen del orden
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {resumen.manuales ? `${formatNumber(resumen.manuales)} manuales` : "Sugerido"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {formatNumber(resumen.sugeridas)} mantienen orden automático.
              </p>
            </article>
          </section>

          <SectionCard>
            <SectionHeader
              title="Detalle del plan de trabajo"
              description="Vista solo lectura del orden vigente de gestiones priorizadas."
              badge={`${formatNumber(prioridades.length)} gestiones`}
              icon={RiFileList3Line}
            />

            <div className="overflow-x-auto border-t border-indigo-100">
              {loading ? (
                <div className="px-5 py-12 text-center text-sm text-slate-500">
                  Cargando priorización...
                </div>
              ) : !prioridades.length ? (
                <div className="px-5 py-12 text-center text-sm text-slate-500">
                  No hay gestiones priorizadas para el periodo seleccionado.
                </div>
              ) : (
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Orden</th>
                      <th className="px-5 py-4">Gestión</th>
                      <th className="px-5 py-4">Entidad</th>
                      <th className="px-5 py-4 text-right">Pendiente</th>
                      <th className="px-5 py-4 text-right">Judicial</th>
                      <th className="px-5 py-4">Riesgo</th>
                      <th className="px-5 py-4">Origen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-100">
                    {prioridades.map((item, index) => (
                      <tr key={item.gestionMoraId} className="bg-white">
                        <td className="px-5 py-4 font-semibold text-slate-950">{index + 1}</td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-950">
                            {item.folio || `Gestión #${item.gestionMoraId}`}
                          </p>
                          <p className="mt-1 text-xs font-semibold uppercase text-slate-400">
                            {item.estadoGestion || "sin estado"}
                          </p>
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-700">
                          {item.entidadNombre || "Entidad sin nombre"}
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-slate-950">
                          {formatCLP(item.deudaPendiente)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="font-semibold text-red-950">
                            {formatNumber(item.casosJudiciales)} casos
                          </p>
                          <p className="mt-1 text-xs text-red-700">{formatCLP(item.montoJudicial)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <RiskPill level={item.nivelRiesgo} />
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase text-indigo-800">
                            {item.origenPrioridad || "sugerida"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
};

export default MoraPriorizacionCliente;
