import { ArrowRight } from "lucide-react";
import { formatStudentDateShort } from "../../../student/StudentSpaceShared";
import type { StudentDashboardDataModel } from "../useStudentDashboardData";

interface StudentDashboardSidebarProps {
  model: StudentDashboardDataModel;
  onNavigate: (path: string | number) => void;
}

export function StudentDashboardSidebar({
  model,
  onNavigate,
}: StudentDashboardSidebarProps) {
  const {
    surfaceClass,
    upcomingSessions,
    isDark,
    visibleAchievementCards,
    shared,
    ringRadius,
    ringCircumference,
    ringOffset,
    weeklyGoalPercent,
    weeklyGoalCurrent,
    weeklyGoalTarget,
  } = model;

  return (
    <aside className="min-w-0 space-y-8 xl:col-span-4">
      <section className={`rounded-2xl border p-6 shadow-sm ${surfaceClass}`}>
        <h3 className="mb-4 text-lg font-bold">Upcoming Live Sessions</h3>
        <div className="space-y-4">
          {upcomingSessions.map((session) => {
            const dateLabel = formatStudentDateShort(session.startAt);
            const split = dateLabel.split(" ");
            const day = split[0] || "--";
            const month = split[1] || "---";
            return (
              <button
                key={session.id}
                type="button"
                onClick={() => onNavigate(`/courses/${session.courseId}/live/${session.id}`)}
                className="group flex w-full items-center gap-4 text-left"
              >
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-[#1152d4]/10 bg-[#1152d4]/5 text-[#1152d4]">
                  <span className="text-[10px] font-bold uppercase leading-none">{month}</span>
                  <span className="text-lg font-bold leading-none">{day}</span>
                </div>
                <div className="flex-1 border-b border-[#1152d4]/5 pb-4 group-last:border-0">
                  <p className="truncate text-sm font-bold">{session.courseTitle}</p>
                  <p className={`text-xs ${isDark ? "text-[#94a3b8]" : "text-[#64748b]"}`}>
                    {new Date(session.startAt || "").toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    - {session.isLive ? "Live now" : "Scheduled"}
                  </p>
                </div>
                <ArrowRight
                  className={`h-4 w-4 transition-colors group-hover:text-[#1152d4] ${
                    isDark ? "text-[#94a3b8]" : "text-[#64748b]"
                  }`}
                />
              </button>
            );
          })}

          {!upcomingSessions.length ? (
            <p className={`text-xs ${isDark ? "text-[#94a3b8]" : "text-[#64748b]"}`}>
              No upcoming session found.
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => onNavigate("/student/live")}
          className={`mt-4 w-full py-2 text-xs font-bold uppercase tracking-widest transition-colors hover:text-[#1152d4] ${
            isDark ? "text-[#94a3b8]" : "text-[#64748b]"
          }`}
        >
          Full Schedule
        </button>
      </section>

      <section className={`rounded-2xl border p-6 shadow-sm ${surfaceClass}`}>
        <h3 className="mb-4 text-lg font-bold">Achievements</h3>
        {visibleAchievementCards.length ? (
          <div className="grid grid-cols-3 gap-4">
            {visibleAchievementCards.map((achievement) => (
              <div
                key={achievement.title}
                className={`group flex cursor-default flex-col items-center gap-2 ${
                  achievement.unlocked ? "" : "grayscale opacity-40"
                }`}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-md ${
                    isDark ? "border-[#334155]" : "border-white"
                  } ${achievement.iconClass}`}
                >
                  {achievement.icon}
                </div>
                <p className="text-center text-[10px] font-bold leading-tight">
                  {achievement.title}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-xs ${isDark ? "text-[#94a3b8]" : "text-[#64748b]"}`}>
            No achievement matches this search.
          </p>
        )}

        <div className="mt-6 border-t border-[#1152d4]/5 pt-6">
          <p className="mb-2 text-xs font-bold">Next Milestone</p>
          <div className="flex items-center gap-3">
            <div
              className={`h-1.5 flex-1 overflow-hidden rounded-full ${
                isDark ? "bg-[#334155]" : "bg-[#e2e8f0]"
              }`}
            >
              <div
                className="h-full rounded-full bg-[#1152d4]"
                style={{ width: `${shared.goalProgress}%` }}
              />
            </div>
            <span className={`text-[10px] font-bold ${isDark ? "text-[#94a3b8]" : "text-[#64748b]"}`}>
              {shared.goalProgress}%
            </span>
          </div>
          <p
            className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${
              isDark ? "text-[#94a3b8]" : "text-[#64748b]"
            }`}
          >
            Top 5% Student
          </p>
        </div>
      </section>

      <section
        className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg"
        style={{
          background: "linear-gradient(135deg, #1152d4 0%, #4a80ef 100%)",
          boxShadow: "0 18px 36px rgba(17, 82, 212, 0.24)",
        }}
      >
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        <h3 className="relative z-10 mb-1 text-lg font-bold">Weekly Goal</h3>
        <p className="relative z-10 mb-4 text-xs text-white/80">Course completion target</p>
        <div className="relative z-10 flex items-center gap-4">
          <div className="relative h-16 w-16">
            <svg className="h-16 w-16 -rotate-90 transform">
              <circle
                cx="32"
                cy="32"
                r={ringRadius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4"
                className="text-white/20"
              />
              <circle
                cx="32"
                cy="32"
                r={ringRadius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                className="text-white"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {weeklyGoalPercent}%
            </div>
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight">
              {weeklyGoalCurrent.toFixed(1)}{" "}
              <span className="text-sm font-medium opacity-80">/ {weeklyGoalTarget} courses</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
              {weeklyGoalPercent >= 80 ? "Almost there" : "Keep going"}
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
}
