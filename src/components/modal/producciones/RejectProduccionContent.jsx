// import React, { useState } from "react";
// import { Button, Textarea } from "@tremor/react";
// import apiService from "@/app/api/apiService";

// const RejectProduccionContent = ({ initialData, onClose, fetchData }) => {
//   const [motivo, setMotivo] = useState("");

//   const handleReject = async () => {
//     if (!motivo.trim()) return;

//     try {
//       await apiService.post(`/produccion/${initialData.id}/reject`, { motivo });
//       await fetchData();
//       onClose();
//     } catch (error) {
//       console.error("Error al rechazar producción:", error);
//     }
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-semibold text-gray-800 mb-4">Motivo de Rechazo</h2>
//       <Textarea
//         value={motivo}
//         onChange={(e) => setMotivo(e.target.value)}
//         placeholder="Escribe el motivo de rechazo..."
//         rows={4}
//         className="w-full"
//       />
//       <div className="mt-4 flex justify-end space-x-4">
//         <Button variant="secondary" onClick={onClose}>Cancelar</Button>
//         <Button color="red" onClick={handleReject} disabled={!motivo.trim()}>
//           Confirmar Rechazo
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default RejectProduccionContent;


// TRABAJANDO:
// import React, { useState } from "react";
// import { Button, Textarea } from "@tremor/react";
// import apiService from "@/app/api/apiService";
// import useActionFeedback from "@/hooks/useActionFeedback"; // 👈 usa el hook

// const RejectProduccionContent = ({ initialData, onClose, fetchData }) => {
//   const [motivo, setMotivo] = useState("");
//   const { runWithFeedback } = useActionFeedback(); // 👈 usa el hook

//   const handleReject = async () => {
//     if (!motivo.trim()) return;

//     try {
//       await runWithFeedback({
//         action: () =>
//           apiService.post(`/produccion/${initialData.id}/reject`, {
//             motivo,
//           }),
//         loadingMessage: "Rechazando producción...",
//         errorMessage: "Error al rechazar la producción",
//       });

//       await fetchData();
//       onClose();
//     } catch (error) {
//       // El error ya fue mostrado por el hook
//     }
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-semibold text-gray-800 mb-4">Motivo de Rechazo</h2>
//       <Textarea
//         value={motivo}
//         onChange={(e) => setMotivo(e.target.value)}
//         placeholder="Escribe el motivo de rechazo..."
//         rows={4}
//         className="w-full"
//       />
//       <div className="mt-4 flex justify-end space-x-4">
//         <Button variant="secondary" onClick={onClose}>Cancelar</Button>
//         <Button color="red" onClick={handleReject} disabled={!motivo.trim()}>
//           Confirmar Rechazo
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default RejectProduccionContent;

// NUEVO:
import React, { useState } from "react";
import { Button, Textarea } from "@tremor/react";
import apiService from "@/app/api/apiService";
import useActionFeedback from "@/hooks/useActionFeedback";

const RejectProduccionContent = ({ initialData, onClose, fetchData }) => {
  const [motivo, setMotivo] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 👈 loading local
  const { runWithFeedback } = useActionFeedback();

  const handleReject = async () => {
    if (!motivo.trim()) return;

    setIsLoading(true);
    try {
      await runWithFeedback({
        action: () =>
          apiService.post(`/produccion/${initialData.id}/reject`, {
            motivo,
          }),
        loadingMessage: "Rechazando producción...",
        errorMessage: "Error al rechazar la producción",
      });

      onClose();
      await fetchData();
    } catch (error) {
      // Ya se muestra el toast de error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Motivo de Rechazo</h2>
      <Textarea
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder="Escribe el motivo de rechazo..."
        rows={4}
        className="w-full"
        disabled={isLoading}
      />
      <div className="mt-4 flex justify-end space-x-4">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          color="red"
          onClick={handleReject}
          disabled={!motivo.trim() || isLoading}
        >
          {isLoading ? "Rechazando..." : "Confirmar Rechazo"}
        </Button>
      </div>
    </div>
  );
};

export default RejectProduccionContent;

