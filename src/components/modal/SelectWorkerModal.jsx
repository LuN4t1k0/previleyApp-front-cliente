
// import React, { useState } from 'react';
// import { TextInput, Button } from '@tremor/react';

// const SelectWorkerModal = ({ onClose, onConfirm }) => {
//   const [trabajadorRut, setTrabajadorRut] = useState('');

//   // Formatea el valor del RUT en el input
//   const handleRutChange = (event) => {
//     let value = event.target.value;
    
//     // Elimina caracteres no permitidos y el guion
//     let formattedValue = value.replace(/[^0-9kK]/g, "").replace(/-/g, "");
    
//     // Limita la longitud máxima a 9 caracteres (sin contar el guion)
//     if (formattedValue.length > 9) {
//       formattedValue = formattedValue.substring(0, 9);
//     }

//     // Inserta el guion antes del dígito verificador (último carácter)
//     const formattedRut = `${formattedValue.slice(0, -1)}-${formattedValue.slice(-1)}`;

//     setTrabajadorRut(formattedRut);
//   };

//   // Restringe caracteres permitidos en el evento onKeyDown
//   const handleRutKeyPress = (event) => {
//     const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    
//     if (allowedKeys.includes(event.key)) return;

//     const re = /^[0-9Kk]*$/;
//     if (!re.test(event.key)) {
//       event.preventDefault();
//     }
//   };

//   const handleConfirm = () => {
//     if (!trabajadorRut) {
//       // Mostrar mensaje de error si es necesario
//       return;
//     }
//     onConfirm(trabajadorRut);
//     onClose();
//   };

//   return (
//     <>
      
//       <TextInput
//         placeholder="Ingrese el RUT del trabajador"
//         value={trabajadorRut}
//         onChange={handleRutChange}
//         onKeyDown={handleRutKeyPress}
//       />
//       <div className="mt-4 flex justify-end space-x-2">
//         <Button variant="secondary" onClick={onClose}>
//           Cancelar
//         </Button>
//         <Button onClick={handleConfirm}>Aceptar</Button>
//       </div>
//     </>
//   );
// };

// export default SelectWorkerModal;


// NUEVO:
"use client";

import React, { useState } from "react";
import { TextInput, Button } from "@tremor/react";
import { RiSearchLine } from "@remixicon/react";

const SelectWorkerModal = ({ onClose, onConfirm }) => {
  const [trabajadorRut, setTrabajadorRut] = useState("");
  const [error, setError] = useState(null);

  const formatRut = (value) => {
    const cleaned = value.replace(/[^0-9kK]/g, "").toUpperCase();
    if (cleaned.length < 2) return cleaned;
    return `${cleaned.slice(0, -1)}-${cleaned.slice(-1)}`;
  };

  const handleRutChange = (e) => {
    const formatted = formatRut(e.target.value);
    setTrabajadorRut(formatted);
    setError(null);
  };

  const handleConfirm = () => {
    if (!trabajadorRut || !/^\d{7,8}-[\dkK]$/.test(trabajadorRut)) {
      setError("Por favor ingrese un RUT válido.");
      return;
    }
    onConfirm(trabajadorRut);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleConfirm();
  };

  return (
    <div className="space-y-4">
      <div>
        <TextInput
          icon={RiSearchLine}
          placeholder="Ingrese el RUT del trabajador (ej: 12345678-9)"
          value={trabajadorRut}
          onChange={handleRutChange}
          onKeyDown={handleKeyDown}
          error={!!error}
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm} disabled={!trabajadorRut}>
          Ver Informe
        </Button>
      </div>
    </div>
  );
};

export default SelectWorkerModal;
