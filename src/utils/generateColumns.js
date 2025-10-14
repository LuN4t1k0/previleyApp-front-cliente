
// import { RiLink } from "@remixicon/react";
// import { formatChileanPeso } from "@/utils/monetaryFormatUtils";
// import { formatDateChile, formatPeriodo } from "@/utils/formatDate";
// import { getFechaConBadge } from "@/utils/fechaVencimientoBadge";

// const formatColumnName = (name) =>
//   name.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

// const getColumnStyles = (columnConfig = {}) => {
//   return {
//     textTransform: columnConfig.textTransform ?? "uppercase",
//     headerAlign: columnConfig.headerAlign ?? "text-center",
//     bodyAlign: columnConfig.meta?.align ?? "text-left",
//   };
// };

// export const generateColumns = (
//   fields,
//   columnsConfig = [],
//   excludeColumns = [],
//   actionHandlers = {},
//   userRole,
//   columnOrder = [],
//   dateColumns = [],
//   monetaryColumns = [],
//   percentageColumns = [],
//   revisarFechaVencimiento = [],
//   periodoColumns = []
// ) => {
//   const columns = fields
//     .filter((field) => !excludeColumns.includes(field))
//     .map((field) => {
//       const columnConfig = columnsConfig.find(
//         (config) => config.accessorKey === field
//       );

//       if (
//         columnConfig?.rolesAllowed &&
//         !columnConfig.rolesAllowed.includes(userRole)
//       ) {
//         return null;
//       }

//       const isSortable = columnConfig?.sortable === true;

//       // const implicitType = dateColumns.includes(field)
//       //   ? "date"
//       //   : monetaryColumns.includes(field)
//       //   ? "monetary"
//       //   : percentageColumns.includes(field)
//       //   ? "percentage"
//       //   : null;

//       // NUEVO: agregamos periodoColumns para manejar columnas de periodo
//       const implicitType = dateColumns.includes(field)
//   ? "date"
//   : periodoColumns.includes(field)
//   ? "periodo"
//   : monetaryColumns.includes(field)
//   ? "monetary"
//   : percentageColumns.includes(field)
//   ? "percentage"
//   : null;

//       const type = columnConfig?.type || implicitType || "text";

//       const { textTransform, headerAlign, bodyAlign } = getColumnStyles(columnConfig);

//       const common = {
//         header: () => (
//           <span className={`${textTransform}`}>
//             {columnConfig?.header || formatColumnName(field)}
//           </span>
//         ),
//         accessorKey: field,
//         enableSorting: isSortable || false,
//         meta: {
//           align: bodyAlign,
//           headerAlign: headerAlign,
//           ...columnConfig?.meta,
//         },
//       };

//       switch (type) {
// case "periodo":
//   return {
//     ...common,
//     cell: ({ getValue }) => {
//       const value = getValue();
//       if (!value) return "";
//       return formatPeriodo(value); // o formatPeriodoLargo si prefieres
//     },
//     meta: {
//       ...common.meta,
//       align: "text-center",
//     },
//   };

//         case "link":
//   return {
//     ...common,
//     cell: ({ getValue }) => {
//       const value = getValue();
//       if (!value) return null;
//       const Icon = columnConfig?.Icono || RiLink;
//       return (
//         <a
//           href={value}
//           target="_blank"
//           rel="noopener noreferrer"
//           // className="text-blue-600 hover:underline inline-flex items-center gap-1"
//           className={`text-blue-600 hover:underline flex items-center ${columnConfig?.iconClass || ""} gap-1` }
//         >
//           <Icon className={columnConfig?.iconClass || ""} />
//           {columnConfig?.label || "Abrir"}
//         </a>
//       );
//     },
//   };

//         case "monetary":
//           return {
//             ...common,
//             cell: ({ getValue }) => {
//               const value = getValue();
//               return value == null ? "" : formatChileanPeso(value);
//             },
//             meta: {
//               ...common.meta,
//               align: "text-left",
//             },
//           };

//         case "percentage":
//           return {
//             ...common,
//             cell: ({ getValue }) => {
//               const value = getValue();
//               return value != null ? `${value}%` : "";
//             },
//             meta: {
//               ...common.meta,
//               align: "text-right",
//             },
//           };

