import React, { useMemo } from "react";
import apiService from "@/app/api/apiService";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  RiMoneyDollarCircleLine,
  RiCalendarCheckLine,
} from "@remixicon/react";
import { formatDateChile } from "@/utils/formatDate";



const LicenciaDetailsContent = ({ licenseData, onClose }) => {
  console.log("LicenciaDetailsContent se está renderizando con:", licenseData);

  
  // Columnas para pagos de anticipos
  const advanceColumns = useMemo(
    () => [
      { header: "ID", accessorKey: "id" },
      {
        header: "Anticipo",
        accessorKey: "anticipo",
        cell: ({ cell }) =>
          `$${Intl.NumberFormat("es-CL", { minimumFractionDigits: 0 }).format(
            cell.getValue()
          )}`,
      },
      {
        header: "Fecha Anticipo",
        accessorKey: "fechaAnticipo",
        cell: ({ cell }) => formatDateChile(cell.getValue()),
      },
      { header: "Observaciones", accessorKey: "observaciones" },
    ],
    []
  );

  // Columnas para pagos de subsidios
  const subsidyColumns = useMemo(
    () => [
      { header: "ID", accessorKey: "id" },
      { header: "Días", accessorKey: "diasAutorizados" },
      { header: "Días Pagados", accessorKey: "diasPagados" },
      {
        header: "Subsidio",
        accessorKey: "subsidio",
        cell: ({ cell }) =>
          `$${Intl.NumberFormat("es-CL", { minimumFractionDigits: 0 }).format(
            cell.getValue()
          )}`,
      },
      {
        header: "Fecha Depósito",
        accessorKey: "fechaDeposito",
        cell: ({ cell }) => formatDateChile(cell.getValue()),
      },
      {
        header: "Monto",
        accessorKey: "montoDeposito",
        cell: ({ cell }) =>
          `$${Intl.NumberFormat("es-CL", { minimumFractionDigits: 0 }).format(
            cell.getValue()
          )}`,
      },
      { header: "Forma Pago", accessorKey: "formaPago" },
      { header: "Documento", accessorKey: "numeroDocumento" },
      { header: "Observaciones", accessorKey: "observaciones" },
    ],
    []
  );

  // Normalizar fuentes de datos (acepta 'pagosAnticipos' o 'anticipos')
  const anticiposData = useMemo(
    () => licenseData?.pagosAnticipos ?? licenseData?.anticipos ?? [],
    [licenseData]
  );
  const subsidiosData = useMemo(
    () => licenseData?.pagosSubsidios ?? licenseData?.subsidios ?? [],
    [licenseData]
  );

  // Configuración de la tabla de pagos de anticipos
  const advanceTable = useReactTable({
    data: anticiposData,
    columns: advanceColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Configuración de la tabla de pagos de subsidios
  const subsidyTable = useReactTable({
    data: subsidiosData,
    columns: subsidyColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Lógica para determinar el color del saldo basado en su valor
  const saldoColor = useMemo(() => {
    if (licenseData?.montos?.diferencia < 0) {
      return "red"; // Saldo negativo
    } else if (licenseData?.montos?.diferencia > 0) {
      return "green"; // Saldo positivo
    } else {
      return "gray"; // Saldo igual a cero
    }
  }, [licenseData?.montos?.diferencia]);

  // Definición de los montos destacados
  const montos = [
    {
      label: "Anticipo",
      value: licenseData?.montos?.anticipo,
      color: "green",
    },
    {
      label: "Subsidio",
      value: licenseData?.montos?.subsidio,
      color: "blue",
    },
    {
      label: "Saldo",
      value: licenseData?.montos?.diferencia,
      color: saldoColor, // Usamos la lógica para determinar el color
    },
  ];

  const reconciliar = async () => {
    try {
      await apiService.post(`/licencias-medicas/${licenseData?.folio}/reconciliar-huerfanos`);
      if (typeof window !== 'undefined') {
        window.alert('Reconciliación de huérfanos ejecutada.');
      }
    } catch (e) {
      if (typeof window !== 'undefined') {
        window.alert('No se pudo reconciliar huérfanos.');
      }
    }
  };

  return (
    <div>
      {/* Información General y del Trabajador */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
        <dl className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs">
          <div className="col-span-1">
            <dt className="font-bold text-gray-600 dark:text-gray-300">Folio</dt>
            <dd className="text-gray-900 text-xl dark:text-white">
              {licenseData?.folio}
            </dd>
          </div>
          <div className="col-span-1">
            <dt className="font-bold text-gray-600 dark:text-gray-300">RUT</dt>
            <dd className="text-gray-900 dark:text-white">
              {licenseData?.trabajador?.rut}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="font-bold text-gray-600 dark:text-gray-300">Nombre</dt>
            <dd className="text-gray-900 dark:text-white">
              {licenseData?.trabajador?.nombre}
            </dd>
          </div>
          <div className="col-span-1">
            <dt className="font-bold text-gray-600 dark:text-gray-300">Empleador</dt>
            <dd className="text-gray-900 dark:text-white">
              {licenseData?.empleador}
            </dd>
          </div>
          <div className="col-span-1">
            <dt className="font-bold text-gray-600 dark:text-gray-300">Entidad</dt>
            <dd className="text-gray-900 dark:text-white">
              {licenseData?.entidad}
            </dd>
          </div>
          <div className="col-span-1">
            <dt className="font-bold text-gray-600 dark:text-gray-300">Estado</dt>
            <dd className="text-gray-900 dark:text-white">
              {licenseData?.estadoLicencia}
            </dd>
          </div>
        </dl>
      </div>

      {/* Fechas Importantes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-teal-800 p-3 rounded-lg shadow-sm flex items-center">
          <div className="p-2 bg-green-100 dark:bg-green-700 rounded-full">
            <RiCalendarCheckLine
              size={20}
              className="text-green-600 dark:text-green-400"
            />
          </div>
          <div className="ml-3">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Fecha de Inicio
            </p>
            <p className={`text-lg font-bold text-green-700 dark:text-green-400`}>
              {formatDateChile(licenseData?.fechas?.inicio)}
            </p>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-800 p-3 rounded-lg shadow-sm flex items-center">
          <div className="p-2 bg-red-100 dark:bg-red-700 rounded-full">
            <RiCalendarCheckLine
              size={20}
              className="text-red-600 dark:text-red-400"
            />
          </div>
          <div className="ml-3">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Fecha de Término
            </p>
            <p className={`text-lg font-bold text-red-700 dark:text-red-400`}>
              {formatDateChile(licenseData?.fechas?.termino)}
            </p>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-800 p-3 rounded-lg shadow-sm flex items-center">
          <div className="p-2 bg-blue-100 dark:bg-blue-700 rounded-full">
            <RiCalendarCheckLine
              size={20}
              className="text-blue-600 dark:text-blue-400"
            />
          </div>
          <div className="ml-3">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Cantidad de Días
            </p>
            <p className={`text-lg font-bold text-blue-700 dark:text-blue-400`}>
              {licenseData?.diasLicencia}
            </p>
          </div>
        </div>
      </div>

      {/* Montos Destacados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {montos.map((monto, idx) => (
          <div
            key={idx}
            className={`bg-${monto.color}-50 dark:bg-${monto.color}-800 p-4 rounded-lg shadow-sm flex items-center`}
          >
            <RiMoneyDollarCircleLine
              size={24}
              className={`text-${monto.color}-600 dark:text-${monto.color}-400`}
            />
            <div className="ml-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                {monto.label}
              </p>
              <p
                className={`text-lg font-bold text-${monto.color}-700 dark:text-${monto.color}-400`}
              >
                {`$${Intl.NumberFormat("es-CL", {
                  minimumFractionDigits: 0,
                }).format(monto.value)}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagos de Anticipos */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Pagos de Anticipos
        </h4>
        <div className="overflow-x-auto">
          {anticiposData.length === 0 ? (
            <div className="text-xs text-tremor-content-subtle px-2 py-3">No hay anticipos para este folio.</div>
          ) : null}
          <Table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm">
            <TableHead>
              {advanceTable.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-gray-200 dark:bg-gray-700"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHeaderCell
                      key={header.id}
                      className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHeaderCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {advanceTable.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-3 py-2 text-xs text-gray-900 dark:text-white"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagos de Subsidios */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Pagos de Subsidios
        </h4>
        <div className="overflow-x-auto">
          {subsidiosData.length === 0 ? (
            <div className="text-xs text-tremor-content-subtle px-2 py-3">No hay subsidios para este folio.</div>
          ) : null}
          <Table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm">
            <TableHead>
              {subsidyTable.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-gray-200 dark:bg-gray-700"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHeaderCell
                      key={header.id}
                      className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHeaderCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {subsidyTable.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-3 py-2 text-xs text-gray-900 dark:text-white"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6 flex justify-end space-x-4">
            <Button
              className="px-4 py-2 border border-tremor-border text-sm rounded-lg hover:bg-tremor-background-muted transition-colors duration-200"
              onClick={reconciliar}
            >
              Reconciliar Huérfanos por Folio
            </Button>
            <Button
              className="px-4 py-2 bg-tremor-brand text-white text-sm rounded-lg hover:bg-tremor-brand-dark transition-colors duration-200"
              onClick={onClose}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

LicenciaDetailsContent.modalSize = "max-w-4xl"; // Define el tamaño aquí

export default LicenciaDetailsContent;
