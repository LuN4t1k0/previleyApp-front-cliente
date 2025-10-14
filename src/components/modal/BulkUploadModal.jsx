
'use client';
import React, { useState, useEffect } from 'react';
import {
  RiCloseLine,
  RiErrorWarningFill,
  RiFileLine,
  RiFileExcelLine
} from '@remixicon/react';
import { Dialog, DialogPanel, ProgressBar, Button } from '@tremor/react';
import apiService from '@/app/api/apiService';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import { showErrorAlert } from '@/utils/alerts';
import { downloadResumenYDifExcel } from '@/utils/exportUtils';

const BulkUploadModal = ({ onClose, fetchData, endpoint, gestionId, parentIdField }) => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStage, setUploadStage] = useState("idle"); // 'uploading', 'processing', 'done'

  // Simular progreso de subida (0-90%)
  useEffect(() => {
    let interval;
    if (uploadStage === "uploading") {
      interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 1 : prev));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [uploadStage]);

  // Simular progreso de procesamiento (90-99%)
  useEffect(() => {
    let interval;
    if (uploadStage === "processing") {
      interval = setInterval(() => {
        setProgress(prev => (prev < 99 ? prev + 0.5 : prev));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [uploadStage]);

  const validateFile = (newFile) => {
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (newFile && validTypes.includes(newFile.type)) {
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
    if (!file || !endpoint || !parentIdField || !gestionId) return;

    setIsLoading(true);
    setUploadStage("uploading");

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append(parentIdField, gestionId);

      const response = await apiService.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadStage("processing");

      setTimeout(() => {
        setProgress(100);
        setUploadStage("done");
        setFile(null);
        showSummary(response.data);
        fetchData();
        onClose();
      }, 800); // pequeña espera artificial

    } catch (error) {
      console.error("Error en la carga masiva:", error);
      setError("Error al subir el archivo.");
      showErrorAlert("Error", "No se pudo completar la carga.");
      setIsLoading(false);
      setUploadStage("idle");
    }
  };

  // const showSummary = (data) => {
  //   const { createdRecords = [], updatedRecords = [], duplicateRecords = [] } = data;

  //   const summaryHtml = `
  //     <table style="width: 100%; border-collapse: collapse;">
  //       <thead><tr><th>Tipo</th><th>Cantidad</th></tr></thead>
  //       <tbody>
  //         <tr><td>Creado(s)</td><td>${createdRecords.length}</td></tr>
  //         <tr><td>Actualizado(s)</td><td>${updatedRecords.length}</td></tr>
  //         <tr><td>Duplicado(s)</td><td>${duplicateRecords.length}</td></tr>
  //       </tbody>
  //     </table>
  //     <br />
  //     <a href="#" id="download-summary">Descargar Detalle</a>
  //   `;

  //   Swal.fire({
  //     icon: 'success',
  //     title: 'Resumen de la carga',
  //     html: summaryHtml,
  //     didOpen: () => {
  //       const link = document.getElementById('download-summary');
  //       if (link) {
  //         link.addEventListener('click', (e) => {
  //           e.preventDefault();
  //           downloadSummary(data);
  //         });
  //       }
  //     },
  //     confirmButtonText: 'Aceptar',
  //   });
  // };


  const showSummary = (data) => {
  const {
    createdRecords = [],
    updatedRecords = [],
    duplicateRecords = [],
    ignoredTerminalRecords = [],
  } = data;

  const summaryHtml = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead><tr><th>Tipo</th><th>Cantidad</th></tr></thead>
      <tbody>
        <tr><td>Creado(s)</td><td>${createdRecords.length}</td></tr>
        <tr><td>Actualizado(s)</td><td>${updatedRecords.length}</td></tr>
        <tr><td>Duplicado(s)</td><td>${duplicateRecords.length}</td></tr>
        <tr><td>Ignorado(s) (resueltos)</td><td>${ignoredTerminalRecords.length}</td></tr>
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
      const link = document.getElementById('download-summary');
      if (link) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          // downloadSummary(data);
          downloadResumenYDifExcel(data)
        });
      }
    },
    confirmButtonText: 'Aceptar',
  });
};


  // const downloadSummary = (data) => {
  //   const { createdRecords = [], updatedRecords = [], duplicateRecords = [] } = data;
  //   let csv = 'Tipo,RUT,Nombre,Estado\n';

  //   const appendRows = (list, tipo) => {
  //     list.forEach(record => {
  //       csv += `${tipo},${record.trabajadorRut || 'N/A'},${record.nombreCompleto || 'N/A'},${record.estado || 'N/A'}\n`;
  //     });
  //   };

  //   appendRows(createdRecords, 'Creado');
  //   appendRows(updatedRecords, 'Actualizado');
  //   appendRows(duplicateRecords, 'Duplicado');

  //   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  //   saveAs(blob, 'resumen_carga.csv');
  // };

