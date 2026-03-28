import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  TeacherSpaceShell,
  TeacherSpaceStatus,
} from '../teacher/TeacherSpaceShared';
import { TeacherLiveSessionsContent } from './teacher-live-sessions/TeacherLiveSessionsContent';
import { useTeacherLiveSessionsData } from './teacher-live-sessions/useTeacherLiveSessionsData';

interface TeacherLiveSessionsPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

export function TeacherLiveSessionsPage({
  onNavigate,
  currentPath,
}: TeacherLiveSessionsPageProps) {
  const model = useTeacherLiveSessionsData();
  const {
    shared,
    activeLiveSession,
    redirectTarget,
  } = model;

  useEffect(() => {
    if (shared.status !== 'ready' || !redirectTarget) return;
    if (currentPath !== redirectTarget) {
      onNavigate(redirectTarget);
    }
  }, [currentPath, onNavigate, redirectTarget, shared.status]);

  if (shared.status !== 'ready') {
    return <TeacherSpaceStatus shared={shared} />;
  }

  if (activeLiveSession) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          Ouverture du studio live...
        </div>
      </div>
    );
  }

  return (
    <TeacherSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      showSearch={false}
      showHeader={false}
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
      <TeacherLiveSessionsContent model={model} onNavigate={onNavigate} />
    </TeacherSpaceShell>
  );
}
