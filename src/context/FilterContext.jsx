
// 'use client';
// import React, { createContext, useState, useCallback } from 'react';
// // import demoConfig from '@/config/demo/demo.config';
// // import demoConfig from '@/config/module/prefactura.config';

// export const FilterContext = createContext();

// export const FilterProvider = ({ children }) => {
//   const initialFilters = demoConfig.filters.reduce((acc, filter) => {
//     acc[filter.key] = { value: filter.type === 'multiselect' ? [] : '' };
//     return acc;
//   }, {});

//   const [filters, setFilters] = useState(initialFilters);

//   const handleFilterChange = useCallback((filterKey, newValue) => {
//     setFilters((prevFilters) => ({
//       ...prevFilters,
//       [filterKey]: {
//         ...prevFilters[filterKey],
//         value: newValue,
//       },
//     }));
//   }, []);

//   return (
//     <FilterContext.Provider value={{ filters, handleFilterChange }}>
//       {children}
//     </FilterContext.Provider>
//   );
// };


// NUEVO:

'use client';
import React, { createContext, useState, useCallback } from 'react';


export const FilterContext = createContext();

export const FilterProvider = ({ children, config }) => {
  const initialFilters = (config?.filters || []).reduce((acc, filter) => {

    acc[filter.key] = { value: filter.type === 'multiselect' ? [] : '' };
    return acc;
  }, {});

  const [filters, setFilters] = useState(initialFilters);

  const handleFilterChange = useCallback((filterKey, newValue) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: {
        ...prevFilters[filterKey],
        value: newValue,
      },
    }));
  }, []);

  return (
    <FilterContext.Provider value={{ filters, handleFilterChange }}>
      {children}
    </FilterContext.Provider>
  );
};
