import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, CircleOff, Copy, Hand, Loader2, Play, Square, Video } from 'lucide-react';
import { useAppSelector } from '../../../hooks/redux';
import { normalizeUserRole } from '../../../lib/roleUtils';
import { useGetHandRaiseQueueQuery, useGetSessionStreamUrlQuery, useStartSessionMutation, useStopSessionMutation } from '../../../store/api/liveApi';
import { mapLiveHandRaise, type BackendLiveHandRaiseDTO, type LiveHandRaise } from '../../../types/live';
import { Alert, AlertDescription } from '../../ui/alert';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import type { BaseLiveProps } from '../live.types';
import { LIVE_HAND_RAISE_POLLING_MS } from '../liveConstants';
import { copyToClipboard, getErrorMessage } from '../liveModule.utils';
import { mergeHandRaiseQueueFromEvent, sortHandRaiseQueue, useLiveRealtimeSocket } from '../liveRealtimeSocket';
import { buildPlayerUrl, parseLiveKitAccessUrl } from '../liveSession.utils';
import { LiveViewerChatDock } from '../components/LiveViewerChatDock';
import { SessionPublisherCard } from '../components/SessionPublisherCard';
import { TeacherLiveOutputCard } from '../components/TeacherLiveOutputCard';
import { UserGuard } from '../components/UserGuard';
import { useResolvedSession } from '../hooks/useResolvedSession';
import { RaisedHandsOnlyPanel } from '../panels/RaisedHandsOnlyPanel';
export function SimpleLiveStudio({ courseId, sessionId, onNavigate }: BaseLiveProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isTeacher = normalizeUserRole(user?.role) === 'teacher';
  const {
    session,
    isLoading: isResolvingSession,
    error: resolveError,
    parsedCourseId,
  } = useResolvedSession({ courseId, sessionId, isAuthenticated });
  const canRequestStreamUrl = Boolean(
    session && (session.isLive || session.status === 'LIVE' || session.recordingUrl),
  );
  const { data: streamUrl, refetch: refetchStreamUrl } = useGetSessionStreamUrlQuery(session?.id || '', {
    skip: !isAuthenticated || !session || !canRequestStreamUrl,
    refetchOnMountOrArgChange: true,
  });
  const { data: raisedHandsQueueData = [] } = useGetHandRaiseQueueQuery(session?.id || '', {
    skip: !isAuthenticated || !session?.id,
    pollingInterval: session?.id ? LIVE_HAND_RAISE_POLLING_MS : 0,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [startSession, { isLoading: isStarting }] = useStartSessionMutation();
  const [stopSession, { isLoading: isStopping }] = useStopSessionMutation();
  const [actionError, setActionError] = useState<string | null>(null);
  const stageColumnRef = useRef<HTMLDivElement | null>(null);
  const [matchedChatHeight, setMatchedChatHeight] = useState<number | null>(null);
  const [liveRaisedHandsQueue, setLiveRaisedHandsQueue] = useState<LiveHandRaise[]>(raisedHandsQueueData);

  const effectiveVideoUrl = streamUrl || session?.videoUrl || null;
  const viewerPath = session ? `/courses/${session.courseId}/live/${session.id}` : null;
  const viewerAbsoluteUrl =
    viewerPath && typeof window !== 'undefined' ? `${window.location.origin}${viewerPath}` : null;
  const playerUrl = session
    ? buildPlayerUrl({
        videoUrl: effectiveVideoUrl,
      })
    : null;
  const liveKitJoinUrl = playerUrl?.startsWith('http') ? playerUrl : null;
  const liveKitAccess = useMemo(
    () => parseLiveKitAccessUrl(liveKitJoinUrl || effectiveVideoUrl),
    [effectiveVideoUrl, liveKitJoinUrl],
  );
  const roomKey = liveKitAccess?.roomName || session?.streamKey || 'N/A';
  const pendingRaisedHandsCount = liveRaisedHandsQueue.length;

  useEffect(() => {
    setLiveRaisedHandsQueue(sortHandRaiseQueue(raisedHandsQueueData));
  }, [raisedHandsQueueData]);

  const handleStudioRealtimeHandQueue = useCallback((payload: BackendLiveHandRaiseDTO[]) => {
    const mapped = payload.map(mapLiveHandRaise);
    setLiveRaisedHandsQueue(sortHandRaiseQueue(mapped));
  }, []);

  const handleStudioRealtimeHandEvent = useCallback((payload: BackendLiveHandRaiseDTO) => {
    const mapped = mapLiveHandRaise(payload);
    setLiveRaisedHandsQueue((currentQueue) => mergeHandRaiseQueueFromEvent(currentQueue, mapped));
  }, []);

  useLiveRealtimeSocket({
    sessionId: session?.id,
    enabled: Boolean(session?.id),
    onHandQueue: handleStudioRealtimeHandQueue,
    onHandEvent: handleStudioRealtimeHandEvent,
  });

  const handleStart = async () => {
    if (!session) {
      return;
    }

    setActionError(null);
    try {
      await startSession(session.id).unwrap();
    } catch (error) {
      setActionError(getErrorMessage(error, 'Demarrage impossible'));
    }
  };

  const handleStop = async () => {
    if (!session) {
      return;
    }

    setActionError(null);
    try {
      await stopSession(session.id).unwrap();
    } catch (error) {
      setActionError(getErrorMessage(error, 'Arret impossible'));
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stageNode = stageColumnRef.current;
    if (!stageNode) {
      return;
    }

    const desktopMedia = window.matchMedia('(min-width: 1024px)');
    const canObserveResize = typeof window.ResizeObserver !== 'undefined';

    const syncHeight = () => {
      if (!desktopMedia.matches) {
        setMatchedChatHeight(null);
        return;
      }
      const nextHeight = Math.max(0, Math.round(stageNode.getBoundingClientRect().height));
      setMatchedChatHeight((prev) => (prev === nextHeight ? prev : nextHeight));
    };

    syncHeight();
    window.addEventListener('resize', syncHeight);
    if (typeof desktopMedia.addEventListener === 'function') {
      desktopMedia.addEventListener('change', syncHeight);
    } else {
      desktopMedia.addListener(syncHeight);
    }

    let resizeObserver: ResizeObserver | null = null;
    if (canObserveResize) {
      resizeObserver = new window.ResizeObserver(syncHeight);
      resizeObserver.observe(stageNode);
    }

    return () => {
      window.removeEventListener('resize', syncHeight);
      if (typeof desktopMedia.removeEventListener === 'function') {
        desktopMedia.removeEventListener('change', syncHeight);
      } else {
        desktopMedia.removeListener(syncHeight);
      }
      resizeObserver?.disconnect();
    };
  }, [session?.id, streamUrl]);

  if (!isAuthenticated || !isTeacher) {
    return (
      <UserGuard
        allowed={false}
        message="Le studio live est reserve aux enseignants connectes."
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className="simple-live-studio-page h-[calc(100vh-4rem)] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(17,82,212,0.12),transparent_42%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_48%),#f6f8fe]">
      <div className="simple-live-studio-shell">
        <div className="simple-live-studio-topbar">
          <div className="simple-live-studio-header-main">
            <div className="simple-live-studio-header-leading">
              <Button
                variant="outline"
                size="sm"
                className="!h-8 rounded-full border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-100"
                onClick={() => onNavigate('/teacher/live-sessions')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </div>

            <div className="simple-live-studio-header-title">
              <div className="simple-live-studio-header-icon">
                <Video className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold text-slate-900 md:text-[1.02rem]">
                  {parsedCourseId ? `Cours #${parsedCourseId}` : 'Live session'}
                </h1>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      session?.isLive ? 'animate-pulse bg-red-500' : 'bg-slate-400'
                    }`}
                  />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {session?.isLive ? 'Live Q&A Session' : 'Session planifiee'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {session ? (
            <div className="simple-live-studio-header-actions">
              <div className="simple-live-studio-header-primary-actions">
                <Button
                  size="sm"
                  className="!h-8 rounded-full bg-emerald-500 px-3.5 text-slate-950 hover:bg-emerald-400"
                  onClick={handleStart}
                  disabled={session.isLive || isStarting}
                >
                  {isStarting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                  Demarrer
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="!h-8 rounded-full px-3.5"
                  onClick={handleStop}
                  disabled={!session.isLive || isStopping}
                >
                  {isStopping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Square className="mr-2 h-4 w-4" />}
                  Arreter
                </Button>
              </div>

              <div className="simple-live-studio-header-secondary-actions">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="!h-8 rounded-full border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-100"
                    >
                      Infos live
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Informations live</DialogTitle>
                      <DialogDescription>Details de session et actions rapides.</DialogDescription>
                    </DialogHeader>
                    <TeacherLiveOutputCard session={session} onNavigate={onNavigate} />
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="!h-8 rounded-full border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-100"
                    >
                      Configuration
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Configuration LiveKit</DialogTitle>
                      <DialogDescription>Liens utiles et informations de salle.</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1 text-sm">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="font-medium text-slate-900">Room key</p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <code className="break-all text-xs text-slate-600">{roomKey}</code>
                          {roomKey !== 'N/A' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                              onClick={() => copyToClipboard(roomKey)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="font-medium text-slate-900">Lien salle LiveKit</p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <code className="break-all text-xs text-slate-600">{liveKitJoinUrl || 'N/A'}</code>
                          {liveKitJoinUrl ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                              onClick={() => copyToClipboard(liveKitJoinUrl)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="font-medium text-slate-900">Lien viewer</p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <code className="break-all text-xs text-slate-600">{viewerAbsoluteUrl || 'N/A'}</code>
                          {viewerAbsoluteUrl ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                              onClick={() => copyToClipboard(viewerAbsoluteUrl)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      {playerUrl ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="font-medium text-slate-900">Lien player LiveKit</p>
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <code className="break-all text-xs text-slate-600">{playerUrl}</code>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                              onClick={() => copyToClipboard(playerUrl)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="relative !h-8 !w-8 rounded-full border-slate-300 bg-white p-0 text-slate-700 hover:bg-slate-100"
                      title="Mains levees"
                    >
                      <Hand className="h-4 w-4" />
                      {pendingRaisedHandsCount > 0 ? (
                        <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                          {pendingRaisedHandsCount > 9 ? '9+' : pendingRaisedHandsCount}
                        </span>
                      ) : null}
                      <span className="sr-only">Mains levees</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Mains levees</DialogTitle>
                      <DialogDescription>Liste des participants qui demandent la parole.</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[70vh] overflow-y-auto pr-1">
                      <RaisedHandsOnlyPanel sessionId={session.id} />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : null}
        </div>

        {actionError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        ) : null}

        {resolveError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {getErrorMessage(resolveError, 'Impossible de charger la session')}
            </AlertDescription>
          </Alert>
        ) : null}

        {isResolvingSession ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Chargement de la session...
          </div>
        ) : !session ? (
          <Card>
            <CardContent className="space-y-3 p-6 text-center">
              <CircleOff className="mx-auto h-10 w-10 text-muted-foreground" />
              <p>Aucune session disponible pour ce cours.</p>
              <Button onClick={() => onNavigate('/teacher/live-sessions')}>Creer une session</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="simple-live-studio-main">
            <div className="simple-live-studio-layout">
              <div ref={stageColumnRef} className="simple-live-studio-stage-col">
                <SessionPublisherCard
                  session={session}
                  streamUrl={streamUrl}
                  onRefreshAccessUrl={canRequestStreamUrl ? () => refetchStreamUrl() : undefined}
                  compactLayout
                  className="simple-live-studio-stage-card"
                />
              </div>
              <div
                className="simple-live-studio-chat-col"
                style={matchedChatHeight ? { height: `${matchedChatHeight}px` } : undefined}
              >
                <LiveViewerChatDock
                  sessionId={session.id}
                  userId={user?.id || null}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

