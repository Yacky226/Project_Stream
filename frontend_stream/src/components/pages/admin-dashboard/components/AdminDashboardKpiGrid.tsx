import { AdminKpiCard } from '../../../admin/AdminPageSections';
import type { AdminDashboardDataModel } from '../useAdminDashboardData';

interface AdminDashboardKpiGridProps {
  kpis: AdminDashboardDataModel['kpis'];
}

export function AdminDashboardKpiGrid({ kpis }: AdminDashboardKpiGridProps) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((card) => (
        <AdminKpiCard
          key={card.title}
          title={card.title}
          value={card.value}
          meta={card.trend}
          metaClassName={`text-xs ${card.trendClass}`}
          icon={card.icon}
          className="rounded-xl border-[#1152d4]/10"
        />
      ))}
    </section>
  );
}
