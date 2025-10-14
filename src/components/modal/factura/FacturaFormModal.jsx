import { useState, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Select, SelectItem, ProgressBar } from "@tremor/react";
import { Input } from "@/components/ui/input/Input";
import apiService from "@/app/api/apiService";
import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";
import { Callout } from "@/components/callOut/Callout";

const validationSchema = Yup.object().shape({
  prefacturaId: Yup.string().required("La prefactura es obligatoria"),
  numeroFactura: Yup.string().required("El número de factura es obligatorio"),
  fechaEmision: Yup.date().required("La fecha de emisión es obligatoria"),
  facturaPdf: Yup.mixed().required("El archivo PDF de la factura es obligatorio").test(
    "fileType",
    "Solo se permiten archivos PDF",
    (value) => value && value.type === "application/pdf"
  ),
});

const FacturaFormModal = ({ initialData, onClose, handleSubmit }) => {
  const [prefacturaOptions, setPrefacturaOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchPrefacturas = async () => {
      try {
        const response = await apiService.get("/prefacturas?estado=pendiente");
        setPrefacturaOptions(
          response.data.data.map((p) => ({
            value: p.id,
            label: `Folio ${p.folio} - ${p.empresa.nombre}`,
          }))
        );
      } catch (error) {
        showErrorAlert("Error al cargar prefacturas", error.message);
      }
    };
    fetchPrefacturas();
  }, []);

  const formik = useFormik({
    initialValues: {
      prefacturaId: initialData?.prefacturaId || "",
      numeroFactura: initialData?.numeroFactura || "",
      fechaEmision: initialData?.fechaEmision
        ? initialData.fechaEmision.split("T")[0]
        : "",
      facturaPdf: null,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("prefacturaId", values.prefacturaId);
        formData.append("numeroFactura", values.numeroFactura);
        formData.append("fechaEmision", values.fechaEmision);
        formData.append("facturaPdf", values.facturaPdf);

        await handleSubmit(formData, initialData);
        showSuccessAlert("Factura guardada con éxito");
        onClose();
      } catch (error) {
        console.error("Error al guardar factura:", error);
        showErrorAlert("Error al guardar la factura", error.message);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Calcular progreso del formulario
  useEffect(() => {
    const requiredFields = ["prefacturaId", "numeroFactura", "fechaEmision", "facturaPdf"];
    const filledFields = requiredFields.filter((key) => formik.values[key] || initialData?.[key]);
    setProgress(Math.round((filledFields.length / requiredFields.length) * 100));
  }, [formik.values, initialData]);

  return (
    <form onSubmit={formik.handleSubmit} className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {initialData ? "Editar Factura" : "Crear Factura"}
      </h2>

      {/* Barra de progreso */}
      <ProgressBar value={progress} color="blue" className="mb-4" />

      {/* Prefactura */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prefactura <span className="text-red-500">*</span>
        </label>
        <Select
          value={formik.values.prefacturaId}
          onValueChange={(value) => formik.setFieldValue("prefacturaId", value)}
        >
          <SelectItem value="">Seleccione una Prefactura</SelectItem>
          {prefacturaOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Número de Factura */}
      <div className="mb-4">
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
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de Emisión <span className="text-red-500">*</span>
        </label>
        <Input
          type="date"
          value={formik.values.fechaEmision}
          onChange={(e) => formik.setFieldValue("fechaEmision", e.target.value)}
        />
      </div>

      {/* Archivo PDF */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Archivo PDF de la Factura <span className="text-red-500">*</span>
        </label>
        <Input
          type="file"
          accept=".pdf"
          onChange={(e) => formik.setFieldValue("facturaPdf", e.target.files[0])}
        />
      </div>

      {/* Motivo de Rechazo (solo si la factura fue rechazada) */}
      {initialData?.estado === "rechazada" && initialData?.motivoRechazo && (
        <Callout title="Motivo de Rechazo" variant="error" className="mb-4">
          {initialData.motivoRechazo}
        </Callout>
      )}

      {/* Botones */}
      <div className="mt-6 flex justify-end space-x-4">
        <Button onClick={onClose} variant="secondary">Cancelar</Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Cargando..." : initialData ? "Actualizar Factura" : "Crear Factura"}
        </Button>
      </div>
    </form>
  );
};

export default FacturaFormModal;
