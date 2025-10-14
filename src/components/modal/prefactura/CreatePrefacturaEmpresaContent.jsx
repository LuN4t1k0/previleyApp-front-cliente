// import React, { useState, useEffect } from "react";
// import { Button, Select, SelectItem} from "@tremor/react";
// import { Input } from "@/components/ui/input/Input";
// import apiService from "@/app/api/apiService";
// import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";

// const CreatePrefacturaEmpresaContent = ({ onClose, fetchData }) => {
//   const [empresaRut, setEmpresaRut] = useState("");
//   const [fechaDesde, setFechaDesde] = useState("");
//   const [fechaHasta, setFechaHasta] = useState("");
//   const [empresaOptions, setEmpresaOptions] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const fetchEmpresas = async () => {
//       try {
//         const response = await apiService.get("/empresas", { params: { limit: 1000 } });
//         setEmpresaOptions(response.data.data.map((e) => ({
//           value: e.empresaRut, label: e.nombre
//         })));
//       } catch (error) {
//         showErrorAlert("Error al obtener empresas", error.message);
//       }
//     };
//     fetchEmpresas();
//   }, []);

//   const handleSubmit = async () => {
//     if (!empresaRut || !fechaDesde || !fechaHasta) {
//       showErrorAlert("Todos los campos son obligatorios.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await apiService.post("/prefacturas/empresa", { empresaRut, fechaDesde, fechaHasta });
//       showSuccessAlert("Prefactura creada con éxito.");
//       fetchData();
//       onClose();
//     } catch (error) {
//       showErrorAlert("Error al crear prefactura", error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-lg font-semibold text-gray-800">Crear Prefactura para una Empresa</h2>
      
//       <div>
//         <label className="block text-sm font-medium">Empresa</label>
//         <Select value={empresaRut} onValueChange={setEmpresaRut}>
//           <SelectItem value="">Seleccione una empresa</SelectItem>
//           {empresaOptions.map((option) => (
//             <SelectItem key={option.value} value={option.value}>
//               {option.label}
//             </SelectItem>
//           ))}
//         </Select>
//       </div>

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
//           {isLoading ? "Creando..." : "Crear Prefactura"}
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default CreatePrefacturaEmpresaContent;



// NUEVO:
"use client";

import React, { useState, useEffect } from "react";
import { Button, Select, SelectItem } from "@tremor/react";
import { Input } from "@/components/ui/input/Input";
import apiService from "@/app/api/apiService";
import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";

const CreatePrefacturaEmpresaContent = ({ onClose, fetchData }) => {
  const [empresaRut, setEmpresaRut] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [empresaOptions, setEmpresaOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const response = await apiService.get("/empresas", { params: { limit: 1000 } });
        setEmpresaOptions(
          response.data.data.map((e) => ({
            value: e.empresaRut,
            label: e.nombre,
          }))
        );
      } catch (error) {
        showErrorAlert("Error al obtener empresas", error.message);
      }
    };
    fetchEmpresas();
  }, []);

  const handleSubmit = async () => {
    if (!empresaRut || !fechaDesde || !fechaHasta) {
      showErrorAlert("Todos los campos son obligatorios.");
      return;
    }

    setIsLoading(true);
    try {
      await apiService.post("/prefacturas/empresa", {
        empresaRut,
        fechaDesde,
        fechaHasta,
      });
      showSuccessAlert("Prefactura creada con éxito.");
      fetchData();
      onClose();
    } catch (error) {
      showErrorAlert("Error al crear prefactura", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* <h2 className="text-lg font-semibold text-gray-800">
        Crear Prefactura para una Empresa
      </h2> */}

      <div>
        <p className="text-xs font-medium text-gray-700 mb-1">Empresa</p>
        <Select value={empresaRut} onValueChange={setEmpresaRut}>
          <SelectItem value="">Seleccione una empresa</SelectItem>
          {empresaOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>

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
          {isLoading ? "Creando..." : "Crear Prefactura"}
        </Button>
      </div>
    </div>
  );
};

export default CreatePrefacturaEmpresaContent;
