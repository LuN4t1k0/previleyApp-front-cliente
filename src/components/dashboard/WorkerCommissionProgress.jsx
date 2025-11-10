// // src/components/dashboard/WorkerCommissionProgress.jsx
// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import { getProgresoComision } from '@/services/comisionService';
// import { Card, Title, Text, ProgressBar, Flex } from '@tremor/react';
// import { formatChileanPeso } from '@/utils/monetaryFormatUtils';

// const WorkerCommissionProgress = ({ worker, period }) => {
//   const [progress, setProgress] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const fetchedRef = useRef(false);

//   useEffect(() => {
//     if (!worker?.id || !period?.from || !period?.to) return;
//     if (fetchedRef.current) return;

//     const fetchProgress = async () => {
//       try {
//         setLoading(true);
//         const params = { fechaDesde: period.from, fechaHasta: period.to };
//         if (worker.isAdminView) {
//           params.trabajadorId = worker.id;
//         }

//         console.log(`📈 Fetching progreso comisión para: ${worker.nombre} (${worker.id})`);
//         const response = await getProgresoComision(params);
//         setProgress(response.data.data);
//         setError('');
//         fetchedRef.current = true;
//       } catch (err) {
//         const errorMessage = err.response?.data?.message || 'Error al cargar el progreso';
//         setError(errorMessage);
//         setProgress(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProgress();
//   }, [worker, period]);

//   if (loading) {
//     return <Card><div className="p-6">Cargando datos para {worker.nombre}...</div></Card>;
//   }

//   const { gananciaRealTotal = 0, montoComision = 0, meta = 0 } = progress || {};
//   const progressPercentage = meta > 0 ? (gananciaRealTotal / meta) * 100 : 0;
//   const isMetaReached = gananciaRealTotal >= meta;

//   return (
//     <Card>
//       <div className="p-6">
//         <Title>{worker.nombre} {worker.apellido}</Title>
//         <Text>Meta de Ganancia: {formatChileanPeso(meta)}</Text>

//         {error && !progress ? (
//           <Text className="text-red-500 mt-4">{error}</Text>
//         ) : (
//           <>
//             <Flex className="mt-4">
//               <Text>{formatChileanPeso(gananciaRealTotal)}</Text>
//               <Text>{meta > 0 ? `${Math.round(progressPercentage)}%` : 'Sin meta'}</Text>
//             </Flex>
//             <ProgressBar value={progressPercentage} color={isMetaReached ? 'emerald' : 'blue'} className="mt-2" />

//             {isMetaReached && (
//               <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
//                 <Text className="text-emerald-700 font-medium">¡Meta Superada!</Text>
//                 <p className="text-tremor-metric font-semibold text-emerald-800">
//                   {formatChileanPeso(montoComision)}
//                 </p>
//                 <Text className="text-emerald-700">Comisión actual</Text>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </Card>
//   );
// };

// export default WorkerCommissionProgress;


// NUEVO: 
// src/components/dashboard/WorkerCommissionProgress.jsx
'use client';

import { useEffect, useState } from 'react';
import { getProgresoComision } from '@/services/comisionService';
import { Card, Title, Text, ProgressBar, Flex } from '@tremor/react';
import { formatChileanPeso } from '@/utils/monetaryFormatUtils';

const WorkerCommissionProgress = ({ worker, period }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Validaciones iniciales
    if (!worker?.id || !period?.from || !period?.to) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        setLoading(true);
        const params = { fechaDesde: period.from, fechaHasta: period.to };
        
        // Si la vista es de admin, SÍ enviamos el trabajadorId en los params
        if (worker.isAdminView) {
          params.trabajadorId = worker.id;
        }
        
        const response = await getProgresoComision(params);
        setProgress(response.data.data);
        setError('');
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Error al cargar el progreso';
        setError(errorMessage);
        setProgress(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [worker, period]); // Dependencias correctas

  if (loading) {
    return <Card><div className="p-6">Cargando datos para {worker.nombre}...</div></Card>;
  }

  const {
    totalProduccion = 0,
    ingresoPrevileyTotal = 0,
    metaProduccion = 0,
    porcentajeComision = 0,
    superoMeta = false,
    montoComision = 0,
    requiereConfiguracion = false,
  } = progress || {};

  if (requiereConfiguracion) {
    return (
      <Card>
        <div className="p-6">
          <Title>{worker.nombre} {worker.apellido}</Title>
          <Text className="text-amber-600 mt-4">
            Falta definir meta y porcentaje de comisión para este trabajador.
          </Text>
        </div>
      </Card>
    );
  }

  const progressPercentage = metaProduccion > 0 ? (totalProduccion / metaProduccion) * 100 : 0;

  return (
    <Card>
      <div className="p-6">
        <Title>{worker.nombre} {worker.apellido}</Title>
        <Text>Meta mensual: {metaProduccion ? formatChileanPeso(metaProduccion) : "No definida"}</Text>

        {error && !progress && (
          <Text className="text-red-500 mt-4">{error}</Text>
        )}

        <Flex className="mt-4">
          <div>
            <Text className="text-sm text-gray-500">Producción acumulada</Text>
            <p className="text-lg font-semibold">{formatChileanPeso(totalProduccion)}</p>
          </div>
          <div>
            <Text className="text-sm text-gray-500">Ingreso Previley</Text>
            <p className="text-lg font-semibold">{formatChileanPeso(ingresoPrevileyTotal)}</p>
          </div>
          <div>
            <Text className="text-sm text-gray-500">% comisión</Text>
            <p className="text-lg font-semibold">{porcentajeComision ? `${porcentajeComision}%` : '-'}</p>
          </div>
        </Flex>

        <div className="mt-4">
          <Flex>
            <Text>{formatChileanPeso(totalProduccion)}</Text>
            <Text>{metaProduccion > 0 ? `${Math.round(progressPercentage)}%` : 'Sin meta'}</Text>
          </Flex>
          <ProgressBar value={progressPercentage} color={superoMeta ? 'emerald' : 'blue'} className="mt-2" />
        </div>

        {superoMeta && (
          <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
            <Text className="text-emerald-700 font-medium">¡Meta superada!</Text>
            <p className="text-tremor-metric font-semibold text-emerald-800">
              {formatChileanPeso(montoComision)}
            </p>
            <Text className="text-emerald-700">Comisión estimada</Text>
          </div>
        )}
      </div>
    </Card>
  );
};

export default WorkerCommissionProgress;
