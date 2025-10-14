"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Select,
  SelectItem,
  Switch,
  Text,
  TextInput,
  Textarea,
} from "@tremor/react";
import { showErrorAlert } from "@/utils/alerts";

const estados = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_proceso", label: "En proceso" },
  { value: "realizada", label: "Realizada" },
  { value: "completada", label: "Completada" },
  { value: "cerrada", label: "Cerrada" },
  { value: "no_localizado", label: "No localizado" },
  { value: "cancelada", label: "Cancelada" },
];

const VisitaDetalleFormModal = ({ initialData = {}, handleSubmit, onClose }) => {
  const [formValues, setFormValues] = useState({
    estado: "realizada",
    enDomicilio: false,
    enReposo: false,
    fechaVisita: new Date().toISOString().split("T")[0],
    observacion: "",
    costoVisita: "",
    evidencia: null,
  });

  useEffect(() => {
    if (initialData?.id) {
      setFormValues({
        estado: initialData.estado || "realizada",
        enDomicilio: Boolean(initialData.enDomicilio),
        enReposo: Boolean(initialData.enReposo),
        fechaVisita: initialData.fechaVisita
          ? initialData.fechaVisita.split("T")[0]
          : new Date().toISOString().split("T")[0],
        observacion: initialData.observacion || "",
        costoVisita: initialData.costoVisita ? String(initialData.costoVisita) : "",
        evidencia: null,
      });
    }
  }, [initialData]);

  const handleChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmitForm = async (event) => {
    event.preventDefault();

    if (!initialData?.id) {
      showErrorAlert("Error", "No se encontró el identificador de la visita.");
      return;
    }

    const payload = new FormData();
    if (formValues.estado) payload.append("estado", formValues.estado);
    payload.append("enDomicilio", String(formValues.enDomicilio));
    payload.append("enReposo", String(formValues.enReposo));
    if (formValues.fechaVisita) payload.append("fechaVisita", formValues.fechaVisita);
    if (formValues.observacion) payload.append("observacion", formValues.observacion);
    if (formValues.costoVisita) payload.append("costoVisita", formValues.costoVisita);
    if (formValues.evidencia instanceof File) {
      payload.append("evidencia", formValues.evidencia);
    }

    await handleSubmit(payload, initialData);
    onClose();
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmitForm}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Text className="text-sm font-semibold text-gray-700">Estado</Text>
          <Select
            value={formValues.estado}
            onValueChange={(value) => handleChange("estado", value)}
          >
            {estados.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Text className="text-sm font-semibold text-gray-700">Fecha visita</Text>
          <TextInput
            type="date"
            value={formValues.fechaVisita}
            onChange={(e) => handleChange("fechaVisita", e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg">
          <div>
            <Text className="text-sm font-semibold text-gray-700">Trabajador presente</Text>
            <Text className="text-xs text-gray-500">Marca si se encontraba en el domicilio.</Text>
          </div>
          <Switch
            checked={Boolean(formValues.enDomicilio)}
            onChange={(value) => handleChange("enDomicilio", value)}
          />
        </div>

        <div className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg">
          <div>
            <Text className="text-sm font-semibold text-gray-700">Cumple reposo</Text>
            <Text className="text-xs text-gray-500">Marca si estaba realizando el reposo indicado.</Text>
          </div>
          <Switch
            checked={Boolean(formValues.enReposo)}
            onChange={(value) => handleChange("enReposo", value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Text className="text-sm font-semibold text-gray-700">Observaciones</Text>
        <Textarea
          minRows={3}
          value={formValues.observacion}
          onChange={(e) => handleChange("observacion", e.target.value)}
          placeholder="Observaciones del visitador"
        />
      </div>

      <div className="space-y-2">
        <Text className="text-sm font-semibold text-gray-700">Costo visita (opcional)</Text>
        <TextInput
          type="number"
          min="0"
          value={formValues.costoVisita}
          onChange={(e) => handleChange("costoVisita", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Text className="text-sm font-semibold text-gray-700">Evidencia fotográfica</Text>
        <TextInput
          type="file"
          accept="image/*"
          onChange={(e) => handleChange("evidencia", e.target.files?.[0] || null)}
        />
        {initialData?.evidenciaSignedUrl && !formValues.evidencia && (
          <a
            href={initialData.evidenciaSignedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm hover:underline"
          >
            Ver evidencia actual
          </a>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="light" color="gray" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" color="blue">
          Guardar cambios
        </Button>
      </div>
    </form>
  );
};

VisitaDetalleFormModal.modalSize = "max-w-2xl";

export default VisitaDetalleFormModal;
