import * as Yup from "yup";

const rutSinPunto = /^\d{1,2}\d{3}\d{3}-[\dkK]$/;

export const getGestionMoraValidationSchema = ({
  isEditing,
  hasCertificadoInicial,
}) =>
  Yup.object().shape({
    empresaRut: Yup.string()
      .matches(rutSinPunto, "Formato de RUT inválido")
      .required("El RUT de la empresa es obligatorio"),

    entidadId: Yup.string().required("La entidad es obligatoria"),

    estado: Yup.string()
      .oneOf(["analisis", "cerrada", "pendiente"], "Estado inválido")
      .required("El estado es obligatorio"),

    fechaGestion: Yup.date().required("La fecha de gestión es obligatoria"),

    certificadoInicial:
      isEditing && hasCertificadoInicial
        ? Yup.mixed().nullable()
        : Yup.mixed()
            .required("Debes subir el certificado inicial")
            .test("fileSize", "El archivo es muy grande", (file) =>
              file ? file.size <= 5 * 1024 * 1024 : true
            )
            .test("fileType", "Solo se permite PDF", (file) =>
              file ? file.type === "application/pdf" : true
            ),

    certificadoFinal: Yup.mixed()
      .nullable()
      .test("fileType", "Solo se permite PDF", (file) =>
        file ? file.type === "application/pdf" : true
      ),

    comprobantePago: Yup.mixed()
      .nullable()
      .test("fileType", "Solo se permite PDF", (file) =>
        file ? file.type === "application/pdf" : true
      ),

    fechaPago: Yup.string()
      .nullable()
      .test(
        "fechaPago-condicional",
        "Debes ingresar la fecha de pago",
        function (value) {
          const { comprobantePago } = this.parent;
          if (comprobantePago instanceof File) {
            return !!value;
          }
          return true;
        }
      ),
  });
