// src/components/forms/ReabrirGestionForm.jsx

import React from "react";
import GenericForm from "./GenericForm";
import * as Yup from "yup";
import useActionFeedback from "@/hooks/useActionFeedback";
import apiService from "@/app/api/apiService";

const ReabrirGestionForm = (props) => {
  const { endpoint, method, refreshData, onClose, successMessage } = props;
  const { runWithFeedback } = useActionFeedback();

  const reabrirConfig = {
    // Definimos los campos
    fields: [
      {
        name: "motivo",
        label: "Motivo de la Reapertura *",
        type: "textarea",
        placeholder: "Explique por qué se necesita reabrir esta gestión cerrada (ej: faltaron subsidios por ingresar, se debe corregir un dato, etc.).",
        validation: Yup.string()
          .min(10, "El motivo debe tener al menos 10 caracteres.")
          .required("El motivo es obligatorio."),
      },
    ],
    // Función de submit personalizada con el hook de feedback
    onSubmit: async (values) => {
        await runWithFeedback({
            action: () => apiService.request({
                method: method || 'POST',
                url: endpoint,
                data: values,
            }),
            loadingMessage: "Reabriendo gestión...",
            successMessage: successMessage || "¡Gestión reabierta exitosamente!",
            errorMessage: "No se pudo reabrir la gestión."
        });
        // Refrescar y cerrar al terminar
        if (refreshData) refreshData();
        if (onClose) onClose();
    }
  };

  return <GenericForm config={reabrirConfig} {...props} />;
};

export default ReabrirGestionForm;