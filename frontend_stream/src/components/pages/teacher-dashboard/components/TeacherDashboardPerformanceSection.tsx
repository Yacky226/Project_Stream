import { ChevronDown, Clock3 } from "lucide-react";
import type { TeacherDashboardDataModel } from "../useTeacherDashboardData";

interface TeacherDashboardPerformanceSectionProps {
  performanceSeries: TeacherDashboardDataModel["performanceSeries"];
  chartAreaPath: string;
  chartLinePath: string;
  quickActions: TeacherDashboardDataModel["quickActions"];
  nextSession: TeacherDashboardDataModel["nextSession"];
  nextSessionLabel: string;
}

export function TeacherDashboardPerformanceSection({
  performanceSeries,
  chartAreaPath,
  chartLinePath,
  quickActions,
  nextSession,
  nextSessionLabel,
}: TeacherDashboardPerformanceSectionProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Course Performance</h2>
            <p className="mt-1 text-sm text-slate-500">
              Completion rate by top courses (live backend data)
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700"
          >
            Top 7 Courses
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div style={{ height: "18rem" }}>
          <svg viewBox="0 0 720 260" className="h-full w-full" preserveAspectRatio="none">
            <path d={chartAreaPath} fill="rgba(37, 87, 211, 0.16)" />
            <path
              d={chartLinePath}
              fill="none"
              stroke="#1152d4"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div
          className="mt-2 text-center text-sm font-bold text-slate-400"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${performanceSeries.labels.length}, minmax(0, 1fr))`,
            gap: "0.5rem",
          }}
        >
          {performanceSeries.labels.map((label) => (
            <span key={label} style={{ letterSpacing: "0.04em" }}>
              {label.toUpperCase()}
            </span>
          ))}
        </div>
      </article>

      <aside className="space-y-6">
        <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-950">Quick Actions</h2>
          <div className="flex-1 space-y-4">
            {quickActions.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className="group flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-4 text-left transition-all hover:bg-blue-600 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-blue-600 group-hover:text-white" />
                    <span className="text-base font-medium text-slate-950 group-hover:text-white">
                      {item.label}
                    </span>
                  </div>
                  {index === 0 && item.badge > 0 ? (
                    <span
                      className="rounded-full bg-red-500 text-white"
                      style={{
                        minWidth: "1.75rem",
                        height: "1.45rem",
                        padding: "0 0.45rem",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div
            className="mt-6 rounded-2xl border p-5"
            style={{
              borderColor: "rgba(37, 87, 211, 0.24)",
              backgroundColor: "rgba(37, 87, 211, 0.12)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Next Session
            </p>
            <p className="mt-2 truncate text-sm font-bold text-slate-950">
              {nextSession?.courseTitle || "No upcoming session"}
            </p>
            <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
              <Clock3 className="h-4 w-4" />
              {nextSessionLabel}
            </p>
          </div>
        </article>
      </aside>
    </section>
  );
}
