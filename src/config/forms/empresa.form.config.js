// src/config/forms/empresa.form.config.js

import * as Yup from "yup";

export const empresaFormConfig = {
  // Título del formulario, dinámico para modo edición/creación
  title: (isEditMode) => (isEditMode ? "Editar Empresa" : "Nueva Empresa"),

  // Endpoints para las operaciones CRUD
  createEndpoint: "/empresas/",
  updateEndpoint: (id) => `/empresas/${id}`,

  // Definición de cada campo del formulario
  fields: [
    {
      name: "empresaRut",
      label: "RUT",
      type: "rut", // Usaremos este tipo especial luego
      placeholder: "Ej: 11111111-1",
      validation: Yup.string()
        .matches(/^\d{1,2}\d{3}\d{3}-[0-9kK]{1}$/, "Formato de RUT inválido")
        .required("El RUT es obligatorio"),
      disabled: (isEditMode) => isEditMode, // El RUT no se puede editar
    },
    {
      name: "nombre",
      label: "Nombre",
      type: "text",
      placeholder: "Ej: Empresa XYZ",
      validation: Yup.string()
        .min(8, "Debe tener al menos 8 caracteres")
        .required("El nombre es obligatorio"),
    },
    {
      name: "direccion",
      label: "Dirección",
      type: "text",
      placeholder: "Ej: Av. Principal 123",
      validation: Yup.string().required("La dirección es obligatoria"),
    },
    {
      name: "telefono",
      label: "Teléfono",
      type: "text",
      placeholder: "Ej: +56912345678",
      validation: Yup.string().required("El teléfono es obligatorio"),
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Ej: contacto@empresa.cl",
      validation: Yup.string()
        .email("Correo inválido")
        .required("El email es obligatorio"),
    },
    {
      name: "banco",
      label: "Banco",
      type: "select",
      validation: Yup.string().required("El banco es obligatorio"),
      // El motor del formulario sabrá que debe buscar las opciones en esta API
      optionsEndpoint: "/enum/bancos", 
    },
    {
      name: "cuentaCorriente",
      label: "Cuenta Corriente",
      type: "text",
      placeholder: "Ej: 12345678-9",
      validation: Yup.string()
        .matches(/^[\d-]+$/, "Solo números y guiones permitidos")
        .required("La cuenta corriente es obligatoria"),
    },
    {
      name: "estado",
      label: "Estado",
      type: "select",
      initialValue: "ACTIVO", // Valor inicial por defecto
      validation: Yup.string().required("El estado es obligatorio"),
      optionsEndpoint: "/enum/estado-contrato",
    },
  ],
};