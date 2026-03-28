import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, CircleOff, Loader2, Tv, Users } from 'lucide-react';
import { useAppSelector } from '../../../hooks/redux';
import { normalizeUserRole } from '../../../lib/roleUtils';
import { useGetCourseDetailsQuery, useGetSessionStreamUrlQuery, useJoinSessionMutation } from '../../../store/api/liveApi';
import { Alert, AlertDescription } from '../../ui/alert';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import type { BaseLiveProps } from '../live.types';
import { getErrorMessage } from '../liveModule.utils';
import { parseNumericId } from '../liveSession.utils';
import { LiveViewerChatDock } from '../components/LiveViewerChatDock';
import { LiveViewerTopicCard, SessionFooterPeek } from '../components/LiveViewerTopic';
import { SessionVideoCard } from '../components/SessionVideoCard';
import { UserGuard } from '../components/UserGuard';
import { useResolvedSession } from '../hooks/useResolvedSession';
export function SimpleLiveViewer({ courseId, sessionId, onNavigate }: BaseLiveProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isStudent = normalizeUserRole(user?.role) === 'student';
  const { session, isLoading, error: resolveError } = useResolvedSession({
    courseId,
    sessionId,
    isAuthenticated,
  });
  const canUseLivePlayer = Boolean(session && (session.isLive || session.status === 'LIVE'));
  const { data: courseDetails, isLoading: isLoadingCourseAccess } = useGetCourseDetailsQuery(
    {
      courseId,
      studentId: isStudent ? user?.id || undefined : undefined,
    },
    {
      skip: !isAuthenticated || !isStudent || !parseNumericId(courseId),
    },
  );
  const studentHasCourseAccess = !isStudent || Boolean(courseDetails?.isEnrolled);
  const { data: streamUrl, refetch: refetchStreamUrl } = useGetSessionStreamUrlQuery(session?.id || '', {
    skip: !isAuthenticated || !session || !studentHasCourseAccess || !canUseLivePlayer,
    refetchOnMountOrArgChange: true,
  });
  const [joinSession, { isLoading: isJoining }] = useJoinSessionMutation();
  const [joinError, setJoinError] = useState<string | null>(null);
  const joinedForSessionRef = useRef<string | null>(null);

  useEffect(() => {
    const join = async () => {
      if (!session || !isStudent || !isAuthenticated) {
        return;
      }
      if (!studentHasCourseAccess) {
        return;
      }
      if (!session.isLive && session.status !== 'LIVE') {
        return;
      }
      if (joinedForSessionRef.current === session.id) {
        return;
      }

      try {
        await joinSession(session.id).unwrap();
        joinedForSessionRef.current = session.id;
        setJoinError(null);
      } catch (error) {
        setJoinError(getErrorMessage(error, 'Impossible de rejoindre la session'));
      }
    };

    void join();
  }, [session, isStudent, isAuthenticated, joinSession, studentHasCourseAccess]);

  if (!isAuthenticated) {
    return (
      <UserGuard
        allowed={false}
        message="Connectez-vous pour acceder aux sessions live."
        onNavigate={onNavigate}
      />
    );
  }

  const sessionTitle =
    session?.metadata?.title?.trim() || courseDetails?.title?.trim() || `Session #${session?.id ?? ''}`;
  const sessionDescription =
    session?.metadata?.description?.trim()
    || 'Posez vos questions en direct et collaborez avec la classe pendant la diffusion.';
  const isSessionLive = Boolean(session && (session.isLive || session.status === 'LIVE'));
  const enrolledCount = Math.max(0, Number(courseDetails?.enrolledCount || 0));
  const instructorName = courseDetails?.teacherName || 'Lead Instructor';
  const instructorRole = courseDetails?.teacherSpeciality || 'Live Instructor';

  return (
    <div className="simple-live-viewer-page h-[calc(100vh-4rem)] overflow-hidden bg-[#f6f6f8]">
      <div className="flex h-full flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/85 px-4 backdrop-blur md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1152d4]/10 text-[#1152d4]">
              <Tv className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900 md:text-lg">{sessionTitle}</h1>
              <div className="mt-0.5 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isSessionLive ? 'animate-pulse bg-red-500' : 'bg-slate-300'}`} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Live Q&A Session
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 md:flex">
              <Users className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">
                {enrolledCount.toLocaleString('fr-FR')} attending
              </span>
            </div>
            {isJoining ? (
              <Badge variant="outline">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Connexion...
              </Badge>
            ) : null}
            <Button
              size="sm"
              className="rounded-xl bg-[#1152d4] px-4 text-white hover:bg-[#0f47b9]"
              onClick={() => onNavigate(`/courses/${courseId}`)}
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Leave Session
            </Button>
          </div>
        </header>

        <main className="simple-live-viewer-workspace">
          <section className="simple-live-viewer-main">
            {isStudent && !isLoadingCourseAccess && !studentHasCourseAccess ? (
              <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="space-y-2">
                  <p>Vous devez etre inscrit a ce cours avant de rejoindre le live.</p>
                  <Button size="sm" variant="outline" onClick={() => onNavigate(`/courses/${courseId}`)}>
                    Voir le cours
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}

            {joinError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="space-y-2">
                  <p>{joinError}</p>
                  {isStudent ? (
                    <Button size="sm" variant="outline" onClick={() => onNavigate(`/courses/${courseId}`)}>
                      S inscrire au cours
                    </Button>
                  ) : null}
                </AlertDescription>
              </Alert>
            ) : null}

            {resolveError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {getErrorMessage(resolveError, 'Impossible de charger la session')}
                </AlertDescription>
              </Alert>
            ) : null}

            {isLoading || isLoadingCourseAccess ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement du live...
              </div>
            ) : !session ? (
              <Card>
                <CardContent className="space-y-3 p-6 text-center">
                  <CircleOff className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p>Aucune session active pour ce cours.</p>
                  <Button variant="outline" onClick={() => onNavigate('/live-sessions')}>
                    Voir toutes les sessions
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {studentHasCourseAccess ? (
                  <SessionVideoCard
                    session={session}
                    streamUrl={streamUrl}
                    variant="stage"
                    instructorName={instructorName}
                    instructorRole={instructorRole}
                    onRefreshAccessUrl={
                      studentHasCourseAccess && canUseLivePlayer ? () => refetchStreamUrl() : undefined
                    }
                  />
                ) : (
                  <Card className="overflow-hidden border-amber-300 bg-amber-50 text-amber-950 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100">
                    <CardContent className="flex min-h-[360px] flex-col items-center justify-center gap-4 p-8 text-center">
                      <CircleOff className="h-12 w-12 text-amber-500" />
                      <div className="space-y-2">
                        <h2 className="text-xl font-semibold">Acces reserve aux inscrits</h2>
                        <p className="max-w-md text-sm text-amber-900/80 dark:text-amber-100/80">
                          Le live est pret, mais l acces au flux et aux interactions est disponible
                          uniquement apres inscription au cours.
                        </p>
                      </div>
                      <Button onClick={() => onNavigate(`/courses/${courseId}`)}>Voir le cours</Button>
                    </CardContent>
                  </Card>
                )}

                <LiveViewerTopicCard
                  title={sessionTitle}
                  description={sessionDescription}
                  onOpenResources={() => onNavigate(`/courses/${courseId}`)}
                />
                <SessionFooterPeek />

                <div className="simple-live-viewer-chat-mobile">
                  {studentHasCourseAccess ? (
                    <LiveViewerChatDock
                      sessionId={session.id}
                      userId={user?.id || null}
                      className="h-[560px] rounded-2xl shadow-sm"
                    />
                  ) : (
                    <Card className="border-slate-200 bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Users className="h-4 w-4 text-blue-600" />
                          Interactions live
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-slate-600">
                        <p>Inscrivez-vous au cours pour acceder au chat en direct.</p>
                        <Button onClick={() => onNavigate(`/courses/${courseId}`)}>Voir le cours</Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </section>

          <aside className="simple-live-viewer-chat-aside">
            {session && studentHasCourseAccess ? (
              <LiveViewerChatDock
                sessionId={session.id}
                userId={user?.id || null}
                className="h-full border-0"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-slate-500">
                Le chat apparait ici quand la session est disponible.
              </div>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}
