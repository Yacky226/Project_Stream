import type { TeacherDashboardDataModel } from "../useTeacherDashboardData";

interface TeacherDashboardStatsGridProps {
  statCards: TeacherDashboardDataModel["statCards"];
}

export function TeacherDashboardStatsGrid({ statCards }: TeacherDashboardStatsGridProps) {
  return (
    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div
                className="flex h-14 shrink-0 items-center justify-center rounded-2xl"
                style={{ width: "3.5rem", ...card.iconStyle }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${card.badgeWrap}`}>
                {card.badge}
              </span>
            </div>
            <p className="mt-5 text-sm font-medium text-slate-500">{card.title}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{card.value}</p>
          </article>
        );
      })}
    </section>
  );
}
