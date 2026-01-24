"use client";
import React from "react";
import { useSession } from "next-auth/react";
import BulkUploadGL from "@/components/BulkUploadGL";
import useSocket from "@/hooks/useSocket";
import useBulkProgress from "@/hooks/useBulkProgress";
import selectBulkJob from "@/hooks/useBulkJob";

// Modal content wrapper that renders the realtime bulk upload with progress + ETA
// Props expected from openModal: { title, endpoint, refreshData, onClose, gestionId }
export default function CargaMasivaRealtime({ title, endpoint, refreshData, fetchData, onClose, gestionId }) {
  const { data: session } = useSession();
  const token = session?.accessToken || null;

  const type = endpoint?.includes("/licencias-medicas/")
    ? "licencias"
    : endpoint?.includes("/anticipos/")
    ? "anticipo"
    : endpoint?.includes("/subsidios/")
    ? "subsidio"
    : endpoint?.includes("/detalle-pagex/")
    ? "detallePagex"
    : endpoint?.includes("/detalle-mora/")
    ? "detalleMora"
    : null;

  const roomType = type === 'detallePagex' ? 'gestionPagex' : type === 'detalleMora' ? 'gestionMora' : 'gestionLicencia';
  const parentField = type === 'detallePagex' ? 'pagexId' : type === 'detalleMora' ? 'gestionMoraId' : 'gestionLicenciaId';

  const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}${endpoint || ""}`;
  const [querySuffix, setQuerySuffix] = React.useState("");
  const uploadUrl = `${baseUrl}${querySuffix}`;

  const [running, setRunning] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [precheck, setPrecheck] = React.useState(null); // stores dryRun summary
  const [prechecking, setPrechecking] = React.useState(false);
  const [preCorr, setPreCorr] = React.useState(null);
  const [doneSummary, setDoneSummary] = React.useState(null);
  const fmtCLP = React.useCallback((n) => {
    try {
      return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(n||0));
    } catch (_) { return String(n ?? 0); }
  }, []);
  const [startTrigger, setStartTrigger] = React.useState(0);
  const [cancelTrigger, setCancelTrigger] = React.useState(0);

  // Permitir ambos nombres de callback: refreshData y fetchData
  const doRefresh = refreshData || fetchData;

  return (
    <div className="space-y-4">
      {title ? (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            type="button"
            onClick={() => {
              if (running) {
                const ok = typeof window !== 'undefined' ? window.confirm('Hay una carga en curso. ¿Deseas cancelarla y cerrar?') : true;
                if (!ok) return;
                setCancelTrigger(Date.now());
                return;
              }
              try { onClose?.(); } catch (_) {}
            }}
            className="whitespace-nowrap rounded-tremor-small border border-tremor-border px-3 py-1.5 text-tremor-default font-medium text-tremor-content shadow-tremor-input"
          >
            Cerrar
          </button>
        </div>
      ) : null}
      {doneSummary ? (
        <div className="rounded-tremor-default border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
          <div className="text-sm font-semibold">Carga finalizada</div>
          <div className="text-xs">
            Total: {String(doneSummary?.total ?? doneSummary?.summary?.total ?? 0)} ·
            Procesados: {String(doneSummary?.processed ?? doneSummary?.summary?.processed ?? doneSummary?.summary?.valid ?? 0)} ·
            Rechazados: {String(doneSummary?.rejected ?? doneSummary?.summary?.rejected ?? 0)}
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => onClose?.()}
              className="whitespace-nowrap rounded-tremor-small border border-emerald-300 px-3 py-1.5 text-tremor-default font-medium text-emerald-900"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
      {/* Pre-check actions */}
      {selectedFile && !running && !precheck ? (
        <div className="border rounded-tremor-default p-3 bg-tremor-background-muted flex items-center justify-between">
          <div className="text-sm text-tremor-content">Opcional: pre-chequear el archivo para ver nuevos y repetidos</div>
          <button
            type="button"
            disabled={prechecking}
            onClick={async () => {
              setPrechecking(true);
              try {
                const fd = new FormData();
                fd.append('file', selectedFile);
                fd.append(parentField, String(gestionId || ''));
                const corr = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
                fd.append('correlationId', corr);
                setPreCorr(corr);
                const res = await fetch(`${baseUrl}?dryRun=true`, {
                  method: 'POST',
                  headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                  body: fd,
                });
                const data = await res.json();
                setPrecheck(data?.result || data?.resultado || data);
              } catch (_) {
                setPrecheck({ error: true });
              } finally {
                setPrechecking(false);
              }
            }}
            className="whitespace-nowrap rounded-tremor-small border border-tremor-border px-3 py-1.5 text-tremor-default font-medium text-tremor-content shadow-tremor-input"
          >
            {prechecking ? 'Procesando...' : 'Pre-chequear'}
          </button>
        </div>
      ) : null}

      {/* Progreso en tiempo real del pre-chequeo usando sockets */}
      {preCorr && !precheck ? (
        <PrecheckProgress token={token} roomType={roomType} gestionId={gestionId} type={type} correlationId={preCorr} />
      ) : null}

      {precheck && !running ? (
        <div className="border rounded-tremor-default p-3 mt-2">
          <div className="text-sm text-tremor-content-strong mb-1">Resumen de pre-chequeo</div>
          <div className="text-xs text-tremor-content">Total filas: {precheck.total ?? '-'}</div>
          <div className="text-xs text-tremor-content">Válidas: {precheck.validCount ?? '-'}</div>
          {(() => {
            const rr = Array.isArray(precheck.rejectedRecords) ? precheck.rejectedRecords : [];
            const dupInFile = rr.filter(x => String(x.error||'').includes('DUP_IN_FILE')).length;
            const existsDb = rr.filter(x => String(x.error||'').includes('EXISTS_IN_DB')).length;
            return (
              <div className="text-xs text-tremor-content">Descartadas: {precheck.rejectedCount ?? rr.length} (Duplicadas en archivo: {dupInFile}, Ya existen en base: {existsDb})</div>
            );
          })()}
          {Array.isArray(precheck.rejectedRecords) && precheck.rejectedRecords.length > 0 ? (
            <div className="mt-2">
              <div className="text-xs text-tremor-content-strong mb-1">Detalles descartados</div>
              <div className="max-h-48 overflow-y-auto border rounded-tremor-default">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-tremor-background-muted">
                      <th className="text-left px-2 py-1">Folio</th>
                      {type !== 'licencias' && (
                        <th className="text-left px-2 py-1">Documento/Fecha</th>
                      )}
                      {type !== 'licencias' && (
                        <th className="text-left px-2 py-1">Monto</th>
                      )}
                      <th className="text-left px-2 py-1">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {precheck.rejectedRecords.slice(0, 50).map((item, idx) => {
                      const r = item.row || {};
                      const reason = String(item.error || '')
                        .replace('DUP_IN_FILE','Duplicado en este archivo')
                        .replace('EXISTS_IN_DB','Ya existe en base');
                      return (
                        <tr key={idx} className="border-t">
                          <td className="px-2 py-1 font-medium">{r.folio || '-'}</td>
                          {type === 'subsidio' && (
                            <td className="px-2 py-1">{r.numeroDocumento || '-'} · {r.fechaDeposito || '-'}</td>
                          )}
                          {type === 'anticipo' && (
                            <td className="px-2 py-1">{r.fechaAnticipo || '-'}</td>
                          )}
                          {type !== 'licencias' && (
                            <td className="px-2 py-1">{fmtCLP(type === 'subsidio' ? r.montoDeposito : r.anticipo)}</td>
                          )}
                          <td className="px-2 py-1 text-tremor-content-subtle">{reason}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => { setQuerySuffix('?skipExisting=true'); setTimeout(() => setStartTrigger(Date.now()), 0); }}
              className="whitespace-nowrap rounded-tremor-small bg-tremor-brand px-3 py-1.5 text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input"
            >
              Subir solo nuevos
            </button>
            <button
              type="button"
              onClick={() => { setQuerySuffix('?skipExisting=false'); setTimeout(() => setStartTrigger(Date.now()), 0); }}
              className="whitespace-nowrap rounded-tremor-small bg-tremor-brand px-3 py-1.5 text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input"
            >
              Subir todo
            </button>
          </div>
        </div>
      ) : null}

      <div style={{ display: ((!precheck && !prechecking) || running) ? 'block' : 'none' }}>
        <BulkUploadGL
          token={token}
          type={type}
          gestionLicenciaId={gestionId}
          uploadUrl={uploadUrl}
          parentField={parentField}
          roomType={roomType}
          onFileSelected={setSelectedFile}
          startTrigger={startTrigger}
          cancelTrigger={cancelTrigger}
          onClose={onClose}
          onDone={(job) => {
            setDoneSummary(job || { summary: { processed: 0, rejected: 0, total: 0 } });
            try { doRefresh?.(); } catch {}
          }}
          onRunningChange={(isRunning) => {
            if (isRunning) setDoneSummary(null);
            setRunning(isRunning);
          }}
        />
      </div>
    </div>
  );
}

function PrecheckProgress({ token, roomType, gestionId, type, correlationId }) {
  const { socket, isConnected, joinRoom } = useSocket(token);
  const { jobs } = useBulkProgress(socket);
  React.useEffect(() => {
    if (!gestionId || !roomType) return;
    if (!isConnected) return;
    try { joinRoom(roomType, gestionId); } catch (_) {}
  }, [isConnected, gestionId, roomType, joinRoom]);

  const job = React.useMemo(
    () => selectBulkJob(jobs, { correlationId, type, gestionLicenciaId: gestionId }),
    [jobs, correlationId, type, gestionId]
  );

  if (!job) return null;
  return (
    <div className="border rounded-tremor-default p-3 mt-2 bg-tremor-background-muted">
      <div className="flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
        Pre-chequeo en curso… {String(job?.percent ?? 0)}% ({String(job?.processed ?? 0)} / {String(job?.total ?? 0)})
      </div>
    </div>
  );
}

// Evitar cierre por clic afuera o ESC y ocultar la X del header mientras corre
CargaMasivaRealtime.staticBackdrop = true;
CargaMasivaRealtime.hideHeaderClose = false;
