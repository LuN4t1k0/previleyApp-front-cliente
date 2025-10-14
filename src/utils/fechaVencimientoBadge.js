// // utils/fechaVencimientoBadge.js
// import { formatDateChile } from "@/utils/formatDate";
// import CustomBadge from "@/components/badge/Badge";

// export function getFechaConBadge(fechaRaw) {
//   if (!fechaRaw) return "";

//   const fecha = new Date(fechaRaw);
//   const hoy = new Date();
//   const formatted = formatDateChile(fecha);

//   let variant = "success"; // 🟢 Verde por defecto

//   if (fecha < hoy) {
//     variant = "error"; // 🔴 vencido
//   } else {
//     const mesesDiferencia =
//       (fecha.getFullYear() - hoy.getFullYear()) * 12 +
//       (fecha.getMonth() - hoy.getMonth());

//     if (mesesDiferencia <= 2) {
//       variant = "warning"; // 🟠 cerca
//     } else if (mesesDiferencia <= 6) {
//       variant = "amber"; // 🟡 media distancia
//     }
//   }

//   return <CustomBadge variant={variant}>{formatted}</CustomBadge>;
// }


// import { formatDateChile } from "@/utils/formatDate";
// import CustomBadge from "@/components/badge/Badge";

// export function getFechaConBadge(fechaRaw) {
//   if (!fechaRaw) return "";

//   const fecha = new Date(fechaRaw);
//   const hoy = new Date();
//   const formatted = formatDateChile(fecha);

//   // Inicializar como verde
//   let variant = "success";

//   if (fecha < hoy) {
//     variant = "error"; // 🔴 vencido
//   } else {
//     const mesesDiferencia =
//       (fecha.getFullYear() - hoy.getFullYear()) * 12 +
//       (fecha.getMonth() - hoy.getMonth());

//     if (mesesDiferencia <= 2) {
//       variant = "warning"; // 🟠 muy próximo
//     } else if (mesesDiferencia <= 6) {
//       variant = "amber"; // 🟡 proximidad media
//     } else {
//       variant = "success"; // 🟢 seguro
//     }
//   }

//   return <CustomBadge variant={variant}>{formatted}</CustomBadge>;
// }


import { formatDateChile } from "@/utils/formatDate";
import CustomBadge from "@/components/badge/Badge";

export function getFechaConBadge(fechaRaw) {
  if (!fechaRaw) return "";

  const fecha = new Date(fechaRaw);
  const hoy = new Date();
  const formatted = formatDateChile(fecha);

  let variant = "success";

  const mesesDiferencia =
    (fecha.getFullYear() - hoy.getFullYear()) * 12 +
    (fecha.getMonth() - hoy.getMonth());

  if (fecha < hoy) {
    variant = "error"; // 🔴 vencido
  } else if (mesesDiferencia <= 2) {
    variant = "warning"; // 🟠 muy cerca
  } else if (mesesDiferencia <= 6) {
    variant = "amber"; // 🟡 media distancia
  } else if (mesesDiferencia <= 12) {
    variant = "success"; // 🟢 dentro de 6-12 meses
  } else {
    variant = "info"; // 🟣 más de un año (opcional)
  }

  return <CustomBadge variant={variant}>{formatted}</CustomBadge>;
}
