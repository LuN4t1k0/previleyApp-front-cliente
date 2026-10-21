export const metadata = { title: "Términos y condiciones | Previley" };

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-800">
      <article className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 sm:p-12">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Previley</p>
        <h1 className="text-3xl font-bold text-slate-950">Términos y condiciones</h1>
        <p className="mt-3 text-sm text-slate-500">Última actualización: octubre de 2026</p>
        <div className="mt-10 space-y-7 leading-7">
          <section><h2 className="text-lg font-semibold text-slate-950">Uso del portal</h2><p>El portal Previley permite a los clientes consultar información, documentos y gestiones asociadas a sus servicios. Cada usuario es responsable de mantener sus credenciales bajo resguardo.</p></section>
          <section><h2 className="text-lg font-semibold text-slate-950">Información y disponibilidad</h2><p>La información se presenta con fines de gestión y seguimiento. Previley procura mantener el servicio disponible y actualizado, aunque pueden existir ventanas de mantenimiento o interrupciones.</p></section>
          <section><h2 className="text-lg font-semibold text-slate-950">Contacto</h2><p>Para dudas sobre el uso del portal, comuníquese con su contacto habitual de Previley.</p></section>
        </div>
      </article>
    </main>
  );
}
