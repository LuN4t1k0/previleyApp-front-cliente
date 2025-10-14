// // import React, { useState, useEffect } from "react";
// // import {
// //   Select,
// //   SelectItem,
// //   Button,
// //   Table,
// //   TableHead,
// //   TableRow,
// //   TableHeaderCell,
// //   TableBody,
// //   TableCell,
// // } from "@tremor/react";
// // import apiService from "@/app/api/apiService";
// // import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";
// // import { Input } from "@/components/ui/input/Input";
// // import { formatDateChile } from "@/utils/formatDate";

// // const EmpresaDocumentosModal = ({ onClose }) => {
// //   const [empresas, setEmpresas] = useState([]);
// //   const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
// //   const [documentos, setDocumentos] = useState([]);
// //   const [tipoDocumento, setTipoDocumento] = useState("");
// //   const [archivo, setArchivo] = useState(null);
// //   const [archivoNombre, setArchivoNombre] = useState("");
// //   const [isUploading, setIsUploading] = useState(false);
// //   const [tiposDocumento, setTiposDocumento] = useState([]);

// //   useEffect(() => {
// //     cargarEmpresas();
// //     cargarTiposDocumento()
// //   }, []);

// //   const cargarEmpresas = async () => {
// //     try {
// //       const response = await apiService.get("/empresas/");
// //       setEmpresas(response.data.data);
// //     } catch (error) {
// //       showErrorAlert("Error al cargar empresas", error.message);
// //     }
// //   };

// //   const cargarTiposDocumento = async () => {
// //     try {
// //       const response = await apiService.get("/enum/tipo-documento");
  
// //       // Convertir el objeto en un array [{ value, label }]
// //       const tiposArray = Object.entries(response.data).map(([key, value]) => ({
// //         value,  // 👈 Enviar el valor esperado en el backend (Ej: "DECLARACION JURADA")
// //         label: value, // 👈 Mostrar la descripción en el frontend
// //       }));
  
// //       setTiposDocumento(tiposArray);
// //     } catch (error) {
// //       showErrorAlert("Error al obtener tipos de documento", error.message);
// //     }
// //   };

// //   const cargarDocumentos = async (empresaRut) => {
// //     try {
// //       const response = await apiService.get(`/empresas/${empresaRut}/documentos`);
// //       if (!response.data || !Array.isArray(response.data.data)) {
// //         throw new Error("Formato de respuesta incorrecto.");
// //       }
// //       setDocumentos(response.data.data);
// //     } catch (error) {
// //       showErrorAlert("Error al cargar documentos", error.message);
// //     }
// //   };

// //   const handleEmpresaChange = (empresaRut) => {
// //     setEmpresaSeleccionada(empresaRut);
// //     setTipoDocumento("");
// //     setArchivo(null);
// //     setArchivoNombre("");
// //     cargarDocumentos(empresaRut);
// //   };

// //   const handleArchivoChange = (event) => {
// //     const file = event.target.files[0];
// //     setArchivo(file);
// //     setArchivoNombre(file ? file.name : "");
// //   };

// //   const handleSubirDocumento = async () => {
// //     if (!empresaSeleccionada || !tipoDocumento || !archivo) {
// //       showErrorAlert("Debe seleccionar una empresa, un tipo de documento y subir un archivo.");
// //       return;
// //     }

// //     setIsUploading(true);

// //     const formData = new FormData();
// //     formData.append("empresaRut", empresaSeleccionada);
// //     formData.append("tipo", tipoDocumento);
// //     formData.append("documento", archivo);

// //     try {
// //       await apiService.post("/empresa-documentos/crear", formData, {
// //         headers: { "Content-Type": "multipart/form-data" },
// //       });

// //       showSuccessAlert("Documento subido correctamente.");
// //       setTipoDocumento("");
// //       setArchivo(null);
// //       setArchivoNombre("");
// //       cargarDocumentos(empresaSeleccionada);
// //     } catch (error) {
// //       showErrorAlert("Error al subir el documento", error.message);
// //     } finally {
// //       setIsUploading(false);
// //     }
// //   };

