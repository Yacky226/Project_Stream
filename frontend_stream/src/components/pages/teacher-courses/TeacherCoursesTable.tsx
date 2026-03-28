import { BookOpen, CalendarClock, Plus, Users } from 'lucide-react';
import type { TeacherDashboardCourse } from '../../../types/dashboard';
import { formatCourseDateLabel, getTeacherCourseStatus } from './teacherCourses.utils';

interface TeacherCoursesTableProps {
  courses: TeacherDashboardCourse[];
  onNavigate: (path: string | number) => void;
}

export function TeacherCoursesTable({ courses, onNavigate }: TeacherCoursesTableProps) {
  if (!courses.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-base font-semibold text-slate-900">No course found in your teacher space.</p>
        <p className="mt-2 text-sm text-slate-500">Create your first course to populate this tab.</p>
        <button
          type="button"
          onClick={() => onNavigate('/teacher/course-builder')}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create New Course
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="border-b border-slate-200 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
          <tr>
            <th className="px-2 py-3">Course</th>
            <th className="px-2 py-3">Category</th>
            <th className="px-2 py-3">Students</th>
            <th className="px-2 py-3">Completion</th>
            <th className="px-2 py-3">Live</th>
            <th className="px-2 py-3">Next Session</th>
            <th className="px-2 py-3">Status</th>
            <th className="px-2 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {courses.map((course) => {
            const status = getTeacherCourseStatus(course);
            const completionRate = Math.max(0, Math.min(100, Math.round(course.completionRate)));

            return (
              <tr key={course.id} className="hover:bg-slate-50">
                <td className="px-2 py-4">
                  <p className="font-semibold text-slate-950">{course.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{course.description || 'No description yet.'}</p>
                </td>
                <td className="px-2 py-4">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {course.category || 'General'}
                  </span>
                </td>
                <td className="px-2 py-4">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                    <Users className="h-4 w-4 text-slate-400" />
                    {course.enrollments}
                  </span>
                </td>
                <td className="px-2 py-4">
                  <div className="w-28">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${completionRate}%` }} />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-600">{completionRate}%</p>
                  </div>
                </td>
                <td className="px-2 py-4 text-sm font-semibold text-slate-900">{course.liveSessions}</td>
                <td className="px-2 py-4">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                    <CalendarClock className="h-4 w-4 text-slate-400" />
                    {formatCourseDateLabel(course.nextSessionAt)}
                  </span>
                </td>
                <td className="px-2 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>
                    {status.label}
                  </span>
                </td>
                <td className="px-2 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onNavigate('/teacher/course-builder')}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <BookOpen className="h-4 w-4" />
                    Manage
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
