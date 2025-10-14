
// 'use client';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import BackButton from '@/components/Button/BackButton';


// export default function AdminHub({ config }) {
//   const { data: session } = useSession();
//   const router = useRouter();

//   const rol = session?.user?.rol;
//   const nombre = session?.user?.nombre || '';
//   const apellido = session?.user?.apellido || '';
//   const saludo = nombre || apellido ? `, ${nombre} ${apellido}` : '';

//   const visibles = config.filter(sec => sec.roles.includes(rol));

//   if (!visibles.length) return <p className="p-6">No tienes acceso a ninguna sección administrativa.</p>;

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <BackButton /> 

//       <h1 className="text-3xl font-bold mb-2">👑 Administración{saludo}</h1>
//       <p className="text-gray-600 mb-6">Selecciona una sección para administrar</p>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {visibles.map((sec) => (
//           <div
//             key={sec.name}
//             onClick={() => router.push(sec.path)}
//             className="cursor-pointer border border-gray-200 rounded-xl p-6 bg-white hover:shadow-lg transition"
//           >
//             <div className="text-4xl mb-2">{sec.icon}</div>
//             <h2 className="text-xl font-semibold">{sec.name}</h2>
//             <p className="text-sm text-gray-500">{sec.description}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


'use client';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import BackButton from '@/components/Button/BackButton';

export default function AdminHub({ config }) {
  const { data: session } = useSession();
  const router = useRouter();

  const rol = session?.user?.rol;
  const nombre = session?.user?.nombre || '';
  const apellido = session?.user?.apellido || '';
  const saludo = nombre || apellido ? `, ${nombre} ${apellido}` : '';

  const visibles = config.filter(sec => sec.roles.includes(rol));

  if (!visibles.length) return <p className="p-6">No tienes acceso a ninguna sección administrativa.</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BackButton />
      <h1 className="text-3xl font-bold mb-2">👑 Administración{saludo}</h1>
      <p className="text-gray-600 mb-6">Selecciona una sección para administrar</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibles.map((sec) => (
          <div
            key={sec.name}
            onClick={() => router.push(sec.path)}
            className={`cursor-pointer border border-gray-200 rounded-2xl p-6 bg-white hover:shadow-md transition relative ${
              sec.highlight ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="text-3xl w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {sec.icon}
            </div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              {sec.name}
              {sec.badge && (
                <span className={`text-xs px-2 py-0.5 rounded-full bg-${sec.badge.color}-100 text-${sec.badge.color}-800`}>
                  {sec.badge.label}
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{sec.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
