import { useMemo, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useResolvedTheme } from '../../../hooks/useResolvedTheme';
import { normalizeUserRole } from '../../../lib/roleUtils';
import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '../../../store/api/userApi';
import { useAdminSpaceData } from '../../admin/AdminSpaceShared';
import {
  getStudentSpaceErrorMessage,
  useStudentSpaceData,
} from '../../student/StudentSpaceShared';
import { useTeacherSpaceData } from '../../teacher/TeacherSpaceShared';
import type {
  NotificationFilter,
  NotificationsPageDataModel,
} from './notificationsPage.types';
import { matchesNotificationFilter } from './notificationsPage.utils';

export function useNotificationsPageData(): NotificationsPageDataModel {
  const { isAuthenticated, user } = useAuth();
  const { isDark } = useResolvedTheme();
  const studentShared = useStudentSpaceData({ includeDashboard: false });
  const teacherShared = useTeacherSpaceData({ includeDashboard: false });
  const adminShared = useAdminSpaceData({ includeDashboard: false });
  const role = normalizeUserRole(user?.role);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, error, isLoading, refetch } = useGetNotificationsQuery(
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
      if (!matchesNotificationFilter(filter, notification.read)) {
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

  const errorMessage = actionError
    || (error
      ? getStudentSpaceErrorMessage(
        error,
        'Impossible de charger votre centre de notifications.',
      )
      : null);

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

  const refresh = () => {
    void refetch();
  };

  return {
    adminShared,
    errorMessage,
    filter,
    filteredNotifications,
    handleDelete,
    handleMarkAllRead,
    handleMarkRead,
    isAuthenticated,
    isDark,
    isDeleting,
    isLoading,
    isMarkingAll,
    isMarkingRead,
    mutedTextClass,
    notifications,
    readCount,
    refresh,
    role,
    searchQuery,
    setFilter,
    setSearchQuery,
    studentShared,
    summaryClass,
    surfaceClass,
    teacherShared,
    unreadCount,
  };
}
