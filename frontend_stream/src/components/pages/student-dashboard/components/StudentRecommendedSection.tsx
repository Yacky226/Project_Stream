import { Star } from "lucide-react";
import { formatStudentDateShort } from "../../../student/StudentSpaceShared";
import { renderRecommendedIcon } from "../studentDashboard.utils";
import type { StudentDashboardDataModel } from "../useStudentDashboardData";

interface StudentRecommendedSectionProps {
  model: StudentDashboardDataModel;
}

export function StudentRecommendedSection({ model }: StudentRecommendedSectionProps) {
  const { recommendedCards, isDark, surfaceClass, emptyStateClass } = model;

  return (
    <section>
      <h3 className="mb-4 text-xl font-bold tracking-tight">Recommended for You</h3>
      <div className="student-dashboard-recommended-list">
        {recommendedCards.map((course) => {
          const icon = renderRecommendedIcon(course.iconType, isDark);
          return (
            <article
              key={course.id}
              className={`student-dashboard-recommended-card flex items-center gap-4 rounded-2xl border p-4 ${surfaceClass}`}
            >
              <div className={`flex items-center justify-center ${icon.wrapperClass}`}>
                {icon.icon}
              </div>
              <div>
                <p className="text-sm font-bold">{course.title}</p>
                <p className={`text-xs ${isDark ? "text-[#94a3b8]" : "text-[#64748b]"}`}>
                  {course.instructor}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-[10px] font-bold">
                    Scheduled: {formatStudentDateShort(course.scheduledAt)}
                  </span>
                </div>
              </div>
            </article>
          );
        })}

        {!recommendedCards.length ? (
          <div
            className={`student-dashboard-recommended-empty rounded-2xl border border-dashed p-6 text-sm ${emptyStateClass}`}
          >
            No recommendation available with this filter.
          </div>
        ) : null}
      </div>
    </section>
  );
}
