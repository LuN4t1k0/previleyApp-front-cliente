import React from 'react';
import { Dialog, DialogPanel, Button } from '@tremor/react';

const TestModal = ({ onClose }) => {
  return (
    <Dialog open={true} onClose={onClose} className="z-50">
      <DialogPanel className="max-w-md w-full p-6 bg-white rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold">Modal de Prueba</h3>
        <p className="mt-4">Esta es una modal de prueba para verificar la apertura.</p>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Cerrar
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default TestModal;
