// "use client";

// import { useState } from "react";
// import { TextInput, Button } from "@tremor/react";
// import { Input } from "@/components/ui/input/Input";
// import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";


// const EditarDocumentoEmpresaModal = ({ initialData, onClose, handleSubmit, fetchData }) => {
//   const [tipo, setTipo] = useState(initialData?.tipo || "");
//   const [fechaVencimiento, setFechaVencimiento] = useState(
//     initialData?.fecha_vencimiento?.slice(0, 10) || "" // formato YYYY-MM-DD
//   );
//   const [archivo, setArchivo] = useState(null);
//   const [archivoNombre, setArchivoNombre] = useState("");

//   const handleArchivoChange = (e) => {
//     const file = e.target.files[0];
//     setArchivo(file);
//     setArchivoNombre(file?.name || "");
//   };

//   const handleGuardar = async () => {
//     if (!tipo || !fechaVencimiento) {
//       showErrorAlert("Debe completar todos los campos obligatorios.");
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append("tipo", tipo);
//       formData.append("fechaVencimiento", fechaVencimiento);
//       if (archivo) {
//         formData.append("documento", archivo);
//       }

//       await handleSubmit(formData, { id: initialData.id });

//       showSuccessAlert("Documento actualizado correctamente.");
//       fetchData();
//       onClose();
//     } catch (error) {
//       showErrorAlert("Error al actualizar documento", error.message);
//     }
//   };

//   if (!initialData) {
//     return <div className="p-4 text-center text-gray-500">Cargando datos para editar...</div>;
//   }

//   return (
//     <div className="p-4">
//       <h2 className="text-lg font-semibold text-gray-800 mb-4">Editar Documento</h2>

//       {/* Tipo de documento */}
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700">Tipo</label>
//         <TextInput
//           placeholder="Ej: CONTRATO, PODER, etc."
//           value={tipo}
//           onChange={(e) => setTipo(e.target.value)}
//         />
//       </div>

//       {/* Fecha de vencimiento */}
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento</label>
//         <TextInput
//           type="date"
//           value={fechaVencimiento}
//           onChange={(e) => setFechaVencimiento(e.target.value)}
//         />
//       </div>

//       {/* Reemplazar archivo */}
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700">
//           Nuevo archivo (opcional)
//         </label>
//         <Input type="file" accept=".pdf,.jpg,.png" onChange={handleArchivoChange} />
//         {archivoNombre && <p className="text-sm text-gray-600 mt-1">{archivoNombre}</p>}
//       </div>

//       {/* Botones */}
//       <div className="flex justify-end space-x-2 mt-6">
//         <Button variant="secondary" onClick={onClose}>Cancelar</Button>
//         <Button color="blue" onClick={handleGuardar}>Guardar</Button>
//       </div>
//     </div>
//   );
// };

// export default EditarDocumentoEmpresaModal;


"use client";

import { useEffect, useState } from "react";
import { Button } from "@tremor/react";
import { Input } from "@/components/ui/input/Input";
import { Select, SelectItem } from "@tremor/react";
import apiService from "@/app/api/apiService";
import Swal from "sweetalert2";
import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";

const EditarDocumentoEmpresaModal = ({ initialData, onClose, handleSubmit, fetchData }) => {
  const [tipo, setTipo] = useState(initialData?.tipo || "");
  const [archivo, setArchivo] = useState(null);
  const [archivoNombre, setArchivoNombre] = useState("");
  const [tiposDocumento, setTiposDocumento] = useState([]);

  useEffect(() => {
    cargarTiposDocumento();
  }, []);

  const cargarTiposDocumento = async () => {
    try {
      const response = await apiService.get("/enum/tipo-documento");
      const tiposArray = Object.entries(response.data).map(([key, value]) => ({
        value,
        label: value,
      }));
      setTiposDocumento(tiposArray);
    } catch (error) {
      showErrorAlert("Error al obtener tipos de documento", error.message);
    }
  };

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    setArchivo(file);
    setArchivoNombre(file?.name || "");
  };

  const handleGuardar = async () => {
    if (!tipo) {
      showErrorAlert("Debe seleccionar el tipo de documento.");
      return;
    }

    // Confirmar si hay archivo nuevo
    if (archivo) {
      const confirm = await Swal.fire({
        title: "¿Reemplazar documento?",
        text: "El documento actual será reemplazado por uno nuevo.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, reemplazar",
      });

      if (!confirm.isConfirmed) return;
    }

    try {
      const formData = new FormData();
      formData.append("tipo", tipo);
      if (archivo) {
        formData.append("file", archivo);
      }

      await handleSubmit(formData, { id: initialData.id });

      showSuccessAlert("Documento actualizado correctamente.");
      fetchData();
      onClose();
    } catch (error) {
      showErrorAlert("Error al actualizar documento", error.message);
    }
  };

  if (!initialData) {
    return <div className="p-4 text-center text-gray-500">Cargando datos para editar...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Editar Documento</h2>

      {/* Tipo de documento */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Tipo</label>
        <Select value={tipo} onValueChange={setTipo}>
          {tiposDocumento.map((td) => (
            <SelectItem key={td.value} value={td.value}>
              {td.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Fecha de vencimiento (solo lectura) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento</label>
        <p className="text-gray-800">{initialData?.fecha_vencimiento?.slice(0, 10) || "No disponible"}</p>
      </div>

      {/* Ver documento actual */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Documento actual</label>
        <a
          href={initialData?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline text-sm"
        >
          Ver documento actual
        </a>
      </div>

      {/* Reemplazar archivo */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Nuevo archivo (opcional)
        </label>
        <Input type="file" accept=".pdf,.jpg,.png" onChange={handleArchivoChange} />
        {archivoNombre && <p className="text-sm text-gray-600 mt-1">📎 {archivoNombre}</p>}
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button color="blue" onClick={handleGuardar}>
          Guardar
        </Button>
      </div>
    </div>
  );
};

export default EditarDocumentoEmpresaModal;
