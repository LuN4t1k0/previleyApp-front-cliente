import { useEffect, useState } from "react";

export function useEventStream(url, files, shouldStart) {
  const [messages, setMessages] = useState([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shouldStart || !files.length) return;

    const formData = new FormData();
    files.forEach(file => formData.append("archivos", file));

    const controller = new AbortController();

    fetch(url, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    })
      .then(response => {
        if (!response.ok) throw new Error("Error en el servidor");
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let buffer = "";

        const read = async () => {
          while (true) {
            const { done: doneReading, value } = await reader.read();
            if (doneReading) break;

            buffer += decoder.decode(value, { stream: true });

            const parts = buffer.split("data: ");
            buffer = parts.pop(); // deja el último fragmento incompleto

            for (const part of parts) {
              const msg = part.trim();
              if (msg) {
                setMessages(prev => [...prev, msg]);
                console.log("📩 Mensaje SSE:", msg);
              }
            }
          }

          setDone(true);
        };

        read().catch(err => {
          console.error("Error leyendo SSE", err);
          setError(err);
        });
      })
      .catch(err => {
        console.error("Error inicial en SSE", err);
        setError(err);
      });

    return () => controller.abort();
  }, [shouldStart]);

  return { messages, done, error };
}
