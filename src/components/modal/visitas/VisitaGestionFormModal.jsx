"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Select,
  SelectItem,
  Text,
  TextInput,
  Textarea,
} from "@tremor/react";
import { showErrorAlert } from "@/utils/alerts";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import apiService from "@/app/api/apiService";

const estados = [
  { value: "planificada", label: "Planificada" },
  { value: "en_proceso", label: "En proceso" },
  { value: "cerrada", label: "Cerrada" },
  { value: "cancelada", label: "Cancelada" },
];

const VisitaGestionFormModal = ({ initialData = {}, handleSubmit, onClose }) => {
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const [services, setServices] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(false);

  const [formValues, setFormValues] = useState({
    empresaRut: "",
    servicioId: "",
    tarifaVisita: "",
    fechaGestion: new Date().toISOString().split("T")[0],
    estado: "planificada",
    observaciones: "",
    planificacion: null,
    certificadoInicial: null,
    certificadoFinal: null,
  });

  useEffect(() => {
    if (initialData?.id) {
      setFormValues({
        empresaRut: initialData.empresaRut || "",
        servicioId: initialData.servicioId?.toString() || "",
        tarifaVisita: initialData.tarifaVisita ? String(initialData.tarifaVisita) : "",
        fechaGestion: initialData.fechaGestion || new Date().toISOString().split("T")[0],
        estado: initialData.estado || "planificada",
        observaciones: initialData.observaciones || "",
        planificacion: null,
        certificadoInicial: null,
        certificadoFinal: null,
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServicios(true);
        const response = await apiService.get("/servicios", { params: { limit: 500 } });
        const data = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];
        setServices(data);
      } catch (error) {
        console.error("Error cargando servicios disponibles", error);
        setServices([]);
      } finally {
        setLoadingServicios(false);
      }
    };

    fetchServices();
  }, []);

  const empresasOptions = useMemo(
    () => empresas.map((empresa) => ({ value: empresa.empresaRut, label: empresa.nombre })),
    [empresas]
  );

  const serviciosOptions = useMemo(
    () => services.map((servicio) => ({ value: servicio.id.toString(), label: servicio.nombre })),
    [services]
  );

  const handleChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    handleChange("planificacion", file);
  };

  const handleCertificadoInicialChange = (event) => {
    const file = event.target.files?.[0] || null;
    handleChange("certificadoInicial", file);
  };

  const handleCertificadoFinalChange = (event) => {
    const file = event.target.files?.[0] || null;
    handleChange("certificadoFinal", file);
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!formValues.empresaRut) {
      showErrorAlert("Validación", "Debes seleccionar una empresa.");
      return;
    }

    const payload = new FormData();
    payload.append("empresaRut", formValues.empresaRut);
    if (formValues.servicioId) payload.append("servicioId", formValues.servicioId);
    if (formValues.tarifaVisita) payload.append("tarifaVisita", formValues.tarifaVisita);
    if (formValues.fechaGestion) payload.append("fechaGestion", formValues.fechaGestion);
    if (formValues.estado) payload.append("estado", formValues.estado);
    if (formValues.observaciones) payload.append("observaciones", formValues.observaciones);
    if (formValues.planificacion instanceof File) {
      payload.append("planificacion", formValues.planificacion);
    }
    if (formValues.certificadoInicial instanceof File) {
      payload.append("certificadoInicial", formValues.certificadoInicial);
    }
    if (formValues.certificadoFinal instanceof File) {
      payload.append("certificadoFinal", formValues.certificadoFinal);
    }

    await handleSubmit(payload, initialData.id ? { id: initialData.id } : null);
    onClose();
  };

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Text className="text-sm font-semibold text-gray-700">Empresa</Text>
          <Select
            value={formValues.empresaRut}
            placeholder="Selecciona empresa"
            disabled={loadingEmpresas || Boolean(initialData?.id)}
            onValueChange={(value) => handleChange("empresaRut", value)}
          >
            {empresasOptions.map((empresa) => (
              <SelectItem key={empresa.value} value={empresa.value}>
                {empresa.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Text className="text-sm font-semibold text-gray-700">Servicio</Text>
          <Select
            value={formValues.servicioId}
            placeholder="Servicio asociado"
            disabled={loadingServicios}
            onValueChange={(value) => handleChange("servicioId", value)}
          >
            <SelectItem value="">Sin servicio</SelectItem>
            {serviciosOptions.map((servicio) => (
              <SelectItem key={servicio.value} value={servicio.value}>
                {servicio.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Text className="text-sm font-semibold text-gray-700">Tarifa por visita</Text>
          <TextInput
            type="number"
            min="0"
            value={formValues.tarifaVisita}
            onChange={(e) => handleChange("tarifaVisita", e.target.value)}
            placeholder="Ej: 10000"
          />
        </div>

        <div className="space-y-2">
          <Text className="text-sm font-semibold text-gray-700">Fecha de gestión</Text>
          <TextInput
            type="date"
            value={formValues.fechaGestion}
            onChange={(e) => handleChange("fechaGestion", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Text className="text-sm font-semibold text-gray-700">Estado</Text>
          <Select
            value={formValues.estado}
            onValueChange={(value) => handleChange("estado", value)}
          >
            {estados.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Text className="text-sm font-semibold text-gray-700">Observaciones</Text>
        <Textarea
          minRows={3}
          value={formValues.observaciones}
          onChange={(e) => handleChange("observaciones", e.target.value)}
          placeholder="Notas internas, instrucciones para visitadores, etc."
        />
      </div>

      <div className="space-y-2">
        <Text className="text-sm font-semibold text-gray-700">Archivo planificación (Excel)</Text>
        <TextInput type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
        {initialData?.archivoPlanificacionSignedUrl && !formValues.planificacion && (
          <a
            href={initialData.archivoPlanificacionSignedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm hover:underline"
          >
            Descargar planificación actual
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Text className="text-sm font-semibold text-gray-700">Certificado inicial</Text>
          <TextInput
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleCertificadoInicialChange}
          />
          {initialData?.certificadoInicialSignedUrl && !formValues.certificadoInicial && (
            <a
              href={initialData.certificadoInicialSignedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm hover:underline"
            >
              Descargar certificado inicial
            </a>
          )}
        </div>
        <div className="space-y-2">
          <Text className="text-sm font-semibold text-gray-700">Certificado final</Text>
          <TextInput
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleCertificadoFinalChange}
          />
          {initialData?.certificadoFinalSignedUrl && !formValues.certificadoFinal && (
            <a
              href={initialData.certificadoFinalSignedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm hover:underline"
            >
              Descargar certificado final
            </a>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="light" color="gray" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" color="blue">
          {initialData?.id ? "Actualizar gestión" : "Crear gestión"}
        </Button>
      </div>
    </form>
  );
};

VisitaGestionFormModal.modalSize = "max-w-3xl";

export default VisitaGestionFormModal;
