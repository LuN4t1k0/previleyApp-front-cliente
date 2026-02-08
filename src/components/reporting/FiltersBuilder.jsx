import React from "react";

const FiltersBuilder = ({ dataset, filters, onChange }) => {
  const columns = dataset?.columns || [];

  const addFilter = () => {
    const firstColumn = columns[0];
    const op = firstColumn?.allowedOps?.[0] || "eq";
    onChange([
      ...filters,
      { field: firstColumn?.key || "", op, value: "" },
    ]);
  };

  const updateFilter = (index, patch) => {
    const next = [...filters];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeFilter = (index) => {
    onChange(filters.filter((_, i) => i !== index));
  };

  const clearFilters = () => onChange([]);

  const renderValueInput = (filter, column) => {
    const type = column?.type || "string";
    const op = filter.op;

    if (op === "between") {
      return (
        <div className="flex gap-2">
          <input
            type={type === "date" ? "date" : "number"}
            value={filter.value?.from || ""}
            onChange={(e) =>
              updateFilter(filter.index, {
                value: { ...(filter.value || {}), from: e.target.value },
              })
            }
            className="w-full rounded border px-2 py-1 text-sm"
          />
          <input
            type={type === "date" ? "date" : "number"}
            value={filter.value?.to || ""}
            onChange={(e) =>
              updateFilter(filter.index, {
                value: { ...(filter.value || {}), to: e.target.value },
              })
            }
            className="w-full rounded border px-2 py-1 text-sm"
          />
        </div>
      );
    }

    if (op === "in") {
      return (
        <input
          type="text"
          placeholder="valor1, valor2"
          value={Array.isArray(filter.value) ? filter.value.join(",") : filter.value || ""}
          onChange={(e) =>
            updateFilter(filter.index, {
              value: e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
            })
          }
          className="w-full rounded border px-2 py-1 text-sm"
        />
      );
    }

    return (
      <input
        type={type === "number" ? "number" : type === "date" ? "date" : "text"}
        value={filter.value || ""}
        onChange={(e) => updateFilter(filter.index, { value: e.target.value })}
        className="w-full rounded border px-2 py-1 text-sm"
      />
    );
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Filtros (AND)</h2>
        <div className="flex gap-2 text-xs">
          <button onClick={addFilter} className="rounded border px-2 py-1 hover:bg-gray-50">
            Add filter
          </button>
          <button onClick={clearFilters} className="rounded border px-2 py-1 hover:bg-gray-50">
            Clear filters
          </button>
        </div>
      </div>
      {filters.length === 0 ? (
        <p className="text-sm text-gray-500">No hay filtros aún.</p>
      ) : (
        <div className="space-y-2">
          {filters.map((filter, index) => {
            const column = columns.find((c) => c.key === filter.field);
            const ops = column?.allowedOps || ["eq"];
            return (
              <div key={`${filter.field}-${index}`} className="grid grid-cols-12 gap-2">
                <select
                  className="col-span-4 rounded border px-2 py-1 text-sm"
                  value={filter.field}
                  onChange={(e) => {
                    const nextColumn = columns.find((c) => c.key === e.target.value);
                    const nextOp = nextColumn?.allowedOps?.[0] || "eq";
                    updateFilter(index, {
                      field: e.target.value,
                      op: nextOp,
                      value: nextOp === "between" ? { from: "", to: "" } : nextOp === "in" ? [] : "",
                    });
                  }}
                >
                  {columns.map((col) => (
                    <option key={col.key} value={col.key}>
                      {col.label}
                    </option>
                  ))}
                </select>
                <select
                  className="col-span-2 rounded border px-2 py-1 text-sm"
                  value={filter.op}
                  onChange={(e) => {
                    const nextOp = e.target.value;
                    updateFilter(index, {
                      op: nextOp,
                      value: nextOp === "between" ? { from: "", to: "" } : nextOp === "in" ? [] : "",
                    });
                  }}
                >
                  {ops.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
                <div className="col-span-5">
                  {renderValueInput({ ...filter, index }, column)}
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <button onClick={() => removeFilter(index)} className="text-xs text-red-500 hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FiltersBuilder;
