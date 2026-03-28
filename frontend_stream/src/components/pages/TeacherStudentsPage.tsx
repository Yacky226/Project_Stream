import {
  TeacherSpaceShell,
  TeacherSpaceStatus,
  useTeacherSpaceData,
} from '../teacher/TeacherSpaceShared';
import { TeacherStudentsPageContent } from './teacher-students-page/components/TeacherStudentsPageContent';
import type { TeacherStudentsPageProps } from './teacher-students-page/teacherStudents.types';
import { useTeacherStudentsPageData } from './teacher-students-page/useTeacherStudentsPageData';

export function TeacherStudentsPage({ onNavigate, currentPath }: TeacherStudentsPageProps) {
  const shared = useTeacherSpaceData({ includeDashboard: false });
  const pageData = useTeacherStudentsPageData({ shouldFetch: shared.status === 'ready' });

  if (shared.status !== 'ready') {
    return <TeacherSpaceStatus shared={shared} />;
  }

  return (
    <TeacherSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      showSearch={false}
      showHeader={false}
      headerTitle="Students"
      displayName={shared.displayName}
      displayRole={shared.displayRole}
      initials={shared.initials}
      avatarUrl={shared.avatarUrl}
      activeCourseCount={shared.activeCourseCount}
      liveSessions={shared.liveSessions}
      unreadCount={shared.unreadCount}
    >
      <TeacherStudentsPageContent data={pageData} />
    </TeacherSpaceShell>
  );
}
