import {
  AdminSpaceShell,
  AdminSpaceStatus,
} from '../admin/AdminSpaceShared';
import { AdminDashboardContent } from './admin-dashboard/AdminDashboardContent';
import { useAdminDashboardData } from './admin-dashboard/useAdminDashboardData';

interface AdminDashboardProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

export function AdminDashboard({ onNavigate, currentPath }: AdminDashboardProps) {
  const model = useAdminDashboardData();
  const { shared, data, searchQuery, setSearchQuery } = model;

  if (shared.status !== 'ready') {
    return <AdminSpaceStatus shared={shared} />;
  }

  return (
    <AdminSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search courses, users, or reports..."
      displayName={shared.displayName}
      displayRole={shared.displayRole}
      initials={shared.initials}
      avatarUrl={shared.avatarUrl}
      unreadCount={shared.unreadCount}
    >
      <AdminDashboardContent model={model} onNavigate={onNavigate} />
    </AdminSpaceShell>
  );
}
