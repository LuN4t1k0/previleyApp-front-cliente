// "use client";

// import { Card, Table, TableRow, TableCell, Button } from "@tremor/react";
// import { useState } from "react";
// import useProductions from "@/hooks/useProductions";

// import ProductionModal from "@/components/modal/ProductionModal";
// import CustomBadge from "@/components/badge/Badge";

// const WorkerDashboard = () => {
//   const { productions, loading, error } = useProductions();
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   if (loading) return <p>Cargando producciones...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <div>
//       <h1 className="text-2xl font-bold">Dashboard - Trabajador</h1>

//       <Button onClick={() => setIsModalOpen(true)}>Nueva Producción</Button>
//       <ProductionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

//       <Card>
//         <Table>
//           <thead>
//             <tr>
//               <th>Empresa</th>
//               <th>Servicio</th>
//               <th>Estado</th>
//               <th>Monto</th>
//               <th>Fecha</th>
//               <th>Acciones</th>
//             </tr>
//           </thead>

//           <tbody>
//             {productions.map((prod) => (
//               <TableRow key={prod.id}>
//               <TableCell>{prod.empresaRut}</TableCell>
//               <TableCell>{prod.servicioId}</TableCell>
//               <TableCell>
//                 <CustomBadge status={prod.estado} />
//               </TableCell>
//               <TableCell>${prod.montoRegularizado}</TableCell>
//               <TableCell>{prod.fechaProduccion}</TableCell>
//               <TableCell>
//                 <button
//                   className="px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
//                   onClick={() => console.log("Editar", prod.id)}
//                 >
//                   Editar
//                 </button>
//                 <button
//                   className="px-2 py-1 ml-2 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
//                   onClick={() => console.log("Eliminar", prod.id)}
//                 >
//                   Eliminar
//                 </button>
//               </TableCell>
//             </TableRow>
//             ))}
//           </tbody>
//         </Table>
//       </Card>
//     </div>
//   );
// };

// export default WorkerDashboard;

import React from 'react'

const WorkerDashboard = () => {
  return (
    <div>WorkerDashboard</div>
  )
}

export default WorkerDashboard