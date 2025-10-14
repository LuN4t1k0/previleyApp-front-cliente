"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, Title } from "@tremor/react";
import { getResumenMensualComisiones } from "@/services/comisionService";

const ResumenMensualComisionesPage = () => {
  const now = useMemo(() => new Date(), []);
  const [anio, setAnio] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);

  const fetchResumen = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getResumenMensualComisiones({ anio, mes });
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Title>📊 Resumen Mensual de Comisiones</Title>

      <Card className="mt-4">
        <form onSubmit={(e) => { e.preventDefault(); fetchResumen(); }} className="flex gap-3 items-end">
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
      </Card>

      {error && <div className="text-red-600 mt-3">{error}</div>}

      <Card className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Trabajador</th>
              <th className="text-left p-2">Empresa</th>
              <th className="text-left p-2">Periodo</th>
              <th className="text-right p-2">Ganancia Total</th>
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
                  <td className="p-2 text-right">{Number(r.gananciaTotal).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                  <td className="p-2 text-right font-semibold">{Number(r.montoComisionTotal).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
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

