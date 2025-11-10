"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, Title } from "@tremor/react";
import {
  getResumenMensualComisiones,
  closePeriodoComisiones,
  reopenPeriodoComisiones,
} from "@/services/comisionService";

const ResumenMensualComisionesPage = () => {
  const now = useMemo(() => new Date(), []);
  const [anio, setAnio] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [estadoPeriodo, setEstadoPeriodo] = useState("abierto");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchResumen = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getResumenMensualComisiones({ anio, mes });
      setEstadoPeriodo(data?.estadoPeriodo || "abierto");
      setRows(data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const meses = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  const handleClosePeriodo = async () => {
    try {
      setError(null);
      setActionLoading("close");
      await closePeriodoComisiones({ anio, mes });
      await fetchResumen();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Error al cerrar el período");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReopenPeriodo = async () => {
    try {
      setError(null);
      setActionLoading("reopen");
      await reopenPeriodoComisiones({ anio, mes });
      await fetchResumen();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Error al reabrir el período");
    } finally {
      setActionLoading(null);
    }
  };

  const isClosed = estadoPeriodo === "cerrado";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Title>📊 Resumen Mensual de Comisiones</Title>

      <Card className="mt-4">
        <form onSubmit={(e) => { e.preventDefault(); fetchResumen(); }} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm font-medium">Año</label>
            <input
              type="number"
              value={anio}
              onChange={(e) => setAnio(parseInt(e.target.value || now.getFullYear(), 10))}
              className="border rounded px-2 py-1 w-28"
              min={2000}
              max={2100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Mes</label>
            <select
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value, 10))}
              className="border rounded px-2 py-1"
            >
              {meses.map((m, idx) => (
                <option key={idx} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2"
            disabled={loading}
          >
            {loading ? "Cargando..." : "Buscar"}
          </button>
        </form>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isClosed ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            Estado del período: {isClosed ? "Cerrado" : "Abierto"}
          </span>
          {isClosed ? (
            <button
              type="button"
              onClick={handleReopenPeriodo}
              className="bg-yellow-600 hover:bg-yellow-700 text-white rounded px-3 py-2"
              disabled={actionLoading === "reopen"}
            >
              {actionLoading === "reopen" ? "Reabriendo..." : "Reabrir período"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClosePeriodo}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-3 py-2"
              disabled={actionLoading === "close"}
            >
              {actionLoading === "close" ? "Cerrando..." : "Cerrar período"}
            </button>
          )}
        </div>
      </Card>

      {error && <div className="text-red-600 mt-3">{error}</div>}

      <Card className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Trabajador</th>
              <th className="text-left p-2">Empresa</th>
              <th className="text-left p-2">Periodo</th>
              <th className="text-right p-2">Producción Total</th>
              <th className="text-right p-2">Ingreso Previley</th>
              <th className="text-right p-2">Ajuste</th>
              <th className="text-right p-2">Comisión Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr>
                <td className="p-3" colSpan={5}>Sin datos para el período.</td>
              </tr>
            )}
            {rows.map((r, i) => {
              const t = r.trabajador || {};
              const emp = t.empresa || {};
              const nombreCompleto = [t.nombre, t.apellido].filter(Boolean).join(" ");
              return (
                <tr key={i} className="border-t">
                  <td className="p-2">{nombreCompleto || `Trabajador #${t.id}`}</td>
                  <td className="p-2">{emp.nombre || emp.empresaRut || "-"}</td>
                  <td className="p-2">{r.periodo}</td>
                  <td className="p-2 text-right">
                    {Number(r.produccionTotal).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                  </td>
                  <td className="p-2 text-right">
                    {Number(r.ingresoPrevileyTotal).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                  </td>
                  <td className="p-2 text-right">
                    {Number(r.ajusteManualTotal || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                  </td>
                  <td className="p-2 text-right font-semibold">
                    {Number(r.montoComisionTotal ?? 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default ResumenMensualComisionesPage;
