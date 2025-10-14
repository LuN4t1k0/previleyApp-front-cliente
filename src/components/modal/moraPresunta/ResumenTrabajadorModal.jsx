"use client";

import React, { useState } from "react";
import {
  Title,
  Text,
  TextInput,
  Button,
  Grid,
} from "@tremor/react";
import { RiFileExcel2Line, RiFilePdf2Line } from "@remixicon/react";
import { motion } from "framer-motion";
import apiService from "@/app/api/apiService";
import Loader from "@/components/loader/Loader";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import TrabajadorSkeleton from "@/components/skeleton/TrabajadorSkeleton";

const formatCLP = (value) =>
  `$${Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(value)}`;

const isValidRut = (rut) => /^\d{7,8}-[\dkK]$/.test(rut.trim());

const ResumenTrabajadorModal = ({ onClose }) => {
  const [rut, setRut] = useState("");
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { empresas } = useEmpresasPermitidas();
  const empresaRut = empresas?.[0]?.empresaRut || null;

  const fetchResumen = async () => {
    if (!rut || !isValidRut(rut) || !empresaRut) {
      setError("Debes ingresar un RUT válido y tener una empresa asociada.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const { data } = await apiService.get(`/mora-dashboard/trabajador/${rut}/resumen`);
      setResumen(data.data);
    } catch (err) {
      console.error(err);
      setError("No se pudo obtener el resumen del trabajador.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    if (!rut || !isValidRut(rut) || !resumen) return;
  
    try {
      const res = await apiService.get(
        `/mora-dashboard/trabajador/${rut}/exportar-${format}`,
        { responseType: "blob" }
      );
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `resumen_${rut}.${format === "excel" ? "xlsx" : "pdf"}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Error al exportar ${format}:`, err);
    }
  };

  const resetAll = () => {
    setResumen(null);
    setRut("");
    setError("");
  };

  if (loading) return <TrabajadorSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="bg-white max-h-[90vh] overflow-y-auto p-8 rounded-2xl shadow-xl mx-auto w-full max-w-3xl"
    >
      <Title className="text-3xl font-bold mb-6 text-center text-gray-800">
        Resumen de Trabajador
      </Title>

      {/* Buscador */}
      {!resumen && (
        <div className="space-y-5">
          <div>
            <Text className="text-lg text-gray-700">
              Ingresa el RUT del trabajador:
            </Text>
            <TextInput
              className="mt-2"
              placeholder="Ej: 12345678-9"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              error={!!error}
            />
            {error && <Text className="text-red-500 text-sm mt-2">{error}</Text>}
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <Button onClick={fetchResumen} disabled={loading}>
              {loading ? "Buscando..." : "Buscar"}
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      )}

      {/* Resultado */}
      {resumen && (
        <>
          {/* Información del Trabajador y Montos */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
            <Grid className="grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Text className="text-sm text-gray-600 uppercase font-medium">
                  Nombre
                </Text>
                <Text className="text-xl text-gray-900">
                  {resumen.nombreCompleto}
                </Text>
                <Text className="mt-4 text-sm text-gray-600 uppercase font-medium">
                  RUT
                </Text>
                <Text className="text-xl text-gray-900">
                  {resumen.trabajadorRut}
                </Text>
              </div>
              <div className="flex flex-col md:justify-center md:items-end space-y-4">
                <div className="bg-red-100 px-4 py-3 rounded-lg text-center w-full">
                  <Text className="text-sm font-semibold text-red-600">
                    Deuda Pendiente
                  </Text>
                  <Text className="text-2xl font-bold text-red-600">
                    {formatCLP(resumen.totalDeudaPendiente)}
                  </Text>
                </div>
                <div className="bg-green-100 px-4 py-3 rounded-lg text-center w-full">
                  <Text className="text-sm font-semibold text-green-600">
                    Recuperado
                  </Text>
                  <Text className="text-2xl font-bold text-green-600">
                    {formatCLP(resumen.totalRecuperado)}
                  </Text>
                </div>
              </div>
            </Grid>
          </div>

          {/* Períodos */}
          <div className="space-y-8 max-h-[50vh] overflow-y-auto pr-1">
            {/* Pendientes */}
            <div>
              <Title className="text-xl font-semibold text-gray-800 mb-4">
                Períodos Pendientes
              </Title>
              {resumen.pendientes.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {resumen.pendientes.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <Text className="text-base font-medium text-gray-800">
                          {item.periodo}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {item.entidad}
                        </Text>
                      </div>
                      <div className="text-right">
                        <Text className="text-sm text-gray-600">Monto</Text>
                        <Text className="text-lg font-bold text-red-600">
                          {formatCLP(item.monto)}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Text className="text-gray-600">No hay períodos pendientes.</Text>
              )}
            </div>

            {/* Resueltos */}
            <div>
              <Title className="text-xl font-semibold text-gray-800 mb-4">
                Períodos Resueltos
              </Title>
              {resumen.resueltos.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {resumen.resueltos.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <Text className="text-base font-medium text-gray-800">
                          {item.periodo}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {item.entidad}
                        </Text>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <Text className="text-sm text-gray-600">Monto</Text>
                          <Text className="text-lg font-bold text-green-600">
                            {formatCLP(item.monto)}
                          </Text>
                        </div>
                        <div className="text-right">
                          <Text className="text-sm text-gray-600">Tipo Gestión</Text>
                          <Text className="text-base font-medium text-gray-800">
                            {item.tipoGestion}
                          </Text>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Text className="text-gray-600">No hay períodos resueltos.</Text>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 mt-8 gap-4">
            <div className="flex gap-4">
              <Button icon={RiFilePdf2Line} onClick={() => handleExport("pdf")}>
                Exportar PDF
              </Button>
              <Button icon={RiFileExcel2Line} color="green" onClick={() => handleExport("excel")}>
                Exportar Excel
              </Button>
            </div>
            <div className="flex gap-4">
              <Button variant="light" onClick={resetAll}>
                Buscar otro RUT
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

ResumenTrabajadorModal.modalSize = "max-w-3xl";
export default ResumenTrabajadorModal;
