
// import React, { useState } from "react";
// import { Button, Textarea } from "@tremor/react";
// import { useModal } from "@/context/ModalContext";
// import apiService from "@/app/api/apiService";
// import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";

// const RevertPrefacturaContent = ({ initialData, fetchData }) => {
//   const { closeModal } = useModal();
//   const [motivoReversion, setMotivoReversion] = useState("");

//   const handleSubmit = async () => {
//     if (!motivoReversion.trim()) {
//       showErrorAlert("Debes ingresar un motivo de reversión.");
//       return;
//     }

//     try {
//       await apiService.patch(`/prefacturas/revertir/${initialData.id}`, {
//         motivoReversion,
//       });

//       showSuccessAlert("Prefactura revertida correctamente.");
//       fetchData(); // Refrescar la lista
//       closeModal();
//     } catch (error) {
//       showErrorAlert("Error al revertir la prefactura.");
//       console.error("Error:", error);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-semibold text-gray-800 mb-4">Revertir Prefactura</h2>
//       <p className="text-gray-600 mb-3">Indica el motivo de la reversión:</p>

//       <Textarea
//         value={motivoReversion}
//         onChange={(e) => setMotivoReversion(e.target.value)}
//         placeholder="Escribe el motivo de reversión..."
//         rows={4}
//         className="w-full"
//       />

//       <div className="mt-4 flex justify-end space-x-4">
//         <Button variant="secondary" onClick={closeModal}>
//           Cancelar
//         </Button>
//         <Button color="red" onClick={handleSubmit} disabled={!motivoReversion.trim()}>
//           Confirmar Reversión
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default RevertPrefacturaContent;


// NUEVO:
"use client";

import React, { useState } from "react";
import { Button, Textarea } from "@tremor/react";
import { useModal } from "@/context/ModalContext";
import apiService from "@/app/api/apiService";
import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";

const RevertPrefacturaContent = ({ initialData, fetchData }) => {
  const { closeModal } = useModal();
  const [motivoReversion, setMotivoReversion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!motivoReversion.trim()) {
      showErrorAlert("Debes ingresar un motivo de reversión.");
      return;
    }

    setLoading(true);
    try {
      await apiService.patch(`/prefacturas/revertir/${initialData.id}`, {
        motivoReversion,
      });

      showSuccessAlert("Prefactura revertida correctamente.");
      fetchData();
      closeModal();
    } catch (error) {
      showErrorAlert("Error al revertir la prefactura.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* <h2 className="text-lg font-bold text-gray-800">Revertir Prefactura</h2> */}

      <div>
        <p className="text-xs font-medium text-gray-700 mb-1">Motivo de Reversión</p>
        <Textarea
          value={motivoReversion}
          onChange={(e) => setMotivoReversion(e.target.value)}
          placeholder="Escribe el motivo de reversión..."
          rows={4}
          className="w-full"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={closeModal}>
          Cancelar
        </Button>
        <Button
          color="red"
          onClick={handleSubmit}
          disabled={!motivoReversion.trim() || loading}
        >
          {loading ? "Revirtiendo..." : "Confirmar Reversión"}
        </Button>
      </div>
    </div>
  );
};

export default RevertPrefacturaContent;
