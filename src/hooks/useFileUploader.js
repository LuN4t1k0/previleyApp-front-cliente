
// src/hooks/useFileUploader.js

import { useState } from "react";
import { validarArchivo } from "@/utils/fileValidation";
import { subirArchivosPagex } from "@/utils/pagexUploadUtils";

export function useFileUploader() {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const validated = selected.map((file) => {
      const { valido, mensaje } = validarArchivo(file);
      return {
        file,
        error: valido ? null : mensaje,
      };
    });
    setFiles(validated);
  };

  const handleRemove = (index) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validFiles = files.filter((f) => !f.error);
    if (!validFiles.length) return;

    setIsUploading(true);
    setUploadStep("Hablando con don Patricio 🪄");
    setUploadSuccess(false);

    try {
      const zipBlob = await subirArchivosPagex(
        validFiles.map((f) => f.file),
        setUploadStep
      );

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pagex_procesado.zip";
      a.click();
      URL.revokeObjectURL(url);

      // ✅ Notificamos éxito
      setUploadSuccess(true);
    } catch (err) {
      console.error("Error durante el procesamiento:", err);
    } finally {
      setIsUploading(false);
      setUploadStep(null);
    }
  };

  const resetUploader = () => {
    setFiles([]);
    setUploadSuccess(false);
  };

  return {
    files,
    isUploading,
    uploadStep,
    uploadSuccess,
    handleFileChange,
    handleRemove,
    handleSubmit,
    resetUploader,
  };
}
