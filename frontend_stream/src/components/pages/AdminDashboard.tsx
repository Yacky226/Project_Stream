import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Filter,
  Loader2,
  ShoppingCart,
  UserPlus,
  Users,
} from 'lucide-react';
import { useGetAdminUsersQuery } from '../../store/api/adminUserApi';
import { useGetAdminDashboardQuery } from '../../store/api/dashboardApi';
import type { AdminUserRole } from '../../types/admin';
import {
  AdminSpaceShell,
  AdminSpaceStatus,
  useAdminSpaceData,
} from '../admin/AdminSpaceShared';
import { Alert, AlertDescription } from '../ui/alert';

interface AdminDashboardProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

interface ChartPoint {
  x: number;
  y: number;
}

interface DashboardUserRow {
  id: string;
  nom?: string;
  prenom?: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: 'active' | 'inactive';
  joinDate?: string;
  avatar?: string | null;
}

type GrowthRange = '6m' | '12m';

function compact(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    maximumFractionDigits: value >= 100000 ? 0 : 1,
  }).format(value);
}

function formatRelativeDate(value?: string | null): string {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
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

function roleLabel(role: AdminUserRole): string {
  if (role === 'admin') return 'Admin';
  if (role === 'teacher') return 'Instructor';
  return 'Student';
}

function roleBadgeClass(role: AdminUserRole): string {
  if (role === 'admin') return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
  if (role === 'teacher') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
  return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
}

function splitName(value: string): { prenom: string; nom: string } {
  const trimmed = value.trim();
  if (!trimmed) {
    return { prenom: '', nom: '' };
  }
  const [prenom, ...rest] = trimmed.split(/\s+/);
  return {
    prenom,
    nom: rest.join(' '),
  };
}

function buildChartPoints(values: number[], width: number, height: number): ChartPoint[] {
  if (!values.length) return [];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  return values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 28) - 14;
    return { x, y };
  });
}

