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
  const baseFactura = originalFactura || {};
  const fetched = fetchedFactura || {};

  if (!originalFactura && !fetchedFactura) return null;

  return {
    ...baseFactura,
    ...fetched,
    pdfUrl: fetched.pdfUrl ?? baseFactura.pdfUrl ?? null,
  };
};

const mergeProduccionData = (originalProduccion, fetchedProduccion) => {
  const baseProduccion = originalProduccion || {};
  const fetched = fetchedProduccion || {};

  if (!originalProduccion && !fetchedProduccion) return null;

  return {
    ...baseProduccion,
    ...fetched,
    certificadoInicial:
      fetched.certificadoInicial ??
      baseProduccion.certificadoInicial ??
      null,
    certificadoFinal:
      fetched.certificadoFinal ??
      baseProduccion.certificadoFinal ??
      null,
    detalle: fetched.detalle ?? baseProduccion.detalle ?? null,
  };
};

const collectProduccionIds = (detalle) => {
  const ids = new Set();

  if (detalle?.produccionId) ids.add(detalle.produccionId);
  if (detalle?.produccionID) ids.add(detalle.produccionID);

  const producciones = detalle?.producciones;
  if (Array.isArray(producciones)) {
    producciones.forEach((prod) => {
      if (prod?.id) ids.add(prod.id);
      if (prod?.produccionId) ids.add(prod.produccionId);
      if (prod?.produccionID) ids.add(prod.produccionID);
    });
  } else if (producciones?.id) {
    ids.add(producciones.id);
  }

  return Array.from(ids).filter(Boolean);
};

const mergeProduccionesForDetalle = (
  detalle,
  produccionesMap
) => {
  const existing = detalle?.producciones;

  if (Array.isArray(existing)) {
    return existing.map((prod) => {
      const prodId =
        prod?.id || prod?.produccionId || prod?.produccionID || null;
      const fetched = prodId ? produccionesMap.get(prodId) : null;
      return mergeProduccionData(prod, fetched);
    });
  }

  const prodId =
    detalle?.produccionId ||
    detalle?.produccionID ||
    existing?.id ||
    null;
  const fetched = prodId ? produccionesMap.get(prodId) : null;
  return mergeProduccionData(existing, fetched);
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
        detalles.flatMap((detalle) => collectProduccionIds(detalle))
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
        detalles: detalles.map((detalle) => ({
          ...detalle,
          producciones: mergeProduccionesForDetalle(detalle, produccionesMap),
        })),
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
