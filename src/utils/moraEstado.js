export const formatMoraEstadoLabel = (estado, fallback = "Sin estado") => {
  const normalized = String(estado || "").trim().toLowerCase();

  if (!normalized) return fallback;
  if (normalized === "registrada") return "Ingresada";
  if (normalized === "espera entidad") return "En espera de respuesta de entidad";

  return String(estado)
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
