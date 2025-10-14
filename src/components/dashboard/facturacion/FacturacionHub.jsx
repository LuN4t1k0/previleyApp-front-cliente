

// 'use client';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import BackButton from '@/components/Button/BackButton';

// export default function FacturacionHub({ config }) {
//   const { data: session } = useSession();
//   const router = useRouter();

//   const rol = session?.user?.rol;
//   const nombre = session?.user?.nombre || '';
//   const apellido = session?.user?.apellido || '';
//   const saludo = nombre || apellido ? `, ${nombre} ${apellido}` : '';

//   const visibles = config.filter(sec => sec.roles.includes(rol));

//   if (!visibles.length) return <p className="p-6">No tienes acceso a esta sección.</p>;

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <BackButton />
//       <h1 className="text-3xl font-bold mb-2">📊 Facturación{saludo}</h1>
//       <p className="text-gray-600 mb-6">
//         Selecciona una sección relacionada con facturación
//       </p>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {visibles.map((sec) => (
//           <div
//             key={sec.name}
//             onClick={() => router.push(sec.path)}
//             className={`relative cursor-pointer bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out border border-gray-100 group ${
//               sec.highlight ? 'ring-2 ring-blue-500' : ''
//             }`}
//           >
//             {/* Badge flotante */}
//             {sec.badge && (
//               <div
//                 className={`absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full ${
//                   {
//                     green: 'bg-green-100 text-green-700',
//                     blue: 'bg-blue-100 text-blue-700',
//                     purple: 'bg-purple-100 text-purple-700',
//                     orange: 'bg-orange-100 text-orange-700',
//                     gray: 'bg-gray-100 text-gray-700',
//                   }[sec.badge.color] || 'bg-gray-100 text-gray-700'
//                 }`}
//               >
//                 {sec.badge.label}
//               </div>
//             )}

//             {/* Ícono */}
//             <div className="w-12 h-12 text-3xl bg-gray-100 group-hover:bg-gray-200 rounded-full flex items-center justify-center mb-4 mx-auto text-gray-800">
//               {sec.icon}
//             </div>

//             <h3 className="text-center text-base font-semibold text-gray-900 mb-1">
//               {sec.name}
//             </h3>
//             <p className="text-center text-sm text-gray-500 leading-tight">
//               {sec.description}
//             </p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


import facturacionSections from '@/config/module/facturacionSections.config';
import HubShell from '@/components/shared/HubShell';

export default function FacturacionPage() {
  return (
    <HubShell
      config={facturacionSections}
      title="Facturación"
      icon="📊"
      subtitle="Selecciona una sección relacionada con facturación"
      showBack={true}
      theme="dashboard"
    />
  );
}