// //   const handleEliminarDocumento = async (id) => {
// //     try {
// //       await apiService.delete(`/empresa-documentos/eliminar/${id}`);
// //       showSuccessAlert("Documento eliminado correctamente.");
// //       cargarDocumentos(empresaSeleccionada);
// //     } catch (error) {
// //       showErrorAlert("Error al eliminar documento", error.message);
// //     }
// //   };

 

// //   return (
// //     <div className="p-4">
// //       <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestión de Documentos de Empresas</h2>

// //       {/* Selección de Empresa */}
// //       <div className="mb-4">
// //         <label className="block text-sm font-medium text-gray-700">Seleccionar Empresa</label>
// //         <Select value={empresaSeleccionada} onValueChange={handleEmpresaChange}>
// //           <SelectItem value="">Seleccione una empresa</SelectItem>
// //           {empresas.map((empresa) => (
// //             <SelectItem key={empresa.empresaRut} value={empresa.empresaRut}>
// //               {empresa.nombre} ({empresa.empresaRut})
// //             </SelectItem>
// //           ))}
// //         </Select>
// //       </div>

// //       {/* Documentos Asignados */}
// //       {empresaSeleccionada && (
// //         <div className="mb-6">
// //           <h4 className="text-lg font-semibold text-gray-900 mb-3">Documentos</h4>
// //           <Table className="min-w-full bg-white rounded-lg shadow-sm">
// //             <TableHead>
// //               <TableRow className="bg-gray-200">
// //                 <TableHeaderCell>ID</TableHeaderCell>
// //                 <TableHeaderCell>Tipo</TableHeaderCell>
// //                 <TableHeaderCell>Fecha Vencimiento</TableHeaderCell>
// //                 <TableHeaderCell>Acción</TableHeaderCell>
// //               </TableRow>
// //             </TableHead>
// //             {/* <TableBody>
// //               {documentos.length > 0 ? (
// //                 documentos.map((documento) => (
// //                   <TableRow key={documento.id} className="hover:bg-gray-50">
// //                     <TableCell>{documento.id}</TableCell>
// //                     <TableCell>{documento.tipo}</TableCell>
// //                     <TableCell>{formatDateChile(documento.fechaVencimiento)}</TableCell>
// //                     <TableCell>
// //                       <div className="flex space-x-2">
// //                         {documento.url && (
// //                           <a href={documento.url} target="_blank" rel="noopener noreferrer">
// //                             <Button color="green">Ver</Button>
// //                           </a>
// //                         )}
// //                         <Button color="red" onClick={() => handleEliminarDocumento(documento.id)}>
// //                           Eliminar
// //                         </Button>
// //                       </div>
// //                     </TableCell>
// //                   </TableRow>
// //                 ))
// //               ) : (
// //                 <TableRow>
// //                   <TableCell colSpan="4" className="text-center text-gray-500 py-3">
// //                     No hay documentos registrados.
// //                   </TableCell>
// //                 </TableRow>
// //               )}
// //             </TableBody> */}

// // <TableBody>
// //   {documentos.length > 0 ? (
// //     documentos.map((documento) => {
// //       const { formattedDate, isExpired } = formatDateChile(documento.fecha_vencimiento);
      
// //       return (
// //         <TableRow key={documento.id} className="hover:bg-gray-50">
// //           <TableCell>{documento.id}</TableCell>
// //           <TableCell>{documento.tipo}</TableCell>
// //           <TableCell className={isExpired ? "text-red-500 font-semibold" : ""}>
// //             {formattedDate}
// //           </TableCell>
// //           <TableCell>
// //             <div className="flex space-x-2">
// //               {documento.url_firmada && (
// //                 <a href={documento.url_firmada} target="_blank" rel="noopener noreferrer">
// //                   <Button color="green">Ver</Button>
// //                 </a>
// //               )}
// //               <Button color="red" onClick={() => handleEliminarDocumento(documento.id)}>
// //                 Eliminar
// //               </Button>
// //             </div>
// //           </TableCell>
// //         </TableRow>
// //       );
// //     })
// //   ) : (
// //     <TableRow>
// //       <TableCell colSpan="4" className="text-center text-gray-500 py-3">
// //         No hay documentos registrados.
// //       </TableCell>
// //     </TableRow>
// //   )}
// // </TableBody>
// //           </Table>
// //         </div>
// //       )}

