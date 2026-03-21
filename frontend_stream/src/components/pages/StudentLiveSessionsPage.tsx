import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarClock,
  CircleOff,
  Loader2,
  Radio,
  RefreshCcw,
  Video,
} from 'lucide-react';
import { useGetAllSessionsQuery, useGetCoursesQuery } from '../../store/api/liveApi';
import { formatSessionDate, getSessionStatusLabel, getSessionStatusVariant } from '../live/liveSession.utils';
import type { StudentDashboardCourse } from '../../types/dashboard';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  StudentSpaceShell,
  StudentSpaceStatus,
  formatStudentCompactNumber,
  useStudentSpaceData,
} from '../student/StudentSpaceShared';

interface StudentLiveSessionsPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

type SessionFilter = 'all' | 'live' | 'upcoming' | 'ended';

function matchesFilter(filter: SessionFilter, session: { isLive: boolean; status: string; scheduledAt: string }) {
  if (filter === 'all') return true;
  if (filter === 'live') return session.isLive || session.status === 'LIVE';
  if (filter === 'ended') return session.status === 'ENDED';
  return !session.isLive && session.status !== 'ENDED' && new Date(session.scheduledAt).getTime() >= Date.now();
}

function sortSessions<T extends { isLive: boolean; status: string; scheduledAt: string }>(sessions: T[]) {
  return [...sessions].sort((a, b) => {
    const aLive = a.isLive || a.status === 'LIVE';
    const bLive = b.isLive || b.status === 'LIVE';
    if (aLive && !bLive) return -1;
    if (!aLive && bLive) return 1;
    if (a.status === 'ENDED' && b.status !== 'ENDED') return 1;
    if (a.status !== 'ENDED' && b.status === 'ENDED') return -1;
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  });
}

export function StudentLiveSessionsPage({
  onNavigate,
  currentPath,
}: StudentLiveSessionsPageProps) {
  const shared = useStudentSpaceData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<SessionFilter>('all');

  const ready = shared.status === 'ready' && shared.dashboard;
  const {
    data: sessions = [],
    isLoading: sessionsLoading,
    error: sessionsError,
    refetch,
  } = useGetAllSessionsQuery(undefined, {
    skip: !ready,
  });
  const { data: courses = [] } = useGetCoursesQuery(undefined, {
    skip: !ready,
  });

  if (!ready) {
    return <StudentSpaceStatus shared={shared} />;
  }

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const enrolledCourseIds = new Set(shared.dashboard.courses.map((course: StudentDashboardCourse) => String(course.id)));
  const titleByCourseId = new Map(
    courses.map((course: { id: string | number; title?: string }) => [String(course.id), course.title || `Course #${course.id}`]),
  );
  shared.dashboard.courses.forEach((course: StudentDashboardCourse) => {
    titleByCourseId.set(String(course.id), course.title);
  });

  const enrichedSessions = sortSessions(
    sessions.map((session) => ({
      ...session,
      title: titleByCourseId.get(String(session.courseId)) || `Course #${session.courseId}`,
    })),
  ).filter((session) => {
    if (!matchesFilter(filter, session)) return false;
    if (!normalizedSearch) return true;
    return [session.title, session.courseId, session.teacherId, session.id]
      .join(' ')
      .toLowerCase()
      .includes(normalizedSearch);
  });

  const enrolledSessions = enrichedSessions.filter((session) =>
    enrolledCourseIds.has(String(session.courseId)),
  );
  const discoverySessions = enrichedSessions.filter(
    (session) => !enrolledCourseIds.has(String(session.courseId)),
  );

  const liveCount = enrichedSessions.filter((session) => session.isLive || session.status === 'LIVE').length;
  const upcomingCount = enrichedSessions.filter(
    (session) => !session.isLive && session.status !== 'ENDED' && new Date(session.scheduledAt).getTime() >= Date.now(),
  ).length;

  const renderSessionCard = (
    session: (typeof enrichedSessions)[number],
    emphasis: 'primary' | 'secondary',
  ) => {
    const isEnrolledCourse = enrolledCourseIds.has(String(session.courseId));
    const isLive = session.isLive || session.status === 'LIVE';

    return (
      <div
        key={`${emphasis}-${session.id}`}
        className={`rounded-[28px] border p-5 shadow-sm ${
          emphasis === 'primary'
            ? 'border-[#1152d4]/15 bg-white dark:border-slate-800 dark:bg-slate-900'
            : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
        }`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant={getSessionStatusVariant(session.status, session.isLive)}>
                {isLive ? <Radio className="h-3 w-3 animate-pulse" /> : null}
                {getSessionStatusLabel(session.status, session.isLive)}
              </Badge>
              {isEnrolledCourse ? <Badge variant="outline">Enrolled course</Badge> : null}
            </div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">{session.title}</h3>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-300">
              <span className="inline-flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                {formatSessionDate(session.scheduledAt)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Video className="h-4 w-4" />
                Session #{session.id}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 lg:w-44">
            <Button
              className="rounded-2xl bg-[#1152d4] text-white hover:bg-[#0f47b9]"
              onClick={() =>
                isEnrolledCourse && isLive
                  ? onNavigate(`/courses/${session.courseId}/live/${session.id}`)
                  : onNavigate(`/courses/${session.courseId}`)
              }
            >
              {isEnrolledCourse && isLive ? (
                <>
                  <Radio className="mr-2 h-4 w-4" />
                  Join now
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  {isLive ? 'Enroll to join' : 'View course'}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => onNavigate(`/courses/${session.courseId}`)}
            >
              Course details
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
      searchPlaceholder="Search your live sessions..."
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
              Live Sessions
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              Your enrolled sessions come first, then the rest of the platform for discovery.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-[#1152d4]/10 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Live now</p>
              <p className="mt-1 text-2xl font-bold text-[#1152d4]">{formatStudentCompactNumber(liveCount)}</p>
            </div>
            <div className="rounded-2xl border border-[#1152d4]/10 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Upcoming</p>
              <p className="mt-1 text-2xl font-bold text-[#1152d4]">{formatStudentCompactNumber(upcomingCount)}</p>
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={() => refetch()}>
              {sessionsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </section>

        {sessionsError ? (
          <div className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            Some live sessions could not be loaded right now.
          </div>
        ) : null}

        <section className="flex flex-wrap gap-3">
          {(['all', 'live', 'upcoming', 'ended'] as SessionFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === option
                  ? 'bg-[#1152d4] text-white'
                  : 'bg-white text-slate-600 hover:text-[#1152d4] dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {option === 'all'
                ? 'All'
                : option === 'live'
                  ? 'Live'
                  : option === 'upcoming'
                    ? 'Upcoming'
                    : 'Ended'}
            </button>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-[#1152d4]" />
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Your upcoming and live sessions</h2>
          </div>
          {enrolledSessions.length ? (
            enrolledSessions.map((session) => renderSessionCard(session, 'primary'))
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
              No enrolled live session matches your current filter.
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-[#1152d4]" />
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Discover more live sessions</h2>
          </div>
          {discoverySessions.length ? (
            discoverySessions.slice(0, 6).map((session) => renderSessionCard(session, 'secondary'))
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                <CircleOff className="h-4 w-4" />
                No discovery session available with this filter.
              </div>
              <p className="mt-2">Try another search or browse the course catalog for more live-enabled courses.</p>
            </div>
          )}
        </section>
      </div>
    </StudentSpaceShell>
  );
}
