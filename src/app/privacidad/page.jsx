export const metadata = { title: "Política de privacidad | Previley" };

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-800">
      <article className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 sm:p-12">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Previley</p>
        <h1 className="text-3xl font-bold text-slate-950">Política de privacidad</h1>
        <p className="mt-3 text-sm text-slate-500">Última actualización: octubre de 2026</p>
        <div className="mt-10 space-y-7 leading-7">
          <section><h2 className="text-lg font-semibold text-slate-950">Datos que tratamos</h2><p>Tratamos los datos necesarios para autenticar usuarios, entregar los servicios contratados y mantener el historial de gestiones del cliente.</p></section>
          <section><h2 className="text-lg font-semibold text-slate-950">Seguridad</h2><p>Aplicamos controles de acceso y medidas técnicas razonables para proteger la información. No comparta sus credenciales ni códigos de acceso.</p></section>
          <section><h2 className="text-lg font-semibold text-slate-950">Consultas</h2><p>Si necesita conocer, corregir o solicitar información sobre sus datos, contacte a su representante de Previley.</p></section>
        </div>
      </article>
    </main>
  );
}
