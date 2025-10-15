import apiService from "@/app/api/apiService";

const normalizeEndpointPath = (endpoint) => {
  if (!endpoint) return "";
  if (typeof window !== "undefined" && endpoint.startsWith(window.location.origin)) {
    try {
      return new URL(endpoint).pathname || "";
    } catch (_) {
      return endpoint;
    }
  }
  if (endpoint.startsWith("http")) {
    try {
      return new URL(endpoint).pathname || "";
    } catch (_) {
      return endpoint;
    }
  }
  return endpoint;
};

const mergeFacturaData = (originalFactura, fetchedFactura) => {
  if (!fetchedFactura) return originalFactura || null;
  const baseFactura = originalFactura || {};

  return {
    ...baseFactura,
    ...fetchedFactura,
    pdfUrl: fetchedFactura.pdfUrl ?? baseFactura.pdfUrl ?? null,
  };
};

const mergeProduccionData = (originalProduccion, fetchedProduccion) => {
  if (!fetchedProduccion) return originalProduccion || null;
  const baseProduccion = originalProduccion || {};

  return {
    ...baseProduccion,
    ...fetchedProduccion,
    certificadoInicial:
      fetchedProduccion.certificadoInicial ??
      baseProduccion.certificadoInicial ??
      null,
    certificadoFinal:
      fetchedProduccion.certificadoFinal ??
      baseProduccion.certificadoFinal ??
      null,
    detalle:
      fetchedProduccion.detalle ?? baseProduccion.detalle ?? null,
  };
};

export const enrichPrefacturaWithSignedAssets = async (prefactura) => {
  if (!prefactura || typeof prefactura !== "object") return prefactura;

  let enriched = { ...prefactura };

  if (prefactura.factura?.id) {
    try {
      const facturaResponse = await apiService.get(
        `/facturas/${prefactura.factura.id}`
      );
      const facturaPayload = facturaResponse?.data?.data || null;
      enriched.factura = mergeFacturaData(prefactura.factura, facturaPayload);
    } catch (error) {
      console.error(
        "No se pudo obtener la factura con URL firmada:",
        error
      );
      enriched.factura = mergeFacturaData(prefactura.factura, null);
    }
  }

  const detalles = Array.isArray(prefactura.detalles)
    ? prefactura.detalles
    : [];

  if (detalles.length > 0) {
    const uniqueProduccionIds = Array.from(
      new Set(
        detalles
          .map(
            (detalle) =>
              detalle.produccionId ||
              detalle.produccionID ||
              detalle.producciones?.id ||
              null
          )
          .filter(Boolean)
      )
    );

    if (uniqueProduccionIds.length > 0) {
      const produccionEntries = await Promise.all(
        uniqueProduccionIds.map(async (produccionId) => {
          try {
            const response = await apiService.get(
              `/produccion/detalle/${produccionId}`
            );
            const data = response?.data?.data || null;
            return [produccionId, data];
          } catch (error) {
            console.error(
              `No se pudo obtener la producción ${produccionId} con URLs firmadas:`,
              error
            );
            return [produccionId, null];
          }
        })
      );

      const produccionesMap = produccionEntries.reduce((map, [id, data]) => {
        if (id && data) map.set(id, data);
        return map;
      }, new Map());

      enriched = {
        ...enriched,
        detalles: detalles.map((detalle) => {
          const produccionId =
            detalle.produccionId ||
            detalle.produccionID ||
            detalle.producciones?.id ||
            null;
          if (!produccionId) return detalle;
          const produccionSigned = produccionesMap.get(produccionId);
          if (!produccionSigned) return detalle;
          return {
            ...detalle,
            producciones: mergeProduccionData(
              detalle.producciones,
              produccionSigned
            ),
          };
        }),
      };
    }
  }

  return enriched;
};

export const fetchPrefacturaDetailWithSignedUrls = async (
  endpointOrId
) => {
  let endpoint = endpointOrId;
  if (typeof endpointOrId === "number" || /^\d+$/.test(endpointOrId)) {
    endpoint = `/prefacturas/detalle/${endpointOrId}`;
  }

  const normalized = normalizeEndpointPath(endpoint);
  if (!normalized) {
    throw new Error("Endpoint inválido para obtener detalle de prefactura.");
  }

  const response = await apiService.get(endpoint);
  const prefactura = response?.data?.data || response?.data || null;
  if (!prefactura) return prefactura;

  return enrichPrefacturaWithSignedAssets(prefactura);
};

export const shouldEnrichPrefacturaEndpoint = (path) => {
  if (!path) return false;
  try {
    const normalizedPath = normalizeEndpointPath(path)
      .replace(process.env.NEXT_PUBLIC_API_URL || "", "")
      .replace(/^\/+/, "");
    return normalizedPath.startsWith("prefacturas/detalle");
  } catch (_) {
    return false;
  }
};

