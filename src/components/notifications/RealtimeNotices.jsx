"use client";

import { useEffect, useState, useCallback } from "react";
import { Callout } from "@tremor/react";
import { RiCheckLine, RiErrorWarningLine } from "@remixicon/react";

// Simple realtime notices stack. Usage: <RealtimeNotices socket={socket} />
// Listens to 'notice' events: { level: 'success'|'error'|'info'|'warning', message, title?, entity?, id? }
export default function RealtimeNotices({ socket, duration = 5000, maxItems = 5, debug = false }) {
  const [items, setItems] = useState([]);

  const removeByKey = useCallback((key) => {
    setItems((prev) => prev.filter((x) => x.key !== key));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onNotice = (payload = {}) => {
      if (debug) {
        // eslint-disable-next-line no-console
        console.log('[notice]', payload);
      }
      const key = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const item = {
        key,
        level: payload.level || payload.type || "info",
        title: payload.title || null,
        message: payload.message || "",
      };
      setItems((prev) => {
        const next = [item, ...prev];
        return next.slice(0, maxItems);
      });
      // auto-dismiss
      const to = setTimeout(() => removeByKey(key), duration);
      return () => clearTimeout(to);
    };

    socket.on("notice", onNotice);
    return () => socket.off("notice", onNotice);
  }, [socket, duration, maxItems, removeByKey]);

  if (!items.length) return null;

  const colorMap = {
    success: "green",
    error: "red",
    warning: "yellow",
    info: "blue",
  };
  const iconMap = {
    success: RiCheckLine,
    error: RiErrorWarningLine,
    warning: RiErrorWarningLine,
    info: RiErrorWarningLine,
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col space-y-3 w-[min(92vw,36rem)] items-center">
      {items.map((n) => {
        const color = colorMap[n.level] || "blue";
        const Icon = iconMap[n.level] || RiErrorWarningLine;
        return (
          <div key={n.key} className="w-full">
            <Callout
              title={n.title || undefined}
              color={color}
              icon={Icon}
              className="shadow-lg"
            >
              <span className="block truncate">
                {n.message}
              </span>
            </Callout>
          </div>
        );
      })}
    </div>
  );
}
