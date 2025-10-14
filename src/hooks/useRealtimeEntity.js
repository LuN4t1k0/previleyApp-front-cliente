import { useEffect } from "react";

// Suscribe a eventos CRUD de una entidad y ejecuta handlers
// entity: string, p.ej. "detalleMora" | "gestionMora" | "licencia"
export default function useRealtimeEntity(socket, entity, {
  onCreated,
  onUpdated,
  onDeleted,
} = {}) {
  useEffect(() => {
    if (!socket || !entity) return;

    const createdEvt = `${entity}:created`;
    const updatedEvt = `${entity}:updated`;
    const deletedEvt = `${entity}:deleted`;

    const handleCreated = (payload) => onCreated?.(payload?.data ?? payload);
    const handleUpdated = (payload) => onUpdated?.(payload?.data ?? payload);
    const handleDeleted = (payload) => onDeleted?.(payload?.id ?? payload);

    socket.on(createdEvt, handleCreated);
    socket.on(updatedEvt, handleUpdated);
    socket.on(deletedEvt, handleDeleted);

    return () => {
      socket.off(createdEvt, handleCreated);
      socket.off(updatedEvt, handleUpdated);
      socket.off(deletedEvt, handleDeleted);
    };
  }, [socket, entity, onCreated, onUpdated, onDeleted]);
}

