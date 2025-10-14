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

// --- REINCORPORA ESTE COMPONENTE ---
const StatCard = ({ title, count, onUploadClick, onDeleteClick, canDelete, isLoading }) => (
  <div className="border p-4 rounded-lg shadow-sm text-center flex flex-col justify-between bg-tremor-background-muted dark:bg-dark-tremor-background-muted">
    <div>
      <h4 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
        {title}
      </h4>
      {isLoading ? (
        <div className="h-9 flex items-center justify-center">
          <span className="text-tremor-default text-tremor-content-subtle">
            Cargando...
          </span>
        </div>
      ) : (
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {count}
        </p>
      )}
    </div>
    <div className="mt-4 grid grid-cols-1 gap-2">
      <button
        onClick={onUploadClick}
        className="w-full whitespace-nowrap rounded-tremor-small bg-tremor-brand px-3 py-2 text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input transition hover:bg-tremor-brand-emphasis dark:bg-dark-tremor-brand dark:hover:bg-dark-tremor-brand-emphasis"
      >
        Cargar Archivo
      </button>
      {canDelete && (
        <button
          onClick={onDeleteClick}
          className="w-full whitespace-nowrap rounded-tremor-small border border-red-300 px-3 py-2 text-tremor-default font-medium text-red-600 shadow-tremor-input hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
        >
          Borrar todo
        </button>
      )}
    </div>
  </div>
);


