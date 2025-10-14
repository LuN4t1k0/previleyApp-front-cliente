"use client";

import React, { useState } from "react";
import { useEventStream } from "@/hooks/useEventStream";

export default function LicenciasSSEPage() {
  const [files, setFiles] = useState([]);
  const [start, setStart] = useState(false);

  const { messages, done, error } = useEventStream(
    `${process.env.NEXT_PUBLIC_PAGEX_API_URL}/procesar`,
    files,
    start
  );

  const handleChange = e => {
    setFiles(Array.from(e.target.files));
    setStart(false);
  };

  const handleSubmit = () => {
    setStart(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🧪 Procesamiento con SSE</h1>

      <input type="file" multiple onChange={handleChange} className="mb-4" />
      <button
        onClick={handleSubmit}
        disabled={files.length === 0}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        Procesar archivos
      </button>

      <div className="mt-6 bg-gray-100 p-4 rounded h-80 overflow-y-scroll text-sm font-mono whitespace-pre-wrap">
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
        {done && <div className="mt-2 text-green-600">✅ Proceso completado</div>}
        {error && <div className="mt-2 text-red-600">❌ Error: {error.message}</div>}
      </div>
    </div>
  );
}
