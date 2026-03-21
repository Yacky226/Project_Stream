import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bolt,
  Brush,
  Database,
  Flame,
  PlayCircle,
  Star,
} from 'lucide-react';
import { useGetCoursesQuery } from '../../store/api/liveApi';
import type {
  DashboardActivityItem,
  DashboardSessionItem,
  StudentDashboardCourse,
} from '../../types/dashboard';
import { useResolvedTheme } from '../../hooks/useResolvedTheme';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  StudentSpaceShell,
  StudentSpaceStatus,
  calculateActivityStreak,
  formatStudentCompactNumber,
  formatStudentDateShort,
  getStudentCategoryMeta,
  useStudentSpaceData,
} from '../student/StudentSpaceShared';
import './StudentDashboard.css';

interface StudentDashboardProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

interface ContinueCard {
  course: StudentDashboardCourse;
  coverImage: string;
  moduleCurrent: number;
  moduleTotal: number;
}

interface RecommendedCard {
  id: string;
  title: string;
  instructor: string;
  rating: string;
  iconType: 'design' | 'database' | 'creative';
}

const FALLBACK_COURSE_IMAGES = [
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop',
];

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

function titleMatchesQuery(value: string, query: string) {
  if (!query) return true;
  return value.toLowerCase().includes(query);
}

function matchesQuery(query: string, ...values: Array<string | number>) {
  if (!query) return true;
  return values.join(' ').toLowerCase().includes(query);
}

function resolveRecommendedIcon(category: string): RecommendedCard['iconType'] {
  const normalized = category.toLowerCase();
  if (normalized.includes('design') || normalized.includes('ux') || normalized.includes('ui')) {
    return 'design';
  }
  if (normalized.includes('data') || normalized.includes('sql') || normalized.includes('database')) {
    return 'database';
  }
  return 'creative';
}

function renderRecommendedIcon(iconType: RecommendedCard['iconType'], isDark: boolean) {
  if (iconType === 'design') {
    return {
      wrapperClass: isDark
        ? 'h-16 w-16 rounded-xl bg-indigo-900/30 text-indigo-300'
        : 'h-16 w-16 rounded-xl bg-indigo-100 text-indigo-600',
      icon: <Brush className="h-8 w-8" />,
    };
  }

  if (iconType === 'database') {
    return {
      wrapperClass: isDark
        ? 'h-16 w-16 rounded-xl bg-orange-900/30 text-orange-300'
        : 'h-16 w-16 rounded-xl bg-orange-100 text-orange-600',
      icon: <Database className="h-8 w-8" />,
    };
  }

  return {
    wrapperClass: isDark
      ? 'h-16 w-16 rounded-xl bg-[#1152d4]/20 text-[#8fb5ff]'
      : 'h-16 w-16 rounded-xl bg-[#1152d4]/10 text-[#1152d4]',
    icon: <Bolt className="h-8 w-8" />,
  };
}

