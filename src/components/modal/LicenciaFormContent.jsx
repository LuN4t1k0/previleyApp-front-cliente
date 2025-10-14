import { useFormik } from "formik";
import * as Yup from "yup";
import isEqual from "lodash/isEqual";
import { TextInput, Button, Select, SelectItem } from "@tremor/react";

import axios from "axios";
import {
  showErrorAlert,
  showInfoAlert,
  showConfirmationAlert,
} from "@/utils/alerts";

import { useEffect, useState } from "react";
import { handleRutChange, handleRutKeyPress } from "@/utils/rutUtils";
import apiService from "@/app/api/apiService";

const validationSchema = Yup.object({
  folio: Yup.string().required("El folio es requerido"),
  empresaRut: Yup.string().required("El RUT de la empresa es requerido"),
  trabajadorRut: Yup.string().required("El RUT del trabajador es requerido"),
  fechaInicio: Yup.date().required("La fecha de inicio es requerida"),
  fechaTermino: Yup.date().required("La fecha de término es requerida"),
});

// Calcular el número de días entre dos fechas
const calculateDays = (start, end) => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const LicenciaForm = ({
  initialData,
  onClose,
  handleSubmit,
  updatePath,
  createPath,
}) => {
  // Verifica si `handleSubmit` es undefined o no es una función
  if (typeof handleSubmit !== "function") {
    console.error(
      "handleSubmit no es una función o está undefined:",
      handleSubmit
    );
  }
  const [empresaOptions, setEmpresaOptions] = useState([]);
  const [originalData, setOriginalData] = useState(initialData || {});
  const [isLoading, setIsLoading] = useState(false);

  // const { handleSubmit } = useCrud("/licencias-medicas/licencias");


  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const response = await apiService.get(`/empresas/`);
        // Desestructuramos para obtener directamente el arreglo
        const { data: empresas } = response.data;
        const options = empresas.map((empresa) => ({
          value: empresa.empresaRut,
          label: empresa.empresaRut,
        }));
        setEmpresaOptions(options);
      } catch (error) {
        showErrorAlert(
          "Error al obtener los RUTs de las empresas",
          error.message
        );
      }
    };
    fetchEmpresas();
  }, []);

  // Actualizar originalData cuando cambia initialData
  useEffect(() => {
    setOriginalData(initialData || {});
  }, [initialData]);

  const formik = useFormik({
    initialValues: {
      folio: initialData?.folio || "",
      empresaRut: initialData?.empresaRut || "",
      trabajadorRut: initialData?.trabajadorRut || "",
      fechaInicio: initialData?.fechaInicio?.split("T")[0] || "", // Asegúrate de que la fecha esté en formato YYYY-MM-DD
      fechaTermino: initialData?.fechaTermino?.split("T")[0] || "", // Mismo ajuste
      numeroDias: initialData
        ? calculateDays(initialData.fechaInicio, initialData.fechaTermino)
        : 0,
    },
    validationSchema,
    enableReinitialize: true,

    onSubmit: async (values) => {
      try {
        await handleSubmit(values, initialData);
        onClose();
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
  });

  // Actualizar numeroDias cuando cambian fechaInicio o fechaTermino
  useEffect(() => {
    if (formik.values.fechaInicio && formik.values.fechaTermino) {
      const days = calculateDays(
        formik.values.fechaInicio,
        formik.values.fechaTermino
      );
      formik.setFieldValue("numeroDias", days);
    }
  }, [formik.values.fechaInicio, formik.values.fechaTermino]);

  // Manejar cierre de la modal con confirmación si hay cambios sin guardar
  const handleClose = async () => {
    if (!isEqual(formik.values, originalData)) {
      const confirm = await showConfirmationAlert(
        "Cambios sin guardar",
        "Tienes cambios no guardados en el formulario. Si sales ahora, perderás estos cambios. ¿Deseas continuar sin guardar?"
      );
      if (confirm) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="grid grid-cols-3 gap-4">
        {/* Campo Folio */}
        <div>
          <label
            className="block text-sm font-medium text-black mb-1"
            htmlFor="folio"
          >
            Folio
          </label>
          <TextInput
            name="folio"
            id="folio"
            placeholder="Ingrese el folio"
            value={formik.values.folio}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.folio && formik.errors.folio}
            aria-describedby="folioError"
          />
          {formik.touched.folio && formik.errors.folio ? (
            <div id="folioError" className="text-red-500 text-sm">
              {formik.errors.folio}
            </div>
          ) : null}
        </div>

        {/* Campo Empresa Rut */}
        <div>
          <label
            className="block text-sm font-medium text-black mb-1"
            htmlFor="empresaRut"
          >
            Empresa Rut
          </label>
          <Select
            name="empresaRut"
            id="empresaRut"
            placeholder="Seleccione RUT de la empresa"
            value={formik.values.empresaRut}
            onValueChange={(value) => formik.setFieldValue("empresaRut", value)}
            onBlur={() => formik.setFieldTouched("empresaRut", true)}
            error={formik.touched.empresaRut && formik.errors.empresaRut}
            aria-describedby="empresaRutError"
          >
            {empresaOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
          {formik.touched.empresaRut && formik.errors.empresaRut ? (
            <div id="empresaRutError" className="text-red-500 text-sm">
              {formik.errors.empresaRut}
            </div>
          ) : null}
        </div>

        {/* Campo RUT del Trabajador */}
        <div>
          <label
            className="block text-sm font-medium text-black mb-1"
            htmlFor="trabajadorRut"
          >
            RUT del Trabajador
          </label>

          <TextInput
            name="trabajadorRut"
            id="trabajadorRut"
            placeholder="Ingrese el RUT del trabajador"
            value={formik.values.trabajadorRut}
            onChange={handleRutChange(formik, "trabajadorRut")}
            onKeyDown={handleRutKeyPress} // Cambiado de onKeyPress a onKeyDown
            onBlur={formik.handleBlur}
            error={formik.touched.trabajadorRut && formik.errors.trabajadorRut}
            aria-describedby="trabajadorRutError"
          />
          {formik.touched.trabajadorRut && formik.errors.trabajadorRut ? (
            <div id="trabajadorRutError" className="text-red-500 text-sm">
              {formik.errors.trabajadorRut}
            </div>
          ) : null}
        </div>

        {/* Campo Fecha de Inicio */}
        <div>
          <label
            className="block text-sm font-medium text-black mb-1"
            htmlFor="fechaInicio"
          >
            Fecha de Inicio
          </label>
          <TextInput
            type="date"
            name="fechaInicio"
            id="fechaInicio"
            value={formik.values.fechaInicio}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.fechaInicio && formik.errors.fechaInicio}
            aria-describedby="fechaInicioError"
          />
          {formik.touched.fechaInicio && formik.errors.fechaInicio ? (
            <div id="fechaInicioError" className="text-red-500 text-sm">
              {formik.errors.fechaInicio}
            </div>
          ) : null}
        </div>

        {/* Campo Fecha de Término */}
        <div>
          <label
            className="block text-sm font-medium text-black mb-1"
            htmlFor="fechaTermino"
          >
            Fecha de Término
          </label>
          <TextInput
            type="date"
            name="fechaTermino"
            id="fechaTermino"
            value={formik.values.fechaTermino}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.fechaTermino && formik.errors.fechaTermino}
            aria-describedby="fechaTerminoError"
          />
          {formik.touched.fechaTermino && formik.errors.fechaTermino ? (
            <div id="fechaTerminoError" className="text-red-500 text-sm">
              {formik.errors.fechaTermino}
            </div>
          ) : null}
        </div>

        {/* Campo Número de Días */}
        <div>
          <label
            className="block text-sm font-medium text-black mb-1"
            htmlFor="numeroDias"
          >
            Número de Días
          </label>
          <TextInput
            type="number"
            name="numeroDias"
            id="numeroDias"
            value={formik.values.numeroDias}
            readOnly
            aria-describedby="numeroDiasError"
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <Button onClick={handleClose} variant="secondary" type="button">
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Cargando..." : initialData ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
};
LicenciaForm.modalSize = "max-w-4xl"; // Define el tamaño aquí


export default LicenciaForm;
