'use client';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import BackButton from '@/components/Button/BackButton';

export default function ComisionesHub({ config }) {
  const { data: session } = useSession();
  const router = useRouter();

  const rol = session?.user?.rol;
  const visibles = config.filter((sec) => sec.roles.includes(rol));

  if (!visibles.length) return <p className="p-6">No tienes acceso a Comisiones.</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <BackButton />
        <h1 className="text-4xl font-semibold mt-4">Comisiones</h1>
        <p className="text-gray-600">Administra metas, resumen mensual y reportes cerrados desde un solo lugar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibles.map((sec) => (
          <button
            key={sec.name}
            onClick={() => router.push(sec.path)}
            className="bg-white border border-gray-200 rounded-2xl p-6 text-left shadow-sm hover:shadow-md transition"
          >
            <div className="text-3xl mb-4">{sec.icon}</div>
            <h3 className="text-xl font-semibold leading-tight">{sec.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{sec.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
