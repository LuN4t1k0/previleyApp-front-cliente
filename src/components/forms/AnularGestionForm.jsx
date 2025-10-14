// // src/components/forms/AnularGestionForm.jsx

// import React from "react";
// import GenericForm from "./GenericForm";
// import * as Yup from "yup";
// import useActionFeedback from "@/hooks/useActionFeedback";
// import apiService from "@/app/api/apiService";

// const AnularGestionForm = (props) => {
//   const { endpoint, method, refreshData, onClose, successMessage } = props;
//   const { runWithFeedback } = useActionFeedback();

//   const anularConfig = {
//     // Definimos los campos que necesita nuestro formulario
//     fields: [
//       {
//         name: "motivo",
//         label: "Motivo de la Anulación *",
//         type: "textarea",
//         placeholder: "Explique detalladamente por qué se anula esta gestión. Este motivo quedará en el registro de auditoría.",
//         validation: Yup.string()
//           .min(10, "El motivo debe tener al menos 10 caracteres.")
//           .required("El motivo es obligatorio."),
//       },
//     ],
//     // Le pasamos una función de submit personalizada a GenericForm
//     // para usar nuestro hook de feedback.
//     onSubmit: async (values) => {
//         await runWithFeedback({
//             action: () => apiService.request({
//                 method: method || 'POST', // Usamos el método pasado por props
//                 url: endpoint,
//                 data: values,
//             }),
//             loadingMessage: "Anulando gestión...",
//             successMessage: successMessage || "¡Gestión anulada exitosamente!",
//             errorMessage: "No se pudo anular la gestión."
//         });
//         // Si la acción fue exitosa, refrescamos los datos de la tabla y cerramos el modal
//         if (refreshData) refreshData();
//         if (onClose) onClose();
//     }
//   };

//   return <GenericForm config={anularConfig} {...props} />;
// };

// export default AnularGestionForm;


import React from "react";
import GenericForm from "./GenericForm";
import * as Yup from "yup";
import useActionFeedback from "@/hooks/useActionFeedback";
import apiService from "@/app/api/apiService";

const AnularGestionForm = (props) => {
  const { endpoint, method, refreshData, onClose, successMessage } = props;
  const { runWithFeedback } = useActionFeedback();

  const anularConfig = {
    // --- LÍNEA AÑADIDA ---
    // Añadimos el título que GenericForm espera.
    // Lo definimos como una función, aunque no usemos 'isEditMode'.
    title: () => 'Confirmar Anulación',

    fields: [
      {
        name: "motivo",
        label: "Motivo de la Anulación *",
        type: "textarea",
        placeholder: "Explique detalladamente por qué se anula esta gestión...",
        validation: Yup.string()
          .min(10, "El motivo debe tener al menos 10 caracteres.")
          .required("El motivo es obligatorio."),
      },
    ],
    onSubmit: async (values) => {
        await runWithFeedback({
            action: () => apiService.request({
                method: method || 'POST',
                url: endpoint,
                data: values,
            }),
            loadingMessage: "Anulando gestión...",
            successMessage: successMessage || "¡Gestión anulada exitosamente!",
            errorMessage: "No se pudo anular la gestión."
        });
        if (refreshData) refreshData();
        if (onClose) onClose();
    }
  };

  // Le pasamos el config completo a GenericForm
  return <GenericForm config={anularConfig} {...props} />;
};

export default AnularGestionForm;