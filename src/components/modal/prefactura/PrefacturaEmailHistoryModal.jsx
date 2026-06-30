"use client";

import React, { useEffect, useState } from "react";
import apiService from "@/app/api/apiService";
import { Badge } from "@tremor/react";
import { useRole } from "@/context/RoleContext";

function EmailReconstructionPanel({
  logId,
  selectedLogId,
  loading,
  error,
  data,
}) {
  if (selectedLogId !== logId) return null;

  return (
    <div className="mt-3 rounded border border-amber-200 bg-amber-50/60 p-3">
      {loading && (
        <div className="text-sm text-gray-500">Reconstruyendo correo...</div>
      )}
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      {!loading && !error && data && (
        <div className="space-y-3">
          <div className="rounded border border-amber-200 bg-white p-3 text-xs text-amber-800">
            {data.warning}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Asunto
            </div>
            <div className="mt-1 text-sm font-medium text-gray-800">
              {data.email?.subject || "-"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Adjuntos estimados
            </div>
            <div className="mt-2 divide-y rounded border bg-white">
              {(data.attachments || []).length === 0 && (
                <div className="p-3 text-sm text-gray-500">Sin adjuntos detectados.</div>
              )}
              {(data.attachments || []).map((attachment) => (
                <div
                  key={attachment.fileKey}
                  className="flex items-center justify-between gap-3 p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-gray-700">
                      {attachment.filename}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-400">
                      {attachment.type} · {attachment.mimeType}
                    </div>
                  </div>
                  {attachment.url ? (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Abrir
                    </a>
                  ) : (
                    <span className="shrink-0 text-xs text-red-500">No disponible</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Vista previa estimada
            </div>
            <iframe
              title={`Reconstrucción correo ${logId}`}
              srcDoc={data.email?.html || ""}
              className="h-[420px] w-full rounded border bg-white"
              sandbox=""
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function PrefacturaEmailHistoryModal({ initialData, onClose }) {
  const prefactura = initialData;
  const { role, rawRole } = useRole();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [reconstructionState, setReconstructionState] = useState({
    selectedLogId: null,
    data: null,
    loading: false,
    error: null,
  });
  const normalizedRole = String(rawRole || role || "").trim().toLowerCase();
  const canViewReconstruction = normalizedRole === "admin";

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiService.get(`/prefacturas/email-logs/${prefactura.id}`);
        if (!mounted) return;
        setItems(res?.data?.data || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "No se pudo cargar el historial");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (prefactura?.id) load();
    return () => { mounted = false; };
  }, [prefactura?.id]);

  const Variant = (status) => {
    switch (status) {
      case "sent": return { color: "green", label: "Enviada" };
      case "queued": return { color: "yellow", label: "En cola" };
      case "failed": return { color: "red", label: "Fallida" };
      default: return { color: "gray", label: status || "-" };
    }
  };

  const channelInfo = (channel) => {
    switch (channel) {
      case "prefactura-followup":
        return { color: "yellow", label: "Seguimiento OC / HES" };
      case "prefactura-initial":
        return { color: "blue", label: "Prefactura enviada" };
      case "factura-created":
        return { color: "green", label: "Factura creada" };
      case "factura-overdue-reminder":
        return { color: "red", label: "Recordatorio de pago" };
      case "prefactura-cancelled":
        return { color: "red", label: "Prefactura anulada" };
      default:
        return channel ? { color: "gray", label: channel } : null;
    }
  };

  const loadReconstruction = async (logId) => {
    if (!canViewReconstruction) return;

    if (reconstructionState.selectedLogId === logId && reconstructionState.data) {
      setReconstructionState({
        selectedLogId: null,
        data: null,
        loading: false,
        error: null,
      });
      return;
    }

    try {
      setReconstructionState({
        selectedLogId: logId,
        data: null,
        loading: true,
        error: null,
      });
      const res = await apiService.get(`/prefacturas/email-logs/${logId}/reconstruction`);
      setReconstructionState({
        selectedLogId: logId,
        data: res?.data?.data || null,
        loading: false,
        error: null,
      });
    } catch (e) {
      setReconstructionState({
        selectedLogId: logId,
        data: null,
        loading: false,
        error:
          e?.response?.data?.message ||
          e?.message ||
          "No se pudo reconstruir el correo.",
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        Historial de envíos de la prefactura <span className="font-medium">#{prefactura?.folio || prefactura?.id}</span>
      </div>

      {loading && <div className="text-sm text-gray-500">Cargando...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="divide-y border rounded">
          {items.length === 0 && (
            <div className="p-3 text-sm text-gray-500">Sin registros</div>
          )}
          {items.map((log) => {
            const vr = Variant(log.status);
            const when = new Date(log.createdAt).toLocaleString();
            const r = log.recipients || {};
            const emails = [
              ...(r.to || []),
              ...(r.cc || []),
              ...(r.bcc || []),
            ];
            const channel = channelInfo(r.channel);
            return (
              <div key={log.id} className="p-3 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-sm text-gray-700">
                    <Badge color={vr.color} className="mr-2">{vr.label}</Badge>
                    <span className="text-xs text-gray-500">{when}</span>
                  </div>
                  {channel && (
                    <div className="mt-1 text-xs text-gray-500">
                      <Badge color={channel.color} className="mr-2">{channel.label}</Badge>
                      {r.triggeredBy === "manual" ? "Envío manual" : "Automático"}
                      {r.forced ? " · forzado" : ""}
                    </div>
                  )}
                  <div className="mt-1 text-sm text-gray-600 break-all">
                    {emails.join(", ") || "(sin destinatarios)"}
                  </div>
                  {log.messageId && (
                    <div className="mt-1 text-xs text-gray-400">MessageId: {log.messageId}</div>
                  )}
                  {canViewReconstruction && (
                    <button
                      type="button"
                      onClick={() => loadReconstruction(log.id)}
                      className="mt-3 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={reconstructionState.loading && reconstructionState.selectedLogId === log.id}
                    >
                      {reconstructionState.selectedLogId === log.id ? "Ocultar reconstrucción" : "Ver reconstrucción"}
                    </button>
                  )}
                  <EmailReconstructionPanel
                    logId={log.id}
                    selectedLogId={reconstructionState.selectedLogId}
                    loading={reconstructionState.loading}
                    error={reconstructionState.error}
                    data={reconstructionState.data}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
