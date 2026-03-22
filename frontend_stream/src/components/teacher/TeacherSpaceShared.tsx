import { useEffect, useState, type ReactNode } from 'react';
import {
  AlertCircle,
  BarChart3,
  Bell,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
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
  section: 'workspace' | 'account';
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
  { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard, section: 'workspace' },
  { label: 'My Courses', path: '/teacher/my-courses', icon: GraduationCap, section: 'workspace' },
  { label: 'Students', path: '/teacher/students', icon: Users, section: 'workspace' },
  { label: 'Live Sessions', path: '/teacher/live-sessions', icon: Video, section: 'workspace' },
  { label: 'Create Live', path: '/teacher/live-session-builder', icon: BarChart3, section: 'workspace' },
  { label: 'Profile', path: '/profile', icon: User, section: 'account' },
  { label: 'Settings', path: '/settings', icon: Settings, section: 'account' },
];

const TEACHER_SIDEBAR_PREFERENCE_KEY = 'teacher-space-sidebar-collapsed';

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
  const workspaceNavItems = SIDEBAR_NAV_ITEMS.filter((item) => item.section === 'workspace');
  const accountNavItems = SIDEBAR_NAV_ITEMS.filter((item) => item.section === 'account');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const rootClass = isDark ? 'bg-[#08101d] text-[#e2e8f0]' : 'bg-[#eff4ff] text-[#0f172a]';
  const sidebarClass = isDark
    ? 'border-[#1e2d45] bg-[#0b1528]/96'
    : 'border-[#dbe8ff] bg-[#f7faff]/96';
  const surfaceClass = isDark
    ? 'border-[#223450] bg-[#101d33]/95'
    : 'border-[#d4e3ff] bg-white';
  const headerClass = isDark
    ? 'border-[#1f304a] bg-[#08101d]/90'
    : 'border-[#d9e7ff] bg-[#eff4ff]/88';
  const searchClass = isDark
    ? 'border-[#35527d] bg-[#12203a] text-[#e2e8f0] placeholder:text-[#8ca0c0]'
    : 'border-[#cfe0ff] bg-white text-[#0f172a] placeholder:text-[#8da2c4]';
  const navItemIdleClass = isDark
    ? 'text-[#c7d7f2] hover:bg-[#162847] hover:text-white'
    : 'text-[#1f3154] hover:bg-[#e9f1ff] hover:text-[#1152d4]';
  const mutedTextClass = isDark ? 'text-[#9cb0d1]' : 'text-[#587095]';
  const statPillClass = isDark
    ? 'border border-[#2f4568] bg-[#13233f] text-[#d7e5ff]'
    : 'border border-[#d6e5ff] bg-[#f3f8ff] text-[#23416e]';
  const iconButtonClass = isDark
    ? 'border-[#334b71] bg-[#12203a] text-[#c4d6f3] hover:bg-[#19325b]'
    : 'border-[#d4e2fb] bg-white text-[#5e7699] hover:bg-[#eef4ff]';
  const navBadgeClass = isDark
    ? 'border-[#3a5380] bg-[#19315a] text-[#d6e4ff]'
    : 'border-[#cde0ff] bg-[#eef5ff] text-[#315889]';

  const navBadges: Record<string, string | null> = {
    '/teacher/my-courses': activeCourseCount > 0 ? String(activeCourseCount) : null,
    '/teacher/live-sessions': liveSessions > 0 ? String(liveSessions) : null,
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(TEACHER_SIDEBAR_PREFERENCE_KEY);
    setIsSidebarCollapsed(stored === '1');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      TEACHER_SIDEBAR_PREFERENCE_KEY,
      isSidebarCollapsed ? '1' : '0',
    );
  }, [isSidebarCollapsed]);

  const handleLogout = async () => {
    await logout();
    onNavigate('/auth/signin');
  };

  return (
    <div
      className={`teacher-space-shell relative h-screen overflow-hidden ${rootClass} ${isDark ? 'dark' : ''}`}
      style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${
          isDark
            ? 'bg-[radial-gradient(circle_at_top_left,rgba(60,130,255,0.23),transparent_40%),radial-gradient(circle_at_top_right,rgba(17,82,212,0.17),transparent_45%)]'
            : 'bg-[radial-gradient(circle_at_top_left,rgba(17,82,212,0.20),transparent_40%),radial-gradient(circle_at_top_right,rgba(62,145,255,0.16),transparent_46%)]'
        }`}
      />
      <div className="relative flex h-screen w-full overflow-hidden">
        <aside
          className={`teacher-space-sidebar hidden h-screen shrink-0 border-r transition-[width] duration-300 lg:flex lg:flex-col ${
            isSidebarCollapsed ? 'w-[5.75rem]' : 'w-[19.5rem]'
          } ${sidebarClass}`}
        >
          <div className={`flex h-full flex-col gap-5 py-5 ${isSidebarCollapsed ? 'px-2.5' : 'px-4'}`}>
            <div className={`flex ${isSidebarCollapsed ? 'justify-center' : 'justify-end'}`}>
              <button
                type="button"
                aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                onClick={() => setIsSidebarCollapsed((value) => !value)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${iconButtonClass}`}
              >
                {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </button>
            </div>

            <div className={`rounded-2xl border ${surfaceClass} ${isSidebarCollapsed ? 'px-2 py-3' : 'px-4 py-4'}`}>
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1152d4] text-white shadow-lg shadow-[#1152d4]/35">
                  <Rocket className="h-5 w-5" />
                </div>
                {!isSidebarCollapsed ? (
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-black tracking-tight">
                      Teacher <span className="text-[#1152d4]">Studio</span>
                    </h2>
                    <p className={`truncate text-xs font-semibold uppercase tracking-[0.18em] ${mutedTextClass}`}>
                      Instructor Workspace
                    </p>
                  </div>
                ) : null}
              </div>

              {!isSidebarCollapsed ? (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className={`rounded-xl px-3 py-2 ${statPillClass}`}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-80">Courses</p>
                    <p className="mt-1 text-sm font-black">{activeCourseCount}</p>
                  </div>
                  <div className={`rounded-xl px-3 py-2 ${statPillClass}`}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-80">Live</p>
                    <p className="mt-1 text-sm font-black">{liveSessions}</p>
                  </div>
                </div>
              ) : null}
            </div>

            <nav className={`teacher-space-sidebar-scroll flex-1 overflow-y-auto ${isSidebarCollapsed ? 'space-y-4 pr-0' : 'space-y-5 pr-1'}`}>
              <div>
                {!isSidebarCollapsed ? (
                  <p className={`mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] ${mutedTextClass}`}>
                    Workspace
                  </p>
                ) : null}
                <div className="space-y-1.5">
                  {workspaceNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveNavItem(currentPath, item.path);
                    const badge = navBadges[item.path];
                    return (
                      <button
                        key={item.path}
                        type="button"
                        title={item.label}
                        onClick={() => onNavigate(item.path)}
                        className={`group relative flex w-full cursor-pointer items-center rounded-xl text-base font-semibold transition ${
                          active
                            ? 'bg-[#1152d4] text-white shadow-lg shadow-[#1152d4]/25'
                            : navItemIdleClass
                        } ${
                          isSidebarCollapsed
                            ? 'justify-center px-2.5 py-3'
                            : 'gap-3 px-4 py-3 text-left'
                        }`}
                      >
                        {active && !isSidebarCollapsed ? (
                          <span className="absolute left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-white/85" />
                        ) : null}
                        <Icon className={`h-5 w-5 shrink-0 ${active ? '' : 'transition-transform group-hover:scale-105'}`} />
                        {!isSidebarCollapsed ? <span className={`truncate ${active ? 'pl-2' : ''}`}>{item.label}</span> : null}
                        {!isSidebarCollapsed && badge ? (
                          <span
                            className={`ml-auto inline-flex min-w-[1.6rem] items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${active ? 'border-white/20 bg-white/20 text-white' : navBadgeClass}`}
                          >
                            {Number(badge) > 99 ? '99+' : badge}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={`${isSidebarCollapsed ? '' : `border-t pt-4 ${isDark ? 'border-[#2a3f62]' : 'border-[#d9e7ff]'}`}`}>
                {!isSidebarCollapsed ? (
                  <p className={`mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] ${mutedTextClass}`}>
                    Account
                  </p>
                ) : null}
                <div className="space-y-1.5">
                  {accountNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveNavItem(currentPath, item.path);
                    return (
                      <button
                        key={item.path}
                        type="button"
                        title={item.label}
                        onClick={() => onNavigate(item.path)}
                        className={`group relative flex w-full cursor-pointer items-center rounded-xl text-base font-semibold transition ${
                          active
                            ? 'bg-[#1152d4] text-white shadow-lg shadow-[#1152d4]/25'
                            : navItemIdleClass
                        } ${
                          isSidebarCollapsed
                            ? 'justify-center px-2.5 py-3'
                            : 'gap-3 px-4 py-3 text-left'
                        }`}
                      >
                        {active && !isSidebarCollapsed ? (
                          <span className="absolute left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-white/85" />
                        ) : null}
                        <Icon className={`h-5 w-5 shrink-0 ${active ? '' : 'transition-transform group-hover:scale-105'}`} />
                        {!isSidebarCollapsed ? <span className={`truncate ${active ? 'pl-2' : ''}`}>{item.label}</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </nav>

            <div className={`mt-auto rounded-2xl border ${surfaceClass} ${isSidebarCollapsed ? 'px-2 py-3' : 'p-4'}`}>
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <Avatar className="h-11 w-11 border border-[#1152d4]/25">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!isSidebarCollapsed ? (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {displayName}
                    </p>
                    <p className={`truncate text-xs font-medium ${mutedTextClass}`}>{displayRole}</p>
                  </div>
                ) : null}
              </div>

              {isSidebarCollapsed ? (
                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    title="Create New Course"
                    onClick={() => onNavigate('/teacher/course-builder')}
                    className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-[#1152d4] text-white transition hover:bg-[#0f47b9]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Logout"
                    onClick={handleLogout}
                    className={`inline-flex h-9 w-full items-center justify-center rounded-lg border transition ${
                      isDark
                        ? 'border-[#344d72] bg-[#12203a] text-[#e2e8f0] hover:bg-[#1a3158]'
                        : 'border-[#d4e2fb] bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="mt-4 h-11 w-full cursor-pointer rounded-xl bg-[#1152d4] text-sm font-bold text-white shadow-sm transition hover:bg-[#0f47b9]"
                    onClick={() => onNavigate('/teacher/course-builder')}
                  >
                    Create New Course
                  </button>
                  <button
                    type="button"
                    className={`mt-2 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border text-sm font-bold transition ${
                      isDark
                        ? 'border-[#344d72] bg-[#12203a] text-[#e2e8f0] hover:bg-[#1a3158]'
                        : 'border-[#d4e2fb] bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>

        <main className="teacher-space-main min-w-0 h-screen flex-1 overflow-y-auto">
          <header
            className={`teacher-space-header sticky top-0 z-30 border-b px-4 py-4 backdrop-blur-xl md:px-8 xl:px-10 ${headerClass}`}
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              {showSearch ? (
                <div className="relative w-full xl:w-[32rem] xl:max-w-none">
                  <Search className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${mutedTextClass}`} />
                  <input
                    value={searchQuery}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    className={`h-11 w-full rounded-xl border pl-12 pr-4 text-sm shadow-sm transition focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200 ${searchClass}`}
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

              <div className="flex flex-wrap items-center justify-between gap-3 xl:justify-end">
                <div className="hidden items-center gap-2 md:flex">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statPillClass}`}>
                    {activeCourseCount} course(s)
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statPillClass}`}>
                    {liveSessions} live
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition ${iconButtonClass}`}
                    onClick={() => onNavigate('/notifications')}
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 ? (
                      <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
                    ) : null}
                  </button>
                  <button
                    type="button"
                    className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition ${iconButtonClass}`}
                    onClick={() => onNavigate('/notifications')}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/profile')}
                    className={`hidden items-center gap-2 rounded-xl border px-2.5 py-1.5 transition sm:inline-flex ${
                      isDark
                        ? 'border-[#334b71] bg-[#12203a] hover:bg-[#19325b]'
                        : 'border-[#d4e2fb] bg-white hover:bg-[#eef4ff]'
                    }`}
                  >
                    <Avatar className="h-7 w-7 border border-[#1152d4]/25">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="bg-blue-100 text-[11px] font-bold text-blue-700">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`max-w-[9rem] truncate text-xs font-bold ${mutedTextClass}`}>
                      {displayName}
                    </span>
                  </button>
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
                          ? 'bg-[#1152d4] text-white'
                          : isDark
                            ? 'bg-[#152845] text-[#d1e1fd]'
                            : 'bg-white text-[#35527d] shadow-sm'
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

          <div className="mx-auto w-full max-w-[1360px] p-4 pb-28 md:p-8 md:pb-12 xl:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
