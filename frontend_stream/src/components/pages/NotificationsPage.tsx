import { useMemo, useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  RefreshCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useResolvedTheme } from '../../hooks/useResolvedTheme';
import { normalizeUserRole } from '../../lib/roleUtils';
import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '../../store/api/userApi';
import {
  AdminSpaceShell,
  AdminSpaceStatus,
  useAdminSpaceData,
} from '../admin/AdminSpaceShared';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import {
  StudentSpaceShell,
  StudentSpaceStatus,
  formatStudentRelativeDate,
  getStudentSpaceErrorMessage,
  useStudentSpaceData,
} from '../student/StudentSpaceShared';
import {
  TeacherSpaceShell,
  TeacherSpaceStatus,
  useTeacherSpaceData,
} from '../teacher/TeacherSpaceShared';

interface NotificationsPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

type NotificationFilter = 'all' | 'unread' | 'read';

function matchesFilter(filter: NotificationFilter, read: boolean): boolean {
  if (filter === 'unread') {
    return !read;
  }

  if (filter === 'read') {
    return read;
  }

  return true;
}

function formatNotificationDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return formatStudentRelativeDate(date.toISOString());
}

export function NotificationsPage({
  onNavigate,
  currentPath,
}: NotificationsPageProps) {
  const { isAuthenticated, user } = useAuth();
  const { isDark } = useResolvedTheme();
  const studentShared = useStudentSpaceData({ includeDashboard: false });
  const teacherShared = useTeacherSpaceData({ includeDashboard: false });
  const adminShared = useAdminSpaceData({ includeDashboard: false });
  const role = normalizeUserRole(user?.role);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data,
    error,
    isLoading,
    refetch,
  } = useGetNotificationsQuery(
    { limit: 50 },
    { skip: !isAuthenticated },
  );
  const [markNotificationRead, { isLoading: isMarkingRead }] =
    useMarkNotificationReadMutation();
  const [markAllNotificationsRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();

  const notifications = data?.notifications || [];
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (!matchesFilter(filter, notification.read)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [notification.title, notification.message]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [filter, normalizedQuery, notifications]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const readCount = notifications.length - unreadCount;
  const surfaceClass = isDark
    ? 'border-[#1e293b] bg-[#0f172a]'
    : 'border-[#1152d4]/10 bg-white';
  const summaryClass = isDark
    ? 'border-[#203049] bg-[#101a2d]/90'
    : 'border-[#dbe6ff] bg-[#f8fbff]';
  const mutedTextClass = isDark ? 'text-[#94a3b8]' : 'text-[#64748b]';

  const handleMarkRead = async (notificationId: string) => {
    setActionError(null);
    try {
      await markNotificationRead({ notificationId }).unwrap();
    } catch (mutationError) {
      setActionError(
        getStudentSpaceErrorMessage(
          mutationError,
          'Impossible de marquer cette notification comme lue.',
        ),
      );
    }
  };

  const handleMarkAllRead = async () => {
    setActionError(null);
    try {
      await markAllNotificationsRead().unwrap();
    } catch (mutationError) {
      setActionError(
        getStudentSpaceErrorMessage(
          mutationError,
          'Impossible de marquer toutes les notifications comme lues.',
        ),
      );
    }
  };

  const handleDelete = async (notificationId: string) => {
    setActionError(null);
    try {
      await deleteNotification({ notificationId }).unwrap();
    } catch (mutationError) {
      setActionError(
        getStudentSpaceErrorMessage(
          mutationError,
          'Suppression impossible pour cette notification.',
        ),
      );
    }
  };

  const body = (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Notifications</h1>
          <p className={`mt-2 text-sm ${mutedTextClass}`}>
            Suivez vos alertes de plateforme, rappels et messages importants sans perdre le fil.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className={`rounded-2xl border px-4 py-3 ${summaryClass}`}>
            <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${mutedTextClass}`}>
              Unread
            </p>
            <p className="mt-1 text-2xl font-black text-[#1152d4]">{unreadCount}</p>
          </div>
          <div className={`rounded-2xl border px-4 py-3 ${summaryClass}`}>
            <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${mutedTextClass}`}>
              Read
            </p>
            <p className="mt-1 text-2xl font-black text-[#1152d4]">{readCount}</p>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={() => refetch()}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </section>

      {error || actionError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {actionError ||
              getStudentSpaceErrorMessage(
                error,
                'Impossible de charger votre centre de notifications.',
              )}
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {(['all', 'unread', 'read'] as NotificationFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === option
                  ? 'bg-[#1152d4] text-white'
                  : isDark
                    ? 'bg-[#162033] text-[#cbd5e1]'
                    : 'bg-white text-[#475569] shadow-sm'
              }`}
            >
              {option === 'all'
                ? 'Toutes'
                : option === 'unread'
                  ? 'Non lues'
                  : 'Lues'}
            </button>
          ))}
        </div>

        <Button
          className="rounded-2xl bg-[#1152d4] text-white hover:bg-[#0f47b9]"
          onClick={() => void handleMarkAllRead()}
          disabled={!unreadCount || isMarkingAll}
        >
          {isMarkingAll ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCheck className="mr-2 h-4 w-4" />
          )}
          Tout marquer comme lu
        </Button>
      </section>

      {!notifications.length && !isLoading ? (
        <div className={`rounded-[28px] border border-dashed p-8 text-sm ${surfaceClass} ${mutedTextClass}`}>
          Aucune notification pour le moment.
        </div>
      ) : null}

      <section className="space-y-4">
        {filteredNotifications.length ? (
          filteredNotifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-[28px] border p-5 shadow-sm transition ${surfaceClass}`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                        notification.read
                          ? isDark
                            ? 'bg-[#1f2937] text-[#cbd5e1]'
                            : 'bg-slate-100 text-slate-600'
                          : isDark
                            ? 'bg-[#1152d4]/20 text-[#8fb5ff]'
                            : 'bg-[#1152d4]/10 text-[#1152d4]'
                      }`}
                    >
                      {notification.read ? 'Read' : 'New'}
                    </span>
                    <span className={`text-xs ${mutedTextClass}`}>
                      {formatNotificationDate(notification.createdAt)}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold">{notification.title}</h2>
                  <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>
                    {notification.message}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2 lg:w-48 lg:justify-end">
                  {!notification.read ? (
                    <Button
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() => void handleMarkRead(notification.id)}
                      disabled={isMarkingRead}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Mark as read
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    className="rounded-2xl text-red-600 hover:text-red-600"
                    onClick={() => void handleDelete(notification.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))
        ) : notifications.length && !isLoading ? (
          <div className={`rounded-[28px] border border-dashed p-8 text-sm ${surfaceClass} ${mutedTextClass}`}>
            Aucun resultat pour cette recherche ou ce filtre.
          </div>
        ) : null}
      </section>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Alert variant="destructive">
          <AlertDescription>Connectez-vous pour consulter vos notifications.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (role === 'student') {
    if (studentShared.status !== 'ready') {
      return <StudentSpaceStatus shared={studentShared} />;
    }

    return (
      <StudentSpaceShell
        currentPath={currentPath}
        onNavigate={onNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search notifications..."
        displayName={studentShared.displayName}
        displayLevel={studentShared.displayLevel}
        initials={studentShared.initials}
        avatarUrl={studentShared.avatarUrl}
        goalProgress={studentShared.goalProgress}
        unreadCount={studentShared.unreadCount}
      >
        {body}
      </StudentSpaceShell>
    );
  }

  if (role === 'teacher') {
    if (teacherShared.status !== 'ready') {
      return <TeacherSpaceStatus shared={teacherShared} />;
    }

    return (
      <TeacherSpaceShell
        currentPath={currentPath}
        onNavigate={onNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search notifications..."
        displayName={teacherShared.displayName}
        displayRole={teacherShared.displayRole}
        initials={teacherShared.initials}
        avatarUrl={teacherShared.avatarUrl}
        activeCourseCount={teacherShared.activeCourseCount}
        liveSessions={teacherShared.liveSessions}
        unreadCount={teacherShared.unreadCount}
      >
        {body}
      </TeacherSpaceShell>
    );
  }

  if (role === 'admin') {
    if (adminShared.status !== 'ready') {
      return <AdminSpaceStatus shared={adminShared} />;
    }

    return (
      <AdminSpaceShell
        currentPath={currentPath}
        onNavigate={onNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search notifications..."
        displayName={adminShared.displayName}
        displayRole={adminShared.displayRole}
        initials={adminShared.initials}
        avatarUrl={adminShared.avatarUrl}
        unreadCount={adminShared.unreadCount}
      >
        {body}
      </AdminSpaceShell>
    );
  }

  return (
    <div
      className={`min-h-screen px-4 py-8 sm:px-6 lg:px-8 ${
        isDark ? 'bg-[#09111f] text-[#e2e8f0]' : 'bg-[#eef4ff] text-[#0f172a]'
      }`}
      style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Notifications</h1>
            <p className={`mt-2 text-sm ${mutedTextClass}`}>
              Votre centre de notifications est synchronise avec les endpoints backend.
            </p>
          </div>
          <div className="relative w-full max-w-md">
            <Search className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedTextClass}`} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className={`h-12 w-full rounded-2xl border pl-11 pr-4 text-sm shadow-sm transition focus:border-[#1152d4] focus:outline-none focus:ring-4 focus:ring-[#1152d4]/15 ${
                isDark
                  ? 'border-[#334155] bg-[#162033] text-[#e2e8f0] placeholder:text-[#7f8ea3]'
                  : 'border-[#dbe6ff] bg-white text-[#0f172a] placeholder:text-[#94a3b8]'
              }`}
              placeholder="Search notifications..."
              type="text"
            />
          </div>
        </div>
        {body}
      </div>
    </div>
  );
}
