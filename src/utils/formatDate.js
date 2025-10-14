import { format, isBefore } from "date-fns";
import { es } from "date-fns/locale";

// ✅ Versión simple que retorna solo el string (ideal para mostrar fechas)
export const formatDateChile = (dateString) => {
  if (!dateString) return "Sin fecha";
  try {
    const date = new Date(dateString);
    if (isNaN(date)) return "Fecha Inválida";
    return format(date, "dd-MM-yyyy", { locale: es });
  } catch {
    return "Fecha Inválida";
  }
};

// ✅ Versión extendida si necesitas lógica adicional (como saber si está vencida)
export const formatDateChileWithInfo = (dateString) => {
  if (!dateString) return { formattedDate: "Sin fecha", isExpired: false };
  try {
    const date = new Date(dateString);
    if (isNaN(date)) return { formattedDate: "Fecha Inválida", isExpired: false };
    return {
      formattedDate: format(date, "dd-MM-yyyy", { locale: es }),
      isExpired: isBefore(date, new Date()),
    };
  } catch {
    return { formattedDate: "Fecha Inválida", isExpired: false };
  }
};

export const formatPeriodo = (periodoString) => {
  if (!periodoString || periodoString.length !== 6) return "Período inválido";
  const anio = periodoString.slice(0, 4);
  const mes = periodoString.slice(4, 6);
  return `${mes}/${anio}`; // Ej: 202401 → 01/2024
};

export const formatPeriodoLargo = (periodoString) => {
  if (!periodoString || periodoString.length !== 6) return "Período inválido";
  const anio = periodoString.slice(0, 4);
  const mes = periodoString.slice(4, 6);

  const date = new Date(`${anio}-${mes}-01`);
  if (isNaN(date)) return "Período inválido";

  return format(date, "MMMM yyyy", { locale: es }); // Ej: "enero 2024"
};