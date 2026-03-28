import { Download, RefreshCcw } from "lucide-react";
import { formatCompact } from "../teacherDashboard.utils";

interface TeacherDashboardHeaderProps {
  firstName: string;
  totalCourses: number;
  activeEnrollments: number;
  isFetching: boolean;
  onExportReport: () => void;
  onRefresh: () => void;
}

export function TeacherDashboardHeader({
  firstName,
  totalCourses,
  activeEnrollments,
  isFetching,
  onExportReport,
  onRefresh,
}: TeacherDashboardHeaderProps) {
  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Dashboard Overview</h1>
        <p className="mt-2 text-base text-slate-500">
          Welcome back, {firstName}. You currently manage {formatCompact(totalCourses)} course(s)
          with {formatCompact(activeEnrollments)} active enrollments.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onExportReport}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
        >
          <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Refreshing..." : "Analyze Insights"}
        </button>
      </div>
    </section>
  );
}
