"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogPanel,
  Select,
  SelectItem,
  TextInput,
} from "@tremor/react";
import { RiAddLine, RiDeleteBin6Line, RiUpload2Line } from "@remixicon/react";
import { useRole } from "@/context/RoleContext";
import Restricted from "@/components/restricted/Restricted";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import apiService from "@/app/api/apiService";
import { showErrorAlert, showInfoAlert, showSuccessAlert, showConfirm } from "@/utils/alerts";

export default function ClientAdminProtegidosPage() {
  const { isClientAdmin } = useRole();
  const { empresas } = useEmpresasPermitidas();

  const [empresaRut, setEmpresaRut] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkMode, setBulkMode] = useState("append");
  const [bulkReason, setBulkReason] = useState("");
  const [bulkFile, setBulkFile] = useState(null);

  const [singleRut, setSingleRut] = useState("");
  const [singleReason, setSingleReason] = useState("");

  const empresaOptions = useMemo(
    () =>
      (empresas || []).map((e) => ({
        value: e.empresaRut,
        label: e.nombre ? `${e.nombre} (${e.empresaRut})` : e.empresaRut,
      })),
    [empresas]
  );

  const fetchList = async (rut) => {
    if (!rut) return;
    setLoading(true);
    try {
      const { data } = await apiService.get("/visibility/worker-protected", {
        params: { empresaRut: rut },
      });
      setRows(data?.data || []);
    } catch (err) {
      showErrorAlert(
        "Error",
        err?.response?.data?.message || err?.message || "No se pudo cargar la lista."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (empresaRut) {
      fetchList(empresaRut);
    } else {
      setRows([]);
    }
  }, [empresaRut]);

  if (!isClientAdmin) {
    return <Restricted />;
  }

  const handleAddSingle = async () => {
    if (!empresaRut || !singleRut) {
      showErrorAlert("Datos requeridos", "Selecciona empresa y escribe el RUT.");
      return;
    }
    try {
      await apiService.post("/visibility/worker-protected", {
        empresaRut,
        trabajadorRut: singleRut,
        reason: singleReason || null,
      });
      setSingleRut("");
      setSingleReason("");
      showSuccessAlert("Agregado", "RUT protegido agregado.");
      await fetchList(empresaRut);
    } catch (err) {
      showErrorAlert(
        "Error",
        err?.response?.data?.message || err?.message || "No se pudo agregar."
      );
    }
  };

  const handleRemove = async (trabajadorRut) => {
    const ok = await showConfirm({
      title: "Eliminar protegido",
      text: `¿Eliminar ${trabajadorRut} de la lista?`,
      confirmText: "Eliminar",
    });
    if (!ok) return;
    try {
      await apiService.delete("/visibility/worker-protected", {
        data: { empresaRut, trabajadorRut },
      });
      showSuccessAlert("Eliminado", "RUT protegido eliminado.");
      await fetchList(empresaRut);
    } catch (err) {
      showErrorAlert(
        "Error",
        err?.response?.data?.message || err?.message || "No se pudo eliminar."
      );
    }
  };

  const handleBulkUpload = async () => {
    if (!empresaRut || !bulkFile) {
      showErrorAlert("Datos requeridos", "Selecciona empresa y sube un archivo.");
      return;
    }
    const formData = new FormData();
    formData.append("empresaRut", empresaRut);
    formData.append("mode", bulkMode);
    if (bulkReason) formData.append("reason", bulkReason);
    formData.append("file", bulkFile);

    try {
      const { data } = await apiService.post("/visibility/worker-protected/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showSuccessAlert("Carga exitosa", `Batch ${data.batchId}`);
      showInfoAlert(
        "Re-login requerido",
        "Los cambios aplican a usuarios cliente en su próxima sesión."
      );
      setShowBulk(false);
      setBulkFile(null);
      setBulkReason("");
      await fetchList(empresaRut);
    } catch (err) {
      showErrorAlert(
        "Error",
        err?.response?.data?.message || err?.message || "No se pudo cargar."
      );
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Trabajadores protegidos</h1>
        <p className="text-sm text-slate-500">
          Administra la nómina de RUT protegidos por empresa.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[240px]">
            <p className="text-xs font-medium text-slate-600 mb-1">Empresa</p>
            <Select value={empresaRut} onValueChange={setEmpresaRut}>
              <SelectItem value="">Seleccione una empresa</SelectItem>
              {empresaOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </div>
          <Button icon={RiUpload2Line} onClick={() => setShowBulk(true)}>
            Cargar por bulk
          </Button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <TextInput
            placeholder="Trabajador RUT"
            value={singleRut}
            onChange={(e) => setSingleRut(e.target.value)}
          />
          <TextInput
            placeholder="Motivo (opcional)"
            value={singleReason}
            onChange={(e) => setSingleReason(e.target.value)}
          />
          <Button icon={RiAddLine} onClick={handleAddSingle}>
            Agregar
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Trabajador RUT</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Actualizado</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Motivo</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={4}>
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={4}>
                  Sin registros para esta empresa.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => (
                <tr key={row.trabajadorRut}>
                  <td className="px-4 py-3 font-medium text-slate-800">{row.trabajadorRut}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.reason || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600"
                      onClick={() => handleRemove(row.trabajadorRut)}
                    >
                      <RiDeleteBin6Line className="h-4 w-4" />
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showBulk} onClose={() => setShowBulk(false)} className="z-50 flex items-center justify-center">
        <DialogPanel className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-slate-900">Carga masiva</h3>
          <div className="mt-4 grid gap-3">
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Modo</p>
              <Select value={bulkMode} onValueChange={setBulkMode}>
                <SelectItem value="append">Append (agregar/actualizar)</SelectItem>
                <SelectItem value="replace">Replace (reemplazar lista)</SelectItem>
              </Select>
            </div>
            <TextInput
              placeholder="Motivo (opcional)"
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
            />
            <input
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-[color:var(--text-secondary)] file:mr-4 file:rounded-md file:border-0 file:bg-[color:var(--theme-soft)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[color:var(--theme-primary)] hover:file:bg-[color:var(--theme-highlight)]"
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowBulk(false)}>
              Cancelar
            </Button>
            <Button onClick={handleBulkUpload}>Subir</Button>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
