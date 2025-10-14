// src/components/fileUpload/ConversionProgressModal.jsx
import React from 'react';
import { Dialog, DialogPanel, ProgressBar, Divider } from '@tremor/react';
import { RiCloseLine } from '@remixicon/react';

const ConversionProgressModal = ({ isOpen, progress, onClose, downloadUrl, onDownload }) => (
  <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden bg-gray-900 bg-opacity-75">
    <DialogPanel className="w-full max-w-lg p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-gray-800">Progreso de Conversión</h4>
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-gray-500"
          onClick={onClose}
          aria-label="Close"
        >
          <RiCloseLine className="h-6 w-6" aria-hidden={true} />
        </button>
      </div>
      <Divider />
      <div className="mt-4">
        <p className="text-sm text-gray-600">Convirtiendo archivos...</p>
        <ProgressBar value={progress} className="mt-2 h-2 rounded bg-green-200" />
      </div>
      {progress === 100 && (
        <div className="mt-6 flex justify-center">
          <a
            href={downloadUrl}
            download
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={onDownload}
          >
            Descargar
          </a>
        </div>
      )}
    </DialogPanel>
  </Dialog>
);

export default ConversionProgressModal;
