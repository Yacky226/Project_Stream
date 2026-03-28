import {
  StudentSpaceShell,
  StudentSpaceStatus,
} from '../student/StudentSpaceShared';
import { StudentCommunityContent } from './student-community-page/components/StudentCommunityContent';
import type { StudentCommunityPageProps } from './student-community-page/studentCommunity.types';
import { useStudentCommunityData } from './student-community-page/useStudentCommunityData';

export function StudentCommunityPage({
  onNavigate,
  currentPath,
}: StudentCommunityPageProps) {
  const model = useStudentCommunityData();

  if (!model.ready) {
    return <StudentSpaceStatus shared={model.shared} />;
  }

  return (
    <StudentSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={model.searchQuery}
      onSearchChange={model.setSearchQuery}
      searchPlaceholder="Search articles, tags, mentors..."
      displayName={model.shared.displayName}
      displayLevel={model.shared.displayLevel}
      initials={model.shared.initials}
      avatarUrl={model.shared.avatarUrl}
      goalProgress={model.shared.goalProgress}
      unreadCount={model.shared.unreadCount}
    >
      <StudentCommunityContent model={model} onNavigate={onNavigate} />
    </StudentSpaceShell>
  );
}
