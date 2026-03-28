import type { AdminSpaceData } from '../../admin/AdminSpaceShared';
import type { NormalizedRole } from '../../../lib/roleUtils';
import type { Notification } from '../../../types/notifications';
import type { StudentSpaceData } from '../../student/StudentSpaceShared';
import type { TeacherSpaceData } from '../../teacher/TeacherSpaceShared';

export interface NotificationsPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

export type NotificationFilter = 'all' | 'unread' | 'read';

export interface NotificationsPageDataModel {
  role: NormalizedRole;
  isAuthenticated: boolean;
  isDark: boolean;
  studentShared: StudentSpaceData;
  teacherShared: TeacherSpaceData;
  adminShared: AdminSpaceData;
  searchQuery: string;
  filter: NotificationFilter;
  notifications: Notification[];
  filteredNotifications: Notification[];
  unreadCount: number;
  readCount: number;
  isLoading: boolean;
  isMarkingRead: boolean;
  isMarkingAll: boolean;
  isDeleting: boolean;
  errorMessage: string | null;
  surfaceClass: string;
  summaryClass: string;
  mutedTextClass: string;
  setSearchQuery: (value: string) => void;
  setFilter: (value: NotificationFilter) => void;
  refresh: () => void;
  handleMarkRead: (notificationId: string) => Promise<void>;
  handleMarkAllRead: () => Promise<void>;
  handleDelete: (notificationId: string) => Promise<void>;
}
