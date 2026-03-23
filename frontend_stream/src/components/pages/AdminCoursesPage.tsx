import { useState } from 'react';
import {
  ArrowRight,
  Archive,
  BookOpen,
  Download,
  Loader2,
  ShieldAlert,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { AdminSpaceShell, AdminSpaceStatus, useAdminSpaceData } from '../admin/AdminSpaceShared';
import { AdminKpiCard, AdminPageIntro } from '../admin/AdminPageSections';
import { useGetAdminCoursesQuery } from '../../store/api/dashboardApi';
import { useGetCoursesQuery } from '../../store/api/liveApi';

interface AdminCoursesPageProps {
  onNavigate: (path: string) => void;
  currentPath?: string;
}

type CourseStatusFilter = 'all' | 'active' | 'archived';
type CourseSortValue = 'dateCreation:DESC' | 'dateCreation:ASC' | 'nombreInscriptions:DESC' | 'moyenneNotes:DESC';

function compact(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    maximumFractionDigits: value >= 100000 ? 0 : 1,
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function escapeCsvCell(value: string | number) {
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function AdminCoursesPage({ onNavigate, currentPath }: AdminCoursesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CourseStatusFilter>('all');
  const [sortValue, setSortValue] = useState<CourseSortValue>('dateCreation:DESC');
  const [page, setPage] = useState(0);
  const shared = useAdminSpaceData({ includeDashboard: false });

  const [sortBy, sortDir] = sortValue.split(':') as [string, 'ASC' | 'DESC'];
  const { data: coursesPage, isLoading, isFetching, error } = useGetAdminCoursesQuery({
    page,
    size: 10,
    sortBy,
    sortDir,
  }, {
    skip: shared.status !== 'ready',
  });
  const { data: publicCourses = [] } = useGetCoursesQuery(undefined, {
    skip: shared.status !== 'ready',
  });

  if (shared.status !== 'ready') {
    return <AdminSpaceStatus shared={shared} />;
  }

  const categoryByCourseId = new Map(publicCourses.map((course) => [course.id, course.category]));
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const allItems = coursesPage?.items || [];
  const filteredItems = allItems.filter((course) => {
    const category = categoryByCourseId.get(course.id) || 'Category pending';
    const matchesSearch = [course.title, course.teacherName, category]
      .join(' ')
      .toLowerCase()
      .includes(normalizedSearch);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !course.isArchived) ||
      (statusFilter === 'archived' && course.isArchived);

    return matchesSearch && matchesStatus;
  });

  const watchlist = filteredItems
    .filter(
      (course) =>
        course.isArchived ||
        course.enrollmentCount === 0 ||
        (course.reviewCount > 0 && course.averageRating > 0 && course.averageRating < 3.5),
    )
    .slice(0, 4);

  const totalCourses = shared.dashboard?.stats.totalCourses ?? coursesPage?.totalElements ?? allItems.length;
  const activeCourses =
    shared.dashboard?.stats.activeCourses ?? allItems.filter((course) => !course.isArchived).length;
  const archivedCourses =
    shared.dashboard?.stats.archivedCourses ?? allItems.filter((course) => course.isArchived).length;
  const averageRating =
    shared.dashboard?.stats.averageCourseRating ??
    (allItems.length
      ? allItems.reduce((sum, course) => sum + course.averageRating, 0) / Math.max(allItems.length, 1)
      : 0);

  const exportCurrentView = () => {
    if (!filteredItems.length) {
      return;
    }

    const csv = [
      ['Title', 'Instructor', 'Category', 'Status', 'Rating', 'Reviews', 'Students', 'Sessions', 'Created At'].join(','),
      ...filteredItems.map((course) => {
        const category = categoryByCourseId.get(course.id) || 'Category pending';
        const status = course.isArchived ? 'Archived' : 'Active';
        return [
          course.title,
          course.teacherName,
          category,
          status,
          course.averageRating.toFixed(2),
          course.reviewCount,
          course.enrollmentCount,
          course.sessionsCount,
          formatDate(course.createdAt),
        ]
          .map(escapeCsvCell)
          .join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-course-inventory-page-${page + 1}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const hasData = Boolean(coursesPage && !coursesPage.empty);

  return (
    <AdminSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search courses or instructors..."
      displayName={shared.displayName}
      displayRole={shared.displayRole}
      initials={shared.initials}
      avatarUrl={shared.avatarUrl}
      unreadCount={shared.unreadCount}
    >
      <div className="space-y-8">
        <AdminPageIntro
          eyebrow="Catalog governance"
          title="Course Management"
          description="Review the platform inventory, navigate to course details, and monitor archived or low-signal offers. Status and category are derived from the existing course APIs when the backend does not expose dedicated moderation fields."
          actions={
            <>
            <button
              type="button"
              onClick={exportCurrentView}
              disabled={!filteredItems.length}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              Export current view
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/teacher/course-builder')}
              className="rounded-2xl bg-[#1152d4] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f47b9]"
            >
              Open course builder
            </button>
            </>
          }
        />

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: 'Total Courses',
              value: compact(totalCourses),
              meta: `${compact(coursesPage?.totalElements ?? totalCourses)} indexed`,
              icon: BookOpen,
              accent: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
            },
            {
              title: 'Active Courses',
              value: compact(activeCourses),
              meta: 'available to learners',
              icon: Sparkles,
              accent: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
            },
            {
              title: 'Archived Courses',
              value: compact(archivedCourses),
              meta: 'hidden from catalogue',
              icon: Archive,
              accent: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
            },
            {
              title: 'Average Rating',
              value: averageRating ? averageRating.toFixed(2) : '0.00',
              meta: 'derived from course reviews',
              icon: Star,
              accent: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
            },
          ].map((card) => (
            <AdminKpiCard
              key={card.title}
              title={card.title}
              value={card.value}
              meta={card.meta}
              icon={card.icon}
              iconToneClass={card.accent}
            />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-12">
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
                    onClick={() => {
                      setStatusFilter(option.key);
                      setPage(0);
                    }}
                    className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                      statusFilter === option.key
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
                  value={sortValue}
                  onChange={(event) => {
                    setSortValue(event.target.value as CourseSortValue);
                    setPage(0);
                  }}
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12">
                        <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin text-[#1152d4]" />
                          Loading course inventory...
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12">
                        <div className="flex items-center justify-center gap-3 text-sm text-red-500">
                          <ShieldAlert className="h-4 w-4" />
                          Unable to load admin course inventory right now.
                        </div>
                      </td>
                    </tr>
                  ) : filteredItems.length ? (
                    filteredItems.map((course) => {
                      const category = categoryByCourseId.get(course.id) || 'Category pending';
                      const statusLabel = course.isArchived ? 'Archived' : 'Active';
                      const statusClasses = course.isArchived
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';

                      return (
                        <tr key={course.id} className="group transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{course.title}</p>
                              <p className="mt-1 text-[11px] text-slate-500">Created {formatDate(course.createdAt)}</p>
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
                            <p className="mt-1 text-[11px] text-slate-400">{compact(course.reviewCount)} reviews</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {compact(course.enrollmentCount)}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">{compact(course.sessionsCount)} sessions</p>
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
                  onClick={() => setPage((previous) => Math.max(previous - 1, 0))}
                  disabled={!coursesPage || coursesPage.first}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-300">
                  Page {(coursesPage?.pageNumber ?? page) + 1} / {Math.max(coursesPage?.totalPages ?? 1, 1)}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((previous) => previous + 1)}
                  disabled={!coursesPage || coursesPage.last}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6 xl:col-span-3">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">Review Watchlist</h2>
                <span className="rounded-full bg-[#1152d4]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1152d4]">
                  Derived
                </span>
              </div>
              <div className="space-y-4">
                {watchlist.length ? (
                  watchlist.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => onNavigate(`/courses/${course.id}`)}
                      className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-[#1152d4]/30 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                    >
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{course.title}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{course.teacherName}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
                        {course.isArchived ? (
                          <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                            archived
                          </span>
                        ) : null}
                        {course.enrollmentCount === 0 ? (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            no students yet
                          </span>
                        ) : null}
                        {course.reviewCount > 0 && course.averageRating > 0 && course.averageRating < 3.5 ? (
                          <span className="rounded-full bg-red-50 px-2 py-1 text-red-600 dark:bg-red-900/20 dark:text-red-300">
                            low rating
                          </span>
                        ) : null}
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    No watchlist item is currently derived from this page.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#1152d4]/20 bg-[#1152d4]/5 p-6 shadow-sm dark:bg-[#1152d4]/10">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Inventory Notes</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Category enrichment comes from the public course inventory, while the admin endpoint currently drives enrollment, rating, sessions, and archive state.
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-4 w-4 text-[#1152d4]" />
                  <span>Enrollment and review signals are real admin metrics.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Archive className="mt-0.5 h-4 w-4 text-[#1152d4]" />
                  <span>Moderation flags are not exposed yet, so the watchlist is heuristic only.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/help')}
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#1152d4] transition hover:text-[#0f47b9]"
              >
                Open admin guidance
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {isFetching && hasData ? (
          <div className="flex items-center justify-end gap-2 text-xs font-medium text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1152d4]" />
            Refreshing page data...
          </div>
        ) : null}
      </div>
    </AdminSpaceShell>
  );
}
