import { TeacherSpaceShell, TeacherSpaceStatus } from '../teacher/TeacherSpaceShared';
import { TeacherCoursesContent } from './teacher-courses/TeacherCoursesContent';
import { useTeacherCoursesData } from './teacher-courses/useTeacherCoursesData';

interface TeacherCoursesPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

export function TeacherCoursesPage({ onNavigate, currentPath }: TeacherCoursesPageProps) {
  const model = useTeacherCoursesData();
  const { shared, data } = model;

  if (shared.status !== 'ready') {
    return <TeacherSpaceStatus shared={shared} />;
  }

  return (
    <TeacherSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      showSearch={false}
      showHeader={false}
      headerTitle="My Courses"
      displayName={shared.displayName}
      displayRole={shared.displayRole}
      initials={shared.initials}
      avatarUrl={shared.avatarUrl}
      activeCourseCount={data?.stats.totalCourses ?? shared.activeCourseCount}
      liveSessions={data?.stats.liveSessions ?? shared.liveSessions}
      unreadCount={shared.unreadCount}
    >
      <TeacherCoursesContent model={model} onNavigate={onNavigate} />
    </TeacherSpaceShell>
  );
}
