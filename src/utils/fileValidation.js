// src/utils/fileValidation.js
import {
  UPLOAD_MAX_FILE_SIZE_BYTES,
  UPLOAD_MAX_FILE_SIZE_MB,
} from "@/config/uploadLimits";

export const MAX_FILE_SIZE_MB = UPLOAD_MAX_FILE_SIZE_MB;
export const VALID_EXTENSIONS = [".pdf"];

export function validarArchivo(file) {
  const extensionValida = VALID_EXTENSIONS.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );

  if (!extensionValida) {
    return {
      valido: false,
      mensaje: "Solo se permiten archivos PDF.",
    };
  }

  if (file.size > UPLOAD_MAX_FILE_SIZE_BYTES) {
    return {
      valido: false,
      mensaje: `El archivo supera el límite de ${MAX_FILE_SIZE_MB} MB.`,
    };
  }

  return { valido: true, mensaje: null };
}
