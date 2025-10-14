"use client";

import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Button, Select, SelectItem, ProgressBar } from "@tremor/react";
import { Input } from "@/components/ui/input/Input";
import apiService from "@/app/api/apiService";
import { showErrorAlert } from "@/utils/alerts";
import { getGestionPagexValidationSchema } from "@/utils/validationSchemas/getValidationPagexSchema";
import { formatPeriodo, unformatPeriodo } from "@/utils/periodo.helpers";


const PagexFormModal = ({ initialData = {}, handleSubmit, fetchData, onClose }) => {
  const isEditing = Boolean(initialData?.id);
  const [empresas, setEmpresas] = useState([]);
  const [entidades, setEntidades] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [empRes, entRes] = await Promise.all([
          // const response = await apiService.get("/empresas", { params: { limit: 1000 } });
          apiService.get("/empresas", { params: { limit: 1000 } }),
          apiService.get("/entidades"),
        ]);
        setEmpresas(
          empRes.data.data.map((e) => ({
            value: e.empresaRut,
            label: e.nombre,
          }))
        );
        setEntidades(
          entRes.data.data.map((e) => ({
            value: e.id.toString(),
            label: e.nombre,
          }))
        );
      } catch (error) {
        showErrorAlert("Error al cargar empresas/entidades", error.message);
      }
    };
    fetchOptions();
  }, []);

  const formik = useFormik({
    initialValues: {
      empresaRut: initialData.empresaRut || "",
      entidadId: initialData.entidadId?.toString() || "",
      fechaGestion: initialData.fechaGestion
        ? new Date(initialData.fechaGestion).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
periodoInicio: initialData.periodoInicio
  ? formatPeriodo(initialData.periodoInicio)
  : "",

periodoTermino: initialData.periodoTermino
  ? formatPeriodo(initialData.periodoTermino)
  : "",
      montoSolicitado: initialData.montoSolicitado || "",
      folio: initialData.folio || "",
      comprobantePago: null,
      fechaPago: initialData.fechaPago
        ? new Date(initialData.fechaPago).toISOString().split("T")[0]
        : "",
    },
    validationSchema: getGestionPagexValidationSchema({ isEditing }),
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("empresaRut", values.empresaRut);
      formData.append("entidadId", values.entidadId);
      formData.append("fechaGestion", values.fechaGestion);
 formData.append("periodoInicio", unformatPeriodo(values.periodoInicio));
formData.append("periodoTermino", unformatPeriodo(values.periodoTermino));
      formData.append("montoSolicitado", values.montoSolicitado);
      if (values.folio) formData.append("folio", values.folio);
      if (values.fechaPago) formData.append("fechaPago", values.fechaPago);
      if (values.comprobantePago) formData.append("comprobantePago", values.comprobantePago);

      try {
        await handleSubmit(formData, initialData);
        fetchData?.();
        onClose();
      } catch (error) {
        showErrorAlert("Error al guardar", error.message);
      }
    },
  });

  useEffect(() => {
    const requiredFields = [
      "empresaRut",
      "entidadId",
      "fechaGestion",
      "periodoInicio",
      "periodoTermino",
      "montoSolicitado",
    ];
    const filled = requiredFields.filter((key) => !!formik.values[key]);
    setProgress(Math.round((filled.length / requiredFields.length) * 100));
  }, [formik.values]);

  return (
    <form onSubmit={formik.handleSubmit} className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-bold text-gray-800">
          {isEditing ? "Editar Gestión Pagex" : "Nueva Gestión Pagex"}
        </h2>
        <span className="text-sm text-gray-600">{progress}% completado</span>
      </div>
      <ProgressBar value={progress} color="blue" />

      {/* Información General */}
      <h3 className="text-base font-bold text-gray-800 mt-3">Información General</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
        {/* Empresa */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Empresa *</p>
          <Select
            value={formik.values.empresaRut}
            onValueChange={(value) => {
              formik.setFieldValue("empresaRut", value);
              formik.setTouched({ ...formik.touched, empresaRut: true }); // 👈 importante
            }}
            // onValueChange={(value) => formik.setFieldValue("empresaRut", value)}
            placeholder="Seleccione empresa"
            disabled={formik.isSubmitting}
          >
            {empresas.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </Select>
          {formik.touched.empresaRut && formik.errors.empresaRut && (
            <p className="text-sm text-red-500 mt-1">{formik.errors.empresaRut}</p>
          )}

          
        </div>

        {/* Entidad */}
<div>
  <p className="text-xs font-medium text-gray-600 mb-1">Entidad *</p>
  <Select
    value={formik.values.entidadId}
    onValueChange={(value) => {
      formik.setFieldValue("entidadId", value);
      formik.setTouched({ ...formik.touched, entidadId: true }); // 👈 importante
    }}
    placeholder="Seleccione entidad"
    disabled={formik.isSubmitting}
  >
    {entidades.map((e) => (
      <SelectItem key={e.value} value={e.value}>
        {e.label}
      </SelectItem>
    ))}
  </Select>
  {formik.touched.entidadId && formik.errors.entidadId && (
    <p className="text-sm text-red-500 mt-1">{formik.errors.entidadId}</p>
  )}
</div>

        {/* Fecha de gestión */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Fecha de Gestión *</p>
          <Input
            type="date"
            name="fechaGestion"
            value={formik.values.fechaGestion}
            onChange={(e) => formik.setFieldValue("fechaGestion", e.target.value)}
            disabled={formik.isSubmitting}
          />
        </div>

        {/* Periodo Inicio */}
<div>
  <p className="text-xs font-medium text-gray-600 mb-1">Periodo Inicio (MM/YYYY) *</p>
  <Input
    name="periodoInicio"
    type="text"
    inputMode="numeric"
    placeholder="MM/YYYY"
    value={formik.values.periodoInicio}
    onChange={(e) => {
      let val = e.target.value.replace(/[^\d]/g, "");
      if (val.length >= 3) {
        val = `${val.slice(0, 2)}/${val.slice(2, 6)}`;
      }
      formik.setFieldValue("periodoInicio", val);
    }}
    onBlur={formik.handleBlur}
    disabled={formik.isSubmitting}
  />
  {formik.touched.periodoInicio && formik.errors.periodoInicio && (
    <p className="text-sm text-red-500">{formik.errors.periodoInicio}</p>
  )}
</div>

{/* Periodo Término */}
<div>
  <p className="text-xs font-medium text-gray-600 mb-1">Periodo Término (MM/YYYY) *</p>
  <Input
    name="periodoTermino"
    type="text"
    inputMode="numeric"
    placeholder="MM/YYYY"
    value={formik.values.periodoTermino}
    onChange={(e) => {
      let val = e.target.value.replace(/[^\d]/g, "");
      if (val.length >= 3) {
        val = `${val.slice(0, 2)}/${val.slice(2, 6)}`;
      }
      formik.setFieldValue("periodoTermino", val);
    }}
    onBlur={formik.handleBlur}
    disabled={formik.isSubmitting}
  />
  {formik.touched.periodoTermino && formik.errors.periodoTermino && (
    <p className="text-sm text-red-500">{formik.errors.periodoTermino}</p>
  )}
</div>

        {/* Monto solicitado */}
      <div>
  <p className="text-xs font-medium text-gray-600 mb-1">Monto Solicitado *</p>
  <Input
    name="montoSolicitado"
    type="number"
    value={formik.values.montoSolicitado}
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
    disabled={formik.isSubmitting}
  />
  {formik.touched.montoSolicitado && formik.errors.montoSolicitado && (
    <p className="text-sm text-red-500 mt-1">{formik.errors.montoSolicitado}</p>
  )}
</div>

        {/* Folio (opcional) */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Folio (opcional)</p>
          <Input
            name="folio"
            value={formik.values.folio}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
          />
        </div>
      </div>

      {/* Comprobante de pago */}
<h3 className="text-base font-bold text-gray-800 mt-3">Pago (si aplica)</h3>
<div>
  <p className="text-xs font-medium text-gray-600 mb-1">Comprobante de Pago (PDF)</p>

  {/* Mostrar enlace si ya existe un archivo cargado */}
  {initialData.comprobantePago && (
    <p className="text-sm text-blue-600 mb-1">
      Archivo actual:{" "}
      <a
        href={initialData.comprobantePago}
        target="_blank"
        rel="noreferrer"
        className="underline"
      >
        Ver comprobante actual
      </a>
    </p>
  )}

  <Input
    name="comprobantePago"
    type="file"
    accept="application/pdf"
    onChange={(e) => {
      const file = e.currentTarget.files[0];
      formik.setFieldValue("comprobantePago", file);
      if (!file) {
        formik.setFieldValue("fechaPago", ""); // limpia la fecha si se elimina el archivo
      }
    }}
    disabled={formik.isSubmitting}
  />
</div>

      {/* Fecha de pago */}
      <div>
  <p className="text-xs font-medium text-gray-600 mb-1">Fecha de Pago</p>
  <Input
    name="fechaPago"
    type="date"
    value={formik.values.fechaPago}
    onChange={(e) => formik.setFieldValue("fechaPago", e.target.value)}
    onBlur={formik.handleBlur}
    disabled={formik.isSubmitting}
  />
  {formik.touched.fechaPago && formik.errors.fechaPago && (
    <p className="text-sm text-red-500 mt-1">{formik.errors.fechaPago}</p>
  )}
</div>

      {/* Botones */}
      <div className="flex justify-end gap-4 pt-2">
        <Button variant="secondary" onClick={onClose} disabled={formik.isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
};

export default PagexFormModal;
