"use client";

import React, { useEffect, useState } from "react";
import apiService from "@/app/api/apiService";
import { Badge } from "@tremor/react";

export default function PrefacturaEmailHistoryModal({ initialData, onClose }) {
  const prefactura = initialData;
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

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
      default:
        return channel ? { color: "gray", label: channel } : null;
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
