
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { cx } from '@/lib/utils';


export default function PageShell({ tabsConfig, moduleTitle = 'Módulo' }) {
  const { data: session, status } = useSession();
  const [visibleTabs, setVisibleTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [hasAccess, setHasAccess] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabFromUrl = searchParams?.get('tab');

  useEffect(() => {
    if (status !== 'authenticated') return;

    const rol = session?.user?.rol;
    const filteredTabs = tabsConfig.filter(tab =>
      tab.rolesAllowed.includes(rol)
    );

    setVisibleTabs(filteredTabs);

    if (filteredTabs.length === 0) {
      setHasAccess(false);
      return;
    }

    const validTabFromUrl = filteredTabs.find(t => t.key === tabFromUrl);

    if (validTabFromUrl) {
      setActiveTab(validTabFromUrl.key);
    } else {
      setActiveTab(filteredTabs[0].key);
    }
  }, [session, tabFromUrl, tabsConfig, status]);

  // Mostrar alerta si no tiene acceso a ningún tab
  useEffect(() => {
    if (hasAccess === false) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permisos para acceder a este módulo.',
        confirmButtonText: 'Volver al inicio',
        timer: 4000,
        timerProgressBar: true,
      }).then(() => {
        router.push('/dashboard');
      });
    }
  }, [hasAccess, router]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', key);
    router.replace(`?${params.toString()}`);
  };

  const activeContent = visibleTabs.find(tab => tab.key === activeTab)?.component;

  // Mientras carga la sesión, los tabs, o el tab activo
  if (
    status !== 'authenticated' ||
    !session?.user?.rol ||
    !activeTab ||
    visibleTabs.length === 0
  ) {
    return (
      <div className="p-6 text-gray-500 animate-pulse">
        Cargando módulo...
      </div>
    );
  }

  return (
    <>
      <div className="px-4 pt-6 md:px-6">
        <div className="glass-panel rounded-[2rem] px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--theme-soft)] text-lg">
                🧾
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--text-secondary)]">
                  Módulo
                </p>
                <h1 className="text-lg font-semibold text-[color:var(--text-primary)]">
                  {moduleTitle}
                </h1>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2" aria-label="Tabs">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={cx(
                    activeTab === tab.key
                      ? 'bg-[color:var(--theme-primary)] text-white'
                      : 'bg-white text-[color:var(--text-secondary)] hover:text-[color:var(--theme-primary)]',
                    'inline-flex items-center rounded-full border border-white/60 px-4 py-2 text-xs font-semibold transition shadow-sm'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div>{activeContent}</div>
    </>
  );
}
