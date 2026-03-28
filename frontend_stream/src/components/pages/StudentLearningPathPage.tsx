import {
  StudentSpaceShell,
  StudentSpaceStatus,
} from '../student/StudentSpaceShared';
import { LearningPathEmptyState } from './student-learning-path-page/components/LearningPathEmptyState';
import { StudentLearningPathContent } from './student-learning-path-page/components/StudentLearningPathContent';
import type { StudentLearningPathPageProps } from './student-learning-path-page/studentLearningPath.types';
import { useStudentLearningPathData } from './student-learning-path-page/useStudentLearningPathData';
import './StudentLearningPathPage.css';

export function StudentLearningPathPage({
  onNavigate,
  currentPath,
}: StudentLearningPathPageProps) {
  const model = useStudentLearningPathData();

  if (!model.ready || !model.dashboard) {
    return <StudentSpaceStatus shared={model.shared} />;
  }

  return (
    <StudentSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={model.searchQuery}
      onSearchChange={(value) => model.setSearchQuery(value)}
      searchPlaceholder="Search your learning path..."
      displayName={model.shared.displayName}
      displayLevel={model.shared.displayLevel}
      initials={model.shared.initials}
      avatarUrl={model.shared.avatarUrl}
      goalProgress={model.shared.goalProgress}
      unreadCount={model.shared.unreadCount}
    >
      {!model.course ? (
        <LearningPathEmptyState onNavigate={onNavigate} />
      ) : (
        <StudentLearningPathContent model={model} onNavigate={onNavigate} />
      )}
    </StudentSpaceShell>
  );
}
