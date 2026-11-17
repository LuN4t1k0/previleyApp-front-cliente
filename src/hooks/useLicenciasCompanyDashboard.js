"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchLicenciasDashboard } from "@/services/clientServiceApi";
import { normalizeLicenciasOperations } from "@/services/licenciasWorkspace.mjs";
import { createLatestRequestTracker } from "@/services/dashboardRequestState.mjs";

const useLicenciasCompanyDashboard = (empresaRut) => {
  const trackerRef = useRef(null);
  if (!trackerRef.current) trackerRef.current = createLatestRequestTracker();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryVersion, setRetryVersion] = useState(0);

  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  useEffect(() => {
    const tracker = trackerRef.current;
    if (!empresaRut) {
      tracker.invalidate();
      setData(null);
      setError("");
      setLoading(false);
      return undefined;
    }

    const requestId = tracker.begin();
    setData(null);
    setError("");
    setLoading(true);

    fetchLicenciasDashboard(empresaRut)
      .then((payload) => {
        if (tracker.isCurrent(requestId)) {
          setData(normalizeLicenciasOperations(payload));
        }
      })
      .catch((requestError) => {
        if (tracker.isCurrent(requestId)) {
          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              "No fue posible cargar el dashboard operativo."
          );
        }
      })
      .finally(() => {
        if (tracker.isCurrent(requestId)) setLoading(false);
      });

    return () => tracker.invalidate();
  }, [empresaRut, retryVersion]);

  return { data, loading, error, retry };
};

export default useLicenciasCompanyDashboard;

