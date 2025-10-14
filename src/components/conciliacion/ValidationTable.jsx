'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, TextInput, Select, SelectItem, Button, Card, Text } from '@tremor/react';
import useActionFeedback from '@/hooks/useActionFeedback';
import apiService from '@/app/api/apiService';
import { useRouter } from 'next/navigation';

const EditableCell = ({ getValue, row, column, updateData }) => {
    const initialValue = getValue();
    const [value, setValue] = useState(initialValue);

    const onBlur = () => {
        updateData(row.index, column.id, value);
    };

    return (
        <TextInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            className="w-full"
        />
    );
};

const ValidationTable = ({ initialData, loteId, onProcessComplete }) => {
    const [data, setData] = useState(initialData);
    const [editedRows, setEditedRows] = useState({});
    const { runWithFeedback } = useActionFeedback();
    const router = useRouter();

    const updateData = (rowIndex, columnId, value) => {
        setData(old =>
            old.map((row, index) => {
                if (index === rowIndex) {
                    return { ...old[rowIndex], [columnId]: value };
                }
                return row;
            })
        );
        setEditedRows(old => ({
            ...old,
            [data[rowIndex].id]: { ...old[data[rowIndex].id], [columnId]: value }
        }));
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'estado',
            header: 'Estado',
            cell: ({ row }) => {
                const estado = row.original.estado;
                const color = estado === 'validado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
                return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{estado.replace('_', ' ')}</span>;
            }
        },
        {
            accessorKey: 'folio',
            header: 'Folio',
            cell: ({ row, column }) => {
                const { original } = row;
                if (original.estado === 'validado') return original.folio;

                const tieneSugerencia = original.sugerencias?.folio;
                if (tieneSugerencia) {
                    return (
                        <Select defaultValue={original.folio} onValueChange={(v) => updateData(row.index, column.id, v)}>
                            <SelectItem value={original.folio}>{original.folio} (Original)</SelectItem>
                            <SelectItem value={original.sugerencias.folio}>{original.sugerencias.folio} (Sugerido)</SelectItem>
                        </Select>
                    );
                }
                return <EditableCell {...{ getValue: () => original.folio, row, column, updateData }} />;
            }
        },
        { accessorKey: 'trabajadorRut', header: 'RUT Trabajador' },
        { accessorKey: 'monto', header: 'Monto' },
        { accessorKey: 'fecha', header: 'Fecha' },
        {
            accessorKey: 'errores',
            header: 'Detalle Error',
            cell: ({ row }) => <Text className="text-red-600">{row.original.errores}</Text>
        }
    ], [data]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        meta: { updateData }
    });

    const handleSaveChanges = async () => {
        const correcciones = Object.entries(editedRows).map(([id, cambios]) => ({
            id: Number(id),
            ...cambios
        }));

        await runWithFeedback({
            action: () => apiService.patch('/conciliacion/corregir', { correcciones }),
            loadingMessage: 'Guardando correcciones...',
            successMessage: 'Cambios guardados. El lote se ha actualizado.',
            errorMessage: 'Error al guardar los cambios.'
        });
        setEditedRows({});
        onProcessComplete(); // Revalida los datos de la página
    };

    const handleFinalizeProcess = async () => {
        await runWithFeedback({
            action: () => apiService.post(`/conciliacion/lote/${loteId}/cerrar`, { fechaProceso: new Date().toISOString().split('T')[0] }),
            loadingMessage: 'Finalizando y procesando el lote...',
            successMessage: '¡Lote procesado exitosamente!',
            errorMessage: 'Error al finalizar el proceso.'
        });
        router.push('/servicios/conciliacion-bruta');
    };
    
    const hasPendingRows = data.some(row => row.estado === 'pendiente_revision');

    return (
        <Card>
            <Table>
                <TableHead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <TableHeaderCell key={header.id}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHeaderCell>
                            ))}
                        </TableRow>
                    ))}
                </TableHead>
                <TableBody>
                    {table.getRowModel().rows.map(row => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="mt-6 flex justify-end space-x-4">
                {Object.keys(editedRows).length > 0 && (
                    <Button variant="secondary" onClick={handleSaveChanges}>Guardar Cambios</Button>
                )}
                <Button color="blue" onClick={handleFinalizeProcess} disabled={hasPendingRows}>
                    {hasPendingRows ? "Corrija los errores para finalizar" : "Finalizar y Procesar Lote"}
                </Button>
            </div>
        </Card>
    );
};

export default ValidationTable;