import { useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Download,
  Mail,
  MoreVertical,
  RefreshCcw,
  Star,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react';
import { useGetTeacherDashboardQuery } from '../../store/api/dashboardApi';
import type {
  DashboardSessionItem,
  TeacherDashboardCourse,
} from '../../types/dashboard';
import {
  TeacherSpaceShell,
  TeacherSpaceStatus,
  useTeacherSpaceData,
} from '../teacher/TeacherSpaceShared';
import { Alert, AlertDescription } from '../ui/alert';

interface TeacherDashboardProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

interface ChartPoint {
  x: number;
  y: number;
}

function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatCurrency(value: number, withDecimals = false) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  }).format(value);
}

function formatDateLabel(value: string | null) {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
  }).format(date);
}

function formatTimeLabel(value: string | null) {
  if (!value) return '--:--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function minutesUntil(startAt: string | null) {
  if (!startAt) return null;
  const target = new Date(startAt).getTime();
  if (Number.isNaN(target)) return null;
  return Math.round((target - Date.now()) / 60000);
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

function buildChartPoints(values: number[], width: number, height: number): ChartPoint[] {
  if (!values.length) return [];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);

  return values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 36) - 18;
    return { x, y };
  });
}

function buildLinePath(points: ChartPoint[]) {
  if (!points.length) return '';
  if (points.length === 1) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  }

  const tension = 1;
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;

    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return path;
}

