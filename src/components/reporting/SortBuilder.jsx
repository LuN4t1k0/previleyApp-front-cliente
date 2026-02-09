import React from "react";

const SortBuilder = ({ dataset, sort, onChange, maxSorts = 3 }) => {
  const columns = dataset?.columns || [];

  const addSort = () => {
    if (sort.length >= maxSorts) return;
    onChange([...sort, { field: columns[0]?.key || "", direction: "asc" }]);
  };

  const updateSort = (index, patch) => {
    const next = [...sort];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeSort = (index) => {
    onChange(sort.filter((_, i) => i !== index));
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <span className="material-icons-round text-orange-600">sort_by_alpha</span>
          </div>
          <h3 className="font-bold">Orden de Datos</h3>
        </div>
        <button
          onClick={addSort}
          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <span className="material-icons-round text-sm">add</span>
        </button>
      </div>
      {sort.length === 0 ? (
        <p className="text-sm text-slate-500">No hay orden definido.</p>
      ) : (
        <div className="space-y-3">
          {sort.map((item, index) => (
            <div key={`${item.field}-${index}`} className="flex items-center gap-2 group">
              <div className="flex-grow grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <select
                  className="bg-transparent border-none text-xs font-medium focus:ring-0 p-1"
                  value={item.field}
                  onChange={(e) => updateSort(index, { field: e.target.value })}
                >
                  {columns.map((col) => (
                    <option key={col.key} value={col.key}>
                      {col.label}
                    </option>
                  ))}
                </select>
                <select
                  className="bg-transparent border-none text-xs font-medium focus:ring-0 p-1"
                  value={item.direction}
                  onChange={(e) => updateSort(index, { direction: e.target.value })}
                >
                  <option value="desc">Descendente</option>
                  <option value="asc">Ascendente</option>
                </select>
              </div>
              <button
                onClick={() => removeSort(index)}
                className="material-icons-round text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-base"
              >
                close
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
        <span className="font-bold text-slate-500">TIP:</span> El orden afecta cómo se visualiza
        la tabla en la vista previa y el archivo final.
      </p>
    </section>
  );
};

export default SortBuilder;
