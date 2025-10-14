// import React, { useState } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { TextInput, Button } from "@tremor/react";
// import apiService from "@/app/api/apiService";
// import { showErrorAlert, showConfirmationAlert } from "@/utils/alerts";

// // Esquema de validación con el campo "abreviatura"
// const validationSchema = Yup.object().shape({
//   nombre: Yup.string().required("El nombre del servicio es requerido"),
//   abreviatura: Yup.string()
//     .max(10, "Máximo 10 caracteres")
//     .required("La abreviatura es requerida"),
 
// });

// const ServicioFormModal = ({ initialData, onClose, fetchData }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const isEditMode = Boolean(initialData?.id);

//   const formik = useFormik({
//     initialValues: {
//       nombre: initialData?.nombre || "",
//       abreviatura: initialData?.abreviatura || "",
      
//     },
//     validationSchema,
//     enableReinitialize: true,
//     onSubmit: async (values) => {
//       try {
//         setIsLoading(true);

//         // Convertir datos a mayúsculas antes de enviar
//         const cleanValues = {
//           nombre: values.nombre.toUpperCase(),
//           abreviatura: values.abreviatura.toUpperCase(),
          
//         };

//         if (isEditMode) {
//           await apiService.patch(`/servicios/${initialData.id}`, cleanValues);
//         } else {
//           await apiService.post("/servicios", cleanValues);
//         }

//         await fetchData();
//         onClose();
//       } catch (error) {
//         showErrorAlert("Error al guardar el servicio", error.message);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//   });

//   const handleClose = async () => {
//     const confirm = await showConfirmationAlert(
//       "Cambios sin guardar",
//       "Tienes cambios sin guardar. ¿Deseas salir sin guardar?"
//     );
//     if (confirm) onClose();
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-semibold text-gray-800 mb-4">
//         {isEditMode ? "Editar Servicio" : "Nuevo Servicio"}
//       </h2>

//       <div className="grid grid-cols-1 gap-4">
//         {/* Nombre del servicio */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Nombre del Servicio
//           </label>
//           <TextInput
//             name="nombre"
//             placeholder="Ej: Asesoría Legal"
//             {...formik.getFieldProps("nombre")}
//           />
//           {formik.touched.nombre && formik.errors.nombre && (
//             <p className="text-red-500 text-xs mt-1">{formik.errors.nombre}</p>
//           )}
//         </div>

//         {/* Abreviatura */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Abreviatura
//           </label>
//           <TextInput
//             name="abreviatura"
//             placeholder="Ej: AL"
//             maxLength={10}
//             {...formik.getFieldProps("abreviatura")}
//           />
//           {formik.touched.abreviatura && formik.errors.abreviatura && (
//             <p className="text-red-500 text-xs mt-1">{formik.errors.abreviatura}</p>
//           )}
//         </div>

        

//       </div>

//       {/* Botones */}
//       <div className="mt-4 flex justify-end space-x-4">
//         <Button variant="secondary" onClick={handleClose}>
//           Cancelar
//         </Button>
//         <Button color="blue" onClick={formik.handleSubmit} disabled={isLoading}>
//           {isLoading ? "Guardando..." : isEditMode ? "Actualizar" : "Guardar"}
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default ServicioFormModal;


import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextInput, Button } from "@tremor/react";
import apiService from "@/app/api/apiService";
import { showErrorAlert, showConfirmationAlert } from "@/utils/alerts";

// Esquema de validación
const validationSchema = Yup.object().shape({
  nombre: Yup.string().required("El nombre del servicio es requerido"),
  abreviatura: Yup.string()
    .max(10, "Máximo 10 caracteres")
    .required("La abreviatura es requerida"),
});

const ServicioFormModal = ({ initialData, onClose, fetchData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = Boolean(initialData?.id);

  const formik = useFormik({
    initialValues: {
      nombre: initialData?.nombre || "",
      abreviatura: initialData?.abreviatura || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        const cleanValues = {
          nombre: values.nombre.toUpperCase(),
          abreviatura: values.abreviatura.toUpperCase(),
        };

        if (isEditMode) {
          await apiService.patch(`/servicios/${initialData.id}`, cleanValues);
        } else {
          await apiService.post("/servicios", cleanValues);
        }

        await fetchData();
        onClose();
      } catch (error) {
        const apiMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "No se pudo guardar el servicio.";
        showErrorAlert("Error al guardar el servicio", apiMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleClose = async () => {
    const confirm = await showConfirmationAlert(
      "Cambios sin guardar",
      "Tienes cambios sin guardar. ¿Deseas salir sin guardar?"
    );
    if (confirm) onClose();
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">
        {isEditMode ? "Editar Servicio" : "Nuevo Servicio"}
      </h2>

      <div className="grid grid-cols-1 gap-y-3">
        {/* Nombre */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Nombre del Servicio</p>
          <TextInput
            name="nombre"
            placeholder="Ej: Asesoría Legal"
            {...formik.getFieldProps("nombre")}
            disabled={isLoading}
          />
          {formik.touched.nombre && formik.errors.nombre && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.nombre}</p>
          )}
        </div>

        {/* Abreviatura */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Abreviatura</p>
          <TextInput
            name="abreviatura"
            placeholder="Ej: AL"
            maxLength={10}
            {...formik.getFieldProps("abreviatura")}
            disabled={isLoading}
          />
          {formik.touched.abreviatura && formik.errors.abreviatura && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.abreviatura}</p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="pt-3 flex justify-end space-x-4">
        <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button color="blue" onClick={formik.handleSubmit} disabled={isLoading}>
          {isLoading ? "Guardando..." : isEditMode ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </div>
  );
};

export default ServicioFormModal;
