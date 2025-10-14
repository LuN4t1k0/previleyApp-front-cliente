// /src/utils/monetaryFormatUtils.js

import CustomBadge from "@/components/badge/Badge";





// Función para formatear los valores en pesos chilenos
export const formatChileanPeso = (value) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(value);
};

// Función para renderizar un badge dependiendo del valor del monto
export const renderDifferenceBadge = (value) => {
  let variant = "neutral";
  if (value > 0) {
    variant = "success"; // Badge verde para saldos positivos
  } else if (value < 0) {
    variant = "error"; // Badge rojo para saldos negativos
  }

  return (
    <CustomBadge variant={variant}>
      {formatChileanPeso(value)}
    </CustomBadge>
  );
};