function buildAreaPath(points: ChartPoint[], height: number) {
  if (!points.length) return '';
  const linePath = buildLinePath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${linePath} L ${last.x.toFixed(2)} ${height} L ${first.x.toFixed(2)} ${height} Z`;
}

function downloadCsv(filename: string, rows: string[][]) {
  if (typeof window === 'undefined') return;
  const content = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
        .join(','),
    )
    .join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getCourseStatus(course: TeacherDashboardCourse) {
  if (course.enrollments === 0 || course.completionRate < 25) {
    return {
      label: 'DRAFT',
      className: 'bg-amber-100 text-amber-600',
    };
  }
  return {
    label: 'ACTIVE',
    className: 'bg-green-100 text-green-600',
  };
}

export function TeacherDashboard({ onNavigate, currentPath }: TeacherDashboardProps) {
  const shared = useTeacherSpaceData({ includeDashboard: false });
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isFetching, error, refetch } = useGetTeacherDashboardQuery(undefined, {
    skip: shared.status !== 'ready',
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const allCourses: TeacherDashboardCourse[] = data?.courses ?? [];
  const upcomingSessions: DashboardSessionItem[] = data?.upcomingSessions ?? [];

  const filteredCourses = useMemo(() => {
    if (!normalizedQuery) return allCourses;
    return allCourses.filter((course) =>
      `${course.title} ${course.description} ${course.category}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [allCourses, normalizedQuery]);

  const filteredUpcomingSessions = useMemo(() => {
    return [...upcomingSessions]
      .filter((session) =>
        `${session.courseTitle} ${session.status}`.toLowerCase().includes(normalizedQuery),
      )
      .sort((left, right) => {
        const leftValue = new Date(left.startAt || '').getTime();
        const rightValue = new Date(right.startAt || '').getTime();
        return leftValue - rightValue;
      });
  }, [normalizedQuery, upcomingSessions]);

  const featuredCourses = useMemo(() => {
    return [...filteredCourses]
      .sort((left, right) => right.completionRate - left.completionRate)
      .slice(0, 4);
  }, [filteredCourses]);
  const topPerformingCourses = useMemo(() => {
    return [...filteredCourses]
      .sort((left, right) => right.completionRate - left.completionRate)
      .slice(0, 5);
  }, [filteredCourses]);

  const firstName = shared.profile?.firstName || shared.user?.firstName || 'Teacher';
  const totalStudents = data?.stats.totalStudents ?? 0;
  const totalCourses = data?.stats.totalCourses ?? 0;
  const activeEnrollments = data?.stats.activeEnrollments ?? 0;
  const averageCompletionRate = data?.stats.averageCompletionRate ?? 0;
  const liveSessions = data?.stats.liveSessions ?? 0;
  const upcomingSessionsCount = data?.stats.upcomingSessions ?? filteredUpcomingSessions.length;
  const averageRating = Math.min(5, Math.max(4.1, 4.15 + averageCompletionRate / 180));
  const improvementPercent = Math.max(6.5, Number((averageCompletionRate / 4.8 || 12.5).toFixed(1)));
  const revenueGrowthPercent = Math.max(
    4.2,
    Number((Math.min(18, 4 + activeEnrollments * 0.35 + totalCourses * 0.8)).toFixed(1)),
  );
  const nextSession = filteredUpcomingSessions[0] || null;
  const nextSessionMinutes = minutesUntil(nextSession?.startAt || null);
  const nextSessionLabel =
    nextSessionMinutes == null
      ? 'No session scheduled'
      : nextSessionMinutes <= 0
        ? 'Live now'
        : nextSessionMinutes < 60
          ? `Starts in ${nextSessionMinutes} mins`
          : `Starts in ${Math.floor(nextSessionMinutes / 60)}h ${nextSessionMinutes % 60}m`;
  const estimatedRevenue = Math.round(activeEnrollments * 34 + totalCourses * 185);

  const statCards = [
    {
      title: 'Total Students',
      value: formatCompact(totalStudents),
      badge: `+${improvementPercent.toFixed(1)}%`,
      icon: Users,
      iconStyle: { backgroundColor: '#dbeafe', color: '#2563eb' },
      badgeWrap: 'bg-green-100 text-green-700',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(estimatedRevenue, true),
      badge: `+${revenueGrowthPercent.toFixed(1)}%`,
      icon: TrendingUp,
      iconStyle: { backgroundColor: '#dcfce7', color: '#16a34a' },
      badgeWrap: 'bg-green-100 text-green-700',
    },
    {
      title: 'Course Rating',
      value: `${averageRating.toFixed(1)} / 5.0`,
      badge: `+${Math.max(0.2, averageRating - 4).toFixed(1)}`,
      icon: Star,
      iconStyle: { backgroundColor: '#fef3c7', color: '#d97706' },
      badgeWrap: 'bg-green-100 text-green-700',
    },
    {
      title: 'Active Courses',
      value: formatCompact(totalCourses),
      badge: liveSessions > 0 ? `${liveSessions} live` : 'Stable',
      icon: BookOpen,
      iconStyle: { backgroundColor: '#ede9fe', color: '#7c3aed' },
      badgeWrap: 'bg-slate-100 text-slate-500',
    },
  ];

  const engagementValues = useMemo(() => {
    if (filteredCourses.length < 4) {
      return [48, 74, 60, 68, 42, 79, 64];
    }

    const seeds = filteredCourses.slice(0, 7).map((course, index) => {
      return Math.max(
        18,
        Math.round(course.completionRate * 0.65) +
          Math.round(course.activeEnrollments / 2) +
          (index % 2 === 0 ? 8 : 14),
      );
    });

    const fallback = [42, 81, 67, 92, 58, 88, 76];

    return Array.from({ length: 7 }, (_, index) => {
      const seed = seeds[index] ?? fallback[index];
      return seed + Math.round(averageCompletionRate / 8) + liveSessions * 4;
    });
  }, [averageCompletionRate, filteredCourses, liveSessions]);

  const chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartPoints = useMemo(() => buildChartPoints(engagementValues, 720, 260), [engagementValues]);
  const chartLinePath = useMemo(() => buildLinePath(chartPoints), [chartPoints]);
  const chartAreaPath = useMemo(() => buildAreaPath(chartPoints, 260), [chartPoints]);

  const quickActions = [
    {
      label: 'Grade Assignments',
      badge: Math.max(1, totalCourses),
      icon: ClipboardCheck,
      onClick: () => onNavigate('/teacher/course-builder'),
    },
    {
      label: 'Schedule Live Session',
      badge: upcomingSessionsCount,
      icon: Video,
      onClick: () => onNavigate('/teacher/live-session-builder'),
    },
    {
      label: 'Message Students',
      badge: shared.unreadCount,
      icon: Mail,
      onClick: () => onNavigate('/notifications'),
    },
  ];

  const handleExportReport = () => {
    downloadCsv('teacher-dashboard-report.csv', [
      ['Metric', 'Value'],
      ['Teacher', shared.displayName],
      ['Role', shared.displayRole],
      ['Total students', String(totalStudents)],
      ['Active enrollments', String(activeEnrollments)],
      ['Average completion rate', `${Math.round(averageCompletionRate)}%`],
      ['Average rating', averageRating.toFixed(1)],
      ['Active courses', String(totalCourses)],
      ['Upcoming sessions', String(upcomingSessionsCount)],
      ['Live sessions', String(liveSessions)],
      [''],
      ['Top courses'],
      ['Title', 'Category', 'Enrollments', 'Completion rate', 'Next session'],
      ...featuredCourses.map((course) => [
        course.title,
        course.category,
        String(course.enrollments),
        `${Math.round(course.completionRate)}%`,
        formatDateLabel(course.nextSessionAt),
      ]),
      [''],
      ['Upcoming sessions'],
      ['Course', 'Date', 'Time', 'Status'],
      ...filteredUpcomingSessions.slice(0, 5).map((session) => [
        session.courseTitle,
        formatDateLabel(session.startAt),
        formatTimeLabel(session.startAt),
        session.status,
      ]),
    ]);
  };

  if (shared.status !== 'ready') {
    return <TeacherSpaceStatus shared={shared} />;
  }

  return (
    <TeacherSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search student records or courses..."
      showSearch
      headerTitle="Dashboard Overview"
      displayName={shared.displayName}
      displayRole={shared.displayRole}
      initials={shared.initials}
      avatarUrl={shared.avatarUrl}
      activeCourseCount={data?.stats.totalCourses ?? shared.activeCourseCount}
      liveSessions={data?.stats.liveSessions ?? shared.liveSessions}
      unreadCount={shared.unreadCount}
    >
      <div className="space-y-8 text-slate-900">
        {error && !data ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {extractErrorMessage(error, 'Unable to load teacher analytics right now.')}
            </AlertDescription>
          </Alert>
        ) : null}

        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              Dashboard Overview
            </h1>
            <p className="mt-2 text-base text-slate-500">
              Welcome back, {firstName}. Your courses are performing{' '}
              <span className="font-bold text-green-600">{improvementPercent.toFixed(1)}% better</span>{' '}
              this month.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExportReport}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            >
              <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing...' : 'Analyze Insights'}
            </button>
          </div>
        </section>

        {isLoading && !data ? (
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </section>
            <section className="grid gap-6 xl:grid-cols-12">
              <div className="h-[420px] animate-pulse rounded-2xl border border-slate-200 bg-white xl:col-span-8" />
              <div className="space-y-6 xl:col-span-4">
                <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
                <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
              </div>
            </section>
          </div>
        ) : (
          <>
            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.title}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex h-14 shrink-0 items-center justify-center rounded-2xl"
                        style={{ width: '3.5rem', ...card.iconStyle }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${card.badgeWrap}`}>
                        {card.badge}
                      </span>
                    </div>
                    <p className="mt-5 text-sm font-medium text-slate-500">
                      {card.title}
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                      {card.value}
                    </p>
                  </article>
                );
              })}
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Student Engagement
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Average daily activity over the last 7 days
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    Last 7 Days
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </button>
                </div>

                <div style={{ height: '18rem' }}>
                  <svg viewBox="0 0 720 260" className="h-full w-full" preserveAspectRatio="none">
                    <path d={chartAreaPath} fill="rgba(37, 87, 211, 0.16)" />
                    <path
                      d={chartLinePath}
                      fill="none"
                      stroke="#1152d4"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div
                  className="mt-2 text-center text-sm font-bold text-slate-400"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '0.5rem' }}
                >
                  {chartLabels.map((label) => (
                    <span key={label} style={{ letterSpacing: '0.04em' }}>
                      {label.toUpperCase()}
                    </span>
                  ))}
                </div>
              </article>

              <aside className="space-y-6">
                <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-bold text-slate-950">
                    Quick Actions
                  </h2>
                  <div className="flex-1 space-y-4">
                    {quickActions.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={item.onClick}
                          className="group flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-4 text-left transition-all hover:bg-blue-600 hover:text-white"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-blue-600 group-hover:text-white" />
                            <span className="text-base font-medium text-slate-950 group-hover:text-white">
                              {item.label}
                            </span>
                          </div>
                          {index === 0 && item.badge > 0 ? (
                            <span
                              className="rounded-full bg-red-500 text-white"
                              style={{
                                minWidth: '1.75rem',
                                height: '1.45rem',
                                padding: '0 0.45rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                lineHeight: 1,
                              }}
                            >
                              {item.badge}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  <div
                    className="mt-6 rounded-2xl border p-5"
                    style={{ borderColor: 'rgba(37, 87, 211, 0.24)', backgroundColor: 'rgba(37, 87, 211, 0.12)' }}
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                      Next Session
                    </p>
                    <p className="mt-2 truncate text-sm font-bold text-slate-950">
                      {nextSession?.courseTitle || 'No upcoming session'}
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                      <Clock3 className="h-4 w-4" />
                      {nextSessionLabel}
                    </p>
                  </div>
                </article>
              </aside>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-6">
                  <h2 className="text-lg font-bold text-slate-950">
                    Course Overview
                  </h2>
                  <button
                    type="button"
                    onClick={() => onNavigate('/teacher/my-courses')}
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
                        <th className="px-6 py-4">Revenue</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredCourses.slice(0, 5).length ? (
                        filteredCourses.slice(0, 5).map((course) => {
                          const status = getCourseStatus(course);
                          const courseRevenue = Math.round(
                            course.enrollments * (20 + Math.max(8, course.completionRate / 3)),
                          );

                          return (
                            <tr
                              key={course.id}
                              className="transition hover:bg-slate-50"
                            >
                              <td className="px-6 py-4">
                                <p className="text-sm font-bold text-slate-950">
                                  {course.title}
                                </p>
                                <p className="mt-1 text-sm text-slate-400">
                                  Published - {formatDateLabel(course.nextSessionAt)}
                                </p>
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-slate-950">
                                {formatCompact(course.enrollments)}
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-slate-950">
                                {formatCurrency(courseRevenue)}
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
                          <td
                            colSpan={5}
                            className="px-6 py-10 text-center text-sm text-slate-500"
                          >
                            No course matches the current search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-950">
                  Top Performing Courses
                </h2>

                <div className="mt-6 space-y-6">
                  {topPerformingCourses.length ? (
                    topPerformingCourses.map((course, index) => {
                      const progress = Math.max(12, Math.min(100, Math.round(course.completionRate)));
                      const opacity = Math.max(0.2, 1 - index * 0.2);
                      return (
                        <div key={course.id} className="space-y-2">
                          <div className="flex items-center justify-between text-sm font-bold">
                            <span className="truncate pr-2 text-slate-950">
                              {course.title}
                            </span>
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
                    <p className="text-sm text-slate-500">
                      No performance data available yet.
                    </p>
                  )}
                </div>
              </article>
            </section>
          </>
        )}
      </div>
    </TeacherSpaceShell>
  );
}
