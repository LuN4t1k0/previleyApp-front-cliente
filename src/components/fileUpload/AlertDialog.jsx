import React from 'react';
import { RiErrorWarningLine } from '@remixicon/react';

const AlertDialog = ({ alert, setAlert }) => {
  if (!alert.isOpen) return null;

  const handleClose = () => {
    setAlert({ ...alert, isOpen: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden bg-gray-900 bg-opacity-75">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg"> {/* Cambiado de max-w-md a max-w-lg */}
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-semibold text-gray-800">{alert.title}</h4>
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-500"
            onClick={handleClose}
            aria-label="Close"
          >
            <RiErrorWarningLine className="h-6 w-6" aria-hidden={true} />
          </button>
        </div>
        <div className="mt-4">
          {alert.type === 'warning' && (
            <div className="flex items-center mb-4">
              <RiErrorWarningLine className="text-yellow-500 h-6 w-6 mr-2" />
              <span className="text-yellow-500 font-medium">Advertencia</span>
            </div>
          )}
          {alert.type === 'error' && (
            <div className="flex items-center mb-4">
              <RiErrorWarningLine className="text-red-500 h-6 w-6 mr-2" />
              <span className="text-red-500 font-medium">Error</span>
            </div>
          )}
          <p>{alert.message}</p>
          {alert.duplicatedFiles && alert.duplicatedFiles.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-gray-600">
              {alert.duplicatedFiles.map((file, index) => (
                <li key={index}>{file}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-6 text-right">
          <button
            type="button"
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            onClick={handleClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
