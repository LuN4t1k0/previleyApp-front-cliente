// // src/utils/dateUtils.js

// /**
//  * Convierte un período en formato string (ej: "07/2025") a un formato de string (ej: "202507") para el backend.
//  * @param {string} periodoStr - El período en formato "MM/YYYY".
//  * @returns {string|null} El período en formato YYYYMM como STRING o null si la entrada no es válida.
//  */
// export const unformatPeriodo = (periodoStr) => {
//   if (!periodoStr || typeof periodoStr !== 'string' || periodoStr.length !== 7) return null;
  
//   const parts = periodoStr.split('/');
//   if (parts.length !== 2) return null;
  
//   const [month, year] = parts;
//   if (month.length !== 2 || year.length !== 4) return null;

//   // --- CORRECCIÓN ---
//   // Devolvemos un string, no un número.
//   return `${year}${month}`; 
// };


// NUEVO:
// src/utils/dateUtils.js

/**
 * Formatea un período del backend (ej: "2025-07") a un string visible para el usuario (ej: "07/2025").
 * Se usa cuando se cargan datos existentes en el formulario.
 * @param {string} periodoYyyyMm - El período en formato "YYYY-MM".
 * @returns {string} El período formateado como "MM/YYYY" o un string vacío.
 */
export const formatPeriodo = (periodoYyyyMm) => {
  if (!periodoYyyyMm || typeof periodoYyyyMm !== 'string' || periodoYyyyMm.length !== 7) {
    return "";
  }
  
  const parts = periodoYyyyMm.split('-');
  if (parts.length !== 2) return periodoYyyyMm; // Devuelve el original si no tiene el formato esperado

  const [year, month] = parts;
  return `${month}/${year}`;
};

/**
 * Convierte un período del formulario (ej: "07/2025") al formato del backend (ej: "2025-07").
 * Se usa antes de enviar los datos a la API.
 * @param {string} periodoMmYyyy - El período en formato "MM/YYYY".
 * @returns {string|null} El período en formato "YYYY-MM" o null si la entrada no es válida.
 */
export const unformatPeriodo = (periodoMmYyyy) => {
  if (!periodoMmYyyy || typeof periodoMmYyyy !== 'string' || periodoMmYyyy.length !== 7) {
    return null;
  }
  
  const parts = periodoMmYyyy.split('/');
  if (parts.length !== 2) return null;
  
  const [month, year] = parts;
  if (month.length !== 2 || year.length !== 4) return null;

  // Devuelve el formato "YYYY-MM" que la base de datos espera
  return `${year}-${month}`;
};