const TabHeader = ({ title, count, onUploadClick, onAddClick, isLoading }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center">
      <h3 className="text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
        {title}{" "}
        <span className="text-tremor-default text-tremor-content">
          ({isLoading ? "..." : count})
        </span>
      </h3>
      <div className="flex space-x-2">
        <button
          onClick={onAddClick}
          className="whitespace-nowrap rounded-tremor-small border border-tremor-border px-3 py-2 text-tremor-default font-medium text-tremor-content shadow-tremor-input"
        >
          Agregar Manualmente
        </button>
        <button
          onClick={onUploadClick}
          className="whitespace-nowrap rounded-tremor-small bg-tremor-brand px-3 py-2 text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input transition hover:bg-tremor-brand-emphasis"
        >
          Cargar Archivo
        </button>
      </div>
    </div>
  </div>
);

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

  const canEdit = licenciasConfig.permissions.edit.includes(role);
  const canDelete = licenciasConfig.permissions.delete.includes(role);

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
      <div className="flex justify-between items-start">
        <div>
          <Titulo
            title={`CONCILIACIÓN: ${gestion.folioInterno}`}
            subtitle={`Periodo: ${gestion.periodo}`}
            
          />
          
          <p className="mt-1 text-tremor-default text-tremor-content">
            Empresa: {gestion.empresaRut}
          </p>
        </div>
        <Badge
          size="lg"
          color={
            gestion.estado === "cerrada"
              ? "emerald"
              : gestion.estado === "reabierta"
              ? "orange"
              : "gray"
          }
        >
          {gestion.estado}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        {/* Estos botones los haremos funcionales en la V1.1 */}
        {isEditable && (
          <button
            onClick={handleCerrar}
            className="whitespace-nowrap rounded-tremor-small bg-tremor-brand px-4 py-2 text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input transition hover:bg-tremor-brand-emphasis"
          >
            Cerrar Gestión
          </button>
        )}
        {isEditable && (
          <button
            onClick={handleReconciliarHuerfanos}
            className="whitespace-nowrap rounded-tremor-small border border-tremor-border px-4 py-2 text-tremor-default font-medium text-tremor-content shadow-tremor-input"
          >
            Reconciliar Huérfanos
          </button>
        )}
        {isEditable && (
          <button
            onClick={handleAnularYReasignar}
            className="whitespace-nowrap rounded-tremor-small bg-yellow-500 px-4 py-2 text-tremor-default font-medium text-white shadow-tremor-input transition hover:bg-yellow-600"
          >
            Anular Gestión
          </button>
        )}
        {gestion.estado === "cerrada" && (
          <button
            onClick={handleReabrir}
            className="whitespace-nowrap rounded-tremor-small bg-red-500 px-4 py-2 text-tremor-default font-medium text-white shadow-tremor-input transition hover:bg-red-600"
          >
            Reabrir (Rechazar Producción)
          </button>
        )}
        <button
          onClick={() => router.push("/licencia-medica/conciliacion")}
          className="whitespace-nowrap rounded-tremor-small border border-tremor-border px-4 py-2 text-tremor-default font-medium text-tremor-content shadow-tremor-input"
        >
          Volver a la Lista
        </button>
      </div>

      <TabGroup>
        <TabList>
          <Tab>Resumen</Tab>
          <Tab>Licencias ({licenciasTotal})</Tab>
          <Tab>Anticipos ({anticiposTotal})</Tab>
          <Tab>Subsidios ({subsidiosTotal})</Tab>
        </TabList>
        <TabPanels>
            {/* El Resumen y Cargas ahora solo muestra las StatCards */}
          {/* <TabPanel>
            <Card className="mt-6">
              <h3 className="text-tremor-title font-semibold">
                Resumen de Registros
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
                <div className="border p-4 rounded-lg text-center bg-tremor-background-muted">
                  <h4 className="text-tremor-default font-medium">Licencias</h4>
                  <p className="text-tremor-metric font-semibold">
                    {licenciasTotal}
                  </p>
                </div>
                <div className="border p-4 rounded-lg text-center bg-tremor-background-muted">
                  <h4 className="text-tremor-default font-medium">Anticipos</h4>
                  <p className="text-tremor-metric font-semibold">
                    {anticiposTotal}
                  </p>
                </div>
                <div className="border p-4 rounded-lg text-center bg-tremor-background-muted">
                  <h4 className="text-tremor-default font-medium">Subsidios</h4>
                  <p className="text-tremor-metric font-semibold">
                    {subsidiosTotal}
                  </p>
                </div>
              </div>
            </Card>
          </TabPanel> */}

          {/* NUEVO */}
          <TabPanel>
    <Card className="mt-6">
       <h3 className="text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">Carga y Resumen de Datos</h3>
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
            <StatCard 
                title="Licencias" 
                count={licenciasTotal} // <-- Usa la variable 'total' del hook
                isLoading={licenciasLoading} // <-- Usa el loading específico de la tabla
                onUploadClick={() => handleCargarArchivo('licencias')} 
                onDeleteClick={() => handleDeleteAll('licencias')}
                canDelete={canDeleteAll}
            />
            <StatCard 
                title="Anticipos" 
                count={anticiposTotal} // <-- Usa la variable 'total' del hook
                isLoading={anticiposLoading} // <-- Usa el loading específico
                onUploadClick={() => handleCargarArchivo('anticipos')} 
                onDeleteClick={() => handleDeleteAll('anticipos')}
                canDelete={canDeleteAll}
            />
            <StatCard 
                title="Subsidios" 
                count={subsidiosTotal} // <-- Usa la variable 'total' del hook
                isLoading={subsidiosLoading} // <-- Usa el loading específico
                onUploadClick={() => handleCargarArchivo('subsidios')} 
                onDeleteClick={() => handleDeleteAll('subsidios')}
                canDelete={canDeleteAll}
            />
        </div>
        {/* Indicadores del periodo: ocupar columnas 2 y 3, y la diferencia bajo ambas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          {/* Deja vacía la primera columna en >= sm para alineación visual */}
          <div className="hidden sm:block" />

          <div className="border p-4 rounded-lg shadow-sm bg-white dark:bg-dark-tremor-background-muted sm:col-start-2">
            <div className="text-tremor-label text-tremor-content-subtle">Total Anticipos</div>
            <div className="text-tremor-metric font-semibold mt-1">{metricsLoading ? '...' : new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(metrics?.sums?.anticiposTotal||0))}</div>
          </div>
          <div className="border p-4 rounded-lg shadow-sm bg-white dark:bg-dark-tremor-background-muted sm:col-start-3">
            <div className="text-tremor-label text-tremor-content-subtle">Total Subsidios</div>
            <div className="text-tremor-metric font-semibold mt-1">{metricsLoading ? '...' : new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(metrics?.sums?.subsidiosTotal||0))}</div>
          </div>
          <div className={`border p-4 rounded-lg shadow-sm bg-white dark:bg-dark-tremor-background-muted sm:col-span-2 sm:col-start-2 ${Number(metrics?.sums?.diferencia||0) < 0 ? 'border-red-300' : 'border-emerald-300'}`}>
            <div className="text-tremor-label text-tremor-content-subtle">Diferencia (Subsidios - Anticipos)</div>
            <div className={`text-tremor-metric font-semibold mt-1 ${Number(metrics?.sums?.diferencia||0) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {metricsLoading ? '...' : new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(metrics?.sums?.diferencia||0))}
            </div>
          </div>
        </div>
    </Card>
</TabPanel>
          <TabPanel>
            <Card className="mt-6">
              <TabHeader
                title="Licencias"
                count={licenciasTotal}
                isLoading={loading}
                onUploadClick={() => handleCargarArchivo("licencias")}
                onAddClick={() => handleAddItem("licencia")}
              />
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
                  editar: (item) => handleEditItem(item, "licencia"),
                  eliminar: (item) => handleDeleteItem(item, "licencia"),
                }}
              />
            </Card>
          </TabPanel>
          <TabPanel>
            <Card className="mt-6">
              <TabHeader
                title="Anticipos"
                count={anticiposTotal}
                isLoading={loading}
                onUploadClick={() => handleCargarArchivo("anticipos")}
                onAddClick={() => handleAddItem("anticipo")}
              />
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
                  editar: (item) => handleEditItem(item, "anticipo"),
                  eliminar: (item) => handleDeleteItem(item, "anticipo"),
                }}
              />
            </Card>
          </TabPanel>
          <TabPanel>
            <Card className="mt-6">
              <TabHeader
                title="Subsidios"
                count={subsidiosTotal}
                isLoading={loading}
                onUploadClick={() => handleCargarArchivo("subsidios")}
                onAddClick={() => handleAddItem("subsidio")}
              />

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
                  editar: (item) => handleEditItem(item, "subsidio"),
                  eliminar: (item) => handleDeleteItem(item, "subsidio"),
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
