import type { ReactNode } from 'react';
import {
  AlertCircle,
  Bell,
  BookOpen,
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
import { Button } from '../ui/button';

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
  const { includeDashboard = true } = options;
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

  const handleLogout = async () => {
    await logout();
    onNavigate('/auth/signin');
  };

  return (
    <div
      className={`relative min-h-screen overflow-hidden ${rootClass}`}
      style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,rgba(17,82,212,0.18),transparent_42%),radial-gradient(circle_at_top_right,rgba(67,165,255,0.12),transparent_30%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] overflow-hidden">
        <aside className={`hidden w-80 shrink-0 border-r lg:flex lg:flex-col ${shellPanelClass}`}>
          <div className="sticky top-0 flex h-screen flex-col px-5 pb-5 pt-6">
            <div className="flex items-center gap-3 px-1">
              <div className="rounded-2xl bg-[#1152d4] p-2.5 text-white shadow-lg shadow-[#1152d4]/25">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${mutedTextClass}`}>
                  Admin Space
                </p>
                <h2 className="text-xl font-black tracking-tight text-[#1152d4]">EduAdmin</h2>
              </div>
            </div>

            <div className={`mt-6 rounded-[28px] p-4 ${secondaryPanelClass}`}>
              <div className="mb-4 flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-[#1152d4]/15">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-[#1152d4]/10 text-[#1152d4]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{displayName}</p>
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${mutedTextClass}`}>
                    {displayRole}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className={`w-full rounded-xl ${
                  isDark
                    ? 'border-[#334155] bg-[#162033] text-[#e2e8f0] hover:bg-[#203049]'
                    : 'border-[#dbe6ff] bg-white text-[#0f172a] hover:bg-[#f8fbff]'
                }`}
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>

            <nav className="mt-6 flex-1 space-y-2 overflow-y-auto pr-1">
              {MAIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActiveNavItem(currentPath, item.path);
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                      active
                        ? 'bg-[#1152d4] text-white shadow-lg shadow-[#1152d4]/20'
                        : isDark
                          ? 'text-[#cbd5e1] hover:bg-[#162033] hover:text-white'
                          : 'text-[#475569] hover:bg-[#edf4ff] hover:text-[#1152d4]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </button>
                );
              })}

              <div className={`px-4 pt-6 text-[10px] font-bold uppercase tracking-[0.22em] ${mutedTextClass}`}>
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
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                      active
                        ? 'bg-[#1152d4] text-white shadow-lg shadow-[#1152d4]/20'
                        : isDark
                          ? 'text-[#cbd5e1] hover:bg-[#162033] hover:text-white'
                          : 'text-[#475569] hover:bg-[#edf4ff] hover:text-[#1152d4]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className={`mt-5 rounded-[28px] p-4 ${secondaryPanelClass}`}>
              <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${mutedTextClass}`}>
                Operations Pulse
              </p>
              <p className="mt-2 text-sm font-semibold">
                Review support load, moderation flows, and platform access from the same command center.
              </p>
              <Button
                className="mt-4 w-full rounded-xl bg-[#1152d4] text-xs font-bold text-white hover:bg-[#0f47b9]"
                onClick={() => onNavigate('/admin/support')}
              >
                Open support desk
              </Button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <header className={`sticky top-0 z-30 border-b px-4 py-4 backdrop-blur-xl md:px-8 xl:px-10 ${headerClass}`}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              {showSearch ? (
                <div className="relative w-full xl:max-w-xl">
                  <Search className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedTextClass}`} />
                  <input
                    value={searchQuery}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    className={`h-12 w-full rounded-2xl pl-11 pr-4 text-sm shadow-sm transition focus:border-[#1152d4] focus:outline-none focus:ring-4 focus:ring-[#1152d4]/15 ${searchClass}`}
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

              <div className="flex items-center justify-between gap-3 xl:justify-end">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`relative rounded-2xl ${
                      isDark
                        ? 'border-[#334155] bg-[#162033] text-[#e2e8f0] hover:bg-[#203049]'
                        : 'border-[#dbe6ff] bg-white text-[#0f172a] hover:bg-[#f8fbff]'
                    }`}
                    onClick={() => onNavigate('/notifications')}
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 ? (
                      <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
                    ) : null}
                  </Button>
                  <div className={`hidden h-10 w-px sm:block ${isDark ? 'bg-[#334155]' : 'bg-[#dbe6ff]'}`} />
                  <div className="hidden text-right sm:block">
                    <p className="text-xs font-bold">Command Center</p>
                    <p className="text-[10px] font-bold text-[#1152d4]">ADMIN WORKSPACE</p>
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
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
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

          <div className="mx-auto w-full max-w-[1280px] p-4 pb-28 md:p-8 md:pb-12 xl:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
