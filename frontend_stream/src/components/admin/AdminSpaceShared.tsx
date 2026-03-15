import type { ReactNode } from 'react';
import {
  AlertCircle,
  Bell,
  BookOpen,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  Loader2,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGetAdminDashboardQuery } from '../../store/api/dashboardApi';
import { useGetProfileQuery, useGetUnreadNotificationCountQuery } from '../../store/api/userApi';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

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
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  displayName: string;
  displayRole: string;
  initials: string;
  avatarUrl: string | null;
  unreadCount: number;
  children: ReactNode;
}

const MAIN_NAV_ITEMS: AdminNavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'User Management', path: '/admin/users', icon: Users },
  { label: 'Course Management', path: '/admin/courses', icon: BookOpen },
  { label: 'Support Center', path: '/admin/support', icon: LifeBuoy },
];

const ACCOUNT_NAV_ITEMS: AdminNavItem[] = [
  { label: 'Settings', path: '/settings', icon: Settings },
];

function isActiveNavItem(currentPath: string | undefined, itemPath: string): boolean {
  if (!currentPath) return false;
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

function getInitials(firstName?: string | null, lastName?: string | null) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.trim().toUpperCase() || 'AD';
}

export function useAdminSpaceData(): AdminSpaceData {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const shouldLoad = Boolean(isAuthenticated && isAdmin && user?.id);

  const { data: profile } = useGetProfileQuery(undefined, { skip: !shouldLoad });
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useGetAdminDashboardQuery(undefined, { skip: !shouldLoad });
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
  if (shared.status === 'auth-loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
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
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search courses, users, or reports...',
  showSearch = true,
  displayName,
  displayRole,
  initials,
  avatarUrl,
  unreadCount,
  children,
}: AdminSpaceShellProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigate('/auth/signin');
  };

  return (
    <div
      className="min-h-screen bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100"
      style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
    >
      <div className="flex min-h-screen overflow-hidden">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 p-6">
            <div className="rounded-2xl bg-[#1152d4] p-2 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#1152d4]">EduAdmin</h2>
          </div>

          <nav className="mt-4 flex-1 space-y-2 px-4">
            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActiveNavItem(currentPath, item.path);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors ${
                    active
                      ? 'bg-[#1152d4]/10 text-[#1152d4]'
                      : 'text-slate-600 hover:bg-[#1152d4]/5 hover:text-[#1152d4] dark:text-slate-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}

            <div className="mt-6 border-t border-[#1152d4]/5 pt-4">
              {ACCOUNT_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActiveNavItem(currentPath, item.path);
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors ${
                      active
                        ? 'bg-[#1152d4]/10 text-[#1152d4]'
                        : 'text-slate-600 hover:bg-[#1152d4]/5 hover:text-[#1152d4] dark:text-slate-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="p-4">
            <div className="rounded-[24px] bg-[#f6f6f8] p-4 dark:bg-slate-800">
              <div className="mb-3 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-[#1152d4]/10 text-[#1152d4]">
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
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-slate-500 transition hover:bg-white hover:text-[#1152d4] dark:hover:bg-slate-900"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-20 border-b border-[#1152d4]/10 bg-white/85 px-4 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {showSearch ? (
                <div className="relative w-full md:max-w-xl">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className="h-11 w-full rounded-2xl border-none bg-[#f6f6f8] pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#1152d4]/20 dark:bg-slate-800"
                    placeholder={searchPlaceholder}
                    type="text"
                  />
                </div>
              ) : (
                <div className="text-sm font-medium text-slate-500 dark:text-slate-300">
                  Administrative workspace
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/notifications')}
                  className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f6f6f8] text-slate-600 transition hover:text-[#1152d4] dark:bg-slate-800 dark:text-slate-300"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 ? (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/help')}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f6f6f8] text-slate-600 transition hover:text-[#1152d4] dark:bg-slate-800 dark:text-slate-300"
                >
                  <HelpCircle className="h-5 w-5" />
                </button>
                <div className="hidden h-8 w-px bg-[#1152d4]/10 md:block" />
                <div className="hidden items-center gap-3 rounded-full bg-[#1152d4]/5 px-3 py-1.5 md:flex">
                  <span className="text-xs font-bold text-[#1152d4]">ADMIN WORKSPACE</span>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
