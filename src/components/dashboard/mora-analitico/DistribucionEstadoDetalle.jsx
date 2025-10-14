


// "use client";

// import { useEffect, useState } from "react";
// import { Card, Title, Text, DonutChart, Grid } from "@tremor/react";
// import {
//   RiAlertLine,
//   RiShieldCheckLine,
//   RiFileWarningLine,
// } from "@remixicon/react";
// import apiService from "@/app/api/apiService";

// // Mapeo de claves inconsistentes
// const estadoKeyMap = {
//   judicial: "Judicial",
//   prejudicial: "PreJudicial",
//   "pre judicial": "PreJudicial",
//   previred: "Previred",
// };

// // Estilos visuales
// const coloresEstado = {
//   Judicial: "rose",
//   PreJudicial: "amber",
//   Previred: "yellow",
// };

// const iconosEstado = {
//   Judicial: <RiAlertLine className="text-rose-600 dark:text-rose-400 size-5" />,
//   PreJudicial: <RiFileWarningLine className="text-amber-500 dark:text-amber-400 size-5" />,
//   Previred: <RiShieldCheckLine className="text-yellow-500 dark:text-yellow-400 size-5" />,
// };

// const fondoEstado = {
//   Judicial: "bg-rose-100 dark:bg-rose-400/10",
//   PreJudicial: "bg-amber-100 dark:bg-amber-400/10",
//   Previred: "bg-yellow-100 dark:bg-yellow-300/10",
// };

// const textoEstado = {
//   Judicial: "text-rose-800 dark:text-rose-400",
//   PreJudicial: "text-amber-800 dark:text-amber-400",
//   Previred: "text-yellow-800 dark:text-yellow-400",
// };

// const DistribucionEstadoDetalle = ({ empresaRut }) => {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await apiService.get(`/mora-dashboard/${empresaRut}/estado-previred`);
//         setData(res.data.data || []);
//       } catch (error) {
//         console.error("❌ Error cargando distribución por estado:", error);
//       }
//     };
//     if (empresaRut) fetchData();
//   }, [empresaRut]);

//   const formatter = (value) =>
//     new Intl.NumberFormat("es-CL", {
//       style: "currency",
//       currency: "CLP",
//       maximumFractionDigits: 0,
//     }).format(value);

//   const estadosLimpios = data.map((item) =>
//     estadoKeyMap[item.estado.toLowerCase()] || "Desconocido"
//   );

//   let estadoRiesgoActual = null;
//   if (estadosLimpios.includes("Judicial")) estadoRiesgoActual = "Judicial";
//   else if (estadosLimpios.includes("PreJudicial")) estadoRiesgoActual = "PreJudicial";

//   const renderBadgeAlerta = (estado) => {
//     if (estado === estadoRiesgoActual) {
//       return (
//         <span className="ml-2 text-xs font-semibold bg-red-200 text-red-800 dark:bg-red-500/20 dark:text-red-300 px-2 py-0.5 rounded">
//           {estado === "Judicial" ? "🔥 Atención requerida" : "⚠️ Atención prioritaria"}
//         </span>
//       );
//     }
//     return null;
//   };

//   if (!data.length) return null;

//   return (
//     <Card>
//       <Title>📌 Estado de la Deuda por Nivel de Riesgo</Title>
//       <Text className="text-sm text-gray-500 mb-4">
//         Distribución total de deuda pendiente y número de casos por estado de riesgo.
//       </Text>

//       <Grid numItemsSm={1} numItemsLg={2} className="gap-6">
//         <DonutChart
//           data={data.map((item) => {
//             const key = estadoKeyMap[item.estado.toLowerCase()] || "Desconocido";
//             return {
//               name: key,
//               value: item.monto,
//             };
//           })}
//           category="value"
//           index="name"
//           colors={data.map((item) => {
//             const key = estadoKeyMap[item.estado.toLowerCase()] || "Desconocido";
//             return coloresEstado[key] || "slate";
//           })}
//           valueFormatter={formatter}
//           showLegend
//         />

//         <div className="space-y-3">
//           {data.map((item) => {
//             const key = estadoKeyMap[item.estado.toLowerCase()] || "Desconocido";

//             return (
//               <div
//                 key={item.estado}
//                 className={`flex items-center justify-between rounded p-3 border ${fondoEstado[key]} ${textoEstado[key]}`}
//               >
//                 <div className="flex items-center gap-3">
//                   {iconosEstado[key]}
//                   <Text className="font-medium">{key}</Text>
//                 </div>
//                 <Text className="text-sm flex items-center">
//                   {item.cantidad} casos
//                   {renderBadgeAlerta(key)}
//                 </Text>
//               </div>
//             );
//           })}
//         </div>
//       </Grid>
//     </Card>
//   );
// };

