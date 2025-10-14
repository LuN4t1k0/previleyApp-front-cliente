// src/utils/formatPeriodo.js

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function formatPeriodo(periodo) {
  if (!periodo || periodo.length !== 6) return periodo;
  const mes = parseInt(periodo.slice(4, 6), 10);
  const anio = periodo.slice(0, 4);
  return `${meses[mes - 1]} ${anio}`;
}
