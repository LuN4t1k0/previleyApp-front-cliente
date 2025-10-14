import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useMemo, useState } from "react";
import { Button, Select, SelectItem, ProgressBar } from "@tremor/react";
import { showErrorAlert, showConfirmationAlert } from "@/utils/alerts";
import apiService from "@/app/api/apiService";
import { Input } from "@/components/ui/input/Input";
import isEqual from "lodash/isEqual";
import { Callout } from "@/components/callOut/Callout";

// Esquema de validación con Yup

const validationSchema = Yup.object().shape({
  empresaRut: Yup.string().required("El RUT de la empresa es obligatorio"),
  servicioId: Yup.string().required("El servicio es obligatorio"),
  entidadId: Yup.string().required("La entidad es obligatoria"),
  fechaProduccion: Yup.date().required("La fecha de producción es obligatoria"),
  montoRegularizado: Yup.number()
    .required("El monto regularizado es obligatorio")
    .min(1, "El monto debe ser mayor a 0"),

  // Certificado Inicial: solo si servicioId == 1 y no viene URL previa
  certificadoInicial: Yup.mixed().when(
    ["servicioId", "certificadoInicialKey"],
    {
      is: (servicioId, key) => Number(servicioId) === 1 && !key,
      then: (schema) =>
        schema
          .required("El certificado inicial es obligatorio")
          .test(
            "fileType",
            "Solo se permiten archivos PDF",
            (value) => value && value.type === "application/pdf"
          ),
      otherwise: (schema) => schema.notRequired(),
    }
  ),

  // Certificado Final: idéntico a inicial
  certificadoFinal: Yup.mixed().when(["servicioId", "certificadoFinalKey"], {
    is: (servicioId, key) => Number(servicioId) === 1 && !key,
    then: (schema) =>
      schema
        .required("El certificado final es obligatorio")
        .test(
          "fileType",
          "Solo se permiten archivos PDF",
          (value) => value && value.type === "application/pdf"
        ),
    otherwise: (schema) => schema.notRequired(),
  }),

  comentarioCorreccion: Yup.string().when("estado", {
    is: (estado) => estado === "rechazada",
    then: (schema) => schema.required("Debes explicar la corrección realizada"),
    otherwise: (schema) => schema.notRequired(),
  }),
  estado: Yup.string().notRequired(),

  // Detalle Excel: requerido siempre que no haya URL previa
  detalle: Yup.mixed().when("detalleKey", {
    is: (key) => !key,
    then: (schema) =>
      schema
        .required("El detalle es obligatorio")
        .test(
          "fileType",
          "Solo se permiten archivos Excel (xls, xlsx)",
          (value) =>
            value &&
            [
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "application/vnd.ms-excel",
            ].includes(value.type)
        ),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const ProduccionFormContent = ({
  initialData,
  onClose,
  handleSubmit,
  refreshData,
}) => {
  // const { id: trabajadorId } = useUserData();
  const [empresaOptions, setEmpresaOptions] = useState([]);
  const [servicioOptions, setServicioOptions] = useState([]);
  const [entidadOptions, setEntidadOptions] = useState([]);
  const [originalData, setOriginalData] = useState(initialData || {});
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    console.log("🟢 ProduccionFormContent renderizado");
    console.log("🔴 initialData:", initialData);
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empresasRes, serviciosRes, entidadesRes] = await Promise.all([
          // apiService.get("/empresas/"),
          apiService.get("/empresas", { params: { limit: 1000 } }),
          apiService.get("/servicios"),
          apiService.get("/entidades"),
        ]);

        setEmpresaOptions(
          empresasRes.data.data.map((e) => ({
            value: e.empresaRut,
            label: e.nombre,
          }))
        );
        setServicioOptions(
          serviciosRes.data.data.map((s) => ({ value: s.id, label: s.nombre }))
        );
        setEntidadOptions(
          entidadesRes.data.data.map((e) => ({ value: e.id, label: e.nombre }))
        );
      } catch (error) {
        showErrorAlert("Error al obtener datos", error.message);
      }
    };
    fetchData();
  }, []);

  // Actualizar datos originales al cambiar initialData
  useEffect(() => {
    setOriginalData(initialData || {});
  }, [initialData]);

  const formik = useFormik({
    initialValues: {
      estado: initialData?.estado || "",
      empresaRut: initialData?.empresaRut || "",
      servicioId: initialData?.servicioId || "",
      entidadId: initialData?.entidadId || "",
      fechaProduccion: initialData?.fechaProduccion
        ? initialData.fechaProduccion.split("T")[0]
        : "",
      montoRegularizado: initialData?.montoRegularizado || "",

      // Archivos: null para nuevos, pero guardamos la URL previa en *Key
      certificadoInicial: null,
      certificadoInicialKey: initialData?.certificadoInicial || "",
      certificadoFinal: null,
      certificadoFinalKey: initialData?.certificadoFinal || "",
      detalle: null,
      detalleKey: initialData?.detalle || "",
      comentarioCorreccion: initialData?.comentarioCorreccion || "",
    },
    validationSchema,
    enableReinitialize: true,

    onSubmit: async (values) => {
      console.log("🟡 Formik values antes de enviar:", values); // <-- Nuevo

      const errors = await formik.validateForm();
      console.log("🔴 Errores de validación:", errors); // <-- Nuevo

      setIsLoading(true);

      try {
        const formData = new FormData();
        formData.append("empresaRut", values.empresaRut);
        formData.append("servicioId", values.servicioId);
        formData.append("entidadId", values.entidadId);
        formData.append("fechaProduccion", values.fechaProduccion);
        formData.append("montoRegularizado", values.montoRegularizado);

        if (values.certificadoInicial)
          formData.append("initialCert", values.certificadoInicial);

        if (values.certificadoFinal)
          formData.append("finalCert", values.certificadoFinal);

        if (values.detalle) formData.append("detalle", values.detalle);

        if (values.comentarioCorreccion)
          formData.append("comentarioCorreccion", values.comentarioCorreccion);

        await handleSubmit(formData, initialData);

        // ✅ Ahora refresca correctamente si se usa scroll infinito
        if (typeof refreshData === "function") {
          await refreshData();
        }

        onClose();
      } catch (error) {
        console.error("❌ Error al enviar producción:", error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    if (initialData?.empresaRut) {
      formik.setFieldValue("empresaRut", initialData.empresaRut);
    }
  }, [initialData?.empresaRut]);

  // NUEVO:
  const isMoraPresunta = useMemo(() => {
    if (!formik.values.servicioId) return false;
    const servicioSeleccionado = servicioOptions.find(
      (opt) => opt.value === formik.values.servicioId
    );
    return servicioSeleccionado
      ? servicioSeleccionado.value === "1" ||
          servicioSeleccionado.value === 1 ||
          servicioSeleccionado.label.toLowerCase() === "mora presunta"
      : false;
  }, [formik.values.servicioId, servicioOptions]);

  // Calcular el progreso considerando también los valores preexistentes en modo edición
  useEffect(() => {
    // Campos básicos requeridos
    let requiredFields = [
      "empresaRut",
      "servicioId",
      "entidadId",
      "fechaProduccion",
      "montoRegularizado",
    ];
    // Si se ha seleccionado un servicio, agregar campos de archivos
    if (formik.values.servicioId) {
      if (isMoraPresunta) {
        requiredFields.push(
          "certificadoInicial",
          "certificadoFinal",
          "detalle"
        );
      } else {
        requiredFields.push("detalle");
      }
    }

    const filledFields = requiredFields.filter((key) => {
      // Para campos file, si el usuario no ha cargado uno nuevo, se chequea si initialData tiene el archivo.
      let value = formik.values[key];
      if (!value && initialData && initialData[key]) {
        value = initialData[key];
      }
      if (typeof value === "string") return value.trim() !== "";
      return value !== null && value !== undefined;
    });
    const calculatedProgress = Math.round(
      (filledFields.length / requiredFields.length) * 100
    );
    setProgress(calculatedProgress);
  }, [formik.values, isMoraPresunta, initialData]);

  // NUEVO:
  const handleClose = async () => {
    if (!isEqual(formik.values, originalData)) {
      const confirm = await showConfirmationAlert(
        "Cambios sin guardar",
        "Tienes cambios sin guardar en el formulario. ¿Deseas salir sin guardar?"
      );
      if (confirm) onClose();
    } else {
      onClose();
    }
  };

  return (
    // NUEVO:
    <>
      {(initialData?.estado === "rechazada" ||
        initialData?.estado === "corregida") && (
        <>
          {initialData?.motivoRechazo && (
            <Callout
              title="Motivo del Rechazo (Administrador)"
              variant="error"
              className="mb-2"
            >
              {initialData.motivoRechazo}
            </Callout>
          )}

          {initialData?.comentarioCorreccion && (
            <Callout
              title="Corrección del Trabajador"
              variant="warning"
              className="mb-4"
            >
              {initialData.comentarioCorreccion}
            </Callout>
          )}
        </>
      )}

      <form onSubmit={formik.handleSubmit}>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData ? "Editar Producción" : "Crear Producción"}
          </h2>
          <span className="text-sm font-medium text-gray-600">
            {progress}% Completado
          </span>
        </div>

   
        <ProgressBar
          value={progress}
          color={
            initialData?.estado === "rechazada" && initialData?.motivoRechazo
              ? "red"
              : "blue"
          }
        />

        {/* Sección de campos básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa <span className="text-red-500">*</span>
            </label>
            <Select
              value={formik.values.empresaRut}
              onValueChange={(value) =>
                formik.setFieldValue("empresaRut", value)
              }
            >
              <SelectItem value="">Seleccione Empresa</SelectItem>
              {empresaOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servicio <span className="text-red-500">*</span>
            </label>
            <Select
              value={formik.values.servicioId}
              onValueChange={(value) =>
                formik.setFieldValue("servicioId", value)
              }
            >
              <SelectItem value="">Seleccione Servicio</SelectItem>
              {servicioOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Entidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entidad <span className="text-red-500">*</span>
            </label>
            <Select
              value={formik.values.entidadId}
              onValueChange={(value) =>
                formik.setFieldValue("entidadId", value)
              }
            >
              <SelectItem value="">Seleccione Entidad</SelectItem>
              {entidadOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Fecha de Producción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Producción <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formik.values.fechaProduccion}
              onChange={(e) =>
                formik.setFieldValue("fechaProduccion", e.target.value)
              }
            />
          </div>

          {/* Monto Regularizado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto<span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              value={formik.values.montoRegularizado}
              onChange={(e) =>
                formik.setFieldValue("montoRegularizado", e.target.value)
              }
            />
          </div>
        </div>

        {/* Sección de Archivos: se muestra si se ha seleccionado un servicio */}
        {formik.values.servicioId && (
          <div className="mt-4">
            {isMoraPresunta ? (
              <>
                {/* Certificado Inicial */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certificado Inicial <span className="text-red-500">*</span>
                  </label>
                  {initialData?.certificadoInicial ? (
                    <div className="text-sm text-gray-600 mb-1">
                      Archivo actual:{" "}
                      <a
                        href={initialData.certificadoInicial}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600"
                      >
                        Ver archivo
                      </a>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 mb-1">
                      No se ha cargado un archivo
                    </div>
                  )}
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) =>
                      formik.setFieldValue(
                        "certificadoInicial",
                        e.target.files[0]
                      )
                    }
                  />
                </div>

                {/* Certificado Final */}
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certificado Final <span className="text-red-500">*</span>
                  </label>
                  {initialData?.certificadoFinal ? (
                    <div className="text-sm text-gray-600 mb-1">
                      Archivo actual:{" "}
                      <a
                        href={initialData.certificadoFinal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600"
                      >
                        Ver archivo
                      </a>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 mb-1">
                      No se ha cargado un archivo
                    </div>
                  )}
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) =>
                      formik.setFieldValue(
                        "certificadoFinal",
                        e.target.files[0]
                      )
                    }
                  />
                </div>

                {/* Detalle (Excel) */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detalle (Excel) <span className="text-red-500">*</span>
                  </label>
                  {initialData?.detalle ? (
                    <div className="text-sm text-gray-600 mb-1">
                      Archivo actual:{" "}
                      <a
                        href={initialData.detalle}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600"
                      >
                        Ver archivo
                      </a>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 mb-1">
                      No se ha cargado un archivo
                    </div>
                  )}
                  <Input
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={(e) =>
                      formik.setFieldValue("detalle", e.target.files[0])
                    }
                  />
                </div>
              </>
            ) : (
              // Para otros servicios: solo se muestra Detalle (Excel)
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detalle (Excel) <span className="text-red-500">*</span>
                </label>
                {initialData?.detalle ? (
                  <div className="text-sm text-gray-600 mb-1">
                    Archivo actual:{" "}
                    <a
                      href={initialData.detalle}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600"
                    >
                      Ver archivo
                    </a>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 mb-1">
                    No se ha cargado un archivo
                  </div>
                )}
                <Input
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={(e) =>
                    formik.setFieldValue("detalle", e.target.files[0])
                  }
                />
              </div>
            )}
          </div>
        )}

        {initialData?.estado === "rechazada" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentario de corrección <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="Describe brevemente qué has corregido..."
              value={formik.values.comentarioCorreccion}
              onChange={(e) =>
                formik.setFieldValue("comentarioCorreccion", e.target.value)
              }
            />
            {formik.errors.comentarioCorreccion &&
              formik.touched.comentarioCorreccion && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.comentarioCorreccion}
                </p>
              )}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <Button onClick={handleClose} variant="secondary">
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            onClick={async () => {
              console.log("🟢 Botón clickeado");
              const errors = await formik.validateForm();
              console.log("🔴 Validación forzada:", errors);
            }}
          >
            {isLoading
              ? "Cargando..."
              : initialData?.id
              ? "Actualizar Producción"
              : "Crear Producción"}
          </Button>
        </div>
      </form>
    </>
  );
};

export default ProduccionFormContent;
