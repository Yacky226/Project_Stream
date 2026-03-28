import type { StudentDashboardDataModel } from "../useStudentDashboardData";

interface StudentLearningProgressSectionProps {
  model: StudentDashboardDataModel;
}

export function StudentLearningProgressSection({
  model,
}: StudentLearningProgressSectionProps) {
  const { surfaceClass, weeklyBars, isDark } = model;

  return (
    <section className={`rounded-2xl border p-6 shadow-sm ${surfaceClass}`}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Learning Progress</h3>
          <p className={`text-xs ${isDark ? "text-[#94a3b8]" : "text-[#64748b]"}`}>
            Weekly activity overview
          </p>
        </div>
        <span className="rounded-lg bg-[#1152d4]/5 px-3 py-1.5 text-xs font-bold">
          This Week
        </span>
      </div>

      <div className="flex h-48 items-end justify-between gap-2 pb-2">
        {weeklyBars.items.map((day, index) => {
          const highlighted = index === weeklyBars.highlightedIndex;
          return (
            <div key={day.label} className="group flex flex-1 flex-col items-center gap-2">
              <div
                className={`relative w-full rounded-t-lg transition-all ${
                  highlighted
                    ? "bg-[#1152d4] shadow-lg shadow-[#1152d4]/20"
                    : "bg-[#1152d4]/10 group-hover:bg-[#1152d4]/20"
                }`}
                style={{ height: `${day.heightPercent}%` }}
              >
                {highlighted ? (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-[#0f172a] px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {day.valueLabel} activities
                  </div>
                ) : null}
              </div>
              <span
                className={`text-[10px] font-bold uppercase ${
                  highlighted
                    ? "text-[#1152d4]"
                    : isDark
                      ? "text-[#94a3b8]"
                      : "text-[#64748b]"
                }`}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
