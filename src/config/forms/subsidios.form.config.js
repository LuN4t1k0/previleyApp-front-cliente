// src/config/forms/empresa.form.config.js

import * as Yup from "yup";
import { calculateDaysBetween } from "@/helpers/date.helpers";

export const subsidiosFormConfig = {
  // Título del formulario, dinámico para modo edición/creación
  title: (isEditMode) => (isEditMode ? "Editar Subsidio" : "Nuevo Subsidio"),

  // Endpoints para las operaciones CRUD
  createEndpoint: "/subsidios",
  updateEndpoint: (id) => `/subsidios/${id}`,

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

    // DIAS AUTORIZDOS 
     {
      name: "diasAutorizados",
      label: "Dias Autorizados",
      type: "number",
      placeholder: "Ej: 123456",
      validation: Yup.number().required("Los días autorizados son obligatorios"),
    },

    // DIAS PAGADOS 
     {
      name: "diasPagados",
      label: "Dias Pagados",
      type: "number",
      placeholder: "Ej: 123456",
      validation: Yup.number().required("Los días pagados son obligatorios"),
    },

    // SUBSIDIOS 
     {
      name: "subsidio",
      label: "Monto Subsidio",
      type: "number",
      placeholder: "Ej: 123456",
      validation: Yup.number().required("El monto del subsidio es obligatorio"),
    },

    // FECHA DEPOSITO
    {
      name: "fechaDeposito",
      label: "Fecha de Depósito *",
      type: "date",
      initialValue: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    },


    // SUBSIDIOS 
     {
      name: "montoDeposito",
      label: "Monto Depósito",
      type: "number",
      placeholder: "Ej: 123456",
      validation: Yup.number().required("El monto del depósito es obligatorio"),
    },

    
    // FORMA DE PAGO
    {
      name: "formaPago",
      label: "Forma de Pago",
      type: "select",
      validation: Yup.string().required("La forma de pago es obligatoria"),
      optionsEndpoint: "/enum/forma-pago",
    },

     // OBSERVACIONES 
     {
      name: "observaciones",
      label: "Observaciones",
      type: "text",
      placeholder: "Ej: 123456",
      validation: Yup.string().required("Las observaciones son obligatorias"),
    },





  ],
};
