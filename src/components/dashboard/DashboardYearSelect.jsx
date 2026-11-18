"use client";

import { useEffect, useState } from "react";
import apiService from "@/app/api/apiService";
import { normalizeDashboardYears } from "@/services/dashboardYear.mjs";
import { dashboardControlClass, dashboardFieldClass } from "./ServiceDashboardLayout";

export default function DashboardYearSelect({
  value,
  onChange,
  serviceKey,
  empresaRut = "",
  enabled = true,
  customRange = false,
  className = "",
}) {
  const [result, setResult] = useState(null);
  const [retry, setRetry] = useState(0);
  const requestKey = JSON.stringify([serviceKey, empresaRut, retry]);
  const current = enabled && result?.requestKey === requestKey ? result : null;
  const years = current?.status === "success" ? current.years : [];
  const selected = customRange ? "custom" : years.includes(String(value)) ? value : "";

  useEffect(() => {
    if (!enabled || !serviceKey) return undefined;
    const controller = new AbortController();
    let ignore = false;

    apiService.get(`/dashboard-years/${encodeURIComponent(serviceKey)}`, {
      params: empresaRut ? { empresaRut } : {},
      signal: controller.signal,
    }).then((response) => {
      if (!ignore) {
        setResult({
          requestKey,
          status: "success",
          years: normalizeDashboardYears(response.data.data),
        });
      }
    }).catch(() => {
      if (!ignore) setResult({ requestKey, status: "error" });
    });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [requestKey, serviceKey, empresaRut, enabled]);

  useEffect(() => {
    if (current?.status === "success" && value && !current.years.includes(String(value))) {
      onChange("");
    }
  }, [current, value, onChange]);

  return (
    <div className={`min-w-0 text-xs font-semibold text-slate-600 ${className}`}>
      <label className={dashboardFieldClass}>
        Año
        <select
          aria-busy={enabled && !current}
          value={selected}
          onChange={(event) => onChange(event.target.value)}
          className={dashboardControlClass}
        >
          <option value="">Todos los años</option>
          {customRange && <option value="custom" disabled>Rango personalizado</option>}
          {years.map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
      </label>
      {current?.status === "error" && (
        <p role="alert" className="mt-1">
          No fue posible cargar los años.{" "}
          <button type="button" onClick={() => setRetry((count) => count + 1)} className="underline">
            Reintentar
          </button>
        </p>
      )}
    </div>
  );
}
