'use client';
import React, { useState, useEffect } from 'react';
import { RiUpload2Line, RiDeleteBin5Line } from '@remixicon/react';
import Dropzone from './Dropzone';
import UploadProgress from './UploadProgress';
import CompletedUploads from './CompletedUploads';
import AlertDialog from './AlertDialog';
import ConversionProgressModal from './ConversionProgressModal';

const FileUpload = ({ acceptedFileTypes, uploadEndpoint, fileLimit, filePrefix }) => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [convertProgress, setConvertProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: '', duplicatedFiles: [] });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    files.forEach((file) => {
      if (!uploadProgress[file.id]) {
        simulateUpload(file);
      }
    });
  }, [files]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    validateAndSetFiles(newFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files);
    validateAndSetFiles(newFiles);
    setDragging(false);
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDragEnter = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragging(false); };

  const validateAndSetFiles = (newFiles) => {
    const duplicateFiles = [];
    const validFiles = newFiles.filter((file) => {
      const isDuplicate = files.some((existingFile) => existingFile.file.name === file.name);
      if (isDuplicate) {
        duplicateFiles.push(file.name);
        return false;
      }
      return acceptedFileTypes.some(type => file.name.toLowerCase().endsWith(type));
    });

    if (duplicateFiles.length > 0) {
      setAlert({
        isOpen: true,
        title: 'Archivos Duplicados',
        message: `Los siguientes archivos ya fueron añadidos:`,
        type: 'warning',
        duplicatedFiles: duplicateFiles
      });
    }

    const invalidFiles = newFiles.filter((file) => !acceptedFileTypes.some(type => file.name.toLowerCase().endsWith(type)) && !duplicateFiles.includes(file.name));
    if (invalidFiles.length > 0) {
      setAlert({
        isOpen: true,
        title: 'Tipo de Archivo Inválido',
        message: `Solo se permiten archivos ${acceptedFileTypes.join(', ')}. Los siguientes archivos no fueron añadidos:`,
        type: 'error',
        duplicatedFiles: invalidFiles.map(file => file.name)
      });
    }

    const fileObjs = validFiles.map((file) => ({
      file,
      id: `${Date.now()}-${file.name}`,
      progress: 0,
    }));

    setFiles((prevFiles) => [...prevFiles, ...fileObjs]);
  };

  const simulateUpload = (file) => {
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = { ...prev, [file.id]: (prev[file.id] || 0) + 10 };
        if (newProgress[file.id] >= 100) {
          clearInterval(interval);
        }
        return newProgress;
      });
    }, 500);
  };

  const handleRemoveFile = (id) => setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
  const handleRemoveAll = () => setFiles([]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file.file);
    });

    try {
      setLoading(true);
      setUploadProgress({});
      setConvertProgress(0);
      setIsModalOpen(true);

      const response = await fetch(uploadEndpoint, { method: "POST", body: formData });

      if (response.ok) {
        const totalParts = 20; // número de pasos en la barra de progreso de conversión
        for (let i = 1; i <= totalParts; i++) {
          setConvertProgress((i / totalParts) * 100);
          await new Promise((r) => setTimeout(r, 200)); // simula la espera de la conversión
        }

        const blob = await response.blob();
        const fechaActual = new Date().toISOString().slice(0, 10);
        const nombreArchivo = `${filePrefix}-${fechaActual}.xlsx`;
        setFileName(nombreArchivo);

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        handleRemoveAll();
      } else {
        setAlert({
          isOpen: true,
          title: 'Error',
          message: 'Error al cargar y transformar los archivos',
          type: 'error'
        });
      }
    } catch (error) {
      setAlert({
        isOpen: true,
        title: 'Error',
        message: 'Error al cargar y transformar los archivos',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setConvertProgress(0);
    setFileName(''); // Asegurarse de resetear el nombre del archivo
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="sm:mx-auto sm:max-w-lg w-full flex flex-col">
        <h3 className="text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong text-center">
          Subida de Archivos
        </h3>
        <Dropzone
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onFileChange={handleFileChange}
          dragging={dragging}
          acceptedFileTypes={acceptedFileTypes}
          fileLimit={fileLimit}
        />
        {files.length > 0 && (
          <div className="flex-1 overflow-y-auto mt-4">
            <UploadProgress files={files} progress={uploadProgress} handleRemoveFile={handleRemoveFile} />
            <CompletedUploads files={files} progress={uploadProgress} handleRemoveFile={handleRemoveFile} />
            <div className="flex justify-center items-center mt-4 space-x-2">
              <button
                type="button"
                className="whitespace-nowrap rounded-tremor-small px-4 py-2 bg-red-500 text-tremor-brand-inverted shadow-tremor-input hover:bg-red-600 dark:bg-red-500 dark:shadow-dark-tremor-input dark:hover:bg-red-600"
                onClick={handleRemoveAll}
              >
                <RiDeleteBin5Line className="h-5 w-5 inline-block mr-2" aria-hidden={true} />
                Eliminar todos
              </button>
              <button
                type="button"
                className="whitespace-nowrap rounded-tremor-small px-4 py-2 bg-green-500 text-tremor-brand-inverted shadow-tremor-input hover:bg-green-600 dark:bg-green-500 dark:shadow-dark-tremor-input dark:hover:bg-green-600 ml-2"
                onClick={handleSubmit}
                disabled={files.length === 0 || loading}
              >
                <RiUpload2Line className="h-5 w-5 inline-block mr-2" aria-hidden={true} />
                Subir archivos
              </button>
            </div>
          </div>
        )}
        <AlertDialog alert={alert} setAlert={setAlert} />
        <ConversionProgressModal
          isOpen={isModalOpen}
          progress={convertProgress}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
};

export default FileUpload;
