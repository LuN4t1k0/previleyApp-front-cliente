import React from "react";

const SkeletonBox = ({ height = "h-6", width = "w-full" }) => (
  <div className={`bg-gray-200 rounded ${height} ${width}`} />
);

const DashboardMoraAnaliticoSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse p-4">
      {/* Indicadores Ejecutivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={`metric-${i}`} className="p-4 bg-gray-100 rounded shadow-sm space-y-2">
            <SkeletonBox width="w-1/2" />
            <SkeletonBox height="h-8" width="w-2/3" />
            <SkeletonBox width="w-1/3" />
          </div>
        ))}
      </div>

      {/* Stacked por Estado Previred */}
      <div className="p-6 bg-gray-100 rounded shadow-sm space-y-4">
        <SkeletonBox width="w-1/3" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>

      {/* Entidades más riesgosas */}
      <div className="p-6 bg-gray-100 rounded shadow-sm space-y-4">
        <SkeletonBox width="w-2/3" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>

      {/* Comparativo Institución + Badges */}
      <div className="p-6 bg-gray-100 rounded shadow-sm space-y-4">
        <SkeletonBox width="w-1/2" />
        <div className="h-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {[...Array(3)].map((_, i) => (
            <div key={`badge-${i}`} className="h-16 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Evolución recuperación */}
      <div className="p-6 bg-gray-100 rounded shadow-sm space-y-4">
        <SkeletonBox width="w-2/3" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>

      {/* Top trabajadores con deuda */}
      <div className="p-6 bg-gray-100 rounded shadow-sm space-y-4">
        <SkeletonBox width="w-1/3" />
        {[...Array(5)].map((_, i) => (
          <div key={`trabajador-deuda-${i}`} className="h-10 bg-gray-200 rounded" />
        ))}
      </div>

      {/* Top trabajadores recuperado */}
      <div className="p-6 bg-gray-100 rounded shadow-sm space-y-4">
        <SkeletonBox width="w-1/3" />
        {[...Array(5)].map((_, i) => (
          <div key={`trabajador-recuperado-${i}`} className="h-10 bg-gray-200 rounded" />
        ))}
      </div>

      {/* Distribución Estado Previred (donut + detalle) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-gray-100 rounded shadow-sm space-y-4">
          <SkeletonBox width="w-1/2" />
          <div className="h-40 w-40 bg-gray-200 rounded-full mx-auto" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={`estado-detalle-${i}`} className="h-14 bg-gray-200 rounded" />
          ))}
        </div>
      </div>

      {/* Comparativo mensual */}
      <div className="p-6 bg-gray-100 rounded shadow-sm space-y-4">
        <SkeletonBox width="w-1/3" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>

      {/* Tabla resumen exportable */}
      <div className="p-6 bg-gray-100 rounded shadow-sm space-y-4">
        <SkeletonBox width="w-1/3" />
        {[...Array(4)].map((_, i) => (
          <div key={`row-export-${i}`} className="h-10 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  );
};

export default DashboardMoraAnaliticoSkeleton;