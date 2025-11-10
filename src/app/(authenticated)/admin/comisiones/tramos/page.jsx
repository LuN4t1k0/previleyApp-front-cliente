"use client";

import React, { useEffect, useState } from "react";
import { getTrabajadores } from "@/services/comisionService";
import {
  getComisionConfig,
  updateComisionConfig,
} from "@/services/comisionConfigService";

const formDefaults = {
  metaProduccionMensual: "",
  porcentajeComisionIndividual: "",
};

const TramosAdminPage = () => {
  const [trabajadores, setTrabajadores] = useState([]);
  const [selectedTrabajadorId, setSelectedTrabajadorId] = useState("");
  const [form, setForm] = useState(formDefaults);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [loadingTrabajadores, setLoadingTrabajadores] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchTrabajadores = async () => {
      try {
        setLoadingTrabajadores(true);
        setError(null);
        const { data } = await getTrabajadores();
        const list = data?.data || data || [];
        const arr = list?.data || list || [];
        setTrabajadores(arr);
        if (arr.length > 0) {
          setSelectedTrabajadorId(arr[0].id);
        }
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Error cargando trabajadores");
      } finally {
        setLoadingTrabajadores(false);
      }
    };
    fetchTrabajadores();
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      if (!selectedTrabajadorId) return;
      try {
        setLoadingConfig(true);
        setError(null);
        setSuccessMessage("");
        const { data } = await getComisionConfig(selectedTrabajadorId);
        const config = data?.data || {};
        setForm({
          metaProduccionMensual: config.metaProduccionMensual ?? "",
          porcentajeComisionIndividual: config.porcentajeComisionIndividual ?? "",
        });
        setUltimaActualizacion(config.ultimaActualizacion || null);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Error cargando configuración");
        setForm(formDefaults);
        setUltimaActualizacion(null);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, [selectedTrabajadorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTrabajadorId) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage("");
      await updateComisionConfig(selectedTrabajadorId, {
        metaProduccionMensual: Number(form.metaProduccionMensual),
        porcentajeComisionIndividual: Number(form.porcentajeComisionIndividual),
      });
      setSuccessMessage("Configuración guardada correctamente.");
      setUltimaActualizacion(new Date().toISOString());
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Error guardando configuración");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Metas y porcentajes de comisión</h1>

      <div className="flex gap-3 items-end mb-3">
        <div>
          <label className="block text-sm font-medium">Trabajador</label>
          <select
            value={selectedTrabajadorId}
            onChange={(e) => setSelectedTrabajadorId(parseInt(e.target.value, 10))}
            className="border rounded px-2 py-1 min-w-[280px]"
          disabled={loadingTrabajadores || loadingConfig}>
            {(trabajadores || []).map((t) => (
              <option key={t.id} value={t.id}>
                {[t.nombre, t.apellido].filter(Boolean).join(" ") || `Trabajador #${t.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="text-red-600 mb-3">{error}</div>}
      {successMessage && <div className="text-emerald-600 mb-3">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="border rounded bg-white p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Meta mensual (CLP)</label>
          <input
            type="number"
            name="metaProduccionMensual"
            value={form.metaProduccionMensual}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            min="0"
            step="0.01"
            required
            disabled={loadingConfig || saving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">% de comisión</label>
          <input
            type="number"
            name="porcentajeComisionIndividual"
            value={form.porcentajeComisionIndividual}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            min="0"
            max="100"
            step="0.01"
            required
            disabled={loadingConfig || saving}
          />
        </div>

        {ultimaActualizacion && (
          <p className="text-sm text-gray-500">
            Última actualización: {new Date(ultimaActualizacion).toLocaleString("es-CL")}
          </p>
        )}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2"
          disabled={saving || loadingConfig}
        >
          {saving ? "Guardando..." : "Guardar configuración"}
        </button>
      </form>
    </div>
  );
};

export default TramosAdminPage;
