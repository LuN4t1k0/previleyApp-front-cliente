import React, { useState, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextInput, Button, Select, SelectItem } from "@tremor/react";
import apiService from "@/app/api/apiService";
import { showErrorAlert } from "@/utils/alerts";
import { handleRutChange } from "@/utils/rutUtils";

// Helper para formatear período mientras se escribe
const handlePeriodoChange = (formik, fieldName) => (e) => {
  let val = e.target.value.replace(/[^\d]/g, "");
  if (val.length > 2) {
    val = `${val.slice(0, 2)}/${val.slice(2, 6)}`;
  }
  formik.setFieldValue(fieldName, val);
};

const GenericForm = ({ config, initialData, onClose, fetchData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectOptions, setSelectOptions] = useState({});
  const isEditMode = Boolean(initialData?.id);

  // 1. GENERACIÓN DINÁMICA DE VALORES INICIALES Y VALIDACIÓN
  const { initialValues, validationSchema } = useMemo(() => {
    const initialValues = {};
    const validationSchemaFields = {};

    config.fields.forEach((field) => {
      let value = initialData?.[field.name] || field.initialValue || "";

      // Aplicar transformación de entrada (ej: API -> Formato visible)
      if (field.transform?.incoming && value) {
        value = field.transform.incoming(value);
      }

      // Formatear fechas para el input type="date"
      if (field.type === 'date' && value) {
        value = new Date(value).toISOString().split("T")[0];
      }

      initialValues[field.name] = value;

      if (field.validation) {
        validationSchemaFields[field.name] = field.validation;
      }
    });

    const schema = typeof config.validationSchema === 'function'
      ? config.validationSchema(isEditMode)
      : Yup.object().shape(validationSchemaFields);

    return {
      initialValues,
      validationSchema: schema,
    };
  }, [config.fields, config.validationSchema, initialData, isEditMode]);

  // 2. CARGA DINÁMICA DE DATOS PARA LOS SELECTS
  useEffect(() => {
    const fetchSelectOptions = async () => {
      const endpoints = config.fields
        .filter((field) => field.type === "select" && field.optionsEndpoint)
        .map((field) => ({
          name: field.name,
          endpoint: field.optionsEndpoint,
          transformer: field.optionsTransformer,
        }));

      if (endpoints.length === 0) return;

      try {
        const responses = await Promise.all(
          endpoints.map((ep) => apiService.get(ep.endpoint))
        );

        const options = {};
        responses.forEach((res, index) => {
          const fieldName = endpoints[index].name;
          const transformer = endpoints[index].transformer;

          let data = [];
          if (transformer) {
            data = transformer(res);
          } else {
            data = Object.entries(res.data).map(([key, value]) => ({
              value: value,
              label: value,
            }));
          }
          options[fieldName] = data;
        });
        setSelectOptions(options);
      } catch (error) {
        showErrorAlert("Error al cargar opciones del formulario", error.message);
      }
    };
    fetchSelectOptions();
  }, [config.fields]);

  // 3. CONFIGURACIÓN DE FORMIK
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);

        const hasFile = config.fields.some(f => f.type === 'file');
        let dataToSend;

        if (hasFile) {
          dataToSend = new FormData();
          for (const key in values) {
            const fieldConfig = config.fields.find(f => f.name === key);
            let value = values[key];

            if (fieldConfig?.transform?.outgoing && value) {
              value = fieldConfig.transform.outgoing(value);
            }
            
            if (value !== null && value !== undefined) {
              dataToSend.append(key, value);
            }
          }
        } else {
          dataToSend = { ...values };
          for (const key in dataToSend) {
            const fieldConfig = config.fields.find(f => f.name === key);
            if (fieldConfig?.transform?.outgoing && dataToSend[key]) {
              dataToSend[key] = fieldConfig.transform.outgoing(dataToSend[key]);
            }
          }
        }

        const endpoint = isEditMode
          ? config.updateEndpoint(initialData.id)
          : config.createEndpoint;
        const method = isEditMode ? (hasFile ? "post" : "patch") : "post";

        await apiService[method](endpoint, dataToSend);

        // --- CORRECCIÓN APLICADA AQUÍ ---
        // Se comprueba si fetchData es una función antes de ejecutarla.
        // Esto hace que la prop sea opcional y evita que la aplicación se rompa.
        if (typeof fetchData === 'function') {
          await fetchData();
        }
        
        onClose();
      } catch (error) {
        const apiMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "No se pudo completar la solicitud.";
        showErrorAlert("Error al guardar", apiMessage);
        console.error("[GenericForm] error al guardar:", error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // HOOK PARA CAMPOS CALCULADOS (SINCRÓNICOS)
  useEffect(() => {
    const derivedFields = config.fields.filter(field => field.derivedValue);
    if (derivedFields.length === 0) return;

    derivedFields.forEach(field => {
      const { name, derivedValue } = field;
      const { calculate } = derivedValue;

      const currentValue = formik.values[name];
      const newValue = calculate(formik.values);

      if (currentValue !== newValue) {
        formik.setFieldValue(name, newValue);
      }
    });
  }, [formik.values, formik.setFieldValue, config.fields]);


  // 4. RENDERIZADO DINÁMICO DE CAMPOS
  const renderField = (field) => {
    const error = formik.touched[field.name] && formik.errors[field.name];
    const isDisabled = (field.disabled === true || (typeof field.disabled === 'function' && field.disabled(isEditMode))) || isLoading;

    // --- NUEVA FUNCIÓN GENÉRICA PARA MANEJAR CAMBIOS Y EFECTOS ---
    const handleChange = (value) => {
      formik.setFieldValue(field.name, value);
      if (field.effects?.onChange) {
        field.effects.onChange({ value, formik, selectOptions });
      }
    };

    return (
      <div key={field.name}>
        <p className="text-xs font-medium text-gray-600 mb-1">{field.label}</p>
        {(() => {
          switch (field.type) {
            case "select":
              return (
                <Select
                  value={formik.values[field.name]}
                  onValueChange={handleChange} // Usamos el nuevo handler
                  disabled={isDisabled}
                  placeholder={field.placeholder || "Seleccione una opción"}
                >
                  {(selectOptions[field.name] || []).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              );

            case "rut":
              return (
                <TextInput
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formik.values[field.name]}
                  // Combinamos el handler de RUT con el de efectos
                  onChange={(e) => {
                    handleRutChange(formik, field.name)(e);
                    if (field.effects?.onChange) {
                      field.effects.onChange({ value: e.target.value, formik, selectOptions });
                    }
                  }}
                  disabled={isDisabled}
                />
              );

            case "date":
              return (
                 <TextInput
                   name={field.name}
                   type="date"
                   value={formik.values[field.name]}
                   onChange={(e) => handleChange(e.target.value)} // Usamos el nuevo handler
                   disabled={isDisabled}
                 />
              );

            case "periodo":
              return (
                 <TextInput
                   name={field.name}
                   type="text"
                   inputMode="numeric"
                   placeholder={field.placeholder}
                   value={formik.values[field.name]}
                   // Combinamos el handler de período con el de efectos
                   onChange={(e) => {
                      handlePeriodoChange(formik, field.name)(e);
                      if (field.effects?.onChange) {
                        field.effects.onChange({ value: e.target.value, formik, selectOptions });
                      }
                   }}
                   onBlur={formik.handleBlur}
                   disabled={isDisabled}
                 />
              );

            case "file":
              return(
                <>
                  {initialData?.[field.name] && (
                    <p className="text-sm text-blue-600 mb-1">
                      <a href={initialData[field.name]} target="_blank" rel="noreferrer" className="underline">
                        Ver archivo actual
                      </a>
                    </p>
                  )}
                  <TextInput
                    name={field.name}
                    type="file"
                    accept={field.accept}
                    onChange={(e) => handleChange(e.currentTarget.files[0])} // Usamos el nuevo handler
                    disabled={isDisabled}
                  />
                </>
              );

            case "text":
            case "email":
            case "number":
            default:
              return (
                <TextInput
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formik.values[field.name]}
                  onChange={(e) => handleChange(e.target.value)} // Usamos el nuevo handler
                  disabled={isDisabled}
                />
              );
          }
        })()}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  };

  return (
    <form onSubmit={formik.handleSubmit} className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">
        {config.title(isEditMode)}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
        {config.fields.map(renderField)}
      </div>
      <div className="pt-3 flex justify-end space-x-4">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button color="blue" type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : isEditMode ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
};

export default GenericForm;
