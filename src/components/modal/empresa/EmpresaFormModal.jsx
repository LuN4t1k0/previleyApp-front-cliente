
// import React, { useState, useEffect } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { TextInput, Button, Select, SelectItem } from "@tremor/react";
// import apiService from "@/app/api/apiService";
// import { showErrorAlert, showConfirmationAlert } from "@/utils/alerts";
// import { handleRutChange } from "@/utils/rutUtils";

// const getValidationSchema = (isEditMode) =>
//   Yup.object().shape({
//     empresaRut: Yup.string()
//       .matches(/^\d{1,2}\d{3}\d{3}-[0-9kK]{1}$/, "Formato de RUT inválido")
//       .required("El RUT es obligatorio"),
//     nombre: Yup.string().min(8, "Debe tener al menos 8 caracteres").required("El nombre es obligatorio"),
//     direccion: Yup.string().required("La dirección es obligatoria"),
//     telefono: Yup.string().required("El teléfono es obligatorio"),
//     banco: Yup.string().required("El banco es obligatorio"),
//     cuentaCorriente: Yup.string()
//       .matches(/^[\d-]+$/, "Solo números y guiones permitidos")
//       .required("La cuenta corriente es obligatoria"),
//     estado: Yup.string().required("El estado es obligatorio"),
//     email: Yup.string().email("Correo inválido").required("El email es obligatorio"),
//   });

// const EmpresaFormModal = ({ initialData, onClose, fetchData }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [bancosOptions, setBancosOptions] = useState([]);
//   const [estadoOptions, setEstadoOptions] = useState([]);
//   const isEditMode = Boolean(initialData?.id);

//   useEffect(() => {
//     const fetchEnums = async () => {
//       try {
//         const [bancosRes, estadosRes] = await Promise.all([
//           apiService.get("/enum/bancos"),
//           apiService.get("/enum/estado-contrato"),
//         ]);

//        const bancos = Object.entries(bancosRes.data).map(([key, value]) => ({
//   value: value, // ⬅️ enviar "banco falabella"
//   label: value,
// }));
//        const estados = Object.entries(estadosRes.data).map(([key, value]) => ({
//   value: value, // ⬅️ enviar "activo", "terminado", etc.
//   label: value,
// }));

//         setBancosOptions(bancos);
//         setEstadoOptions(estados);
//       } catch (error) {
//         showErrorAlert("Error al obtener listas de bancos o estados", error.message);
//       }
//     };

//     fetchEnums();
//   }, []);

//   const formik = useFormik({
//     initialValues: {
//       empresaRut: initialData?.empresaRut || "",
//       nombre: initialData?.nombre || "",
//       direccion: initialData?.direccion || "",
//       telefono: initialData?.telefono || "",
//       banco: initialData?.banco || "",
//       cuentaCorriente: initialData?.cuentaCorriente || "",
//       estado: initialData?.estado || "ACTIVO",
//       email: initialData?.email || "",
//     },
//     validationSchema: getValidationSchema(isEditMode),
//     enableReinitialize: true,
//     onSubmit: async (values) => {
//       try {
//         setIsLoading(true);
//         const cleanValues = { ...values };

//         if (isEditMode) {
//           delete cleanValues.empresaRut;
//         }

//         Object.keys(cleanValues).forEach((key) => {
//           if (cleanValues[key] === "") cleanValues[key] = null;
//         });

//         if (isEditMode) {
//           await apiService.patch(`/empresas/${initialData.id}`, cleanValues);
//         } else {
//           await apiService.post("/empresas/", cleanValues);
//         }

//         await fetchData();
//         onClose();
//       } catch (error) {
//         showErrorAlert("Error al guardar la empresa", error.message);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//   });

//   const handleClose = async () => {
//     const confirm = await showConfirmationAlert("Cambios sin guardar", "¿Deseas salir sin guardar?");
//     if (confirm) onClose();
//   };

//   return (
 
//     <div className="p-4 space-y-4">
//   <h2 className="text-xl font-bold text-gray-800">
//     {isEditMode ? "Editar Empresa" : "Nueva Empresa"}
//   </h2>

//   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">

//     {/* RUT */}
//     <div>
//       <p className="text-xs font-medium text-gray-600 mb-1">RUT</p>
//       <TextInput
//         name="empresaRut"
//         placeholder="Ej: 11111111-1"
//         {...formik.getFieldProps("empresaRut")}
//         onChange={handleRutChange(formik, "empresaRut")}
//         disabled={isEditMode || isLoading}
//       />
//       {formik.touched.empresaRut && formik.errors.empresaRut && (
//         <p className="text-red-500 text-xs mt-1">{formik.errors.empresaRut}</p>
//       )}
//     </div>

