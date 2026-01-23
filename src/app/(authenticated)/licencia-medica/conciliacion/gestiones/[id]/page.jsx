"use client";
import { useRole } from "@/context/RoleContext";
import { useSession } from "next-auth/react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";
import { useParams, useRouter } from "next/navigation";
import apiService from "@/app/api/apiService";
import Titulo from "@/components/title/Title";
import {
  Card,
  Tab,
  TabList,
  TabGroup,
  TabPanel,
  TabPanels,
  Badge,
} from "@tremor/react";
import {
  BoltIcon,
  XCircleIcon,
  ArrowPathIcon,
  ArrowUpOnSquareIcon,
  FolderOpenIcon,
  Bars3BottomLeftIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
} from "@heroicons/react/24/outline";
import useActionFeedback from "@/hooks/useActionFeedback";
import { useModal, ModalProvider } from "@/context/ModalContext";
import { showConfirmationAlert } from "@/utils/alerts";
import GenericTableWithDetail from "@/components/table/GenericTableWithDetail";
import ModalManager from "@/components/modal/ModalManager";
import configuracion from "@/config/module/conciliacion/conciliacion.config";
import licenciasConfig from "@/config/module/licencias/licenciasMedicas.config";
import anticiposConfig from "@/config/module/anticipos/anticipos.config";
import subsidiosConfig from "@/config/module/subsidios/subsidios.config";

import useDynamicActions from "@/hooks/useDynamicActions";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

const StatCard = ({ title, count, icon: Icon, isLoading, color = "blue" }) => (
  <Card className="flex flex-row items-center justify-between p-4 shadow-tremor-input transition duration-150 ease-in-out hover:shadow-tremor-ring">
    <div className="flex items-center space-x-4">
      <div
        className={`flex-shrink-0 rounded-full p-3 ${
          color === "blue"
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
            : ""
        } ${
          color === "orange"
            ? "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
            : ""
        } ${
          color === "emerald"
            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300"
            : ""
        }`}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <h4 className="text-tremor-default font-medium text-tremor-content-subtle dark:text-dark-tremor-content-subtle">
          {title}
        </h4>
        {isLoading ? (
          <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong animate-pulse">
            Cargando...
          </p>
        ) : (
          <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            {count}
          </p>
        )}
      </div>
    </div>
  </Card>
);

