"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  RiCheckboxCircleLine,
  RiExternalLinkLine,
  RiNotification3Line,
} from "@remixicon/react";
import {
  acknowledgeNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notificationService";

const statusOptions = [
  { value: "", label: "Todas" },
  { value: "unread", label: "No leídas" },
  { value: "read", label: "Leídas" },
  { value: "resolved", label: "Resueltas" },
];

const statusMeta = {
  unread: {
    label: "No leída",
    className: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
  read: {
    label: "Leída",
    className: "bg-slate-50 text-slate-600 ring-slate-200",
  },
  resolved: {
    label: "Resuelta",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
};

const formatDateTime = (value) => {
  if (!value) return "Sin fecha";
  try {
    return new Intl.DateTimeFormat("es-CL", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch (_) {
    return "Sin fecha";
  }
};

const getNotificationHref = (notification) => {
  const metadata = notification?.metadata || {};
  return notification?.actionUrl || metadata.actionUrl || metadata.path || metadata.href || null;
};

export default function NotificationsPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState({ total: 0, data: [], limit: 20, offset: 0 });

  const params = useMemo(
    () => ({
      limit: 20,
      offset: page * 20,
      ...(status ? { status } : {}),
    }),
    [page, status]
  );

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setResult(await fetchNotifications(params));
    } catch (err) {
      setError(
        err?.response?.data?.message || "No fue posible cargar las notificaciones."
      );
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const totalPages = Math.max(1, Math.ceil(Number(result.total || 0) / 20));
  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  const runNotificationAction = async (id, action) => {
    setActionLoadingId(id);
    try {
      await action(id);
      await loadNotifications();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(0);
  };

  const handleReadAll = async () => {
    setActionLoadingId("all");
    try {
      await markAllNotificationsRead();
      await loadNotifications();
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <section className="theme-dashboard dashboard-gradient min-h-screen px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="glass-panel rounded-[2rem] px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--theme-soft)] text-[color:var(--theme-primary)]">
                <RiNotification3Line className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--text-secondary)]">
                  Portal cliente
                </p>
                <h1 className="text-2xl font-semibold text-[color:var(--text-primary)]">
                  Notificaciones
                </h1>
                <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                  Comunicaciones operativas, avisos de gestión y respuestas que requieren revisión.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={status}
                onChange={handleStatusChange}
                className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-[color:var(--theme-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)]/20"
                aria-label="Filtrar por estado"
              >
                {statusOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleReadAll}
                disabled={actionLoadingId === "all"}
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--theme-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--theme-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Marcar todas como leídas
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-sm">
          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Cargando notificaciones...
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center text-sm text-rose-600">
              {error}
            </div>
          ) : result.data.length ? (
            <div className="divide-y divide-slate-100">
              {result.data.map((notification) => {
                const meta = statusMeta[notification.status] || statusMeta.read;
                const href = getNotificationHref(notification);
                const isUnread = notification.status === "unread";
                const isResolved = notification.status === "resolved";
                const actionBusy = actionLoadingId === notification.id;

                return (
                  <article
                    key={notification.id}
                    className={`grid gap-4 px-5 py-5 md:grid-cols-[1fr_auto] ${
                      isUnread ? "bg-indigo-50/40" : "bg-white"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-slate-900">
                          {notification.title || "Notificación"}
                        </h2>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.className}`}
                        >
                          {meta.label}
                        </span>
                        {notification.requiresAction && !isResolved && (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                            Requiere acción
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-slate-400">
                        <span>{formatDateTime(notification.createdAt)}</span>
                        {notification.actor && (
                          <span>
                            Enviado por {notification.actor.nombre}{" "}
                            {notification.actor.apellido}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      {href && (
                        <Link
                          href={href}
                          onClick={() => {
                            if (isUnread) {
                              runNotificationAction(notification.id, markNotificationRead);
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary)]"
                        >
                          Abrir
                          <RiExternalLinkLine className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      )}
                      {isUnread && (
                        <button
                          type="button"
                          onClick={() =>
                            runNotificationAction(notification.id, markNotificationRead)
                          }
                          disabled={actionBusy}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <RiCheckboxCircleLine className="h-4 w-4" aria-hidden="true" />
                          Leída
                        </button>
                      )}
                      {notification.requiresAction && !isResolved && (
                        <button
                          type="button"
                          onClick={() =>
                            runNotificationAction(notification.id, acknowledgeNotification)
                          }
                          disabled={actionBusy}
                          className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Confirmar
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              No hay notificaciones para este filtro.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[color:var(--text-secondary)]">
            {result.total} notificaciones
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={!canPrev}
              className="rounded-full border border-white/70 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm font-semibold text-slate-600">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!canNext}
              className="rounded-full border border-white/70 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
