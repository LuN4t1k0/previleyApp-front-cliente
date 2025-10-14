// src/components/modal/LicenciaForm.jsx

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import isEqual from "lodash/isEqual";
import {
  Dialog,
  DialogPanel,
  TextInput,
  Button,
  Select,
  SelectItem,
} from "@tremor/react";
import { RiCloseLine } from "@remixicon/react";
import axios from "axios";
import {
  showErrorAlert,
  showInfoAlert,
  showConfirmationAlert,
} from "@/utils/alerts";
import { useCrud } from "@/hooks/useCrud";

const validationSchema = Yup.object({
  folio: Yup.string().required("El folio es requerido"),
  empresaRut: Yup.string().required("El RUT de la empresa es requerido"),
  rutTrabajador: Yup.string().required("El RUT del trabajador es requerido"),
  fechaInicio: Yup.date().required("La fecha de inicio es requerida"),
  fechaTermino: Yup.date().required("La fecha de término es requerida"),
});

const LicenciaForm = ({ initialData, onClose }) => {
  const [empresaOptions, setEmpresaOptions] = useState([]);
  const [originalData, setOriginalData] = useState(initialData || {});
  const [isLoading, setIsLoading] = useState(false);

  const { handleSubmit } = useCrud("/licencias-medicas/licencias"); // Ajusta el endpoint según sea necesario

  // Obtener las opciones de empresas
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/empresas`
        );
        const empresas = response.data;
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
      rutTrabajador: initialData?.rutTrabajador || "",
      fechaInicio: initialData?.fechaInicio || "",
      fechaTermino: initialData?.fechaTermino || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        if (isEqual(values, originalData)) {
          showInfoAlert(
            "Sin cambios realizados",
            "Los datos no han sido modificados desde su última actualización. No se realizaron cambios."
          );
        } else {
          await handleSubmit(values, initialData); // Pasar initialData para distinguir entre crear y editar
          onClose(); // Cerrar la modal después de guardar
        }
      } catch (error) {
        showErrorAlert("Error", error.message);
      } finally {
        setIsLoading(false);
      }
    },
  });

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
    <Dialog
      open={true} // Siempre abierto, ya que el ModalManager controla su renderización
      onClose={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden bg-gray-900 bg-opacity-75"
    >
      <DialogPanel className="max-w-7xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {initialData ? "Editar Licencia" : "Agregar Licencia"}
          </h3>
          <button onClick={handleClose} aria-label="Cerrar">
            <RiCloseLine className="h-6 w-6 text-gray-500" />
          </button>
        </div>
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
                onValueChange={(value) =>
                  formik.setFieldValue("empresaRut", value)
                }
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
                htmlFor="rutTrabajador"
              >
                RUT del Trabajador
              </label>
              <TextInput
                name="rutTrabajador"
                id="rutTrabajador"
                placeholder="Ingrese el RUT del trabajador"
                value={formik.values.rutTrabajador}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.rutTrabajador && formik.errors.rutTrabajador
                }
                aria-describedby="rutTrabajadorError"
              />
              {formik.touched.rutTrabajador && formik.errors.rutTrabajador ? (
                <div id="rutTrabajadorError" className="text-red-500 text-sm">
                  {formik.errors.rutTrabajador}
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
              <input
                type="date"
                name="fechaInicio"
                id="fechaInicio"
                value={formik.values.fechaInicio}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`border rounded p-2 w-full ${
                  formik.touched.fechaInicio && formik.errors.fechaInicio
                    ? "border-red-500"
                    : ""
                }`}
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
              <input
                type="date"
                name="fechaTermino"
                id="fechaTermino"
                value={formik.values.fechaTermino}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`border rounded p-2 w-full ${
                  formik.touched.fechaTermino && formik.errors.fechaTermino
                    ? "border-red-500"
                    : ""
                }`}
                aria-describedby="fechaTerminoError"
              />
              {formik.touched.fechaTermino && formik.errors.fechaTermino ? (
                <div id="fechaTerminoError" className="text-red-500 text-sm">
                  {formik.errors.fechaTermino}
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <Button onClick={handleClose} variant="secondary" type="button">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading
                ? "Cargando..."
                : initialData
                ? "Actualizar"
                : "Crear"}
            </Button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
};

export default LicenciaForm;
