"use client";

import React, { useEffect, useState } from "react";
import { Card, Title } from "@tremor/react";
import {
  getPeriodosCerrados,
  getDetallePeriodoCerrado,
  getComisionesAnalytics,
} from "@/services/comisionService";

const HistoricosComisionesPage = () => {
  const [periodos, setPeriodos] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [range, setRange] = useState({ desde: "", hasta: "" });
  const [selectedPeriodo, setSelectedPeriodo] = useState(null);

  const fetchPeriodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getPeriodosCerrados();
      setPeriodos(data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Error al cargar históricos");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (filters = {}) => {
    try {
      const { data } = await getComisionesAnalytics(filters);
      setAnalytics(data?.data || null);
    } catch (_) {
      /* silencioso */
    }
  };

  useEffect(() => {
    fetchPeriodos();
    fetchAnalytics({});
  }, []);

  const handleAnalyticsFilter = async (e) => {
    e.preventDefault();
    fetchAnalytics(range);
  };

  const fetchDetalle = async (periodo) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getDetallePeriodoCerrado(periodo);
      setDetalle(data);
      setSelectedPeriodo(periodo);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Error al cargar el período");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <Title>🗂️ Períodos de comisiones cerrados</Title>
      <Card className="overflow-x-auto space-y-4">
        <form onSubmit={handleAnalyticsFilter} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm font-medium">Desde</label>
            <input
              type="date"
              value={range.desde}
              onChange={(e) => setRange((prev) => ({ ...prev, desde: e.target.value }))}
              className="border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Hasta</label>
            <input
              type="date"
              value={range.hasta}
              onChange={(e) => setRange((prev) => ({ ...prev, hasta: e.target.value }))}
              className="border rounded px-2 py-1"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-2 rounded"
          >
            Aplicar
          </button>
        </form>

        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Producción</p>
              <p className="text-2xl font-semibold">
                {Number(analytics.totales.produccion || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Ingreso Previley</p>
              <p className="text-2xl font-semibold">
                {Number(analytics.totales.ingreso || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Comisión total</p>
              <p className="text-2xl font-semibold">
                {Number(analytics.totales.comision || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
              </p>
            </div>
          </div>
        )}
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Período</th>
              <th className="text-left p-2">Estado</th>
              <th className="text-left p-2">Usuario cierre</th>
              <th className="text-left p-2">Fecha cierre</th>
              <th className="text-right p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {periodos.length === 0 && !loading && (
              <tr>
                <td className="p-3" colSpan={5}>Aún no hay cierres registrados.</td>
              </tr>
            )}
            {periodos.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.periodo}</td>
                <td className="p-2 capitalize">{p.estado}</td>
                <td className="p-2">{p.usuarioCierre || "-"}</td>
                <td className="p-2">{p.fechaCierre || "-"}</td>
                <td className="p-2 text-right">
                  <button
                    type="button"
                    onClick={() => fetchDetalle(p.periodo)}
                    className="text-blue-600 hover:underline"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <h3 className="text-lg font-semibold mb-2">Top por producción</h3>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2">Trabajador</th>
                  <th className="text-left p-2">Empresa</th>
                  <th className="text-right p-2">Producción</th>
                </tr>
              </thead>
              <tbody>
                {analytics.rankingProduccion?.map((row) => (
                  <tr key={row.trabajadorId} className="border-t">
                    <td className="p-2">{row.nombre || `ID ${row.trabajadorId}`}</td>
                    <td className="p-2">{row.empresa}</td>
                    <td className="p-2 text-right">{Number(row.produccion).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold mb-2">Top por comisión</h3>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2">Trabajador</th>
                  <th className="text-left p-2">Empresa</th>
                  <th className="text-right p-2">Comisión</th>
                </tr>
              </thead>
              <tbody>
                {analytics.rankingComision?.map((row) => (
                  <tr key={row.trabajadorId} className="border-t">
                    <td className="p-2">{row.nombre || `ID ${row.trabajadorId}`}</td>
                    <td className="p-2">{row.empresa}</td>
                    <td className="p-2 text-right">{Number(row.comision).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-2">Empresas que más rentan</h3>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2">Empresa</th>
                  <th className="text-right p-2">Producción</th>
                </tr>
              </thead>
              <tbody>
                {analytics.rankingEmpresas?.map((row) => (
                  <tr key={row.empresaRut} className="border-t">
                    <td className="p-2">{row.nombre}</td>
                    <td className="p-2 text-right">{Number(row.produccion).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {detalle && (
        <Card className="overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">
                Detalle período {selectedPeriodo}
              </h2>
              <p className="text-sm text-gray-500">
                Cerrado el {detalle?.periodo?.fechaCierre || "-"} por {detalle?.periodo?.usuarioCierre || "sistema"}
              </p>
            </div>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Trabajador</th>
                <th className="text-right p-2">Producción</th>
                <th className="text-right p-2">Ingreso Previley</th>
                <th className="text-right p-2">Ajuste</th>
                <th className="text-right p-2">Comisión total</th>
                <th className="text-left p-2">Estado pago</th>
              </tr>
            </thead>
            <tbody>
              {detalle?.comisiones?.map((c) => {
                const t = c.trabajador || {};
                const nombre = [t.nombre, t.apellido].filter(Boolean).join(" ");
                const ajuste = Number(c.ajusteManual || 0);
                const total = Number(c.montoComision || 0) + ajuste;
                return (
                  <tr key={c.id} className="border-t">
                    <td className="p-2">{nombre || `Trabajador #${t.id}`}</td>
                    <td className="p-2 text-right">{Number(c.produccionTotal).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                    <td className="p-2 text-right">{Number(c.ingresoPrevileyTotal).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                    <td className="p-2 text-right">{ajuste.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                    <td className="p-2 text-right font-semibold">{total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                    <td className="p-2 capitalize">{c.estadoPago || 'pendiente'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {loading && <p className="text-sm text-gray-500">Cargando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default HistoricosComisionesPage;
