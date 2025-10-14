// src/config/forms/empresa.form.config.js

import * as Yup from "yup";
import { calculateDaysBetween } from "@/helpers/date.helpers";

export const anticiposFormConfig = {
  // Título del formulario, dinámico para modo edición/creación
  title: (isEditMode) => (isEditMode ? "Editar Anticipo" : "Nuevo Anticipo"),

  // Endpoints para las operaciones CRUD
  createEndpoint: "/anticipos",
  updateEndpoint: (id) => `/anticipos/${id}`,

  // Definición de cada campo del formulario
  fields: [
    // FOLIO
    {
      name: "folio",
      label: "Folio",
      type: "text",
      placeholder: "Ej: 123456",
      validation: Yup.string().required("El folio es obligatorio"),
    },
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
    // TRABAJADOR RUT
    {
      name: "trabajadorRut",
      label: "RUT Trabajador",
      type: "rut",
      placeholder: "Ej: 11111111-1",
      validation: Yup.string()
        .matches(/^\d{1,2}\d{3}\d{3}-[0-9kK]{1}$/, "Formato de RUT inválido")
        .required("El RUT del trabajador es obligatorio"),
    },

     // FOLIO
    {
      name: "anticipo",
      label: "Anticipo",
      type: "number",
      placeholder: "Ej: 123456",
      validation: Yup.number().required("El anticipo es obligatorio"),
    },
    

    // FECHA ANTICIPO
    {
      name: "fechaAnticipo",
      label: "Fecha de Anticipo *",
      type: "date",
      initialValue: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    },
   
  ],
};
