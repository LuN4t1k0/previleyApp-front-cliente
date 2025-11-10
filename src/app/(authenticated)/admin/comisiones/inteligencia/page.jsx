"use client";

import React, { useEffect, useState } from "react";
import { Card, Title } from "@tremor/react";
import { getComisionesAnalytics } from "@/services/comisionService";

const InteligenciaComisionesPage = () => {
  const [filters, setFilters] = useState({ desde: "", hasta: "" });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filters.desde) params.desde = filters.desde;
      if (filters.hasta) params.hasta = filters.hasta;
      const response = await getComisionesAnalytics(params);
      setData(response?.data?.data || null);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Error al cargar métricas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <Title>📈 Inteligencia de comisiones</Title>
        <p className="text-sm text-gray-500">Analiza producción, ingreso y comisiones para detectar tendencias.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm font-medium">Desde</label>
            <input
              type="date"
              value={filters.desde}
              onChange={(e) => setFilters((prev) => ({ ...prev, desde: e.target.value }))}
              className="border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Hasta</label>
            <input
              type="date"
              value={filters.hasta}
              onChange={(e) => setFilters((prev) => ({ ...prev, hasta: e.target.value }))}
              className="border rounded px-2 py-1"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Cargando..." : "Aplicar"}
          </button>
        </form>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-gray-50">
              <p className="text-sm text-gray-500">Producción total</p>
              <p className="text-3xl font-semibold">
                {Number(data.totales.produccion || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
              </p>
            </Card>
            <Card className="bg-gray-50">
              <p className="text-sm text-gray-500">Ingreso Previley</p>
              <p className="text-3xl font-semibold">
                {Number(data.totales.ingreso || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
              </p>
            </Card>
            <Card className="bg-gray-50">
              <p className="text-sm text-gray-500">Comisión total</p>
              <p className="text-3xl font-semibold">
                {Number(data.totales.comision || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-lg font-semibold mb-3">Top trabajadores por producción</h3>
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">Trabajador</th>
                    <th className="text-left p-2">Empresa</th>
                    <th className="text-right p-2">Producción</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rankingProduccion?.map((row) => (
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
              <h3 className="text-lg font-semibold mb-3">Top trabajadores por comisión</h3>
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">Trabajador</th>
                    <th className="text-left p-2">Empresa</th>
                    <th className="text-right p-2">Comisión</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rankingComision?.map((row) => (
                    <tr key={row.trabajadorId} className="border-t">
                      <td className="p-2">{row.nombre || `ID ${row.trabajadorId}`}</td>
                      <td className="p-2">{row.empresa}</td>
                      <td className="p-2 text-right">{Number(row.comision).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-semibold mb-3">Empresas que más rentan</h3>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2">Empresa</th>
                  <th className="text-right p-2">Producción</th>
                </tr>
              </thead>
              <tbody>
                {data.rankingEmpresas?.map((row) => (
                  <tr key={row.empresaRut} className="border-t">
                    <td className="p-2">{row.nombre}</td>
                    <td className="p-2 text-right">{Number(row.produccion).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {loading && <p className="text-sm text-gray-500">Cargando...</p>}
    </div>
  );
};

export default InteligenciaComisionesPage;
