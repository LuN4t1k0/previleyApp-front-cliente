"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  TextInput,
  Select,
  SelectItem,
  SearchSelect,
  SearchSelectItem,
  MultiSelect,
  MultiSelectItem,
} from "@tremor/react";
import apiService from "@/app/api/apiService";
import { showErrorAlert } from "@/utils/alerts";

// Debe coincidir con el enum Joi del backend: [TECNICO, FACTURACION, COBRANZA, GENERAL, NOTIFICACION]
const tipos = [
  { value: "GENERAL", label: "General" },
  { value: "FACTURACION", label: "Facturación" },
  { value: "COBRANZA", label: "Cobranza" },
  { value: "TECNICO", label: "Técnico" },
  { value: "NOTIFICACION", label: "Notificación" },
];

export default function EmpresaCorreoFormModal({ initialData, onClose, handleSubmit, refreshData }) {
  const isEditing = Boolean(initialData?.id);
  const [form, setForm] = useState({
    empresaRuts: initialData?.empresaRut ? [initialData.empresaRut] : [],
    emailsInput: initialData?.email || "",
    nombreContacto: initialData?.nombreContacto || "",
    telefono: initialData?.telefono || "",
    cargo: initialData?.cargo || "",
    tipo: initialData?.tipo || "GENERAL",
  });
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        const res = await apiService.get("/empresas", { params: { limit: 1000 } });
        const opts = (res?.data?.data || []).map((e) => ({
          value: e.empresaRut,
          label: `${e.nombre || e.empresaRut} (${e.empresaRut})`,
          nombre: e.nombre || "",
        }));
        setEmpresas(opts);
      } catch (err) {
        showErrorAlert("Error", "No se pudieron cargar las empresas");
      }
    };
    loadEmpresas();
  }, []);

  useEffect(() => {
    if (isEditing && initialData) {
      setForm({
        empresaRuts: initialData.empresaRut ? [initialData.empresaRut] : [],
        emailsInput: initialData.email || "",
        nombreContacto: initialData.nombreContacto || "",
        telefono: initialData.telefono || "",
        cargo: initialData.cargo || "",
        tipo: initialData.tipo || "GENERAL",
      });
    }
  }, [initialData, isEditing]);

  // Tremor SearchSelect se encarga del filtrado interno

  const update = (k) => (e) => setForm((s) => ({ ...s, [k]: e?.target?.value ?? e }));

  const handleEmpresaChange = (values) => {
    setForm((s) => ({ ...s, empresaRuts: values }));
  };

  const onSave = async () => {
    try {
      if (isEditing) {
        const payload = {
          empresaRut: form.empresaRuts[0] || initialData?.empresaRut,
          email: form.emailsInput.trim(),
          nombreContacto: form.nombreContacto || null,
          telefono: form.telefono || null,
          cargo: form.cargo || null,
          tipo: form.tipo,
        };

        if (!payload.email) {
          showErrorAlert("Correo requerido", "Ingresa un correo válido.");
          return;
        }

        await handleSubmit(payload, initialData);
        await refreshData?.();
      } else {
        const empresasSeleccionadas = form.empresaRuts;
        if (!empresasSeleccionadas.length) {
          showErrorAlert(
            "Empresa requerida",
            "Selecciona al menos una empresa para asociar el correo."
          );
          return;
        }

        const correos = form.emailsInput
          .split(/[\s,;\n]+/)
          .map((correo) => correo.trim())
          .filter(Boolean);

        if (!correos.length) {
          showErrorAlert(
            "Correo requerido",
            "Ingresa al menos un correo electrónico. Puedes separarlos por coma o salto de línea."
          );
          return;
        }

        const payload = {
          empresaRuts: empresasSeleccionadas,
          emails: correos,
          nombreContacto: form.nombreContacto || null,
          telefono: form.telefono || null,
          cargo: form.cargo || null,
          tipo: form.tipo,
        };

        await handleSubmit(payload, null);
        await refreshData?.();
      }
      onClose?.();
    } catch (error) {
      // el error ya está manejado en useCrud
    }
  };

  return (
    <div className="space-y-3">
      {isEditing ? (
        <SearchSelect
          value={form.empresaRuts[0] || ""}
          onValueChange={(v) => setForm((s) => ({ ...s, empresaRuts: v ? [v] : [] }))}
          placeholder="Selecciona la empresa"
          disabled
        >
          {empresas.map((e) => (
            <SearchSelectItem key={e.value} value={e.value}>
              {e.label}
            </SearchSelectItem>
          ))}
        </SearchSelect>
      ) : (
        <MultiSelect
          value={form.empresaRuts}
          onValueChange={handleEmpresaChange}
          placeholder="Selecciona una o varias empresas..."
        >
          {empresas.map((e) => (
            <MultiSelectItem key={e.value} value={e.value}>
              {e.label}
            </MultiSelectItem>
          ))}
        </MultiSelect>
      )}

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Correo(s)</label>
        {isEditing ? (
          <TextInput
            value={form.emailsInput}
            onChange={(e) => setForm((s) => ({ ...s, emailsInput: e.target.value }))}
            placeholder="correo@dominio.com"
          />
        ) : (
          <textarea
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
            rows={3}
            value={form.emailsInput}
            onChange={(e) => setForm((s) => ({ ...s, emailsInput: e.target.value }))}
            placeholder="Puedes ingresar varios correos separados por coma, espacio o salto de línea"
          />
        )}
      </div>

      <TextInput
        value={form.nombreContacto}
        onChange={update("nombreContacto")}
        placeholder="Nombre de contacto (opcional)"
      />
      <TextInput
        value={form.telefono}
        onChange={update("telefono")}
        placeholder="Teléfono (opcional)"
      />
      <TextInput
        value={form.cargo}
        onChange={update("cargo")}
        placeholder="Cargo (opcional)"
      />
      <Select value={form.tipo} onValueChange={(v) => setForm((s) => ({ ...s, tipo: v }))}>
        {tipos.map((t) => (
          <SelectItem key={t.value} value={t.value}>
            {t.label}
          </SelectItem>
        ))}
      </Select>
      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button color="blue" onClick={onSave}>Guardar</Button>
      </div>
    </div>
  );
}
