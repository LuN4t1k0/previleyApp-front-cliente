import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiService from '@/app/api/apiService';
import { useModal } from '@/context/ModalContext';
import useActionFeedback from '@/hooks/useActionFeedback';
import { showConfirmationAlert } from '@/utils/alerts';
import { useRole } from '@/context/RoleContext';

// --- Pequeño componente para las tarjetas de conteo ---
const StatCard = ({ title, count, onUploadClick, onDeleteClick, canDelete, isLoading }) => (
  <div className="border p-4 rounded-lg shadow-sm text-center flex flex-col justify-between bg-tremor-background-muted dark:bg-dark-tremor-background-muted">
    <div>
      <h4 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">{title}</h4>
      {isLoading ? (
        <div className="h-9 flex items-center justify-center">
            {/* Puedes poner un spinner simple aquí si lo tienes, si no, un texto */}
            <span className="text-tremor-default text-tremor-content-subtle">Cargando...</span>
        </div>
       ) : (
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">{count}</p>
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


const DetalleGestionModal = ({ gestionData, refreshData, onClose }) => {
  const { openModal } = useModal();
  const { runWithFeedback } = useActionFeedback();
  const { role } = useRole();
  const canDelete = useMemo(() => role && role !== 'cliente', [role]);
  
  const [counts, setCounts] = useState({ licencias: 0, anticipos: 0, subsidios: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // --- Función para refrescar los contadores ---
  const refreshCounts = useCallback(async () => {
    if (!gestionData?.id) return;
    setIsLoading(true);
    try {
      const [licRes, antRes, subRes] = await Promise.all([
        apiService.get(`/licencias-medicas?gestionLicenciaId=${gestionData.id}&limit=1`),
        apiService.get(`/anticipos?gestionLicenciaId=${gestionData.id}&limit=1`),
        apiService.get(`/subsidios?gestionLicenciaId=${gestionData.id}&limit=1`),
      ]);
      setCounts({
        licencias: licRes.data.total,
        anticipos: antRes.data.total,
        subsidios: subRes.data.total,
      });
    } catch (error) {
      console.error("Error fetching counts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [gestionData]);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  const fetchMetrics = useCallback(async () => {
    if (!gestionData?.id) return;
    setMetricsLoading(true);
    try {
      const res = await apiService.get(`/gestion-licencia/${gestionData.id}/metrics`);
      setMetrics(res?.data?.data || null);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('No se pudieron cargar métricas de la gestión', e);
    } finally {
      setMetricsLoading(false);
    }
  }, [gestionData]);

  useEffect(() => {
    fetchMetrics();
    // Polling liviano para mantener actualizado mientras el modal esté abierto
    const id = setInterval(fetchMetrics, 10000);
    return () => clearInterval(id);
  }, [fetchMetrics]);

  // const handleCargarArchivo = (tipo) => {
  //   const config = {
  //     licencias: {
  //       title: `Cargar Licencias para ${gestionData.folioInterno}`,
  //       endpoint: `/licencias-medicas/bulk-create/${gestionData.id}`,
  //     },
  //     anticipos: {
  //       title: `Cargar Anticipos para ${gestionData.folioInterno}`,
  //       endpoint: `/pago-anticipo/bulk-create/${gestionData.id}`,
  //     },
  //     subsidios: {
  //       title: `Cargar Subsidios para ${gestionData.folioInterno}`,
  //       endpoint: `/pago-subsidio/bulk-create/${gestionData.id}`,
  //     },
  //   }[tipo];

  //   openModal("cargaMasiva", {
  //     title: config.title,
  //     endpoint: config.endpoint,
  //     method: 'POST',
  //     refreshData: refreshCounts,
  //     gestionId: gestionData.id,
  //   });
  // };


  const handleCargarArchivo = (tipo) => {
    const config = {
      licencias: {
        title: `Cargar Licencias para ${gestionData.folioInterno}`,
        // CORRECCIÓN: Se elimina el ID de la URL
        endpoint: `/licencias-medicas/bulk-create`,
      },
      anticipos: {
        title: `Cargar Anticipos para ${gestionData.folioInterno}`,
        // CORRECCIÓN: Se elimina el ID de la URL
        endpoint: `/anticipos/bulk-create`,
      },
      subsidios: {
        title: `Cargar Subsidios para ${gestionData.folioInterno}`,
        // CORRECCIÓN: Se elimina el ID de la URL
        endpoint: `/subsidios/bulk-create`,
      },
    }[tipo];

    openModal("cargaMasiva", {
      title: config.title,
      endpoint: config.endpoint,
      method: 'POST',
      refreshData: refreshCounts,
      gestionId: gestionData.id, // Pasamos el ID aquí para que el formulario lo ponga en el body
    });
  };

  const handleCerrar = async () => {
    const confirm = await showConfirmationAlert(
        "¿Está seguro de que desea cerrar esta gestión?",
        "Esta acción generará una producción y no podrá ser editada directamente."
    );
    if (confirm) {
        await runWithFeedback({
            action: () => apiService.post(`/gestion-licencia/${gestionData.id}/cerrar`),
            loadingMessage: "Cerrando gestión...",
            successMessage: "¡Gestión cerrada y producción generada exitosamente!",
            errorMessage: "No se pudo cerrar la gestión.",
        });
        refreshData();
        onClose();
    }
  };
  
  const handleAnular = () => {
    openModal("anularGestion", {
      title: `Anular Gestión ${gestionData.folioInterno}`,
      endpoint: `/gestion-licencia/${gestionData.id}/anular`,
      method: 'POST',
      successMessage: "Gestión anulada correctamente.",
      refreshData: () => {
        refreshData();
        onClose();
      },
    });
  };

  const handleReabrir = () => {
    openModal("reabrirGestion", {
      title: `Reabrir Gestión ${gestionData.folioInterno}`,
      endpoint: `/gestion-licencia/${gestionData.id}/reabrir`,
      method: 'POST',
      successMessage: "Gestión reabierta correctamente.",
      refreshData: () => {
        refreshData();
        onClose();
      },
    });
  };

  const handleDeleteAll = async (tipo) => {
    if (!gestionData?.id) return;
    const count = counts[tipo] ?? 0;
    const confirm = await showConfirmationAlert(
      `Borrar todos los ${tipo} (${count})`,
      `Se eliminarán definitivamente todos los ${tipo} de esta gestión que no estén producidos. ¿Deseas continuar?`
    );
    if (!confirm) return;
    const endpointMap = {
      licencias: `/gestion-licencia/${gestionData.id}/licencias`,
      anticipos: `/gestion-licencia/${gestionData.id}/anticipos`,
      subsidios: `/gestion-licencia/${gestionData.id}/subsidios`,
    };
    await runWithFeedback({
      action: () => apiService.delete(endpointMap[tipo]),
      loadingMessage: `Eliminando ${tipo}...`,
      successMessage: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} eliminados correctamente`,
      errorMessage: `No se pudieron eliminar los ${tipo}`,
    });
    await Promise.all([refreshCounts(), fetchMetrics()]);
  };

  const formatCLP = (value) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(value || 0));

  return (
    <div className="p-2 space-y-6">
      <div className="border-b border-tremor-border pb-4 dark:border-dark-tremor-border">
        <h3 className="text-tremor-title font-bold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {gestionData.folioInterno}
        </h3>
        <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          Periodo: <span className="font-medium">{gestionData.periodo}</span> | Estado: <span className="font-medium capitalize">{gestionData.estado}</span>
        </p>
      </div>

      <div>
        <h4 className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong mb-4">Carga y Resumen de Datos</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard title="Licencias" count={counts.licencias} isLoading={isLoading} onUploadClick={() => handleCargarArchivo('licencias')} onDeleteClick={() => handleDeleteAll('licencias')} canDelete={canDelete} />
            <StatCard title="Anticipos" count={counts.anticipos} isLoading={isLoading} onUploadClick={() => handleCargarArchivo('anticipos')} onDeleteClick={() => handleDeleteAll('anticipos')} canDelete={canDelete} />
            <StatCard title="Subsidios" count={counts.subsidios} isLoading={isLoading} onUploadClick={() => handleCargarArchivo('subsidios')} onDeleteClick={() => handleDeleteAll('subsidios')} canDelete={canDelete} />
        </div>
      </div>

      {/* Indicadores del periodo */}
      <div>
        <h4 className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong mb-4">Indicadores del periodo</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="border p-4 rounded-lg shadow-sm bg-white dark:bg-dark-tremor-background-muted">
            <div className="text-tremor-label text-tremor-content-subtle">Total Anticipos</div>
            <div className="text-tremor-metric font-semibold mt-1">{metricsLoading ? '...' : formatCLP(metrics?.sums?.anticiposTotal)}</div>
          </div>
          <div className="border p-4 rounded-lg shadow-sm bg-white dark:bg-dark-tremor-background-muted">
            <div className="text-tremor-label text-tremor-content-subtle">Total Subsidios</div>
            <div className="text-tremor-metric font-semibold mt-1">{metricsLoading ? '...' : formatCLP(metrics?.sums?.subsidiosTotal)}</div>
          </div>
          <div className={`border p-4 rounded-lg shadow-sm bg-white dark:bg-dark-tremor-background-muted ${Number(metrics?.sums?.diferencia || 0) < 0 ? 'border-red-300' : 'border-emerald-300'}`}>
            <div className="text-tremor-label text-tremor-content-subtle">Diferencia (Subsidios - Anticipos)</div>
            <div className={`text-tremor-metric font-semibold mt-1 ${Number(metrics?.sums?.diferencia || 0) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {metricsLoading ? '...' : formatCLP(metrics?.sums?.diferencia)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-6 border-t border-tremor-border dark:border-dark-tremor-border">
        {['pendiente', 'en_proceso', 'reabierta'].includes(gestionData.estado) && (
            <button onClick={handleCerrar} className="whitespace-nowrap rounded-tremor-small bg-tremor-brand px-4 py-2 text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input transition hover:bg-tremor-brand-emphasis dark:bg-dark-tremor-brand dark:text-dark-tremor-brand-inverted dark:shadow-dark-tremor-input dark:hover:bg-dark-tremor-brand-emphasis">
                Cerrar Gestión
            </button>
        )}
        {['pendiente', 'en_proceso', 'reabierta'].includes(gestionData.estado) && (
            <button onClick={handleAnular} className="whitespace-nowrap rounded-tremor-small bg-yellow-500 px-4 py-2 text-tremor-default font-medium text-white shadow-tremor-input transition hover:bg-yellow-600">
                Anular Gestión
            </button>
        )}
        {gestionData.estado === 'cerrada' && (
             <button onClick={handleReabrir} className="whitespace-nowrap rounded-tremor-small bg-red-500 px-4 py-2 text-tremor-default font-medium text-white shadow-tremor-input transition hover:bg-red-600">
                Reabrir (Rechazar Producción)
            </button>
        )}
        <button type="button" onClick={onClose} className="whitespace-nowrap rounded-tremor-small border border-tremor-border px-4 py-2 text-tremor-default font-medium text-tremor-content shadow-tremor-input transition hover:bg-tremor-background-muted dark:border-dark-tremor-border dark:text-dark-tremor-content dark:shadow-dark-tremor-input hover:dark:bg-dark-tremor-background-muted">
          Cancelar
        </button>
      </div>
    </div>
  );
};

// Le decimos al ModalManager que este componente es "grande" y personalizado
DetalleGestionModal.modalSize = "max-w-3xl";

export default DetalleGestionModal;
