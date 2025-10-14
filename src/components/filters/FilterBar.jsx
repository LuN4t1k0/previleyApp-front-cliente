import React from 'react';
import FilterInputs from './FilterInputs';
import ActionButtons from '../actions/ActionButtons';
import { useModal } from '@/context/ModalContext'; // Importar el hook de contexto

const FilterBar = ({
  filters,
  uniqueValues,
  handleFilterChange,
  canEdit,
  BulkUploadModalComponent,
}) => {
  const {
    openFormModal,
    openBulkUploadModal,
  } = useModal(); // Usar el contexto

  // Función para manejar la creación
  const handleCreate = () => {
    openFormModal();
  };

  // Función para manejar la carga masiva
  const handleBulkUpload = () => {
    openBulkUploadModal();
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex flex-row items-center justify-between space-x-4">
      {/* Filtros */}
      <FilterInputs 
        className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 w-full"
        filters={filters}
        uniqueValues={uniqueValues}
        handleFilterChange={handleFilterChange}
      />
      {/* Botones de Acción */}
      <ActionButtons 
        canEdit={canEdit}
        BulkUploadModalComponent={BulkUploadModalComponent}
        handleCreate={handleCreate}
        handleBulkUpload={handleBulkUpload}
      />
    </div>
  );
};

export default React.memo(FilterBar);