function buildCurvedLinePath(points: ChartPoint[]): string {
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

function buildAreaPath(points: ChartPoint[], height: number): string {
  if (!points.length) return '';
  const first = points[0];
  const last = points[points.length - 1];
  return `${buildCurvedLinePath(points)} L ${last.x.toFixed(2)} ${height} L ${first.x.toFixed(2)} ${height} Z`;
}

function buildMonthLabels(monthCount: number): string[] {
  const labels: string[] = [];
  const today = new Date();
  for (let index = monthCount - 1; index >= 0; index -= 1) {
    const value = new Date(today);
    value.setMonth(today.getMonth() - index);
    labels.push(
      new Intl.DateTimeFormat('en-US', { month: 'short' })
        .format(value)
        .toUpperCase(),
    );
  }
  return labels;
}

function buildMonthKeys(monthCount: number): string[] {
  const keys: string[] = [];
  const today = new Date();
  for (let index = monthCount - 1; index >= 0; index -= 1) {
    const value = new Date(today);
    value.setDate(1);
    value.setMonth(today.getMonth() - index);
    keys.push(`${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

function monthKeyFromIso(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function dateValue(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function buildGrowthSeries(
  inscriptions: Array<{ enrolledAt: string | null }> | undefined,
  range: GrowthRange,
) {
  const monthCount = range === '12m' ? 12 : 6;
  const labels = buildMonthLabels(monthCount);
  const monthKeys = buildMonthKeys(monthCount);
  const byMonth = new Map(monthKeys.map((key) => [key, 0]));

  (inscriptions || []).forEach((item) => {
    const key = monthKeyFromIso(item.enrolledAt);
    if (!key || !byMonth.has(key)) return;
    byMonth.set(key, (byMonth.get(key) || 0) + 1);
  });

  const values = monthKeys.map((key) => byMonth.get(key) || 0);

  return { labels, values };
}

export function AdminDashboard({ onNavigate, currentPath }: AdminDashboardProps) {
  const shared = useAdminSpaceData({ includeDashboard: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [growthRange, setGrowthRange] = useState<GrowthRange>('6m');
  const shouldLoad = shared.status === 'ready';
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const {
    data,
    isLoading: dashboardLoading,
    isFetching: dashboardFetching,
    error: dashboardError,
    refetch,
  } = useGetAdminDashboardQuery(undefined, { skip: !shouldLoad });

  const {
    data: usersPage,
    isLoading: usersLoading,
    isFetching: usersFetching,
    error: usersError,
  } = useGetAdminUsersQuery(
    {
      page: 0,
      size: 6,
      sortBy: 'id',
      sortDir: 'DESC',
      search: normalizedSearch || undefined,
    },
    {
      skip: !shouldLoad,
    },
  );

  const stats = data?.stats;
  const recentInscriptions = useMemo(() => {
    const allInscriptions = data?.recentInscriptions || [];
    if (!normalizedSearch) return allInscriptions;
    return allInscriptions.filter((item) =>
      `${item.studentName} ${item.studentEmail} ${item.courseTitle} ${item.teacherName}`
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [data?.recentInscriptions, normalizedSearch]);

  const filteredCourses = useMemo(() => {
    const allCourses = data?.recentCourses || [];
    if (!normalizedSearch) return allCourses;
    return allCourses.filter((course) =>
      `${course.title} ${course.teacherName}`.toLowerCase().includes(normalizedSearch),
    );
  }, [data?.recentCourses, normalizedSearch]);

  const recentCourses = filteredCourses.slice(0, 4);
  const recentUsers: DashboardUserRow[] = (usersPage?.items || []).slice(0, 3);
  const fallbackUsers = useMemo<DashboardUserRow[]>(() => {
    const rowsByKey = new Map<string, DashboardUserRow>();

    recentInscriptions.slice(0, 8).forEach((inscription) => {
      const fullName = inscription.studentName || 'Learner';
      const names = splitName(fullName);
      const row: DashboardUserRow = {
        id: `inscription-${inscription.id}`,
        nom: names.nom,
        prenom: names.prenom,
        name: fullName,
        email: inscription.studentEmail || `student-${inscription.id}@unknown.local`,
        role: 'student',
        status: inscription.status.toUpperCase() === 'ABANDONNE' ? 'inactive' : 'active',
        joinDate: inscription.enrolledAt || undefined,
      };
      rowsByKey.set(`${row.role}:${row.email}`, row);
    });

    filteredCourses.slice(0, 8).forEach((course) => {
      const teacherName = course.teacherName?.trim();
      if (!teacherName || teacherName.toUpperCase() === 'N/A') return;

      const names = splitName(teacherName);
      const row: DashboardUserRow = {
        id: `course-${course.id}`,
        nom: names.nom,
        prenom: names.prenom,
        name: teacherName,
        email: `teacher-${course.id}@unknown.local`,
        role: 'teacher',
        status: course.isArchived ? 'inactive' : 'active',
        joinDate: course.createdAt || undefined,
      };
      rowsByKey.set(`${row.role}:${row.name.toLowerCase()}`, row);
    });

    return Array.from(rowsByKey.values()).slice(0, 3);
  }, [filteredCourses, recentInscriptions]);
  const usersErrorMessage = usersError
    ? extractErrorMessage(usersError, 'Unable to load user list.')
    : null;
  const displayedUsers = usersError ? fallbackUsers : recentUsers;

  const kpis = useMemo(
    () => [
      {
        title: 'Total Enrollments',
        value: compact(stats?.totalEnrollments || 0),
        trend: `${compact(stats?.monthlyEnrollments || 0)} this month`,
        trendClass: 'text-[#1152d4] bg-[#1152d4]/10',
        icon: ShoppingCart,
      },
      {
        title: 'Total Users',
        value: compact(stats?.totalUsers || 0),
        trend: `${compact(stats?.totalStudents || 0)} students`,
        trendClass: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-300',
        icon: Users,
      },
      {
        title: 'Completion Rate',
        value: `${Math.round(stats?.averageCompletionRate || 0)}%`,
        trend:
          (stats?.averageCourseRating || 0) > 0
            ? `${(stats?.averageCourseRating || 0).toFixed(1)}/5 rating`
            : 'No rating yet',
        trendClass: 'text-[#1152d4] bg-[#1152d4]/10',
        icon: BarChart3,
      },
      {
        title: 'New Signups (30d)',
        value: compact(stats?.monthlyNewUsers || 0),
        trend: `${compact(stats?.liveSessions || 0)} live sessions`,
        trendClass: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-300',
        icon: UserPlus,
      },
    ],
    [stats],
  );

  const growthSeries = useMemo(
    () => buildGrowthSeries(recentInscriptions, growthRange),
    [growthRange, recentInscriptions],
  );
  const growthPoints = useMemo(() => buildChartPoints(growthSeries.values, 720, 220), [growthSeries.values]);
  const growthLine = useMemo(() => buildCurvedLinePath(growthPoints), [growthPoints]);
  const growthArea = useMemo(() => buildAreaPath(growthPoints, 220), [growthPoints]);

  const recentActivity = useMemo(() => {
    const userEvents = displayedUsers.map((userItem) => ({
      id: `new-user-${userItem.id}`,
      icon: UserPlus,
      iconWrap: 'bg-blue-50 text-[#1152d4] dark:bg-blue-900/20 dark:text-blue-300',
      title: `New ${roleLabel(userItem.role)}: ${userItem.name || userItem.email}`,
      time: formatRelativeDate(userItem.joinDate),
      occurredAt: dateValue(userItem.joinDate),
    }));

    const inscriptionEvents = recentInscriptions.slice(0, 8).map((inscription) => ({
      id: `inscription-${inscription.id}`,
      icon: ShoppingCart,
      iconWrap: 'bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-300',
      title: `${inscription.studentName} enrolled in "${inscription.courseTitle}"`,
      time: formatRelativeDate(inscription.enrolledAt),
      occurredAt: dateValue(inscription.enrolledAt),
    }));

    const courseEvents = filteredCourses.slice(0, 8).map((course) => ({
      id: `course-${course.id}`,
      icon: BookOpen,
      iconWrap: 'bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-300',
      title: `Course published: "${course.title}"`,
      time: formatRelativeDate(course.createdAt),
      occurredAt: dateValue(course.createdAt),
    }));

    const activities = [...userEvents, ...inscriptionEvents, ...courseEvents].sort(
      (left, right) => right.occurredAt - left.occurredAt,
    ) as Array<{
      id: string;
      icon: typeof UserPlus;
      iconWrap: string;
      title: string;
      time: string;
      occurredAt: number;
    }>;

    return activities.slice(0, 4);
  }, [displayedUsers, filteredCourses, recentInscriptions]);

  const moderationTasks = useMemo(() => {
    const lowRatedCourses = filteredCourses
      .filter((course) => course.averageRating > 0 && course.averageRating < 3.5)
      .map((course) => ({
        id: `rating-${course.id}`,
        label: 'Quality Flag',
        severity: 'high' as const,
        title: `Course "${course.title}" dropped below 3.5 rating`,
        time: formatRelativeDate(course.createdAt),
        occurredAt: dateValue(course.createdAt),
      }));

    const abandonedEnrollments = recentInscriptions
      .filter((inscription) => inscription.status.toUpperCase() === 'ABANDONNE')
      .map((inscription) => ({
        id: `abandon-${inscription.id}`,
        label: 'Dropout Alert',
        severity: 'high' as const,
        title: `${inscription.studentName} abandoned "${inscription.courseTitle}"`,
        time: formatRelativeDate(inscription.lastActivityAt || inscription.enrolledAt),
        occurredAt: dateValue(inscription.lastActivityAt || inscription.enrolledAt),
      }));

    const stalledProgress = recentInscriptions
      .filter(
        (inscription) =>
          inscription.status.toUpperCase() === 'ACTIF' &&
          inscription.progress > 0 &&
          inscription.progress < 20,
      )
      .map((inscription) => ({
        id: `stalled-${inscription.id}`,
        label: 'Low Progress',
        severity: 'medium' as const,
        title: `${inscription.studentName} is below 20% in "${inscription.courseTitle}"`,
        time: formatRelativeDate(inscription.lastActivityAt || inscription.enrolledAt),
        occurredAt: dateValue(inscription.lastActivityAt || inscription.enrolledAt),
      }));

    return [...lowRatedCourses, ...abandonedEnrollments, ...stalledProgress]
      .sort((left, right) => right.occurredAt - left.occurredAt)
      .slice(0, 3);
  }, [filteredCourses, recentInscriptions]);

  const highPriorityCount = moderationTasks.filter((task) => task.severity === 'high').length;

  if (shared.status !== 'ready') {
    return <AdminSpaceStatus shared={shared} />;
  }

  return (
    <AdminSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search courses, users, or reports..."
      displayName={shared.displayName}
      displayRole={shared.displayRole}
      initials={shared.initials}
      avatarUrl={shared.avatarUrl}
      unreadCount={shared.unreadCount}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1152d4]">
              Platform governance
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-300">
              Monitor platform growth, user activity, and moderation tasks from one operational view.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Refresh Data
          </button>
        </section>

        {dashboardError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {extractErrorMessage(dashboardError, 'Unable to load admin dashboard data.')}
            </AlertDescription>
          </Alert>
        ) : null}

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-lg bg-[#1152d4]/10 p-2 text-[#1152d4]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${card.trendClass}`}>
                    {card.trend}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{card.value}</h3>
              </article>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article className="rounded-xl border border-[#1152d4]/10 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Platform Growth</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Monthly enrollments from backend registration activity
                </p>
              </div>
              <select
                className="rounded-lg border-none bg-[#f6f6f8] px-4 py-2 text-sm font-medium dark:bg-slate-800"
                value={growthRange}
                onChange={(event) => setGrowthRange(event.target.value as GrowthRange)}
              >
                <option value="6m">Last 6 Months</option>
                <option value="12m">Last 12 Months</option>
              </select>
            </div>

            <div style={{ height: '16rem' }}>
              <svg viewBox="0 0 720 220" className="h-full w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="adminDashboardChartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1152d4" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#1152d4" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path d={growthArea} fill="url(#adminDashboardChartGradient)" />
                <path d={growthLine} fill="none" stroke="#1152d4" strokeWidth="4" strokeLinecap="round" />
                {growthPoints.map((point) => (
                  <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} fill="#1152d4" r="2.2" />
                ))}
              </svg>
            </div>

            <div className="mt-3 flex w-full items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 md:text-xs">
              {growthSeries.labels.map((label) => (
                <span className="min-w-[2.25rem] text-center" key={label}>
                  {label}
                </span>
              ))}
            </div>
          </article>

          <aside className="rounded-xl border border-[#1152d4]/10 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-100">Recent Activity</h2>
            <div className="space-y-6">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No recent backend activity found for current filters.
                </p>
              ) : (
                recentActivity.map((activityItem) => {
                  const Icon = activityItem.icon;
                  return (
                    <div className="flex gap-4" key={activityItem.id}>
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activityItem.iconWrap}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-700 dark:text-slate-200">{activityItem.title}</p>
                        <p className="mt-1 text-xs text-slate-400">{activityItem.time}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/admin/support')}
              className="mt-8 w-full rounded-xl bg-[#1152d4]/10 py-3 text-sm font-bold text-[#1152d4] transition hover:bg-[#1152d4]/15"
            >
              View All Logs
            </button>
          </aside>
        </section>

        <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
          <article className="overflow-hidden rounded-xl border border-[#1152d4]/10 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
            <div className="flex items-center justify-between border-b border-[#1152d4]/10 p-8 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">User Management</h2>
              <button
                type="button"
                onClick={() => onNavigate('/admin/users')}
                className="inline-flex items-center gap-1 text-sm font-bold text-[#1152d4]"
              >
                Filter <Filter className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              {usersError && fallbackUsers.length > 0 ? (
                <div className="border-b border-amber-200 bg-amber-50 px-8 py-3 text-xs font-medium text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
                  Live users endpoint returned an error ({usersErrorMessage}). Showing recent backend fallback data.
                </div>
              ) : null}
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f6f6f8] text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800">
                    <th className="px-8 py-4">Name</th>
                    <th className="px-8 py-4">Role</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1152d4]/10 dark:divide-slate-800">
                  {(usersLoading || usersFetching) && !usersPage && !usersError ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-10 text-center text-sm text-slate-500">
                        <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin text-[#1152d4]" />
                        Loading users...
                      </td>
                    </tr>
                  ) : displayedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-10 text-center text-sm text-slate-500">
                        {usersErrorMessage ? `No user data available. (${usersErrorMessage})` : 'No users for current filters.'}
                      </td>
                    </tr>
                  ) : (
                    displayedUsers.map((userItem) => (
                      <tr key={userItem.id} className="transition hover:bg-[#1152d4]/5">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            {userItem.avatar ? (
                              <img className="h-8 w-8 rounded-full object-cover" src={userItem.avatar} alt={userItem.name || 'User'} />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1152d4]/20 text-xs font-bold text-[#1152d4]">
                                {(userItem.prenom?.[0] || 'U') + (userItem.nom?.[0] || '')}
                              </div>
                            )}
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {userItem.name || userItem.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm text-slate-600 dark:text-slate-300">{roleLabel(userItem.role)}</td>
                        <td className="px-8 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              userItem.status === 'active'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            }`}
                          >
                            {userItem.status === 'active' ? 'Active' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <button
                            type="button"
                            onClick={() => onNavigate('/admin/users')}
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeClass(userItem.role)}`}
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="rounded-xl border border-[#1152d4]/10 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Moderation</h2>
              <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-500 dark:bg-red-900/30 dark:text-red-300">
                {highPriorityCount} High Priority
              </span>
            </div>

            <div className="space-y-4">
              {moderationTasks.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No moderation issues detected from the latest backend data.
                </p>
              ) : (
                moderationTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-xl border p-4 ${
                      task.severity === 'high'
                        ? 'border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-900/20'
                        : 'border-[#1152d4]/10 bg-[#f6f6f8] dark:border-slate-700 dark:bg-slate-800'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-tight ${
                        task.severity === 'high' ? 'text-red-600 dark:text-red-300' : 'text-slate-500'
                      }`}>
                        {task.label}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{task.time}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{task.title}</p>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigate('/admin/support')}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-bold ${
                          task.severity === 'high'
                            ? 'bg-red-600 text-white'
                            : 'bg-[#1152d4]/10 text-[#1152d4]'
                        }`}
                      >
                        Review
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate('/admin/courses')}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/admin/support')}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-[#1152d4]/10 py-3 text-sm font-bold text-slate-600 transition hover:bg-[#1152d4]/5 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              See All Moderation Task
              <ArrowRight className="ml-2 h-4 w-4 text-[#1152d4]" />
            </button>
          </aside>
        </section>

        {(dashboardLoading || dashboardFetching) && !data ? (
          <div className="rounded-xl border border-[#1152d4]/10 bg-white p-6 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-[#1152d4]" />
            Loading admin insights...
          </div>
        ) : null}
      </div>
    </AdminSpaceShell>
  );
}
