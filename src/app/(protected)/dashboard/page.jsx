export default function DashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <section className="rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        <h3 className="font-semibold text-black">Puntualidad</h3>
        <p className="text-sm text-black/60">Objetivo ≥ 95%</p>
        <div className="mt-4 text-4xl font-bold text-black">92.4%</div>
      </section>
      <section className="rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        <h3 className="font-semibold text-black">Tiempo promedio</h3>
        <p className="text-sm text-black/60">Objetivo -15%</p>
        <div className="mt-4 text-4xl font-bold text-black">-7.8%</div>
      </section>
      <section className="rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        <h3 className="font-semibold text-black">Costo/km</h3>
        <p className="text-sm text-black/60">Objetivo -10%</p>
        <div className="mt-4 text-4xl font-bold text-black">-3.5%</div>
      </section>
    </div>
  );
}
