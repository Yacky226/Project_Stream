import type { AdminDashboardDataModel, GrowthRange } from '../useAdminDashboardData';

interface AdminGrowthAndActivitySectionProps {
  growthRange: GrowthRange;
  setGrowthRange: (value: GrowthRange) => void;
  growthArea: AdminDashboardDataModel['growthArea'];
  growthLine: AdminDashboardDataModel['growthLine'];
  growthPoints: AdminDashboardDataModel['growthPoints'];
  growthSeries: AdminDashboardDataModel['growthSeries'];
  recentActivity: AdminDashboardDataModel['recentActivity'];
  onNavigate: (path: string | number) => void;
}

export function AdminGrowthAndActivitySection({
  growthRange,
  setGrowthRange,
  growthArea,
  growthLine,
  growthPoints,
  growthSeries,
  recentActivity,
  onNavigate,
}: AdminGrowthAndActivitySectionProps) {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <article className="rounded-xl border border-[#1152d4]/10 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Platform Growth</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Monthly enrollments from backend registration activity
            </p>
          </div>
          <select
            className="rounded-lg border-none bg-[#f6f6f8] px-4 py-2 text-sm font-medium dark:bg-slate-800"
            value={growthRange}
            onChange={(event) => setGrowthRange(event.target.value as GrowthRange)}
          >
            <option value="6m">Last 6 Months</option>
            <option value="12m">Last 12 Months</option>
          </select>
        </div>

        <div style={{ height: '16rem' }}>
          <svg viewBox="0 0 720 220" className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="adminDashboardChartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#1152d4" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#1152d4" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path d={growthArea} fill="url(#adminDashboardChartGradient)" />
            <path d={growthLine} fill="none" stroke="#1152d4" strokeWidth="4" strokeLinecap="round" />
            {growthPoints.map((point) => (
              <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} fill="#1152d4" r="2.2" />
            ))}
          </svg>
        </div>

        <div className="mt-3 flex w-full items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 md:text-xs">
          {growthSeries.labels.map((label) => (
            <span className="min-w-[2.25rem] text-center" key={label}>
              {label}
            </span>
          ))}
        </div>
      </article>

      <aside className="rounded-xl border border-[#1152d4]/10 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-100">Recent Activity</h2>
        <div className="space-y-6">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No recent backend activity found for current filters.
            </p>
          ) : (
            recentActivity.map((activityItem) => {
              const Icon = activityItem.icon;
              return (
                <div className="flex gap-4" key={activityItem.id}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activityItem.iconWrap}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{activityItem.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{activityItem.time}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/admin/support')}
          className="mt-8 w-full rounded-xl bg-[#1152d4]/10 py-3 text-sm font-bold text-[#1152d4] transition hover:bg-[#1152d4]/15"
        >
          View All Logs
        </button>
      </aside>
    </section>
  );
}
