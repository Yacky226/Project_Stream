import {
  StudentSpaceShell,
  StudentSpaceStatus,
  useStudentSpaceData,
} from '../student/StudentSpaceShared';
import { StudentLiveSessionsPageContent } from './student-live-sessions-page/components/StudentLiveSessionsPageContent';
import type { StudentLiveSessionsPageProps } from './student-live-sessions-page/studentLiveSessions.types';
import { useStudentLiveSessionsData } from './student-live-sessions-page/useStudentLiveSessionsData';

export function StudentLiveSessionsPage({
  onNavigate,
  currentPath,
}: StudentLiveSessionsPageProps) {
  const shared = useStudentSpaceData();
  const ready = shared.status === 'ready' && shared.dashboard;
  const pageData = useStudentLiveSessionsData({
    shouldFetch: Boolean(ready),
    enrolledCourses: ready ? shared.dashboard.courses : [],
  });

  if (!ready) {
    return <StudentSpaceStatus shared={shared} />;
  }

  return (
    <StudentSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={pageData.searchQuery}
      onSearchChange={pageData.setSearchQuery}
      searchPlaceholder="Search your live sessions..."
      displayName={shared.displayName}
      displayLevel={shared.displayLevel}
      initials={shared.initials}
      avatarUrl={shared.avatarUrl}
      goalProgress={shared.goalProgress}
      unreadCount={shared.unreadCount}
    >
      <StudentLiveSessionsPageContent data={pageData} onNavigate={onNavigate} />
    </StudentSpaceShell>
  );
}