//         case "date":
//           return {
//             ...common,
//             cell: ({ getValue }) => {
//               const rawDate = getValue();
//               if (!rawDate) return "";
//               if (revisarFechaVencimiento.includes(field)) {
//                 return getFechaConBadge(rawDate);
//               }
//               return formatDateChile(new Date(rawDate));
//             },
//             meta: {
//               ...common.meta,
//               align: "text-center",
//             },
//           };

//         case "actions":
//           return {
//             ...common,
//             enableSorting: false,
//             cell: ({ row }) => {
//               const rowData = row.original;
//               return (
//                 <div className="flex space-x-2">
//                   {columnConfig?.actions?.map((action) => {
//                     if (
//                       action.rolesAllowed &&
//                       !action.rolesAllowed.includes(userRole)
//                     ) return null;

//                     if (action.visibleWhen && !action.visibleWhen(rowData))
//                       return null;

//                     const Icon = action.icon || RiLink;
//                     return (
//                       <button
//                         key={action.id}
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           const handler = actionHandlers[action.id];
//                           if (!handler) return;
//                           if (action.id === "eliminar") {
//                             handler(rowData.id);
//                           } else {
//                             handler(rowData);
//                           }
//                         }}
//                         className={`hover:opacity-80 ${action.iconClass || ""}`}
//                         title={action.label}
//                       >
//                         <Icon />
//                       </button>
//                     );
//                   })}
//                 </div>
//               );
//             },
//             meta: {
//               ...common.meta,
//               align: "text-center",
//             },
//           };

//         default:
//           return {
//             ...common,
//             cell: ({ getValue }) => {
//               const value = getValue();
//               if (value == null) return "";
//               return <span className={textTransform}>{value}</span>;
//             },
//           };
//       }
//     })
//     .filter(Boolean);

//   const orderedColumns = columns.sort((a, b) => {
//     const indexA = columnOrder.indexOf(a.accessorKey);
//     const indexB = columnOrder.indexOf(b.accessorKey);
//     if (indexA === -1 && indexB === -1) return 0;
//     if (indexA === -1) return 1;
//     if (indexB === -1) return -1;
//     return indexA - indexB;
//   });

//   return orderedColumns;
// };


// REVISAR:
import { RiLink } from "@remixicon/react";
import { formatChileanPeso } from "@/utils/monetaryFormatUtils";
import { formatDateChile, formatPeriodo } from "@/utils/formatDate";
import { getFechaConBadge } from "@/utils/fechaVencimientoBadge";

const formatColumnName = (name) =>
  name.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

const getColumnStyles = (columnConfig = {}) => {
  return {
    textTransform: columnConfig.textTransform ?? "uppercase",
    headerAlign: columnConfig.headerAlign ?? "text-center",
    bodyAlign: columnConfig.meta?.align ?? "text-left",
  };
};

