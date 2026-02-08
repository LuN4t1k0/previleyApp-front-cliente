import React, { useMemo, useState } from "react";

const groupFromId = (id) => {
  if (id.startsWith("mora_")) return "Mora Presunta";
  if (id.startsWith("pagex_")) return "Pagos en Exceso";
  if (id.startsWith("licencias_")) return "Licencias Médicas";
  if (id.startsWith("notificaciones_")) return "Notificaciones Previsionales";
  if (id.startsWith("cargas_")) return "Cargas Familiares";
  if (id.startsWith("depositos_")) return "Depósitos Convenidos";
  if (id.startsWith("visitas_")) return "Visitas Domiciliarias";
  return "Otros";
};

const DatasetSelector = ({ datasets, selectedId, onSelect }) => {
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    const filtered = datasets.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase())
    );
    return filtered.reduce((acc, ds) => {
      const group = groupFromId(ds.id);
      acc[group] = acc[group] || [];
      acc[group].push(ds);
      return acc;
    }, {});
  }, [datasets, search]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Dataset</h2>
        <input
          type="text"
          placeholder="Buscar dataset..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56 rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <select
        value={selectedId || ""}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>
          Selecciona un dataset
        </option>
        {Object.entries(grouped).map(([group, items]) => (
          <optgroup key={group} label={group}>
            {items.map((ds) => (
              <option key={ds.id} value={ds.id}>
                {ds.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
};

export default DatasetSelector;
