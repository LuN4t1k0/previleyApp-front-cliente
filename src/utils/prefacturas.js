const STATUS_META = {
  pendiente: {
    label: "Pendiente",
    tone: "warning",
  },
  facturada: {
    label: "Facturada",
    tone: "info",
  },
  pagada: {
    label: "Pagada",
    tone: "success",
  },
  aprobada: {
    label: "Aprobada",
    tone: "success",
  },
  rechazada: {
    label: "Rechazada",
    tone: "error",
  },
  revertida: {
    label: "Revertida",
    tone: "neutral",
  },
};

export const getPrefacturaStatusMeta = (estado) => {
  if (!estado) {
    return {
      label: "Sin estado",
      tone: "neutral",
    };
  }
  const normalized = String(estado).toLowerCase();
  return STATUS_META[normalized] || {
    label: normalized.charAt(0).toUpperCase() + normalized.slice(1),
    tone: "neutral",
  };
};
