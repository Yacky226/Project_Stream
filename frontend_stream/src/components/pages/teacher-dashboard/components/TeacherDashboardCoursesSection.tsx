import { MoreVertical } from "lucide-react";
import type { TeacherDashboardDataModel } from "../useTeacherDashboardData";
import { formatCompact, formatDateLabel, getCourseStatus } from "../teacherDashboard.utils";

interface TeacherDashboardCoursesSectionProps {
  filteredCourses: TeacherDashboardDataModel["filteredCourses"];
  topPerformingCourses: TeacherDashboardDataModel["topPerformingCourses"];
  onNavigate: (path: string | number) => void;
}

export function TeacherDashboardCoursesSection({
  filteredCourses,
  topPerformingCourses,
  onNavigate,
}: TeacherDashboardCoursesSectionProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-3">
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-6">
          <h2 className="text-lg font-bold text-slate-950">Course Overview</h2>
          <button
            type="button"
            onClick={() => onNavigate("/teacher/my-courses")}
            className="text-sm font-bold text-blue-600"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Course Name</th>
                <th className="px-6 py-4">Students</th>
                <th className="px-6 py-4">Completion</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCourses.slice(0, 5).length ? (
                filteredCourses.slice(0, 5).map((course) => {
                  const status = getCourseStatus(course);
                  const courseCompletion = Math.max(
                    0,
                    Math.min(100, Math.round(course.completionRate)),
                  );

                  return (
                    <tr key={course.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-950">{course.title}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          Published - {formatDateLabel(course.nextSessionAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-950">
                        {formatCompact(course.enrollments)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-950">
                        {courseCompletion}%
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-200"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                    No course matches the current search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Top Performing Courses</h2>

        <div className="mt-6 space-y-6">
          {topPerformingCourses.length ? (
            topPerformingCourses.map((course, index) => {
              const progress = Math.max(0, Math.min(100, Math.round(course.completionRate)));
              const opacity = Math.max(0.2, 1 - index * 0.2);
              return (
                <div key={course.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="truncate pr-2 text-slate-950">{course.title}</span>
                    <span className="text-blue-600">{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${progress}%`, opacity }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500">No performance data available yet.</p>
          )}
        </div>
      </article>
    </section>
  );
}
