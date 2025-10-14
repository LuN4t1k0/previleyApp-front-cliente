import React from 'react';
import { MultiSelect, MultiSelectItem, TextInput } from '@tremor/react';
import DateRangeFilter from './DateRangeFilter'; // Asegúrate de que la ruta sea correcta

const FilterInputs = ({ filters, uniqueValues, handleFilterChange }) => {
  return (
    <div className="flex flex-row items-center space-x-2 flex-grow">
      {/* Filtro de Búsqueda por Nombre de Trabajador */}
      <TextInput
        placeholder="Buscar por nombre del trabajador..."
        value={filters.filter1?.value || ''}
        onChange={(e) => handleFilterChange('filter1', e.target.value)}
        className="flex-1"
        disabled={!filters.filter1}
      />

      {/* Filtro de Estado */}
      <MultiSelect
        onValueChange={(values) => handleFilterChange('filter2', values)}
        placeholder="Estado..."
        className="flex-1"
        disabled={!filters.filter2}
        value={filters.filter2?.value || []}
      >
        {uniqueValues.filter2?.map((value) => (
          <MultiSelectItem key={value} value={value}>{value}</MultiSelectItem>
        ))}
      </MultiSelect>

      {/* Filtro de Empresa Rut */}
      <MultiSelect
        onValueChange={(values) => handleFilterChange('filter3', values)}
        placeholder="Empresa Rut"
        className="flex-1"
        disabled={!filters.filter3}
        value={filters.filter3?.value || []}
      >
        {uniqueValues.filter3?.map((value) => (
          <MultiSelectItem key={value} value={value}>{value}</MultiSelectItem>
        ))}
      </MultiSelect>

      {/* Filtro de Trabajador Rut */}
      <MultiSelect
        onValueChange={(values) => handleFilterChange('filter4', values)}
        placeholder="Trabajador Rut"
        className="flex-1"
        disabled={!filters.filter4}
        value={filters.filter4?.value || []}
      >
        {uniqueValues.filter4?.map((value) => (
          <MultiSelectItem key={value} value={value}>{value}</MultiSelectItem>
        ))}
      </MultiSelect>

      {/* Filtro de Rango de Fechas */}
      <DateRangeFilter
        value={filters.dateRange?.value}
        onChange={(value) => handleFilterChange('dateRange', value)}
        disabled={!filters.dateRange}
        className="flex-1 sm:flex-none sm:w-48"
      />
    </div>
  );
};

export default React.memo(FilterInputs);
