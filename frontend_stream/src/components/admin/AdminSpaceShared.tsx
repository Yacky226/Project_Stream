import type { ReactNode } from 'react';
import {
  AlertCircle,
  Bell,
  BookOpen,
  CircleHelp,
  LayoutDashboard,
  LifeBuoy,
  Loader2,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useResolvedTheme } from '../../hooks/useResolvedTheme';
import { normalizeUserRole } from '../../lib/roleUtils';
import { useGetAdminDashboardQuery } from '../../store/api/dashboardApi';
import { useGetProfileQuery, useGetUnreadNotificationCountQuery } from '../../store/api/userApi';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import './AdminSpaceShared.css';

type AdminSpaceStatusType = 'auth-loading' | 'unauthenticated' | 'wrong-role' | 'ready';

interface AdminNavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
}

export interface AdminSpaceData {
  status: AdminSpaceStatusType;
  isAuthenticated: boolean;
  user: ReturnType<typeof useAuth>['user'];
  displayName: string;
  displayRole: string;
  initials: string;
  avatarUrl: string | null;
  unreadCount: number;
  dashboard: NonNullable<ReturnType<typeof useGetAdminDashboardQuery>['data']> | null;
  dashboardLoading: boolean;
  dashboardError: unknown;
  logout: ReturnType<typeof useAuth>['logout'];
}

interface AdminSpaceShellProps {
  currentPath?: string;
  onNavigate: (path: string | number) => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
  headerDescription?: string;
  displayName: string;
  displayRole: string;
  initials: string;
  avatarUrl: string | null;
  unreadCount: number;
  children: ReactNode;
}

interface UseAdminSpaceDataOptions {
  includeDashboard?: boolean;
}

const MAIN_NAV_ITEMS: AdminNavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'User Management', path: '/admin/users', icon: Users },
  { label: 'Course Management', path: '/admin/courses', icon: BookOpen },
  { label: 'Support Center', path: '/admin/support', icon: LifeBuoy },
];

const ACCOUNT_NAV_ITEMS: AdminNavItem[] = [
  { label: 'My Profile', path: '/profile', icon: User },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Settings', path: '/settings', icon: Settings },
];

function isActiveNavItem(currentPath: string | undefined, itemPath: string): boolean {
  if (!currentPath) return false;
  if (itemPath === '/admin') return currentPath === '/admin';
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

function getInitials(firstName?: string | null, lastName?: string | null) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.trim().toUpperCase() || 'AD';
}

export function useAdminSpaceData(
  options: UseAdminSpaceDataOptions = {},
): AdminSpaceData {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { includeDashboard = false } = options;
  const isAdmin = normalizeUserRole(user?.role) === 'admin';
  const shouldLoad = Boolean(isAuthenticated && isAdmin && user?.id);
  const shouldLoadDashboard = shouldLoad && includeDashboard;

  const { data: profile } = useGetProfileQuery(undefined, { skip: !shouldLoad });
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useGetAdminDashboardQuery(undefined, { skip: !shouldLoadDashboard });
  const { data: unreadCount = 0 } = useGetUnreadNotificationCountQuery(undefined, {
    skip: !shouldLoad,
  });

  let status: AdminSpaceStatusType = 'ready';
  if (authLoading) status = 'auth-loading';
  else if (!isAuthenticated) status = 'unauthenticated';
  else if (!isAdmin) status = 'wrong-role';

  const displayName = `${profile?.firstName || user?.firstName || 'Admin'} ${profile?.lastName || user?.lastName || ''}`.trim();
  const displayRole = profile?.specialite || 'Platform Manager';
  const avatarUrl = profile?.avatar || user?.avatar || null;

  return {
    status,
    isAuthenticated,
    user,
    displayName,
    displayRole,
    initials: getInitials(profile?.firstName || user?.firstName, profile?.lastName || user?.lastName),
    avatarUrl,
    unreadCount,
    dashboard: dashboard || null,
    dashboardLoading,
    dashboardError,
    logout,
  };
}