export const generateColumns = (
  fields,
  columnsConfig = [],
  excludeColumns = [],
  actionHandlers = {},
  userRole,
  columnOrder = [],
  dateColumns = [],
  monetaryColumns = [],
  percentageColumns = [],
  revisarFechaVencimiento = [],
  periodoColumns = []
) => {
  const columns = fields
    .filter((field) => !excludeColumns.includes(field))
    .map((field) => {
      const columnConfig = columnsConfig.find(
        (config) => config.accessorKey === field
      );

      if (
        columnConfig?.rolesAllowed &&
        !columnConfig.rolesAllowed.includes(userRole)
      ) {
        return null;
      }

      const isSortable = columnConfig?.sortable === true;

      const implicitType = dateColumns.includes(field)
        ? "date"
        : periodoColumns.includes(field)
        ? "periodo"
        : monetaryColumns.includes(field)
        ? "monetary"
        : percentageColumns.includes(field)
        ? "percentage"
        : null;

      const type = columnConfig?.type || implicitType || "text";

      const { textTransform, headerAlign, bodyAlign } =
        getColumnStyles(columnConfig);

      const common = {
        header: () => (
          <span className={`${textTransform}`}>
            {columnConfig?.header || formatColumnName(field)}
          </span>
        ),
        accessorKey: field,
        enableSorting: isSortable || false,
        meta: {
          align: bodyAlign,
          headerAlign: headerAlign,
          ...columnConfig?.meta,
        },
      };

      switch (type) {
        case "emailStatus":
          return {
            ...common,
            enableSorting: false,
            cell: ({ getValue, row }) => {
              const status = getValue();
              const dt = row?.original?.envioFecha
                ? formatDateChile(new Date(row.original.envioFecha))
                : null;
              const count = row?.original?.envioDestinatarios ?? 0;
              const variantMap = { queued: "warning", sent: "success", failed: "error", null: "neutral" };
              const variant = variantMap[status] || "neutral";
              const labelMap = { queued: "En cola", sent: "Enviada", failed: "Fallida" };
              const label = labelMap[status] || "-";
              const tooltip = dt || count ? `${label}${dt ? ` • ${dt}` : ""}${count ? ` • ${count} destinatarios` : ""}` : label;
              return (
                <span title={tooltip} className="inline-flex">
                  <span className={`px-2 py-0.5 rounded text-xs uppercase ${
                    variant === "success"
                      ? "bg-green-100 text-green-700"
                      : variant === "warning"
                      ? "bg-yellow-100 text-yellow-700"
                      : variant === "error"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>{label}</span>
                </span>
              );
            },
            meta: { ...common.meta, align: "text-center" },
          };
        case "periodo":
          return {
            ...common,
            cell: ({ getValue }) => {
              const value = getValue();
              if (!value) return "";
              return formatPeriodo(value);
            },
            meta: {
              ...common.meta,
              align: "text-center",
            },
          };

        case "link":
          return {
            ...common,
            cell: ({ getValue }) => {
              const value = getValue();
              if (!value) return null;
              const Icon = columnConfig?.Icono || RiLink;
              return (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-blue-600 hover:underline flex items-center ${
                    columnConfig?.iconClass || ""
                  } gap-1`}
                >
                  <Icon className={columnConfig?.iconClass || ""} />
                  {columnConfig?.label || "Abrir"}
                </a>
              );
            },
          };

        case "monetary":
          return {
            ...common,
            cell: ({ getValue }) => {
              const value = getValue();
              return value == null ? "" : formatChileanPeso(value);
            },
            meta: {
              ...common.meta,
              align: "text-left",
            },
          };

        case "percentage":
          return {
            ...common,
            cell: ({ getValue }) => {
              const value = getValue();
              return value != null ? `${value}%` : "";
            },
            meta: {
              ...common.meta,
              align: "text-right",
            },
          };

        case "date":
          return {
            ...common,
            cell: ({ getValue }) => {
              const rawDate = getValue();
              if (!rawDate) return "";
              if (revisarFechaVencimiento.includes(field)) {
                return getFechaConBadge(rawDate);
              }
              return formatDateChile(new Date(rawDate));
            },
            meta: {
              ...common.meta,
              align: "text-center",
            },
          };

        case "actions":
          return {
            ...common,
            enableSorting: false,
            cell: ({ row }) => {
              const rowData = row.original;
              return (
                <div className="flex justify-center items-center space-x-2">
                  {columnConfig?.actions?.map((action) => {
                    if (
                      action.rolesAllowed &&
                      !action.rolesAllowed.includes(userRole)
                    ) {
                      return null;
                    }

                    if (action.visibleWhen && !action.visibleWhen(rowData)) {
                      return null;
                    }

                    // Se asigna el componente a una variable con PascalCase (mayúscula inicial)
                    const IconComponent = action.icon;

                    if (!IconComponent) {
                      return null; // No renderizar nada si no hay ícono
                    }

                    return (
                      <button
                        key={action.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          const handler = actionHandlers[action.id];
                          if (!handler) return;
                          
                          // Se mantiene tu lógica original para el handler de eliminar
                          if (action.id === "eliminar") {
                            handler(rowData.id);
                          } else {
                            handler(rowData);
                          }
                        }}
                        className={`p-1 rounded-md transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 ${action.iconClass || ""}`}
                        title={action.label}
                      >
                        {/* Se renderiza el componente usando la variable en PascalCase */}
                        <IconComponent className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              );
            },
            meta: {
              ...common.meta,
              align: "text-center",
            },
          };

        default:
          return {
            ...common,
            cell: ({ getValue }) => {
              const value = getValue();
              if (value == null) return "";
              return <span className={textTransform}>{value}</span>;
            },
          };
      }
    })
    .filter(Boolean);

  const orderedColumns = columns.sort((a, b) => {
    const indexA = columnOrder.indexOf(a.accessorKey);
    const indexB = columnOrder.indexOf(b.accessorKey);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return orderedColumns;
};
