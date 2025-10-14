// "use client";

// import { Modal, Button } from "@tremor/react";
// import { useState } from "react";
// import apiService from "@/app/api/apiService";
// import { Input } from "../ui/input/Input";

// const ProductionModal = ({ isOpen, onClose }) => {
//   const [formData, setFormData] = useState({
//     empresaRut: "",
//     servicioId: "",
//     montoRegularizado: "",
//     fechaProduccion: "",
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await apiService.post("/produccion/crear", formData);
//       alert("Producción creada exitosamente");
//       onClose();
//     } catch (error) {
//       console.error("Error al crear la producción:", error);
//       alert("Hubo un error al crear la producción");
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <Modal isOpen={isOpen} onClose={onClose}>
//       <form onSubmit={handleSubmit}>
//         <Input
//           label="Empresa RUT"
//           name="empresaRut"
//           value={formData.empresaRut}
//           onChange={handleChange}
//           required
//         />
//         <Input
//           label="Servicio ID"
//           name="servicioId"
//           value={formData.servicioId}
//           onChange={handleChange}
//           required
//         />
//         <Input
//           label="Monto Regularizado"
//           name="montoRegularizado"
//           value={formData.montoRegularizado}
//           onChange={handleChange}
//           required
//         />
//         <Input
//           label="Fecha de Producción"
//           name="fechaProduccion"
//           type="date"
//           value={formData.fechaProduccion}
//           onChange={handleChange}
//           required
//         />
//         <Button type="submit">Crear Producción</Button>
//       </form>
//     </Modal>
//   );
// };

// export default ProductionModal;

import React from 'react'

const ProductionModal = () => {
  return (
    <div>ProductionModal</div>
  )
}

export default ProductionModal