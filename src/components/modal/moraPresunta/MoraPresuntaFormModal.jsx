
"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useRef, useState } from "react";
import { Button, Select, SelectItem, ProgressBar } from "@tremor/react";
import { showErrorAlert } from "@/utils/alerts";
import { Input } from "@/components/ui/input/Input";
import apiService from "@/app/api/apiService";
import { getGestionMoraValidationSchema } from "@/utils/validationSchemas/getValidationSchema";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";

const rutSinPunto = /^\d{1,2}\d{3}\d{3}-[\dkK]$/;

const MoraPresuntaFormModal = ({
  initialData = {},
  handleSubmit,
  fetchData,
  onClose,
}) => {
  const isEditing = Boolean(initialData?.id);
  const hasCertificadoInicial = Boolean(initialData?.certificadoInicial);
  const hasCertificadoFinal = Boolean(initialData?.certificadoFinal);
  const hasComprobantePago = Boolean(initialData?.comprobantePago);

  const validationSchema = getGestionMoraValidationSchema({
    isEditing,
    hasCertificadoInicial,
    hasCertificadoFinal,
    hasComprobantePago,
  });

  const [entidades, setEntidades] = useState([]);
  const [progress, setProgress] = useState(0);
  const [bloquearCamposClave, setBloquearCamposClave] = useState(false);
  const certificadoFinalRef = useRef(null);
  const { empresas: empresasPermitidas, loading: loadingEmpresas } = useEmpresasPermitidas();

  useEffect(() => {
    const fetchEntidades = async () => {
      try {
        const entRes = await apiService.get("/entidades");
        setEntidades(
          (entRes.data.data || []).map((e) => ({
            value: e.id.toString(),
            label: e.nombre,
          }))
        );
      } catch (error) {
        showErrorAlert("Error al cargar entidades", error.message);
      }
    };
    fetchEntidades();
  }, []);

  useEffect(() => {
    const verificarDetalles = async () => {
      if (initialData?.id) {
        try {
          const response = await apiService.get(
            `/detalle-mora/gestion/${initialData.id}/detalles`
          );
          const detalles = response.data.data?.data || [];
          if (detalles.length > 0) {
            setBloquearCamposClave(true);
          }
        } catch (error) {
          console.error("Error verificando detalles:", error);
        }
      }
    };
    verificarDetalles();
  }, [initialData]);

  const formik = useFormik({
    initialValues: {
      empresaRut: initialData.empresaRut || "",
      entidadId: initialData.entidadId?.toString() || "",
      estado: initialData.estado || "analisis",
      fechaGestion: initialData.fechaGestion
        ? new Date(initialData.fechaGestion).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      certificadoInicial: null,
      certificadoFinal: null,
      comprobantePago: null,
      fechaPago: initialData.fechaPago
        ? new Date(initialData.fechaPago).toISOString().split("T")[0]
        : "",
    },
    validationSchema,
    enableReinitialize: true,

    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("empresaRut", values.empresaRut);
      formData.append("entidadId", Number(values.entidadId));
      formData.append("fechaGestion", values.fechaGestion);
      formData.append("estado", values.estado);

      if (values.certificadoInicial) {
        formData.append("initialCert", values.certificadoInicial);
      }
      if (values.certificadoFinal) {
        formData.append("updatedCert", values.certificadoFinal);
      }
      if (values.comprobantePago) {
        formData.append("comprobantePago", values.comprobantePago);
      }
      if (values.fechaPago) {
        formData.append("fechaPago", values.fechaPago);
      }

      try {
        await handleSubmit(formData, initialData);
        fetchData?.();
        onClose();
      } catch (error) {
        console.error("Error en el formulario:", error);
      }
    },
  });

  useEffect(() => {
    const requiredFields = [
      "empresaRut",
      "entidadId",
      "estado",
      "fechaGestion",
      "certificadoInicial",
    ];
    const filled = requiredFields.filter((key) => !!formik.values[key]);
    setProgress(Math.round((filled.length / requiredFields.length) * 100));
  }, [formik.values]);

  return (
<form onSubmit={formik.handleSubmit} className="p-4 space-y-4">

  {/* Título + Progreso */}
  <div className="flex justify-between items-center mb-1">
    <h2 className="text-xl font-bold text-gray-800">
      {isEditing ? "Editar Gestión de Mora" : "Nueva Gestión de Mora"}
    </h2>
    <span className="text-sm text-gray-600">{progress}% completado</span>
  </div>

  <ProgressBar value={progress} color="blue" />

  {/* SECCIÓN: Información General */}
  <h3 className="text-base font-bold text-gray-800 mt-3">Información General</h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
    {/* Empresa */}
    <div>
      <p className="text-xs font-medium text-gray-600 mb-1">Empresa *</p>
      <Select
        value={formik.values.empresaRut}
        onValueChange={(value) => formik.setFieldValue("empresaRut", value)}
        placeholder="Seleccione empresa"
        disabled={bloquearCamposClave || formik.isSubmitting || loadingEmpresas}
      >
        {(empresasPermitidas || [])
          .filter((e) => e && e.empresaRut)
          .map((e) => (
            <SelectItem key={e.empresaRut} value={e.empresaRut}>
              {e.nombre || e.empresaRut}
            </SelectItem>
          ))}
      </Select>
    </div>

    {/* Entidad */}
    <div>
      <p className="text-xs font-medium text-gray-600 mb-1">Entidad *</p>
      <Select
        value={formik.values.entidadId}
        onValueChange={(value) => formik.setFieldValue("entidadId", value)}
        placeholder="Seleccione entidad"
        disabled={bloquearCamposClave || formik.isSubmitting}
      >
        {entidades.map((e) => (
          <SelectItem key={e.value} value={e.value}>
            {e.label}
          </SelectItem>
        ))}
      </Select>
    </div>

    {/* Fecha de gestión */}
    <div>
      <p className="text-xs font-medium text-gray-600 mb-1">Fecha de Gestión *</p>
      <Input
        name="fechaGestion"
        type="date"
        value={formik.values.fechaGestion || ""}
        onChange={(e) => formik.setFieldValue("fechaGestion", e.target.value)}
        onBlur={formik.handleBlur}
        disabled={formik.isSubmitting}
      />
    </div>

    {/* Estado */}
    <div>
      <p className="text-xs font-medium text-gray-600 mb-1">Estado *</p>
      <Select
        value={formik.values.estado}
        onValueChange={(value) => formik.setFieldValue("estado", value)}
        disabled={formik.isSubmitting}
      >
        <SelectItem value="analisis">Análisis</SelectItem>
        <SelectItem value="cerrada">Cerrada</SelectItem>
        <SelectItem value="pendiente">Pendiente</SelectItem>
      </Select>
    </div>
  </div>

  {/* SECCIÓN: Documentos Adjuntos */}
  <h3 className="text-base font-bold text-gray-800 mt-3">Documentos Adjuntos</h3>

  {/* Certificado Inicial */}
  <div>
    <p className="text-xs font-medium text-gray-600 mb-1">
      Certificado Inicial (PDF) – documento que respalda el inicio de la gestión.
    </p>
    {initialData.certificadoInicial && (
      <p className="text-sm text-blue-600 mb-1">
        Archivo actual:{" "}
        <a
          href={initialData.certificadoInicial}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Ver certificado inicial
        </a>
      </p>
    )}
    <Input
      name="certificadoInicial"
      type="file"
      accept="application/pdf"
      onChange={(e) =>
        formik.setFieldValue("certificadoInicial", e.currentTarget.files[0])
      }
      disabled={bloquearCamposClave || formik.isSubmitting}
    />
  </div>

  {/* Certificado Final */}
  <div>
    <p className="text-xs font-medium text-gray-600 mb-1">
      Certificado Final (PDF) – documento de cierre si aplica.
    </p>
    {initialData.certificadoFinal && (
      <p className="text-sm text-blue-600 mb-1">
        Archivo actual:{" "}
        <a
          href={initialData.certificadoFinal}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Ver certificado final
        </a>
      </p>
    )}
    <Input
      name="certificadoFinal"
      type="file"
      accept="application/pdf"
      onChange={(e) =>
        formik.setFieldValue("certificadoFinal", e.currentTarget.files[0])
      }
      ref={certificadoFinalRef}
      disabled={formik.isSubmitting}
    />
  </div>

  {/* Comprobante de Pago */}
  <div>
    <p className="text-xs font-medium text-gray-600 mb-1">
      Comprobante de Pago (PDF) – adjuntar respaldo de pago si corresponde.
    </p>
    {initialData.comprobantePago && (
      <p className="text-sm text-blue-600 mb-1">
        Archivo actual:{" "}
        <a
          href={initialData.comprobantePago}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Ver comprobante de pago
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
          formik.setFieldValue("fechaPago", "");
        }
      }}
      disabled={formik.isSubmitting}
    />
  </div>

  {/* Fecha de Pago */}
  <div>
    <p className="text-xs font-medium text-gray-600 mb-1">Fecha de Pago</p>
    <Input
      name="fechaPago"
      type="date"
      value={formik.values.fechaPago || ""}
      onChange={(e) => formik.setFieldValue("fechaPago", e.target.value)}
      onBlur={formik.handleBlur}
      disabled={formik.isSubmitting}
    />
    {formik.touched.fechaPago && formik.errors.fechaPago && (
      <p className="text-sm text-red-500">{formik.errors.fechaPago}</p>
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

export default MoraPresuntaFormModal;
