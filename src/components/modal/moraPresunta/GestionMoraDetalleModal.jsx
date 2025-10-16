
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import useActionFeedback from "@/hooks/useActionFeedback";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { useRole } from "@/context/RoleContext";

const tiposSecuencia = ["analisis", "pago requerido", "pagado", "regularizado"];

const siguienteTipoGestion = (actual) => {
  const idx = tiposSecuencia.indexOf(actual);
  return tiposSecuencia[(idx + 1) % tiposSecuencia.length];
};

const initialFilters = {
  rut: "",
  tipoGestion: "",
  estado: "",
};

const estadoOptions = ["pendiente", "completado", "rechazado"];

const GestionMoraDetalleModal = ({ gestionId, estadoGestion, onClose }) => {
  const { role } = useRole();
  const isLocked = estadoGestion === "cerrada";
  const canEdit = ["admin", "supervisor", "editor", "trabajador"].includes(role);
  const canManage = canEdit && !isLocked;
  const totalColumns = canManage ? 10 : 8;
  const [localChanges, setLocalChanges] = useState({});
  const [saving, setSaving] = useState(false);
  const { runWithFeedback } = useActionFeedback();
  const [gestionInfo, setGestionInfo] = useState(null);
  const [bulkReunifyLoading, setBulkReunifyLoading] = useState(false);
  const [bulkReunifyError, setBulkReunifyError] = useState("");
  const [manualExportLoading, setManualExportLoading] = useState(false);
  const [manualExportError, setManualExportError] = useState("");
  const [manualImportLoading, setManualImportLoading] = useState(false);
  const [manualImportError, setManualImportError] = useState("");
  const [manualDivisionState, setManualDivisionState] = useState({
    open: false,
    detalle: null,
    parteUno: "",
    parteDos: "",
  });
  const [manualDivisionError, setManualDivisionError] = useState("");
  const [manualDivisionLoading, setManualDivisionLoading] = useState(false);

  const manualImportInputRef = useRef(null);

  // Selección masiva y filtros locales
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkTipo, setBulkTipo] = useState("");

  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  const fetchFn = useCallback(
    async ({ offset, limit }) => {
      const res = await apiService.get(
        `/detalle-mora/gestion/${gestionId}/detalles`,
        {
          params: {
            offset,
            limit,
            rut: filters.rut || undefined,
            tipoGestion: filters.tipoGestion || undefined,
            estado: filters.estado || undefined,
          },
        }
      );
      const payload = res?.data?.data || {};
      if (payload.gestion) {
        setGestionInfo(payload.gestion);
      }
      const data = payload.data || [];
      const total = payload.total ?? 0;
      return { data, total };
    },
    [gestionId, filters]
  );

  const {
    data,
    total,
    loading,
    hasMore,
    lastRowRef,
    refetch,
  } = useInfiniteScroll({
    fetchFn,
    limit: 10,
    deps: [gestionId, filtersKey],
  });

  useEffect(() => {
    setSelectedIds(new Set());
  }, [filtersKey, gestionId]);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const selectedCount = selectedIds.size;

  const handleTipoGestionClick = (item) => {
    if (!canManage) return;
    const nuevoTipo = siguienteTipoGestion(
      localChanges[item.id] || item.tipoGestion
    );
    setLocalChanges((prev) => ({
      ...prev,
      [item.id]: nuevoTipo,
    }));
  };

  const toggleSelect = (id) => {
    if (!canManage) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allVisibleSelected = data.length > 0 && data.every((item) => selectedIds.has(item.id));

  const selectedRecords = useMemo(
    () => data.filter((item) => selectedIds.has(item.id)),
    [data, selectedIds]
  );

  const selectedNonComplement = useMemo(
    () => selectedRecords.filter((item) => !item.esComplemento),
    [selectedRecords]
  );

  const selectedComplements = useMemo(
    () => selectedRecords.filter((item) => item.esComplemento && item.esComplementoDeId),
    [selectedRecords]
  );

  const complementGroups = useMemo(() => {
    const map = new Map();
    selectedComplements.forEach((item) => {
      const parentId = item.esComplementoDeId;
      if (!parentId) return;
      const list = map.get(parentId) || [];
      list.push(item);
      map.set(parentId, list);
    });
    return map;
  }, [selectedComplements]);

  const validReunifyGroups = useMemo(() => {
    const groups = [];
    complementGroups.forEach((items, parentId) => {
      const hasIndex1 = items.some((item) => item.complementoIndex === 1);
      const hasIndex2 = items.some((item) => item.complementoIndex === 2);
      if (hasIndex1 && hasIndex2 && items.length === 2) {
        groups.push({ parentId, items });
      }
    });
    return groups;
  }, [complementGroups]);

  const totalComplementsSelected = selectedComplements.length;
  const validComplementsCount = validReunifyGroups.reduce(
    (sum, group) => sum + group.items.length,
    0
  );
  const canReunify =
    validComplementsCount > 0 && validComplementsCount === totalComplementsSelected;
  const reunifyIds = validReunifyGroups.flatMap((group) =>
    group.items.map((item) => item.id)
  );
  const totalReunifyAmount = validReunifyGroups.reduce((sum, group) => {
    const subtotal = group.items.reduce(
      (acc, item) => acc + Number(item.montoActualizado || 0),
      0
    );
    return sum + subtotal;
  }, 0);

  useEffect(() => {
    if (selectedCount === 0) {
      setBulkReunifyError("");
      setBulkReunifyLoading(false);
    }
  }, [selectedCount]);

  const bulkSplitTotalSeleccion = selectedNonComplement.reduce(
    (sum, item) => sum + Number(item.montoActualizado || 0),
    0
  );
  const bulkSplitInvalidCount = selectedRecords.length - selectedNonComplement.length;

  const toggleSelectAllVisible = () => {
    if (!canManage) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        data.forEach((item) => next.delete(item.id));
      } else {
        data.forEach((item) => next.add(item.id));
      }
      return next;
    });
  };

  const applyBulkTipo = () => {
    if (!bulkTipo || selectedIds.size === 0 || !canManage) return;
    setLocalChanges((prev) => {
      const next = { ...prev };
      selectedIds.forEach((id) => {
        next[id] = bulkTipo;
      });
      return next;
    });
  };

  const handleBulkReunify = useCallback(async () => {
    if (!canManage) return;
    if (!canReunify || bulkReunifyLoading) return;
    if (!reunifyIds.length) return;

    setBulkReunifyLoading(true);
    setBulkReunifyError("");

    try {
      await runWithFeedback({
        action: () =>
          apiService.post("/detalle-mora/reunir", {
            detalleIds: reunifyIds,
          }),
        loadingMessage: "Reuniendo selección...",
        successMessage: "Detalles reunificados correctamente.",
        errorMessage: "No se pudo reunificar la selección.",
      });

      await refetch();
      setSelectedIds(new Set());
    } catch (error) {
      const message = error?.response?.data?.message || error?.message;
      setBulkReunifyError(message || "No se pudo reunificar la selección.");
    } finally {
      setBulkReunifyLoading(false);
    }
  }, [canManage, canReunify, bulkReunifyLoading, reunifyIds, runWithFeedback, refetch]);

  const getComplementParts = useCallback(
    (parentId) => {
      const complementos = data.filter(
        (item) => item.esComplemento && item.esComplementoDeId === parentId
      );
      const parteUno = complementos.find((item) => item.complementoIndex === 1);
      const parteDos = complementos.find((item) => item.complementoIndex === 2);
      return {
        parteUno: parteUno
          ? String(Number(parteUno.montoActualizado || 0))
          : "",
        parteDos: parteDos
          ? String(Number(parteDos.montoActualizado || 0))
          : "",
      };
    },
    [data]
  );

  const handleOpenManualDivision = useCallback(
    (detalle) => {
      if (!detalle || !canManage) return;
      const partes = getComplementParts(detalle.id);
      setManualDivisionState({
        open: true,
        detalle,
        parteUno: partes.parteUno,
        parteDos: partes.parteDos,
      });
      setManualDivisionError("");
    },
    [getComplementParts, canManage]
  );

  const handleCloseManualDivision = useCallback(() => {
    setManualDivisionState({
      open: false,
      detalle: null,
      parteUno: "",
      parteDos: "",
    });
    setManualDivisionError("");
  }, []);

  const handleManualFieldChange = (field, value) => {
    if (!canManage) return;
    setManualDivisionState((prev) => ({
      ...prev,
      [field]: value,
    }));
    setManualDivisionError("");
  };

  const handleManualDivisionSubmit = async () => {
    if (!canManage || !manualDivisionState.detalle) return;

    const total = Number(manualDivisionState.detalle.montoActualizado || 0);
    const parteUnoNumber = Number(manualDivisionState.parteUno);
    const parteDosNumber = Number(manualDivisionState.parteDos);
    const tolerancia = 0.01;

    if (!Number.isFinite(parteUnoNumber) || parteUnoNumber <= 0) {
      setManualDivisionError("La Parte 1 debe ser un monto mayor a cero.");
      return;
    }

    if (!Number.isFinite(parteDosNumber) || parteDosNumber <= 0) {
      setManualDivisionError("La Parte 2 debe ser un monto mayor a cero.");
      return;
    }

    if (Math.abs(parteUnoNumber + parteDosNumber - total) > tolerancia) {
      setManualDivisionError("La suma de ambas partes debe coincidir con el monto original.");
      return;
    }

    setManualDivisionLoading(true);
    setManualDivisionError("");

    try {
      await runWithFeedback({
        action: () =>
          apiService.post("/detalle-mora/division-manual/aplicar", {
            detalleId: manualDivisionState.detalle.id,
            montoParteUno: parteUnoNumber,
            montoParteDos: parteDosNumber,
          }),
        loadingMessage: "Aplicando división manual...",
        successMessage: "División manual aplicada correctamente.",
        errorMessage: "No se pudo aplicar la división manual.",
      });

      handleCloseManualDivision();
      await refetch();
    } catch (error) {
      const message = error?.response?.data?.message || error?.message;
      setManualDivisionError(message || "No se pudo aplicar la división manual.");
    } finally {
      setManualDivisionLoading(false);
    }
  };

  const handlePrepareManualDivision = async () => {
    if (!canManage) return;
    if (!selectedNonComplement.length || isLocked) {
      setPrepareManualError(
        isLocked
          ? "La gestión está cerrada."
          : "Selecciona al menos un registro para preparar."
      );
      return;
    }

    const ids = selectedNonComplement.map((item) => item.id);
    setPrepareManualLoading(true);
    setPrepareManualError("");

    try {
      await runWithFeedback({
        action: () =>
          apiService.post("/detalle-mora/division-manual/preparar", {
            detalleIds: ids,
          }),
        loadingMessage: "Preparando división manual...",
        successMessage: "Complementos creados con montos en 0.",
        errorMessage: "No se pudo preparar la división manual.",
      });

      setSelectedIds(new Set());
      await refetch();
    } catch (error) {
      const message = error?.response?.data?.message || error?.message;
      setPrepareManualError(message || "No se pudo preparar la división manual.");
    } finally {
      setPrepareManualLoading(false);
    }
  };

  const handleManualExport = async () => {
    if (!canManage) return;
    const ids = selectedRecords.map((item) =>
      item.esComplemento ? item.esComplementoDeId : item.id
    );

    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    if (uniqueIds.length === 0) {
      setManualExportError("Selecciona al menos un registro válido para exportar.");
      return;
    }
    setManualExportLoading(true);
    setManualExportError("");

    try {
      const response = await apiService.post(
        "/detalle-mora/division-manual/export",
        { detalleIds: uniqueIds },
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const disposition = response.headers["content-disposition"];
      const match = disposition && disposition.match(/filename="?([^";]+)"?/i);
      const fileName = match && match[1] ? match[1] : "division_manual.xlsx";

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message;
      setManualExportError(message || "No se pudo exportar la plantilla.");
    } finally {
      setManualExportLoading(false);
    }
  };

  const handleManualImportClick = () => {
    if (!canManage || manualImportLoading) return;
    manualImportInputRef.current?.click();
  };

  const handleManualImportChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!canManage) {
      if (manualImportInputRef.current) {
        manualImportInputRef.current.value = "";
      }
      return;
    }

    setManualImportLoading(true);
    setManualImportError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      await runWithFeedback({
        action: () =>
          apiService.post("/detalle-mora/division-manual/import", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          }),
        loadingMessage: "Importando montos...",
        successMessage: "Importación completada.",
        errorMessage: "No se pudo importar la plantilla.",
      });

      await refetch();
    } catch (error) {
      const message = error?.response?.data?.message || error?.message;
      setManualImportError(message || "No se pudo importar la plantilla.");
    } finally {
      setManualImportLoading(false);
      if (manualImportInputRef.current) {
        manualImportInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAll = useCallback(async () => {
    if (!canManage) return;
    const registrosPorEliminar = total ?? 0;
    if (!registrosPorEliminar || registrosPorEliminar <= 0 || isLocked) return;
    const empresaTexto = gestionInfo?.empresaNombre
      ? `${gestionInfo.empresaNombre} (${gestionInfo.empresaRut})`
      : gestionInfo?.empresaRut || "esta gestión";
    const confirmado = window.confirm(
      `¿Eliminar los ${registrosPorEliminar} registros asociados a ${empresaTexto}? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    try {
      await runWithFeedback({
        action: () => apiService.delete(`/detalle-mora/gestion/${gestionId}`),
        loadingMessage: "Eliminando registros...",
        successMessage: "Se eliminaron todos los detalles de la gestión.",
        errorMessage: "No se pudieron eliminar los detalles de la gestión.",
      });

      setSelectedIds(new Set());
      setBulkReunifyError("");
      await refetch();
    } catch (error) {
      console.error("Error al eliminar todos los detalles:", error);
    }
  }, [canManage, total, isLocked, gestionInfo, runWithFeedback, gestionId, refetch]);

  const pendingChanges = Object.keys(localChanges).length;
  const totalRegistros = total ?? 0;
  const gestionLabel = gestionInfo?.folio
    ? `Gestión ${gestionInfo.folio}`
    : `Gestión #${gestionId}`;
  const empresaLabel = gestionInfo
    ? gestionInfo.empresaNombre
      ? `${gestionInfo.empresaNombre} (${gestionInfo.empresaRut})`
      : gestionInfo.empresaRut
    : null;
  const entidadLabel = gestionInfo?.entidadNombre || null;

  const hasActiveFilters = Boolean(
    filters.rut || filters.tipoGestion || filters.estado
  );

  const filtersChanged = useMemo(() => {
    return JSON.stringify(draftFilters) !== JSON.stringify(filters);
  }, [draftFilters, filters]);

  const handleFilterChange = (field, value) => {
    setDraftFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    setFilters({
      rut: draftFilters.rut.trim(),
      tipoGestion: draftFilters.tipoGestion,
      estado: draftFilters.estado,
    });
  };

  const resetFilters = () => {
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
  };

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      }),
    []
  );

  const handleGuardarYCerrar = async () => {
    if (!canManage) {
      onClose();
      return;
    }
    const cambios = Object.entries(localChanges).map(([id, tipoGestion]) => ({
      id: parseInt(id, 10),
      tipoGestion,
    }));
    if (cambios.length === 0) return onClose();

    try {
      setSaving(true);
      await runWithFeedback({
        action: () => apiService.patch("/detalle-mora/tipo-gestion-batch", { cambios }),
        loadingMessage: "Guardando cambios...",
        successMessage: "Cambios guardados correctamente",
        errorMessage: "No se pudieron guardar los cambios",
      });
      setLocalChanges({});
      onClose();
    } catch (error) {
      console.error("Error al guardar cambios:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 rounded-3xl bg-white p-6 dark:bg-slate-900">
      <input
        type="file"
        accept=".xlsx"
        ref={manualImportInputRef}
        onChange={handleManualImportChange}
        className="hidden"
      />
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-md border border-indigo-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-500 dark:border-indigo-500/40 dark:bg-slate-900 dark:text-indigo-200">
              Gestión de Mora
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                {gestionLabel}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Empresa: {empresaLabel || "—"}
              </p>
              {entidadLabel && (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Entidad: {entidadLabel}
                </p>
              )}
            </div>
            {pendingChanges > 0 && canEdit && (
              <span className="inline-flex items-center gap-2 rounded-md bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                <span className="h-2 w-2 rounded-sm bg-amber-500"></span>
                {pendingChanges} cambio{pendingChanges > 1 ? "s" : ""} pendiente{pendingChanges > 1 ? "s" : ""} por guardar
              </span>
            )}
          </div>

          <div className="flex h-full flex-col items-start justify-between gap-2 text-sm font-medium text-slate-600 dark:text-slate-200 md:items-end">
            <div className="text-right">
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {totalRegistros}
              </p>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Registros totales
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-3 py-1 font-medium ${
                  hasActiveFilters
                    ? "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200"
                    : "bg-slate-200/60 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-sm bg-current"></span>
                {hasActiveFilters ? "Filtros activos" : "Sin filtros"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Filtros rápidos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ajusta el resultado sin salir de la gestión.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={applyFilters}
              disabled={!filtersChanged}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              Aplicar filtros
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              RUT trabajador
            </label>
            <input
              type="text"
              value={draftFilters.rut}
              onChange={(e) => handleFilterChange("rut", e.target.value)}
              placeholder="Ej. 12345678-9"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Tipo de gestión
            </label>
            <select
              value={draftFilters.tipoGestion}
              onChange={(e) => handleFilterChange("tipoGestion", e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Todos</option>
              {tiposSecuencia.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Estado general
            </label>
            <select
              value={draftFilters.estado}
              onChange={(e) => handleFilterChange("estado", e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Todos</option>
              {estadoOptions.map((est) => (
                <option key={est} value={est}>
                  {est.charAt(0).toUpperCase() + est.slice(1)}
              </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>
            {hasActiveFilters
              ? `Mostrando ${data.length} de ${totalRegistros} registros filtrados.`
              : `Mostrando ${data.length} de ${totalRegistros} registros totales.`}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-indigo-500 underline-offset-2 hover:underline"
            >
              Quitar filtros
            </button>
          )}
        </div>
      </div>

      {canManage && (
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={bulkTipo}
              onChange={(e) => setBulkTipo(e.target.value)}
              className="min-w-[200px] rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Asignar estado...</option>
              {tiposSecuencia.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              onClick={applyBulkTipo}
              disabled={!bulkTipo || selectedIds.size === 0}
              className="whitespace-nowrap rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              title="Aplicar a seleccionados"
            >
              Aplicar ({selectedIds.size})
            </button>
            {selectedIds.size > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-300">
                {selectedIds.size} seleccionado{selectedIds.size === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleDeleteAll}
              disabled={totalRegistros === 0}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:border-red-100 disabled:text-red-300"
            >
              Eliminar todos
            </button>
          </div>
        </div>
      )}

      {selectedRecords.length > 0 && canManage && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="space-y-3 text-xs.text-slate-700 dark:text-indigo-100">
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-200">
                {selectedRecords.length} registro{selectedRecords.length > 1 ? "s" : ""} seleccionado{selectedRecords.length > 1 ? "s" : ""}
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-indigo-500/30">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.18em]">Para dividir</p>
                  <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                    {selectedNonComplement.length || 0}
                  </p>
                  {selectedNonComplement.length > 0 && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-300">
                      {currencyFormatter.format(bulkSplitTotalSeleccion)}
                    </p>
                  )}
                </div>
                <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-indigo-500/30">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.18em]">Complementos</p>
                  <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                    {totalComplementsSelected || 0}
                  </p>
                  {totalComplementsSelected > 0 && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-300">
                      {currencyFormatter.format(totalReunifyAmount)}
                    </p>
                  )}
                </div>
                <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-indigo-500/30">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.18em]">Plantilla</p>
                  <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                    {totalComplementsSelected ? "Lista" : "Pendiente"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-300">Define montos manualmente</p>
                </div>
              </div>

              {bulkSplitInvalidCount > 0 && selectedNonComplement.length > 0 && (
                <p className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-rose-600 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-200">
                  <span className="h-2 w-2 rounded-sm bg-current"></span>
                  {bulkSplitInvalidCount} complemento{bulkSplitInvalidCount === 1 ? "" : "s"} seleccionado{bulkSplitInvalidCount === 1 ? "" : "s"} se excluye de la división manual.
                </p>
              )}
              {!canReunify && totalComplementsSelected > 0 && (
                <p className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200">
                  <span className="h-2 w-2 rounded-sm bg-current"></span>
                  Selecciona ambas partes (1 y 2) de cada detalle para poder reunificarlos.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-indigo-500/40">
                <label className="text-xs font-semibold.uppercase tracking-wide text-emerald-600 dark:text-emerald-200">
                  Reunificar complementos
                </label>
                <button
                  type="button"
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  onClick={handleBulkReunify}
                  disabled={!canManage || !canReunify || bulkReunifyLoading}
                >
                  {bulkReunifyLoading ? "Reuniendo..." : "Reunificar selección"}
                </button>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-indigo-500/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  División manual
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                  Ajusta los montos ingresándolos caso a caso o mediante la plantilla de Excel.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-xs font-semibold text-indigo-600 transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 dark:border-indigo-500/30 dark:bg-slate-900/40 dark:text-indigo-200"
                    onClick={handleManualExport}
                    disabled={
                      !canManage ||
                      manualExportLoading ||
                      selectedNonComplement.length === 0
                    }
                  >
                    {manualExportLoading ? "Generando..." : "Descargar plantilla"}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 dark:border-emerald-500/30 dark:bg-slate-900/40 dark:text-emerald-200"
                    onClick={handleManualImportClick}
                    disabled={!canManage || manualImportLoading}
                  >
                    {manualImportLoading ? "Importando..." : "Importar plantilla"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {bulkReunifyError && (
            <p className="mt-2 text-xs font-semibold text-rose-500 dark:text-rose-300">{bulkReunifyError}</p>
          )}
          {manualExportError && (
            <p className="mt-2 text-xs font-semibold text-rose-500 dark:text-rose-300">{manualExportError}</p>
          )}
          {manualImportError && (
            <p className="mt-2 text-xs font-semibold text-rose-500 dark:text-rose-300">{manualImportError}</p>
          )}
        </div>
      )}
      

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm max-h-[65vh] overflow-y-auto dark:border-slate-700 dark:bg-slate-900/60">
        <Table className="min-w-full table-auto text-sm text-slate-700 dark:text-slate-100">
          <TableHead>
            <TableRow className="bg-white text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:bg-slate-900">
              {canManage && (
                <TableHeaderCell className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    disabled={data.length === 0}
                  />
                </TableHeaderCell>
              )}
              <TableHeaderCell className="px-3 py-3">#</TableHeaderCell>
              <TableHeaderCell className="px-3 py-3">RUT</TableHeaderCell>
              <TableHeaderCell className="px-3 py-3">Nombre</TableHeaderCell>
              <TableHeaderCell className="px-3 py-3">Periodo</TableHeaderCell>
              <TableHeaderCell className="px-3 py-3">Tipo</TableHeaderCell>
              <TableHeaderCell className="px-3 py-3">Estado</TableHeaderCell>
              <TableHeaderCell className="px-3 py-3">Monto</TableHeaderCell>
              <TableHeaderCell className="px-3 py-3">Incluido</TableHeaderCell>
              {canManage && (
                <TableHeaderCell className="px-3 py-3">Acciones</TableHeaderCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => {
              const tipo = localChanges[item.id] || item.tipoGestion;
              const estado =
                tipo === "pagado" || tipo === "regularizado"
                  ? "completado"
                  : "pendiente";

              const baseRowClass =
                "border-b border-slate-100 bg-white transition-colors hover:bg-indigo-50/60 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-800";
              const tipoColorClass =
                tipo === "pago requerido"
                  ? "bg-rose-50/70 dark:bg-rose-900/30"
                  : tipo === "pagado"
                  ? "bg-sky-50/70 dark:bg-sky-900/30"
                  : tipo === "regularizado"
                  ? "bg-emerald-50/70 dark:bg-emerald-900/30"
                  : tipo === "analisis"
                  ? "bg-amber-50/70 dark:bg-amber-900/30"
                  : "";

              return (
                <TableRow
                  key={item.id}
                  ref={index === data.length - 1 ? lastRowRef : null}
                  className={`${baseRowClass} ${tipoColorClass}`}
                >
                  {canManage && (
                    <TableCell className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-3 py-3 font-medium text-slate-800 dark:text-slate-100">
                    {item.trabajadorRut}
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-700 dark:text-slate-100">
                        {item.nombreCompleto}
                      </span>
                      {item.esComplemento && (
                        <span className="rounded-full bg-indigo-600/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
                          Parte {item.complementoIndex}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3 text-sm text-slate-600 dark:text-slate-200">
                    {item.periodoPago}
                  </TableCell>
                  <TableCell
                    onClick={canManage ? () => handleTipoGestionClick(item) : undefined}
                    className={`px-3 py-3 ${canManage ? "cursor-pointer" : ""}`}
                  >
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize tracking-wide shadow-sm ${
                        tipo === "analisis"
                          ? "bg-amber-100 text-amber-700"
                          : tipo === "pago requerido"
                          ? "bg-rose-100 text-rose-700"
                          : tipo === "pagado"
                          ? "bg-sky-100 text-sky-700"
                          : tipo === "regularizado"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {tipo.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-3 capitalize font-medium text-slate-700 dark:text-slate-200">
                    {estado}
                  </TableCell>
                  <TableCell className="px-3 py-3 font-semibold text-slate-800 dark:text-slate-100">
                    {currencyFormatter.format(item.montoActualizado)}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-sm text-slate-600 dark:text-slate-200">
                    {item.incluidoEnProduccion ? "Sí" : "No"}
                  </TableCell>
                  {canManage && (
                    <TableCell className="px-3 py-3">
                      {!item.esComplemento && (
                        <button
                          type="button"
                          className="text-xs font-semibold text-indigo-600 underline-offset-4 transition hover:text-indigo-500 hover:underline disabled:text-slate-400"
                          onClick={() => handleOpenManualDivision(item)}
                          disabled={!canManage}
                        >
                          {item.estaDividido ? "Editar partes" : "Dividir manual"}
                        </button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {loading && (
              <TableRow>
                <TableCell colSpan={totalColumns} className="text-center text-gray-500 py-3">
                  Cargando más registros...
                </TableCell>
              </TableRow>
            )}
            {!hasMore && !loading && data.length > 0 && (
              <TableRow>
                <TableCell colSpan={totalColumns} className="text-center text-gray-400 py-3">
                  No hay más registros.
                </TableCell>
              </TableRow>
            )}
            {!loading && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={totalColumns} className="text-center text-gray-400 py-3">
                  Sin resultados con los filtros actuales.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 text-right space-x-2">
        {pendingChanges > 0 && canManage ? (
          <Button
            color="green"
            onClick={handleGuardarYCerrar}
            disabled={!canManage || loading || saving}
          >
            {saving ? "Guardando..." : "Guardar y Cerrar"}
            <span className="ml-2 bg-white text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full shadow inline-block">
              {pendingChanges}
            </span>
          </Button>
        ) : (
          <Button onClick={onClose} disabled={loading || saving}>
            Cerrar
          </Button>
        )}
      </div>
      {manualDivisionState.open && manualDivisionState.detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900/95 dark:ring-0">
            <div className="rounded-xl bg-slate-50 p-4 shadow-inner dark:bg-slate-800/60">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                División manual
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {manualDivisionState.detalle.nombreCompleto} · RUT {manualDivisionState.detalle.trabajadorRut}
              </p>
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Monto original
              </p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {currencyFormatter.format(manualDivisionState.detalle.montoActualizado)}
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Monto Parte 1
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={manualDivisionState.parteUno}
                  onChange={(e) => handleManualFieldChange("parteUno", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-indigo-500/40 dark:bg-slate-900 dark:text-white"
                  disabled={!canManage}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Monto Parte 2
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={manualDivisionState.parteDos}
                  onChange={(e) => handleManualFieldChange("parteDos", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-indigo-500/40 dark:bg-slate-900 dark:text-white"
                  disabled={!canManage}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                La suma de las partes debe coincidir con el monto original del registro.
              </p>
              {manualDivisionError && (
                <p className="text-xs font-semibold text-rose-500 dark:text-rose-300">{manualDivisionError}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                onClick={handleCloseManualDivision}
                disabled={manualDivisionLoading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                onClick={handleManualDivisionSubmit}
                disabled={!canManage || manualDivisionLoading}
              >
                {manualDivisionLoading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

GestionMoraDetalleModal.modalSize = "max-w-7xl";
export default GestionMoraDetalleModal;
