import React, { useMemo } from "react";
import { Button } from "@tremor/react";

const BulkActions = React.memo(
  ({ selectedIds = [], filteredData, handleBulkDelete, canDelete, onSendSelected, totalCount }) => {
    const selectedCount = selectedIds.length;

    const visibleCount = filteredData?.length || 0;
    return (
      selectedCount > 0 && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-40 bg-white p-2 shadow-lg rounded-md flex items-center space-x-3 border border-gray-200">
          <span className="font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-md">{selectedCount}</span>
          <span className="text-sm">Seleccionadas</span>
          <span className="text-xs text-gray-500">• Visibles: {visibleCount}</span>
          {typeof totalCount === 'number' && (
            <span className="text-xs text-gray-500">• Total filtrado: {totalCount}</span>
          )}
          <span className="text-xs text-gray-500">• Estimado a enviar: {selectedCount}</span>
          {onSendSelected && selectedCount > 0 && (
            <Button
              color="blue"
              onClick={() => onSendSelected(selectedIds)}
            >
              Enviar seleccionadas
            </Button>
          )}
          {canDelete && handleBulkDelete && selectedCount > 0 && (
            <Button
              color="red"
              onClick={() => handleBulkDelete(selectedIds)}
            >
              Eliminar
            </Button>
          )}
        </div>
      )
    );
  }
);

BulkActions.displayName = "BulkActions";

export default BulkActions;
