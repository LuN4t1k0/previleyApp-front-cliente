import React from "react";

const SkeletonCard = ({ children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">{children}</div>
);

const SkeletonLine = ({ width, height = "h-4", className = "" }) => (
  <div className={`bg-gray-200 rounded ${height} ${width} ${className}`} />
);

const TrabajadorSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton para Datos Generales */}
      <SkeletonCard>
        <SkeletonLine width="w-1/4" height="h-6" />
        <div className="h-px bg-gray-200 my-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <SkeletonLine width="w-1/2" />
            <SkeletonLine width="w-3/4" height="h-7" className="bg-gray-300" />
          </div>
          <div className="space-y-2">
            <SkeletonLine width="w-1/3" />
            <SkeletonLine width="w-1/2" height="h-7" className="bg-gray-300" />
          </div>
          <div className="space-y-2 col-span-2">
            <SkeletonLine width="w-1/4" />
            <div className="flex gap-2">
              <SkeletonLine width="w-1/4" height="h-6" className="bg-gray-300" />
              <SkeletonLine width="w-1/4" height="h-6" className="bg-gray-300" />
            </div>
          </div>
        </div>
      </SkeletonCard>

      {/* Skeleton para Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="relative bg-white p-4 rounded-lg shadow-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-300" />
            <div className="mt-4 space-y-2">
              <SkeletonLine width="w-1/2" />
              <SkeletonLine width="w-3/4" height="h-8" className="bg-gray-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton para Tabla de Detalles (Licencias) */}
      <SkeletonCard>
        <SkeletonLine width="w-1/3" height="h-6" />
        <div className="mt-5 space-y-3">
          {/* Header */}
          <div className="flex gap-4 p-2 bg-gray-50 rounded-md">
            <SkeletonLine width="w-1/6" />
            <SkeletonLine width="w-1/6" />
            <SkeletonLine width="w-2/6" />
            <SkeletonLine width="w-1/6" />
            <SkeletonLine width="w-1/6" />
          </div>
          {/* Rows */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4 p-2 border-b border-gray-100">
              <SkeletonLine width="w-1/6" />
              <SkeletonLine width="w-1/6" className="bg-gray-300" />
              <SkeletonLine width="w-2/6" />
              <SkeletonLine width="w-1/6" />
              <SkeletonLine width="w-1/6" className="bg-gray-300" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
};

export default TrabajadorSkeleton;