// src/components/forms/CargaMasivaForm.jsx
import React, { useState } from 'react';
import { RiFileExcelLine, RiUpload2Line, RiCloseLine } from '@remixicon/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import apiService from '@/app/api/apiService';
import useActionFeedback from '@/hooks/useActionFeedback'; // 1. Importar el hook

const CargaMasivaForm = ({ endpoint, method = 'POST', refreshData, onClose, gestionId }) => {
  const { runWithFeedback } = useActionFeedback(); // 2. Instanciar el hook
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');

  const formik = useFormik({
    initialValues: {
      file: null,
    },
    validationSchema: Yup.object({
      file: Yup.mixed()
        .required('Debe seleccionar un archivo.')
        .test('fileType', 'Tipos de archivo aceptados: XLSX, XLS, CSV', (value) => {
          return value && ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'].includes(value.type);
        }),
    }),
    // 3. Refactorizar la función onSubmit
    onSubmit: async (values, { setSubmitting }) => {
      const formData = new FormData();
      formData.append('file', values.file);

      if (gestionId) {
        formData.append('gestionLicenciaId', gestionId);
      }

      await runWithFeedback({
        action: () => apiService.request({
          method: method,
          url: endpoint,
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
        loadingMessage: "Cargando y procesando archivo...",
        successMessage: "¡Archivo cargado exitosamente!",
        errorMessage: "Error al cargar el archivo."
      });

      if (refreshData) refreshData();
      if (onClose) onClose();
      setSubmitting(false); // Informar a Formik que el envío ha terminado
    },
  });

  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      formik.setFieldValue('file', file);
      setFileName(file.name);
      setFileSize((file.size / 1024 / 1024).toFixed(2) + ' MB');
    }
  };

  const handleRemoveFile = () => {
    formik.setFieldValue('file', null);
    setFileName('');
    setFileSize('');
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      {/* File Drop Zone (sin cambios) */}
      {!formik.values.file && (
        <div className="mt-4 flex justify-center space-x-4 rounded-tremor-default border border-dashed border-gray-300 px-6 py-10">
          <div className="text-center">
            <RiUpload2Line className="mx-auto h-8 w-8 text-tremor-content-subtle" />
            <div className="mt-4 flex text-tremor-default leading-6 text-tremor-content">
              <label htmlFor="file-upload" className="relative cursor-pointer rounded-tremor-small font-medium text-tremor-brand hover:underline">
                <span>Elegir archivo</span>
                <input id="file-upload" name="file" type="file" className="sr-only" onChange={handleFileChange} disabled={formik.isSubmitting}/>
              </label>
              <p className="pl-1">o arrástralo aquí</p>
            </div>
            {formik.touched.file && formik.errors.file && <p className="mt-2 text-sm text-red-500">{formik.errors.file}</p>}
          </div>
        </div>
      )}
      
      {/* File Preview (sin cambios) */}
      {formik.values.file && (
        <div className="relative mt-4 rounded-tremor-default bg-tremor-background-muted p-4">
          <div className="absolute right-1 top-1">
            <button type="button" onClick={handleRemoveFile} className="rounded-tremor-small p-2 text-tremor-content-subtle hover:text-tremor-content">
              <RiCloseLine className="size-5 shrink-0" />
            </button>
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tremor-small bg-tremor-background shadow-tremor-input ring-1 ring-inset ring-tremor-ring">
              <RiFileExcelLine className="size-5 text-tremor-content-emphasis" />
            </span>
            <div className="w-full">
              <p className="text-tremor-label font-medium text-tremor-content-strong">{fileName}</p>
              <p className="mt-0.5 flex justify-between text-tremor-label text-tremor-content">{fileSize}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex items-center justify-end space-x-3">
        <button type="button" onClick={onClose} className="whitespace-nowrap rounded-tremor-small border border-tremor-border px-4 py-2 text-tremor-default font-medium text-tremor-content shadow-tremor-input">
          Cancelar
        </button>
        {/* 4. Usamos formik.isSubmitting para deshabilitar el botón */}
        <button type="submit" disabled={formik.isSubmitting || !formik.values.file} className="whitespace-nowrap rounded-tremor-small bg-tremor-brand px-4 py-2 text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis disabled:opacity-50">
          {formik.isSubmitting ? 'Cargando...' : 'Subir Archivo'}
        </button>
      </div>
    </form>
  );
};

export default CargaMasivaForm;