// //       {/* Subir Nuevo Documento */}
// //       {empresaSeleccionada && (
// //         <div className="mb-4">
// //           <h4 className="text-lg font-semibold text-gray-900 mb-3">Subir Nuevo Documento</h4>

// //           <div className="mb-4">
// //             <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
// //             {/* <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
// //               <SelectItem value="">Seleccione un tipo</SelectItem>
// //               <SelectItem value="poder_general">Poder General</SelectItem>
// //               <SelectItem value="contrato">Contrato</SelectItem>
// //               <SelectItem value="otros">Otros</SelectItem>
// //             </Select> */}
// //             <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
// //   <SelectItem value="">Seleccione un tipo</SelectItem>
// //   {tiposDocumento.map((tipo) => (
// //     <SelectItem key={tipo.value} value={tipo.value}>
// //       {tipo.label}
// //     </SelectItem>
// //   ))}
// // </Select>
// //           </div>

// //           <div className="mb-4">
// //             <Input type="file" accept=".pdf,.jpg,.png" onChange={handleArchivoChange} />
// //             {archivoNombre && <p className="text-sm text-gray-700 mt-1">{archivoNombre}</p>}
// //           </div>

// //           <Button color="blue" onClick={handleSubirDocumento} disabled={isUploading}>
// //             {isUploading ? "Subiendo..." : "Subir Documento"}
// //           </Button>
// //         </div>
// //       )}

// //       <div className="mt-4 flex justify-end">
// //         <Button variant="secondary" onClick={onClose}>Cerrar</Button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default EmpresaDocumentosModal;


// // NUEVO:
// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Select,
//   SelectItem,
//   Button,
//   Table,
//   TableHead,
//   TableRow,
//   TableHeaderCell,
//   TableBody,
//   TableCell,
//   ProgressCircle,
// } from "@tremor/react";
// import { Transition } from "@headlessui/react";
// import apiService from "@/app/api/apiService";
// import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";
// import { Input } from "@/components/ui/input/Input";
// import { formatDateChile } from "@/utils/formatDate";

// const EmpresaDocumentosModal = ({ onClose }) => {
//   const [empresas, setEmpresas] = useState([]);
//   const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
//   const [documentos, setDocumentos] = useState([]);
//   const [tipoDocumento, setTipoDocumento] = useState("");
//   const [archivo, setArchivo] = useState(null);
//   const [archivoNombre, setArchivoNombre] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const [tiposDocumento, setTiposDocumento] = useState([]);
//   const [progreso, setProgreso] = useState(0);
//   const [showSuccessBanner, setShowSuccessBanner] = useState(false);

//   useEffect(() => {
//     cargarEmpresas();
//     cargarTiposDocumento();
//   }, []);

//   const cargarEmpresas = async () => {
//     try {
//       const response = await apiService.get("/empresas/");
//       setEmpresas(response.data.data);
//     } catch (error) {
//       showErrorAlert("Error al cargar empresas", error.message);
//     }
//   };

//   const cargarTiposDocumento = async () => {
//     try {
//       const response = await apiService.get("/enum/tipo-documento");
//       const tiposArray = Object.entries(response.data).map(([key, value]) => ({
//         value,
//         label: value,
//       }));
//       setTiposDocumento(tiposArray);
//     } catch (error) {
//       showErrorAlert("Error al obtener tipos de documento", error.message);
//     }
//   };

//   const cargarDocumentos = async (empresaRut) => {
//     try {
//       const response = await apiService.get(`/empresas/${empresaRut}/documentos`);
//       if (!response.data || !Array.isArray(response.data.data)) {
//         throw new Error("Formato de respuesta incorrecto.");
//       }
//       setDocumentos(response.data.data);
//     } catch (error) {
//       showErrorAlert("Error al cargar documentos", error.message);
//     }
//   };

//   const handleEmpresaChange = (empresaRut) => {
//     setEmpresaSeleccionada(empresaRut);
//     setTipoDocumento("");
//     setArchivo(null);
//     setArchivoNombre("");
//     cargarDocumentos(empresaRut);
//   };

