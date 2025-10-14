"use client";

import React, { useEffect, useState } from "react";
import { getTrabajadores } from "@/services/comisionService";
import {
  getTramosByTrabajador,
  createTramo,
  updateTramo,
  deleteTramo,
} from "@/services/comisionTramoService";
import GenericModal from "@/components/modal/GenericModal";
import TramoFormContent from "@/components/modal/comisiones/TramoFormContent";

const TramosAdminPage = () => {
  const [trabajadores, setTrabajadores] = useState([]);
  const [selectedTrabajadorId, setSelectedTrabajadorId] = useState("");
  const [tramos, setTramos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ trabajadorId: "", desde: "", hasta: "", porcentaje: "" });
  const [modalTitle, setModalTitle] = useState("Nuevo tramo");

  useEffect(() => {
    const fetchTrabajadores = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await getTrabajadores();
        const list = data?.data || data || [];
        setTrabajadores(list?.data || list); // soporta {total, data}
        const arr = (list?.data || list) || [];
        if (arr.length > 0) setSelectedTrabajadorId(arr[0].id);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Error cargando trabajadores");
      } finally {
        setLoading(false);
      }
    };
    fetchTrabajadores();
  }, []);

  useEffect(() => {
    const fetchTramos = async () => {
      if (!selectedTrabajadorId) return;
      try {
        setLoading(true);
        setError(null);
        const { data } = await getTramosByTrabajador(selectedTrabajadorId);
        setTramos(data?.data || []);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Error cargando tramos");
        setTramos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTramos();
  }, [selectedTrabajadorId]);

  const openCreateModal = () => {
    setEditId(null);
    setForm({ trabajadorId: selectedTrabajadorId, desde: "", hasta: "", porcentaje: "" });
    setModalTitle("Nuevo tramo");
    setIsModalOpen(true);
  };

  const openEditModal = (tramo) => {
    setEditId(tramo.id);
    setForm({
      trabajadorId: tramo.trabajadorId,
      desde: String(tramo.desde),
      hasta: String(tramo.hasta),
      porcentaje: String(tramo.porcentaje),
    });
    setModalTitle("Editar tramo");
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (payload) => {
    try {
      setLoading(true);
      setError(null);
      if (editId) await updateTramo(editId, payload);
      else await createTramo(payload);

      const { data } = await getTramosByTrabajador(selectedTrabajadorId);
      setTramos(data?.data || []);
      setIsModalOpen(false);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Error guardando tramo");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar tramo?")) return;
    try {
      setLoading(true);
      setError(null);
      await deleteTramo(id);
      const { data } = await getTramosByTrabajador(selectedTrabajadorId);
      setTramos(data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Error eliminando tramo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Tramos de Comisiones</h1>

      <div className="flex gap-3 items-end mb-3">
        <div>
          <label className="block text-sm font-medium">Trabajador</label>
          <select
            value={selectedTrabajadorId}
            onChange={(e) => setSelectedTrabajadorId(parseInt(e.target.value, 10))}
            className="border rounded px-2 py-1 min-w-[280px]"
          >
            {(trabajadores || []).map((t) => (
              <option key={t.id} value={t.id}>
                {[t.nombre, t.apellido].filter(Boolean).join(" ") || `Trabajador #${t.id}`}
              </option>
            ))}
          </select>
        </div>
        <button
          className="bg-green-600 hover:bg-green-700 text-white rounded px-3 py-2"
          onClick={openCreateModal}
          disabled={!selectedTrabajadorId || loading}
        >
          Nuevo tramo
        </button>
      </div>

      {error && <div className="text-red-600 mb-3">{error}</div>}

      <div className="overflow-x-auto border rounded bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Desde</th>
              <th className="text-left p-2">Hasta</th>
              <th className="text-left p-2">% Comisión</th>
              <th className="text-left p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tramos.length === 0 && !loading && (
              <tr>
                <td className="p-3" colSpan={4}>Sin tramos cargados.</td>
              </tr>
            )}
            {tramos.map((tramo) => (
              <tr key={tramo.id} className="border-t">
                <td className="p-2">{tramo.desde}</td>
                <td className="p-2">{tramo.hasta}</td>
                <td className="p-2">{tramo.porcentaje}%</td>
                <td className="p-2">
                  <button
                    className="text-blue-600 hover:underline mr-3"
                    onClick={() => openEditModal(tramo)}
                    disabled={loading}
                  >Editar</button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(tramo.id)}
                    disabled={loading}
                  >Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <GenericModal
          title={modalTitle}
          content={TramoFormContent}
          onClose={closeModal}
          initialValues={form}
          loading={loading}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default TramosAdminPage;
