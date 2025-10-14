// import React, { useState } from "react";
// import { Button} from "@tremor/react";
// import { Input } from "@/components/ui/input/Input";
// import apiService from "@/app/api/apiService";
// import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";

// const CreatePrefacturaAllEmpresasContent = ({ onClose, fetchData }) => {
//   const [fechaDesde, setFechaDesde] = useState("");
//   const [fechaHasta, setFechaHasta] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async () => {
//     if (!fechaDesde || !fechaHasta) {
//       showErrorAlert("Las fechas son obligatorias.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await apiService.post("/prefacturas/todas", { fechaDesde, fechaHasta });
//       showSuccessAlert("Prefacturas creadas para todas las empresas.");
//       fetchData();
//       onClose();
//     } catch (error) {
//       showErrorAlert("Error al crear prefacturas", error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-lg font-semibold text-gray-800">Crear Prefacturas para Todas las Empresas</h2>

//       <div>
//         <label className="block text-sm font-medium">Fecha Desde</label>
//         <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
//       </div>

//       <div>
//         <label className="block text-sm font-medium">Fecha Hasta</label>
//         <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
//       </div>

//       <div className="flex justify-end space-x-2">
//         <Button onClick={onClose} variant="secondary">Cancelar</Button>
//         <Button onClick={handleSubmit} color="blue" disabled={isLoading}>
//           {isLoading ? "Creando..." : "Crear Prefacturas"}
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default CreatePrefacturaAllEmpresasContent;


// NUEVO:
"use client";

import React, { useState } from "react";
import { Button } from "@tremor/react";
import { Input } from "@/components/ui/input/Input";
import apiService from "@/app/api/apiService";
import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";

const CreatePrefacturaAllEmpresasContent = ({ onClose, fetchData }) => {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fechaDesde || !fechaHasta) {
      showErrorAlert("Las fechas son obligatorias.");
      return;
    }

    setIsLoading(true);
    try {
      await apiService.post("/prefacturas/todas", { fechaDesde, fechaHasta });
      showSuccessAlert("Prefacturas creadas para todas las empresas.");
      fetchData();
      onClose();
    } catch (error) {
      showErrorAlert("Error al crear prefacturas", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* <h2 className="text-lg font-semibold text-gray-800">
        Crear Prefacturas para Todas las Empresas
      </h2> */}

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-gray-700 mb-1">Fecha Desde</p>
          <Input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
        </div>

        <div>
          <p className="text-xs font-medium text-gray-700 mb-1">Fecha Hasta</p>
          <Input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button onClick={onClose} variant="secondary">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} color="blue" disabled={isLoading}>
          {isLoading ? "Creando..." : "Crear Prefacturas"}
        </Button>
      </div>
    </div>
  );
};

export default CreatePrefacturaAllEmpresasContent;