//   const handleArchivoChange = (event) => {
//     const file = event.target.files[0];
//     setArchivo(file);
//     setArchivoNombre(file ? file.name : "");
//   };

//   const handleSubirDocumento = async () => {
//     if (!empresaSeleccionada || !tipoDocumento || !archivo) {
//       showErrorAlert("Debe seleccionar una empresa, un tipo de documento y subir un archivo.");
//       return;
//     }

//     setIsUploading(true);
//     setProgreso(0);

//     const formData = new FormData();
//     formData.append("empresaRut", empresaSeleccionada);
//     formData.append("tipo", tipoDocumento);
//     formData.append(tipoDocumento, archivo);

//     try {
//       await apiService.post("/empresa-documentos/", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         onUploadProgress: (e) => {
//           const porcentaje = Math.round((e.loaded * 100) / e.total);
//           setProgreso(porcentaje);
//         },
//       });

//       showSuccessAlert("Documento subido correctamente.");
//       setTipoDocumento("");
//       setArchivo(null);
//       setArchivoNombre("");
//       cargarDocumentos(empresaSeleccionada);

//       setShowSuccessBanner(true);
//       setTimeout(() => setShowSuccessBanner(false), 3000);
//     } catch (error) {
//       showErrorAlert("Error al subir el documento", error.message);
//     } finally {
//       setIsUploading(false);
//       setProgreso(0);
//     }
//   };

//   const handleEliminarDocumento = async (id) => {
//     try {
//       await apiService.delete(`/empresa-documentos/${id}`);
//       showSuccessAlert("Documento eliminado correctamente.");
//       cargarDocumentos(empresaSeleccionada);
//     } catch (error) {
//       showErrorAlert("Error al eliminar documento", error.message);
//     }
//   };

//   // return (
//   //   <div className="p-4">
//   //     <h2 className="text-xl font-semibold text-gray-800 mb-4">
//   //       Gestión de Documentos de Empresas
//   //     </h2>

//   //     <div className="mb-4">
//   //       <label className="block text-sm font-medium text-gray-700">Seleccionar Empresa</label>
//   //       <Select value={empresaSeleccionada} onValueChange={handleEmpresaChange}>
//   //         <SelectItem value="">Seleccione una empresa</SelectItem>
//   //         {empresas.map((empresa) => (
//   //           <SelectItem key={empresa.empresaRut} value={empresa.empresaRut}>
//   //             {empresa.nombre} ({empresa.empresaRut})
//   //           </SelectItem>
//   //         ))}
//   //       </Select>
//   //     </div>

//   //     {empresaSeleccionada && (
//   //       <>
//   //         <div className="mb-6">
//   //           <h4 className="text-lg font-semibold text-gray-900 mb-3">Documentos</h4>
//   //           <Table className="min-w-full bg-white rounded-lg shadow-sm">
//   //             <TableHead>
//   //               <TableRow className="bg-gray-200">
//   //                 <TableHeaderCell>ID</TableHeaderCell>
//   //                 <TableHeaderCell>Tipo</TableHeaderCell>
//   //                 <TableHeaderCell>Fecha Vencimiento</TableHeaderCell>
//   //                 <TableHeaderCell>Acción</TableHeaderCell>
//   //               </TableRow>
//   //             </TableHead>
//   //             <TableBody>
//   //               {documentos.length > 0 ? (
//   //                 documentos.map((documento) => {
//   //                   const { formattedDate, isExpired } = formatDateChile(documento.fecha_vencimiento);
//   //                   return (
//   //                     <TableRow key={documento.id} className="hover:bg-gray-50">
//   //                       <TableCell>{documento.id}</TableCell>
//   //                       <TableCell>{documento.tipo}</TableCell>
//   //                       <TableCell className={isExpired ? "text-red-500 font-semibold" : ""}>
//   //                         {formattedDate}
//   //                       </TableCell>
//   //                       <TableCell>
//   //                         <div className="flex space-x-2">
//   //                           {documento.url_firmada && (
//   //                             <a href={documento.url_firmada} target="_blank" rel="noopener noreferrer">
//   //                               <Button color="green">Ver</Button>
//   //                             </a>
//   //                           )}
//   //                           <Button color="red" onClick={() => handleEliminarDocumento(documento.id)}>
//   //                             Eliminar
//   //                           </Button>
//   //                         </div>
//   //                       </TableCell>
//   //                     </TableRow>
//   //                   );
//   //                 })
//   //               ) : (
//   //                 <TableRow>
//   //                   <TableCell colSpan="4" className="text-center text-gray-500 py-3">
//   //                     No hay documentos registrados.
//   //                   </TableCell>
//   //                 </TableRow>
//   //               )}
//   //             </TableBody>
//   //           </Table>
//   //         </div>

