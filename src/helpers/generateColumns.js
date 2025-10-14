const getColumnStyles = (columnConfig = {}) => {
  return {
    textTransform: columnConfig.textTransform ?? "uppercase",
    headerAlign: columnConfig.headerAlign ?? "text-center",
    bodyAlign: columnConfig.meta?.align ?? "text-left",
  };
};