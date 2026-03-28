import {
  TeacherSpaceShell,
  TeacherSpaceStatus,
} from '../teacher/TeacherSpaceShared';
import { TeacherDashboardContent } from './teacher-dashboard/TeacherDashboardContent';
import { useTeacherDashboardData } from './teacher-dashboard/useTeacherDashboardData';

interface TeacherDashboardProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

export function TeacherDashboard({ onNavigate, currentPath }: TeacherDashboardProps) {
  const model = useTeacherDashboardData(onNavigate);
  const { shared, data, searchQuery, setSearchQuery } = model;

  if (shared.status !== 'ready') {
    return <TeacherSpaceStatus shared={shared} />;
  }

  return (
    <TeacherSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search student records or courses..."
      showSearch
      headerTitle="Dashboard Overview"
      displayName={shared.displayName}
      displayRole={shared.displayRole}
      initials={shared.initials}
      avatarUrl={shared.avatarUrl}
      activeCourseCount={data?.stats.totalCourses ?? shared.activeCourseCount}
      liveSessions={data?.stats.liveSessions ?? shared.liveSessions}
      unreadCount={shared.unreadCount}
    >
      <TeacherDashboardContent model={model} onNavigate={onNavigate} />
    </TeacherSpaceShell>
  );
}
