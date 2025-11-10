"use client";

import React, { useEffect, useState } from "react";
import { Card, Title } from "@tremor/react";
import { getMetasComisiones, updateMetaComision } from "@/services/comisionService";

const MetasComisionesPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formValues, setFormValues] = useState({
    metaProduccionMensual: "",
    porcentajeComisionIndividual: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchMetas = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getMetasComisiones();
      setRows(data?.data || []);
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Error al cargar las metas"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetas();
  }, []);

  const openModal = (row) => {
    setSelected(row);
    setFormValues({
      metaProduccionMensual: row.metaProduccionMensual || "",
      porcentajeComisionIndividual: row.porcentajeComisionIndividual || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
    setFormValues({
      metaProduccionMensual: "",
      porcentajeComisionIndividual: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selected) return;
    try {
      setSaving(true);
      setError(null);
      await updateMetaComision(selected.trabajadorId, {
        metaProduccionMensual:
          formValues.metaProduccionMensual === ""
            ? null
            : Number(formValues.metaProduccionMensual),
        porcentajeComisionIndividual:
          formValues.porcentajeComisionIndividual === ""
            ? null
            : Number(formValues.porcentajeComisionIndividual),
      });
      await fetchMetas();
      closeModal();
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Error al actualizar la meta"
      );
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value) =>
    value !== null && value !== undefined
      ? Number(value).toLocaleString("es-CL", {
          style: "currency",
          currency: "CLP",
        })
      : "—";

  const formatPercent = (value) =>
    value !== null && value !== undefined
      ? `${Number(value).toFixed(2)}%`
      : "—";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Title>🎯 Metas y Porcentajes</Title>
      <p className="text-gray-600 mt-2 mb-4">
        Visualiza la meta mensual y el porcentaje de comisión configurado para
        cada trabajador.
      </p>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Trabajador</th>
              <th className="text-left p-2">Empresa</th>
              <th className="text-right p-2">Meta mensual</th>
              <th className="text-right p-2">% Comisión</th>
              <th className="text-left p-2">Última actualización</th>
              <th className="text-right p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr>
                <td className="p-3" colSpan={5}>
                  No hay configuraciones cargadas.
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const nombreCompleto = [row.nombre, row.apellido]
                .filter(Boolean)
                .join(" ");
              const empresaNombre =
                row.empresa?.nombre || row.empresaRut || "—";
              const fecha = row.ultimaActualizacion
                ? new Date(row.ultimaActualizacion).toLocaleString("es-CL")
                : "—";
              return (
                <tr key={row.trabajadorId} className="border-t">
                  <td className="p-2">{nombreCompleto || `ID ${row.trabajadorId}`}</td>
                  <td className="p-2">{empresaNombre}</td>
                  <td className="p-2 text-right">
                    {formatCurrency(row.metaProduccionMensual)}
                  </td>
                  <td className="p-2 text-right">
                    {formatPercent(row.porcentajeComisionIndividual)}
                  </td>
                  <td className="p-2">{fecha}</td>
                  <td className="p-2 text-right">
                    <button
                      type="button"
                      onClick={() => openModal(row)}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {loading && <p className="mt-3 text-sm text-gray-500">Cargando...</p>}
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Editar meta y porcentaje
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">
                  Meta mensual (CLP)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="metaProduccionMensual"
                  value={formValues.metaProduccionMensual}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ej: 3000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  % Comisión
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  name="porcentajeComisionIndividual"
                  value={formValues.porcentajeComisionIndividual}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ej: 3"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded border border-gray-300"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetasComisionesPage;
