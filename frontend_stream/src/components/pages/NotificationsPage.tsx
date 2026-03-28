import {
  AdminSpaceShell,
  AdminSpaceStatus,
} from '../admin/AdminSpaceShared';
import {
  StudentSpaceShell,
  StudentSpaceStatus,
} from '../student/StudentSpaceShared';
import {
  TeacherSpaceShell,
  TeacherSpaceStatus,
} from '../teacher/TeacherSpaceShared';
import { NotificationsPageAuthRequired } from './notifications-page/components/NotificationsPageAuthRequired';
import { NotificationsPageBody } from './notifications-page/components/NotificationsPageBody';
import { NotificationsPageFallback } from './notifications-page/components/NotificationsPageFallback';
import type { NotificationsPageProps } from './notifications-page/notificationsPage.types';
import { useNotificationsPageData } from './notifications-page/useNotificationsPageData';

export function NotificationsPage({
  onNavigate,
  currentPath,
}: NotificationsPageProps) {
  const model = useNotificationsPageData();

  if (!model.isAuthenticated) {
    return <NotificationsPageAuthRequired />;
  }

  const body = <NotificationsPageBody model={model} />;

  if (model.role === 'student') {
    if (model.studentShared.status !== 'ready') {
      return <StudentSpaceStatus shared={model.studentShared} />;
    }

    return (
      <StudentSpaceShell
        currentPath={currentPath}
        onNavigate={onNavigate}
        searchQuery={model.searchQuery}
        onSearchChange={model.setSearchQuery}
        searchPlaceholder="Search notifications..."
        displayName={model.studentShared.displayName}
        displayLevel={model.studentShared.displayLevel}
        initials={model.studentShared.initials}
        avatarUrl={model.studentShared.avatarUrl}
        goalProgress={model.studentShared.goalProgress}
        unreadCount={model.studentShared.unreadCount}
      >
        {body}
      </StudentSpaceShell>
    );
  }

  if (model.role === 'teacher') {
    if (model.teacherShared.status !== 'ready') {
      return <TeacherSpaceStatus shared={model.teacherShared} />;
    }

    return (
      <TeacherSpaceShell
        currentPath={currentPath}
        onNavigate={onNavigate}
        searchQuery={model.searchQuery}
        onSearchChange={model.setSearchQuery}
        searchPlaceholder="Search notifications..."
        displayName={model.teacherShared.displayName}
        displayRole={model.teacherShared.displayRole}
        initials={model.teacherShared.initials}
        avatarUrl={model.teacherShared.avatarUrl}
        activeCourseCount={model.teacherShared.activeCourseCount}
        liveSessions={model.teacherShared.liveSessions}
        unreadCount={model.teacherShared.unreadCount}
      >
        {body}
      </TeacherSpaceShell>
    );
  }

  if (model.role === 'admin') {
    if (model.adminShared.status !== 'ready') {
      return <AdminSpaceStatus shared={model.adminShared} />;
    }

    return (
      <AdminSpaceShell
        currentPath={currentPath}
        onNavigate={onNavigate}
        searchQuery={model.searchQuery}
        onSearchChange={model.setSearchQuery}
        searchPlaceholder="Search notifications..."
        displayName={model.adminShared.displayName}
        displayRole={model.adminShared.displayRole}
        initials={model.adminShared.initials}
        avatarUrl={model.adminShared.avatarUrl}
        unreadCount={model.adminShared.unreadCount}
      >
        {body}
      </AdminSpaceShell>
    );
  }

  return <NotificationsPageFallback model={model} />;
}
