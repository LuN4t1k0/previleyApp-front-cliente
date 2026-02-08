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

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Columnas</h2>
        <div className="flex gap-2 text-xs">
          <button onClick={selectAll} className="rounded border px-2 py-1 hover:bg-gray-50">
            Select all
          </button>
          <button onClick={selectRecommended} className="rounded border px-2 py-1 hover:bg-gray-50">
            Recommended
          </button>
          <button onClick={reset} className="rounded border px-2 py-1 hover:bg-gray-50">
            Reset
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {columns.map((col) => (
          <label key={col.key} className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={selectedColumns.includes(col.key)}
              onChange={() => toggle(col.key)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            {col.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default ColumnPicker;
