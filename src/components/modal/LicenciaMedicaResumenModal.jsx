import React, { useMemo, useEffect, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import { RiCloseLine, RiMoneyDollarCircleLine, RiCalendarCheckLine } from "@remixicon/react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";



  const LicenciaDetailsModal = ({ onClose, licenseData }) => {
  console.log("LicenciaDetailsModal se está renderizando con:", licenseData);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Formateo de fechas
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Columnas para pagos de anticipos
  const advanceColumns = useMemo(
    () => [
      { header: "ID", accessorKey: "id" },
      {
        header: "Anticipo",
        accessorKey: "anticipo",
        cell: ({ cell }) =>
          `$${Intl.NumberFormat("es-CL", { minimumFractionDigits: 0 }).format(cell.getValue())}`,
      },
      {
        header: "Fecha Anticipo",
        accessorKey: "fechaAnticipo",
        cell: ({ cell }) => formatDate(cell.getValue()),
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
          `$${Intl.NumberFormat("es-CL", { minimumFractionDigits: 0 }).format(cell.getValue())}`,
      },
      {
        header: "Fecha Depósito",
        accessorKey: "fechaDeposito",
        cell: ({ cell }) => formatDate(cell.getValue()),
      },
      {
        header: "Monto",
        accessorKey: "montoDeposito",
        cell: ({ cell }) =>
          `$${Intl.NumberFormat("es-CL", { minimumFractionDigits: 0 }).format(cell.getValue())}`,
      },
      { header: "Forma Pago", accessorKey: "formaPago" },
      { header: "Documento", accessorKey: "numeroDocumento" },
      { header: "Observaciones", accessorKey: "observaciones" },
    ],
    []
  );

  // Configuración de la tabla de pagos de anticipos
  const advanceTable = useReactTable({
    data: licenseData?.pagosAnticipos || [],
    columns: advanceColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Configuración de la tabla de pagos de subsidios
  const subsidyTable = useReactTable({
    data: licenseData?.pagosSubsidios || [],
    columns: subsidyColumns,
    getCoreRowModel: getCoreRowModel(),
  });



  return (
    <Dialog open={true} onClose={onClose} className="z-50">
      <DialogPanel className="max-w-4xl w-full p-6 md:p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-y-auto max-h-screen">
        
        {/* Encabezado del Modal */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Detalle Licencia Médica</h3>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <RiCloseLine className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Información General y del Trabajador */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 ">
          <dl className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs">
            <div className="col-span-1">
              <dt className="font-bold text-gray-600 dark:text-gray-300">Folio</dt>
              <dd className="text-gray-900 text-xl dark:text-white">{licenseData?.folio}</dd>
            </div>
            <div className="col-span-1">
              <dt className="font-bold text-gray-600 dark:text-gray-300">RUT</dt>
              <dd className="text-gray-900 dark:text-white">{licenseData?.trabajador?.rut}</dd>
            </div>
            <div className="col-span-2"> 
              <dt className="font-bold text-gray-600 dark:text-gray-300">Nombre</dt>
              <dd className="text-gray-900 dark:text-white">{licenseData?.trabajador?.nombre}</dd>
            </div>
            <div className="col-span-1">
              <dt className="font-bold text-gray-600 dark:text-gray-300">Empleador</dt>
              <dd className="text-gray-900 dark:text-white">{licenseData?.empleador}</dd>
            </div>
            <div className="col-span-1">
              <dt className="font-bold text-gray-600 dark:text-gray-300">Entidad</dt>
              <dd className="text-gray-900 dark:text-white">{licenseData?.entidad}</dd>
            </div>
            <div className="col-span-1">
              <dt className="font-bold text-gray-600 dark:text-gray-300">Estado</dt>
              <dd className="text-gray-900 dark:text-white">{licenseData?.estadoLicencia}</dd>
            </div>
          </dl>
        </div>

        {/* Fechas Importantes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-teal-800 p-3 rounded-lg shadow-sm flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-700 rounded-full">
              <RiCalendarCheckLine size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Fecha de Inicio</p>
              <p className={`text-lg font-bold text-green-700 dark:text-green-400`}>{formatDate(licenseData?.fechas?.inicio)}</p>
              
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-800 p-3 rounded-lg shadow-sm flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-700 rounded-full">
              <RiCalendarCheckLine size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Fecha de Término</p>
              <p className={`text-lg font-bold text-red-700 dark:text-red-400`}>{formatDate(licenseData?.fechas?.termino)}</p>
              
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-800 p-3 rounded-lg shadow-sm flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-700 rounded-full">
              <RiCalendarCheckLine size={20} className="text-blue-600 dark:text-blue-400" /> 
            </div>
            <div className="ml-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Cantidad de Días</p>
              <p className={`text-lg font-bold text-blue-700 dark:text-blue-400`}>{licenseData?.diasLicencia}</p>
              
            </div>
          </div>
        </div>

        {/* Montos Destacados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Anticipo", value: licenseData?.montos?.anticipo, color: "green" },
            { label: "Subsidio", value: licenseData?.montos?.subsidio, color: "blue" },
            { label: "Saldo", value: licenseData?.montos?.diferencia, color: "yellow" },
          ].map((monto, idx) => (
            <div
              key={idx}
              className={`bg-${monto.color}-50 dark:bg-${monto.color}-800 p-4 rounded-lg shadow-sm flex items-center`}
            >
              <RiMoneyDollarCircleLine size={24} className={`text-${monto.color}-600 dark:text-${monto.color}-400`} />
              <div className="ml-3">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{monto.label}</p>
                <p className={`text-lg font-bold text-${monto.color}-700 dark:text-${monto.color}-400`}>
                  {`$${Intl.NumberFormat("es-CL", { minimumFractionDigits: 0 }).format(monto.value)}`}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagos de Anticipos */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Pagos de Anticipos</h4>
          <div className="overflow-x-auto">
            <Table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <TableHead>
                {advanceTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-gray-200 dark:bg-gray-700">
                    {headerGroup.headers.map((header) => (
                      <TableHeaderCell
                        key={header.id}
                        className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHeaderCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {advanceTable.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-3 py-2 text-xs text-gray-900 dark:text-white">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Pagos de Subsidios</h4>
          <div className="overflow-x-auto">
            <Table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <TableHead>
                {subsidyTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-gray-200 dark:bg-gray-700">
                    {headerGroup.headers.map((header) => (
                      <TableHeaderCell
                        key={header.id}
                        className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHeaderCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {subsidyTable.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-3 py-2 text-xs text-gray-900 dark:text-white">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Botón de Cerrar */}
        <div className="mt-6 flex justify-end">
          <Button
            className="px-4 py-2 bg-tremor-brand text-white text-sm rounded-lg hover:bg-tremor-brand-dark transition-colors duration-200"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default LicenciaDetailsModal;




