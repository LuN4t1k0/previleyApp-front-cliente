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

const validationSchema = Yup.object({
  empleador: Yup.string().required("El empleador es requerido"),
  empresaRut: Yup.string().required("El RUT de la empresa es requerido"),
  folio: Yup.string().required("El folio es requerido"),
  sucursal: Yup.string().nullable(),
  fechaOtorgamiento: Yup.date().required("La fecha de otorgamiento es requerida"),
  entidadPronuncia: Yup.string().required("La entidad pronuncia es requerida"),
  tipoLicencia: Yup.string().required("El tipo de licencia es requerido"),
  rutTrabajador: Yup.string().nullable(),
  telefonoTrabajador: Yup.string().nullable(),
  nombreTrabajador: Yup.string().nullable(),
  edadTrabajador: Yup.number().nullable(),
  sexoTrabajador: Yup.string().nullable(),
  nombreProfesional: Yup.string().nullable(),
  rutProfesional: Yup.string().required("El RUT del profesional es requerido"),
  direccionProfesional: Yup.string().nullable(),
  telefonoProfesional: Yup.string().nullable(),
  especialidad: Yup.string().required("La especialidad es requerida"),
  tipoReposo: Yup.string().required("El tipo de reposo es requerido"),
  lugarReposo: Yup.string().required("El lugar de reposo es requerido"),
  direccionReposo: Yup.string().nullable(),
  estadoLicencia: Yup.string().required("El estado de la licencia es requerido"),
  motivoAnulacion: Yup.string().nullable(),
  motivoRechazo: Yup.string().nullable(),
  motivoDevolucion: Yup.string().nullable(),
  fechaInicio: Yup.date().required("La fecha de inicio es requerida"),
  numeroDias: Yup.number().required("El número de días es requerido"),
  fechaTermino: Yup.date().required("La fecha de término es requerida"),
  fechaUltimaModificacion: Yup.date().nullable(),
  fechaRecepcion: Yup.date().nullable(),
  montoAnticipo: Yup.number().nullable().default(0),
  montoSubsidio: Yup.number().nullable().default(0),
  montoDiferencia: Yup.number().nullable().default(0),
});

