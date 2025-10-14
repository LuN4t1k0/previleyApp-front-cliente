"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Button,
} from "@tremor/react";
import apiService from "@/app/api/apiService";
import Swal from "sweetalert2";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

const estados = ["pendiente", "pagado", "rechazado"];

const siguienteEstado = (actual) => {
  const idx = estados.indexOf(actual);
  return estados[(idx + 1) % estados.length];
};

const PagexDetalleModal = ({ gestionId, estadoGestion, onClose }) => {
  const isLocked = estadoGestion === "cerrada";
  const [localChanges, setLocalChanges] = useState({});

  const fetchFn = async ({ offset, limit }) => {
    const res = await apiService.get(`/detalle-pagex/gestion/${gestionId}/detalles`, {
      params: { offset, limit },
    });
    return res.data;
  };

  const {
    data,
    total,
    loading,
    hasMore,
    lastRowRef,
  } = useInfiniteScroll({
    fetchFn,
    limit: 10,
    deps: [gestionId],
  });

  const handleEstadoClick = (item) => {
    if (isLocked) return;
    const nuevoEstado = siguienteEstado(localChanges[item.id] || item.estado);
    setLocalChanges((prev) => ({
      ...prev,
      [item.id]: nuevoEstado,
    }));
  };

  const handleGuardarYCerrar = async () => {
    const cambios = Object.entries(localChanges).map(([id, estado]) => ({
      id: parseInt(id, 10),
      estado,
    }));
    if (cambios.length === 0) return onClose();

    try {
      await apiService.patch("/detalle-pagex/tipo-gestion-batch", { cambios });
      setLocalChanges({});
      await Swal.fire({
        icon: "success",
        title: "Cambios guardados",
        text: "Los cambios fueron aplicados correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
      onClose();
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al guardar los cambios.",
      });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        Detalles de la Gestión #{gestionId} ({total} registros)
        {Object.keys(localChanges).length > 0 && (
          <span className="ml-2 text-sm text-yellow-600 dark:text-yellow-300 font-normal">
            — {Object.keys(localChanges).length} cambio
            {Object.keys(localChanges).length > 1 ? "s" : ""} pendiente
          </span>
        )}
      </h2>

      <div className="overflow-x-auto rounded-lg shadow max-h-[65vh] overflow-y-auto">
        <Table className="min-w-full table-auto text-sm">
          <TableHead>
            <TableRow className="bg-gray-100 dark:bg-gray-700">
              <TableHeaderCell>#</TableHeaderCell>
              <TableHeaderCell>RUT</TableHeaderCell>
              <TableHeaderCell>Nombre</TableHeaderCell>
              <TableHeaderCell>Periodo</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell>Monto</TableHeaderCell>
              {/* <TableHeaderCell>Incluido</TableHeaderCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => {
              const estadoActual = localChanges[item.id] || item.estado;
              return (
                <TableRow
                  key={item.id}
                  ref={index === data.length - 1 ? lastRowRef : null}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-600 ${
                    estadoActual === "pagado"
                      ? "bg-green-50 dark:bg-green-800"
                      : estadoActual === "rechazado"
                      ? "bg-red-50 dark:bg-red-800"
                      : ""
                  }`}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.rutTrabajador}</TableCell>
                  <TableCell>{item.nombreTrabajador}</TableCell>
                  <TableCell>{item.periodo}</TableCell>
                  <TableCell
                    onClick={() => handleEstadoClick(item)}
                    className="cursor-pointer"
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-sm font-medium shadow-sm ${
                        estadoActual === "pendiente"
                          ? "bg-yellow-300 text-yellow-900"
                          : estadoActual === "pagado"
                          ? "bg-green-300 text-green-900"
                          : "bg-red-300 text-red-900"
                      }`}
                    >
                      {estadoActual}
                    </span>
                  </TableCell>
                  <TableCell>
                    ${Intl.NumberFormat("es-CL").format(item.monto || 0)}
                  </TableCell>
                  {/* <TableCell>
                    {item.incluidoEnProduccion ? "Sí" : "No"}
                  </TableCell> */}
                </TableRow>
              );
            })}
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-3">
                  Cargando más registros...
                </TableCell>
              </TableRow>
            )}
            {!hasMore && !loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-3">
                  No hay más registros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 text-right space-x-2">
        {Object.keys(localChanges).length > 0 ? (
          <Button color="green" onClick={handleGuardarYCerrar} disabled={loading}>
            Guardar y Cerrar
            <span className="ml-2 bg-white text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full shadow inline-block">
              {Object.keys(localChanges).length}
            </span>
          </Button>
        ) : (
          <Button onClick={onClose} disabled={loading}>
            Cerrar
          </Button>
        )}
      </div>
    </div>
  );
};

PagexDetalleModal.modalSize = "max-w-5xl";
export default PagexDetalleModal;
