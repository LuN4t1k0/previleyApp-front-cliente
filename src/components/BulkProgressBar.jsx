import { useEffect, useMemo, useRef, useState } from "react";

function formatDuration(seconds) {
  if (seconds == null || !isFinite(seconds)) return "--:--";
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function BulkProgressBar({ job, uploadPercent }) {
  const { percent = 0, processed = 0, total = 0, phase, startedAt, valid, rejected, orphan, existing } = job || {};
  const [etaSec, setEtaSec] = useState(null);
  const samplesRef = useRef([]); // [{t, processed}]
  const startTimeRef = useRef(startedAt ? new Date(startedAt).getTime() : Date.now());

  // Update ETA on processed changes using a small sliding window (last 10s)
  useEffect(() => {
    const now = Date.now();
    samplesRef.current.push({ t: now, processed });
    // keep last 10 seconds
    const cutoff = now - 10000;
    samplesRef.current = samplesRef.current.filter((s) => s.t >= cutoff);
    if (samplesRef.current.length >= 2 && total > 0) {
      const first = samplesRef.current[0];
      const last = samplesRef.current[samplesRef.current.length - 1];
      const dt = (last.t - first.t) / 1000;
      const dproc = Math.max(0, last.processed - first.processed);
      const rate = dt > 0 ? dproc / dt : 0; // items/sec
      if (rate > 0) {
        const remaining = Math.max(0, total - processed);
        setEtaSec(remaining / rate);
      }
    }
  }, [processed, total]);

  // Única barra: si aún no hay job, muestra progreso de subida; luego progreso de procesamiento
  const unifiedPercent = useMemo(() => {
    if (!job && typeof uploadPercent === "number") return Math.max(0, Math.min(100, uploadPercent));
    return Math.max(0, Math.min(100, percent || 0));
  }, [job, uploadPercent, percent]);

  const statusText = useMemo(() => {
    if (!job) {
      if (typeof uploadPercent === "number") return `Subiendo archivo (${Math.round(uploadPercent)}%)`;
      return "Esperando archivo...";
    }
    if (phase === "normalize:progress") return `Normalizando ${processed}/${total}`;
    if (phase === "precheck:prepare") return `Preparando prechequeo...`;
    if (phase === "precheck:db:ready") return `Prechequeo: existentes ${existing ?? 0} en base. Archivo: ${total}`;
    if (phase === "precheck:progress") return `Prechequeo ${processed}/${total}`;
    if (phase === "precheck:end") return `Prechequeo: se procesarán ${valid ?? 0} de ${total}. Rechazadas ${rejected ?? 0}${typeof orphan === 'number' ? `, Huérfanas ${orphan}` : ''}`;
    if (phase === "process") return `Procesando ${processed}/${total}`;
    if (phase === "normalize:end") return `Normalizado ${total}`;
    if (phase === "parse:end") return `Leídas ${total}`;
    if (phase === "done") return `Completado (${total})`;
    return phase || "Iniciando";
  }, [job, phase, processed, total, uploadPercent]);

  return (
    <div className="w-full max-w-xl">
      <div className="text-xs text-tremor-content mb-1">{statusText}</div>
      <div className="h-2 bg-gray-200 rounded">
        <div
          className="h-2 bg-emerald-400 rounded transition-all duration-200"
          style={{ width: `${unifiedPercent}%` }}
        />
      </div>
      {job && (
        <div className="flex justify-between text-xs text-tremor-content-subtle mt-1">
          <span>
            {phase === "process" && total > 0 ? `${processed}/${total}` : undefined}
          </span>
          <span>Tiempo restante: {formatDuration(etaSec)}</span>
        </div>
      )}
    </div>
  );
}
