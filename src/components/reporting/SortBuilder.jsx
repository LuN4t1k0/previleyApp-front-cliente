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
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Orden</h2>
        <button onClick={addSort} className="rounded border px-2 py-1 text-xs hover:bg-gray-50">
          Add sort
        </button>
      </div>
      {sort.length === 0 ? (
        <p className="text-sm text-gray-500">No hay orden definido.</p>
      ) : (
        <div className="space-y-2">
          {sort.map((item, index) => (
            <div key={`${item.field}-${index}`} className="grid grid-cols-12 gap-2">
              <select
                className="col-span-7 rounded border px-2 py-1 text-sm"
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
                className="col-span-4 rounded border px-2 py-1 text-sm"
                value={item.direction}
                onChange={(e) => updateSort(index, { direction: e.target.value })}
              >
                <option value="asc">asc</option>
                <option value="desc">desc</option>
              </select>
              <div className="col-span-1 flex items-center justify-center">
                <button onClick={() => removeSort(index)} className="text-xs text-red-500 hover:underline">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortBuilder;
