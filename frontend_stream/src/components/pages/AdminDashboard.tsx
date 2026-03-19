import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  GraduationCap,
  Loader2,
  ShieldAlert,
  UserPlus,
  Users,
} from 'lucide-react';
import { useGetAdminUsersQuery } from '../../store/api/adminUserApi';
import { useGetAdminDashboardQuery } from '../../store/api/dashboardApi';
import type { AdminRoleFilter, AdminUserRole } from '../../types/admin';
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

type AdminSection = 'courses' | 'users';
type UserStatusFilter = 'all' | 'active' | 'inactive';

function compact(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    maximumFractionDigits: value >= 100000 ? 0 : 1,
  }).format(value);
}

function formatDate(value?: string | null): string {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
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

function mapRoleToApi(role: string): AdminRoleFilter | undefined {
  if (role === 'ETUDIANT' || role === 'ENSEIGNANT' || role === 'ADMINISTRATEUR') return role;
  return undefined;
}

function roleLabel(role: AdminUserRole): string {
  if (role === 'admin') return 'Admin';
  if (role === 'teacher') return 'Teacher';
  return 'Student';
}

function roleBadgeClass(role: AdminUserRole): string {
  if (role === 'admin') return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
  if (role === 'teacher') return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
  return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
}

export function AdminDashboard({ onNavigate, currentPath }: AdminDashboardProps) {
  const shared = useAdminSpaceData({ includeDashboard: false });
  const [section, setSection] = useState<AdminSection>('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState<UserStatusFilter>('all');

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
      sortBy: 'dateCreation',
      sortDir: 'DESC',
      role: mapRoleToApi(userRoleFilter),
      actif: userStatusFilter === 'all' ? undefined : userStatusFilter === 'active',
      search: normalizedSearch || undefined,
    },
    {
      skip: !shouldLoad || section !== 'users',
    },
  );

  const recentCourses = useMemo(() => {
    const allCourses = data?.recentCourses || [];
    if (!normalizedSearch) return allCourses.slice(0, 6);
    return allCourses
      .filter((course) =>
        `${course.title} ${course.teacherName}`.toLowerCase().includes(normalizedSearch),
      )
      .slice(0, 6);
  }, [data?.recentCourses, normalizedSearch]);

  if (shared.status !== 'ready') {
    return <AdminSpaceStatus shared={shared} />;
  }

  return (
    <AdminSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder={
        section === 'courses' ? 'Search courses or instructors...' : 'Search users or emails...'
      }
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
              Centralisez la sante de la plateforme, surveillez les cours, et basculez vers les espaces operationnels dedies sans sortir du meme theme.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-[#dbe6ff] bg-[#f8fbff] p-1 dark:border-[#203049] dark:bg-[#101a2d]/90">
              <button
                type="button"
                onClick={() => setSection('courses')}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  section === 'courses'
                    ? 'bg-[#1152d4] text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Courses
              </button>
              <button
                type="button"
                onClick={() => setSection('users')}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  section === 'users'
                    ? 'bg-[#1152d4] text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Users
              </button>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>
        </section>

        {dashboardError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {extractErrorMessage(dashboardError, 'Unable to load admin dashboard data.')}
            </AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: 'Total Users',
              value: compact(data?.stats.totalUsers || 0),
              meta: `${compact(data?.stats.monthlyNewUsers || 0)} new`,
              icon: Users,
            },
            {
              title: 'Total Courses',
              value: compact(data?.stats.totalCourses || 0),
              meta: `${compact(data?.stats.activeCourses || 0)} active`,
              icon: BookOpen,
            },
            {
              title: 'Live Sessions',
              value: compact(data?.stats.liveSessions || 0),
              meta: `${compact(data?.stats.totalSessions || 0)} sessions`,
              icon: GraduationCap,
            },
            {
              title: 'Completion Rate',
              value: `${Math.round(data?.stats.averageCompletionRate || 0)}%`,
              meta: `${compact(data?.stats.totalEnrollments || 0)} enrollments`,
              icon: BarChart3,
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-2xl bg-[#1152d4]/10 p-3 text-[#1152d4]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    {card.meta}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                  {card.value}
                </h3>
              </article>
            );
          })}
        </section>

        {section === 'courses' ? (
          <section className="grid gap-6 xl:grid-cols-12">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-8">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">Recent Courses</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                    Audit rapide des derniers cours remontes par le backend.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/admin/courses')}
                  className="text-sm font-bold text-[#1152d4]"
                >
                  Open full inventory
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                      <th className="px-6 py-4">Course</th>
                      <th className="px-6 py-4">Instructor</th>
                      <th className="px-6 py-4">Students</th>
                      <th className="px-6 py-4">Rating</th>
                      <th className="px-6 py-4">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(dashboardLoading || dashboardFetching) && !data ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                          <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin text-[#1152d4]" />
                          Loading course overview...
                        </td>
                      </tr>
                    ) : recentCourses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                          No course available for the current search.
                        </td>
                      </tr>
                    ) : (
                      recentCourses.map((course) => (
                        <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-6 py-4 text-sm font-semibold text-slate-950 dark:text-white">
                            {course.title}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {course.teacherName}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {compact(course.enrollmentCount)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {course.averageRating.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {formatDate(course.createdAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="space-y-6 xl:col-span-4">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">Quick Access</h2>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      label: 'Course Management',
                      description: 'Inspect catalogue health and exports.',
                      path: '/admin/courses',
                    },
                    {
                      label: 'Support Center',
                      description: 'Follow incoming contact requests.',
                      path: '/admin/support',
                    },
                  ].map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => onNavigate(item.path)}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:border-[#1152d4]/30 hover:bg-[#1152d4]/5 dark:border-slate-800 dark:hover:border-[#1152d4]/30 dark:hover:bg-[#1152d4]/10"
                    >
                      <div>
                        <p className="font-semibold text-slate-950 dark:text-white">{item.label}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                          {item.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[#1152d4]" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#1152d4]/20 bg-[#1152d4]/5 p-6 dark:bg-[#1152d4]/10">
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">Moderation Snapshot</h2>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  {compact(
                    (data?.recentCourses || []).filter((course) => course.enrollmentCount === 0).length,
                  )}{' '}
                  recent courses still have no enrollments. Review them from the dedicated course page.
                </p>
              </div>
            </aside>
          </section>
        ) : (
          <section className="grid gap-6 xl:grid-cols-12">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-8">
              <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">Newest Users</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                    Apercu rapide des derniers comptes et de leur statut.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <select
                    value={userRoleFilter}
                    onChange={(event) => setUserRoleFilter(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option value="all">All roles</option>
                    <option value="ETUDIANT">Student</option>
                    <option value="ENSEIGNANT">Teacher</option>
                    <option value="ADMINISTRATEUR">Admin</option>
                  </select>
                  <select
                    value={userStatusFilter}
                    onChange={(event) => setUserStatusFilter(event.target.value as UserStatusFilter)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option value="all">All status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {usersError ? (
                <div className="px-6 py-4">
                  <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertDescription>
                      {extractErrorMessage(usersError, 'Unable to load users.')}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : null}

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(usersLoading || usersFetching) && !usersPage ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                          <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin text-[#1152d4]" />
                          Loading user overview...
                        </td>
                      </tr>
                    ) : (usersPage?.items || []).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                          No user available for the current filters.
                        </td>
                      </tr>
                    ) : (
                      (usersPage?.items || []).map((currentUser) => (
                        <tr key={currentUser.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {currentUser.avatar ? (
                                <img
                                  className="h-9 w-9 rounded-full object-cover"
                                  src={currentUser.avatar}
                                  alt={currentUser.name}
                                />
                              ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1152d4]/10 text-xs font-bold text-[#1152d4]">
                                  {(currentUser.prenom?.[0] || 'U') + (currentUser.nom?.[0] || '')}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                  {currentUser.name || currentUser.email}
                                </p>
                                <p className="text-xs text-slate-500">{currentUser.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClass(currentUser.role)}`}>
                              {roleLabel(currentUser.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {currentUser.status === 'active' ? 'Active' : 'Inactive'}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {formatDate(currentUser.joinDate)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="space-y-6 xl:col-span-4">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">User Operations</h2>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      label: 'User Management',
                      description: 'CRUD, activation and exports.',
                      path: '/admin/users',
                      icon: Users,
                    },
                    {
                      label: 'Support Center',
                      description: 'Reply to contact requests and newsletters.',
                      path: '/admin/support',
                      icon: UserPlus,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => onNavigate(item.path)}
                        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:border-[#1152d4]/30 hover:bg-[#1152d4]/5 dark:border-slate-800 dark:hover:border-[#1152d4]/30 dark:hover:bg-[#1152d4]/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-[#1152d4]/10 p-2 text-[#1152d4]">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-950 dark:text-white">{item.label}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#1152d4]" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#1152d4]/20 bg-[#1152d4]/5 p-6 dark:bg-[#1152d4]/10">
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">Signups Snapshot</h2>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  {compact(data?.stats.monthlyNewUsers || 0)} new users joined this month and{' '}
                  {compact(data?.stats.totalTeachers || 0)} teachers are currently registered.
                </p>
              </div>
            </aside>
          </section>
        )}
      </div>
    </AdminSpaceShell>
  );
}
