import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  CircleOff,
  Clock3,
  Loader2,
  PlayCircle,
  Radio,
  RotateCcw,
} from 'lucide-react';
import { useGetAllSessionsQuery, useGetCoursesQuery } from '../../store/api/liveApi';
import { useEnrollCourseMutation } from '../../store/api/userApi';
import type { StudentDashboardCourse } from '../../types/dashboard';
import type { LiveSession } from '../../types/live';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  StudentSpaceShell,
  StudentSpaceStatus,
  formatStudentDate,
  getStudentCategoryMeta,
  getStudentSpaceErrorMessage,
  useStudentSpaceData,
} from '../student/StudentSpaceShared';

interface StudentCoursesPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

type CourseSort = 'recent' | 'progress' | 'title';

function matchStatusLabel(status: string) {
  if (status === 'TERMINE') return 'Completed';
  if (status === 'ABANDONNE') return 'Abandoned';
  return 'In progress';
}

function matchStatusVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status === 'TERMINE') return 'default';
  if (status === 'ABANDONNE') return 'secondary';
  return 'outline';
}

function sessionPriority(session: LiveSession): number {
  if (session.isLive || session.status === 'LIVE') return 0;
  if (session.status === 'ENDED') return 2;
  return 1;
}

function nextSessionForCourse(courseId: string, sessions: LiveSession[]) {
  return sessions
    .filter((session) => String(session.courseId) === String(courseId))
    .sort((a, b) => {
      const priority = sessionPriority(a) - sessionPriority(b);
      if (priority !== 0) return priority;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    })[0];
}

function sortCourses(courses: StudentDashboardCourse[], sortBy: CourseSort) {
  const list = [...courses];
  if (sortBy === 'title') {
    list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }
  if (sortBy === 'progress') {
    list.sort((a, b) => b.progress - a.progress);
    return list;
  }
  list.sort((a, b) => new Date(b.enrolledAt || 0).getTime() - new Date(a.enrolledAt || 0).getTime());
  return list;
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
      <p className="font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="mt-2">{description}</p>
    </div>
  );
}

