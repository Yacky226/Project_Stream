import { useEffect, useState, type ReactNode } from 'react';
import {
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  GraduationCap,
  LayoutGrid,
  Loader2,
  LogOut,
  Mail,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Radio,
  Route,
  Search,
  Settings,
  User,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useResolvedTheme } from '../../hooks/useResolvedTheme';
import { useGetStudentDashboardQuery } from '../../store/api/dashboardApi';
import {
  useGetProfileQuery,
  useGetStudentLevelQuery,
  useGetUnreadNotificationCountQuery,
} from '../../store/api/userApi';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import './StudentSpaceShared.css';

type StudentSpaceStatusType =
  | 'auth-loading'
  | 'unauthenticated'
  | 'wrong-role'
  | 'loading'
  | 'error'
  | 'ready';

interface StudentShellNavItem {
  label: string;
  path: string;
  icon: typeof LayoutGrid;
}

export interface StudentSpaceData {
  status: StudentSpaceStatusType;
  errorMessage: string | null;
  isAuthenticated: boolean;
  user: ReturnType<typeof useAuth>['user'];
  displayName: string;
  displayLevel: string;
  initials: string;
  avatarUrl: string | null;
  goalProgress: number;
  unreadCount: number;
  dashboard: NonNullable<ReturnType<typeof useGetStudentDashboardQuery>['data']> | null;
  profile: NonNullable<ReturnType<typeof useGetProfileQuery>['data']> | null;
}

interface StudentSpaceShellProps {
  currentPath?: string;
  onNavigate: (path: string | number) => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  headerTitle?: string;
  headerDescription?: string;
  displayName: string;
  displayLevel: string;
  initials: string;
  avatarUrl: string | null;
  goalProgress: number;
  unreadCount: number;
  children: ReactNode;
}

const MAIN_NAV_ITEMS: StudentShellNavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
  { label: 'My Courses', path: '/student/courses', icon: BookOpen },
  { label: 'Learning Path', path: '/student/learning-path', icon: Route },
  { label: 'Live Sessions', path: '/student/live', icon: Radio },
  { label: 'Achievements', path: '/student/achievements', icon: Award },
  { label: 'Community', path: '/student/community', icon: MessageSquare },
];

const ACCOUNT_NAV_ITEMS: StudentShellNavItem[] = [
  { label: 'My Profile', path: '/profile', icon: User },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const STUDENT_SIDEBAR_PREFERENCE_KEY = 'student-space-sidebar-collapsed';

interface UseStudentSpaceDataOptions {
  includeDashboard?: boolean;
}

export function getStudentSpaceErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;
  const payload = error as {
    data?: { message?: string; error?: string };
    error?: string;
    message?: string;
  };
  return payload.data?.message || payload.data?.error || payload.error || payload.message || fallback;
}

export function getStudentInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.trim().toUpperCase() || 'ET';
}

