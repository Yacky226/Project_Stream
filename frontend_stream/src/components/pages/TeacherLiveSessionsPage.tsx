import { useEffect, useMemo } from 'react';
import { AlertCircle, CalendarPlus, Loader2, Radio, RefreshCcw } from 'lucide-react';
import { useGetTeacherSessionsQuery } from '../../store/api/liveApi';
import { SimpleLiveManager } from '../live/SimpleLiveComponents';
import {
  TeacherSpaceShell,
  TeacherSpaceStatus,
  useTeacherSpaceData,
} from '../teacher/TeacherSpaceShared';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';

interface TeacherLiveSessionsPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

function buildTeacherStudioPath(courseId: string | number, sessionId: string | number) {
  return `/teacher/live/${courseId}/${sessionId}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== 'object') return fallback;
  const payload = error as {
    data?: { message?: string; error?: string };
    error?: string;
    message?: string;
  };
  return payload.data?.message || payload.data?.error || payload.error || payload.message || fallback;
}

export function TeacherLiveSessionsPage({
  onNavigate,
  currentPath,
}: TeacherLiveSessionsPageProps) {
  const shared = useTeacherSpaceData({ includeDashboard: true });
  const {
    data: sessions = [],
    isLoading: isLoadingSessions,
    error: sessionsError,
    refetch,
  } = useGetTeacherSessionsQuery(undefined, {
    skip: shared.status !== 'ready',
  });

  const activeLiveSession = useMemo(
    () => sessions.find((session) => session.isLive || session.status === 'LIVE') || null,
    [sessions],
  );

  useEffect(() => {
    if (shared.status !== 'ready' || !activeLiveSession) return;
    const targetPath = buildTeacherStudioPath(activeLiveSession.courseId, activeLiveSession.id);
    if (currentPath !== targetPath) {
      onNavigate(targetPath);
    }
  }, [activeLiveSession, currentPath, onNavigate, shared.status]);

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
      {sessionsError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {getErrorMessage(
              sessionsError,
              'Impossible de charger les sessions live. Verifiez la connexion backend.',
            )}
          </AlertDescription>
        </Alert>
      ) : null}
      {isLoadingSessions ? (
        <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement des sessions...
        </div>
      ) : null}

      {!isLoadingSessions && !sessionsError && !sessions.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <Radio className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Aucun live en cours</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            Vous n&apos;avez pas encore lance de session live. Creez votre premier live pour demarrer la diffusion.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => onNavigate('/teacher/live-session-builder')}
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Creer un live
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100"
              onClick={() => onNavigate('/teacher/my-courses')}
            >
              Voir mes cours
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl text-slate-600 hover:bg-slate-100"
              onClick={() => refetch()}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Recharger
            </Button>
          </div>
        </div>
      ) : null}

      {!isLoadingSessions && !sessionsError && sessions.length > 0 ? (
        <>
          <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
            <Radio className="h-4 w-4" />
            Aucun live actif pour le moment. Lancez une session depuis la liste ci-dessous.
          </div>
          <SimpleLiveManager
            courseId="all"
            onNavigate={onNavigate}
            embedded
          />
        </>
      ) : null}
    </TeacherSpaceShell>
  );
}
