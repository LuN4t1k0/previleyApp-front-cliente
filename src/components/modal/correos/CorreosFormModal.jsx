
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextInput, Button, Select, SelectItem } from "@tremor/react";
import apiService from "@/app/api/apiService";
import { showErrorAlert, showConfirmationAlert } from "@/utils/alerts";
import { handleRutChange } from "@/utils/rutUtils";

const getValidationSchema = (isEditMode) =>
  Yup.object().shape({
    empresaRut: Yup.string()
      .matches(/^\d{1,2}\d{3}\d{3}-[0-9kK]{1}$/, "Formato de RUT inválido")
      .required("El RUT es obligatorio"),
    nombreContacto: Yup.string()
      .min(4, "Debe tener al menos 4 caracteres")
      .required("El nombre es obligatorio"),
    tipo: Yup.string().required("El tipo de contacto es obligatorio"),
    email: Yup.string()
      .email("Correo inválido")
      .required("El email es obligatorio"),
  });

const CorreosFormModal = ({ initialData, onClose, refreshData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tiposContacto, setTiposContacto] = useState([]);

  const isEditMode = Boolean(initialData?.id);

  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const res = await apiService.get("/enum/tipo-contacto");
        const opciones = Object.entries(res.data).map(([key, value]) => ({
          value,
          label: value,
        }));
        setTiposContacto(opciones);
      } catch (error) {
        showErrorAlert("Error al obtener tipos de contacto", error.message);
      }
    };

    fetchEnums();
  }, []);

  const formik = useFormik({
    initialValues: {
      empresaRut: initialData?.empresaRut || "",
      nombreContacto: initialData?.nombreContacto || "",
      tipo: initialData?.tipo || "",
      email: initialData?.email || "",
    },
    validationSchema: getValidationSchema(isEditMode),
    enableReinitialize: true,
    // onSubmit: async (values) => {
    //   try {
    //     setIsLoading(true);
    //     const cleanValues = { ...values };
    //     if (isEditMode) {
    //       await apiService.patch(
    //         `/empresa-correos/${initialData.id}`,
    //         cleanValues
    //       );
    //     } else {
    //       await apiService.post("/empresa-correos/", cleanValues);
    //     }

    //     await refreshData();
    //     onClose();
    //   } catch (error) {
    //     showErrorAlert("Error al guardar el contacto", error.message);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // },
    onSubmit: async (values) => {
  try {
    setIsLoading(true);
    const cleanValues = { ...values };

    if (isEditMode) {
      delete cleanValues.empresaRut; 
      await apiService.patch(
        `/empresa-correos/${initialData.id}`,
        cleanValues
      );
    } else {
      await apiService.post("/empresa-correos/", cleanValues);
    }

    await refreshData();
    onClose();
  } catch (error) {
    showErrorAlert("Error al guardar el contacto", error.message);
  } finally {
    setIsLoading(false);
  }
},

  });

  const handleClose = async () => {
    const confirm = await showConfirmationAlert(
      "Cambios sin guardar",
      "¿Deseas salir sin guardar?"
    );
    if (confirm) onClose();
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">
        {isEditMode ? "Editar Contacto Empresa" : "Nuevo Contacto Empresa"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
        {/* RUT */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">RUT Empresa</p>
          <TextInput
            name="empresaRut"
            placeholder="Ej: 11111111-1"
            {...formik.getFieldProps("empresaRut")}
            onChange={handleRutChange(formik, "empresaRut")}
            disabled={isEditMode || isLoading}
          />
          {formik.touched.empresaRut && formik.errors.empresaRut && (
            <p className="text-red-500 text-xs mt-1">
              {formik.errors.empresaRut}
            </p>
          )}
        </div>

        {/* Nombre contacto */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Nombre Contacto</p>
          <TextInput
            name="nombreContacto"
            placeholder="Ej: Juan Pérez"
            {...formik.getFieldProps("nombreContacto")}
            disabled={isLoading}
          />
          {formik.touched.nombreContacto && formik.errors.nombreContacto && (
            <p className="text-red-500 text-xs mt-1">
              {formik.errors.nombreContacto}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Email</p>
          <TextInput
            name="email"
            placeholder="Ej: contacto@empresa.cl"
            {...formik.getFieldProps("email")}
            disabled={isLoading}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
          )}
        </div>

        {/* Tipo contacto */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Tipo de contacto</p>
          <Select
            value={formik.values.tipo}
            onValueChange={(value) => formik.setFieldValue("tipo", value)}
            disabled={isLoading}
          >
            <SelectItem value="">Seleccione tipo</SelectItem>
            {tiposContacto.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </Select>
          {formik.touched.tipo && formik.errors.tipo && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.tipo}</p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="pt-3 flex justify-end space-x-4">
        <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button color="blue" onClick={formik.handleSubmit} disabled={isLoading}>
          {isLoading ? "Guardando..." : isEditMode ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </div>
  );
};

export default CorreosFormModal;