export function formatStudentDate(value: string | null | undefined): string {
  if (!value) return 'Date non disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date non disponible';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatStudentDateShort(value: string | null | undefined): string {
  if (!value) return 'Date non disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date non disponible';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function formatStudentRelativeDate(value: string | null | undefined): string {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startToday - startDate) / 86400000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.round(diffDays / 7)} weeks ago`;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatStudentCompactNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    maximumFractionDigits: value >= 100000 ? 0 : 1,
  }).format(value);
}

export function getStudentCategoryMeta(category: string, isDark = false) {
  const normalized = category.toLowerCase();
  if (normalized.includes('design')) {
    return {
      iconClass: isDark
        ? 'bg-rose-900/30 text-rose-300'
        : 'bg-rose-100 text-rose-600',
      pillClass: isDark
        ? 'bg-rose-900/30 text-rose-300'
        : 'bg-rose-100 text-rose-700',
    };
  }
  if (normalized.includes('market')) {
    return {
      iconClass: isDark
        ? 'bg-amber-900/30 text-amber-300'
        : 'bg-amber-100 text-amber-600',
      pillClass: isDark
        ? 'bg-amber-900/30 text-amber-300'
        : 'bg-amber-100 text-amber-700',
    };
  }
  if (normalized.includes('business')) {
    return {
      iconClass: isDark
        ? 'bg-emerald-900/30 text-emerald-300'
        : 'bg-emerald-100 text-emerald-600',
      pillClass: isDark
        ? 'bg-emerald-900/30 text-emerald-300'
        : 'bg-emerald-100 text-emerald-700',
    };
  }
  if (normalized.includes('develop') || normalized.includes('program')) {
    return {
      iconClass: isDark
        ? 'bg-indigo-900/30 text-indigo-300'
        : 'bg-indigo-100 text-indigo-600',
      pillClass: isDark
        ? 'bg-indigo-900/30 text-indigo-300'
        : 'bg-indigo-100 text-indigo-700',
    };
  }
  return {
    iconClass: isDark ? 'bg-[#1152d4]/20 text-[#8fb5ff]' : 'bg-[#1152d4]/10 text-[#1152d4]',
    pillClass: isDark ? 'bg-[#1152d4]/20 text-[#8fb5ff]' : 'bg-[#1152d4]/10 text-[#1152d4]',
  };
}

export function calculateActivityStreak(values: Array<string | null | undefined>): number {
  const days = Array.from(
    new Set(
      values
        .filter((value): value is string => Boolean(value))
        .map((value) => value.slice(0, 10)),
    ),
  ).sort((a, b) => (a < b ? 1 : -1));

  if (days.length === 0) return 0;

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const day of days) {
    const entry = new Date(day);
    entry.setHours(0, 0, 0, 0);

    const diff = Math.round((cursor.getTime() - entry.getTime()) / 86400000);
    if (diff === 0) {
      streak += 1;
      cursor = new Date(cursor.getTime() - 86400000);
      continue;
    }
    if (diff === 1 && streak === 0) {
      streak += 1;
      cursor = new Date(entry.getTime() - 86400000);
      continue;
    }
    if (diff === 1) {
      streak += 1;
      cursor = new Date(cursor.getTime() - 86400000);
      continue;
    }
    break;
  }

  return streak;
}

function isActiveNavItem(currentPath: string | undefined, itemPath: string): boolean {
  if (!currentPath) return false;
  if (itemPath === '/dashboard') return currentPath === '/dashboard';
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

export function useStudentSpaceData(
  options: UseStudentSpaceDataOptions = {},
): StudentSpaceData {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { includeDashboard = true } = options;
  const isStudent = user?.role === 'student';
  const shouldLoad = Boolean(isAuthenticated && isStudent && user?.id);
  const shouldLoadDashboard = shouldLoad && includeDashboard;

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useGetStudentDashboardQuery(undefined, {
    skip: !shouldLoadDashboard,
  });
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useGetProfileQuery(undefined, {
    skip: !shouldLoad,
  });
  const { data: level } = useGetStudentLevelQuery(undefined, {
    skip: !shouldLoad || Boolean(profile?.niveau),
  });
  const { data: unreadCount = 0 } = useGetUnreadNotificationCountQuery(undefined, {
    skip: !shouldLoad,
  });

  const displayName = `${profile?.firstName || user?.firstName || 'Student'} ${profile?.lastName || user?.lastName || ''}`.trim();
  const displayLevel = profile?.niveau || level || 'Learner level';
  const avatarUrl = profile?.avatar || user?.avatar || null;
  const goalProgress = Math.min(dashboard?.stats.averageProgress || 0, 100);
  const initials = getStudentInitials(
    profile?.firstName || user?.firstName,
    profile?.lastName || user?.lastName,
  );

  let status: StudentSpaceStatusType = 'ready';
  if (authLoading) {
    status = 'auth-loading';
  } else if (!isAuthenticated) {
    status = 'unauthenticated';
  } else if (!isStudent) {
    status = 'wrong-role';
  } else if (profileLoading || (includeDashboard && dashboardLoading)) {
    status = 'loading';
  } else if (
    !profile ||
    profileError ||
    (includeDashboard && (!dashboard || dashboardError))
  ) {
    status = 'error';
  }

  const errorMessage =
    status === 'error'
      ? getStudentSpaceErrorMessage(
          dashboardError || profileError,
          'Impossible de charger votre espace etudiant.',
        )
      : null;

  return {
    status,
    errorMessage,
    isAuthenticated,
    user,
    displayName,
    displayLevel,
    initials,
    avatarUrl,
    goalProgress,
    unreadCount,
    dashboard: dashboard || null,
    profile: profile || null,
  };
}

export function StudentSpaceStatus({ shared }: { shared: StudentSpaceData }) {
  const { isDark } = useResolvedTheme();

  if (shared.status === 'auth-loading' || shared.status === 'loading') {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${
          isDark ? 'bg-[#101622]' : 'bg-[#f6f6f8]'
        }`}
      >
        <Loader2 className="h-8 w-8 animate-spin text-[#1152d4]" />
      </div>
    );
  }

  if (shared.status === 'unauthenticated') {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Connectez-vous pour afficher votre espace etudiant.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (shared.status === 'wrong-role') {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Ces vues sont reservees aux comptes etudiants.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {shared.errorMessage || 'Impossible de charger votre espace etudiant.'}
        </AlertDescription>
      </Alert>
    </div>
  );
}

