"use client";

import React, { useState } from "react";
import { useEventStream } from "@/hooks/useEventStream";

export default function LicenciasProcessor() {
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
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Procesar Licencias Médicas</h1>
      <input type="file" multiple onChange={handleChange} className="mb-4" />
      <button onClick={handleSubmit} disabled={files.length === 0} className="bg-blue-500 text-white px-4 py-2 rounded">
        Procesar
      </button>

      <div className="mt-6 bg-gray-100 rounded p-4 h-64 overflow-y-scroll font-mono text-sm">
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
        {done && <div className="mt-2 text-green-600">✅ Proceso completado</div>}
        {error && <div className="mt-2 text-red-600">❌ Error: {error.message}</div>}
      </div>
    </div>
  );
}
