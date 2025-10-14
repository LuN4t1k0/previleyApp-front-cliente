import { useEffect, useState } from "react";

// Mantiene el estado de progreso de múltiples jobs por jobId
export default function useBulkProgress(socket) {
  const [jobs, setJobs] = useState({});

  useEffect(() => {
    if (!socket) return;

    const onStart = (evt) => {
      const { jobId, ...rest } = evt || {};
      if (!jobId) return;
      setJobs((prev) => ({
        ...prev,
        [jobId]: { jobId, phase: "start", percent: 0, ...rest },
      }));
    };

    const onProgress = (evt) => {
      const { jobId, percent, ...rest } = evt || {};
      if (!jobId) return;
      setJobs((prev) => ({
        ...prev,
        [jobId]: { ...(prev[jobId] || {}), percent: percent ?? 0, ...rest },
      }));
    };

    const onDone = (evt) => {
      const { jobId, summary } = evt || {};
      if (!jobId) return;
      setJobs((prev) => ({
        ...prev,
        [jobId]: { ...(prev[jobId] || {}), phase: "done", percent: 100, summary },
      }));
    };

    socket.on("bulk:start", onStart);
    socket.on("bulk:progress", onProgress);
    socket.on("bulk:done", onDone);

    return () => {
      socket.off("bulk:start", onStart);
      socket.off("bulk:progress", onProgress);
      socket.off("bulk:done", onDone);
    };
  }, [socket]);

  const getJob = (jobId) => jobs[jobId];
  const clearJob = (jobId) => {
    setJobs((prev) => {
      const next = { ...prev };
      delete next[jobId];
      return next;
    });
  };

  return { jobs, getJob, clearJob };
}

