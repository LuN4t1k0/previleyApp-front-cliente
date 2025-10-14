// export const convertFiltersToQueryParams = (filters, configFilters) => {
//   const params = {};
//   configFilters.forEach(({ key, type, field, dateStartSuffix, dateEndSuffix }) => {
//     const value = filters[key]?.value;
//     if (!value) return;

//     if (type === "text") {
//       params[field] = value;
//     } else if (type === "multiselect") {
//       params[field] = value.join(",");
//     } else if (type === "dateRange") {
//       if (value.from) params[dateStartSuffix || "inicio"] = value.from.toISOString().split("T")[0];
//       if (value.to) params[dateEndSuffix || "termino"] = value.to.toISOString().split("T")[0];
//     }
//   });
//   return params;
// };


// NUEVO:
export const convertFiltersToQueryParams = (filters, configFilters) => {
  const params = {};

  configFilters.forEach(({ key, type }) => {
    const value = filters[key]?.value;
    if (!value) return;

    if (type === "text") {
      params[key] = value;
    } else if (type === "multiselect") {
      params[key] = Array.isArray(value) ? value.join(",") : value;
    } else if (type === "dateRange") {
      if (value.from) params[`${key}_inicio`] = value.from.toISOString().split("T")[0];
      if (value.to) params[`${key}_termino`] = value.to.toISOString().split("T")[0];
    }
  });

  return params;
};
