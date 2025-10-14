export const formatPeriodo = (str) => {
  if (!str || str.length !== 6) return "Período inválido";
  const anio = str.slice(0, 4);
  const mes = str.slice(4, 6);
  return `${mes}/${anio}`;
};

export const unformatPeriodo = (str) => {
  if (!str || !str.includes("/")) return "";
  const [mes, anio] = str.split("/");
  return `${anio}${mes}`;
};
