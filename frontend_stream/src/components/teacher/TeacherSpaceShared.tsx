import type { ReactNode } from 'react';
import {
  AlertCircle,
  BarChart3,
  Bell,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquare,
  Rocket,
  Search,
  Settings,
  User,
  Users,
  Video,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useResolvedTheme } from '../../hooks/useResolvedTheme';
import { normalizeUserRole } from '../../lib/roleUtils';
import { useGetTeacherDashboardQuery } from '../../store/api/dashboardApi';
import {
  useGetProfileQuery,
  useGetTeacherSpecialtyQuery,
  useGetUnreadNotificationCountQuery,
} from '../../store/api/userApi';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import './TeacherSpaceShared.css';

type TeacherSpaceStatusType =
  | 'auth-loading'
  | 'unauthenticated'
  | 'wrong-role'
  | 'ready';

interface TeacherShellNavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
}

export interface TeacherSpaceData {
  status: TeacherSpaceStatusType;
  isAuthenticated: boolean;
  user: ReturnType<typeof useAuth>['user'];
  displayName: string;
  displayRole: string;
  initials: string;
  avatarUrl: string | null;
  unreadCount: number;
  activeCourseCount: number;
  liveSessions: number;
  dashboard: NonNullable<ReturnType<typeof useGetTeacherDashboardQuery>['data']> | null;
  profile: NonNullable<ReturnType<typeof useGetProfileQuery>['data']> | null;
}

interface TeacherSpaceShellProps {
  currentPath?: string;
  onNavigate: (path: string | number) => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  headerTitle?: string;
  headerDescription?: string;
  displayName: string;
  displayRole: string;
  initials: string;
  avatarUrl: string | null;
  activeCourseCount: number;
  liveSessions: number;
  unreadCount: number;
  children: ReactNode;
}

interface UseTeacherSpaceDataOptions {
  includeDashboard?: boolean;
}

const SIDEBAR_NAV_ITEMS: TeacherShellNavItem[] = [
  { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
  { label: 'My Courses', path: '/teacher/my-courses', icon: GraduationCap },
  { label: 'Students', path: '/teacher/students', icon: Users },
  { label: 'Live', path: '/teacher/live-sessions', icon: Video },
  { label: 'Creer live', path: '/teacher/live-session-builder', icon: BarChart3 },
  { label: 'Profil', path: '/profile', icon: User },
  { label: 'Settings', path: '/settings', icon: Settings },
];

function getInitials(firstName?: string | null, lastName?: string | null) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.trim().toUpperCase() || 'EN';
}

