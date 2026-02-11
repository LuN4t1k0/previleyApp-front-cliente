import React, { useMemo } from "react";

const ColumnPicker = ({ dataset, selectedColumns, onChange }) => {
  const columns = dataset?.columns || [];

  const allKeys = useMemo(() => columns.map((c) => c.key), [columns]);

  const toggle = (key) => {
    if (selectedColumns.includes(key)) {
      onChange(selectedColumns.filter((k) => k !== key));
    } else {
      onChange([...selectedColumns, key]);
    }
  };

  const selectAll = () => onChange(allKeys);
  const reset = () => onChange(dataset?.defaultColumns || []);
  const selectRecommended = () =>
    onChange(dataset?.defaultColumns?.length ? dataset.defaultColumns : allKeys.slice(0, 5));

  const badgeFor = (col) => {
    const key = col.key.toLowerCase();
    if (key.includes("empresa")) return "Identificador";
    if (key.includes("nombre")) return "Personal";
    if (key.includes("monto")) return "Financiero";
    if (key.includes("periodo")) return "Temporal";
    if (key.includes("estado")) return "Status";
    if (key.includes("tipo")) return "Operativo";
    return (col.type || "Campo").toString().toUpperCase();
  };

  return (
    <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <span className="material-icons-round">view_column</span>
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Columnas del Reporte</h2>
            <p className="text-xs text-slate-500">Elige los campos que quieres incluir</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={selectRecommended}
            className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
          >
            Recomendado
          </button>
          <button
            onClick={reset}
            className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition"
          >
            Limpiar
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {columns.map((col) => (
          <label
            key={col.key}
            className="group relative flex items-center p-3 border-2 border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50"
          >
            <input
              type="checkbox"
              checked={selectedColumns.includes(col.key)}
              onChange={() => toggle(col.key)}
              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-3"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">{col.label}</span>
              <span className="text-[10px] text-slate-500 uppercase">{badgeFor(col)}</span>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
};

export default ColumnPicker;
