
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
      {/* Header + Tabs */}
      <div className="border-b border-tremor-border dark:border-dark-tremor-border">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center space-x-6">
            <div className="text-tremor-title font-semibold flex items-center space-x-2">
              <span className="text-xl">🧾</span>
              <span>{moduleTitle}</span>
            </div>

            {/* Tabs */}
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={cx(
                    activeTab === tab.key
                      ? 'text-tremor-brand border-tremor-brand'
                      : 'border-transparent text-tremor-content-emphasis hover:border-tremor-content-subtle hover:text-tremor-content-strong',
                    'inline-flex items-center border-b-2 px-2 text-tremor-default font-medium'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido */}
      {/* <div className="p-4 sm:p-6 lg:p-8"> */}
      <div >
        {/* Breadcrumb simulado */}
        {/* <p className="text-sm text-gray-500 mb-4">
          {moduleTitle} &nbsp;/&nbsp;
          <span className="font-medium">
            {visibleTabs.find(t => t.key === activeTab)?.label}
          </span>
        </p> */}
        {activeContent}
      </div>
    </>
  );
}