export function AdminSpaceStatus({ shared }: { shared: AdminSpaceData }) {
  const { isDark } = useResolvedTheme();

  if (shared.status === 'auth-loading') {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${
          isDark ? 'bg-[#09111f]' : 'bg-[#eef4ff]'
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
          <AlertDescription>Connectez-vous avec un compte administrateur.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Ces vues sont reservees aux administrateurs.</AlertDescription>
      </Alert>
    </div>
  );
}

export function AdminSpaceShell({
  currentPath,
  onNavigate,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search courses, users, or reports...',
  showSearch = true,
  showHeader = true,
  headerTitle,
  headerDescription,
  displayName,
  displayRole,
  initials,
  avatarUrl,
  unreadCount,
  children,
}: AdminSpaceShellProps) {
  const { logout } = useAuth();
  const { isDark } = useResolvedTheme();
  const handleSearchChange = onSearchChange || (() => undefined);
  const allNavItems = [...MAIN_NAV_ITEMS, ...ACCOUNT_NAV_ITEMS];
  const rootClass = isDark
    ? 'bg-[#101622] text-[#e2e8f0]'
    : 'bg-[#f6f6f8] text-[#0f172a]';
  const shellPanelClass = isDark
    ? 'border-[#1e293b] bg-slate-900'
    : 'border-[#1152d4]/10 bg-white';
  const headerClass = isDark
    ? 'border-[#1e293b] bg-slate-900'
    : 'border-[#1152d4]/10 bg-white';
  const searchClass = isDark
    ? 'border-none bg-slate-800 text-[#e2e8f0] placeholder:text-[#7f8ea3]'
    : 'border-none bg-[#f6f6f8] text-[#0f172a] placeholder:text-[#94a3b8]';
  const mutedTextClass = isDark ? 'text-[#94a3b8]' : 'text-[#64748b]';
  const shellToneClass = isDark ? 'admin-space-shell--dark' : 'admin-space-shell--light';
  const headerSizingClass = showSearch ? 'min-h-[5rem] py-4' : 'min-h-[6.5rem] py-4';
  const headerInnerClass = showSearch
    ? 'flex min-h-[3rem] items-center justify-between gap-4'
    : 'flex min-h-[3rem] items-start justify-between gap-4 md:items-center';

  const handleLogout = async () => {
    await logout();
    onNavigate('/auth/signin');
  };

  return (
    <div
      className={`admin-space-shell ${shellToneClass} min-h-screen ${rootClass}`}
      style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
    >
      <div className="relative flex h-screen w-full overflow-hidden">
        <aside className={`admin-space-shell__sidebar admin-space-shell__sidebar-panel hidden w-[16rem] min-w-[16rem] max-w-[16rem] shrink-0 border-r lg:flex lg:flex-col ${shellPanelClass}`}>
          <div className="flex h-full flex-col">
            <div className="admin-space-shell__brand p-6">
              <p className="admin-space-shell__brand-overline mb-2 text-[10px] font-extrabold uppercase tracking-[0.26em]">
                Admin Space
              </p>
              <div className="flex items-center gap-3">
                <div className="admin-space-shell__brand-badge rounded-xl bg-[#1152d4] p-2 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h1 className="text-[2rem] font-black leading-none tracking-tight text-[#1152d4]">EduAdmin</h1>
              </div>
            </div>

            <nav className="admin-space-shell__nav admin-space-shell__hide-scrollbar mt-3 flex-1 space-y-2 overflow-y-auto px-4">
              {MAIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActiveNavItem(currentPath, item.path);
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className={`admin-space-shell__nav-item flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                      active
                        ? 'admin-space-shell__nav-item--active bg-[#1152d4]/10 text-[#1152d4] font-semibold'
                        : isDark
                          ? 'admin-space-shell__nav-item--idle text-[#cbd5e1] hover:bg-[#162033] hover:text-[#8fb5ff]'
                          : 'admin-space-shell__nav-item--idle text-slate-600 hover:bg-[#1152d4]/5 hover:text-[#1152d4]'
                    }`}
                  >
                    <span className="admin-space-shell__nav-icon inline-flex h-7 w-7 items-center justify-center rounded-lg">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}

              <div className={`admin-space-shell__section-label mt-4 border-t pt-4 text-[10px] font-bold uppercase tracking-[0.22em] ${isDark ? 'border-[#1e293b]' : 'border-[#1152d4]/10'} ${mutedTextClass}`}>
                Account
              </div>

              {ACCOUNT_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActiveNavItem(currentPath, item.path);
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className={`admin-space-shell__nav-item flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                      active
                        ? 'admin-space-shell__nav-item--active bg-[#1152d4]/10 text-[#1152d4] font-semibold'
                        : isDark
                          ? 'admin-space-shell__nav-item--idle text-[#cbd5e1] hover:bg-[#162033] hover:text-[#8fb5ff]'
                          : 'admin-space-shell__nav-item--idle text-slate-600 hover:bg-[#1152d4]/5 hover:text-[#1152d4]'
                    }`}
                  >
                    <span className="admin-space-shell__nav-icon inline-flex h-7 w-7 items-center justify-center rounded-lg">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="admin-space-shell__profile-wrap mt-auto p-4">
              <div className={`admin-space-shell__profile-card rounded-xl p-4 ${isDark ? 'bg-slate-800' : 'bg-[#f6f6f8]'}`}>
                <div className="mb-3 flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-[#1152d4]/15">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="bg-[#1152d4]/20 text-[#1152d4]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{displayName}</p>
                    <p className="text-xs text-slate-500">{displayRole}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="admin-space-shell__signout-btn inline-flex w-full items-center justify-center gap-2 text-xs font-bold text-slate-500 transition hover:text-[#1152d4]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="admin-space-shell__main relative min-w-0 flex-1 overflow-y-auto">
          {showHeader ? (
            <header className={`admin-space-shell__header sticky top-0 z-50 border-b px-4 md:px-8 ${headerSizingClass} ${headerClass}`}>
            <div className={headerInnerClass}>
              {showSearch ? (
                <div className="relative w-full max-w-xl">
                  <Search
                    className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedTextClass}`}
                  />
                  <input
                    value={searchQuery}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    className={`h-11 w-full rounded-xl border-none pl-14 pr-4 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 ${searchClass}`}
                    placeholder={searchPlaceholder}
                    type="text"
                  />
                </div>
              ) : (
                <div className="min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${mutedTextClass}`}>
                    {displayRole}
                  </p>
                  <h1 className="mt-1 truncate text-2xl font-black tracking-tight">
                    {headerTitle || displayName}
                  </h1>
                  {headerDescription ? (
                    <p className={`mt-1 max-w-2xl text-sm ${mutedTextClass}`}>{headerDescription}</p>
                  ) : null}
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className={`relative rounded-2xl ${
                      isDark
                        ? 'bg-slate-800 text-[#e2e8f0] hover:text-[#8fb5ff]'
                        : 'bg-[#f6f6f8] text-slate-600 hover:text-[#1152d4]'
                    }`}
                    style={{ width: '40px', height: '40px' }}
                    onClick={() => onNavigate('/notifications')}
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 ? (
                      <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/help')}
                    className={`rounded-2xl ${
                      isDark
                        ? 'bg-slate-800 text-[#e2e8f0] hover:text-[#8fb5ff]'
                        : 'bg-[#f6f6f8] text-slate-600 hover:text-[#1152d4]'
                    }`}
                    style={{ width: '40px', height: '40px' }}
                  >
                    <CircleHelp className="h-4 w-4" />
                  </button>
                  <div className={`hidden h-8 w-px sm:block ${isDark ? 'bg-[#334155]' : 'bg-[#1152d4]/10'}`} />
                  <div className="hidden items-center rounded-full bg-[#1152d4]/5 px-3 py-1.5 sm:flex">
                    <span className="text-xs font-bold text-[#1152d4]">PRO VERSION</span>
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
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl lg:hidden ${
                    isDark
                      ? 'border border-[#334155] bg-[#162033] text-[#e2e8f0] hover:bg-[#203049]'
                      : 'border border-[#dbe6ff] bg-white text-[#0f172a] hover:bg-[#f8fbff]'
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>

            <nav className="mt-4 lg:hidden">
              <div className="admin-space-shell__hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {allNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveNavItem(currentPath, item.path);
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => onNavigate(item.path)}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150 ${
                        active
                          ? 'bg-[#1152d4]/10 text-[#1152d4]'
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
          ) : null}

          <div className="admin-space-shell__content relative z-0 w-full p-4 pb-28 md:p-8 md:pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
