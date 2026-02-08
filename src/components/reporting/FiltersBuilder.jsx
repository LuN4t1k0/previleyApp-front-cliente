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
            className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs bg-white"
          />
          <input
            type={type === "date" ? "date" : "number"}
            value={filter.value?.to || ""}
            onChange={(e) =>
              updateFilter(filter.index, {
                value: { ...(filter.value || {}), to: e.target.value },
              })
            }
            className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs bg-white"
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
          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs bg-white"
        />
      );
    }

    return (
      <input
        type={type === "number" ? "number" : type === "date" ? "date" : "text"}
        value={filter.value || ""}
        onChange={(e) => updateFilter(filter.index, { value: e.target.value })}
        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs bg-white"
      />
    );
  };

  return (
    <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
            <span className="material-icons-round text-sm">filter_list</span>
          </div>
          <h2 className="font-bold text-slate-900">Filtros Inteligentes</h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={addFilter}
            className="p-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg transition"
          >
            <span className="material-icons-round text-[18px]">add</span>
          </button>
          <button onClick={clearFilters} className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100">
            Limpiar
          </button>
        </div>
      </div>
      {filters.length === 0 ? (
        <p className="text-center text-[11px] text-slate-400 italic">
          No hay filtros activos
        </p>
      ) : (
        <div className="space-y-3">
          {filters.map((filter, index) => {
            const column = columns.find((c) => c.key === filter.field);
            const ops = column?.allowedOps || ["eq"];
            return (
              <div
                key={`${filter.field}-${index}`}
                className="group bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 hover:border-blue-200 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Regla {index + 1}
                  </span>
                  <button
                    onClick={() => removeFilter(index)}
                    className="text-slate-400 hover:text-red-500 transition"
                  >
                    <span className="material-icons-round text-[16px]">close</span>
                  </button>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <select
                    className="col-span-5 rounded-lg border border-slate-200 px-2 py-1 text-xs bg-white"
                    value={filter.field}
                    onChange={(e) => {
                      const nextColumn = columns.find((c) => c.key === e.target.value);
                      const nextOp = nextColumn?.allowedOps?.[0] || "eq";
                      updateFilter(index, {
                        field: e.target.value,
                        op: nextOp,
                        value:
                          nextOp === "between" ? { from: "", to: "" } : nextOp === "in" ? [] : "",
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
                    className="col-span-3 rounded-lg border border-slate-200 px-2 py-1 text-xs bg-blue-50 text-blue-700 font-semibold"
                    value={filter.op}
                    onChange={(e) => {
                      const nextOp = e.target.value;
                      updateFilter(index, {
                        op: nextOp,
                        value:
                          nextOp === "between" ? { from: "", to: "" } : nextOp === "in" ? [] : "",
                      });
                    }}
                  >
                    {ops.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                  <div className="col-span-4">{renderValueInput({ ...filter, index }, column)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default FiltersBuilder;
