import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSocket from "../hooks/useSocket";
import useBulkProgress from "../hooks/useBulkProgress";
import selectBulkJob from "../hooks/useBulkJob";
import BulkProgressBar from "./BulkProgressBar";
import { uploadFileWithProgress } from "../utils/uploadWithProgress";

export default function BulkUploadGL({
  token,
  type, // 'licencias' | 'anticipo' | 'subsidio'
  gestionLicenciaId,
  uploadUrl,
  onDone, // optional callback when server processing finishes
  onRunningChange, // optional callback(boolean) when upload/process starts/stops
  roomType = "gestionLicencia",
  parentField = "gestionLicenciaId",
  onClose, // optional: close modal from inside
  onFileSelected, // optional: notify parent when a file is chosen
  startTrigger, // optional: when changes, attempts auto-start
  cancelTrigger, // optional: when changes, attempts cancel/close
}) {
  const { socket, isConnected, joinRoom } = useSocket(token);
  const { jobs } = useBulkProgress(socket);
  const [file, setFile] = useState(null);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [correlationId, setCorrelationId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showDebug, setShowDebug] = useState(true);
  const abortRef = useRef(null);
  const job = useMemo(
    () => selectBulkJob(jobs, { correlationId, type, gestionLicenciaId }),
    [jobs, correlationId, type, gestionLicenciaId]
  );

  // Autoclose + refresh when processing is done
  const doneRef = useRef(false);
  useEffect(() => {
    if (!job || doneRef.current) return;
    if (job.phase === 'done' || job?.summary) {
      doneRef.current = true;
      setIsRunning(false);
      onRunningChange?.(false);
      onDone?.(job);
    }
  }, [job, onDone]);

  // Debug: logear conexión socket y cambios del job
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[BulkUploadGL] Socket status:', { isConnected, hasSocket: !!socket });
  }, [isConnected, socket]);

  useEffect(() => {
    if (!job) return;
    // eslint-disable-next-line no-console
    console.log('[BulkUploadGL] Job update:', {
      jobId: job?.jobId,
      phase: job?.phase,
      percent: job?.percent,
      processed: job?.processed,
      total: job?.total,
      correlationId,
      type,
      gestionLicenciaId,
    });
  }, [job, correlationId, type, gestionLicenciaId]);

  useEffect(() => {
    if (isConnected && gestionLicenciaId && roomType) {
      joinRoom(roomType, gestionLicenciaId);
    }
  }, [isConnected, gestionLicenciaId, joinRoom, roomType]);

  const startUpload = async () => {
    if (!file || !gestionLicenciaId) return;
    const corr = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    setCorrelationId(corr);
    setUploadPercent(0);
    setIsRunning(true);
    onRunningChange?.(true);
    const controller = new AbortController();
    abortRef.current = controller;
    // eslint-disable-next-line no-console
    console.log('[BulkUploadGL] Starting upload', {
      uploadUrl,
      parentField,
      gestionLicenciaId,
      type,
      correlationId: corr,
      fileName: file?.name,
      fileSize: file?.size,
    });
    try {
      await uploadFileWithProgress({
        url: uploadUrl,
        fileField: "file",
        file,
        fields: { [parentField]: gestionLicenciaId, correlationId: corr },
        token,
        onUploadPercent: setUploadPercent,
        signal: controller.signal,
      });
    } catch (err) {
      // Upload cancelado
      if (err?.name === 'CanceledError' || String(err?.message || '').toLowerCase().includes('canceled')) {
        // eslint-disable-next-line no-console
        console.log('[BulkUploadGL] Upload cancelado por el usuario');
      } else {
        // eslint-disable-next-line no-console
        console.warn('[BulkUploadGL] Error en upload', err);
      }
      setIsRunning(false);
      onRunningChange?.(false);
      abortRef.current = null;
      return;
    }
  };

  const downloadRejectedCsv = async () => {
    try {
      const jobId = job?.jobId;
      if (!jobId) return;
      const url = `/api/v1/bulk/jobs/${jobId}/rejected.csv`;
      const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await resp.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `rechazados_${type || 'bulk'}_${jobId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.warn('[BulkUploadGL] Error al descargar rechazados:', e);
    }
  };

  const viewSummary = async () => {
    try {
      const jobId = job?.jobId;
      if (!jobId) return;
      const url = `/api/v1/bulk/jobs/${jobId}/summary`;
      const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const json = await resp.json();
      // Simple visor: abrir nueva pestaña con JSON pretty
      const w = window.open('', '_blank');
      if (w) {
        w.document.write('<pre style="white-space:pre-wrap;word-break:break-word;">' +
          JSON.stringify(json, null, 2) + '</pre>');
      }
    } catch (e) {
      console.warn('[BulkUploadGL] Error al ver resumen:', e);
    }
  };

  const cancelOrClose = () => {
    if (abortRef.current) {
      // Cancelar subida en curso
      abortRef.current.abort();
      abortRef.current = null;
      setIsRunning(false);
      onRunningChange?.(false);
      onClose?.();
      return;
    }
    // Si no hay subida en curso pero existe job en proceso, no podemos cancelar server-side.
    // Permitimos cerrar con confirmación.
    if (job && job.phase !== 'done') {
      const ok = typeof window !== 'undefined' ? window.confirm('El procesamiento continuará en segundo plano. ¿Deseas cerrar esta ventana?') : true;
      if (!ok) return;
    }
    onClose?.();
  };

  // Auto-start when parent signals and there's a file + gestion id
  useEffect(() => {
    if (!startTrigger) return;
    if (isRunning) return;
    if (!file || !gestionLicenciaId) return;
    // Fire and forget
    startUpload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTrigger]);

  // External cancel trigger (abort upload if running or just close)
  useEffect(() => {
    if (!cancelTrigger) return;
    cancelOrClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelTrigger]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) {
      setFile(f);
      try { onFileSelected?.(f); } catch (_) {}
    }
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  return (
    <div className="grid gap-4">
      {!isRunning && (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`border rounded-tremor-default p-6 text-center transition ${
            isDragging ? 'border-tremor-brand bg-tremor-background-muted' : 'border-dashed border-gray-300'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="text-tremor-content">Arrastra y suelta el archivo</div>
            <div className="text-tremor-label text-tremor-content-subtle">o</div>
            <label className="relative cursor-pointer rounded-tremor-small font-medium text-tremor-brand hover:underline">
              <span>Elegir archivo</span>
              <input
                type="file"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                  try { if (f) onFileSelected?.(f); } catch (_) {}
                }}
              />
            </label>
            {file && (
              <div className="text-xs text-tremor-content-subtle truncate max-w-[280px] mt-1">{file.name}</div>
            )}
            <button
              onClick={startUpload}
              disabled={!file || !gestionLicenciaId}
              className="mt-3 whitespace-nowrap rounded-tremor-small bg-tremor-brand px-4 py-2 text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis disabled:opacity-50"
            >
              Subir y procesar
            </button>
            <div className="text-[11px] text-tremor-content-subtle mt-1">Formatos admitidos: CSV/XLS/XLSX • Máx 10MB</div>
          </div>
        </div>
      )}

      {(isRunning || job) && (
        <div className="space-y-2">
          {file && (
            <div className="text-xs text-tremor-content-subtle truncate">{file.name}</div>
          )}
          <BulkProgressBar job={job} uploadPercent={uploadPercent} />

          {job?.phase === "done" && (
            <div className="rounded-tremor-default border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
              <div className="font-semibold">Carga finalizada</div>
              <div>
                Procesados: {String(job?.processed ?? 0)} · Rechazados:{" "}
                {String(job?.rejected ?? 0)}
              </div>
            </div>
          )}

          {/* Resumen rápido durante/tras precheck */}
          {job && (job.phase === 'precheck:end' || job.phase === 'process' || job.phase === 'done') && (
            <div className="text-xs text-tremor-content-subtle">
              <div>Total archivo: {String(job.total ?? 0)}</div>
              {typeof job.valid === 'number' && (
                <div>Se procesarán: {String(job.valid)} (descartadas: {String(job.rejected ?? 0)}{typeof job.orphan === 'number' ? `, huérfanas: ${job.orphan}` : ''})</div>
              )}
            </div>
          )}

          {/* Debug visible en la UI */}
          <div className="mt-2 border rounded-tremor-default p-3 bg-tremor-background-muted">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-tremor-default font-medium">
                <span
                  aria-label={isConnected ? 'socket-conectado' : 'socket-desconectado'}
                  className={`inline-block h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}
                />
                Detalle de progreso
              </div>
              <button
                type="button"
                onClick={() => setShowDebug((v) => !v)}
                className="text-tremor-label text-tremor-content-subtle hover:underline"
              >
                {showDebug ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {showDebug && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[12px] text-tremor-content-subtle">
                <div><span className="text-tremor-content">Socket:</span> {isConnected ? 'Conectado' : 'Desconectado'}</div>
                <div><span className="text-tremor-content">Endpoint:</span> {uploadUrl || '-'}</div>
                <div><span className="text-tremor-content">Tipo:</span> {type || '-'}</div>
                <div><span className="text-tremor-content">Room:</span> {roomType || '-'}</div>
                <div><span className="text-tremor-content">ParentField:</span> {parentField || '-'}</div>
                <div><span className="text-tremor-content">GestionId:</span> {String(gestionLicenciaId ?? '-')}</div>
                <div><span className="text-tremor-content">CorrelationId:</span> {correlationId || '-'}</div>
                <div><span className="text-tremor-content">JobId:</span> {job?.jobId || '-'}</div>
                <div><span className="text-tremor-content">Fase:</span> {job?.phase || '-'}</div>
                <div><span className="text-tremor-content">Porcentaje:</span> {String(job?.percent ?? uploadPercent ?? 0)}%</div>
                <div><span className="text-tremor-content">Procesado:</span> {String(job?.processed ?? 0)} / {String(job?.total ?? 0)}</div>
                <div><span className="text-tremor-content">Inicio:</span> {job?.startedAt ? new Date(job.startedAt).toLocaleString() : '-'}</div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-3">
            {job?.jobId && (
              <>
                <button
                  type="button"
                  onClick={downloadRejectedCsv}
                  className="whitespace-nowrap rounded-tremor-small border border-tremor-border px-3 py-2 text-[12px] font-medium text-tremor-content hover:bg-tremor-background-muted"
                >
                  Descargar rechazados CSV
                </button>
                <button
                  type="button"
                  onClick={viewSummary}
                  className="whitespace-nowrap rounded-tremor-small border border-tremor-border px-3 py-2 text-[12px] font-medium text-tremor-content hover:bg-tremor-background-muted"
                >
                  Ver resumen
                </button>
              </>
            )}
            <button
              type="button"
              onClick={cancelOrClose}
              className="whitespace-nowrap rounded-tremor-small border border-tremor-border px-4 py-2 text-tremor-default font-medium text-tremor-content shadow-tremor-input hover:bg-tremor-background-muted"
            >
              {abortRef.current ? 'Cancelar' : job && job.phase !== 'done' ? 'Cerrar' : 'Cerrar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
