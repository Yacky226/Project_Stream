import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../../ui/alert";
import { TeacherDashboardCoursesSection } from "./components/TeacherDashboardCoursesSection";
import { TeacherDashboardHeader } from "./components/TeacherDashboardHeader";
import { TeacherDashboardLoadingState } from "./components/TeacherDashboardLoadingState";
import { TeacherDashboardPerformanceSection } from "./components/TeacherDashboardPerformanceSection";
import { TeacherDashboardStatsGrid } from "./components/TeacherDashboardStatsGrid";
import {
  extractTeacherDashboardErrorMessage,
} from "./teacherDashboard.utils";
import type { TeacherDashboardDataModel } from "./useTeacherDashboardData";

interface TeacherDashboardContentProps {
  model: TeacherDashboardDataModel;
  onNavigate: (path: string | number) => void;
}

export function TeacherDashboardContent({ model, onNavigate }: TeacherDashboardContentProps) {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    firstName,
    statCards,
    performanceSeries,
    chartAreaPath,
    chartLinePath,
    quickActions,
    nextSession,
    nextSessionLabel,
    filteredCourses,
    topPerformingCourses,
    handleExportReport,
  } = model;

  const totalCourses = data?.stats.totalCourses ?? 0;
  const activeEnrollments = data?.stats.activeEnrollments ?? 0;

  return (
    <div className="space-y-8 text-slate-900">
      {error && !data ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {extractTeacherDashboardErrorMessage(error, "Unable to load teacher analytics right now.")}
          </AlertDescription>
        </Alert>
      ) : null}

      <TeacherDashboardHeader
        firstName={firstName}
        totalCourses={totalCourses}
        activeEnrollments={activeEnrollments}
        isFetching={isFetching}
        onExportReport={handleExportReport}
        onRefresh={refetch}
      />

      {isLoading && !data ? (
        <TeacherDashboardLoadingState />
      ) : (
        <>
          <TeacherDashboardStatsGrid statCards={statCards} />
          <TeacherDashboardPerformanceSection
            performanceSeries={performanceSeries}
            chartAreaPath={chartAreaPath}
            chartLinePath={chartLinePath}
            quickActions={quickActions}
            nextSession={nextSession}
            nextSessionLabel={nextSessionLabel}
          />
          <TeacherDashboardCoursesSection
            filteredCourses={filteredCourses}
            topPerformingCourses={topPerformingCourses}
            onNavigate={onNavigate}
          />
        </>
      )}
    </div>
  );
}