//   //         {/* Subida de documento */}
//   //         <div className="mb-4">
//   //           <h4 className="text-lg font-semibold text-gray-900 mb-3">Subir Nuevo Documento</h4>

//   //           <div className="mb-4">
//   //             <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
//   //             <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
//   //               <SelectItem value="">Seleccione un tipo</SelectItem>
//   //               {tiposDocumento.map((tipo) => (
//   //                 <SelectItem key={tipo.value} value={tipo.value}>
//   //                   {tipo.label}
//   //                 </SelectItem>
//   //               ))}
//   //             </Select>
//   //           </div>

//   //           <div className="mb-4">
//   //             <Input type="file" accept=".pdf,.jpg,.png" onChange={handleArchivoChange} />
//   //             {archivoNombre && <p className="text-sm text-gray-700 mt-1">{archivoNombre}</p>}
//   //           </div>

//   //           <Button color="blue" onClick={handleSubirDocumento} disabled={isUploading}>
//   //             {isUploading ? "Subiendo..." : "Subir Documento"}
//   //           </Button>

//   //           {/* Progreso */}
//   //           {isUploading && (
//   //             <div className="mt-4 flex flex-col items-center space-y-2">
//   //               <ProgressCircle value={progreso} size="lg" color="blue" />
//   //               <p className="text-sm text-blue-600 font-medium">
//   //                 Subiendo archivo... {progreso}%
//   //               </p>
//   //             </div>
//   //           )}

//   //           {/* Banner éxito */}
//   //           <Transition
//   //             show={showSuccessBanner}
//   //             enter="transition ease-out duration-300"
//   //             enterFrom="opacity-0 -translate-y-2"
//   //             enterTo="opacity-100 translate-y-0"
//   //             leave="transition ease-in duration-200"
//   //             leaveFrom="opacity-100 translate-y-0"
//   //             leaveTo="opacity-0 -translate-y-2"
//   //           >
//   //             <div className="mt-4 bg-green-100 text-green-800 text-sm px-4 py-2 rounded shadow">
//   //               ✅ Documento subido correctamente.
//   //             </div>
//   //           </Transition>
//   //         </div>
//   //       </>
//   //     )}

//   //     <div className="mt-4 flex justify-end">
//   //       <Button variant="secondary" onClick={onClose}>
//   //         Cerrar
//   //       </Button>
//   //     </div>
//   //   </div>
//   // );

// return (
//   <div >
//     <h2 className="text-xl font-semibold text-gray-800 mb-4">
//       Gestión de Documentos de Empresas
//     </h2>

//     <div className="mb-4">
//       <label className="block text-sm font-medium text-gray-700">Seleccionar Empresa</label>
//       <Select value={empresaSeleccionada} onValueChange={handleEmpresaChange}>
//         <SelectItem value="">Seleccione una empresa</SelectItem>
//         {empresas.map((empresa) => (
//           <SelectItem key={empresa.empresaRut} value={empresa.empresaRut}>
//             {empresa.nombre} ({empresa.empresaRut})
//           </SelectItem>
//         ))}
//       </Select>
//     </div>