const ActionHeader = ({
  gestion,
  isEditable,
  onCerrar,
  onReconciliar,
  onAnularYReasignar,
  onReabrir,
  onVolver,
  onCargarArchivo,
  canDeleteAll,
  onDeleteAll,
  isReadOnly,
}) => {
  const dataTypes = [
    {
      key: "licencias",
      label: "Licencias",
      onUpload: () => onCargarArchivo("licencias"),
      onDelete: () => onDeleteAll("licencias"),
    },
    {
      key: "anticipos",
      label: "Anticipos",
      onUpload: () => onCargarArchivo("anticipos"),
      onDelete: () => onDeleteAll("anticipos"),
    },
    {
      key: "subsidios",
      label: "Subsidios",
      onUpload: () => onCargarArchivo("subsidios"),
      onDelete: () => onDeleteAll("subsidios"),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <Titulo
            title={`EXPEDIENTE: ${gestion.folioInterno}`}
            subtitle={`Periodo: ${gestion.periodo}`}
          />
          <p className="mt-1 text-tremor-default text-tremor-content">
            Empresa: <span className="font-semibold">{gestion.empresaRut}</span>
          </p>
        </div>
        <Badge
          size="lg"
          color={
            gestion.estado === "cerrada"
              ? "emerald"
              : gestion.estado === "reabierta"
              ? "orange"
              : gestion.estado === "anulada"
              ? "red"
              : "gray"
          }
          className="capitalize"
        >
          {gestion.estado.replace("_", " ")}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-y py-3">
        {!isReadOnly &&
          (gestion.estado === "cerrada" ? (
            <button
              onClick={onReabrir}
              className="flex items-center space-x-1 whitespace-nowrap rounded-tremor-small bg-red-600 px-4 py-2 text-tremor-default font-medium text-white shadow-tremor-input transition hover:bg-red-700"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>Reabrir (Rechazar Producción)</span>
            </button>
          ) : gestion.estado === "anulada" ? (
            <p className="font-semibold text-red-600">
              Esta gestión está ANULADA y no permite acciones.
            </p>
          ) : (
            isEditable && (
              <>
                <button
                  onClick={onCerrar}
                  className="flex items-center space-x-1 whitespace-nowrap rounded-tremor-small bg-tremor-brand px-4 py-2 text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input transition hover:bg-tremor-brand-emphasis"
                >
                  <BoltIcon className="h-4 w-4" />
                  <span>Cerrar Gestión</span>
                </button>
                <button
                  onClick={onReconciliar}
                  className="flex items-center space-x-1 whitespace-nowrap rounded-tremor-small border border-tremor-border px-4 py-2 text-tremor-default font-medium text-tremor-content shadow-tremor-input hover:bg-tremor-background-subtle dark:hover:bg-dark-tremor-background-subtle"
                >
                  <FolderOpenIcon className="h-4 w-4" />
                  <span>Reconciliar Huérfanos</span>
                </button>
                <button
                  onClick={onAnularYReasignar}
                  className="flex items-center space-x-1 whitespace-nowrap rounded-tremor-small bg-yellow-500 px-4 py-2 text-tremor-default font-medium text-white shadow-tremor-input transition hover:bg-yellow-600"
                >
                  <XCircleIcon className="h-4 w-4" />
                  <span>Anular Gestión</span>
                </button>
              </>
            )
          ))}
        <button
          onClick={onVolver}
          className="ml-auto flex items-center space-x-1 whitespace-nowrap rounded-tremor-small border border-tremor-border px-4 py-2 text-tremor-default font-medium text-tremor-content shadow-tremor-input"
        >
          <Bars3BottomLeftIcon className="h-4 w-4" />
          <span>Volver a la Lista</span>
        </button>
      </div>

      {!isReadOnly && (
        <div className="grid grid-cols-3 gap-4">
          {dataTypes.map(({ key, label, onUpload, onDelete }) => (
            <div key={key} className="flex flex-col space-y-2">
              <h4 className="text-tremor-default font-medium text-tremor-content-strong">
                {label}
              </h4>
              <div className="flex space-x-2">
                <button
                  onClick={onUpload}
                  className="flex-1 flex items-center justify-center space-x-1 whitespace-nowrap rounded-tremor-small bg-tremor-brand px-3 py-2 text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input transition hover:bg-tremor-brand-emphasis disabled:opacity-50"
                  disabled={!isEditable}
                >
                  <ArrowUpOnSquareIcon className="h-4 w-4" />
                  <span>Cargar</span>
                </button>
                {canDeleteAll && (
                  <button
                    onClick={onDelete}
                    className="rounded-tremor-small border border-red-300 px-3 py-2 text-tremor-default font-medium text-red-600 shadow-tremor-input hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30 disabled:opacity-50"
                    disabled={!isEditable}
                    title={`Borrar todos los ${label}`}
                  >
                    <XCircleIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ExpedienteContent = () => {
  const { role } = useRole();
  const params = useParams();
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const { runWithFeedback } = useActionFeedback();
  const gestionId = params.id;
  const LIMIT_POR_PAGINA = 20; // Define un límite estándar
  const canDeleteAll = useMemo(() => role && role !== 'cliente', [role]);

  // --- Hook para Licencias ---
  const {
    data: licenciasData,
    loading: licenciasLoading,
    total: licenciasTotal,
    lastRowRef: licenciasLastRowRef,
    refetch: licenciasRefetch,
  } = useInfiniteScroll({
    // La convertimos en una función async para poder usar await
    fetchFn: async ({ offset, limit }) => {
      try {
        const response = await apiService.get(
          `/licencias-medicas?gestionLicenciaId=${gestionId}&offset=${offset}&limit=${limit}`
        );

        return {
          data: response.data.data,
          total: response.data.total,
        };
      } catch (error) {
        console.error("Error fetching licencias:", error);

        return { data: [], total: 0 };
      }
    },
    limit: LIMIT_POR_PAGINA,
    deps: [gestionId],
  });

  // --- Hook para Anticipos ---
  const {
    data: anticiposData,
    loading: anticiposLoading,
    total: anticiposTotal,
    lastRowRef: anticiposLastRowRef,
    refetch: anticiposRefetch,
  } = useInfiniteScroll({
    // La convertimos en una función async para poder usar await
    fetchFn: async ({ offset, limit }) => {
      try {
        const response = await apiService.get(
          `/anticipos?gestionLicenciaId=${gestionId}&offset=${offset}&limit=${limit}`
        );

        return {
          data: response.data.data,
          total: response.data.total,
        };
      } catch (error) {
        console.error("Error fetching licencias:", error);

        return { data: [], total: 0 };
      }
    },
    limit: LIMIT_POR_PAGINA,
    deps: [gestionId],
  });

  // --- Hook para Subsidios ---
  const {
    data: subsidiosData,
    loading: subsidiosLoading,
    total: subsidiosTotal,
    lastRowRef: subsidiosLastRowRef,
    refetch: subsidiosRefetch,
  } = useInfiniteScroll({
    // La convertimos en una función async para poder usar await
    fetchFn: async ({ offset, limit }) => {
      try {
        const response = await apiService.get(
          `/subsidios?gestionLicenciaId=${gestionId}&offset=${offset}&limit=${limit}`
        );

        return {
          data: response.data.data,
          total: response.data.total,
        };
      } catch (error) {
        console.error("Error fetching licencias:", error);

        return { data: [], total: 0 };
      }
    },
    limit: LIMIT_POR_PAGINA,
    deps: [gestionId],
  });

  const [gestion, setGestion] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isEditable = gestion
    ? ["pendiente", "en_proceso", "reabierta"].includes(gestion.estado)
    : false;

  const dynamicLicenciasConfig = useDynamicActions(licenciasConfig, isEditable);
  const dynamicAnticiposConfig = useDynamicActions(anticiposConfig, isEditable);
  const dynamicSubsidiosConfig = useDynamicActions(subsidiosConfig, isEditable);

  const isReadOnly = role === "cliente";
  const canEdit =
    !isReadOnly && licenciasConfig.permissions.edit.includes(role);
  const canDelete =
    !isReadOnly && licenciasConfig.permissions.delete.includes(role);

  const fetchData = useCallback(async () => {
    if (!gestionId) return;
    setLoading(true);
    setError(null);
    try {
      const gestionRes = await apiService.get(`/gestion-licencia/${gestionId}`);
      setGestion(gestionRes.data.data);
    } catch (err) {
      console.error("Error fetching gestion data:", err);
      setError("No se pudo cargar el folio de la gestión.");
    } finally {
      setLoading(false);
    }
  }, [gestionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Métricas del periodo ---
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const fetchMetrics = useCallback(async () => {
    if (!gestionId) return;
    setMetricsLoading(true);
    try {
      const res = await apiService.get(`/gestion-licencia/${gestionId}/metrics`);
      setMetrics(res?.data?.data || null);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('No se pudieron cargar métricas de la gestión', e);
    } finally {
      setMetricsLoading(false);
    }
  }, [gestionId]);

  // Socket: refrescar métricas y listas solo cuando hay cambios
  const { data: session } = useSession();
  const token = session?.accessToken;
  const { socket, isConnected, joinRoom } = useSocket(token);

  useEffect(() => {
    if (isConnected && gestionId) {
      joinRoom("gestionLicencia", gestionId);
    }
  }, [isConnected, gestionId, joinRoom]);

  // Eventos para licencias, anticipos y subsidios
  useRealtimeEntity(socket, "licencia", {
    onCreated: () => { licenciasRefetch(); fetchMetrics(); },
    onUpdated: () => { licenciasRefetch(); fetchMetrics(); },
    onDeleted: () => { licenciasRefetch(); fetchMetrics(); },
  });
  useRealtimeEntity(socket, "anticipo", {
    onCreated: () => { anticiposRefetch(); fetchMetrics(); },
    onUpdated: () => { anticiposRefetch(); fetchMetrics(); },
    onDeleted: () => { anticiposRefetch(); fetchMetrics(); },
  });
  useRealtimeEntity(socket, "subsidio", {
    onCreated: () => { subsidiosRefetch(); fetchMetrics(); },
    onUpdated: () => { subsidiosRefetch(); fetchMetrics(); },
    onDeleted: () => { subsidiosRefetch(); fetchMetrics(); },
  });

  // Cargar métricas iniciales
  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

const handleCargarArchivo = (tipo) => {
    // Mapeo para encontrar la función de refetch correcta para cada tipo
    const refetchMap = {
        licencias: licenciasRefetch,
        anticipos: anticiposRefetch,
        subsidios: subsidiosRefetch,
    };

    const config = {
      licencias: {
        title: `Cargar Licencias para ${gestion.folioInterno}`,
        endpoint: `/licencias-medicas/bulk-create`,
      },
      anticipos: {
        title: `Cargar Anticipos para ${gestion.folioInterno}`,
        endpoint: `/anticipos/bulk-create`,
      },
      subsidios: {
        title: `Cargar Subsidios para ${gestion.folioInterno}`,
        endpoint: `/subsidios/bulk-create`,
      },
    }[tipo];

    openModal("cargaMasiva", {
      title: config.title,
      endpoint: config.endpoint,
      method: "POST",
      refreshData: refetchMap[tipo], 
      gestionId: gestion.id,
    });
};

  const handleCerrar = async () => {
    const confirm = await showConfirmationAlert(
      "¿Está seguro de que desea cerrar esta gestión?",
      "Esta acción generará una producción y la gestión ya no podrá ser editada directamente."
    );
    if (confirm) {
      await runWithFeedback({
        action: () => apiService.post(`/gestion-licencia/${gestion.id}/cerrar`),
        loadingMessage: "Cerrando gestión y generando producción...",
        successMessage: "¡Gestión cerrada y producción generada exitosamente!",
        errorMessage:
          "No se pudo cerrar la gestión. Verifique que tenga datos para procesar.",
      });
      fetchData();
    }
  };

  const handleDeleteAll = async (tipo) => {
    if (!gestion) return;
    const countMap = { licencias: licenciasTotal, anticipos: anticiposTotal, subsidios: subsidiosTotal };
    const confirm = await showConfirmationAlert(
      `Borrar todos los ${tipo} (${countMap[tipo] || 0})`,
      `Se eliminarán definitivamente todos los ${tipo} de esta gestión que no estén producidos. ¿Deseas continuar?`
    );
    if (!confirm) return;
    const endpointMap = {
      licencias: `/gestion-licencia/${gestion.id}/licencias`,
      anticipos: `/gestion-licencia/${gestion.id}/anticipos`,
      subsidios: `/gestion-licencia/${gestion.id}/subsidios`,
    };
    await runWithFeedback({
      action: () => apiService.delete(endpointMap[tipo]),
      loadingMessage: `Eliminando ${tipo}...`,
      successMessage: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} eliminados correctamente`,
      errorMessage: `No se pudieron eliminar los ${tipo}`,
    });
    // Refrescar listas y métricas
    licenciasRefetch();
    anticiposRefetch();
    subsidiosRefetch();
    fetchMetrics();
  };

  const handleAnular = () => {
    openModal("anularGestion", {
      title: `Anular Gestión ${gestion.folioInterno}`,
      endpoint: `/gestion-licencia/${gestion.id}/anular`,
      method: "POST",
      successMessage: "Gestión anulada correctamente.",
      // Al terminar, refresca los datos de esta página y cierra el modal de anulación
      refreshData: () => {
        fetchData();
        closeModal("anularGestion");
      },
    });
  };

  const handleReconciliarHuerfanos = async () => {
    const confirm = await showConfirmationAlert(
      "Reconciliar huérfanos",
      "Esto intentará vincular subsidios huérfanos de esta gestión y promoverlos para su procesamiento."
    );
    if (!confirm) return;
    await runWithFeedback({
      action: () => apiService.post(`/gestion-licencia/${gestion.id}/reconciliar-huerfanos`),
      loadingMessage: "Reconciliando huérfanos...",
      successMessage: "Reconciliación completada.",
      errorMessage: "No se pudo reconciliar huérfanos.",
    });
    // Refrescar datasets
    licenciasRefetch();
    anticiposRefetch();
    subsidiosRefetch();
    fetchData();
  };
  const handleReabrir = () => {
    openModal("reabrirGestion", {
      title: `Reabrir Gestión ${gestion.folioInterno}`,
      endpoint: `/gestion-licencia/${gestion.id}/reabrir`,
      method: "POST",
      successMessage: "Gestión reabierta y producción revertida correctamente.",
      // Al terminar, refresca los datos y cierra el modal de reapertura
      refreshData: () => {
        fetchData();
        closeModal("reabrirGestion");
      },
    });
  };

  // --- HANDLERS PARA CRUD DE ITEMS INDIVIDUALES ---

  const handleAddItem = (tipo) => {
    const modalMap = {
      licencia: "editarLicencia",
      anticipo: "editarAnticipo",
      subsidio: "editarSubsidio",
    };
    openModal(modalMap[tipo], {
      isEditMode: false,
      refreshData: fetchData,
      // Pre-poblamos la gestión y la empresa para el nuevo registro
      initialData: {
        gestionLicenciaId: gestion.id,
        empresaRut: gestion.empresaRut,
      },
    });
  };

  const handleEditItem = (item, tipo) => {
    const modalMap = {
      licencia: "editarLicencia",
      anticipo: "editarAnticipo",
      subsidio: "editarSubsidio",
    };
    openModal(modalMap[tipo], {
      initialData: item,
      isEditMode: true,
      refreshData: fetchData,
    });
  };

  // Actualiza tu handler de eliminación
  // const handleDeleteItem = async (item, tipo) => {
  //    console.log("🔎 Item recibido en handleDeleteItem:", item); // <--
  //   const confirm = await showConfirmationAlert(
  //     `¿Está seguro de eliminar este registro de ${tipo}?`
  //   );
  //   if (confirm) {
  //     const endpoints = {
  //       licencia: `/licencias-medicas/${item.id}`,
  //       anticipo: `/anticipo/${item.id}`,
  //       subsidio: `/subsidio/${item.id}`,
  //     };
  //     const refetchFns = {
  //       licencia: licenciasRefetch,
  //       anticipo: anticiposRefetch,
  //       subsidio: subsidiosRefetch,
  //     };

  //     await runWithFeedback({
  //       action: () => apiService.delete(endpoints[tipo]),
  //       loadingMessage: `Eliminando ${tipo}...`,
  //       successMessage: `¡${tipo} eliminado correctamente!`,
  //       errorMessage: `No se pudo eliminar el ${tipo}.`,
  //     });

  //     refetchFns[tipo]();
  //   }
  // };
  const handleDeleteItem = async (id, tipo) => {
  const confirm = await showConfirmationAlert(
    `¿Está seguro de eliminar este registro de ${tipo}?`
  );
  if (confirm) {
    const endpoints = {
      licencia: `/licencias-medicas/${id}`,
      anticipo: `/anticipos/${id}`,
      subsidio: `/subsidios/${id}`,
    };

    await runWithFeedback({
      action: () => apiService.delete(endpoints[tipo]),
      loadingMessage: `Eliminando ${tipo}...`,
      successMessage: `¡${tipo} eliminado correctamente!`,
      errorMessage: `No se pudo eliminar el ${tipo}.`,
    });

    const refetchFns = {
      licencia: licenciasRefetch,
      anticipo: anticiposRefetch,
      subsidio: subsidiosRefetch,
    };
    refetchFns[tipo]();
  }
};

  const statCardData = useMemo(
    () => [
      {
        key: "licencias",
        title: "Licencias",
        count: licenciasTotal,
        isLoading: licenciasLoading,
        icon: DocumentTextIcon,
        color: "blue",
      },
      {
        key: "anticipos",
        title: "Anticipos",
        count: anticiposTotal,
        isLoading: anticiposLoading,
        icon: BanknotesIcon,
        color: "orange",
      },
      {
        key: "subsidios",
        title: "Subsidios",
        count: subsidiosTotal,
        isLoading: subsidiosLoading,
        icon: ReceiptPercentIcon,
        color: "emerald",
      },
    ],
    [
      licenciasTotal,
      licenciasLoading,
      anticiposTotal,
      anticiposLoading,
      subsidiosTotal,
      subsidiosLoading,
    ]
  );

  const handleAnularYReasignar = () => {
    openModal("anularYReasignar", {
      gestionData: gestion, // Pasamos la gestión original al wizard
      refreshData: () => {
        fetchData();
        closeModal("anularYReasignar");
      },
    });
  };

  if (loading) return <div className="p-8 text-center">Cargando Folio...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!gestion)
    return <div className="p-8 text-center">Gestión no encontrada.</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <ActionHeader
        gestion={gestion}
        isEditable={isEditable}
        onCerrar={handleCerrar}
        onReconciliar={handleReconciliarHuerfanos}
        onAnularYReasignar={handleAnularYReasignar}
        onReabrir={handleReabrir}
        onVolver={() => router.push("/licencia-medica/conciliacion")}
        onCargarArchivo={handleCargarArchivo}
        canDeleteAll={canDeleteAll}
        onDeleteAll={handleDeleteAll}
        isReadOnly={isReadOnly}
      />

      <TabGroup>
        <TabList>
          <Tab>Resumen y Métricas</Tab>
          <Tab>Licencias ({licenciasTotal})</Tab>
          <Tab>Anticipos ({anticiposTotal})</Tab>
          <Tab>Subsidios ({subsidiosTotal})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card className="mt-6 space-y-6">
              <h3 className="text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Resumen de Registros
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {statCardData.map((stat) => (
                  <StatCard key={stat.key} {...stat} />
                ))}
              </div>

              <hr className="border-tremor-border dark:border-dark-tremor-border" />

              <h3 className="text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Métricas del Periodo
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-4 shadow-tremor-input">
                  <div className="text-tremor-label text-tremor-content-subtle">
                    Total Licencias
                  </div>
                  <div className="text-tremor-metric font-semibold mt-1">
                    {metricsLoading
                      ? "..."
                      : metrics?.sums?.licenciasTotal || 0}{" "}
                    Días
                  </div>
                </Card>
                <Card className="p-4 shadow-tremor-input">
                  <div className="text-tremor-label text-tremor-content-subtle">
                    Total Anticipos
                  </div>
                  <div className="text-tremor-metric font-semibold mt-1">
                    {metricsLoading
                      ? "..."
                      : new Intl.NumberFormat("es-CL", {
                          style: "currency",
                          currency: "CLP",
                          maximumFractionDigits: 0,
                        }).format(Number(metrics?.sums?.anticiposTotal || 0))}
                  </div>
                </Card>
                <Card className="p-4 shadow-tremor-input">
                  <div className="text-tremor-label text-tremor-content-subtle">
                    Total Subsidios
                  </div>
                  <div className="text-tremor-metric font-semibold mt-1">
                    {metricsLoading
                      ? "..."
                      : new Intl.NumberFormat("es-CL", {
                          style: "currency",
                          currency: "CLP",
                          maximumFractionDigits: 0,
                        }).format(Number(metrics?.sums?.subsidiosTotal || 0))}
                  </div>
                </Card>
                <Card
                  className={`p-4 shadow-tremor-ring lg:col-span-3 ${
                    Number(metrics?.sums?.diferencia || 0) < 0
                      ? "bg-red-50 dark:bg-red-950/50"
                      : "bg-emerald-50 dark:bg-emerald-950/50"
                  }`}
                >
                  <div className="text-tremor-label font-semibold">
                    Diferencia Neta (Subsidios - Anticipos)
                  </div>
                  <div
                    className={`text-tremor-metric font-bold mt-1 ${
                      Number(metrics?.sums?.diferencia || 0) < 0
                        ? "text-red-700 dark:text-red-400"
                        : "text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {metricsLoading
                      ? "..."
                      : new Intl.NumberFormat("es-CL", {
                          style: "currency",
                          currency: "CLP",
                          maximumFractionDigits: 0,
                        }).format(Number(metrics?.sums?.diferencia || 0))}
                  </div>
                </Card>
              </div>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-tremor-title font-semibold">Licencias</h3>
                {isEditable && !isReadOnly && (
                  <button
                    onClick={() => handleAddItem("licencia")}
                    className="whitespace-nowrap rounded-tremor-small border border-tremor-border px-3 py-2 text-tremor-default font-medium text-tremor-content shadow-tremor-input flex items-center space-x-1 hover:bg-tremor-background-subtle"
                  >
                    <DocumentTextIcon className="h-4 w-4" />
                    <span>Agregar Licencia Manualmente</span>
                  </button>
                )}
              </div>
              <GenericTableWithDetail
                data={licenciasData}
                loading={licenciasLoading}
                total={licenciasTotal}
                scrollTriggerRef={licenciasLastRowRef}
                useInfiniteScroll={true}
                excludeColumns={dynamicLicenciasConfig.excludeColumns}
                monetaryColumns={dynamicLicenciasConfig.monetaryColumns}
                badgesConfig={dynamicLicenciasConfig.badgesConfig}
                dateColumns={dynamicLicenciasConfig.dateColumns}
                columnsConfig={dynamicLicenciasConfig.columnsConfig}
                canEdit={canEdit}
                canDelete={canDelete}
                role={role}
                actionHandlers={{
                  ...(canEdit
                    ? { editar: (item) => handleEditItem(item, "licencia") }
                    : {}),
                  ...(canDelete
                    ? {
                        eliminar: (item) =>
                          handleDeleteItem(item.id || item, "licencia"),
                      }
                    : {}),
                }}
              />
            </Card>
          </TabPanel>
          <TabPanel>
            <Card className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-tremor-title font-semibold">Anticipos</h3>
                {isEditable && !isReadOnly && (
                  <button
                    onClick={() => handleAddItem("anticipo")}
                    className="whitespace-nowrap rounded-tremor-small border border-tremor-border px-3 py-2 text-tremor-default font-medium text-tremor-content shadow-tremor-input flex items-center space-x-1 hover:bg-tremor-background-subtle"
                  >
                    <BanknotesIcon className="h-4 w-4" />
                    <span>Agregar Anticipo Manualmente</span>
                  </button>
                )}
              </div>
              <GenericTableWithDetail
                data={anticiposData}
                loading={anticiposLoading}
                total={anticiposTotal}
                scrollTriggerRef={anticiposLastRowRef}
                useInfiniteScroll={true}
                excludeColumns={dynamicAnticiposConfig.excludeColumns}
                monetaryColumns={dynamicAnticiposConfig.monetaryColumns}
                dateColumns={dynamicAnticiposConfig.dateColumns}
                columnsConfig={dynamicAnticiposConfig.columnsConfig}
                canEdit={canEdit}
                canDelete={canDelete}
                role={role}
                actionHandlers={{
                  ...(canEdit
                    ? { editar: (item) => handleEditItem(item, "anticipo") }
                    : {}),
                  ...(canDelete
                    ? {
                        eliminar: (item) =>
                          handleDeleteItem(item.id || item, "anticipo"),
                      }
                    : {}),
                }}
              />
            </Card>
          </TabPanel>
          <TabPanel>
            <Card className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-tremor-title font-semibold">Subsidios</h3>
                {isEditable && !isReadOnly && (
                  <button
                    onClick={() => handleAddItem("subsidio")}
                    className="whitespace-nowrap rounded-tremor-small border border-tremor-border px-3 py-2 text-tremor-default font-medium text-tremor-content shadow-tremor-input flex items-center space-x-1 hover:bg-tremor-background-subtle"
                  >
                    <ReceiptPercentIcon className="h-4 w-4" />
                    <span>Agregar Subsidio Manualmente</span>
                  </button>
                )}
              </div>
              <GenericTableWithDetail
                data={subsidiosData}
                loading={subsidiosLoading}
                total={subsidiosTotal}
                scrollTriggerRef={subsidiosLastRowRef}
                useInfiniteScroll={true}
                excludeColumns={dynamicSubsidiosConfig.excludeColumns}
                monetaryColumns={dynamicSubsidiosConfig.monetaryColumns}
                dateColumns={dynamicSubsidiosConfig.dateColumns}
                columnsConfig={dynamicSubsidiosConfig.columnsConfig}
                canEdit={canEdit}
                canDelete={canDelete}
                role={role}
                actionHandlers={{
                  ...(canEdit
                    ? { editar: (item) => handleEditItem(item, "subsidio") }
                    : {}),
                  ...(canDelete
                    ? {
                        eliminar: (item) =>
                          handleDeleteItem(item.id || item, "subsidio"),
                      }
                    : {}),
                }}
              />
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

// --- EL "CONTENEDOR" QUE EXPONEMOS COMO PÁGINA ---
const ExpedienteGestionPage = () => (
  <ModalProvider modalsConfig={configuracion.modalsConfig}>
    <ExpedienteContent />
    <ModalManager />
  </ModalProvider>
);

export default ExpedienteGestionPage;