// export default DistribucionEstadoDetalle;

"use client";

import { useEffect, useState } from "react";
import { Card, Title, Text, DonutChart, Grid } from "@tremor/react";
import {
  RiAlertLine,
  RiShieldCheckLine,
  RiFileWarningLine,
} from "@remixicon/react";
import apiService from "@/app/api/apiService";
import {
  normalizarEstadoPrevired,
  ESTADOS_ORDENADOS,
  COLOR_MAP_ESTADO_PREVIRED,
} from "@/utils/estadoPrevired.utils";

// Íconos visuales para cada estado
const ICONOS_ESTADO_PREVIRED = {
  Judicial: <RiAlertLine className="text-rose-600 dark:text-rose-400 size-5" />,
  "Pre Judicial": <RiFileWarningLine className="text-amber-500 dark:text-amber-400 size-5" />,
  "No Judicial": <RiShieldCheckLine className="text-yellow-500 dark:text-yellow-400 size-5" />,
};

// Fondo e iconos por estado
const FONDO_ESTADO_PREVIRED = {
  Judicial: "bg-rose-100 dark:bg-rose-400/10",
  "Pre Judicial": "bg-amber-100 dark:bg-amber-400/10",
  "No Judicial": "bg-yellow-100 dark:bg-yellow-300/10",
};

const TEXTO_ESTADO_PREVIRED = {
  Judicial: "text-rose-800 dark:text-rose-400",
  "Pre Judicial": "text-amber-800 dark:text-amber-400",
  "No Judicial": "text-yellow-800 dark:text-yellow-400",
};

const DistribucionEstadoDetalle = ({ empresaRut }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiService.get(`/mora-dashboard/${empresaRut}/estado-previred`);
        setData(res.data.data || []);
      } catch (error) {
        console.error("❌ Error cargando distribución por estado:", error);
      }
    };
    if (empresaRut) fetchData();
  }, [empresaRut]);

  const formatter = (value) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(value);

  const estadosPresentes = data.map((item) =>
    normalizarEstadoPrevired(item.estado)
  );

  let estadoRiesgoActual = null;
  if (estadosPresentes.includes("Judicial")) estadoRiesgoActual = "Judicial";
  else if (estadosPresentes.includes("Pre Judicial")) estadoRiesgoActual = "Pre Judicial";

  const renderBadgeAlerta = (estado) => {
    if (estado === estadoRiesgoActual) {
      return (
        <span className="ml-2 text-xs font-semibold bg-red-200 text-red-800 dark:bg-red-500/20 dark:text-red-300 px-2 py-0.5 rounded">
          {estado === "Judicial" ? "🔥 Atención requerida" : "⚠️ Atención prioritaria"}
        </span>
      );
    }
    return null;
  };

  if (!data.length) return null;

  return (
    <Card>
      <Title>📌 Estado de la Deuda por Nivel de Riesgo</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Distribución total de deuda pendiente y número de casos por estado de riesgo.
      </Text>

      <Grid numItemsSm={1} numItemsLg={2} className="gap-6">
        <DonutChart
          data={data.map((item) => ({
            name: normalizarEstadoPrevired(item.estado),
            value: item.monto,
          }))}
          category="value"
          index="name"
          colors={data.map((item) => {
            const estado = normalizarEstadoPrevired(item.estado);
            return COLOR_MAP_ESTADO_PREVIRED[estado] || "slate";
          })}
          valueFormatter={formatter}
          showLegend
        />

        <div className="space-y-3">
          {data.map((item) => {
            const estado = normalizarEstadoPrevired(item.estado);
            const icono = ICONOS_ESTADO_PREVIRED[estado] || (
              <RiFileWarningLine className="text-gray-500 size-5" />
            );
            const fondo = FONDO_ESTADO_PREVIRED[estado] || "bg-gray-100";
            const texto = TEXTO_ESTADO_PREVIRED[estado] || "text-gray-800";

            return (
              <div
                key={estado}
                className={`flex items-center justify-between rounded p-3 border ${fondo} ${texto}`}
              >
                <div className="flex items-center gap-3">
                  {icono}
                  <Text className="font-medium">{estado}</Text>
                </div>
                <Text className="text-sm flex items-center">
                  {item.cantidad} casos
                  {renderBadgeAlerta(estado)}
                </Text>
              </div>
            );
          })}
        </div>
      </Grid>
    </Card>
  );
};

export default DistribucionEstadoDetalle;
