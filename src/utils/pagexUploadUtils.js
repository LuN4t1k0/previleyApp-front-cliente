// export async function subirArchivosPagex(files, setUploadStep) {
//   const formData = new FormData();
//   files.forEach((file) => formData.append("archivos", file));

//   setUploadStep("Invocando hechizos de conexión con el servidor... 🪄");

//   const response = await fetch(`${process.env.NEXT_PUBLIC_PAGEX_API_URL}/procesar`, {
//     method: "POST",
//     body: formData,
//   });

//   if (!response.ok) {
//     throw new Error("Error al procesar archivos");
//   }

//   setUploadStep("Descargando los resultados mágicos... 📦");

//   const blob = await response.blob();
//   return blob;
// }

export async function subirArchivosPagex(files, setUploadStep) {
  // 1. Subimos los archivos al backend usando fetch para obtener el EventSource ID
  const formData = new FormData();
  files.forEach((file) => formData.append("archivos", file));

  // Creamos una request para obtener un stream de eventos
  const response = await fetch(`${process.env.NEXT_PUBLIC_PAGEX_API_URL}/procesar`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok || !response.body) {
    throw new Error("Error al conectar con el servidor");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";

  return new Promise(async (resolve, reject) => {
    let finalZipBase64 = null;
    let finalFilename = "resultado.zip";

    const processLine = (line) => {
      if (!line.startsWith("data:")) return;
      const clean = line.replace(/^data:\s*/, "");

      try {
        const maybeJson = JSON.parse(clean);

        if (maybeJson.result) {
          finalZipBase64 = maybeJson.result;
          finalFilename = maybeJson.filename || finalFilename;
        }
      } catch (e) {
        // No es JSON, asumimos mensaje de estado
        setUploadStep(clean);
      }
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop(); // lo incompleto lo dejamos para el próximo chunk

        for (const line of lines) {
          processLine(line.trim());
        }
      }

      // Al terminar, descargamos el ZIP si vino como base64
      if (finalZipBase64) {
        const blob = base64ToBlob(finalZipBase64, "application/zip");
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = finalFilename;
        a.click();
        URL.revokeObjectURL(url);

        resolve(blob);
      } else {
        reject(new Error("No se recibió archivo ZIP del servidor."));
      }
    } catch (err) {
      reject(err);
    }
  });
}

// 🔧 Utilidad para convertir base64 → Blob
function base64ToBlob(base64, mimeType) {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

