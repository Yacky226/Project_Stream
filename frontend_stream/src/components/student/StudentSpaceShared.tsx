import type { ReactNode } from 'react';
import {
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  GraduationCap,
  LayoutGrid,
  Loader2,
  MessageSquare,
  Radio,
  Route,
  Search,
  Settings,
  User,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGetStudentDashboardQuery } from '../../store/api/dashboardApi';
import {
  useGetProfileQuery,
  useGetStudentLevelQuery,
  useGetUnreadNotificationCountQuery,
} from '../../store/api/userApi';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';

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
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
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
  { label: 'Settings', path: '/settings', icon: Settings },
];

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

export function getStudentCategoryMeta(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes('design')) {
    return {
      iconClass: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
      pillClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    };
  }
  if (normalized.includes('market')) {
    return {
      iconClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
      pillClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    };
  }
  if (normalized.includes('business')) {
    return {
      iconClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
      pillClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    };
  }
  if (normalized.includes('develop') || normalized.includes('program')) {
    return {
      iconClass: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300',
      pillClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    };
  }
  return {
    iconClass: 'bg-[#1152d4]/10 text-[#1152d4]',
    pillClass: 'bg-[#1152d4]/10 text-[#1152d4]',
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

export function useStudentSpaceData(): StudentSpaceData {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const isStudent = user?.role === 'student';
  const shouldLoad = Boolean(isAuthenticated && isStudent && user?.id);

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useGetStudentDashboardQuery(undefined, {
    skip: !shouldLoad,
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
  } else if (dashboardLoading || profileLoading) {
    status = 'loading';
  } else if (!dashboard || !profile || dashboardError || profileError) {
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
  if (shared.status === 'auth-loading' || shared.status === 'loading') {
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
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search courses, sessions, articles...',
  displayName,
  displayLevel,
  initials,
  avatarUrl,
  goalProgress,
  unreadCount,
  children,
}: StudentSpaceShellProps) {
  return (
    <div
      className="min-h-screen bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100"
      style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
    >
      <div className="flex min-h-screen overflow-hidden">
        <aside className="hidden w-72 shrink-0 border-r border-[#1152d4]/10 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 p-6">
            <div className="rounded-2xl bg-[#1152d4] p-2 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#1152d4]">EduFlow</h2>
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
                      ? 'bg-[#1152d4] text-white'
                      : 'text-slate-600 hover:bg-[#1152d4]/10 hover:text-[#1152d4] dark:text-slate-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}

            <div className="px-4 pt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
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
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors ${
                    active
                      ? 'bg-[#1152d4] text-white'
                      : 'text-slate-600 hover:bg-[#1152d4]/10 hover:text-[#1152d4] dark:text-slate-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4">
            <div className="rounded-[24px] border border-[#1152d4]/10 bg-[#1152d4]/5 p-4">
              <div className="mb-3 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-[#1152d4]/10 text-[#1152d4]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold">{displayName}</p>
                  <p className="text-[10px] font-semibold uppercase text-slate-500">
                    {displayLevel}
                  </p>
                </div>
              </div>
              <Button
                className="w-full rounded-xl bg-[#1152d4] text-xs font-bold text-white hover:bg-[#0f47b9]"
                onClick={() => onNavigate('/profile/public')}
              >
                View public profile
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-20 border-b border-[#1152d4]/5 bg-[#f6f6f8]/85 px-4 py-4 backdrop-blur-md dark:bg-[#101622]/85 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  className="h-11 w-full rounded-2xl border-none bg-white pl-10 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-[#1152d4]/20 dark:bg-slate-800"
                  placeholder={searchPlaceholder}
                  type="text"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="relative rounded-2xl bg-white dark:bg-slate-800"
                  onClick={() => onNavigate('/notifications')}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 ? (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                  ) : null}
                </Button>
                <div className="hidden h-8 w-px bg-[#1152d4]/10 sm:block" />
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-bold">Today's Goal</p>
                  <p className="text-[10px] font-bold text-[#1152d4]">{goalProgress}% Complete</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/profile')}
                  className="rounded-full"
                >
                  <Avatar className="h-10 w-10 border-2 border-[#1152d4]/20">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="bg-[#1152d4]/10 text-[#1152d4]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
