// Helper para seleccionar un job por tipo y scope (e.g., gestionLicenciaId)

export default function selectBulkJob(jobsMap, { correlationId, type, gestionLicenciaId }) {
  const jobs = Object.values(jobsMap || {});
  if (correlationId) {
    const byCorr = jobs.filter((j) => j.correlationId === correlationId);
    if (byCorr.length > 0) {
      return byCorr.sort((a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0))[0];
    }
  }
  // Fallback: si no hay correlationId, intentar por tipo y distintos posibles campos de ID
  const filtered = jobs.filter((j) => {
    if (type && j.type !== type) return false;
    if (gestionLicenciaId) {
      const sameId =
        j.gestionLicenciaId === gestionLicenciaId ||
        j.gestionMoraId === gestionLicenciaId ||
        j.gestionPagexId === gestionLicenciaId;
      if (!sameId) return false;
    }
    return true;
  });
  if (filtered.length === 0) return null;
  // Preferir el más reciente
  return filtered.sort((a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0))[0];
}
