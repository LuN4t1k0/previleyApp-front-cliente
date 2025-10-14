// export const extractBackendMessage = (err, fallback = "Ocurrió un error") => {
//   return err?.response?.data?.message || fallback;
// };

// export const extractBackendMessage = (error) => {
//   return (
//     error?.response?.data?.message ||
//     error?.message ||
//     "Ocurrió un error inesperado."
//   );
// };


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
