"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  TextInput,
} from "@tremor/react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import apiService from "@/app/api/apiService";
import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";
import { useModal } from "@/context/ModalContext";

const estados = [
  { value: "", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_proceso", label: "En proceso" },
  { value: "realizada", label: "Realizada" },
  { value: "completada", label: "Completada" },
  { value: "cerrada", label: "Cerrada" },
  { value: "no_localizado", label: "No localizado" },
  { value: "cancelada", label: "Cancelada" },
];

const limit = 10;

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return format(new Date(value), "dd MMM yyyy", { locale: es });
  } catch (_) {
    return value;
  }
};

const GestionVisitaDetalleModal = ({ gestionId, gestion = {}, onClose, onUpdated }) => {
  const { data: session } = useSession();
  const { socket } = useSocket(session?.accessToken);
  const { openModal } = useModal();

  const [summary, setSummary] = useState(gestion);
  const [detalles, setDetalles] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [visitadores, setVisitadores] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    estado: "",
    visitadorId: "",
  });

  const fetchSummary = useCallback(async () => {
    try {
      const response = await apiService.get(`/gestion-visita/${gestionId}`);
      const data = response.data?.data;
      if (data) {
        setSummary(data);
      }
    } catch (error) {
      console.error("Error cargando gestión de visitas", error);
    }
  }, [gestionId]);

  const fetchVisitadores = useCallback(async () => {
    try {
      const response = await apiService.get(`/detalle-visita/filters`, {
        params: { gestionVisitaId: gestionId },
      });
      const data = response.data?.data;
      if (data?.visitadores) {
        setVisitadores(data.visitadores);
      }
    } catch (error) {
      console.error("Error cargando visitadores", error);
      setVisitadores([]);
    }
  }, [gestionId]);

  const fetchDetalles = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit,
        offset: pageIndex * limit,
        search: filters.search || undefined,
        estado: filters.estado || undefined,
        visitadorId: filters.visitadorId || undefined,
      };
      const response = await apiService.get(
        `/gestion-visita/${gestionId}/detalles`,
        { params }
      );
      const payload = response.data || {};
      setDetalles(payload.data || []);
      setTotal(payload.total || 0);
      if (!summary?.id) {
        setSummary(payload.gestion || summary);
      }
    } catch (error) {
      console.error("Error cargando detalles de visitas", error);
      showErrorAlert("Error", "No se pudieron cargar las visitas de la gestión.");
      setDetalles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [gestionId, filters, pageIndex, summary?.id]);

  useEffect(() => {
    fetchSummary();
    fetchVisitadores();
  }, [fetchSummary, fetchVisitadores]);

  useEffect(() => {
    setPageIndex(0);
  }, [filters.search, filters.estado, filters.visitadorId, gestionId]);

  useEffect(() => {
    fetchDetalles();
  }, [fetchDetalles, pageIndex]);

  const refresh = useCallback(() => {
    fetchSummary();
    fetchDetalles();
    onUpdated?.();
  }, [fetchSummary, fetchDetalles, onUpdated]);

  useRealtimeEntity(socket, "detalleVisita", {
    onCreated: refresh,
    onUpdated: refresh,
    onDeleted: refresh,
  });

  const handleEdit = useCallback(
    (detalle) => {
      if (summary?.estado === "cerrada") {
        showErrorAlert(
          "Gestión cerrada",
          "Reabre la gestión para actualizar visitas individuales."
        );
        return;
      }
      openModal("visitaDetalleForm", {
        initialData: detalle,
        handleSubmit: async (formData) => {
          try {
            await apiService.patch(`/detalle-visita/${detalle.id}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            showSuccessAlert("Actualizado", "La visita fue actualizada correctamente.");
            refresh();
          } catch (error) {
            console.error("Error actualizando visita", error);
            showErrorAlert("Error", "No se pudo actualizar la visita seleccionada.");
            throw error;
          }
        },
      });
    },
    [openModal, refresh]
  );

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const resumenCards = useMemo(() => {
    if (!summary) return [];
    return [
      {
        label: "Empresa",
        value: summary.empresaRut,
      },
      {
        label: "Estado",
        value: summary.estado,
      },
      {
        label: "Planificadas",
        value: summary.totalPlanificadas ?? detalles.length,
      },
      {
        label: "Realizadas",
        value: summary.totalRealizadas ?? 0,
      },
      {
        label: "Tarifa por visita",
        value: summary.tarifaVisita ? `$${Number(summary.tarifaVisita).toLocaleString()}` : "—",
      },
      {
        label: "Certificado inicial",
        value: summary.certificadoInicialSignedUrl ? "Disponible" : "—",
        downloadUrl: summary.certificadoInicialSignedUrl || null,
      },
      {
        label: "Certificado final",
        value: summary.certificadoFinalSignedUrl ? "Disponible" : "—",
        downloadUrl: summary.certificadoFinalSignedUrl || null,
      },
      {
        label: "Archivo cierre",
        value: summary.archivoCierreSignedUrl ? "Disponible" : "—",
        downloadUrl: summary.archivoCierreSignedUrl || null,
      },
    ];
  }, [summary, detalles.length]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Gestión {summary?.folio || `#${gestionId}`}
          </h2>
          <p className="text-sm text-gray-500">
            Fecha gestión: {formatDate(summary?.fechaGestion)}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {resumenCards.map(({ label, value, downloadUrl }) => (
            <Card key={label} className="p-3 space-y-1">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
              {downloadUrl ? (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Descargar
                </a>
              ) : null}
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <TextInput
          placeholder="Buscar por trabajador o RUT"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
        <Select
          value={filters.estado}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, estado: value }))}
          placeholder="Estado"
        >
          {estados.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </Select>
        <Select
          value={filters.visitadorId}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, visitadorId: value }))}
          placeholder="Visitador"
        >
          <SelectItem value="">Todos</SelectItem>
          {visitadores.map((visitador) => (
            <SelectItem key={visitador.id} value={visitador.id?.toString()}>
              {[visitador.nombre, visitador.apellido].filter(Boolean).join(" ")}
            </SelectItem>
          ))}
        </Select>
        <Button
          variant="secondary"
          onClick={() => setFilters({ search: "", estado: "", visitadorId: "" })}
        >
          Limpiar filtros
        </Button>
      </div>

      <Card className="p-0 border border-gray-200">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Trabajador</TableHeaderCell>
              <TableHeaderCell>Visitador</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell>Programada</TableHeaderCell>
              <TableHeaderCell>Visita</TableHeaderCell>
              <TableHeaderCell>Costo</TableHeaderCell>
              <TableHeaderCell></TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Text className="text-sm text-gray-500">Cargando visitas...</Text>
                </TableCell>
              </TableRow>
            ) : detalles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Text className="text-sm text-gray-500">No hay visitas registradas con estos filtros.</Text>
                </TableCell>
              </TableRow>
            ) : (
              detalles.map((detalle) => (
                <TableRow key={detalle.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {[detalle.nombreTrabajador, detalle.apellidoTrabajador]
                          .filter(Boolean)
                          .join(" ")}
                      </span>
                      <span className="text-xs text-gray-500">{detalle.rutTrabajador}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {[detalle.nombreVisitador, detalle.apellidoVisitador]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge color="blue">
                      {(detalle.estado || "").replace(/_/g, " ") || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(detalle.fechaProgramada)}</TableCell>
                  <TableCell>{formatDate(detalle.fechaVisita)}</TableCell>
                  <TableCell>
                    {detalle.costoVisita
                      ? `$${Number(detalle.costoVisita).toLocaleString()}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => handleEdit(detalle)}
                    >
                      Actualizar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="flex items-center justify-between">
        <Text className="text-sm text-gray-500">
          Página {pageIndex + 1} de {totalPages}
        </Text>
        <div className="flex gap-2">
          <Button
            size="xs"
            variant="secondary"
            disabled={pageIndex === 0 || loading}
            onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
          >
            Anterior
          </Button>
          <Button
            size="xs"
            variant="secondary"
            disabled={pageIndex + 1 >= totalPages || loading}
            onClick={() =>
              setPageIndex((prev) =>
                prev + 1 < totalPages ? prev + 1 : prev
              )
            }
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};

GestionVisitaDetalleModal.modalSize = "max-w-6xl";
GestionVisitaDetalleModal.hideHeaderClose = false;

export default GestionVisitaDetalleModal;
