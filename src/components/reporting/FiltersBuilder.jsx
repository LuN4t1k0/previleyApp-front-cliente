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
    <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <span className="material-icons-round text-purple-600">filter_alt</span>
          </div>
          <div>
            <h3 className="font-bold">Filtros Inteligentes</h3>
            <p className="text-xs text-slate-500">Refina los datos usando reglas lógicas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearFilters}
            className="text-sm font-medium text-slate-400 hover:text-slate-600"
          >
            Limpiar todo
          </button>
          <button
            onClick={addFilter}
            className="inline-flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
          >
            <span className="material-icons-round text-sm">add</span>
            Nueva Regla
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {filters.map((filter, index) => {
          const column = columns.find((c) => c.key === filter.field);
          const ops = column?.allowedOps || ["eq"];
          return (
            <div
              key={`${filter.field}-${index}`}
              className="group relative bg-slate-50 border border-slate-200 rounded-xl p-4 transition-all hover:border-blue-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Regla {index + 1}
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
                <button
                  onClick={() => removeFilter(index)}
                  className="material-icons-round text-slate-400 hover:text-red-500 transition-colors"
                >
                  delete_outline
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">
                    Columna
                  </label>
                  <select
                    className="w-full bg-white border-slate-200 rounded-lg text-sm focus:ring-primary focus:border-primary"
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
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">
                    Operador
                  </label>
                  <select
                    className="w-full bg-white border-slate-200 rounded-lg text-sm focus:ring-primary focus:border-primary"
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
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">
                    Valor
                  </label>
                  {renderValueInput({ ...filter, index }, column)}
                </div>
              </div>
            </div>
          );
        })}
        <button
          type="button"
          onClick={addFilter}
          className="w-full group relative bg-white border-dashed border-2 border-slate-200 rounded-xl p-4 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="material-icons-round text-slate-300">add_circle_outline</span>
            <span className="text-xs font-semibold text-slate-400">Añadir condición Y (AND)</span>
          </div>
        </button>
      </div>
    </section>
  );
};

export default FiltersBuilder;