//     {empresaSeleccionada && (
//       <>
//         <div className="mb-6">
//           <h4 className="text-lg font-semibold text-gray-900 mb-3">Documentos</h4>
//           <Table className="min-w-full bg-white rounded-lg shadow-sm">
//             <TableHead>
//               <TableRow className="bg-gray-200">
//                 <TableHeaderCell>ID</TableHeaderCell>
//                 <TableHeaderCell>Tipo</TableHeaderCell>
//                 {/* <TableHeaderCell>Fecha Vencimiento</TableHeaderCell> */}
//                 <TableHeaderCell>Acción</TableHeaderCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {documentos.length > 0 ? (
//                 documentos.map((documento) => {
//                   const { formattedDate, isExpired } = formatDateChile(documento.fecha_vencimiento);
//                   return (
//                     <TableRow key={documento.id} className="hover:bg-gray-50">
//                       <TableCell>{documento.id}</TableCell>
//                       <TableCell>{documento.tipo}</TableCell>
//                       {/* <TableCell className={isExpired ? "text-red-500 font-semibold" : ""}>
//                         {formattedDate}
//                       </TableCell> */}
//                       <TableCell>
//                         <div className="flex space-x-2">
//                           {documento.url_firmada && (
//                             <a href={documento.url_firmada} target="_blank" rel="noopener noreferrer">
//                               <Button color="green">Ver</Button>
//                             </a>
//                           )}
//                           <Button color="red" onClick={() => handleEliminarDocumento(documento.id)}>
//                             Eliminar
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan="4" className="text-center text-gray-500 py-3">
//                     No hay documentos registrados.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>

//         <div className="mb-6">
//           <h4 className="text-lg font-semibold text-gray-900 mb-3">Subir Nuevo Documento</h4>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
//             <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
//               <SelectItem value="">Seleccione un tipo</SelectItem>
//               {tiposDocumento.map((tipo) => (
//                 <SelectItem key={tipo.value} value={tipo.value}>
//                   {tipo.label}
//                 </SelectItem>
//               ))}
//             </Select>
//           </div>

//           <div className="mb-4">
//             <Input type="file" accept=".pdf,.jpg,.png" onChange={handleArchivoChange} />
//             {archivoNombre && <p className="text-sm text-gray-700 mt-1">{archivoNombre}</p>}
//           </div>

//           <Button color="blue" onClick={handleSubirDocumento} disabled={isUploading}>
//             {isUploading ? "Subiendo..." : "Subir Documento"}
//           </Button>

//           {/* Barra de progreso horizontal */}
//           {isUploading && (
//             <div className="mt-4">
//               <progress
//                 value={progreso}
//                 max="100"
//                 className="w-full h-2 appearance-none rounded bg-gray-200 [&::-webkit-progress-bar]:rounded [&::-webkit-progress-value]:rounded [&::-webkit-progress-value]:bg-blue-500"
//               />
//               <p className="text-sm text-blue-600 font-medium mt-1 text-right">
//                 {progreso}%
//               </p>
//             </div>
//           )}

//           {/* Banner éxito */}
//           <Transition
//             show={showSuccessBanner}
//             enter="transition ease-out duration-300"
//             enterFrom="opacity-0 -translate-y-2"
//             enterTo="opacity-100 translate-y-0"
//             leave="transition ease-in duration-200"
//             leaveFrom="opacity-100 translate-y-0"
//             leaveTo="opacity-0 -translate-y-2"
//           >
//             <div className="mt-4 bg-green-100 text-green-800 text-sm px-4 py-2 rounded shadow">
//               ✅ Documento subido correctamente.
//             </div>
//           </Transition>
//         </div>
//       </>
//     )}

//     <div className="mt-4 flex justify-end">
//       <Button variant="secondary" onClick={onClose}>
//         Cerrar
//       </Button>
//     </div>
//   </div>
// );


// };

// export default EmpresaDocumentosModal;


"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "@tremor/react";
import apiService from "@/app/api/apiService";
import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";
import { Input } from "@/components/ui/input/Input";

