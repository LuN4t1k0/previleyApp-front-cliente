"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, Title } from "@tremor/react";
import {
  getResumenMensualComisiones,
  closePeriodoComisiones,
  reopenPeriodoComisiones,
  ajustarComision,
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
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedComision, setSelectedComision] = useState(null);
  const [adjustForm, setAdjustForm] = useState({
    ajusteManual: 0,
    motivoAjuste: "",
    estadoPago: "pendiente",
  });

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

  const openAdjustModal = (row) => {
    setSelectedComision(row);
    setAdjustForm({
      ajusteManual: row?.ajusteManualTotal ?? 0,
      motivoAjuste: row?.motivoAjuste || "",
      estadoPago: row?.estadoPago || "pendiente",
    });
    setAdjustModalOpen(true);
  };

  const closeAdjustModal = () => {
    setSelectedComision(null);
    setAdjustForm({
      ajusteManual: 0,
      motivoAjuste: "",
      estadoPago: "pendiente",
    });
    setAdjustModalOpen(false);
  };

  const handleAdjustChange = (e) => {
    const { name, value } = e.target;
    setAdjustForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComision?.id) return;
    try {
      setActionLoading("adjust");
      await ajustarComision(selectedComision.id, {
        ajusteManual: Number(adjustForm.ajusteManual || 0),
        motivoAjuste: adjustForm.motivoAjuste || null,
        estadoPago: adjustForm.estadoPago,
      });
      await fetchResumen();
      closeAdjustModal();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Error al ajustar");
    } finally {
      setActionLoading(null);
    }
  };

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
              <th className="text-left p-2">Estado pago</th>
              <th className="text-right p-2">Acciones</th>
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
                  <td className="p-2">{r.estadoPago || "pendiente"}</td>
                  <td className="p-2 text-right">
                    {isClosed && r.id ? (
                      <button
                        type="button"
                        onClick={() => openAdjustModal(r)}
                        className="text-blue-600 hover:underline"
                      >
                        Ajustar
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      {adjustModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Ajustar comisión</h2>
            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Monto de ajuste (puede ser negativo)</label>
                <input
                  type="number"
                  step="0.01"
                  name="ajusteManual"
                  value={adjustForm.ajusteManual}
                  onChange={handleAdjustChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Motivo del ajuste</label>
                <textarea
                  name="motivoAjuste"
                  value={adjustForm.motivoAjuste}
                  onChange={handleAdjustChange}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Estado de pago</label>
                <select
                  name="estadoPago"
                  value={adjustForm.estadoPago}
                  onChange={handleAdjustChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="pagada">Pagada</option>
                  <option value="rechazada">Rechazada</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAdjustModal}
                  className="px-4 py-2 rounded border border-gray-300"
                  disabled={actionLoading === "adjust"}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                  disabled={actionLoading === "adjust"}
                >
                  {actionLoading === "adjust" ? "Guardando..." : "Guardar ajuste"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumenMensualComisionesPage;
