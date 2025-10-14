// // utils/estadoPrevired.utils.js

// export const ESTADOS_ORDENADOS = ["Previred", "PreJudicial", "Judicial"];

// export const COLOR_MAP_ESTADO_PREVIRED = {
//   Previred: "yellow",
//   PreJudicial: "amber",
//   Judicial: "rose",
// };

// const NORMALIZADOR_ESTADOS = {
//   previred: "Previred",
//   prejudicial: "PreJudicial",
//   judicial: "Judicial",
// };

// export const normalizarEstadoPrevired = (estado) =>
//   NORMALIZADOR_ESTADOS[estado?.toLowerCase()] || estado;


// NUEVO:
// utils/estadoPrevired.utils.js

export const ESTADOS_ORDENADOS = ["Judicial", "Pre Judicial", "No Judicial"];

export const COLOR_MAP_ESTADO_PREVIRED = {
  Judicial: "rose",
  "Pre Judicial": "amber",
  "No Judicial": "yellow",
};

const NORMALIZADOR_ESTADOS = {
  judicial: "Judicial",
  juicio: "Judicial",
  "pre judicial": "Pre Judicial",
  prejudicial: "Pre Judicial",
  "pre-judicial": "Pre Judicial",
  previred: "No Judicial",
  "no judicial": "No Judicial",
  "no_judicial": "No Judicial",
};

export const normalizarEstadoPrevired = (estado) => {
  if (estado == null) return estado;

  const valor = String(estado).trim();
  if (!valor) return valor;

  const clave = valor.toLowerCase();
  if (NORMALIZADOR_ESTADOS[clave]) {
    return NORMALIZADOR_ESTADOS[clave];
  }

  return valor
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};
