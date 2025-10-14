
"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DashboardHub({ modules }) {
  const { data: session } = useSession();
  const router = useRouter();

  if (!modules.length) return <p className="p-6">Cargando módulos disponibles...</p>;

  const nombre = session?.user?.nombre || "";
  const apellido = session?.user?.apellido || "";
  const saludo = nombre || apellido ? `, ${nombre} ${apellido}` : "";

  // Agrupamos módulos por categoría
  const administracion = modules.filter(mod => mod.category === "admin");
  const servicios = modules.filter(mod => mod.category === "servicio");

  const renderSection = (title, items) => (
    <>
      <h2 className="text-xl font-semibold mt-10 mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((mod) => (
          <div
            key={mod.name}
            onClick={() => router.push(mod.path)}
            className="cursor-pointer border border-gray-200 rounded-xl p-6 bg-white hover:shadow-lg transition"
          >
            <div className="text-4xl mb-2">{mod.icon}</div>
            <h3 className="text-xl font-semibold">{mod.name}</h3>
            <p className="text-sm text-gray-500">{mod.description}</p>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">👋 ¡Bienvenido{saludo}!</h1>
      <p className="text-gray-600 mb-6">Selecciona el módulo que deseas revisar</p>

      {administracion.length > 0 && renderSection("Administración", administracion)}
      {servicios.length > 0 && renderSection("Servicios", servicios)}
    </div>
  );
}