const DemoModal = ({ isOpen, setIsOpen, onSubmit, initialData }) => {
  const [empresaOptions, setEmpresaOptions] = useState([]);
  const [originalData, setOriginalData] = useState(initialData || {});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/empresas`);
        const empresas = response.data;
        const options = empresas.map((empresa) => ({
          value: empresa.empresaRut,
          label: empresa.empresaRut,
        }));
        setEmpresaOptions(options);
      } catch (error) {
        showErrorAlert("Error al obtener los RUTs de las empresas", error.message);
      }
    };
    fetchEmpresas();
  }, []);

  useEffect(() => {
    setOriginalData(initialData || {});
  }, [initialData]);

  const formik = useFormik({
    initialValues: {
      empleador: "",
      empresaRut: "",
      folio: "",
      sucursal: "",
      fechaOtorgamiento: "",
      entidadPronuncia: "",
      tipoLicencia: "",
      rutTrabajador: "",
      telefonoTrabajador: "",
      nombreTrabajador: "",
      edadTrabajador: "",
      sexoTrabajador: "",
      nombreProfesional: "",
      rutProfesional: "",
      direccionProfesional: "",
      telefonoProfesional: "",
      especialidad: "",
      tipoReposo: "",
      lugarReposo: "",
      direccionReposo: "",
      estadoLicencia: "",
      motivoAnulacion: "",
      motivoRechazo: "",
      motivoDevolucion: "",
      fechaInicio: "",
      numeroDias: "",
      fechaTermino: "",
      fechaUltimaModificacion: "",
      fechaRecepcion: "",
      montoAnticipo: "",
      montoSubsidio: "",
      montoDiferencia: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        if (isEqual(values, originalData)) {
          showInfoAlert(
            "Sin cambios realizados",
            "Los datos no han sido modificados desde su última actualización. No se realizaron cambios."
          );
        } else {
          await onSubmit(values);
          setIsOpen(false);
        }
      } catch (error) {
        showErrorAlert("Error", error.message);
      } finally {
        setIsLoading(false);
      }
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (isOpen && !initialData) {
      formik.resetForm();
    } else if (isOpen && initialData) {
      formik.setValues(initialData);
    }
  }, [isOpen, initialData]);

  const handleClose = async () => {
    if (!isEqual(formik.values, originalData)) {
      const confirm = await showConfirmationAlert(
        "Cambios sin guardar",
        "Tienes cambios no guardados en el formulario. Si sales ahora, perderás estos cambios. ¿Deseas continuar sin guardar?"
      );
      if (confirm) {
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      static={true}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden bg-gray-900 bg-opacity-75"
    >
      <DialogPanel className="max-w-7xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {initialData ? "Editar Licencia Médica" : "Agregar Licencia Médica"}
          </h3>
          <button onClick={handleClose} aria-label="Close">
            <RiCloseLine className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <form onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="empleador">Empleador</label>
              <TextInput
                name="empleador"
                id="empleador"
                placeholder="Ingrese el empleador"
                value={formik.values.empleador}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.empleador && formik.errors.empleador}
                aria-describedby="empleadorError"
              />
              {formik.touched.empleador && formik.errors.empleador ? (
                <div id="empleadorError" className="text-red-500 text-sm">
                  {formik.errors.empleador}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="empresaRut">Empresa Rut</label>
              <Select
                name="empresaRut"
                id="empresaRut"
                placeholder="Seleccione RUT de la empresa"
                value={formik.values.empresaRut}
                onChange={(value) => formik.setFieldValue("empresaRut", value)}
                onBlur={() => formik.setFieldTouched("empresaRut", true)}
                error={formik.touched.empresaRut && formik.errors.empresaRut}
                aria-describedby="empresaRutError"
              >
                {empresaOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.empresaRut}
                  </SelectItem>
                ))}
              </Select>
              {formik.touched.empresaRut && formik.errors.empresaRut ? (
                <div id="empresaRutError" className="text-red-500 text-sm">
                  {formik.errors.empresaRut}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="folio">Folio</label>
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
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="sucursal">Sucursal</label>
              <TextInput
                name="sucursal"
                id="sucursal"
                placeholder="Ingrese la sucursal"
                value={formik.values.sucursal}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.sucursal && formik.errors.sucursal}
                aria-describedby="sucursalError"
              />
              {formik.touched.sucursal && formik.errors.sucursal ? (
                <div id="sucursalError" className="text-red-500 text-sm">
                  {formik.errors.sucursal}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="fechaOtorgamiento">Fecha de Otorgamiento</label>
              <input
                type="date"
                name="fechaOtorgamiento"
                id="fechaOtorgamiento"
                placeholder="Seleccione la fecha de otorgamiento"
                value={formik.values.fechaOtorgamiento}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border rounded p-2 w-full"
                aria-describedby="fechaOtorgamientoError"
              />
              {formik.touched.fechaOtorgamiento && formik.errors.fechaOtorgamiento ? (
                <div id="fechaOtorgamientoError" className="text-red-500 text-sm">
                  {formik.errors.fechaOtorgamiento}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="entidadPronuncia">Entidad Pronuncia</label>
              <TextInput
                name="entidadPronuncia"
                id="entidadPronuncia"
                placeholder="Ingrese la entidad que pronuncia"
                value={formik.values.entidadPronuncia}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.entidadPronuncia && formik.errors.entidadPronuncia}
                aria-describedby="entidadPronunciaError"
              />
              {formik.touched.entidadPronuncia && formik.errors.entidadPronuncia ? (
                <div id="entidadPronunciaError" className="text-red-500 text-sm">
                  {formik.errors.entidadPronuncia}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="tipoLicencia">Tipo de Licencia</label>
              <TextInput
                name="tipoLicencia"
                id="tipoLicencia"
                placeholder="Ingrese el tipo de licencia"
                value={formik.values.tipoLicencia}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.tipoLicencia && formik.errors.tipoLicencia}
                aria-describedby="tipoLicenciaError"
              />
              {formik.touched.tipoLicencia && formik.errors.tipoLicencia ? (
                <div id="tipoLicenciaError" className="text-red-500 text-sm">
                  {formik.errors.tipoLicencia}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="rutTrabajador">RUT del Trabajador</label>
              <TextInput
                name="rutTrabajador"
                id="rutTrabajador"
                placeholder="Ingrese el RUT del trabajador"
                value={formik.values.rutTrabajador}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.rutTrabajador && formik.errors.rutTrabajador}
                aria-describedby="rutTrabajadorError"
              />
              {formik.touched.rutTrabajador && formik.errors.rutTrabajador ? (
                <div id="rutTrabajadorError" className="text-red-500 text-sm">
                  {formik.errors.rutTrabajador}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="telefonoTrabajador">Teléfono del Trabajador</label>
              <TextInput
                name="telefonoTrabajador"
                id="telefonoTrabajador"
                placeholder="Ingrese el teléfono del trabajador"
                value={formik.values.telefonoTrabajador}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.telefonoTrabajador && formik.errors.telefonoTrabajador}
                aria-describedby="telefonoTrabajadorError"
              />
              {formik.touched.telefonoTrabajador && formik.errors.telefonoTrabajador ? (
                <div id="telefonoTrabajadorError" className="text-red-500 text-sm">
                  {formik.errors.telefonoTrabajador}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="nombreTrabajador">Nombre del Trabajador</label>
              <TextInput
                name="nombreTrabajador"
                id="nombreTrabajador"
                placeholder="Ingrese el nombre del trabajador"
                value={formik.values.nombreTrabajador}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.nombreTrabajador && formik.errors.nombreTrabajador}
                aria-describedby="nombreTrabajadorError"
              />
              {formik.touched.nombreTrabajador && formik.errors.nombreTrabajador ? (
                <div id="nombreTrabajadorError" className="text-red-500 text-sm">
                  {formik.errors.nombreTrabajador}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="edadTrabajador">Edad del Trabajador</label>
              <TextInput
                name="edadTrabajador"
                id="edadTrabajador"
                placeholder="Ingrese la edad del trabajador"
                value={formik.values.edadTrabajador}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.edadTrabajador && formik.errors.edadTrabajador}
                aria-describedby="edadTrabajadorError"
              />
              {formik.touched.edadTrabajador && formik.errors.edadTrabajador ? (
                <div id="edadTrabajadorError" className="text-red-500 text-sm">
                  {formik.errors.edadTrabajador}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="sexoTrabajador">Sexo del Trabajador</label>
              <TextInput
                name="sexoTrabajador"
                id="sexoTrabajador"
                placeholder="Ingrese el sexo del trabajador"
                value={formik.values.sexoTrabajador}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.sexoTrabajador && formik.errors.sexoTrabajador}
                aria-describedby="sexoTrabajadorError"
              />
              {formik.touched.sexoTrabajador && formik.errors.sexoTrabajador ? (
                <div id="sexoTrabajadorError" className="text-red-500 text-sm">
                  {formik.errors.sexoTrabajador}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="nombreProfesional">Nombre del Profesional</label>
              <TextInput
                name="nombreProfesional"
                id="nombreProfesional"
                placeholder="Ingrese el nombre del profesional"
                value={formik.values.nombreProfesional}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.nombreProfesional && formik.errors.nombreProfesional}
                aria-describedby="nombreProfesionalError"
              />
              {formik.touched.nombreProfesional && formik.errors.nombreProfesional ? (
                <div id="nombreProfesionalError" className="text-red-500 text-sm">
                  {formik.errors.nombreProfesional}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="rutProfesional">RUT del Profesional</label>
              <TextInput
                name="rutProfesional"
                id="rutProfesional"
                placeholder="Ingrese el RUT del profesional"
                value={formik.values.rutProfesional}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.rutProfesional && formik.errors.rutProfesional}
                aria-describedby="rutProfesionalError"
              />
              {formik.touched.rutProfesional && formik.errors.rutProfesional ? (
                <div id="rutProfesionalError" className="text-red-500 text-sm">
                  {formik.errors.rutProfesional}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="direccionProfesional">Dirección del Profesional</label>
              <TextInput
                name="direccionProfesional"
                id="direccionProfesional"
                placeholder="Ingrese la dirección del profesional"
                value={formik.values.direccionProfesional}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.direccionProfesional && formik.errors.direccionProfesional}
                aria-describedby="direccionProfesionalError"
              />
              {formik.touched.direccionProfesional && formik.errors.direccionProfesional ? (
                <div id="direccionProfesionalError" className="text-red-500 text-sm">
                  {formik.errors.direccionProfesional}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="telefonoProfesional">Teléfono del Profesional</label>
              <TextInput
                name="telefonoProfesional"
                id="telefonoProfesional"
                placeholder="Ingrese el teléfono del profesional"
                value={formik.values.telefonoProfesional}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.telefonoProfesional && formik.errors.telefonoProfesional}
                aria-describedby="telefonoProfesionalError"
              />
              {formik.touched.telefonoProfesional && formik.errors.telefonoProfesional ? (
                <div id="telefonoProfesionalError" className="text-red-500 text-sm">
                  {formik.errors.telefonoProfesional}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="especialidad">Especialidad</label>
              <TextInput
                name="especialidad"
                id="especialidad"
                placeholder="Ingrese la especialidad"
                value={formik.values.especialidad}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.especialidad && formik.errors.especialidad}
                aria-describedby="especialidadError"
              />
              {formik.touched.especialidad && formik.errors.especialidad ? (
                <div id="especialidadError" className="text-red-500 text-sm">
                  {formik.errors.especialidad}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="tipoReposo">Tipo de Reposo</label>
              <TextInput
                name="tipoReposo"
                id="tipoReposo"
                placeholder="Ingrese el tipo de reposo"
                value={formik.values.tipoReposo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.tipoReposo && formik.errors.tipoReposo}
                aria-describedby="tipoReposoError"
              />
              {formik.touched.tipoReposo && formik.errors.tipoReposo ? (
                <div id="tipoReposoError" className="text-red-500 text-sm">
                  {formik.errors.tipoReposo}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="lugarReposo">Lugar de Reposo</label>
              <TextInput
                name="lugarReposo"
                id="lugarReposo"
                placeholder="Ingrese el lugar de reposo"
                value={formik.values.lugarReposo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lugarReposo && formik.errors.lugarReposo}
                aria-describedby="lugarReposoError"
              />
              {formik.touched.lugarReposo && formik.errors.lugarReposo ? (
                <div id="lugarReposoError" className="text-red-500 text-sm">
                  {formik.errors.lugarReposo}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="direccionReposo">Dirección de Reposo</label>
              <TextInput
                name="direccionReposo"
                id="direccionReposo"
                placeholder="Ingrese la dirección de reposo"
                value={formik.values.direccionReposo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.direccionReposo && formik.errors.direccionReposo}
                aria-describedby="direccionReposoError"
              />
              {formik.touched.direccionReposo && formik.errors.direccionReposo ? (
                <div id="direccionReposoError" className="text-red-500 text-sm">
                  {formik.errors.direccionReposo}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="estadoLicencia">Estado de la Licencia</label>
              <TextInput
                name="estadoLicencia"
                id="estadoLicencia"
                placeholder="Ingrese el estado de la licencia"
                value={formik.values.estadoLicencia}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.estadoLicencia && formik.errors.estadoLicencia}
                aria-describedby="estadoLicenciaError"
              />
              {formik.touched.estadoLicencia && formik.errors.estadoLicencia ? (
                <div id="estadoLicenciaError" className="text-red-500 text-sm">
                  {formik.errors.estadoLicencia}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="motivoAnulacion">Motivo de Anulación</label>
              <TextInput
                name="motivoAnulacion"
                id="motivoAnulacion"
                placeholder="Ingrese el motivo de anulación"
                value={formik.values.motivoAnulacion}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.motivoAnulacion && formik.errors.motivoAnulacion}
                aria-describedby="motivoAnulacionError"
              />
              {formik.touched.motivoAnulacion && formik.errors.motivoAnulacion ? (
                <div id="motivoAnulacionError" className="text-red-500 text-sm">
                  {formik.errors.motivoAnulacion}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="motivoRechazo">Motivo de Rechazo</label>
              <TextInput
                name="motivoRechazo"
                id="motivoRechazo"
                placeholder="Ingrese el motivo de rechazo"
                value={formik.values.motivoRechazo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.motivoRechazo && formik.errors.motivoRechazo}
                aria-describedby="motivoRechazoError"
              />
              {formik.touched.motivoRechazo && formik.errors.motivoRechazo ? (
                <div id="motivoRechazoError" className="text-red-500 text-sm">
                  {formik.errors.motivoRechazo}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="motivoDevolucion">Motivo de Devolución</label>
              <TextInput
                name="motivoDevolucion"
                id="motivoDevolucion"
                placeholder="Ingrese el motivo de devolución"
                value={formik.values.motivoDevolucion}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.motivoDevolucion && formik.errors.motivoDevolucion}
                aria-describedby="motivoDevolucionError"
              />
              {formik.touched.motivoDevolucion && formik.errors.motivoDevolucion ? (
                <div id="motivoDevolucionError" className="text-red-500 text-sm">
                  {formik.errors.motivoDevolucion}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="fechaInicio">Fecha de Inicio</label>
              <input
                type="date"
                name="fechaInicio"
                id="fechaInicio"
                placeholder="Seleccione la fecha de inicio"
                value={formik.values.fechaInicio}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border rounded p-2 w-full"
                aria-describedby="fechaInicioError"
              />
              {formik.touched.fechaInicio && formik.errors.fechaInicio ? (
                <div id="fechaInicioError" className="text-red-500 text-sm">
                  {formik.errors.fechaInicio}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="numeroDias">Número de Días</label>
              <TextInput
                name="numeroDias"
                id="numeroDias"
                placeholder="Ingrese el número de días"
                value={formik.values.numeroDias}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.numeroDias && formik.errors.numeroDias}
                aria-describedby="numeroDiasError"
              />
              {formik.touched.numeroDias && formik.errors.numeroDias ? (
                <div id="numeroDiasError" className="text-red-500 text-sm">
                  {formik.errors.numeroDias}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="fechaTermino">Fecha de Término</label>
              <input
                type="date"
                name="fechaTermino"
                id="fechaTermino"
                placeholder="Seleccione la fecha de término"
                value={formik.values.fechaTermino}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border rounded p-2 w-full"
                aria-describedby="fechaTerminoError"
              />
              {formik.touched.fechaTermino && formik.errors.fechaTermino ? (
                <div id="fechaTerminoError" className="text-red-500 text-sm">
                  {formik.errors.fechaTermino}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="fechaUltimaModificacion">Fecha de Última Modificación</label>
              <input
                type="date"
                name="fechaUltimaModificacion"
                id="fechaUltimaModificacion"
                placeholder="Seleccione la fecha de última modificación"
                value={formik.values.fechaUltimaModificacion}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border rounded p-2 w-full"
                aria-describedby="fechaUltimaModificacionError"
              />
              {formik.touched.fechaUltimaModificacion && formik.errors.fechaUltimaModificacion ? (
                <div id="fechaUltimaModificacionError" className="text-red-500 text-sm">
                  {formik.errors.fechaUltimaModificacion}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="fechaRecepcion">Fecha de Recepción</label>
              <input
                type="date"
                name="fechaRecepcion"
                id="fechaRecepcion"
                placeholder="Seleccione la fecha de recepción"
                value={formik.values.fechaRecepcion}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border rounded p-2 w-full"
                aria-describedby="fechaRecepcionError"
              />
              {formik.touched.fechaRecepcion && formik.errors.fechaRecepcion ? (
                <div id="fechaRecepcionError" className="text-red-500 text-sm">
                  {formik.errors.fechaRecepcion}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="montoAnticipo">Monto Anticipo</label>
              <TextInput
                name="montoAnticipo"
                id="montoAnticipo"
                placeholder="Ingrese el monto de anticipo"
                value={formik.values.montoAnticipo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.montoAnticipo && formik.errors.montoAnticipo}
                aria-describedby="montoAnticipoError"
              />
              {formik.touched.montoAnticipo && formik.errors.montoAnticipo ? (
                <div id="montoAnticipoError" className="text-red-500 text-sm">
                  {formik.errors.montoAnticipo}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="montoSubsidio">Monto Subsidio</label>
              <TextInput
                name="montoSubsidio"
                id="montoSubsidio"
                placeholder="Ingrese el monto del subsidio"
                value={formik.values.montoSubsidio}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.montoSubsidio && formik.errors.montoSubsidio}
                aria-describedby="montoSubsidioError"
              />
              {formik.touched.montoSubsidio && formik.errors.montoSubsidio ? (
                <div id="montoSubsidioError" className="text-red-500 text-sm">
                  {formik.errors.montoSubsidio}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1" htmlFor="montoDiferencia">Monto Diferencia</label>
              <TextInput
                name="montoDiferencia"
                id="montoDiferencia"
                placeholder="Ingrese el monto de la diferencia"
                value={formik.values.montoDiferencia}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.montoDiferencia && formik.errors.montoDiferencia}
                aria-describedby="montoDiferenciaError"
              />
              {formik.touched.montoDiferencia && formik.errors.montoDiferencia ? (
                <div id="montoDiferenciaError" className="text-red-500 text-sm">
                  {formik.errors.montoDiferencia}
                </div>
              ) : null}
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
      </DialogPanel>
    </Dialog>
  );
};

export default DemoModal;
