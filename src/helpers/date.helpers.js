// src/utils/date.helpers.js
import { differenceInDays, parseISO } from 'date-fns';

export const calculateDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return ''; // O 0, según prefieras
  }
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (isNaN(start) || isNaN(end)) return '';

    // Agregamos 1 para que el rango sea inclusivo (ej: del 22 al 22 es 1 día)
    return differenceInDays(end, start) + 1; 
  } catch (error) {
    return '';
  }
};