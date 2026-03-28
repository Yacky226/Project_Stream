import {
  ArrowRight,
  CalendarClock,
  CircleOff,
  Loader2,
  Radio,
  RefreshCcw,
  Video,
} from 'lucide-react';
import { formatSessionDate, getSessionStatusLabel, getSessionStatusVariant } from '../../../live/liveSession.utils';
import { formatStudentCompactNumber } from '../../../student/StudentSpaceShared';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import type { SessionFilter } from '../studentLiveSessions.types';
import { getStudentSessionFilterLabel } from '../studentLiveSessions.utils';
import type { StudentLiveSessionsData } from '../useStudentLiveSessionsData';

interface StudentLiveSessionsPageContentProps {
  data: StudentLiveSessionsData;
  onNavigate: (path: string | number) => void;
}

export function StudentLiveSessionsPageContent({
  data,
  onNavigate,
}: StudentLiveSessionsPageContentProps) {
  const renderSessionCard = (
    session: StudentLiveSessionsData['enrolledSessions'][number],
    emphasis: 'primary' | 'secondary',
  ) => {
    const isEnrolledCourse = data.isEnrolledCourse(session.courseId);
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
            <p className="mt-1 text-2xl font-bold text-[#1152d4]">
              {formatStudentCompactNumber(data.summary.liveCount)}
            </p>
          </div>
          <div className="rounded-2xl border border-[#1152d4]/10 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Upcoming
            </p>
            <p className="mt-1 text-2xl font-bold text-[#1152d4]">
              {formatStudentCompactNumber(data.summary.upcomingCount)}
            </p>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={() => data.refetch()}>
            {data.isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </section>

      {data.hasError ? (
        <div className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
          Some live sessions could not be loaded right now.
        </div>
      ) : null}

      <section className="flex flex-wrap gap-3">
        {(['all', 'live', 'upcoming', 'ended'] as SessionFilter[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => data.setFilter(option)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              data.filter === option
                ? 'bg-[#1152d4] text-white'
                : 'bg-white text-slate-600 hover:text-[#1152d4] dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {getStudentSessionFilterLabel(option)}
          </button>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-[#1152d4]" />
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Your upcoming and live sessions
          </h2>
        </div>
        {data.enrolledSessions.length ? (
          data.enrolledSessions.map((session) => renderSessionCard(session, 'primary'))
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
            No enrolled live session matches your current filter.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-[#1152d4]" />
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Discover more live sessions
          </h2>
        </div>
        {data.discoverySessions.length ? (
          data.discoverySessions.slice(0, 6).map((session) => renderSessionCard(session, 'secondary'))
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
  );
}
