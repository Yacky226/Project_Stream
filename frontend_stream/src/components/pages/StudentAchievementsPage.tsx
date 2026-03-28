import {
  StudentSpaceShell,
  StudentSpaceStatus,
} from '../student/StudentSpaceShared';
import { StudentAchievementsContent } from './student-achievements-page/components/StudentAchievementsContent';
import type { StudentAchievementsPageProps } from './student-achievements-page/studentAchievements.types';
import { useStudentAchievementsData } from './student-achievements-page/useStudentAchievementsData';
import './StudentAchievementsPage.css';

export function StudentAchievementsPage({
  onNavigate,
  currentPath,
}: StudentAchievementsPageProps) {
  const model = useStudentAchievementsData();

  if (model.shared.status !== 'ready' || !model.dashboard) {
    return <StudentSpaceStatus shared={model.shared} />;
  }

  return (
    <StudentSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={model.searchQuery}
      onSearchChange={(value) => model.setSearchQuery(value)}
      searchPlaceholder="Search badges, trophies, milestones..."
      displayName={model.shared.displayName}
      displayLevel={model.shared.displayLevel}
      initials={model.shared.initials}
      avatarUrl={model.shared.avatarUrl}
      goalProgress={model.shared.goalProgress}
      unreadCount={model.shared.unreadCount}
    >
      <StudentAchievementsContent model={model} onNavigate={onNavigate} />
    </StudentSpaceShell>
  );
}
