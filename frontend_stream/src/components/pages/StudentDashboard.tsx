import {
  StudentSpaceShell,
  StudentSpaceStatus,
} from '../student/StudentSpaceShared';
import { StudentDashboardContent } from './student-dashboard/StudentDashboardContent';
import { useStudentDashboardData } from './student-dashboard/useStudentDashboardData';
import './StudentDashboard.css';

interface StudentDashboardProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

export function StudentDashboard({ onNavigate, currentPath }: StudentDashboardProps) {
  const model = useStudentDashboardData();
  const { shared, ready, dashboard, searchQuery, setSearchQuery } = model;

  if (!ready || !dashboard) {
    return <StudentSpaceStatus shared={shared} />;
  }

  return (
    <StudentSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search courses, instructors, lessons..."
      displayName={shared.displayName}
      displayLevel={shared.displayLevel}
      initials={shared.initials}
      avatarUrl={shared.avatarUrl}
      goalProgress={shared.goalProgress}
      unreadCount={shared.unreadCount}
    >
      <StudentDashboardContent model={model} onNavigate={onNavigate} />
    </StudentSpaceShell>
  );
}
