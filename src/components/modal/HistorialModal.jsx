// src/components/modal/HistorialModal.jsx
'use client'; // Agregar esta línea

import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import html2pdf from 'html2pdf.js';

const HistorialModal = ({ isOpen, setIsOpen }) => {
  const [rut, setRut] = useState('');
  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(false);

  // Función para manejar el cambio del input RUT
  const handleRutChange = (e) => setRut(e.target.value);

  // Función para obtener los datos del historial del trabajador
  const fetchHistorial = async () => {
    if (!rut) return;

    try {
      setLoading(true);
      // Aquí debes actualizar la URL al endpoint que maneja el historial del trabajador
      const response = await fetch(`/api/licencias-medicas/historial/${rut}`);
      if (response.ok) {
        const data = await response.json();
        setHistorial(data);
      } else {
        throw new Error('Error al obtener el historial');
      }
    } catch (error) {
      console.error('Error al obtener el historial:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para generar el PDF
  const generarPDF = () => {
    const element = document.getElementById('historial-content');
    html2pdf().from(element).save(`resumen_${rut}.pdf`);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={() => setIsOpen(false)}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>

          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                Consultar Historial del Trabajador
              </Dialog.Title>
              <div className="mt-4">
                <input
                  type="text"
                  value={rut}
                  onChange={handleRutChange}
                  placeholder="Ingrese el RUT del trabajador"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  onClick={fetchHistorial}
                  disabled={loading}
                >
                  {loading ? 'Buscando...' : 'Buscar'}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </button>
              </div>

              {historial && (
                <div className="mt-6">
                  <div id="historial-content" className="bg-gray-100 p-4 rounded-md">
                    <h4 className="text-lg font-semibold mb-4">Historial de Licencias</h4>
                    {historial.map((licencia, index) => (
                      <div key={index} className="mb-4 p-2 bg-white rounded-md shadow">
                        <p><strong>Folio:</strong> {licencia.folio}</p>
                        <p><strong>Estado:</strong> {licencia.estadoLicencia}</p>
                        <p><strong>Monto Anticipo:</strong> {licencia.montoAnticipo}</p>
                        <p><strong>Monto Subsidio:</strong> {licencia.montoSubsidio}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={generarPDF}
                    className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Imprimir PDF
                  </button>
                </div>
              )}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default HistorialModal;
