import { formatStudentCompactNumber } from "../../../student/StudentSpaceShared";
import type { StudentDashboardDataModel } from "../useStudentDashboardData";

interface StudentDashboardHeroProps {
  model: StudentDashboardDataModel;
}

export function StudentDashboardHero({ model }: StudentDashboardHeroProps) {
  const { isDark, firstName, streak, dashboardStats } = model;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            className={`text-3xl font-black tracking-tight ${
              isDark ? "text-[#e2e8f0]" : "text-[#0f172a]"
            }`}
          >
            Welcome back, {firstName}!
          </h1>
          <p className={`mt-2 ${isDark ? "text-[#cbd5e1]" : "text-[#64748b]"}`}>
            You&apos;re on a {Math.max(streak, 1)}-day learning streak. Keep the momentum
            going!
          </p>
        </div>
        <span
          className={`rounded-full px-4 py-1.5 text-xs font-bold ${
            isDark ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-700"
          }`}
        >
          Upcoming Sessions:{" "}
          {formatStudentCompactNumber(dashboardStats?.upcomingSessions ?? 0)}
        </span>
      </div>
    </section>
  );
}
