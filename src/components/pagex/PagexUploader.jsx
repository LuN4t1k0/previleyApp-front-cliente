
"use client";

import {
  RiUpload2Line,
  RiCloseLine,
  RiFileCloseLine,
  RiErrorWarningFill,
  RiCheckboxCircleLine,
} from "@remixicon/react";
import { Button, Text, Card, Title } from "@tremor/react";
import UploadProgress from "./UploadProgress";
import { useFileUploader } from "@/hooks/useFileUploader";
import { useEffect, useState, useRef } from "react";

export default function PagexUploader() {
  const {
    files,
    isUploading,
    uploadStep,
    handleFileChange,
    handleRemove,
    handleSubmit,
    resetUploader,
    uploadSuccess,
  } = useFileUploader();

  const hasErrors = files.some((f) => f.error);
  const validFiles = files.filter((f) => !f.error);

  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (uploadSuccess) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        resetUploader();
        if (inputRef.current) {
          inputRef.current.value = null;
        }
      }, 3000);
    }
  }, [uploadSuccess, resetUploader]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-center rounded-tremor-default border border-dashed border-gray-300 px-6 py-10 dark:border-dark-tremor-border">
        <div className="text-center">
          <RiUpload2Line className="mx-auto h-8 w-8 text-tremor-content-subtle" />
          <label className="cursor-pointer font-medium text-tremor-brand hover:underline">
            <span>Haz clic para subir archivos PDF</span>
            <input
              type="file"
              accept="application/pdf"
              multiple
              className="sr-only"
              ref={inputRef}
              onChange={handleFileChange}
            />
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Máx 10MB por archivo. Solo .PDF
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {files.map(({ file, error }, index) => (
            <div
              key={index}
              className={`relative rounded-tremor-default p-4 ${
                error
                  ? "bg-red-50 dark:bg-red-500/10"
                  : "bg-tremor-background-muted dark:bg-dark-tremor-background-muted"
              }`}
            >
              <div className="absolute right-1 top-1">
                <button
                  type="button"
                  className="rounded-tremor-small p-2 text-tremor-content-subtle hover:text-tremor-content dark:text-dark-tremor-content-subtle hover:dark:text-tremor-content"
                  aria-label="Eliminar"
                  onClick={() => handleRemove(index)}
                >
                  <RiCloseLine className="size-5 shrink-0" aria-hidden={true} />
                </button>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tremor-small bg-tremor-background shadow-tremor-input ring-1 ring-inset ring-tremor-ring dark:bg-dark-tremor-background dark:shadow-dark-tremor-input dark:ring-dark-tremor-ring">
                  <RiFileCloseLine
                    className={`size-5 ${
                      error
                        ? "text-red-500 dark:text-red-500"
                        : "text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis"
                    }`}
                    aria-hidden={true}
                  />
                </span>
                <div className="w-full">
                  <p className="text-tremor-label font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                    {file.name}
                  </p>
                  <p className="mt-0.5 flex justify-between text-tremor-label text-tremor-content dark:text-dark-tremor-content">
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    {error && <span className="text-red-500 font-medium">{error}</span>}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isUploading && <UploadProgress step={uploadStep} />}

      {showSuccess && (
        <Card className="flex items-center space-x-3 bg-green-50 p-4 dark:bg-green-500/10 animate-fade-in">
          <RiCheckboxCircleLine className="text-green-600" />
          <Text className="text-green-700 dark:text-green-500">¡Procesamiento completado con éxito!</Text>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isUploading || validFiles.length === 0 || hasErrors}
        >
          Procesar archivos
        </Button>
      </div>
    </form>
  );
}