//     {/* Nombre */}
//     <div>
//       <p className="text-xs font-medium text-gray-600 mb-1">Nombre</p>
//       <TextInput
//         name="nombre"
//         placeholder="Ej: Empresa XYZ"
//         {...formik.getFieldProps("nombre")}
//         disabled={isLoading}
//       />
//       {formik.touched.nombre && formik.errors.nombre && (
//         <p className="text-red-500 text-xs mt-1">{formik.errors.nombre}</p>
//       )}
//     </div>

//     {/* Dirección */}
//     <div>
//       <p className="text-xs font-medium text-gray-600 mb-1">Dirección</p>
//       <TextInput
//         name="direccion"
//         placeholder="Ej: Av. Principal 123"
//         {...formik.getFieldProps("direccion")}
//         disabled={isLoading}
//       />
//       {formik.touched.direccion && formik.errors.direccion && (
//         <p className="text-red-500 text-xs mt-1">{formik.errors.direccion}</p>
//       )}
//     </div>

//     {/* Teléfono */}
//     <div>
//       <p className="text-xs font-medium text-gray-600 mb-1">Teléfono</p>
//       <TextInput
//         name="telefono"
//         placeholder="Ej: +56912345678"
//         {...formik.getFieldProps("telefono")}
//         disabled={isLoading}
//       />
//       {formik.touched.telefono && formik.errors.telefono && (
//         <p className="text-red-500 text-xs mt-1">{formik.errors.telefono}</p>
//       )}
//     </div>

//     {/* Email */}
//     <div>
//       <p className="text-xs font-medium text-gray-600 mb-1">Email</p>
//       <TextInput
//         name="email"
//         placeholder="Ej: contacto@empresa.cl"
//         {...formik.getFieldProps("email")}
//         disabled={isLoading}
//       />
//       {formik.touched.email && formik.errors.email && (
//         <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
//       )}
//     </div>

//     {/* Banco */}
//     <div>
//       <p className="text-xs font-medium text-gray-600 mb-1">Banco</p>
//       <Select
//         value={formik.values.banco}
//         onValueChange={(value) => formik.setFieldValue("banco", value)}
//         disabled={isLoading}
//       >
//         <SelectItem value="">Seleccione un banco</SelectItem>
//         {bancosOptions.map((banco) => (
//           <SelectItem key={banco.value} value={banco.value}>
//             {banco.label}
//           </SelectItem>
//         ))}
//       </Select>
//       {formik.touched.banco && formik.errors.banco && (
//         <p className="text-red-500 text-xs mt-1">{formik.errors.banco}</p>
//       )}
//     </div>

//     {/* Cuenta Corriente */}
//     <div>
//       <p className="text-xs font-medium text-gray-600 mb-1">Cuenta Corriente</p>
//       <TextInput
//         name="cuentaCorriente"
//         placeholder="Ej: 12345678-9"
//         {...formik.getFieldProps("cuentaCorriente")}
//         disabled={isLoading}
//       />
//       {formik.touched.cuentaCorriente && formik.errors.cuentaCorriente && (
//         <p className="text-red-500 text-xs mt-1">{formik.errors.cuentaCorriente}</p>
//       )}
//     </div>

//     {/* Estado */}
//     <div>
//       <p className="text-xs font-medium text-gray-600 mb-1">Estado</p>
//       <Select
//         name="estado"
//         value={formik.values.estado}
//         onValueChange={(value) => formik.setFieldValue("estado", value)}
//         disabled={isLoading}
//       >
//         <SelectItem value="">Seleccione un estado</SelectItem>
//         {estadoOptions.map((estado) => (
//           <SelectItem key={estado.value} value={estado.value}>
//             {estado.label}
//           </SelectItem>
//         ))}
//       </Select>
//       {formik.touched.estado && formik.errors.estado && (
//         <p className="text-red-500 text-xs mt-1">{formik.errors.estado}</p>
//       )}
//     </div>
//   </div>

//   {/* Botones */}
//   <div className="pt-3 flex justify-end space-x-4">
//     <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
//       Cancelar
//     </Button>
//     <Button color="blue" onClick={formik.handleSubmit} disabled={isLoading}>
//       {isLoading ? "Guardando..." : isEditMode ? "Actualizar" : "Guardar"}
//     </Button>
//   </div>
// </div>

//   );
// };

// export default EmpresaFormModal;

import React from "react";
import GenericForm from "@/components/forms/GenericForm";
import { empresaFormConfig } from "@/config/forms/empresa.form.config";

const EmpresaFormModal = (props) => {

  return <GenericForm config={empresaFormConfig} {...props} />;
};

export default EmpresaFormModal;

