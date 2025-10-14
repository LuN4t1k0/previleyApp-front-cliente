import React from 'react';
import { MultiSelect, MultiSelectItem, TextInput } from '@tremor/react';
import DateRangeFilter from './DateRangeFilter';

const GenericFilter = ({ filters, uniqueValues, handleFilterChange, filterConfig }) => (
  <>
    {filterConfig.map((filter) => {
      const currentValue = filters[filter.key]?.value || (filter.type === 'multiselect' ? [] : '');

      switch (filter.type) {
        case 'text':
          return (
            <TextInput
              key={filter.key}
              placeholder={filter.placeholder}
              value={currentValue}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            />
          );

        case 'multiselect':
          // console.log("uniqueValues:", uniqueValues);
          return (
            <MultiSelect
              key={filter.key}
              value={currentValue}
              placeholder={filter.placeholder}
              onValueChange={(values) => handleFilterChange(filter.key, values)}
              disabled={!uniqueValues[filter.key]?.length}
            >
              {uniqueValues[filter.key]?.map((option) =>
                typeof option === 'object' ? (
                  <MultiSelectItem key={option.value} value={option.value}>
                    {option.label}
                  </MultiSelectItem>
                ) : (
                  <MultiSelectItem key={option} value={option}>
                    {option}
                  </MultiSelectItem>
                )
              )}
            </MultiSelect>
          );

        case 'dateRange':
          return (
            <DateRangeFilter
              key={filter.key}
              onChange={(value) => handleFilterChange(filter.key, value)}
              placeholder={filter.placeholder}
              predefinedRanges={filter.predefinedRanges}
            />
          );

        default:
          return null;
      }
    })}
  </>
);

export default GenericFilter;