const downloadSummary = (data) => {
  const {
    createdRecords = [],
    updatedRecords = [],
    duplicateRecords = [],
    ignoredTerminalRecords = [],
  } = data;

  let csv = 'Tipo,RUT,Nombre,Estado\n';

  const appendRows = (list, tipo) => {
    list.forEach(record => {
      csv += `${tipo},${record.trabajadorRut || 'N/A'},${record.nombreCompleto || 'N/A'},${record.estado || 'N/A'}\n`;
    });
  };

  appendRows(createdRecords, 'Creado');
  appendRows(updatedRecords, 'Actualizado');
  appendRows(duplicateRecords, 'Duplicado');
  appendRows(ignoredTerminalRecords, 'Ignorado (resuelto)');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'resumen_carga.csv');
};



  const handleCancel = () => {
    setFile(null);
    setProgress(0);
    setError(null);
    setUploadStage("idle");
    onClose();
  };

  return (
    <Dialog open={true} onClose={handleCancel} className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden bg-gray-900 bg-opacity-75">
      <DialogPanel className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Carga Masiva de Archivos</h3>
          <button onClick={handleCancel} className="p-2 text-gray-400 hover:text-gray-500" aria-label="Close">
            <RiCloseLine className="h-6 w-6" />
          </button>
        </div>
        <form>
          {!file && (
            <div
              onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); validateFile(e.dataTransfer.files[0]); setDragging(false); }}
              className={`mt-4 flex justify-center border ${dragging ? 'border-green-500' : 'border-dashed border-gray-300'} px-6 py-20 rounded`}
            >
              <div>
                <RiFileLine className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 flex text-sm text-gray-600">
                  <p>Arrastra y suelta o</p>
                  <label htmlFor="file-upload" className="pl-1 text-blue-600 hover:underline cursor-pointer">
                    <span>elige un archivo</span>
                    <input id="file-upload" type="file" className="sr-only" accept=".csv, .xlsx, .xls" onChange={(e) => validateFile(e.target.files[0])} />
                  </label>
                  <p className="pl-1">para subir</p>
                </div>
              </div>
            </div>
          )}
          <p className="mt-2 text-sm text-gray-500">Tipos de archivos aceptados: CSV, XLSX o XLS. Tamaño máximo: 10MB</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded relative flex items-center space-x-2">
              <RiErrorWarningFill className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-600">{error}</span>
              <button onClick={() => setError(null)} className="absolute top-1 right-1 p-1">
                <RiCloseLine className="h-5 w-5 text-red-500" />
              </button>
            </div>
          )}
          {file && (
            <div className="relative mt-8 p-4 bg-gray-50 rounded">
              <div className="absolute right-1 top-1">
                <button onClick={() => setFile(null)} className="p-2 text-gray-500 hover:text-gray-700">
                  <RiCloseLine className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <span className="h-10 w-10 flex items-center justify-center bg-white border rounded">
                  <RiFileExcelLine className="h-5 w-5 text-green-500" />
                </span>
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-3">
                <ProgressBar value={progress} className="[&>*]:h-1.5" />
                <span className="text-xs text-gray-500">{progress.toFixed(0)}%</span>
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={handleCancel} className="px-4 py-2 border rounded text-sm text-gray-700 hover:bg-gray-100">Cancelar</button>
            <Button type="button" variant="primary" onClick={handleUpload} disabled={!file || isLoading}>
              {isLoading ? 'Cargando...' : 'Subir'}
            </Button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
};

export default BulkUploadModal;
