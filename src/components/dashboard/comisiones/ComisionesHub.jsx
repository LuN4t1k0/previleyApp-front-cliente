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
    <div className="p-6 max-w-7xl mx-auto">
      <BackButton />
      <h1 className="text-3xl font-bold mb-2">💼 Comisiones</h1>
      <p className="text-gray-600 mb-6">Selecciona una sección para revisar o gestionar.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibles.map((sec) => (
          <div
            key={sec.name}
            onClick={() => router.push(sec.path)}
            className="cursor-pointer border border-gray-200 rounded-xl p-6 bg-white hover:shadow-lg transition"
          >
            <div className="text-4xl mb-2">{sec.icon}</div>
            <h3 className="text-xl font-semibold">{sec.name}</h3>
            <p className="text-sm text-gray-500">{sec.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

