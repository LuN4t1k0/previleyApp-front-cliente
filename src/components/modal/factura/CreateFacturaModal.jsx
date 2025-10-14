// import React, { useState } from "react";
// import { Button } from "@tremor/react";

// import apiService from "@/app/api/apiService";
// import { Input } from "@/components/ui/input/Input";

// const CreateFacturaModal = ({ initialData, onClose, fetchData }) => {
//   const [numeroFactura, setNumeroFactura] = useState("");
//   const [fechaEmision, setFechaEmision] = useState("");
//   const [pdfFile, setPdfFile] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleFileChange = (e) => {
//     setPdfFile(e.target.files[0]);
//   };

//   const handleCreateFactura = async () => {
//     if (!numeroFactura.trim() || !fechaEmision.trim() || !pdfFile) {
//       alert("Todos los campos son obligatorios.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("prefacturaId", initialData.id); // ID de la prefactura
//     formData.append("numeroFactura", numeroFactura);
//     formData.append("fechaEmision", fechaEmision);
//     formData.append("pdf", pdfFile);

//     setLoading(true);
//     try {
//       await apiService.post("/facturas/", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       await fetchData();
//       onClose();
//     } catch (error) {
//       console.error("❌ Error al crear la factura:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4">
//       {/* <h2 className="text-xl font-semibold text-gray-800 mb-4">Crear Factura</h2> */}

//       <div className="mb-4">
//         <label>Número de Factura</label>
//         <Input
//           value={numeroFactura}
//           onChange={(e) => setNumeroFactura(e.target.value)}
//           placeholder="Ej: 500"
//         />
//       </div>

//       <div className="mb-4">
//         <label>Fecha de Emisión</label>
//         <Input
//           type="date"
//           value={fechaEmision}
//           onChange={(e) => setFechaEmision(e.target.value)}
//         />
//       </div>

//       <div className="mb-4">
//         <label>Adjuntar PDF</label>
//         <Input type="file" accept="application/pdf" onChange={handleFileChange} />
//       </div>

//       <div className="mt-4 flex justify-end space-x-4">
//         <Button variant="secondary" onClick={onClose}>Cancelar</Button>
//         <Button color="blue" onClick={handleCreateFactura} disabled={loading}>
//           {loading ? "Creando..." : "Crear Factura"}
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default CreateFacturaModal;

// NUEVO:
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@tremor/react";
import apiService from "@/app/api/apiService";
import { Input } from "@/components/ui/input/Input";
import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";

const CreateFacturaModal = ({ initialData, onClose, fetchData }) => {
  const [numeroFactura, setNumeroFactura] = useState("");
  const [fechaEmision, setFechaEmision] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Asignar fecha actual al cargar
  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0];
    setFechaEmision(hoy);
  }, []);

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleCreateFactura = async () => {
    if (!numeroFactura.trim() || !fechaEmision.trim() || !pdfFile) {
      showErrorAlert("Todos los campos son obligatorios.");
      return;
    }

    if (!/^\d+$/.test(numeroFactura)) {
      showErrorAlert("El número de factura debe ser un valor numérico.");
      return;
    }

    const formData = new FormData();
    formData.append("prefacturaId", initialData.id);
    formData.append("numeroFactura", numeroFactura);
    formData.append("fechaEmision", fechaEmision);
    formData.append("pdf", pdfFile);

    setLoading(true);
    try {
      await apiService.post("/facturas/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showSuccessAlert("Factura creada correctamente.");
      await fetchData();
      onClose();
    } catch (error) {
      showErrorAlert("Error al crear la factura", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Número de Factura */}
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">
          Número de Factura
        </label>
        <Input
          value={numeroFactura}
          onChange={(e) => setNumeroFactura(e.target.value)}
          placeholder="Ej: 500"
          type="text"
          inputMode="numeric"
        />
      </div>

      {/* Fecha de Emisión */}
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">
          Fecha de Emisión
        </label>
        <Input
          type="date"
          value={fechaEmision}
          onChange={(e) => setFechaEmision(e.target.value)}
        />
      </div>

      {/* PDF */}
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">
          Adjuntar PDF
        </label>
        <Input type="file" accept="application/pdf" onChange={handleFileChange} />
        {pdfFile && (
          <p className="text-sm text-gray-600 mt-1">{pdfFile.name}</p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button color="blue" onClick={handleCreateFactura} disabled={loading}>
          {loading ? "Creando..." : "Agregar Factura"}
        </Button>
      </div>
    </div>
  );
};

export default CreateFacturaModal;
