import { Loader2, ShieldAlert, Star } from 'lucide-react';
import type { CourseSortValue } from '../adminCourses.types';
import { compact, formatDate } from '../adminCourses.utils';
import type { AdminCoursesDataModel } from '../useAdminCoursesData';

interface AdminCoursesTableProps {
  model: AdminCoursesDataModel;
  onNavigate: (path: string) => void;
}

export function AdminCoursesTable({ model, onNavigate }: AdminCoursesTableProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-9">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {([
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'archived', label: 'Archived' },
          ] as const).map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => model.setStatusFilter(option.key)}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                model.statusFilter === option.key
                  ? 'bg-[#1152d4] text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={model.sortValue}
            onChange={(event) => model.setSortValue(event.target.value as CourseSortValue)}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="dateCreation:DESC">Newest first</option>
            <option value="dateCreation:ASC">Oldest first</option>
            <option value="nombreInscriptions:DESC">Most students</option>
            <option value="moyenneNotes:DESC">Best rated</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800/50 dark:text-slate-300">
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Instructor</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Rating</th>
              <th className="px-6 py-4 text-center">Students</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {model.isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12">
                  <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin text-[#1152d4]" />
                    Loading course inventory...
                  </div>
                </td>
              </tr>
            ) : model.error ? (
              <tr>
                <td colSpan={7} className="px-6 py-12">
                  <div className="flex items-center justify-center gap-3 text-sm text-red-500">
                    <ShieldAlert className="h-4 w-4" />
                    Unable to load admin course inventory right now.
                  </div>
                </td>
              </tr>
            ) : model.filteredItems.length ? (
              model.filteredItems.map((course) => {
                const category = model.categoryByCourseId.get(course.id) || 'Category pending';
                const statusLabel = course.isArchived ? 'Archived' : 'Active';
                const statusClasses = course.isArchived
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';

                return (
                  <tr key={course.id} className="group transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{course.title}</p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Created {formatDate(course.createdAt)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                      {course.teacherName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        {category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClasses}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white">
                        <Star className="h-4 w-4 fill-current text-amber-400" />
                        {course.averageRating ? course.averageRating.toFixed(1) : '0.0'}
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {compact(course.reviewCount)} reviews
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {compact(course.enrollmentCount)}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {compact(course.sessionsCount)} sessions
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => onNavigate(`/courses/${course.id}`)}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-[#1152d4] hover:text-[#1152d4] dark:border-slate-700 dark:text-slate-300"
                        >
                          Open
                        </button>
                        {course.teacherId ? (
                          <button
                            type="button"
                            onClick={() => onNavigate(`/profile/teacher/${course.teacherId}`)}
                            className="rounded-xl bg-[#1152d4]/10 px-3 py-2 text-xs font-bold text-[#1152d4] transition hover:bg-[#1152d4] hover:text-white"
                          >
                            Teacher
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-300">
                  No courses match the current filters on this fetched page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-300">
          Server pagination is active. Search and status filters apply to the currently fetched page.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={model.goToPreviousPage}
            disabled={!model.coursesPage || model.coursesPage.first}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300">
            Page {(model.coursesPage?.pageNumber ?? model.page) + 1} /{' '}
            {Math.max(model.coursesPage?.totalPages ?? 1, 1)}
          </span>
          <button
            type="button"
            onClick={model.goToNextPage}
            disabled={!model.coursesPage || model.coursesPage.last}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
