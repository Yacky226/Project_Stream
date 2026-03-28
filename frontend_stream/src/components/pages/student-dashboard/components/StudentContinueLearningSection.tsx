import { PlayCircle } from "lucide-react";
import { ImageWithFallback } from "../../../figma/ImageWithFallback";
import { getStudentCategoryMeta } from "../../../student/StudentSpaceShared";
import type { StudentDashboardDataModel } from "../useStudentDashboardData";

interface StudentContinueLearningSectionProps {
  model: StudentDashboardDataModel;
  onNavigate: (path: string | number) => void;
}

export function StudentContinueLearningSection({
  model,
  onNavigate,
}: StudentContinueLearningSectionProps) {
  const { continueCards, isDark, emptyStateClass } = model;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight">Continue Learning</h3>
        <button
          type="button"
          onClick={() => onNavigate("/student/courses")}
          className="text-sm font-bold text-[#1152d4] hover:underline"
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {continueCards.map((item) => {
          const categoryMeta = getStudentCategoryMeta(item.course.category, isDark);
          return (
            <article
              key={item.course.id}
              className={`group overflow-hidden rounded-2xl border shadow-sm transition-all hover:shadow-xl hover:shadow-[#1152d4]/5 ${
                isDark ? "border-[#1e293b] bg-[#0f172a]" : "border-[#1152d4]/5 bg-white"
              }`}
            >
              <div
                className={`relative aspect-video overflow-hidden ${
                  isDark ? "bg-[#1e293b]" : "bg-[#e2e8f0]"
                }`}
              >
                <ImageWithFallback
                  src={item.coverImage}
                  alt={item.course.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute left-4 top-4">
                  <span
                    className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${categoryMeta.pillClass}`}
                  >
                    {item.course.category}
                  </span>
                </div>
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
                  <button
                    type="button"
                    onClick={() => onNavigate(`/courses/${item.course.id}`)}
                    className="translate-y-12 rounded-full bg-[#1152d4] p-2 text-white transition-transform duration-300 group-hover:translate-y-0"
                  >
                    <PlayCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <h4 className="line-clamp-1 text-base font-bold">{item.course.title}</h4>
                  <span className="text-xs font-bold text-[#1152d4]">{item.course.progress}%</span>
                </div>
                <p className={`mb-4 text-xs ${isDark ? "text-[#94a3b8]" : "text-[#64748b]"}`}>
                  Status: {item.course.status}
                </p>
                <div
                  className={`h-1.5 w-full overflow-hidden rounded-full ${
                    isDark ? "bg-[#334155]" : "bg-[#e2e8f0]"
                  }`}
                >
                  <div
                    className="h-full rounded-full bg-[#1152d4]"
                    style={{ width: `${item.course.progress}%` }}
                  />
                </div>
              </div>
            </article>
          );
        })}

        {!continueCards.length ? (
          <div
            className={`rounded-2xl border border-dashed p-6 text-sm md:col-span-2 ${emptyStateClass}`}
          >
            No matching enrolled course found for this search.
          </div>
        ) : null}
      </div>
    </section>
  );
}