export function StudentSpaceShell({
  currentPath,
  onNavigate,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search courses, sessions, articles...',
  showSearch = true,
  headerTitle,
  headerDescription,
  displayName,
  displayLevel,
  initials,
  avatarUrl,
  goalProgress,
  unreadCount,
  children,
}: StudentSpaceShellProps) {
  const { logout } = useAuth();
  const { isDark } = useResolvedTheme();
  const handleSearchChange = onSearchChange || (() => undefined);
  const workspaceNavItems = MAIN_NAV_ITEMS;
  const accountNavItems = ACCOUNT_NAV_ITEMS;
  const allNavItems = [...workspaceNavItems, ...accountNavItems];
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const boundedGoalProgress = Math.max(0, Math.min(goalProgress, 100));
  const roundedGoalProgress = Math.round(boundedGoalProgress);
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
    '/student/learning-path': `${roundedGoalProgress}%`,
    '/notifications': unreadCount > 0 ? String(unreadCount) : null,
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STUDENT_SIDEBAR_PREFERENCE_KEY);
    setIsSidebarCollapsed(stored === '1');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      STUDENT_SIDEBAR_PREFERENCE_KEY,
      isSidebarCollapsed ? '1' : '0',
    );
  }, [isSidebarCollapsed]);

  const handleLogout = async () => {
    await logout();
    onNavigate('/auth/signin');
  };

  return (
    <div
      className={`student-space-shell relative h-screen overflow-hidden ${rootClass} ${isDark ? 'dark' : ''}`}
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
          className={`student-space-shell__sidebar hidden h-screen shrink-0 border-r transition-[width] duration-300 lg:flex lg:flex-col ${
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
                  <GraduationCap className="h-5 w-5" />
                </div>
                {!isSidebarCollapsed ? (
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-black tracking-tight">
                      Student <span className="text-[#1152d4]">Studio</span>
                    </h2>
                    <p className={`truncate text-xs font-semibold uppercase tracking-[0.18em] ${mutedTextClass}`}>
                      Learning Workspace
                    </p>
                  </div>
                ) : null}
              </div>

              {!isSidebarCollapsed ? (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className={`rounded-xl px-3 py-2 ${statPillClass}`}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-80">Progress</p>
                    <p className="mt-1 text-sm font-black">{roundedGoalProgress}%</p>
                  </div>
                  <div className={`rounded-xl px-3 py-2 ${statPillClass}`}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-80">Unread</p>
                    <p className="mt-1 text-sm font-black">{unreadCount}</p>
                  </div>
                </div>
              ) : null}
            </div>

            <nav className={`student-space-shell__sidebar-scroll flex-1 overflow-y-auto ${isSidebarCollapsed ? 'space-y-4 pr-0' : 'space-y-5 pr-1'}`}>
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
                            className={`ml-auto inline-flex min-w-[1.6rem] items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                              active ? 'border-white/20 bg-white/20 text-white' : navBadgeClass
                            }`}
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
                            className={`ml-auto inline-flex min-w-[1.6rem] items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                              active ? 'border-white/20 bg-white/20 text-white' : navBadgeClass
                            }`}
                          >
                            {Number(badge) > 99 ? '99+' : badge}
                          </span>
                        ) : null}
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
                  <AvatarFallback className="bg-[#1152d4]/10 text-[#1152d4]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!isSidebarCollapsed ? (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {displayName}
                    </p>
                    <p className={`truncate text-xs font-medium ${mutedTextClass}`}>{displayLevel}</p>
                  </div>
                ) : null}
              </div>

              {isSidebarCollapsed ? (
                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    title="Open Public Profile"
                    onClick={() => onNavigate('/profile/public')}
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
                  <Button
                    className="mt-4 h-11 w-full rounded-xl bg-[#1152d4] text-sm font-bold text-white transition hover:bg-[#0f47b9]"
                    onClick={() => onNavigate('/profile/public')}
                  >
                    Upgrade to Pro
                  </Button>
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

        <main className="student-space-shell__main min-w-0 h-screen flex-1 overflow-y-auto">
          <header className={`student-space-shell__header sticky top-0 z-30 border-b px-4 py-4 backdrop-blur-xl md:px-8 xl:px-10 ${headerClass}`}>
            <div className="flex items-center justify-between gap-4">
              {showSearch ? (
                <div className="relative w-full md:max-w-md">
                  <Search
                    className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedTextClass}`}
                  />
                  <input
                    value={searchQuery}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    className={`student-space-shell__search-input h-11 w-full rounded-xl pl-11 pr-4 text-sm shadow-sm transition focus:border-[#1152d4] focus:outline-none focus:ring-4 focus:ring-[#1152d4]/15 ${searchClass}`}
                    placeholder={searchPlaceholder}
                    type="text"
                  />
                </div>
              ) : (
                <div className="min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${mutedTextClass}`}>
                    {displayLevel}
                  </p>
                  <h1 className="mt-1 truncate text-2xl font-black tracking-tight">
                    {headerTitle || displayName}
                  </h1>
                  {headerDescription ? (
                    <p className={`mt-1 max-w-2xl text-sm ${mutedTextClass}`}>{headerDescription}</p>
                  ) : null}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`relative rounded-xl border transition ${iconButtonClass}`}
                    onClick={() => onNavigate('/notifications')}
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 ? (
                      <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
                    ) : null}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-xl border transition ${iconButtonClass}`}
                    onClick={() => onNavigate('/notifications')}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <div className={`hidden h-8 w-px sm:block ${isDark ? 'bg-[#334155]' : 'bg-[#dbe6ff]'}`} />
                  <div className="hidden text-right sm:block">
                    <p className="text-xs font-bold">Today's Goal</p>
                    <p className="text-[10px] font-bold text-[#1152d4]">{goalProgress}% Complete</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('/profile')}
                  className="rounded-full"
                >
                  <Avatar className="h-11 w-11 border-2 border-[#1152d4]/20 shadow-sm">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="bg-[#1152d4]/10 text-[#1152d4]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </div>
            </div>

            <nav className="mt-4 lg:hidden">
              <div className="student-space-shell__hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {allNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveNavItem(currentPath, item.path);
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => onNavigate(item.path)}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? 'bg-[#1152d4] text-white'
                          : isDark
                            ? 'bg-[#162033] text-[#cbd5e1]'
                            : 'bg-white text-[#475569] shadow-sm'
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

          <div className="student-space-shell__content mx-auto w-full max-w-[1280px] p-4 pb-28 md:p-8 md:pb-12 xl:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
