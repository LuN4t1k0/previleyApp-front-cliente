// src/config/forms/empresa.form.config.js

import * as Yup from "yup";
import { calculateDaysBetween } from "@/helpers/date.helpers";
import { formatPeriodo, unformatPeriodo } from "@/utils/dateUtils"; 

export const conciliacionFormConfig = {
  // Título del formulario, dinámico para modo edición/creación
  title: (isEditMode) => (isEditMode ? "Editar Gestión" : "Nueva Gestión"),

  // Endpoints para las operaciones CRUD
  createEndpoint: "/gestion-licencia",
  updateEndpoint: (id) => `/gestion-licencia/${id}`,

  // Definición de cada campo del formulario
  fields: [

    // EMPRESA RUT
    {
      name: "empresaRut",
      label: "Empresa *",
      type: "select",
      placeholder: "Seleccione empresa",
      optionsEndpoint: "/empresas?limit=1000",

      optionsTransformer: (response) => {
        const empresasArray = response.data.data;

        if (!Array.isArray(empresasArray)) {
          console.error(
            "Error: La respuesta de la API no contenía un array de empresas en la ruta esperada (response.data.data).",
            response.data
          );
          return [];
        }

        return empresasArray
          .filter((empresa) => empresa && empresa.empresaRut)
          .map((empresa) => ({
            value: empresa.empresaRut,
            label: empresa.nombre || `RUT: ${empresa.empresaRut}`,
          }));
      },
    },

    // PERIODO
     {
      name: "periodo",
      label: "Periodo",
      type: "periodo",
      placeholder: "MM/YYYY",
      // Ahora las funciones existen y el error desaparecerá
      transform: {
        incoming: (value) => formatPeriodo(value),
        outgoing: (value) => unformatPeriodo(value),
      },
      // Es buena idea añadir validación para el formato
      validation: Yup.string()
        .matches(/^(0[1-9]|1[0-2])\/\d{4}$/, "El formato debe ser MM/YYYY")
        .required("El período es obligatorio"),
    },
 
         {
          name: "observaciones",
          label: "Observaciones",
          type: "text",
          placeholder: "Ej: observacion ...",
          validation: Yup.string().optional("Las observaciones son opcionales"),
        },
   
  
  
  
  ],
};

