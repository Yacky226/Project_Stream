import { formatStudentRelativeDate } from '../../student/StudentSpaceShared';
import type { NotificationFilter } from './notificationsPage.types';

export const notificationFilters: NotificationFilter[] = ['all', 'unread', 'read'];

export function matchesNotificationFilter(filter: NotificationFilter, read: boolean): boolean {
  if (filter === 'unread') {
    return !read;
  }

  if (filter === 'read') {
    return read;
  }

  return true;
}

export function getNotificationFilterLabel(filter: NotificationFilter): string {
  if (filter === 'all') {
    return 'Toutes';
  }

  if (filter === 'unread') {
    return 'Non lues';
  }

  return 'Lues';
}

export function formatNotificationDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return formatStudentRelativeDate(date.toISOString());
}
