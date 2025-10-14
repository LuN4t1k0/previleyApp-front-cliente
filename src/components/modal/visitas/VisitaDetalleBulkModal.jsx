"use client";

import { useState } from "react";
import { Button, Text, TextInput } from "@tremor/react";
import apiService from "@/app/api/apiService";
import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";

const VisitaDetalleBulkModal = ({ gestionId, onClose, onImported }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImport = async (event) => {
    event.preventDefault();
    if (!file) {
      showErrorAlert("Validación", "Debes seleccionar un archivo XLSX.");
      return;
    }

    const formData = new FormData();
    formData.append("planificacion", file);

    try {
      setLoading(true);
      const response = await apiService.post(
        `/gestion-visita/${gestionId}/detalles/import`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      showSuccessAlert(
        "Importación exitosa",
        `Se importaron ${response.data?.data?.inserted || 0} registros`
      );
      onImported?.();
      onClose();
    } catch (error) {
      console.error("Error importando visitas", error);
      const message =
        error?.response?.data?.message || "No se pudo importar el archivo seleccionado.";
      showErrorAlert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleImport}>
      <div className="space-y-2">
        <Text className="text-sm font-semibold text-gray-700">
          Archivo Excel con planificación
        </Text>
        <TextInput
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="light" color="gray" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" color="blue" loading={loading} disabled={loading}>
          Importar
        </Button>
      </div>
    </form>
  );
};

VisitaDetalleBulkModal.modalSize = "max-w-lg";
VisitaDetalleBulkModal.staticBackdrop = true;

export default VisitaDetalleBulkModal;