const EmpresaDocumentosModal = ({ onClose }) => {
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [documentos, setDocumentos] = useState([]);
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [archivoNombre, setArchivoNombre] = useState("");
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    cargarEmpresas();
    cargarTiposDocumento();
  }, []);

  const cargarEmpresas = async () => {
    try {
      const response = await apiService.get("/empresas", { params: { limit: 1000 } });
      setEmpresas(response.data.data);
    } catch (error) {
      showErrorAlert("Error al cargar empresas", error.message);
    }
  };

  const cargarTiposDocumento = async () => {
    try {
      const response = await apiService.get("/enum/tipo-documento");
      const tiposArray = Object.entries(response.data).map(([_, value]) => ({
        value,
        label: value,
      }));
      setTiposDocumento(tiposArray);
    } catch (error) {
      showErrorAlert("Error al obtener tipos de documento", error.message);
    }
  };

  const cargarDocumentos = async (empresaRut) => {
    try {
      const response = await apiService.get(`/empresas/${empresaRut}/documentos`);
      setDocumentos(response.data.data || []);
    } catch (error) {
      showErrorAlert("Error al cargar documentos", error.message);
    }
  };

  const handleEmpresaChange = (empresaRut) => {
    setEmpresaSeleccionada(empresaRut);
    setTipoDocumento("");
    setArchivo(null);
    setArchivoNombre("");
    setMostrarFormulario(false);
    cargarDocumentos(empresaRut);
  };

  const handleArchivoChange = (event) => {
    const file = event.target.files[0];
    setArchivo(file);
    setArchivoNombre(file ? file.name : "");
  };

  const handleSubirDocumento = async () => {
    if (!empresaSeleccionada || !tipoDocumento || !archivo) {
      showErrorAlert("Debe seleccionar una empresa, tipo de documento y subir un archivo.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("empresaRut", empresaSeleccionada);
    formData.append("tipo", tipoDocumento);
    formData.append(tipoDocumento, archivo);

    try {
      await apiService.post("/empresa-documentos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSuccessAlert("Documento subido correctamente.");
      setTipoDocumento("");
      setArchivo(null);
      setArchivoNombre("");
      setMostrarFormulario(false);
      cargarDocumentos(empresaSeleccionada);
    } catch (error) {
      showErrorAlert("Error al subir el documento", error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEliminarDocumento = async (id) => {
    try {
      await apiService.delete(`/empresa-documentos/${id}`);
      showSuccessAlert("Documento eliminado correctamente.");
      cargarDocumentos(empresaSeleccionada);
    } catch (error) {
      showErrorAlert("Error al eliminar documento", error.message);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Gestión de Documentos</h2>

      {/* Empresa */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1">Seleccionar Empresa</p>
        <Select value={empresaSeleccionada} onValueChange={handleEmpresaChange}>
          <SelectItem value="">Seleccione una empresa</SelectItem>
          {empresas.map((empresa) => (
            <SelectItem key={empresa.empresaRut} value={empresa.empresaRut}>
              {empresa.nombre} ({empresa.empresaRut})
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Tabla */}
      {empresaSeleccionada && (
        <>
          <div>
            <h4 className="text-base font-bold text-gray-900 mb-2">Documentos</h4>
            <Table className="min-w-full bg-white rounded-md border shadow-sm">
              <TableHead>
                <TableRow className="bg-gray-100 text-sm">
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Tipo</TableHeaderCell>
                  <TableHeaderCell>Acción</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documentos.length > 0 ? (
                  documentos.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-gray-50">
                      <TableCell>{doc.id}</TableCell>
                      <TableCell>{doc.tipo}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {doc.url_firmada && (
                            <a href={doc.url_firmada} target="_blank" rel="noopener noreferrer">
                              <Button size="xs" color="green">Ver</Button>
                            </a>
                          )}
                          <Button
                            size="xs"
                            color="red"
                            onClick={() => handleEliminarDocumento(doc.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500 py-3">
                      No hay documentos registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Botón Agregar */}
          {!mostrarFormulario && (
            <div className="pt-2">
              <Button color="blue" onClick={() => setMostrarFormulario(true)}>
                Agregar Nuevo Documento
              </Button>
            </div>
          )}

          {/* Formulario expandible */}
          {mostrarFormulario && (
            <div className="grid gap-y-3">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Tipo de Documento</p>
                <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                  <SelectItem value="">Seleccione un tipo</SelectItem>
                  {tiposDocumento.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Archivo</p>
                <Input type="file" accept=".pdf,.jpg,.png" onChange={handleArchivoChange} />
                {archivoNombre && <p className="text-sm text-gray-700 mt-1">{archivoNombre}</p>}
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <Button variant="secondary" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </Button>
                <Button color="blue" onClick={handleSubirDocumento} disabled={isUploading}>
                  {isUploading ? "Subiendo..." : "Subir Documento"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Botón cerrar */}
      
    </div>
  );
};

export default EmpresaDocumentosModal;