export function StudentCoursesPage({ onNavigate, currentPath }: StudentCoursesPageProps) {
  const shared = useStudentSpaceData();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<CourseSort>('recent');
  const [actionError, setActionError] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const ready = shared.status === 'ready' && shared.dashboard;
  const { data: catalogCourses = [], error: catalogError } = useGetCoursesQuery(undefined, {
    skip: !ready,
  });
  const { data: sessions = [], error: sessionsError } = useGetAllSessionsQuery(undefined, {
    skip: !ready,
  });
  const [enrollCourse, { isLoading: isEnrolling }] = useEnrollCourseMutation();

  if (!ready) {
    return <StudentSpaceStatus shared={shared} />;
  }

  const enrolledIds = new Set(shared.dashboard.courses.map((course) => String(course.id)));
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredCourses = sortCourses(
    shared.dashboard.courses.filter((course) =>
      [course.title, course.description, course.category, course.status]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    ),
    sortBy,
  );

  const activeCourses = filteredCourses.filter((course) => course.status === 'ACTIF');
  const completedCourses = filteredCourses.filter((course) => course.status === 'TERMINE');
  const abandonedCourses = filteredCourses.filter((course) => course.status === 'ABANDONNE');

  const recommendedCourses = catalogCourses
    .filter((course) => !enrolledIds.has(String(course.id)))
    .sort((a, b) => {
      const activeCategories = new Set(
        shared.dashboard.courses
          .filter((courseItem) => courseItem.status === 'ACTIF')
          .map((courseItem) => courseItem.category.toLowerCase()),
      );
      const aMatch = activeCategories.has(a.category.toLowerCase()) ? 1 : 0;
      const bMatch = activeCategories.has(b.category.toLowerCase()) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
    })
    .filter((course) =>
      normalizedSearch
        ? [course.title, course.description, course.category]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true,
    )
    .slice(0, 3);

  const handleEnroll = async (courseId: string) => {
    setActionError(null);
    setEnrollingCourseId(courseId);
    try {
      await enrollCourse({ coursId: courseId }).unwrap();
      onNavigate(`/courses/${courseId}`);
    } catch (error) {
      setActionError(getStudentSpaceErrorMessage(error, 'Enrollment failed for this course.'));
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const renderCourseCard = (course: StudentDashboardCourse) => {
    const categoryMeta = getStudentCategoryMeta(course.category);
    const linkedSession = nextSessionForCourse(course.id, sessions);
    const isLive = Boolean(linkedSession && (linkedSession.isLive || linkedSession.status === 'LIVE'));

    return (
      <div
        key={`${course.id}-${course.status}`}
        className="rounded-[28px] border border-[#1152d4]/10 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${categoryMeta.pillClass}`}>
                {course.category}
              </span>
              <Badge variant={matchStatusVariant(course.status)}>{matchStatusLabel(course.status)}</Badge>
              {isLive ? <Badge variant="destructive"><Radio className="h-3 w-3" /> Live now</Badge> : null}
            </div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">{course.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
              {course.description || 'Course description will appear here as soon as it is available.'}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-4 w-4" />
                Progress {course.progress}%
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="h-4 w-4" />
                {linkedSession ? formatStudentDate(linkedSession.scheduledAt) : 'No session planned yet'}
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-[#1152d4]" style={{ width: `${course.progress}%` }} />
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 md:w-44">
            <Button
              className="rounded-2xl bg-[#1152d4] text-white hover:bg-[#0f47b9]"
              onClick={() =>
                linkedSession && isLive
                  ? onNavigate(`/courses/${course.id}/live/${linkedSession.id}`)
                  : onNavigate(`/courses/${course.id}`)
              }
            >
              {linkedSession && isLive ? (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Join live
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Open course
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => onNavigate('/student/live')}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              All live plans
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <StudentSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search in your courses..."
      displayName={shared.displayName}
      displayLevel={shared.displayLevel}
      initials={shared.initials}
      avatarUrl={shared.avatarUrl}
      goalProgress={shared.goalProgress}
      unreadCount={shared.unreadCount}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              My Courses
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              Track enrolled courses, check the next live touchpoint, and continue from where you left off.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-[#1152d4]/10 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Enrolled</p>
              <p className="mt-1 text-2xl font-bold text-[#1152d4]">{shared.dashboard.stats.enrolledCourses}</p>
            </div>
            <div className="rounded-2xl border border-[#1152d4]/10 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Completed</p>
              <p className="mt-1 text-2xl font-bold text-[#1152d4]">{shared.dashboard.stats.completedCourses}</p>
            </div>
            <div className="rounded-2xl border border-[#1152d4]/10 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Upcoming live</p>
              <p className="mt-1 text-2xl font-bold text-[#1152d4]">{shared.dashboard.stats.upcomingSessions}</p>
            </div>
          </div>
        </section>

        {actionError || catalogError || sessionsError ? (
          <div className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            {actionError ||
              getStudentSpaceErrorMessage(
                catalogError || sessionsError,
                'Some course enrichments could not be loaded.',
              )}
          </div>
        ) : null}

        <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{activeCourses.length} in progress</Badge>
            <Badge variant="outline">{completedCourses.length} completed</Badge>
            <Badge variant="outline">{abandonedCourses.length} abandoned</Badge>
          </div>

          <div className="w-full max-w-xs">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as CourseSort)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="recent">Sort by latest enrollment</option>
              <option value="progress">Sort by progress</option>
              <option value="title">Sort by title</option>
            </select>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-[#1152d4]" />
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">In Progress</h2>
          </div>
          {activeCourses.length ? activeCourses.map(renderCourseCard) : (
            <EmptyState
              title="No in-progress course matches your search."
              description="Try another search or explore the recommendation panel below."
            />
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#1152d4]" />
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Completed</h2>
          </div>
          {completedCourses.length ? completedCourses.map(renderCourseCard) : (
            <EmptyState
              title="No completed course yet."
              description="Completed courses will appear here automatically once the backend marks them as finished."
            />
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <CircleOff className="h-5 w-5 text-[#1152d4]" />
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Abandoned</h2>
          </div>
          {abandonedCourses.length ? abandonedCourses.map(renderCourseCard) : (
            <EmptyState
              title="No abandoned course detected."
              description="If an enrollment is marked as abandoned by the backend, it will appear in this section."
            />
          )}
        </section>

        <section className="rounded-[32px] border border-[#1152d4]/10 bg-[#1152d4]/5 p-6 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">Recommended Next</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                Fresh courses from the catalog, separated from your enrolled list.
              </p>
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={() => onNavigate('/catalog')}>
              Browse catalog
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {recommendedCourses.length ? (
              recommendedCourses.map((course) => {
                const categoryMeta = getStudentCategoryMeta(course.category);
                return (
                  <div
                    key={course.id}
                    className="rounded-[28px] border border-[#1152d4]/10 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${categoryMeta.pillClass}`}>
                      {course.category}
                    </span>
                    <h3 className="mt-4 line-clamp-2 text-lg font-bold text-slate-950 dark:text-white">
                      {course.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-300">
                      {course.description || 'Course description will appear here soon.'}
                    </p>
                    <div className="mt-6 flex flex-col gap-2">
                      <Button
                        className="rounded-2xl bg-[#1152d4] text-white hover:bg-[#0f47b9]"
                        disabled={isEnrolling && enrollingCourseId === course.id}
                        onClick={() => handleEnroll(course.id)}
                      >
                        {isEnrolling && enrollingCourseId === course.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="mr-2 h-4 w-4" />
                        )}
                        Enroll now
                      </Button>
                      <Button variant="outline" className="rounded-2xl" onClick={() => onNavigate(`/courses/${course.id}`)}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        View details
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 lg:col-span-3">
                No catalog recommendation matches your current search.
              </div>
            )}
          </div>
        </section>
      </div>
    </StudentSpaceShell>
  );
}
