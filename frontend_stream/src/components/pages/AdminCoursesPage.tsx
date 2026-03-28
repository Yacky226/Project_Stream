import {
  AdminSpaceShell,
  AdminSpaceStatus,
} from '../admin/AdminSpaceShared';
import { AdminCoursesContent } from './admin-courses-page/components/AdminCoursesContent';
import type { AdminCoursesPageProps } from './admin-courses-page/adminCourses.types';
import { useAdminCoursesData } from './admin-courses-page/useAdminCoursesData';

export function AdminCoursesPage({ onNavigate, currentPath }: AdminCoursesPageProps) {
  const model = useAdminCoursesData();

  if (model.shared.status !== 'ready') {
    return <AdminSpaceStatus shared={model.shared} />;
  }

  return (
    <AdminSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={model.searchQuery}
      onSearchChange={model.setSearchQuery}
      searchPlaceholder="Search courses or instructors..."
      displayName={model.shared.displayName}
      displayRole={model.shared.displayRole}
      initials={model.shared.initials}
      avatarUrl={model.shared.avatarUrl}
      unreadCount={model.shared.unreadCount}
    >
      <AdminCoursesContent model={model} onNavigate={onNavigate} />
    </AdminSpaceShell>
  );
}
