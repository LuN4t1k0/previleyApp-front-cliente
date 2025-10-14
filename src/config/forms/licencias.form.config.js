// src/config/forms/empresa.form.config.js

import * as Yup from "yup";
import { calculateDaysBetween } from "@/helpers/date.helpers";

export const licenciasFormConfig = {
  // Título del formulario, dinámico para modo edición/creación
  title: (isEditMode) => (isEditMode ? "Editar Licencia" : "Nueva Licencia"),

  // Endpoints para las operaciones CRUD
  createEndpoint: "/licencias-medicas",
  updateEndpoint: (id) => `/licencias-medicas/${id}`,

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
    // NOMBRE TRABAJADOR
    {
      name: "nombreTrabajador",
      label: "Nombre Trabajador",
      type: "text",
      placeholder: "Ej: Juan Pérez",
      validation: Yup.string()
        .min(8, "Debe tener al menos 8 caracteres")
        .required("El nombre es obligatorio"),
    },
    // ENTIDAD
    {
      name: "entidad",
      label: "Entidad",
      type: "select",
      validation: Yup.string().required("La entidad es obligatoria"),
      optionsEndpoint: "/enum/tipo-entidad-licencia-medica",
    },
    // TIPO LICENCIA
{
      name: "tipoLicencia",
      label: "Tipo de Licencia",
      type: "select",
      validation: Yup.string().required("El tipo de licencia es obligatorio"),
      optionsEndpoint: "/enum/tipos-licencias",
    },
    // ESTADO LICENCIA 
    {
      name: "estadoLicencia",
      label: "Estado de Licencia",
      type: "select",
      validation: Yup.string().required("El estado de licencia es obligatorio"),
      optionsEndpoint: "/enum/estados-licencia",
    },
    // FECHA OTORGAMIENTO
    {
      name: "fechaOtorgamiento",
      label: "Fecha de Otorgamiento *",
      type: "date",
      initialValue: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    },
  // FECHA INICIO
    {
      name: "fechaInicio",
      label: "Fecha de Inicio",
      type: "date",
      validation: Yup.date().required("La fecha de inicio es obligatoria"),
    },
    // FECHA TERMINO
    {
      name: "fechaTermino",
      label: "Fecha de Término",
      type: "date",
      validation: Yup.date()
        .required("La fecha de término es obligatoria")
        .min(Yup.ref('fechaInicio'), "La fecha de término no puede ser anterior a la de inicio"),
    },
    // NUMERO DIAS
    {
      name: "numeroDias",
      label: "Número de Días",
      type: "number", // O 'text' si prefieres
      disabled: true, // El usuario no puede editar este campo
      
      // --- ¡AQUÍ ESTÁ LA NUEVA LÓGICA! ---
      derivedValue: {
        // Observa cambios en estos dos campos:
        watch: ['fechaInicio', 'fechaTermino'],
        
        // Cuando cambien, ejecuta esta función:
        calculate: (values) => {
          // values es el objeto completo de formik.values
          const days = calculateDaysBetween(values.fechaInicio, values.fechaTermino);
          return days > 0 ? days : '';
        }
      }
    },
  
  
  
    // {
    //   name: "periodoTermino",
    //   label: "Periodo Término (MM/YYYY) *",
    //   type: "periodo", // ¡Nuevo tipo!
    //   placeholder: "MM/YYYY",
    //   transform: {
    //     incoming: (value) => formatPeriodo(value),
    //     outgoing: (value) => unformatPeriodo(value),
    //   }
    // },

  

    

    // {
    //   name: "estadoLicencia",
    //   label: "Estado de Licencia",
    //   type: "select",
    //   validation: Yup.string().required("El estado de licencia es obligatorio"),
    //   optionsEndpoint: "/enum/estados-licencia",
    // },

    // {
    //   name: "cuentaCorriente",
    //   label: "Cuenta Corriente",
    //   type: "text",
    //   placeholder: "Ej: 12345678-9",
    //   validation: Yup.string()
    //     .matches(/^[\d-]+$/, "Solo números y guiones permitidos")
    //     .required("La cuenta corriente es obligatoria"),
    // },
    // {
    //   name: "estado",
    //   label: "Estado",
    //   type: "select",
    //   initialValue: "ACTIVO", // Valor inicial por defecto
    //   validation: Yup.string().required("El estado es obligatorio"),
    //   optionsEndpoint: "/enum/estado-contrato",
    // },
  ],
};



// export const nuevaGestionFormConfig = {
//   title: () => "Nueva Gestión",
//   fields: [
//     {
//       name: "empresaRut",
//       label: "Empresa",
//       type: "select",
//       optionsEndpoint: "/empresas?limit=1000",
//       optionsTransformer: (response) => response.data.map(e => ({ value: e.empresaRut, label: e.nombre, fullData: e })), // ¡Guardamos el objeto completo!
      
//       effects: {
//         onChange: ({ value, formik, selectOptions }) => {
//           // Buscamos la opción seleccionada en el estado de las opciones
//           const empresaSeleccionada = selectOptions.empresaRut?.find(opt => opt.value === value);
//           if (empresaSeleccionada) {
//             // Usamos setFieldValue para actualizar otros campos
//             formik.setFieldValue('nombreEmpresa', empresaSeleccionada.fullData.nombre);
//             formik.setFieldValue('direccionEmpresa', empresaSeleccionada.fullData.direccion);
//           }
//         }
//       }
//     },
//     {
//       name: "nombreEmpresa",
//       label: "Nombre Empresa",
//       type: "text",
//       disabled: true, // Este campo se auto-rellena
//     },
//     {
//       name: "direccionEmpresa",
//       label: "Dirección Empresa",
//       type: "text",
//       disabled: true, // Este campo también
//     },
//     {
//       name: "trabajadorRut",
//       label: "RUT del Trabajador",
//       type: "rut",
//       effects: {
//         // ¡La función puede ser asíncrona!
//         onChange: async ({ value, formik }) => {
//           // Solo buscamos si el RUT tiene un largo mínimo
//           if (value && value.length > 8) {
//             try {
//               // Simulamos una llamada a la API
//               const response = await apiService.get(`/trabajadores/${value}`);
//               if (response.data) {
//                 formik.setFieldValue('nombreTrabajador', response.data.nombreCompleto);
//               }
//             } catch (error) {
//               // Si no se encuentra, limpiamos el campo
//               formik.setFieldValue('nombreTrabajador', 'RUT no encontrado');
//             }
//           }
//         }
//       }
//     },
//     {
//       name: "nombreTrabajador",
//       label: "Nombre del Trabajador",
//       type: "text",
//       disabled: true,
//     }
//   ],
// };