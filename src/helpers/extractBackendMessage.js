export function extractBackendMessage(error, fallback = "Ocurrió un error.") {
  try {
    const response = error?.response?.data;

    if (response?.message) return response.message;
    if (typeof response === "string") return response;

    return fallback;
  } catch (e) {
    return fallback;
  }
}
