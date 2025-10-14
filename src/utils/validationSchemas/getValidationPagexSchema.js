import * as Yup from "yup";

const rutSinPunto = /^\d{1,2}\d{3}\d{3}-[\dkK]$/;

export const getGestionPagexValidationSchema = ({ isEditing = false } = {}) =>
  Yup.object().shape({
    empresaRut: Yup.string()
      .matches(rutSinPunto, "Formato de RUT inválido")
      .required("El RUT de la empresa es obligatorio"),

    entidadId: Yup.string().required("La entidad es obligatoria"),

    fechaGestion: Yup.date().required("La fecha de gestión es obligatoria"),

    periodoInicio: Yup.string()
      .matches(/^\d{2}\/\d{4}$/, "Debe tener formato MM/YYYY")
      .required("El periodo de inicio es obligatorio"),

    periodoTermino: Yup.string()
      .matches(/^\d{2}\/\d{4}$/, "Debe tener formato MM/YYYY")
      .required("El periodo de término es obligatorio"),

    montoSolicitado: Yup.number()
      .typeError("Debe ingresar un número válido")
      .required("El monto solicitado es obligatorio")
      .min(1, "Debe ser mayor a 0"),

    folio: Yup.string().nullable(),

    comprobantePago: Yup.mixed()
      .nullable()
      .test("fileType", "Solo se permite PDF", (file) =>
        file ? file.type === "application/pdf" : true
      ),

    fechaPago: Yup.string()
      .nullable()
      .test("fechaPago-condicional", "Debes ingresar la fecha de pago", function (value) {
        const { comprobantePago } = this.parent;
        if (comprobantePago instanceof File) {
          return !!value;
        }
        return true;
      }),
  });
