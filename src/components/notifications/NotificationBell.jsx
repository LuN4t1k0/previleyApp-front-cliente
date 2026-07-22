"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  RiCheckboxCircleLine,
  RiNotification3Line,
} from "@remixicon/react";
import {
  fetchNotifications,
  fetchUnreadNotificationsCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notificationService";
import { getNotificationHref } from "@/utils/notificationLinks";

const statusLabel = {
  unread: "No leída",
  read: "Leída",
  resolved: "Resuelta",
};

const statusClasses = {
  unread: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  read: "bg-slate-50 text-slate-600 ring-slate-200",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const formatDateTime = (value) => {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("es-CL", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch (_) {
    return "";
  }
};

const mergeNotification = (items, incoming) => {
  if (!incoming?.id) return items;
  const next = [incoming, ...items.filter((item) => item.id !== incoming.id)];
  return next.slice(0, 8);
};

export default function NotificationBell({ socket = null }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [counts, setCounts] = useState({ unread: 0, actionable: 0 });
  const [error, setError] = useState("");
  const containerRef = useRef(null);

  const unreadCount = Number(counts?.unread || 0);
  const hasUnread = unreadCount > 0;

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [list, countData] = await Promise.all([
        fetchNotifications({ limit: 8, offset: 0 }),
        fetchUnreadNotificationsCount(),
      ]);
      setNotifications(list.data);
      setCounts(countData);
    } catch (err) {
      setError(
        err?.response?.data?.message || "No fue posible cargar las notificaciones."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!socket) return;

    const onCreated = (payload = {}) => {
      const notification = payload?.data || payload;
      setNotifications((prev) => mergeNotification(prev, notification));
      setCounts((prev) => ({
        unread: Number(prev?.unread || 0) + (notification?.status === "unread" ? 1 : 0),
        actionable:
          Number(prev?.actionable || 0) + (notification?.requiresAction ? 1 : 0),
      }));
    };

    const onUpdated = (payload = {}) => {
      const notification = payload?.data || payload;
      setNotifications((prev) =>
        prev.map((item) => (item.id === notification?.id ? notification : item))
      );
      fetchUnreadNotificationsCount()
        .then(setCounts)
        .catch(() => {});
    };

    socket.on("notification:created", onCreated);
    socket.on("notification:updated", onUpdated);
    return () => {
      socket.off("notification:created", onCreated);
      socket.off("notification:updated", onUpdated);
    };
  }, [socket]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const updated = await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      setCounts(await fetchUnreadNotificationsCount());
    } catch (_) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      await loadNotifications();
    } catch (_) {}
  };

  const emptyLabel = useMemo(() => {
    if (loading) return "Cargando notificaciones...";
    if (error) return error;
    return "No tienes notificaciones por ahora.";
  }, [error, loading]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/50 text-[color:var(--text-primary)] shadow-sm backdrop-blur transition hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--theme-primary)] focus-visible:ring-offset-2"
        aria-label={`Notificaciones${hasUnread ? `, ${unreadCount} no leídas` : ""}`}
        aria-expanded={open}
      >
        <RiNotification3Line className="h-5 w-5" aria-hidden="true" />
        {hasUnread && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-white/70 bg-white shadow-xl ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Notificaciones</p>
              <p className="text-xs text-slate-500">
                {unreadCount} no leídas
                {counts?.actionable ? ` · ${counts.actionable} requieren acción` : ""}
              </p>
            </div>
            {hasUnread && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary-dark)]"
              >
                Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length ? (
              notifications.map((notification) => {
                const href = getNotificationHref(notification);
                const isUnread = notification.status === "unread";
                const Body = (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {notification.title || "Notificación"}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                          statusClasses[notification.status] || statusClasses.read
                        }`}
                      >
                        {statusLabel[notification.status] || notification.status}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-[11px] font-medium text-slate-400">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                );

                return (
                  <div
                    key={notification.id}
                    className={`flex gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 ${
                      isUnread ? "bg-indigo-50/40" : "bg-white"
                    }`}
                  >
                    {href ? (
                      <Link
                        href={href}
                        onClick={() => {
                          setOpen(false);
                          if (isUnread) handleMarkRead(notification.id);
                        }}
                        className="min-w-0 flex-1"
                      >
                        {Body}
                      </Link>
                    ) : (
                      Body
                    )}
                    {isUnread ? (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(notification.id)}
                        className="mt-0.5 h-8 w-8 shrink-0 rounded-full text-slate-400 transition hover:bg-white hover:text-[color:var(--theme-primary)]"
                        aria-label="Marcar como leída"
                      >
                        <RiCheckboxCircleLine className="mx-auto h-5 w-5" aria-hidden="true" />
                      </button>
                    ) : (
                      <span className="mt-1 h-7 w-7 shrink-0 text-emerald-500">
                        <RiCheckboxCircleLine className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                {emptyLabel}
              </div>
            )}
          </div>

          <Link
            href="/notificaciones"
            onClick={() => setOpen(false)}
            className="block border-t border-slate-100 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-[color:var(--theme-primary)] hover:bg-slate-100"
          >
            Ver historial completo
          </Link>
        </div>
      )}
    </div>
  );
}