export function StudentDashboard({ onNavigate, currentPath }: StudentDashboardProps) {
  const shared = useStudentSpaceData();
  const [searchQuery, setSearchQuery] = useState('');
  const { isDark } = useResolvedTheme();

  const ready = shared.status === 'ready' && Boolean(shared.dashboard);
  const { data: catalogCourses = [] } = useGetCoursesQuery(undefined, {
    skip: !ready,
  });

  const dashboard = shared.dashboard;
  const profile = shared.profile;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const firstName = profile?.firstName || shared.displayName.split(' ')[0] || 'Student';
  const dashboardCourses: StudentDashboardCourse[] = dashboard?.courses ?? [];
  const dashboardSessions: DashboardSessionItem[] = dashboard?.upcomingSessions ?? [];
  const recentActivity: DashboardActivityItem[] = dashboard?.recentActivity ?? [];
  const dashboardStats = dashboard?.stats;
  const streak = calculateActivityStreak(
    recentActivity.map((activity) => activity.occurredAt),
  );

  const catalogById = useMemo(
    () => new Map(catalogCourses.map((course) => [String(course.id), course])),
    [catalogCourses],
  );

  const continueCards = useMemo<ContinueCard[]>(() => {
    const source = dashboardCourses
      .filter((course) => course.status !== 'ABANDONNE')
      .filter((course) =>
        titleMatchesQuery(`${course.title} ${course.description} ${course.category}`, normalizedQuery),
      )
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 2);

    return source.map((course, index) => {
      const detail = catalogById.get(String(course.id));
      const moduleTotal = 12;
      const moduleCurrent = Math.max(1, Math.round((course.progress / 100) * moduleTotal));
      return {
        course,
        coverImage: detail?.coverImage || FALLBACK_COURSE_IMAGES[index % FALLBACK_COURSE_IMAGES.length],
        moduleCurrent,
        moduleTotal,
      };
    });
  }, [catalogById, dashboardCourses, normalizedQuery]);

  const enrolledCourseIds = useMemo(
    () => new Set(dashboardCourses.map((course) => String(course.id))),
    [dashboardCourses],
  );

  const recommendedCards = useMemo<RecommendedCard[]>(() => {
    return catalogCourses
      .filter((course) => !enrolledCourseIds.has(String(course.id)))
      .filter((course) =>
        titleMatchesQuery(`${course.title} ${course.description} ${course.category}`, normalizedQuery),
      )
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
      .slice(0, 3)
      .map((course) => ({
        id: String(course.id),
        title: course.title,
        instructor: course.teacherId ? `Instructor #${course.teacherId}` : 'Course Mentor',
        rating: '4.8',
        iconType: resolveRecommendedIcon(course.category),
      }));
  }, [catalogCourses, enrolledCourseIds, normalizedQuery]);

  const upcomingSessions = useMemo(() => {
    return [...dashboardSessions]
      .filter((session) =>
        titleMatchesQuery(
          `${session.courseTitle} ${session.status} ${session.courseId}`,
          normalizedQuery,
        ),
      )
      .sort((a, b) => new Date(a.startAt || 0).getTime() - new Date(b.startAt || 0).getTime())
      .slice(0, 3);
  }, [dashboardSessions, normalizedQuery]);

  const weeklyBars = useMemo(() => {
    const bars = WEEK_LABELS.map((label, index) => ({
      index,
      label,
      hours: 0,
    }));

    recentActivity.forEach((activity) => {
      if (!activity.occurredAt) return;
      const date = new Date(activity.occurredAt);
      if (Number.isNaN(date.getTime())) return;
      const jsDay = date.getDay();
      const dayIndex = jsDay === 0 ? 6 : jsDay - 1;
      const weight =
        activity.type === 'completed'
          ? 2.4
          : activity.type === 'session'
            ? 2
            : activity.type === 'progress'
              ? 1.3
              : 0.8;
      bars[dayIndex].hours += weight;
    });

    const maxHours = Math.max(...bars.map((day) => day.hours), 1);
    const highlightedIndex = bars.reduce(
      (bestIndex, day, index, array) =>
        day.hours > array[bestIndex].hours ? index : bestIndex,
      0,
    );

    return {
      highlightedIndex,
      items: bars.map((day) => ({
        ...day,
        valueLabel: day.hours.toFixed(1),
        heightPercent: Math.max(20, Math.round((day.hours / maxHours) * 90)),
      })),
      totalHours: bars.reduce((sum, day) => sum + day.hours, 0),
    };
  }, [recentActivity]);

  const weeklyGoalTarget = 40;
  const weeklyGoalCurrent = Math.min(weeklyBars.totalHours, weeklyGoalTarget);
  const weeklyGoalPercent = Math.min(
    100,
    Math.round((weeklyGoalCurrent / weeklyGoalTarget) * 100),
  );
  const ringRadius = 28;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - weeklyGoalPercent / 100);

  const achievementCards = [
    {
      title: 'Fast Learner',
      description: 'Keep your daily learning velocity high.',
      unlocked: (dashboardStats?.averageProgress ?? 0) >= 65,
      iconClass: isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-600',
      icon: <Flame className="h-7 w-7" />,
    },
    {
      title: '10 Day Streak',
      description: 'Maintain consistent progress for 10 days.',
      unlocked: streak >= 10,
      iconClass: isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600',
      icon: <Star className="h-7 w-7 fill-current" />,
    },
    {
      title: 'Quiz Master',
      description: 'Reach perfect completion in advanced modules.',
      unlocked: (dashboardStats?.completedCourses ?? 0) >= 3,
      iconClass: isDark ? 'bg-[#334155] text-[#cbd5e1]' : 'bg-[#e2e8f0] text-[#475569]',
      icon: <Bolt className="h-7 w-7" />,
    },
  ];
  const visibleAchievementCards = achievementCards.filter((achievement) =>
    matchesQuery(normalizedQuery, achievement.title, achievement.description),
  );
  const hasNoResult =
    !continueCards.length &&
    !recommendedCards.length &&
    !upcomingSessions.length &&
    !visibleAchievementCards.length;
  const surfaceClass = isDark
    ? 'border-[#1e293b] bg-[#0f172a]'
    : 'border-[#1152d4]/5 bg-white';
  const emptyStateClass = isDark
    ? 'border-[#334155] bg-[#0f172a] text-[#cbd5e1]'
    : 'border-[#cbd5e1] bg-white text-[#64748b]';

  if (!ready || !dashboard) {
    return <StudentSpaceStatus shared={shared} />;
  }

  return (
    <StudentSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search courses, instructors, lessons..."
      displayName={shared.displayName}
      displayLevel={shared.displayLevel}
      initials={shared.initials}
      avatarUrl={shared.avatarUrl}
      goalProgress={shared.goalProgress}
      unreadCount={shared.unreadCount}
    >
      <div className="student-dashboard-page space-y-8">
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1
                className={`text-3xl font-black tracking-tight ${
                  isDark ? 'text-[#e2e8f0]' : 'text-[#0f172a]'
                }`}
              >
                Welcome back, {firstName}!
              </h1>
              <p className={`mt-2 ${isDark ? 'text-[#cbd5e1]' : 'text-[#64748b]'}`}>
                You're on a {Math.max(streak, 1)}-day learning streak. Keep the momentum going!
              </p>
            </div>
            <span
              className={`rounded-full px-4 py-1.5 text-xs font-bold ${
                isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
              }`}
            >
              Live Study Room:{' '}
              {formatStudentCompactNumber(1_200 + (dashboardStats?.upcomingSessions ?? 0) * 75)} Online
            </span>
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-12">
          <div className="min-w-0 space-y-8 xl:col-span-8">
            <section className={`rounded-2xl border p-6 shadow-sm ${surfaceClass}`}>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Learning Progress</h3>
                  <p className={`text-xs ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                    Weekly activity overview
                  </p>
                </div>
                <span className="rounded-lg bg-[#1152d4]/5 px-3 py-1.5 text-xs font-bold">
                  This Week
                </span>
              </div>

              <div className="flex h-48 items-end justify-between gap-2 pb-2">
                {weeklyBars.items.map((day, index) => {
                  const highlighted = index === weeklyBars.highlightedIndex;
                  return (
                    <div key={day.label} className="group flex flex-1 flex-col items-center gap-2">
                      <div
                        className={`relative w-full rounded-t-lg transition-all ${
                          highlighted
                            ? 'bg-[#1152d4] shadow-lg shadow-[#1152d4]/20'
                            : 'bg-[#1152d4]/10 group-hover:bg-[#1152d4]/20'
                        }`}
                        style={{ height: `${day.heightPercent}%` }}
                      >
                        {highlighted ? (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-[#0f172a] px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {day.valueLabel}h
                          </div>
                        ) : null}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          highlighted ? 'text-[#1152d4]' : isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'
                        }`}
                      >
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight">Continue Learning</h3>
                <button
                  type="button"
                  onClick={() => onNavigate('/student/courses')}
                  className="text-sm font-bold text-[#1152d4] hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {continueCards.map((item) => {
                  const categoryMeta = getStudentCategoryMeta(item.course.category, isDark);
                  return (
                    <article
                      key={item.course.id}
                      className={`group overflow-hidden rounded-2xl border shadow-sm transition-all hover:shadow-xl hover:shadow-[#1152d4]/5 ${
                        isDark ? 'border-[#1e293b] bg-[#0f172a]' : 'border-[#1152d4]/5 bg-white'
                      }`}
                    >
                      <div
                        className={`relative aspect-video overflow-hidden ${
                          isDark ? 'bg-[#1e293b]' : 'bg-[#e2e8f0]'
                        }`}
                      >
                        <ImageWithFallback
                          src={item.coverImage}
                          alt={item.course.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-4 left-4">
                          <span className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${categoryMeta.pillClass}`}>
                            {item.course.category}
                          </span>
                        </div>
                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
                          <button
                            type="button"
                            onClick={() => onNavigate(`/courses/${item.course.id}`)}
                            className="translate-y-12 rounded-full bg-[#1152d4] p-2 text-white transition-transform duration-300 group-hover:translate-y-0"
                          >
                            <PlayCircle className="h-6 w-6" />
                          </button>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="mb-2 flex items-start justify-between gap-4">
                          <h4 className="line-clamp-1 text-base font-bold">{item.course.title}</h4>
                          <span className="text-xs font-bold text-[#1152d4]">{item.course.progress}%</span>
                        </div>
                        <p className={`mb-4 text-xs ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                          Module {item.moduleCurrent} of {item.moduleTotal}
                        </p>
                        <div
                          className={`h-1.5 w-full overflow-hidden rounded-full ${
                            isDark ? 'bg-[#334155]' : 'bg-[#e2e8f0]'
                          }`}
                        >
                          <div className="h-full rounded-full bg-[#1152d4]" style={{ width: `${item.course.progress}%` }} />
                        </div>
                      </div>
                    </article>
                  );
                })}

                {!continueCards.length ? (
                  <div className={`rounded-2xl border border-dashed p-6 text-sm md:col-span-2 ${emptyStateClass}`}>
                    No matching enrolled course found for this search.
                  </div>
                ) : null}
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-xl font-bold tracking-tight">Recommended for You</h3>
              <div className="student-dashboard-recommended-list">
                {recommendedCards.map((course) => {
                  const icon = renderRecommendedIcon(course.iconType, isDark);
                  return (
                    <article
                      key={course.id}
                      className={`student-dashboard-recommended-card flex items-center gap-4 rounded-2xl border p-4 ${surfaceClass}`}
                    >
                      <div className={`flex items-center justify-center ${icon.wrapperClass}`}>
                        {icon.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{course.title}</p>
                        <p className={`text-xs ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                          {course.instructor}
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-[10px] font-bold">{course.rating}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {!recommendedCards.length ? (
                  <div className={`student-dashboard-recommended-empty rounded-2xl border border-dashed p-6 text-sm ${emptyStateClass}`}>
                    No recommendation available with this filter.
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <aside className="min-w-0 space-y-8 xl:col-span-4">
            <section className={`rounded-2xl border p-6 shadow-sm ${surfaceClass}`}>
              <h3 className="mb-4 text-lg font-bold">Upcoming Live Sessions</h3>
              <div className="space-y-4">
                {upcomingSessions.map((session) => {
                  const dateLabel = formatStudentDateShort(session.startAt);
                  const split = dateLabel.split(' ');
                  const day = split[0] || '--';
                  const month = split[1] || '---';
                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => onNavigate(`/courses/${session.courseId}/live/${session.id}`)}
                      className="group flex w-full items-center gap-4 text-left"
                    >
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-[#1152d4]/10 bg-[#1152d4]/5 text-[#1152d4]">
                        <span className="text-[10px] font-bold uppercase leading-none">{month}</span>
                        <span className="text-lg font-bold leading-none">{day}</span>
                      </div>
                      <div className="flex-1 border-b border-[#1152d4]/5 pb-4 group-last:border-0">
                        <p className="truncate text-sm font-bold">{session.courseTitle}</p>
                        <p className={`text-xs ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                          {new Date(session.startAt || '').toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          - {session.isLive ? 'Live now' : 'Scheduled'}
                        </p>
                      </div>
                      <ArrowRight
                        className={`h-4 w-4 transition-colors group-hover:text-[#1152d4] ${
                          isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'
                        }`}
                      />
                    </button>
                  );
                })}

                {!upcomingSessions.length ? (
                  <p className={`text-xs ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                    No upcoming session found.
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => onNavigate('/student/live')}
                className={`mt-4 w-full py-2 text-xs font-bold uppercase tracking-widest transition-colors hover:text-[#1152d4] ${
                  isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'
                }`}
              >
                Full Schedule
              </button>
            </section>

            <section className={`rounded-2xl border p-6 shadow-sm ${surfaceClass}`}>
              <h3 className="mb-4 text-lg font-bold">Achievements</h3>
              {visibleAchievementCards.length ? (
                <div className="grid grid-cols-3 gap-4">
                  {visibleAchievementCards.map((achievement) => (
                    <div
                      key={achievement.title}
                      className={`group flex cursor-default flex-col items-center gap-2 ${
                        achievement.unlocked ? '' : 'grayscale opacity-40'
                      }`}
                    >
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-md ${
                          isDark ? 'border-[#334155]' : 'border-white'
                        } ${achievement.iconClass}`}
                      >
                        {achievement.icon}
                      </div>
                      <p className="text-center text-[10px] font-bold leading-tight">{achievement.title}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-xs ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                  No achievement matches this search.
                </p>
              )}

              <div className="mt-6 border-t border-[#1152d4]/5 pt-6">
                <p className="mb-2 text-xs font-bold">Next Milestone</p>
                <div className="flex items-center gap-3">
                  <div
                    className={`h-1.5 flex-1 overflow-hidden rounded-full ${
                      isDark ? 'bg-[#334155]' : 'bg-[#e2e8f0]'
                    }`}
                  >
                    <div className="h-full rounded-full bg-[#1152d4]" style={{ width: `${shared.goalProgress}%` }} />
                  </div>
                  <span className={`text-[10px] font-bold ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                    {shared.goalProgress}%
                  </span>
                </div>
                <p
                  className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${
                    isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'
                  }`}
                >
                  Top 5% Student
                </p>
              </div>
            </section>

            <section
              className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #1152d4 0%, #4a80ef 100%)',
                boxShadow: '0 18px 36px rgba(17, 82, 212, 0.24)',
              }}
            >
              <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <h3 className="relative z-10 mb-1 text-lg font-bold">Weekly Goal</h3>
              <p className="relative z-10 mb-4 text-xs text-white/80">40 hours learning target</p>
              <div className="relative z-10 flex items-center gap-4">
                <div className="relative h-16 w-16">
                  <svg className="h-16 w-16 -rotate-90 transform">
                    <circle
                      cx="32"
                      cy="32"
                      r={ringRadius}
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-white/20"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r={ringRadius}
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringOffset}
                      className="text-white"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {weeklyGoalPercent}%
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-black tracking-tight">
                    {weeklyGoalCurrent.toFixed(1)}{' '}
                    <span className="text-sm font-medium opacity-80">/ {weeklyGoalTarget}h</span>
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                    {weeklyGoalPercent >= 80 ? 'Almost there' : 'Keep going'}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>

        {hasNoResult ? (
          <div className={`rounded-2xl border border-dashed p-6 text-sm ${emptyStateClass}`}>
            No result matches your search in the student dashboard.
          </div>
        ) : null}
      </div>
    </StudentSpaceShell>
  );
}

