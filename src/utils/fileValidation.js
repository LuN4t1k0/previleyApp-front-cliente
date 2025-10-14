// src/utils/fileValidation.js

export const MAX_FILE_SIZE_MB = 10;
export const VALID_EXTENSIONS = [".pdf"];

export function validarArchivo(file) {
  const extensionValida = VALID_EXTENSIONS.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );

  if (!extensionValida) {
    return {
      valido: false,
      mensaje: "Solo se permiten archivos PDF mágicos ✨",
    };
  }

  const tamañoEnMB = file.size / (1024 * 1024);
  if (tamañoEnMB > MAX_FILE_SIZE_MB) {
    return {
      valido: false,
      mensaje: "El archivo supera el límite de 10MB. ¡Demasiado poderoso!",
    };
  }

  return { valido: true, mensaje: null };
}
