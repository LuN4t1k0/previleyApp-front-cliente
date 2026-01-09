'use client';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import BackButton from '@/components/Button/BackButton';
import { cx } from '@/lib/utils';

const BADGE_COLOR_MAP = {
  green: { bg: '#D5F5E3', text: '#1E7A4C' },
  blue: { bg: '#DCEBFF', text: '#1E49B6' },
  purple: { bg: '#E7E2FF', text: '#5132C6' },
  orange: { bg: '#FFE8D6', text: '#B44E1F' },
  gray: { bg: '#ECEEF5', text: '#444A5A' },
};

export default function HubShell({
  config = [],
  title = 'Panel',
  icon = '🧭',
  subtitle = 'Selecciona una opción para continuar',
  showBack = false,
  theme = 'dashboard',
}) {
  const { data: session } = useSession();
  const router = useRouter();

  const rol = session?.user?.rol;
  const nombre = session?.user?.nombre || '';
  const apellido = session?.user?.apellido || '';
  const saludo = nombre || apellido ? `, ${nombre} ${apellido}` : '';

  if (!rol || !session) return <p className="p-6">Cargando acceso...</p>;

  // Filtramos los ítems por rol dentro de cada sección
  const seccionesVisibles = config
    .map((seccion) => ({
      title: seccion.title,
      items: seccion.items.filter((item) => item.roles.includes(rol)),
    }))
    .filter((s) => s.items.length > 0); // eliminar secciones vacías

  if (!seccionesVisibles.length) return <p className="p-6">No tienes acceso a esta sección.</p>;

  return (
    <section className={cx('pb-16', `theme-${theme}`)}>
      <div className="dashboard-gradient">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 pt-10 md:px-6 lg:px-8">
          {showBack && <BackButton />}

          <header className="glass-panel relative overflow-hidden rounded-[2.5rem] p-8 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="icon-chip h-12 w-12 text-2xl">{icon}</span>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--theme-primary)]">
                      Panel principal
                    </span>
                    <h1 className="mt-2 text-3xl font-semibold text-[color:var(--text-primary)] md:text-4xl">
                      {title}
                      {saludo && <span className="text-[color:var(--theme-primary)]">{saludo}</span>}
                    </h1>
                  </div>
                </div>
                <p className="max-w-2xl text-base text-[color:var(--text-secondary)] md:text-lg">
                  {subtitle}
                </p>
              </div>
            </div>
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[color:var(--theme-accent)]/40 blur-3xl" />
          </header>

          {seccionesVisibles.map((seccion, idx) => (
            <div key={idx} className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                  {seccion.title}
                </h2>
                <div className="mt-1 h-1 w-16 rounded-full bg-[color:var(--theme-accent)]" />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {seccion.items.map((sec) => {
                  const moduleTheme = sec.theme || 'dashboard';

                  return (
                    <article
                      key={sec.name}
                      onClick={() => router.push(sec.path)}
                      className={cx(
                        'group relative flex h-full cursor-pointer flex-col gap-4 rounded-[1.75rem] border border-white/50 bg-white/75 p-6 shadow-sm backdrop-blur transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_32px_70px_-45px_rgba(31,34,41,0.5)]',
                        `theme-${moduleTheme}`,
                        sec.highlight && 'ring-2 ring-[color:var(--theme-accent)]'
                      )}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          router.push(sec.path);
                        }
                      }}
                    >
                      {sec.badge && (
                        <span
                          className="badge-theme absolute right-4 top-4 inline-flex items-center px-2.5 py-1 text-[11px] uppercase tracking-wide"
                          style={
                            BADGE_COLOR_MAP[sec.badge.color]
                              ? {
                                  '--theme-badge-bg': BADGE_COLOR_MAP[sec.badge.color].bg,
                                  '--theme-badge-text': BADGE_COLOR_MAP[sec.badge.color].text,
                                }
                              : undefined
                          }
                        >
                          {sec.badge.label}
                        </span>
                      )}

                      <div className="icon-chip h-12 w-12 text-2xl transition-transform duration-300 group-hover:scale-105">
                        {sec.icon}
                      </div>

                      <div className="flex flex-1 flex-col gap-2">
                        <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">
                          {sec.name}
                        </h3>
                        <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">
                          {sec.description}
                        </p>
                      </div>

                      <span className="cta-link text-sm">
                        Ingresar
                        <span aria-hidden="true" className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-0.5">
                          →
                        </span>
                      </span>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
