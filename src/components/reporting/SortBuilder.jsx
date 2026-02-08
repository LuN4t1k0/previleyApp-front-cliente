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
    <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
            <span className="material-icons-round text-sm">sort_by_alpha</span>
          </div>
          <h2 className="font-bold text-slate-900">Orden de Datos</h2>
        </div>
        <button
          onClick={addSort}
          className="p-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg transition"
        >
          <span className="material-icons-round text-[18px]">add</span>
        </button>
      </div>
      {sort.length === 0 ? (
        <p className="text-sm text-slate-500">No hay orden definido.</p>
      ) : (
        <div className="space-y-2">
          {sort.map((item, index) => (
            <div key={`${item.field}-${index}`} className="grid grid-cols-12 gap-2">
              <div className="col-span-7 relative">
                <select
                  className="w-full text-xs bg-slate-50 border-slate-200 rounded-lg py-2 pl-3 pr-8 appearance-none"
                  value={item.field}
                  onChange={(e) => updateSort(index, { field: e.target.value })}
                >
                  {columns.map((col) => (
                    <option key={col.key} value={col.key}>
                      {col.label}
                    </option>
                  ))}
                </select>
                <span className="material-icons-round absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  expand_more
                </span>
              </div>
              <div className="col-span-4 relative">
                <select
                  className="w-full text-xs bg-slate-50 border-slate-200 rounded-lg py-2 pl-3 pr-8 appearance-none"
                  value={item.direction}
                  onChange={(e) => updateSort(index, { direction: e.target.value })}
                >
                  <option value="asc">Ascendente</option>
                  <option value="desc">Descendente</option>
                </select>
                <span className="material-icons-round absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  expand_more
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <button
                  onClick={() => removeSort(index)}
                  className="text-xs text-slate-400 hover:text-red-500 transition"
                >
                  <span className="material-icons-round text-[16px]">close</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default SortBuilder;
