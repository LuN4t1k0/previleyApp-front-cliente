"use client";

import React, { useState } from "react";
import {
  Title,
  Text,
  Select,
  SelectItem,
  Button,
} from "@tremor/react";
import { RiFileExcel2Line } from "@remixicon/react";
import { motion } from "framer-motion";
import apiService from "@/app/api/apiService";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";

const ResumenEmpresaModal = ({ onClose }) => {
  const { empresas } = useEmpresasPermitidas();
  const [empresaRutSeleccionada, setEmpresaRutSeleccionada] = useState("");
  const [error, setError] = useState("");

  const handleExport = async () => {
    if (!empresaRutSeleccionada) {
      setError("Debes seleccionar una empresa para exportar.");
      return;
    }

    try {
      const res = await apiService.get(
        `mora-dashboard/empresas/${empresaRutSeleccionada}/exportar-excel`,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `resumen_mora_${empresaRutSeleccionada}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error exportando Excel:", err);
      setError("Ocurrió un error al exportar el archivo.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="bg-white max-h-[90vh] overflow-y-auto p-8 rounded-2xl shadow-xl mx-auto w-full max-w-xl"
    >
      <Title className="text-2xl font-bold mb-6 text-center text-gray-800">
        Exportar Resumen por Empresa
      </Title>

      <div className="space-y-5">
        <div>
          <Text className="text-lg text-gray-700 mb-2">Selecciona una empresa:</Text>
          <Select
            value={empresaRutSeleccionada}
            onValueChange={setEmpresaRutSeleccionada}
            placeholder="Selecciona una empresa"
          >
            {empresas.map((e) => (
              <SelectItem key={e.empresaRut} value={e.empresaRut}>
                {e.nombre} ({e.empresaRut})
              </SelectItem>
            ))}
          </Select>
          {error && <Text className="text-red-500 text-sm mt-2">{error}</Text>}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            icon={RiFileExcel2Line}
            color="green"
            onClick={handleExport}
            disabled={!empresaRutSeleccionada}
          >
            Exportar Excel
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

ResumenEmpresaModal.modalSize = "max-w-xl";
export default ResumenEmpresaModal;
