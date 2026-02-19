import { useCallback, useEffect, useMemo, useState } from "react";
import apiService from "@/app/api/apiService";
import {
  resolveServiceDefinition,
  resolveServiceKeyFromName,
} from "@/config/clientServices.config";

const normalizeEmpresas = (empresas = []) =>
  empresas
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") {
        return { empresaRut: item };
      }
      const rut = item.empresaRut || item.rut;
      if (!rut) return null;
      return {
        empresaRut: rut,
        nombre: item.nombre || item.empresas?.nombre || "",
      };
    })
    .filter(Boolean);

export const useEmpresasServicios = (empresas) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizedEmpresas = useMemo(
    () => normalizeEmpresas(empresas),
    [empresas]
  );

  const fetch = useCallback(async () => {
    if (!normalizedEmpresas.length) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const empresaMap = new Map(
        normalizedEmpresas.map((empresa) => [empresa.empresaRut, empresa])
      );

      const response = await apiService.post("/empresas/completas", {
        empresaRuts: normalizedEmpresas.map((empresa) => empresa.empresaRut),
      });
      const payloadList = response?.data?.data || [];

      const responses = payloadList.map((payload) => {
        const rut = payload?.empresa?.empresaRut || payload?.empresaRut;
        const fallback = empresaMap.get(rut) || {};
        const serviciosAsignados = (payload.serviciosAsignados || []).map(
          (servicio) => {
            const serviceKey =
              servicio?.serviceKey ||
              resolveServiceKeyFromName(servicio?.nombre || "");
            const definition = resolveServiceDefinition(serviceKey);

            return {
              ...servicio,
              serviceKey,
              definition,
            };
          }
        );

        return {
          empresaRut: rut,
          nombre: payload.empresa?.nombre || fallback.nombre || rut,
          serviciosAsignados,
          correosConfigurados: payload.correosConfigurados || [],
        };
      });

      setData(responses.filter((item) => item?.empresaRut));
      setError(null);
    } catch (err) {
      console.error("Error al obtener servicios por empresa:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [normalizedEmpresas]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const servicesByType = useMemo(() => {
    if (!data.length) return [];

    const aggregator = new Map();

    data.forEach((empresa) => {
      empresa.serviciosAsignados.forEach((servicio) => {
        if (!servicio?.serviceKey) return;
        const existing = aggregator.get(servicio.serviceKey);
        const definition =
          servicio.definition || resolveServiceDefinition(servicio.serviceKey);

        const empresaEntry = {
          empresaRut: empresa.empresaRut,
          empresaNombre: empresa.nombre,
          servicio,
        };

        if (existing) {
          existing.empresas.push(empresaEntry);
        } else {
          aggregator.set(servicio.serviceKey, {
            serviceKey: servicio.serviceKey,
            definition,
            empresas: [empresaEntry],
          });
        }
      });
    });

    return Array.from(aggregator.values());
  }, [data]);

  const servicesByAssignment = useMemo(() => {
    if (!data.length) return [];

    const aggregator = new Map();

    data.forEach((empresa) => {
      empresa.serviciosAsignados.forEach((servicio) => {
        const key = servicio?.servicioId || servicio?.id || servicio?.nombre;
        if (!key) return;
        const existing = aggregator.get(key);
        const definition =
          servicio.definition ||
          resolveServiceDefinition(servicio.serviceKey || servicio.nombre);
        const serviceKey =
          servicio.serviceKey || resolveServiceKeyFromName(servicio?.nombre || "");

        const empresaEntry = {
          empresaRut: empresa.empresaRut,
          empresaNombre: empresa.nombre,
          servicio,
        };

        if (existing) {
          existing.empresas.push(empresaEntry);
        } else {
          aggregator.set(key, {
            servicioId: servicio?.servicioId || servicio?.id || null,
            nombre: servicio?.nombre || "",
            serviceKey,
            definition,
            empresas: [empresaEntry],
          });
        }
      });
    });

    return Array.from(aggregator.values());
  }, [data]);

  return {
    data,
    loading,
    error,
    refetch: fetch,
    servicesByType,
    servicesByAssignment,
  };
};
