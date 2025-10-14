import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { Button, Select, SelectItem, ProgressBar } from "@tremor/react";
import { showErrorAlert, showConfirmationAlert } from "@/utils/alerts";
import { Input } from "@/components/ui/input/Input";
import isEqual from "lodash/isEqual";
import { Callout } from "@/components/callOut/Callout";

// Esquema de validación con Yup
const validationSchema = Yup.object().shape({
  prefacturaId: Yup.string().required("La prefactura es obligatoria"),
  numeroFactura: Yup.string()
    .required("El número de factura es obligatorio")
    .matches(/^[a-zA-Z0-9\-]+$/, "Solo se permiten letras, números y guiones"),
  fechaEmision: Yup.date().required("La fecha de emisión es obligatoria"),
  facturaPdf: Yup.mixed()
    .test("fileType", "Solo se permiten archivos PDF", (value) =>
      value ? value.type === "application/pdf" : true
    )
    .notRequired(),
});

const FacturaTest = ({ initialData, onClose, handleSubmit }) => {

  const [originalData, setOriginalData] = useState(initialData || {});
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);



  // Actualizar datos originales al cambiar initialData
  useEffect(() => {
    setOriginalData(initialData || {});
  }, [initialData]);

  const formik = useFormik({
    initialValues: {
      prefacturaId: initialData?.prefacturaId || "",
      numeroFactura: initialData?.numeroFactura || "",
      fechaEmision: initialData?.fechaEmision
        ? initialData.fechaEmision.split("T")[0]
        : "",
      facturaPdf: null,
      facturaPdfKey: initialData?.pdfUrl || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("numeroFactura", values.numeroFactura);
        formData.append("fechaEmision", values.fechaEmision);
    
        if (values.facturaPdf) {
          formData.append("pdf", values.facturaPdf);
        }
    
        // No enviar `prefacturaId`
        await handleSubmit(formData, initialData);
        onClose();
      } catch (error) {
        console.error("Error al enviar factura:", error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Calcular progreso del formulario
  useEffect(() => {
    const requiredFields = ["numeroFactura", "fechaEmision"];
    const filledFields = requiredFields.filter((key) => formik.values[key]);
    const calculatedProgress = Math.round(
      (filledFields.length / requiredFields.length) * 100
    );
    setProgress(calculatedProgress);
  }, [formik.values]);

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
    <>
      {/* Mostrar motivo de rechazo si la factura fue rechazada */}
      {initialData?.estado === "rechazada" && initialData?.motivoRechazo && (
        <Callout title="Motivo de Rechazo" variant="error" className="mb-4">
          {initialData.motivoRechazo}
        </Callout>
      )}

      <form onSubmit={formik.handleSubmit}>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData ? "Editar Factura" : "Crear Factura"}
          </h2>
          <span className="text-sm font-medium text-gray-600">
            {progress}% Completado
          </span>
        </div>

        {/* Barra de progreso */}
        <ProgressBar value={progress} color="blue" />

        {/* Sección de campos básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">

          {/* Número de Factura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Factura <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formik.values.numeroFactura}
              onChange={(e) => formik.setFieldValue("numeroFactura", e.target.value)}
            />
          </div>

          {/* Fecha de Emisión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Emisión <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formik.values.fechaEmision}
              onChange={(e) => formik.setFieldValue("fechaEmision", e.target.value)}
            />
          </div>

          {/* Archivo PDF de la Factura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Factura en PDF
            </label>
            {initialData?.pdfUrl && (
              <div className="text-sm text-gray-600 mb-1">
                Archivo actual:{" "}
                <a
                  href={initialData.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600"
                >
                  Ver factura
                </a>
              </div>
            )}
            <Input
              type="file"
              accept=".pdf"
              onChange={(e) => formik.setFieldValue("facturaPdf", e.target.files[0])}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <Button onClick={handleClose} variant="secondary">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Cargando..." : initialData ? "Actualizar Factura" : "Crear Factura"}
          </Button>
        </div>
      </form>
    </>
  );
};

export default FacturaTest;


