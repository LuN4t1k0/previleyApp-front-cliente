// REVISAR:
// import { useState, useEffect } from 'react';
// import apiService from '@/app/api/apiService';

// export const useFilters = (filtersPath, queryParams = {}, filterConfig) => {
//   const [data, setData] = useState(null);
//   const [uniqueValues, setUniqueValues] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const response = await apiService.get(filtersPath, { params: queryParams });

//         if (response.data && response.data.success) {
//           const filterData = response.data.data;
//           setData(filterData);

//           // ✅ Corregido: usar filter.key como referencia
//           const newUniqueValues = {};
//           filterConfig.forEach((filter) => {
//   // if (['multiselect', 'select'].includes(filter.type) && filter.key in filterData) {
//   //   newUniqueValues[filter.key] = filterData[filter.key];
//   // }
//   if (['multiselect', 'select'].includes(filter.type) && filter.key in filterData) {
//   newUniqueValues[filter.key] = filterData[filter.key];
// }
// console.log("Filter Key:", filter.key, "→", filterData[filter.key]);
// });

//           setUniqueValues(newUniqueValues);
//           setError(null);
//         } else {
//           throw new Error('No data received or success flag is false');
//         }
//       } catch (err) {
//         setError(err.message);
//         setData(null);
//         setUniqueValues({});
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [filtersPath, JSON.stringify(queryParams), JSON.stringify(filterConfig)]);

//   return { data, uniqueValues, loading, error };
// };


// NUEVO:
import { useState, useEffect, useCallback } from 'react';
import apiService from '@/app/api/apiService';

export const useFilters = (filtersPath, queryParams = {}, filterConfig) => {
  const [data, setData] = useState(null);
  const [uniqueValues, setUniqueValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ EXTRACCIÓN: función reutilizable para recargar filtros
  const fetchFilters = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get(filtersPath, { params: queryParams });

      if (response.data && response.data.success) {
        const filterData = response.data.data;
        setData(filterData);

        const newUniqueValues = {};
        filterConfig.forEach((filter) => {
          if (['multiselect', 'select'].includes(filter.type) && filter.key in filterData) {
            newUniqueValues[filter.key] = filterData[filter.key];
          }
        });

        setUniqueValues(newUniqueValues);
        setError(null);
      } else {
        throw new Error('No data received or success flag is false');
      }
    } catch (err) {
      setError(err.message);
      setData(null);
      setUniqueValues({});
    } finally {
      setLoading(false);
    }
  }, [filtersPath, JSON.stringify(queryParams), JSON.stringify(filterConfig)]);

  // ✅ useEffect inicial
  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  return {
    data,
    uniqueValues,
    loading,
    error,
    refetchFilters: fetchFilters, // ✅ esto lo usaremos desde afuera
  };
};
