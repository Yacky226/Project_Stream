import { StudentContinueLearningSection } from "./components/StudentContinueLearningSection";
import { StudentDashboardHero } from "./components/StudentDashboardHero";
import { StudentDashboardSidebar } from "./components/StudentDashboardSidebar";
import { StudentLearningProgressSection } from "./components/StudentLearningProgressSection";
import { StudentRecommendedSection } from "./components/StudentRecommendedSection";
import type { StudentDashboardDataModel } from "./useStudentDashboardData";

interface StudentDashboardContentProps {
  model: StudentDashboardDataModel;
  onNavigate: (path: string | number) => void;
}

export function StudentDashboardContent({
  model,
  onNavigate,
}: StudentDashboardContentProps) {
  const { hasNoResult, emptyStateClass } = model;

  return (
    <div className="student-dashboard-page space-y-8">
      <StudentDashboardHero model={model} />

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-12">
        <div className="min-w-0 space-y-8 xl:col-span-8">
          <StudentLearningProgressSection model={model} />
          <StudentContinueLearningSection model={model} onNavigate={onNavigate} />
          <StudentRecommendedSection model={model} />
        </div>

        <StudentDashboardSidebar model={model} onNavigate={onNavigate} />
      </div>

      {hasNoResult ? (
        <div className={`rounded-2xl border border-dashed p-6 text-sm ${emptyStateClass}`}>
          No result matches your search in the student dashboard.
        </div>
      ) : null}
    </div>
  );
}