function isActiveNavItem(currentPath: string | undefined, itemPath: string): boolean {
  if (!currentPath) return false;
  if (itemPath === '/teacher/dashboard') return currentPath === '/teacher/dashboard';
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

export function useTeacherSpaceData(
  options: UseTeacherSpaceDataOptions = {},
): TeacherSpaceData {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { includeDashboard = true } = options;
  const isTeacher = normalizeUserRole(user?.role) === 'teacher';
  const shouldLoad = Boolean(isAuthenticated && isTeacher && user?.id);
  const shouldLoadDashboard = shouldLoad && includeDashboard;

  const { data: profile } = useGetProfileQuery(undefined, { skip: !shouldLoad });
  const { data: teacherSpecialty } = useGetTeacherSpecialtyQuery(undefined, {
    skip: !shouldLoad || Boolean(profile?.specialite),
  });
  const { data: dashboard } = useGetTeacherDashboardQuery(undefined, {
    skip: !shouldLoadDashboard,
  });
  const { data: unreadCount = 0 } = useGetUnreadNotificationCountQuery(undefined, {
    skip: !shouldLoad,
  });

  let status: TeacherSpaceStatusType = 'ready';
  if (authLoading) status = 'auth-loading';
  else if (!isAuthenticated) status = 'unauthenticated';
  else if (!isTeacher) status = 'wrong-role';

  const displayName = `${profile?.firstName || user?.firstName || 'Teacher'} ${profile?.lastName || user?.lastName || ''}`.trim();
  const displayRole = profile?.specialite || teacherSpecialty || 'Lead Instructor';
  const avatarUrl = profile?.avatar || user?.avatar || null;
  const initials = getInitials(
    profile?.firstName || user?.firstName,
    profile?.lastName || user?.lastName,
  );

  return {
    status,
    isAuthenticated,
    user,
    displayName,
    displayRole,
    initials,
    avatarUrl,
    unreadCount,
    activeCourseCount: dashboard?.stats.totalCourses || 0,
    liveSessions: dashboard?.stats.liveSessions || 0,
    dashboard: dashboard || null,
    profile: profile || null,
  };
}

export function TeacherSpaceStatus({ shared }: { shared: TeacherSpaceData }) {
  const { isDark } = useResolvedTheme();

  if (shared.status === 'auth-loading') {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${
          isDark ? 'bg-[#101622]' : 'bg-[#f6f6f8]'
        }`}
      >
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (shared.status === 'unauthenticated') {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Connectez-vous pour afficher votre espace enseignant.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Ces vues sont reservees aux comptes enseignants.</AlertDescription>
      </Alert>
    </div>
  );
}

export function TeacherSpaceShell({
  currentPath,
  onNavigate,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search courses, sessions, or students...',
  showSearch = true,
  headerTitle,
  headerDescription,
  displayName,
  displayRole,
  initials,
  avatarUrl,
  activeCourseCount,
  liveSessions,
  unreadCount,
  children,
}: TeacherSpaceShellProps) {
  const { logout } = useAuth();
  const { isDark } = useResolvedTheme();
  const handleSearchChange = onSearchChange || (() => undefined);
  const allNavItems = SIDEBAR_NAV_ITEMS;
  const rootClass = isDark
    ? 'bg-[#09111f] text-[#e2e8f0]'
    : 'bg-[#eef4ff] text-[#0f172a]';
  const shellPanelClass = isDark
    ? 'border-[#1e293b] bg-[#0f172a]/95'
    : 'border-white/70 bg-white/95';
  const headerClass = isDark
    ? 'border-[#1e293b] bg-[#09111f]/88'
    : 'border-white/60 bg-[#eef4ff]/82';
  const searchClass = isDark
    ? 'border border-[#334155] bg-[#162033] text-[#e2e8f0] placeholder:text-[#7f8ea3]'
    : 'border border-[#dbe6ff] bg-white text-[#0f172a] placeholder:text-[#94a3b8]';
  const mutedTextClass = isDark ? 'text-[#94a3b8]' : 'text-[#64748b]';
  const secondaryPanelClass = isDark
    ? 'border border-[#203049] bg-[#101a2d]/90'
    : 'border border-[#dbe6ff] bg-[#f8fbff]';
  const showTopHeader = currentPath === '/teacher/dashboard';

  const handleLogout = async () => {
    await logout();
    onNavigate('/auth/signin');
  };

  return (
    <div
      className={`teacher-space-shell relative h-screen overflow-hidden ${rootClass}`}
      style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,rgba(17,82,212,0.18),transparent_42%),radial-gradient(circle_at_top_right,rgba(67,165,255,0.12),transparent_30%)]" />
      <div className="relative flex h-screen w-full overflow-hidden">
        <aside
          className={`hidden h-screen w-72 shrink-0 border-r lg:sticky lg:top-0 lg:flex lg:flex-col ${shellPanelClass}`}
        >
          <div className="flex h-full flex-col px-4 py-6">
            <div className="flex items-center gap-3 px-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
                <Rocket className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold tracking-tight">
                  E-Learning <span className="text-blue-600">Pro</span>
                </h2>
              </div>
            </div>

            <nav className="mt-8 flex-1 space-y-2 overflow-y-auto pr-1">
              {SIDEBAR_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActiveNavItem(currentPath, item.path);
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-medium transition ${
                      active
                        ? 'bg-blue-600 text-white shadow-md'
                        : isDark
                          ? 'text-[#cbd5e1] hover:bg-[#162033] hover:text-white'
                          : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className={`mt-auto rounded-2xl p-4 ${secondaryPanelClass}`}>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-[#1152d4]/20">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">
                    {displayName}
                  </p>
                  <p className={`truncate text-xs font-medium ${mutedTextClass}`}>{displayRole}</p>
                </div>
              </div>
              <button
                type="button"
                className="mt-4 h-11 w-full cursor-pointer rounded-lg bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-700"
                onClick={() => onNavigate('/teacher/course-builder')}
              >
                Create New Course
              </button>
              <button
                type="button"
                className={`mt-2 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-bold transition ${
                  isDark
                    ? 'border-[#334155] bg-[#162033] text-[#e2e8f0] hover:bg-[#203049]'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 h-screen flex-1 overflow-y-auto">
          {showTopHeader ? (
            <header
              className={`sticky top-0 z-30 border-b px-4 py-4 backdrop-blur-xl md:px-8 xl:px-10 ${headerClass}`}
            >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              {showSearch ? (
                <div className="relative w-full xl:w-96 xl:max-w-none">
                  <Search className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${mutedTextClass}`} />
                  <input
                    value={searchQuery}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    className={`h-11 w-full rounded-xl pl-12 pr-4 text-sm shadow-sm transition focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200 ${searchClass}`}
                    placeholder={searchPlaceholder}
                    type="text"
                  />
                </div>
              ) : (
                <div className="min-w-0">
                  <p className={`text-xs font-semibold ${mutedTextClass}`}>{displayRole}</p>
                  <h1 className="mt-1 truncate text-3xl font-black tracking-tight">
                    {headerTitle || displayName}
                  </h1>
                  {headerDescription ? (
                    <p className={`mt-1 max-w-2xl text-sm ${mutedTextClass}`}>{headerDescription}</p>
                  ) : null}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 xl:justify-end">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className={`relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border ${
                      isDark
                        ? 'border-[#334155] bg-[#162033] text-[#cbd5e1] hover:bg-[#203049]'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                    onClick={() => onNavigate('/notifications')}
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 ? (
                      <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
                    ) : null}
                  </button>
                  <button
                    type="button"
                    className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border ${
                      isDark
                        ? 'border-[#334155] bg-[#162033] text-[#cbd5e1] hover:bg-[#203049]'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                    onClick={() => onNavigate('/notifications')}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>

                  {headerTitle ? (
                    <div
                      className={`hidden items-center gap-3 border-l pl-5 lg:flex ${
                        isDark ? 'border-[#334155]' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-base font-bold">
                        {headerTitle}
                      </span>
                      <CalendarDays className={`h-5 w-5 ${mutedTextClass}`} />
                    </div>
                  ) : null}
                </div>

              </div>
            </div>

            <nav className="mt-4 lg:hidden">
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {allNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveNavItem(currentPath, item.path);
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => onNavigate(item.path)}
                    className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active
                          ? 'bg-blue-600 text-white'
                          : isDark
                            ? 'bg-[#162033] text-[#cbd5e1]'
                            : 'bg-white text-slate-600 shadow-sm'
                    }`}
                  >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </nav>
            </header>
          ) : null}

          <div className="mx-auto w-full max-w-[1360px] p-4 pb-28 md:p-8 md:pb-12 xl:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
