import { useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CalendarClock,
  Plus,
  RefreshCcw,
  Search,
  Users,
} from 'lucide-react';
import { useGetTeacherDashboardQuery } from '../../store/api/dashboardApi';
import type { TeacherDashboardCourse } from '../../types/dashboard';
import {
  TeacherSpaceShell,
  TeacherSpaceStatus,
  useTeacherSpaceData,
} from '../teacher/TeacherSpaceShared';
import { Alert, AlertDescription } from '../ui/alert';

interface TeacherCoursesPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

function formatDateLabel(value: string | null) {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not scheduled';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;
  const payload = error as {
    data?: { message?: string; error?: string };
    error?: string;
    message?: string;
  };
  return payload.data?.message || payload.data?.error || payload.error || payload.message || fallback;
}

function getCourseStatus(course: TeacherDashboardCourse) {
  if (course.enrollments === 0 || course.completionRate < 25) {
    return {
      label: 'Draft',
      className: 'bg-amber-100 text-amber-700',
    };
  }

  return {
    label: 'Active',
    className: 'bg-green-100 text-green-700',
  };
}

export function TeacherCoursesPage({ onNavigate, currentPath }: TeacherCoursesPageProps) {
  const shared = useTeacherSpaceData({ includeDashboard: false });
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isFetching, error, refetch } = useGetTeacherDashboardQuery(undefined, {
    skip: shared.status !== 'ready',
  });

  if (shared.status !== 'ready') {
    return <TeacherSpaceStatus shared={shared} />;
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const allCourses: TeacherDashboardCourse[] = data?.courses ?? [];

  const filteredCourses = useMemo(() => {
    return [...allCourses]
      .filter((course) =>
        `${course.title} ${course.description} ${course.category}`.toLowerCase().includes(normalizedQuery),
      )
      .sort((left, right) => {
        if (right.enrollments !== left.enrollments) {
          return right.enrollments - left.enrollments;
        }
        return left.title.localeCompare(right.title);
      });
  }, [allCourses, normalizedQuery]);

  const totalCourses = data?.stats.totalCourses ?? allCourses.length;
  const totalStudents = data?.stats.totalStudents ?? allCourses.reduce((sum, course) => sum + course.enrollments, 0);
  const liveSessions = data?.stats.liveSessions ?? 0;

  return (
    <TeacherSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      showSearch={false}
      headerTitle="My Courses"
      displayName={shared.displayName}
      displayRole={shared.displayRole}
      initials={shared.initials}
      avatarUrl={shared.avatarUrl}
      activeCourseCount={data?.stats.totalCourses ?? shared.activeCourseCount}
      liveSessions={data?.stats.liveSessions ?? shared.liveSessions}
      unreadCount={shared.unreadCount}
    >
      <div className="space-y-6 text-slate-900">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">My Courses</h1>
            <p className="mt-2 text-sm text-slate-500">
              This tab shows only courses created from your teacher workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/teacher/course-builder')}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create New Course
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Total Courses</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{totalCourses}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Total Students</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{totalStudents}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Live Sessions</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{liveSessions}</p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-bold text-slate-950">Created Courses List</h2>

            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search in your created courses..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
                type="text"
              />
            </div>
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {extractErrorMessage(error, 'Unable to load your course list right now.')}
              </AlertDescription>
            </Alert>
          ) : null}

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : filteredCourses.length ? (
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
                  {filteredCourses.map((course) => {
                    const status = getCourseStatus(course);
                    return (
                      <tr key={course.id} className="hover:bg-slate-50">
                        <td className="px-2 py-4">
                          <p className="font-semibold text-slate-950">{course.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {course.description || 'No description yet.'}
                          </p>
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
                              <div
                                className="h-full rounded-full bg-blue-600"
                                style={{ width: `${Math.max(0, Math.min(100, Math.round(course.completionRate)))}%` }}
                              />
                            </div>
                            <p className="mt-1 text-xs font-semibold text-slate-600">
                              {Math.round(course.completionRate)}%
                            </p>
                          </div>
                        </td>
                        <td className="px-2 py-4 text-sm font-semibold text-slate-900">
                          {course.liveSessions}
                        </td>
                        <td className="px-2 py-4">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                            <CalendarClock className="h-4 w-4 text-slate-400" />
                            {formatDateLabel(course.nextSessionAt)}
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
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-base font-semibold text-slate-900">No course found in your teacher space.</p>
              <p className="mt-2 text-sm text-slate-500">
                Create your first course to populate this tab.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/teacher/course-builder')}
                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create New Course
              </button>
            </div>
          )}
        </section>
      </div>
    </TeacherSpaceShell>
  );
}
