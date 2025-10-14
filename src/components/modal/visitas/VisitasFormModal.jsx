"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Select,
  SelectItem,
  Switch,
  Text,
  TextInput,
  Textarea,
} from "@tremor/react";
import { RiImageLine } from "@remixicon/react";
import { showErrorAlert } from "@/utils/alerts";

const initialState = {
  empresaRut: "",
  timestamp: "",
  nombreTrabajador: "",
  apellidoTrabajador: "",
  rutTrabajador: "",
  direccionParticular: "",
  ciudad: "",
  enDomicilio: false,
  enReposo: false,
  comentario: "",
  nombreVisitador: "",
  apellidoVisitador: "",
  imagenDomicilio: null,
};

const VisitasFormModal = ({
  initialData = {},
  handleSubmit,
  onClose,
  empresaOptions = [],
}) => {
  const [formValues, setFormValues] = useState(initialState);
  const [previewUrl, setPreviewUrl] = useState(null);
  const isEditMode = Boolean(initialData?.id);

  useEffect(() => {
    if (!initialData) {
      setFormValues({
        ...initialState,
        timestamp: new Date().toISOString().slice(0, 16),
      });
      setPreviewUrl(null);
      return;
    }

    setFormValues({
      empresaRut: initialData.empresaRut || "",
      timestamp: initialData.timestamp
        ? new Date(initialData.timestamp).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      nombreTrabajador: initialData.nombreTrabajador || "",
      apellidoTrabajador: initialData.apellidoTrabajador || "",
      rutTrabajador: initialData.rutTrabajador || "",
      direccionParticular: initialData.direccionParticular || "",
      ciudad: initialData.ciudad || "",
      enDomicilio: Boolean(initialData.enDomicilio),
      enReposo: Boolean(initialData.enReposo),
      comentario: initialData.comentario || "",
      nombreVisitador: initialData.nombreVisitador || "",
      apellidoVisitador: initialData.apellidoVisitador || "",
      imagenDomicilio: null,
    });
    setPreviewUrl(initialData.imagenDomicilioSignedUrl || null);
  }, [initialData]);

  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const availableEmpresas = useMemo(() => {
    if (empresaOptions?.length) return empresaOptions;
    return initialData?.empresaRut ? [initialData.empresaRut] : [];
  }, [empresaOptions, initialData]);

  const handleChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    handleChange("imagenDomicilio", file || null);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const validate = () => {
    if (!formValues.empresaRut) {
      showErrorAlert("Validación", "La empresa es obligatoria.");
      return false;
    }
    if (!formValues.nombreTrabajador || !formValues.apellidoTrabajador) {
      showErrorAlert("Validación", "El nombre del trabajador es obligatorio.");
      return false;
    }
    if (!formValues.rutTrabajador) {
      showErrorAlert("Validación", "El RUT del trabajador es obligatorio.");
      return false;
    }
    if (!formValues.nombreVisitador || !formValues.apellidoVisitador) {
      showErrorAlert("Validación", "Debes indicar el nombre del visitador.");
      return false;
    }
    return true;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = new FormData();
    payload.append("empresaRut", formValues.empresaRut);
    if (formValues.timestamp) {
      payload.append("timestamp", new Date(formValues.timestamp).toISOString());
    }
    payload.append("nombreTrabajador", formValues.nombreTrabajador.trim());
    payload.append("apellidoTrabajador", formValues.apellidoTrabajador.trim());
    payload.append("rutTrabajador", formValues.rutTrabajador.trim());
    if (formValues.direccionParticular) {
      payload.append("direccionParticular", formValues.direccionParticular.trim());
    }
    if (formValues.ciudad) {
      payload.append("ciudad", formValues.ciudad.trim());
    }
    payload.append("enDomicilio", formValues.enDomicilio ? "true" : "false");
    payload.append("enReposo", formValues.enReposo ? "true" : "false");
    if (formValues.comentario) {
      payload.append("comentario", formValues.comentario.trim());
    }
    payload.append("nombreVisitador", formValues.nombreVisitador.trim());
    payload.append("apellidoVisitador", formValues.apellidoVisitador.trim());

    if (formValues.imagenDomicilio instanceof File) {
      payload.append("imagenDomicilio", formValues.imagenDomicilio);
    }

    try {
      await handleSubmit(payload, initialData);
      onClose();
    } catch (error) {
      console.error("Error guardando visita domiciliaria:", error);
      const message =
        error?.response?.data?.message || "No se pudo guardar la visita domiciliaria.";
      showErrorAlert("Error", message);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Text className="text-sm font-semibold text-gray-700">
            Empresa
          </Text>
          {availableEmpresas.length ? (
            <Select
              value={formValues.empresaRut}
              onValueChange={(value) => handleChange("empresaRut", value)}
            >
              <SelectItem value="" disabled>
                Selecciona empresa
              </SelectItem>
              {availableEmpresas.map((rut) => (
                <SelectItem key={rut} value={rut}>
                  {rut}
                </SelectItem>
              ))}
            </Select>
          ) : (
            <TextInput
              value={formValues.empresaRut}
              onChange={(e) => handleChange("empresaRut", e.target.value)}
              placeholder="RUT empresa"
            />
          )}
        </div>

        <div className="space-y-2">
          <Text className="text-sm font-semibold text-gray-700">
            Fecha de visita
          </Text>
          <TextInput
            type="datetime-local"
            value={formValues.timestamp}
            onChange={(e) => handleChange("timestamp", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Text className="text-sm font-semibold text-gray-700">
            Nombre trabajador
          </Text>
          <TextInput
            value={formValues.nombreTrabajador}
            onChange={(e) => handleChange("nombreTrabajador", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Text className="text-sm font-semibold text-gray-700">
            Apellido trabajador
          </Text>
          <TextInput
            value={formValues.apellidoTrabajador}
            onChange={(e) => handleChange("apellidoTrabajador", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Text className="text-sm font-semibold text-gray-700">
            RUT trabajador
          </Text>
          <TextInput
            value={formValues.rutTrabajador}
            onChange={(e) => handleChange("rutTrabajador", e.target.value)}
            placeholder="11111111-1"
          />
        </div>

        <div className="space-y-2">
          <Text className="text-sm font-semibold text-gray-700">Ciudad</Text>
          <TextInput
            value={formValues.ciudad}
            onChange={(e) => handleChange("ciudad", e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Text className="text-sm font-semibold text-gray-700">
            Dirección
          </Text>
          <TextInput
            value={formValues.direccionParticular}
            onChange={(e) => handleChange("direccionParticular", e.target.value)}
            placeholder="Calle, número, departamento"
          />
        </div>

        <div className="space-y-2">
          <Text className="text-sm font-semibold text-gray-700">
            Nombre visitador
          </Text>
          <TextInput
            value={formValues.nombreVisitador}
            onChange={(e) => handleChange("nombreVisitador", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Text className="text-sm font-semibold text-gray-700">
            Apellido visitador
          </Text>
          <TextInput
            value={formValues.apellidoVisitador}
            onChange={(e) => handleChange("apellidoVisitador", e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg">
          <div>
            <Text className="text-sm font-semibold text-gray-700">
              Trabajador presente
            </Text>
            <Text className="text-xs text-gray-500">
              Indica si se encontraba en el domicilio.
            </Text>
          </div>
          <Switch
            checked={Boolean(formValues.enDomicilio)}
            onChange={(value) => handleChange("enDomicilio", value)}
          />
        </div>

        <div className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg">
          <div>
            <Text className="text-sm font-semibold text-gray-700">
              Cumple reposo
            </Text>
            <Text className="text-xs text-gray-500">
              Marca si estaba realizando el reposo indicado.
            </Text>
          </div>
          <Switch
            checked={Boolean(formValues.enReposo)}
            onChange={(value) => handleChange("enReposo", value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Text className="text-sm font-semibold text-gray-700">
            Comentarios
          </Text>
          <Textarea
            value={formValues.comentario}
            onChange={(e) => handleChange("comentario", e.target.value)}
            placeholder="Observaciones realizadas durante la visita"
            minRows={3}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Text className="text-sm font-semibold text-gray-700">
            Evidencia fotográfica
          </Text>
          <TextInput type="file" accept="image/*" onChange={handleFileChange} />
          {previewUrl ? (
            <div className="mt-3 flex items-center gap-3">
              <img
                src={previewUrl}
                alt="Evidencia"
                className="h-32 w-auto rounded-md border border-dashed border-gray-300 object-cover"
              />
              {initialData?.imagenDomicilioSignedUrl && !formValues.imagenDomicilio && (
                <a
                  href={initialData.imagenDomicilioSignedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
                >
                  <RiImageLine className="w-4 h-4" />
                  Ver evidencia original
                </a>
              )}
            </div>
          ) : initialData?.imagenDomicilioSignedUrl ? (
            <a
              href={initialData.imagenDomicilioSignedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
            >
              <RiImageLine className="w-4 h-4" />
              Abrir evidencia existente
            </a>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="light" color="gray" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" color="blue">
          {isEditMode ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
};

VisitasFormModal.modalSize = "max-w-3xl";

export default VisitasFormModal;
