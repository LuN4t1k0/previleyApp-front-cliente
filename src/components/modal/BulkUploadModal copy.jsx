'use client';
import React, { useState } from 'react';
import {
  RiCloseLine,
  RiErrorWarningFill,
  RiFileLine,
  RiFileExcelLine
} from '@remixicon/react';
import { Dialog, DialogPanel, ProgressBar, Button } from '@tremor/react';
import apiService from '@/app/api/apiService'; // Asegúrate de tener este servicio configurado
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver'; // Asegúrate de tener file-saver instalado: npm install file-saver
import {
  showErrorAlert,
  showInfoAlert,
} from '@/utils/alerts';

const BulkUploadModal = ({ onClose, handleBulkUpload, fetchData }) => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const newFile = e.target.files[0];
    validateFile(newFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const newFile = e.dataTransfer.files[0];
    validateFile(newFile);
    setDragging(false);
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDragEnter = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragging(false); };

  const validateFile = (newFile) => {
    if (
      newFile &&
      ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(newFile.type)
    ) {
      if (newFile.size <= 10 * 1024 * 1024) {
        setFile(newFile);
        setError(null);
      } else {
        setError('El archivo excede el tamaño máximo de 10 MB.');
        setFile(null);
        setProgress(0);
      }
    } else {
      setError('Solo se permiten archivos CSV, XLSX o XLS.');
      setFile(null);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
  
    setIsLoading(true);
  
    try {
      const result = await handleBulkUpload(file, setProgress); // Pasa setProgress para actualizar el progreso
      if (result) {
        setFile(null);
        setProgress(100);
        showSummary(result); // Mostrar el resumen en caso de éxito
      }
    } catch (error) {
      setError("Error al subir el archivo.");
      console.error("Error en la carga masiva:", error);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const showSummary = (data) => {
    const { createdRecords = [], updatedRecords = [], duplicatedRecords = [] } = data;

    const summaryHtml = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">Tipo</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Creado(s)</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${createdRecords.length}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Actualizado(s)</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${updatedRecords.length}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Duplicado(s)</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${duplicatedRecords.length}</td>
          </tr>
        </tbody>
      </table>
      <br />
      <a href="#" id="download-summary">Descargar Detalle</a>
    `;

    Swal.fire({
      icon: 'success',
      title: 'Resumen de la carga',
      html: summaryHtml,
      didOpen: () => {
        const downloadLink = document.getElementById('download-summary');
        downloadLink.addEventListener('click', (e) => {
          e.preventDefault();
          downloadSummary(data);
        });
      },
      confirmButtonText: 'Aceptar'
    });
  };

  const downloadSummary = (data) => {
    const { createdRecords, updatedRecords, duplicatedRecords } = data;
    let summaryContent = 'Registro,RUT,Nombre,Estado\n';

    if (createdRecords && Array.isArray(createdRecords)) {
      createdRecords.forEach(record => {
        summaryContent += `Creado,${record.empresaRut || 'N/A'},${record.nombreTrabajador || 'N/A'},${record.estadoLicencia || 'Sin Estado'}\n`;
      });
    }

    if (updatedRecords && Array.isArray(updatedRecords)) {
      updatedRecords.forEach(record => {
        summaryContent += `Actualizado,${record.empresaRut || 'N/A'},${record.nombreTrabajador || 'N/A'},${record.estadoLicencia || 'Sin Estado'}\n`;
      });
    }

    if (duplicatedRecords && Array.isArray(duplicatedRecords)) {
      duplicatedRecords.forEach(record => {
        summaryContent += `Duplicado,${record.empresaRut || 'N/A'},${record.nombreTrabajador || 'N/A'},${record.estadoLicencia || 'Sin Estado'}\n`;
      });
    }

    const blob = new Blob([summaryContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'resumen_carga.csv');
  };

  const handleCancel = () => {
    setFile(null);
    setProgress(0);
    onClose(); // Cerrar la modal
    setError(null); // Resetear el error al cancelar
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Dialog
      open={true} // Siempre true cuando el componente está renderizado
      onClose={handleCancel}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden bg-gray-900 bg-opacity-75"
    >
      <DialogPanel className="w-full max-w-lg p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Carga Masiva de Archivos</h3>
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-500"
            onClick={handleCancel}
            aria-label="Close"
          >
            <RiCloseLine className="h-6 w-6" aria-hidden={true} />
          </button>
        </div>
        <form>
          {!file && (
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`mt-4 flex justify-center rounded-tremor-default border ${
                dragging ? 'border-green-500' : 'border-dashed border-gray-300'
              } px-6 py-20 dark:border-dark-tremor-border`}
            >
              <div>
                <RiFileLine
                  className="mx-auto h-12 w-12 text-tremor-content-subtle dark:text-dark-tremor-content"
                  aria-hidden={true}
                />
                <div className="mt-4 flex text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                  <p>Arrastra y suelta o</p>
                  <label
                    htmlFor="file-upload-3"
                    className="relative cursor-pointer rounded-tremor-small pl-1 font-medium text-tremor-brand hover:underline hover:underline-offset-4 dark:text-dark-tremor-brand"
                  >
                    <span>elige un archivo</span>
                    <input
                      id="file-upload-3"
                      name="file-upload-3"
                      type="file"
                      className="sr-only"
                      accept=".csv, .xlsx, .xls"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">para subir</p>
                </div>
              </div>
            </div>
          )}
          <p className="mt-2 text-tremor-label leading-5 text-tremor-content dark:text-dark-tremor-content sm:flex sm:items-center sm:justify-between">
            <span>Tipos de archivos aceptados: CSV, XLSX o XLS.</span>
            <span className="pl-1 sm:pl-0">Tamaño máximo: 10MB</span>
          </p>
          {error && (
            <div className="mt-4 flex items-center space-x-1.5 bg-red-50 p-4 rounded-tremor-default relative">
              <RiErrorWarningFill
                className="h-5 w-5 shrink-0 text-red-500 dark:text-red-500"
                aria-hidden={true}
              />
              <span className="text-tremor-label text-red-500 dark:text-red-500">
                {error}
              </span>
              <button
                type="button"
                className="absolute top-1 right-1 p-1 text-red-500 hover:text-red-600 dark:text-red-500 hover:dark:text-red-400"
                onClick={handleCloseError}
                aria-label="Close"
              >
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>
          )}
          {file && (
            <div className="relative mt-8 rounded-tremor-default bg-tremor-background-muted p-4 dark:bg-dark-tremor-background-muted">
              <div className="absolute right-1 top-1">
                <button
                  type="button"
                  className="rounded-tremor-small p-2 text-tremor-content-subtle hover:text-tremor-content dark:text-dark-tremor-content-subtle hover:dark:text-tremor-content-emphasis"
                  aria-label="Remove"
                  onClick={() => setFile(null)}
                >
                  <RiCloseLine className="h-5 w-5 shrink-0" aria-hidden={true} />
                </button>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tremor-small bg-tremor-background shadow-tremor-input ring-1 ring-inset ring-tremor-ring dark:bg-dark-tremor-background dark:shadow-dark-tremor-input dark:ring-dark-tremor-ring">
                  <RiFileExcelLine
                    className="h-5 w-5 text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis"
                    aria-hidden={true}
                  />
                </span>
                <div>
                  <p className="text-tremor-label font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                    {file.name}
                  </p>
                  <p className="text-tremor-label text-tremor-content dark:text-dark-tremor-content">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-3">
                <ProgressBar value={progress} className="[&>*]:h-1.5" />
                <span className="text-tremor-label text-tremor-content dark:text-dark-tremor-content">
                  {progress.toFixed(0)}%
                </span>
              </div>
            </div>
          )}
          <div className="mt-8 flex items-center justify-end space-x-3">
            <button
              type="button"
              className="whitespace-nowrap rounded-tremor-small border border-tremor-border px-4 py-2 text-tremor-default font-medium text-tremor-content shadow-tremor-input transition-all hover:bg-tremor-background-muted hover:text-tremor-content-emphasis dark:border-dark-tremor-border dark:text-dark-tremor-content dark:shadow-dark-tremor-input hover:dark:bg-dark-tremor-background-muted hover:dark:text-tremor-content-emphasis"
              onClick={handleCancel}
            >
              Cancelar
            </button>
            <Button
              type="button"
              variant="primary"
              onClick={handleUpload}
              disabled={!file || isLoading}
            >
              {isLoading ? 'Cargando...' : 'Subir'}
            </Button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
};

export default BulkUploadModal;
