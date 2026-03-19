import type { ReactNode } from 'react';
import {
  AlertCircle,
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  Rocket,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { normalizeUserRole } from '../../lib/roleUtils';
import { useGetTeacherDashboardQuery } from '../../store/api/dashboardApi';
import {
  useGetProfileQuery,
  useGetTeacherSpecialtyQuery,
  useGetUnreadNotificationCountQuery,
} from '../../store/api/userApi';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

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
  { label: 'My Courses', path: '/teacher/course-builder', icon: GraduationCap },
  { label: 'Students', path: '/teacher/live-sessions', icon: Users },
  { label: 'Assignments', path: '/teacher/course-builder/curriculum', icon: ClipboardCheck },
  { label: 'Analytics', path: '/teacher/live-session-builder', icon: BarChart3 },
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
  if (shared.status === 'auth-loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blue-50">
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
  const handleSearchChange = onSearchChange || (() => undefined);
  const allNavItems = SIDEBAR_NAV_ITEMS;
  const rootClass = 'bg-slate-100 text-slate-900';
  const shellPanelClass = 'border-slate-200 bg-white';
  const headerClass = 'border-slate-200 bg-white/85';
  const searchClass = 'border border-slate-200 bg-slate-100 text-slate-900 placeholder:text-slate-500';
  const mutedTextClass = 'text-slate-500';

  return (
    <div
      className={`teacher-space-shell relative h-screen overflow-hidden ${rootClass}`}
      style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
    >
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
                <h2 className="truncate text-xl font-bold tracking-tight text-slate-950">
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
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-medium transition ${
                      active
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-blue-200">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-950">
                    {displayName}
                  </p>
                  <p className={`truncate text-xs font-medium ${mutedTextClass}`}>{displayRole}</p>
                </div>
              </div>
              <button
                type="button"
                className="mt-4 h-11 w-full rounded-lg bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-700"
                onClick={() => onNavigate('/teacher/course-builder')}
              >
                Create New Course
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 h-screen flex-1 overflow-y-auto">
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
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    onClick={() => onNavigate('/notifications')}
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 ? (
                      <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
                    ) : null}
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    onClick={() => onNavigate('/notifications')}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>

                  {headerTitle ? (
                    <div className="hidden items-center gap-3 border-l border-slate-200 pl-5 lg:flex">
                      <span className="text-base font-bold text-slate-950">
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
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active
                          ? 'bg-blue-600 text-white'
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

          <div className="mx-auto w-full max-w-[1360px] p-4 pb-28 md:p-8 md:pb-12 xl:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
