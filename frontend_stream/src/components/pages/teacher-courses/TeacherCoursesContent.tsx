import { AlertCircle, Plus, RefreshCcw, Search } from 'lucide-react';
import { Alert, AlertDescription } from '../../ui/alert';
import { extractTeacherCourseErrorMessage } from './teacherCourses.utils';
import { TeacherCoursesStatsCards } from './TeacherCoursesStatsCards';
import { TeacherCoursesTable } from './TeacherCoursesTable';
import type { TeacherCoursesDataModel } from './useTeacherCoursesData';

interface TeacherCoursesContentProps {
  model: TeacherCoursesDataModel;
  onNavigate: (path: string | number) => void;
}

export function TeacherCoursesContent({ model, onNavigate }: TeacherCoursesContentProps) {
  const {
    refetch,
    isFetching,
    searchQuery,
    setSearchQuery,
    totalCourses,
    totalStudents,
    liveSessions,
    error,
    isLoading,
    filteredCourses,
  } = model;

  return (
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

      <TeacherCoursesStatsCards
        totalCourses={totalCourses}
        totalStudents={totalStudents}
        liveSessions={liveSessions}
      />

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
              {extractTeacherCourseErrorMessage(error, 'Unable to load your course list right now.')}
            </AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <TeacherCoursesTable courses={filteredCourses} onNavigate={onNavigate} />
        )}
      </section>
    </div>
  );
}
