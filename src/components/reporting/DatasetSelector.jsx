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

const DatasetSelector = ({
  datasets,
  selectedId,
  onSelect,
  showSearch = false,
  title = "Dataset",
  subtitle = "Selecciona el origen de los datos",
}) => {
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
    <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <span className="material-icons-round">database</span>
          </div>
          <div>
            <h2 className="font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        {showSearch ? (
          <input
            type="text"
            placeholder="Buscar dataset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : null}
      </div>
      <div className="relative">
        <select
          value={selectedId || ""}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full bg-slate-50 border-slate-200 rounded-xl py-3 px-4 appearance-none focus:ring-blue-500 focus:border-blue-500"
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
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <span className="material-icons-round">unfold_more</span>
        </div>
      </div>
    </section>
  );
};

export default DatasetSelector;
