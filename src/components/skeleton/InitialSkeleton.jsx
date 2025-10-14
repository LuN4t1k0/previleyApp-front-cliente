// import React from 'react';

// const InitialSkeleton = () => (
//   <div className="animate-pulse space-y-4">
//     {/* Título y Subtítulo Skeleton */}
//     <div className="h-6 bg-gray-200 rounded w-1/3"></div>
//     <div className="h-4 bg-gray-200 rounded w-2/3"></div>

//     {/* FilterBar Skeleton */}
//     <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
//       {/* Filtros Skeleton */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 w-full">
//         <div className="h-4 bg-gray-200 rounded flex-1"></div>
//         <div className="h-4 bg-gray-200 rounded flex-1"></div>
//         <div className="h-4 bg-gray-200 rounded sm:w-32"></div>
//         <div className="h-4 bg-gray-200 rounded sm:w-32"></div>
//         <div className="h-4 bg-gray-200 rounded sm:w-48"></div>
//       </div>
//       {/* Botones de Acción Skeleton */}
//       <div className="flex flex-wrap items-center space-x-2">
//         <div className="h-8 bg-gray-200 rounded w-24"></div>
//         <div className="h-8 bg-gray-200 rounded w-24"></div>
//         <div className="h-8 bg-gray-200 rounded w-24"></div>
//         <div className="h-8 bg-gray-200 rounded w-24"></div>
//         <div className="h-8 bg-gray-200 rounded w-24"></div>
//       </div>
//     </div>

//     {/* Tabla Skeleton */}
//     <div className="relative overflow-x-auto mt-8">
//       <div className="w-full bg-gray-200 h-48 rounded"></div>
//     </div>
//   </div>
// );

// export default InitialSkeleton;


import React from "react";

const SkeletonBox = ({ height = "h-4", width = "w-full", className = "" }) => (
  <div className={`bg-gray-200 dark:bg-gray-700 rounded ${height} ${width} ${className}`} />
);

const InitialSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      {/* Título y subtítulo */}
      <SkeletonBox height="h-6" width="w-1/4" />
      <SkeletonBox height="h-4" width="w-1/3" />

      {/* FilterBar */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-wrap gap-2 w-full">
          <SkeletonBox height="h-8" width="w-40" />
          <SkeletonBox height="h-8" width="w-48" />
          <SkeletonBox height="h-8" width="w-64" />
          <SkeletonBox height="h-8" width="w-32" />
        </div>
        <div className="flex gap-2">
          <SkeletonBox height="h-8" width="w-10" />
          <SkeletonBox height="h-8" width="w-10" />
          <SkeletonBox height="h-8" width="w-10" />
        </div>
      </div>

      {/* Tabla */}
      <div className="w-full overflow-hidden border border-gray-200 rounded-lg">
        {/* Cabecera */}
        <div className="grid grid-cols-12 gap-2 bg-gray-50 p-3">
          {[...Array(12)].map((_, i) => (
            <SkeletonBox key={`head-${i}`} height="h-4" />
          ))}
        </div>

        {/* Filas */}
        {[...Array(10)].map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid grid-cols-12 gap-2 border-t border-gray-100 p-3 items-center"
          >
            <SkeletonBox height="h-4" width="w-full" />
            <SkeletonBox height="h-4" width="w-full" />
            <SkeletonBox height="h-4" width="w-full" />
            <SkeletonBox height="h-4" width="w-12" />
            <SkeletonBox height="h-4" width="w-12" />
            <SkeletonBox height="h-4" width="w-16" />
            <SkeletonBox height="h-4" width="w-16" />
            <SkeletonBox height="h-4" width="w-12" />
            <SkeletonBox height="h-4" width="w-16" />
            <SkeletonBox height="h-4" width="w-24" />
            <SkeletonBox height="h-4" width="w-32" />
            <div className="flex justify-end space-x-2">
              <SkeletonBox height="h-4" width="w-4" />
              <SkeletonBox height="h-4" width="w-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="flex justify-center items-center space-x-2">
        <SkeletonBox height="h-8" width="w-8" />
        <SkeletonBox height="h-8" width="w-8" />
        <SkeletonBox height="h-8" width="w-8" />
      </div>
    </div>
  );
};

export default InitialSkeleton;
