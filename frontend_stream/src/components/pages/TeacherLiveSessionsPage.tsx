import { SimpleLiveManager } from '../live/SimpleLiveComponents';
import {
  TeacherSpaceShell,
  TeacherSpaceStatus,
  useTeacherSpaceData,
} from '../teacher/TeacherSpaceShared';

interface TeacherLiveSessionsPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

export function TeacherLiveSessionsPage({
  onNavigate,
  currentPath,
}: TeacherLiveSessionsPageProps) {
  const shared = useTeacherSpaceData({ includeDashboard: true });

  if (shared.status !== 'ready') {
    return <TeacherSpaceStatus shared={shared} />;
  }

  return (
    <TeacherSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      showSearch={false}
      headerTitle="Live Sessions"
      headerDescription="Organisez vos diffusions, lancez le studio et gardez vos replays et programmations dans un meme espace enseignant."
      displayName={shared.displayName}
      displayRole={shared.displayRole}
      initials={shared.initials}
      avatarUrl={shared.avatarUrl}
      activeCourseCount={shared.activeCourseCount}
      liveSessions={shared.liveSessions}
      unreadCount={shared.unreadCount}
    >
      <SimpleLiveManager courseId="all" onNavigate={(path) => onNavigate(path)} embedded />
    </TeacherSpaceShell>
  );
}
