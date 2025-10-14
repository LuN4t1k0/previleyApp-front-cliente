// // src/app/(authenticated)/(dashboard)/dashboard/comisiones/page.jsx
// 'use client';

// import { useEffect, useState, useMemo } from 'react';
// import useUserData from '@/hooks/useUserData';
// import { getTrabajadores } from '@/services/comisionService';
// import WorkerCommissionProgress from '@/components/dashboard/WorkerCommissionProgress';
// import { Grid, Col, Title, Text } from '@tremor/react';

// export default function ComisionesDashboardPage() {
//   const user = useUserData();
//   const [workers, setWorkers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const currentPeriod = useMemo(() => {
//     const today = new Date();
//     const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
//     const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
//     return { from: firstDay, to: lastDay };
//   }, []);

//   useEffect(() => {
//     if (!user) return;

//     if (user.rol === 'admin') {
//       const fetchWorkers = async () => {
//         try {
//           setLoading(true);
//           const response = await getTrabajadores();
//           const workerUsers = response.data.data.map(w => ({ ...w, isAdminView: true }));

//           // Solo actualiza si hay cambios reales
//           const sameLength = workers.length === workerUsers.length;
//           const sameIds = workers.every((w, i) => w.id === workerUsers[i]?.id);

//           if (!sameLength || !sameIds) {
//             setWorkers(workerUsers);
//           }
//         } catch (error) {
//           console.error("Error fetching workers:", error);
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchWorkers();
//     } else if (user.rol === 'trabajador') {
//       setWorkers([user]);
//       setLoading(false);
//     }
//   }, [user]);

//   const getPeriodoTitle = () => {
//     const date = new Date();
//     return date.toLocaleString('es-CL', { month: 'long', year: 'numeric' });
//   };

//   return (
//     <main className="p-4 md:p-10 mx-auto max-w-7xl">
//       <Title>Dashboard de Comisiones</Title>
//       <Text>Progreso para el período de <span className="font-semibold capitalize">{getPeriodoTitle()}</span></Text>

//       {loading ? (
//         <Text className="mt-6">Cargando dashboard...</Text>
//       ) : (
//         <Grid numItemsMd={2} numItemsLg={3} className="mt-6 gap-6">
//           {workers.map((worker) => (
//             <Col key={worker.id}>
//               <WorkerCommissionProgress worker={worker} period={currentPeriod} />
//             </Col>
//           ))}
//         </Grid>
//       )}

//       {!loading && workers.length === 0 && (
//         <Text className="mt-6">No hay datos para mostrar.</Text>
//       )}
//     </main>
//   );
// }


// NUEVO:

// src/app/(authenticated)/(dashboard)/dashboard/comisiones/page.jsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import useUserData from '@/hooks/useUserData'; // Asumiendo que el hook corregido está aquí
import { getTrabajadores } from '@/services/comisionService';
import WorkerCommissionProgress from '@/components/dashboard/WorkerCommissionProgress';
import { Grid, Col, Title, Text } from '@tremor/react';

export default function ComisionesDashboardPage() {
  const user = useUserData();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // useMemo es perfecto para valores que no cambian en cada render
  const currentPeriod = useMemo(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    return { from: firstDay, to: lastDay };
  }, []);

  useEffect(() => {
    // Si no tenemos usuario, no hacemos nada.
    if (!user) {
        setLoading(false);
        return;
    };

    if (user.rol === 'admin') {
      const fetchWorkers = async () => {
        setLoading(true);
        try {
          const response = await getTrabajadores();
          // Marcamos que esta vista es de admin para que el componente hijo sepa que debe pasar el ID
          const workerUsers = response.data.data.map(w => ({ ...w, isAdminView: true }));
          setWorkers(workerUsers);
        } catch (error) {
          console.error("Error fetching workers:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchWorkers();
    } else if (user.rol === 'trabajador') {
      // Si es trabajador, la lista es solo él mismo.
      // Su `id` es el `usuarioId`, el backend se encarga del resto.
      setWorkers([user]);
      setLoading(false);
    }
  }, [user]); // El useEffect se ejecutará solo cuando el objeto user cambie

  const getPeriodoTitle = () => {
    const date = new Date();
    return date.toLocaleString('es-CL', { month: 'long', year: 'numeric' });
  };

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Dashboard de Comisiones</Title>
      <Text>Progreso para el período de <span className="font-semibold capitalize">{getPeriodoTitle()}</span></Text>

      {loading ? (
        <Text className="mt-6">Cargando dashboard...</Text>
      ) : (
        <Grid numItemsMd={2} numItemsLg={3} className="mt-6 gap-6">
          {workers.map((worker) => (
            <Col key={worker.id}>
              <WorkerCommissionProgress worker={worker} period={currentPeriod} />
            </Col>
          ))}
        </Grid>
      )}

      {!loading && workers.length === 0 && (
        <Text className="mt-6">No hay datos de trabajadores para mostrar.</Text>
      )}
    </main>
  );
}