export function TeacherDashboardLoadingState() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-12">
        <div className="h-[420px] animate-pulse rounded-2xl border border-slate-200 bg-white xl:col-span-8" />
        <div className="space-y-6 xl:col-span-4">
          <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </section>
    </div>
  );
}
