import {
  StudentSpaceShell,
  StudentSpaceStatus,
} from '../student/StudentSpaceShared';
import { StudentCoursesContent } from './student-courses-page/components/StudentCoursesContent';
import type { StudentCoursesPageProps } from './student-courses-page/studentCourses.types';
import { useStudentCoursesData } from './student-courses-page/useStudentCoursesData';
import './StudentCoursesPage.css';

export function StudentCoursesPage({ onNavigate, currentPath }: StudentCoursesPageProps) {
  const model = useStudentCoursesData();

  if (!model.ready) {
    return <StudentSpaceStatus shared={model.shared} />;
  }

  return (
    <StudentSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={model.searchQuery}
      onSearchChange={model.setSearchQuery}
      searchPlaceholder="Search in your courses..."
      displayName={model.shared.displayName}
      displayLevel={model.shared.displayLevel}
      initials={model.shared.initials}
      avatarUrl={model.shared.avatarUrl}
      goalProgress={model.shared.goalProgress}
      unreadCount={model.shared.unreadCount}
    >
      <StudentCoursesContent model={model} onNavigate={onNavigate} />
    </StudentSpaceShell>
  );
}
