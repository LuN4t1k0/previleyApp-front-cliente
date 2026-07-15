export function extractBackendMessage(error, fallback = "Ocurrió un error.") {
  try {
    const response = error?.response?.data;

    if (typeof response === "string") return response;

    if (response && typeof response === "object") {
      const parts = [];

      const message = String(response.message || "");
      if (message) parts.push(message);
      if (response.detail && !message.includes(response.detail)) parts.push(response.detail);
      if (response.action && !message.includes(response.action)) {
        parts.push(`Qué hacer: ${response.action}`);
      }

      const fieldErrors = Array.isArray(response.errors)
        ? response.errors
            .map((item) => item?.message || item?.msg || item?.path || item?.field)
            .filter(Boolean)
        : [];

      if (fieldErrors.length > 0) {
        parts.push(`Validaciones: ${fieldErrors.slice(0, 3).join(" | ")}`);
      }

      const technical = [];
      if (response.code) technical.push(`codigo=${response.code}`);
      if (response.statusCode) technical.push(`status=${response.statusCode}`);
      if (response.requestId) technical.push(`requestId=${response.requestId}`);
      if (response.developerMessage) technical.push(response.developerMessage);

      if (technical.length > 0 && !message.includes("Detalle tecnico:")) {
        parts.push(`Detalle tecnico: ${technical.join(" | ")}`);
      }

      if (parts.length > 0) return parts.join("\n\n");
    }

    if (error?.message) return error.message;

    return fallback;
  } catch (e) {
    return fallback;
  }
}
