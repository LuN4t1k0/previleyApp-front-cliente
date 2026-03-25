const quickSections = [
  {
    title: "Acceso y seguridad",
    items: [
      "Ingreso con correo y contrasena corporativa.",
      "Bloqueo temporal por intentos fallidos.",
      "Activacion inicial mediante token.",
      "Cambio de contrasena desde Perfil.",
    ],
  },
  {
    title: "Navegacion principal",
    items: [
      "Inicio para resumen general.",
      "Dashboards para entrar a servicios contratados.",
      "Prefacturas para seguimiento documental y operativo.",
      "Reportes para consultas exportables.",
      "Documentos para descargar respaldos.",
    ],
  },
  {
    title: "Funciones para cliente admin",
    items: [
      "Creacion y edicion de subusuarios.",
      "Asignacion de empresas por usuario.",
      "Permisos sobre trabajadores protegidos.",
      "Cierre de sesiones, suspension y eliminacion.",
      "Carga manual o masiva de RUT protegidos.",
    ],
  },
];

const moduleCards = [
  {
    title: "Dashboards",
    description:
      "Acceso a servicios activos como Mora Presunta, Licencias Medicas y Pagos en Exceso, con selector de empresa y filtros por fecha.",
  },
  {
    title: "Prefacturas",
    description:
      "Busqueda por folio, filtros por empresa y estado, paginacion y acceso a detalle con documentos asociados.",
  },
  {
    title: "Documentos",
    description:
      "Consulta y descarga de prefacturas, facturas, certificados, detalles y comprobantes de pago.",
  },
  {
    title: "Reportes",
    description:
      "Seleccion de dataset, columnas, filtros, orden, vista previa y exportacion en CSV o XLSX con historial reciente.",
  },
];

const Documentacion = () => {
  return (
    <section className="pb-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-10 md:px-6">
        <header className="glass-panel relative overflow-hidden rounded-[2.5rem] p-8 md:p-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-blue-600">
            Documentacion
          </span>
          <h1 className="mt-3 text-3xl font-semibold text-[color:var(--text-primary)] sm:text-4xl">
            Guia de uso del portal cliente
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-[color:var(--text-secondary)] sm:text-base">
            Revisa como acceder al portal, navegar por tus servicios, consultar documentos,
            generar reportes y administrar subusuarios si cuentas con permisos de cliente admin.
          </p>
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {quickSections.map((section) => (
            <article
              key={section.title}
              className="glass-panel rounded-[2rem] p-6"
            >
              <h2 className="text-base font-semibold text-[color:var(--text-primary)]">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-[color:var(--text-secondary)]">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <section className="glass-panel rounded-[2rem] p-6 md:p-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">
              Modulos clave
            </h2>
            <p className="text-sm text-[color:var(--text-secondary)]">
              La visibilidad de modulos depende del rol del usuario y de los servicios
              contratados por las empresas asociadas.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {moduleCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[1.5rem] border border-white/60 bg-white/70 p-5 shadow-sm"
              >
                <h3 className="text-base font-semibold text-[color:var(--text-primary)]">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-6 md:p-8">
          <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">
            Recomendaciones de uso
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-[color:var(--text-secondary)] md:grid-cols-2">
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
              Filtra por empresa antes de revisar prefacturas, documentos o reportes.
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
              Si modificas empresas o permisos de un subusuario, el cambio aplica en su proximo inicio de sesion.
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
              Usa el historial de exportaciones para descargar reportes ya generados sin repetir el proceso.
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
              Manten tu correo y telefono actualizados desde la seccion Perfil.
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-6 md:p-8">
          <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">
            Manual extendido
          </h2>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
            El detalle completo del flujo de uso quedo documentado para el equipo en el archivo de manual del frontend cliente.
          </p>
          <div className="mt-4 inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
              front-cliente/docs/manual-uso-front-cliente.md
          </div>
        </section>
      </div>
    </section>
  );
};

export default Documentacion;
