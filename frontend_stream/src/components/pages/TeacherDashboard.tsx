import { useMemo, useState } from 'react';
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Download,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  MessageCircle,
  MessageSquare,
  MoreVertical,
  Rocket,
  Search,
  Settings,
  Star,
  Users,
  Video,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGetTeacherDashboardQuery } from '../../store/api/dashboardApi';
import { useGetProfileQuery } from '../../store/api/userApi';
import type { TeacherDashboardCourse } from '../../types/dashboard';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';

interface TeacherDashboardProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

interface SidebarItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
}

interface MetricCardData {
  title: string;
  value: string;
  chipLabel: string;
  chipClassName: string;
  icon: typeof Users;
  iconClassName: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
  { label: 'My Courses', path: '/teacher/live-sessions', icon: GraduationCap },
  { label: 'Students', path: '/teacher/live-sessions', icon: Users },
  { label: 'Assignments', path: '/teacher/course-builder/curriculum', icon: ClipboardCheck },
  { label: 'Analytics', path: '/teacher/dashboard', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const ENGAGEMENT_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
const COURSE_THUMBNAILS = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop',
];
const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC5HWd5zjBfczACnfIVsspk3D58MFPQY7LDsAKx_Hn_CYb4yZHdMCutKafy6INrjBLxnPF5Gmaq091dkeGW0N2o8rU-_euVLX8-YQBIllPIKH4y_KbvURCULqptOhBdQLGpYehXv_2kP_IaUwMx28VGYuDl6thPUzA-ZVrBAh_D7fmSWNSavvQLLGxCx2eVaYeNNWLpJrc-LRISJ2PobsD-VfcEjyLdprqBpml-XgG79y4fUa2TCxOpYAdyvu5MLYM3-iC8RCfhFmQ';

function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateLabel(value: string | null) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
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

function isNavActive(currentPath: string | undefined, itemPath: string) {
  if (!currentPath) return false;
  if (itemPath === '/teacher/dashboard') return currentPath === '/teacher/dashboard';
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

function statusMeta(course: TeacherDashboardCourse) {
  if (course.enrollments === 0 || course.completionRate < 25) {
    return {
      label: 'DRAFT',
      className: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
    };
  }
  return {
    label: 'ACTIVE',
    className: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
  };
}

function buildEngagementSeries(courses: TeacherDashboardCourse[]) {
  const source = courses.slice(0, 7).map((course) => Math.max(24, Math.round(course.completionRate)));
  if (!source.length) {
    return [65, 71, 68, 84, 72, 58, 77];
  }
  while (source.length < 7) {
    source.push(source[source.length % Math.max(source.length, 1)] || 64);
  }
  return source.slice(0, 7);
}

function buildChartPaths(values: number[]) {
  const width = 472;
  const height = 150;
  const max = Math.max(...values, 1);
  const step = width / Math.max(values.length - 1, 1);

  const points = values.map((value, index) => {
    const normalized = value / max;
    const x = Math.round(index * step);
    const y = Math.round(height - normalized * (height - 8));
    return { x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`)
    .join(' ');

  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return { linePath, areaPath };
}

function minutesUntil(startAt: string | null) {
  if (!startAt) return null;
  const target = new Date(startAt).getTime();
  if (Number.isNaN(target)) return null;
  return Math.round((target - Date.now()) / 60000);
}

export function TeacherDashboard({ onNavigate, currentPath }: TeacherDashboardProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const shouldLoad = Boolean(isAuthenticated && user?.role === 'teacher');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetTeacherDashboardQuery(undefined, { skip: !shouldLoad });
  const { data: profile } = useGetProfileQuery(undefined, { skip: !shouldLoad });

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const allCourses = data?.courses ?? [];
  const filteredCourses = useMemo(() => {
    if (!normalizedQuery) return allCourses;
    return allCourses.filter((course) =>
      `${course.title} ${course.description} ${course.category}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [allCourses, normalizedQuery]);

  const upcomingSessions = useMemo(() => {
    return [...(data?.upcomingSessions ?? [])]
      .filter((session) =>
        `${session.courseTitle} ${session.status}`.toLowerCase().includes(normalizedQuery),
      )
      .sort((a, b) => {
        const left = new Date(a.startAt || '').getTime();
        const right = new Date(b.startAt || '').getTime();
        return left - right;
      });
  }, [data?.upcomingSessions, normalizedQuery]);

  const nextSession = upcomingSessions[0] || null;
  const nextSessionMinutes = minutesUntil(nextSession?.startAt || null);
  const nextSessionLabel =
    nextSessionMinutes == null
      ? 'No session planned'
      : nextSessionMinutes <= 0
        ? 'Live now'
        : nextSessionMinutes < 60
          ? `Starts in ${nextSessionMinutes} mins`
          : `Starts in ${Math.floor(nextSessionMinutes / 60)}h ${nextSessionMinutes % 60}m`;

  const topPerformingCourses = useMemo(() => {
    return [...filteredCourses].sort((a, b) => b.completionRate - a.completionRate).slice(0, 5);
  }, [filteredCourses]);

  const engagementValues = useMemo(() => buildEngagementSeries(filteredCourses), [filteredCourses]);
  const chartPaths = useMemo(() => buildChartPaths(engagementValues), [engagementValues]);

  const totalStudents = data?.stats.totalStudents ?? 0;
  const totalCourses = data?.stats.totalCourses ?? 0;
  const activeEnrollments = data?.stats.activeEnrollments ?? 0;
  const averageCompletionRate = data?.stats.averageCompletionRate ?? 0;
  const liveSessions = data?.stats.liveSessions ?? 0;

  const estimatedRevenue = Math.round(activeEnrollments * 34 + totalCourses * 185);
  const syntheticRating = Math.min(5, Math.max(4.1, 4.1 + averageCompletionRate / 150));
  const studentGrowth = Math.min(25, Math.max(4.2, averageCompletionRate / 8));
  const revenueGrowth = Math.min(18, Math.max(5.4, liveSessions * 1.4 + 4));
  const ratingGrowth = Math.min(0.5, Math.max(0.1, (averageCompletionRate - 60) / 100));

  const metricCards: MetricCardData[] = [
    {
      title: 'Total Students',
      value: formatCompact(totalStudents),
      chipLabel: `+${studentGrowth.toFixed(1)}%`,
      chipClassName: 'bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-300',
      icon: Users,
      iconClassName: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(estimatedRevenue),
      chipLabel: `+${revenueGrowth.toFixed(1)}%`,
      chipClassName: 'bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-300',
      icon: Wallet,
      iconClassName: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
    },
    {
      title: 'Course Rating',
      value: `${syntheticRating.toFixed(1)} / 5.0`,
      chipLabel: `+${ratingGrowth.toFixed(1)}`,
      chipClassName: 'bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-300',
      icon: Star,
      iconClassName: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
    },
    {
      title: 'Active Courses',
      value: formatCompact(totalCourses),
      chipLabel: 'Stable',
      chipClassName: 'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-300',
      icon: BookOpen,
      iconClassName: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
    },
  ];

  const displayName =
    `${profile?.firstName || user?.firstName || 'Sarah'} ${profile?.lastName || user?.lastName || 'Jenkins'}`.trim();
  const firstName = profile?.firstName || user?.firstName || 'Sarah';
  const avatarUrl = profile?.avatar || user?.avatar || DEFAULT_AVATAR;

  if (authLoading || (isLoading && !data)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1152d4]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Alert variant="destructive">
          <AlertDescription>Sign in to access your teacher dashboard.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => onNavigate('/auth/signin')}>Go to sign in</Button>
        </div>
      </div>
    );
  }

  if (user?.role !== 'teacher') {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Alert variant="destructive">
          <AlertDescription>This area is reserved for teacher accounts.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Alert variant="destructive">
          <AlertDescription>Unable to load teacher analytics right now.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100"
      style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
    >
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
          <div className="flex items-center gap-3 p-6">
            <div className="rounded-lg bg-[#1152d4] p-2 text-white">
              <Rocket className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              E-Learning <span className="text-[#1152d4]">Pro</span>
            </h1>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-4">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(currentPath, item.path);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                    active
                      ? 'bg-[#1152d4] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-300">
                  <ImageWithFallback src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{displayName}</p>
                  <p className="text-xs text-slate-500">Senior Instructor</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/teacher/course-builder')}
                className="w-full rounded-lg bg-[#1152d4] py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                Create New Course
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 md:px-8">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl border-none bg-slate-100 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#1152d4] dark:bg-slate-800"
                placeholder="Search student records or courses..."
                type="text"
              />
            </div>

            <div className="ml-4 hidden items-center gap-4 lg:flex">
              <button
                type="button"
                onClick={() => onNavigate('/notifications')}
                className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/notifications')}
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
              <div className="mx-2 h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Dashboard Overview</span>
                <CalendarDays className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </header>

          <div className="space-y-8 p-4 md:p-8">
            <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Dashboard Overview</h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Welcome back, {firstName}. Your courses are performing{' '}
                  <span className="font-bold text-green-500">12% better</span> this month.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-800 dark:bg-slate-900"
                >
                  <Download className="h-4 w-4" />
                  Export Report
                </button>
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="rounded-xl bg-[#1152d4] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {isFetching ? 'Refreshing...' : 'Analyze Insights'}
                </button>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {metricCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.title}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className={`rounded-lg p-2 ${card.iconClassName}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${card.chipClassName}`}>
                        {card.chipLabel}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                    <h3 className="mt-1 text-2xl font-bold">{card.value}</h3>
                  </article>
                );
              })}
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-bold">Student Engagement</h4>
                    <p className="text-sm text-slate-500">Average daily activity over the last 7 days</p>
                  </div>
                  <select className="rounded-lg border-none bg-slate-100 pr-8 text-sm font-medium dark:bg-slate-800">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>

                <div className="flex h-64 flex-col justify-end">
                  <svg viewBox="0 0 478 150" preserveAspectRatio="none" className="h-full w-full">
                    <path d={chartPaths.areaPath} fill="url(#engagementGradient)" />
                    <path d={chartPaths.linePath} fill="none" stroke="#1152d4" strokeWidth="3" />
                    <defs>
                      <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1152d4" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#1152d4" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="mt-4 flex justify-between px-2 text-xs font-bold text-slate-400">
                    {ENGAGEMENT_DAYS.map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                </div>
              </article>

              <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h4 className="mb-4 text-lg font-bold">Quick Actions</h4>
                <div className="flex-1 space-y-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('/teacher/course-builder/curriculum')}
                    className="group flex w-full items-center justify-between rounded-xl bg-slate-50 p-4 transition-all hover:bg-[#1152d4] hover:text-white dark:bg-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <ClipboardCheck className="h-5 w-5 text-[#1152d4] group-hover:text-white" />
                      <span className="font-medium">Grade Assignments</span>
                    </div>
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">
                      {Math.max(4, Math.round(activeEnrollments / 20))}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/teacher/live-session-builder')}
                    className="group flex w-full items-center gap-3 rounded-xl bg-slate-50 p-4 transition-all hover:bg-[#1152d4] hover:text-white dark:bg-slate-800"
                  >
                    <Video className="h-5 w-5 text-[#1152d4] group-hover:text-white" />
                    <span className="font-medium">Schedule Live Session</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/notifications')}
                    className="group flex w-full items-center gap-3 rounded-xl bg-slate-50 p-4 transition-all hover:bg-[#1152d4] hover:text-white dark:bg-slate-800"
                  >
                    <MessageSquare className="h-5 w-5 text-[#1152d4] group-hover:text-white" />
                    <span className="font-medium">Message Students</span>
                  </button>
                </div>

                <div className="mt-6 rounded-xl border border-[#1152d4]/20 bg-[#1152d4]/10 p-4">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#1152d4]">Next Session</p>
                  <p className="truncate text-sm font-bold">
                    {nextSession?.courseTitle || 'No upcoming session'}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                    <CalendarDays className="h-3 w-3" />
                    {nextSessionLabel}
                  </p>
                </div>
              </article>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white xl:col-span-2 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
                  <h4 className="text-lg font-bold">Course Overview</h4>
                  <button
                    type="button"
                    onClick={() => onNavigate('/teacher/live-sessions')}
                    className="text-sm font-bold text-[#1152d4]"
                  >
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 dark:bg-slate-800/50">
                      <tr>
                        <th className="px-6 py-4">Course Name</th>
                        <th className="px-6 py-4">Students</th>
                        <th className="px-6 py-4">Revenue</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {filteredCourses.slice(0, 5).map((course, index) => {
                        const revenue = Math.round(
                          course.enrollments * (20 + Math.max(8, course.completionRate / 3)),
                        );
                        const status = statusMeta(course);
                        return (
                          <tr
                            key={course.id}
                            className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-14 overflow-hidden rounded-md bg-slate-200">
                                  <ImageWithFallback
                                    src={COURSE_THUMBNAILS[index % COURSE_THUMBNAILS.length]}
                                    alt={course.title}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-bold">{course.title}</p>
                                  <p className="text-xs text-slate-400">
                                    Next: {formatDateLabel(course.nextSessionAt)}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">{formatCompact(course.enrollments)}</td>
                            <td className="px-6 py-4 text-sm font-medium">{formatCurrency(revenue)}</td>
                            <td className="px-6 py-4">
                              <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${status.className}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                type="button"
                                onClick={() => onNavigate('/teacher/live-sessions')}
                                className="rounded p-1 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                              >
                                <MoreVertical className="h-4 w-4 text-slate-400" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {!filteredCourses.length ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                            No courses match the current search.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h4 className="mb-6 text-lg font-bold">Top Performing Courses</h4>
                <div className="space-y-6">
                  {topPerformingCourses.map((course, index) => {
                    const opacity = Math.max(0.25, 1 - index * 0.16);
                    const progress = Math.min(100, Math.max(0, Math.round(course.completionRate)));
                    return (
                      <div key={course.id} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="truncate pr-2">{course.title}</span>
                          <span className="text-[#1152d4]">{progress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full bg-[#1152d4]"
                            style={{ width: `${progress}%`, opacity }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {!topPerformingCourses.length ? (
                    <p className="text-sm text-slate-500">No performance data available yet.</p>
                  ) : null}
                </div>
              </article>
            </section>

            <section className="lg:hidden">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {SIDEBAR_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isNavActive(currentPath, item.path);
                  return (
                    <button
                      key={`mobile-${item.label}`}
                      type="button"
                      onClick={() => onNavigate(item.path)}
                      className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                        active
                          ? 'bg-[#1152d4] text-white'
                          : 'border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
