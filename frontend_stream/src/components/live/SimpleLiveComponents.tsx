import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CircleOff,
  Copy,
  GraduationCap,
  Loader2,
  MessageSquare,
  Mic,
  Play,
  Radio,
  Square,
  Tv,
  Users,
  Video,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAppSelector } from '../../hooks/redux';
import {
  useCompleteSpeakingMutation,
  useCreateCourseMutation,
  useCreateQuestionMutation,
  useCreateSessionMutation,
  useFetchSessionVodMutation,
  useGetChatHistoryQuery,
  useGetCourseLiveSessionQuery,
  useGetCourseSessionsQuery,
  useGetCoursesQuery,
  useGetCurrentSpeakerQuery,
  useGetHandRaiseQueueQuery,
  useGetQuestionsQuery,
  useGetSessionByIdQuery,
  useGetSessionStreamUrlQuery,
  useGetTeacherSessionsQuery,
  useGrantSpeakingMutation,
  useJoinSessionMutation,
  useLowerHandMutation,
  useMarkQuestionAnsweredMutation,
  useRaiseHandMutation,
  useRemoveQuestionVoteMutation,
  useSendChatMessageMutation,
  useStartSessionMutation,
  useStopSessionMutation,
  useUpvoteQuestionMutation,
} from '../../store/api/liveApi';
import type { LiveCourse, LiveHandRaise, LiveQuestion, LiveSession } from '../../types/live';
import {
  buildAntMediaDependencyScriptCandidates,
  buildAntMediaScriptCandidates,
  buildAntMediaWebSocketUrl,
  buildPlayerUrl,
  buildRtmpIngestUrl,
  extractStreamKeyFromVideoUrl,
  formatSessionDate,
  getSessionStatusLabel,
  getSessionStatusVariant,
  parseNumericId,
  toLocalDateTimeInput,
} from './liveSession.utils';

interface BaseLiveProps {
  courseId: string;
  sessionId?: string;
  onNavigate: (path: string) => void;
}

interface SimpleLiveManagerProps {
  courseId: string;
  onNavigate: (path: string) => void;
}

type MutationLikeError =
  | {
      status?: number;
      data?: string | { message?: string; error?: string };
    }
  | undefined;

type AntMediaWebRtcAdaptor = {
  publish: (streamId: string) => void;
  stop: (streamId: string) => void;
  closeWebSocket?: () => void;
  closePeerConnection?: (streamId: string) => void;
};

type AntMediaWebRtcAdaptorCtor = new (config: Record<string, unknown>) => AntMediaWebRtcAdaptor;

declare global {
  interface Window {
    WebRTCAdaptor?: AntMediaWebRtcAdaptorCtor;
    webrtc_adaptor?: { WebRTCAdaptor?: AntMediaWebRtcAdaptorCtor };
    SelfieSegmentation?: unknown;
  }
}

const antMediaScriptPromises = new Map<string, Promise<void>>();

function getWebRTCAdaptorCtor(): AntMediaWebRtcAdaptorCtor | null {
  if (window.WebRTCAdaptor) {
    return window.WebRTCAdaptor;
  }
  if (window.webrtc_adaptor?.WebRTCAdaptor) {
    return window.webrtc_adaptor.WebRTCAdaptor;
  }
  return null;
}

function loadScriptOnce(src: string): Promise<void> {
  const existingPromise = antMediaScriptPromises.get(src);
  if (existingPromise) {
    return existingPromise;
  }

  const promise = new Promise<void>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Document indisponible'));
      return;
    }

    const existingScript = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existingScript) {
      if (getWebRTCAdaptorCtor()) {
        resolve();
        return;
      }
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error(`Chargement impossible: ${src}`)), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Chargement impossible: ${src}`));
    document.head.appendChild(script);
  });

  antMediaScriptPromises.set(src, promise);
  return promise;
}

async function ensureAntMediaAdaptorLoaded(videoUrl?: string | null): Promise<void> {
  const existingCtor = getWebRTCAdaptorCtor();
  if (existingCtor) {
    window.WebRTCAdaptor = existingCtor;
    return;
  }

  // Some adaptor builds expect SelfieSegmentation global to exist.
  const dependencyScripts = buildAntMediaDependencyScriptCandidates();
  for (const dependencyUrl of dependencyScripts) {
    try {
      await loadScriptOnce(dependencyUrl);
    } catch {
      // Non bloquant: continue; not all adaptor builds need this dependency.
    }
  }

  const scriptCandidates = buildAntMediaScriptCandidates(videoUrl);
  let lastError: unknown = null;

  for (const scriptUrl of scriptCandidates) {
    try {
      await loadScriptOnce(scriptUrl);
      const ctor = getWebRTCAdaptorCtor();
      if (ctor) {
        window.WebRTCAdaptor = ctor;
        return;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Impossible de charger le SDK WebRTC Ant Media');
}

function getErrorMessage(error: unknown, fallback: string): string {
  const known = error as MutationLikeError;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: string }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }
  if (typeof known?.data === 'string' && known.data.trim()) {
    return known.data;
  }
  if (known?.data && typeof known.data === 'object') {
    if (known.data.message) {
      return known.data.message;
    }
    if (known.data.error) {
      return known.data.error;
    }
  }
  if (typeof known?.status === 'number') {
    return `${fallback} (HTTP ${known.status})`;
  }
  return fallback;
}

function pickPreferredSession(sessions: LiveSession[]): LiveSession | null {
  if (!sessions.length) {
    return null;
  }

  const liveSession = sessions.find((session) => session.isLive || session.status === 'LIVE');
  if (liveSession) {
    return liveSession;
  }

  return [...sessions].sort((a, b) => {
    const aTime = new Date(a.scheduledAt).getTime();
    const bTime = new Date(b.scheduledAt).getTime();
    return bTime - aTime;
  })[0];
}

function sortSessions(sessions: LiveSession[]): LiveSession[] {
  return [...sessions].sort((a, b) => {
    if (a.isLive && !b.isLive) {
      return -1;
    }
    if (!a.isLive && b.isLive) {
      return 1;
    }

    const aTime = new Date(a.scheduledAt).getTime();
    const bTime = new Date(b.scheduledAt).getTime();
    return bTime - aTime;
  });
}

function UserGuard({
  allowed,
  message,
  onNavigate,
}: {
  allowed: boolean;
  message: string;
  onNavigate: (path: string) => void;
}) {
  if (allowed) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acces restreint</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{message}</p>
          <Button size="sm" onClick={() => onNavigate('/auth/signin')}>
            Aller a la connexion
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

function SessionStatusPill({ session }: { session: LiveSession }) {
  return (
    <Badge variant={getSessionStatusVariant(session.status, session.isLive)}>
      {session.isLive ? <Radio className="mr-1 h-3 w-3" /> : null}
      {getSessionStatusLabel(session.status, session.isLive)}
    </Badge>
  );
}

function copyToClipboard(value: string) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return;
  }
  void navigator.clipboard.writeText(value);
}

function SessionVideoCard({
  session,
  streamUrl,
}: {
  session: LiveSession | null;
  streamUrl?: string;
}) {
  const effectiveVideoUrl = session?.videoUrl || streamUrl || null;
  const canUseLivePlayer = Boolean(session && (session.isLive || session.status === 'LIVE'));
  const replayUrl = useMemo(() => {
    if (!session || session.isLive || session.status === 'LIVE') {
      return null;
    }

    if (session.recordingUrl) {
      return session.recordingUrl;
    }

    if (effectiveVideoUrl && /\.mp4($|\?)/i.test(effectiveVideoUrl)) {
      return effectiveVideoUrl;
    }

    return null;
  }, [session, effectiveVideoUrl]);

  const playerUrl = useMemo(() => {
    if (!session || !canUseLivePlayer) {
      return null;
    }

    return buildPlayerUrl({
      streamKey: session.streamKey,
      videoUrl: effectiveVideoUrl,
    });
  }, [session, effectiveVideoUrl, canUseLivePlayer]);

  return (
    <Card className="overflow-hidden border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
      <CardHeader className="space-y-3 border-b border-slate-800/80 bg-slate-900/70 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold md:text-lg">
            <Tv className="h-4 w-4 text-sky-300" />
            {replayUrl ? 'Replay video' : 'Flux principal'}
          </CardTitle>
          {session ? <SessionStatusPill session={session} /> : null}
        </div>
        <CardDescription className="text-slate-300">
          {session
            ? `Session planifiee le ${formatSessionDate(session.scheduledAt)}`
            : 'Aucune session selectionnee'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-4 md:p-5">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-black/95">
          <div className="absolute left-3 top-3 z-10 rounded-full bg-black/65 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-200">
            {replayUrl ? 'Replay' : 'En direct'}
          </div>

          {replayUrl ? (
            <video src={replayUrl} controls preload="metadata" className="h-full w-full object-cover" />
          ) : playerUrl ? (
            <iframe
              title="Live player"
              src={playerUrl}
              className="h-full w-full border-0 bg-black"
              allow="autoplay; fullscreen; microphone; camera"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-300">
              {session && !canUseLivePlayer && !replayUrl
                ? 'Le live n a pas encore commence.'
                : 'Flux indisponible pour le moment.'}
            </div>
          )}
        </div>

        {replayUrl ? (
          <a
            href={replayUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-xs font-medium text-sky-300 underline underline-offset-4"
          >
            Ouvrir le replay dans un nouvel onglet
          </a>
        ) : (
          <p className="text-xs text-slate-300">
            Si l ecran reste noir, attendez que l enseignant lance la publication camera.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function TeacherLiveOutputCard({
  session,
  onNavigate,
}: {
  session: LiveSession;
  onNavigate: (path: string) => void;
}) {
  const viewerPath = `/courses/${session.courseId}/live/${session.id}`;
  const sessionLabel = getSessionStatusLabel(session.status, session.isLive);

  return (
    <Card className="overflow-hidden border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
      <CardHeader className="space-y-2 border-b border-slate-800/80 bg-slate-900/70 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-sky-300" />
          Salle de controle
        </CardTitle>
        <CardDescription className="text-slate-300">
          Pilotage rapide de la diffusion cote enseignant.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Statut</p>
            <div className="mt-2">
              <Badge variant={session.isLive ? 'destructive' : 'secondary'}>{sessionLabel}</Badge>
            </div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Session</p>
            <p className="mt-2 font-medium">#{session.id}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Cours</p>
            <p className="mt-2 font-medium">#{session.courseId}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Planifiee</p>
            <p className="mt-2 font-medium">{formatSessionDate(session.scheduledAt)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="rounded-full bg-sky-500 px-4 text-slate-950 hover:bg-sky-400"
            onClick={() => onNavigate(viewerPath)}
          >
            Ouvrir vue etudiant
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
            onClick={() => copyToClipboard(`${window.location.origin}${viewerPath}`)}
          >
            Copier lien live
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionPublisherCard({
  session,
  streamUrl,
}: {
  session: LiveSession | null;
  streamUrl?: string;
}) {
  const localVideoId = `publisher-local-video-${session?.id || 'none'}`;
  const adaptorRef = useRef<AntMediaWebRtcAdaptor | null>(null);
  const hasPublishedRef = useRef(false);
  const [publisherState, setPublisherState] = useState<'idle' | 'loading' | 'ready' | 'publishing' | 'error'>(
    'idle',
  );
  const [publisherError, setPublisherError] = useState<string | null>(null);

  const effectiveVideoUrl = session?.videoUrl || streamUrl || null;
  const streamKey = session?.streamKey || extractStreamKeyFromVideoUrl(effectiveVideoUrl);
  const websocketUrl = useMemo(() => buildAntMediaWebSocketUrl(effectiveVideoUrl), [effectiveVideoUrl]);
  const sessionIsLive = Boolean(session && (session.isLive || session.status === 'LIVE'));

  useEffect(() => {
    if (!session) {
      setPublisherState('idle');
      setPublisherError(null);
      return;
    }
    if (!sessionIsLive) {
      setPublisherState('idle');
      setPublisherError(null);
      return;
    }
    if (!streamKey) {
      setPublisherState('error');
      setPublisherError('Stream key indisponible pour cette session.');
      return;
    }

    let cancelled = false;

    const initPublisher = async () => {
      setPublisherState('loading');
      setPublisherError(null);

      try {
        await ensureAntMediaAdaptorLoaded(effectiveVideoUrl);
        if (cancelled) {
          return;
        }

        const WebRTCAdaptor = getWebRTCAdaptorCtor();
        if (!WebRTCAdaptor) {
          throw new Error('SDK WebRTC Ant Media non disponible.');
        }

        const adaptor = new WebRTCAdaptor({
          websocket_url: websocketUrl,
          localVideoId,
          mediaConstraints: { video: true, audio: true },
          peerconnection_config: {
            iceServers: [{ urls: 'stun:stun1.l.google.com:19302' }],
          },
          sdp_constraints: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false,
          },
          callback: (info: string) => {
            if (cancelled) {
              return;
            }
            if (info === 'initialized') {
              setPublisherState('ready');
            } else if (info === 'publish_started') {
              hasPublishedRef.current = true;
              setPublisherState('publishing');
            } else if (info === 'publish_finished') {
              hasPublishedRef.current = false;
              setPublisherState('ready');
            }
          },
          callbackError: (error: string, message: unknown) => {
            if (cancelled) {
              return;
            }
            const details = typeof message === 'string' ? message : JSON.stringify(message || {});
            setPublisherState('error');
            setPublisherError(`${error}${details ? ` - ${details}` : ''}`);
          },
        });

        adaptorRef.current = adaptor;
      } catch (error) {
        if (cancelled) {
          return;
        }
        setPublisherState('error');
        setPublisherError(getErrorMessage(error, 'Initialisation publisher impossible'));
      }
    };

    void initPublisher();

    return () => {
      cancelled = true;
      const adaptor = adaptorRef.current;
      if (adaptor && streamKey && hasPublishedRef.current) {
        try {
          adaptor.stop(streamKey);
        } catch {}
        hasPublishedRef.current = false;
      }
      if (adaptor) {
        try {
          adaptor.closePeerConnection?.(streamKey);
        } catch {}
        try {
          adaptor.closeWebSocket?.();
        } catch {}
      }
      adaptorRef.current = null;
    };
  }, [effectiveVideoUrl, localVideoId, session?.id, sessionIsLive, streamKey, websocketUrl]);

  if (!session) {
    return null;
  }

  const handleStartPublishing = () => {
    if (!streamKey) {
      setPublisherError('Stream key indisponible.');
      return;
    }
    if (publisherState !== 'ready' || !adaptorRef.current) {
      setPublisherError('Publisher en cours d initialisation. Attendez le badge "Camera prete".');
      return;
    }
    if (!sessionIsLive) {
      setPublisherError('Demarrez d abord la session live, puis lancez la publication camera.');
      return;
    }

    setPublisherError(null);
    try {
      adaptorRef.current.publish(streamKey);
    } catch (error) {
      setPublisherError(getErrorMessage(error, 'Echec du demarrage de publication'));
    }
  };

  const handleStopPublishing = () => {
    if (!streamKey || !adaptorRef.current) {
      return;
    }
    try {
      adaptorRef.current.stop(streamKey);
      hasPublishedRef.current = false;
      setPublisherState('ready');
    } catch (error) {
      setPublisherError(getErrorMessage(error, 'Echec de l arret de publication'));
    }
  };

  return (
    <Card className="overflow-hidden border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
      <CardHeader className="space-y-3 border-b border-slate-800/80 bg-slate-900/70">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold md:text-lg">
              <Video className="h-4 w-4 text-emerald-300" />
              Publication camera
            </CardTitle>
            <CardDescription className="mt-1 text-slate-300">
              Demarrez votre camera/micro pour envoyer le flux vers Ant Media.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!sessionIsLive ? (
              <Badge variant="outline" className="border-slate-600 text-slate-200">
                Session non demarree
              </Badge>
            ) : null}
            {publisherState === 'publishing' ? <Badge variant="destructive">Diffusion en cours</Badge> : null}
            {publisherState === 'ready' ? <Badge variant="secondary">Camera prete</Badge> : null}
            {publisherState === 'loading' ? (
              <Badge variant="outline" className="border-slate-600 text-slate-200">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Initialisation
              </Badge>
            ) : null}
            {publisherState === 'error' ? <Badge variant="destructive">Erreur publisher</Badge> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4 md:p-5">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-black">
          <video id={localVideoId} autoPlay muted playsInline className="h-full w-full object-cover" />
          <div className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-200">
            {publisherState === 'publishing' ? 'Camera en direct' : 'Apercu enseignant'}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-200">
            <p className="font-medium text-slate-100">Demarrage rapide</p>
            <ol className="mt-2 space-y-1 text-slate-300">
              <li>1. Cliquez sur "Demarrer".</li>
              <li>2. Attendez le badge "Camera prete".</li>
              <li>3. Cliquez sur "Start Publishing".</li>
              <li>4. Autorisez camera + micro dans le navigateur.</li>
            </ol>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Button
              size="sm"
              className="rounded-full bg-emerald-500 px-4 text-slate-950 hover:bg-emerald-400"
              onClick={handleStartPublishing}
              disabled={!streamKey || publisherState !== 'ready'}
            >
              Start Publishing
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="rounded-full px-4"
              onClick={handleStopPublishing}
              disabled={!streamKey || publisherState !== 'publishing'}
            >
              Stop Publishing
            </Button>
            {streamKey ? (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
                onClick={() => copyToClipboard(streamKey)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copier stream key
              </Button>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-xs text-slate-200">
          <p>
            <strong>Stream key:</strong> {streamKey || 'N/A'}
          </p>
          <p className="mt-1 break-all">
            <strong>WebSocket:</strong> {websocketUrl}
          </p>
          <p className="mt-2 text-slate-400">
            Si camera refuse de demarrer, verifiez les permissions navigateur et que Ant Media expose bien
            `/{(session.videoUrl || '').split('/')[3] || 'LiveApp'}/websocket`.
          </p>
        </div>

        {publisherError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{publisherError}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ChatPanel({ sessionId, userId }: { sessionId: string | null; userId: string | null }) {
  const shouldSkip = !sessionId;
  const { data: messages = [], isFetching } = useGetChatHistoryQuery(sessionId || '', {
    skip: shouldSkip,
  });
  const [sendMessage, { isLoading: isSending }] = useSendChatMessageMutation();
  const [draft, setDraft] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sessionId || !userId || !draft.trim()) {
      return;
    }

    setErrorMessage(null);
    try {
      await sendMessage({
        sessionId,
        senderId: userId,
        content: draft,
      }).unwrap();
      setDraft('');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible d envoyer le message'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          Chat en direct
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-72 space-y-2 overflow-y-auto rounded-md border bg-muted/20 p-3">
          {isFetching ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement des messages...
            </div>
          ) : messages.length ? (
            messages.map((message) => (
              <div key={message.id} className="rounded-md border bg-background p-2 text-sm">
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{message.senderName}</span>
                  <span>{formatSessionDate(message.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Aucun message pour cette session.</p>
          )}
        </div>

        <form className="space-y-2" onSubmit={handleSend}>
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ecrivez un message..."
            rows={2}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {userId ? 'Messages en temps reel' : 'Connexion requise pour envoyer'}
            </span>
            <Button size="sm" type="submit" disabled={!userId || !sessionId || isSending || !draft.trim()}>
              {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Envoyer
            </Button>
          </div>
        </form>

        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
      </CardContent>
    </Card>
  );
}

function QuestionsPanel({
  sessionId,
  userId,
  isTeacher,
}: {
  sessionId: string | null;
  userId: string | null;
  isTeacher: boolean;
}) {
  const shouldSkip = !sessionId;
  const { data: questions = [], isFetching } = useGetQuestionsQuery(
    { sessionId: sessionId || '', userId: userId || undefined },
    { skip: shouldSkip },
  );
  const [createQuestion, { isLoading: isCreating }] = useCreateQuestionMutation();
  const [upvoteQuestion, { isLoading: isVoting }] = useUpvoteQuestionMutation();
  const [removeVote, { isLoading: isRemovingVote }] = useRemoveQuestionVoteMutation();
  const [markAnswered, { isLoading: isMarkingAnswered }] = useMarkQuestionAnsweredMutation();
  const [draft, setDraft] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sortedQuestions = useMemo(
    () => [...questions].sort((a, b) => b.votes - a.votes),
    [questions],
  );

  const handleCreateQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sessionId || !userId || !draft.trim()) {
      return;
    }

    setErrorMessage(null);
    try {
      await createQuestion({
        sessionId,
        authorId: userId,
        content: draft,
      }).unwrap();
      setDraft('');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible de publier la question'));
    }
  };

  const handleToggleVote = async (question: LiveQuestion) => {
    if (!userId) {
      return;
    }

    setErrorMessage(null);
    try {
      if (question.userHasVoted) {
        await removeVote({ questionId: question.id, userId }).unwrap();
      } else {
        await upvoteQuestion({ questionId: question.id, userId }).unwrap();
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible de voter'));
    }
  };

  const handleMarkAnswered = async (questionId: string) => {
    setErrorMessage(null);
    try {
      await markAnswered(questionId).unwrap();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible de marquer la question'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Questions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <form className="space-y-2" onSubmit={handleCreateQuestion}>
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Posez une question..."
            rows={2}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              type="submit"
              disabled={!sessionId || !userId || !draft.trim() || isCreating}
            >
              {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Publier
            </Button>
          </div>
        </form>

        <div className="h-72 space-y-2 overflow-y-auto rounded-md border bg-muted/20 p-3">
          {isFetching ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement des questions...
            </div>
          ) : sortedQuestions.length ? (
            sortedQuestions.map((question) => (
              <div key={question.id} className="rounded-md border bg-background p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm">{question.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {question.authorName} - {formatSessionDate(question.createdAt)}
                    </p>
                  </div>
                  {question.answered ? (
                    <Badge variant="secondary">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Repondue
                    </Badge>
                  ) : null}
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    size="sm"
                    variant={question.userHasVoted ? 'default' : 'outline'}
                    disabled={!userId || isVoting || isRemovingVote}
                    onClick={() => handleToggleVote(question)}
                  >
                    {question.userHasVoted ? 'Vote retire' : 'Voter'} ({question.votes})
                  </Button>

                  {isTeacher && !question.answered ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isMarkingAnswered}
                      onClick={() => handleMarkAnswered(question.id)}
                    >
                      Marquer repondu
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Aucune question pour cette session.</p>
          )}
        </div>

        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
      </CardContent>
    </Card>
  );
}

function HandRaisePanel({
  sessionId,
  userId,
  isTeacher,
}: {
  sessionId: string | null;
  userId: string | null;
  isTeacher: boolean;
}) {
  const shouldSkip = !sessionId;
  const { data: queue = [], isFetching } = useGetHandRaiseQueueQuery(sessionId || '', {
    skip: shouldSkip,
  });
  const { data: currentSpeaker } = useGetCurrentSpeakerQuery(sessionId || '', {
    skip: shouldSkip,
  });
  const [raiseHand, { isLoading: isRaising }] = useRaiseHandMutation();
  const [lowerHand, { isLoading: isLowering }] = useLowerHandMutation();
  const [grantSpeaking, { isLoading: isGranting }] = useGrantSpeakingMutation();
  const [completeSpeaking, { isLoading: isCompleting }] = useCompleteSpeakingMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ownRequest = useMemo(() => {
    if (!userId) {
      return null;
    }

    return queue.find((entry) => entry.studentId === userId) || null;
  }, [queue, userId]);

  const handleRaise = async () => {
    if (!sessionId || !userId) {
      return;
    }

    setErrorMessage(null);
    try {
      await raiseHand({ sessionId, studentId: userId }).unwrap();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible de lever la main'));
    }
  };

  const handleLower = async () => {
    if (!sessionId || !userId) {
      return;
    }

    setErrorMessage(null);
    try {
      await lowerHand({ sessionId, studentId: userId }).unwrap();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible de baisser la main'));
    }
  };

  const handleGrant = async (handRaiseId: string) => {
    setErrorMessage(null);
    try {
      await grantSpeaking(handRaiseId).unwrap();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible d accorder la parole'));
    }
  };

  const handleComplete = async (handRaiseId: string) => {
    setErrorMessage(null);
    try {
      await completeSpeaking(handRaiseId).unwrap();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible de terminer la prise de parole'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Mic className="h-4 w-4" />
          Mains levees
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentSpeaker ? (
          <Alert>
            <Mic className="h-4 w-4" />
            <AlertTitle>Intervenant actuel</AlertTitle>
            <AlertDescription>{currentSpeaker.studentName}</AlertDescription>
          </Alert>
        ) : null}

        {!isTeacher ? (
          <div className="flex items-center justify-between rounded-md border p-3">
            <p className="text-sm">
              {ownRequest
                ? 'Votre demande est dans la file.'
                : 'Levez la main pour demander la parole.'}
            </p>
            {ownRequest ? (
              <Button size="sm" variant="outline" onClick={handleLower} disabled={isLowering}>
                Baisser
              </Button>
            ) : (
              <Button size="sm" onClick={handleRaise} disabled={!userId || isRaising}>
                Lever la main
              </Button>
            )}
          </div>
        ) : null}

        <div className="h-72 space-y-2 overflow-y-auto rounded-md border bg-muted/20 p-3">
          {isFetching ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement de la file...
            </div>
          ) : queue.length ? (
            queue.map((entry: LiveHandRaise) => (
              <div key={entry.id} className="rounded-md border bg-background p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{entry.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      Demande: {entry.requestedAt ? formatSessionDate(entry.requestedAt) : 'N/A'}
                    </p>
                  </div>
                  <Badge variant="outline">{entry.status}</Badge>
                </div>
                {isTeacher ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isGranting}
                      onClick={() => handleGrant(entry.id)}
                    >
                      Donner la parole
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isCompleting}
                      onClick={() => handleComplete(entry.id)}
                    >
                      Terminer
                    </Button>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Aucune demande de parole.</p>
          )}
        </div>

        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
      </CardContent>
    </Card>
  );
}

export function SimpleLiveManager({ courseId, onNavigate }: SimpleLiveManagerProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isTeacher = user?.role === 'teacher';
  const teacherId = parseNumericId(user?.id);
  const fixedCourseId = courseId === 'all' ? null : parseNumericId(courseId);

  const {
    data: teacherSessions = [],
    isLoading: isLoadingSessions,
    refetch: refetchSessions,
    error: sessionsError,
  } = useGetTeacherSessionsQuery(undefined, {
    skip: !isAuthenticated || !isTeacher,
  });

  const {
    data: allCourses = [],
    isLoading: isLoadingCourses,
    refetch: refetchCourses,
    error: coursesError,
  } = useGetCoursesQuery(undefined, {
    skip: !isAuthenticated || !isTeacher,
  });

  const teacherCourses = useMemo(() => {
    if (!teacherId) {
      return [] as LiveCourse[];
    }
    return allCourses.filter((course) => Number(course.teacherId) === teacherId);
  }, [allCourses, teacherId]);

  const [createCourse, { isLoading: isCreatingCourse }] = useCreateCourseMutation();
  const [createSession, { isLoading: isCreating }] = useCreateSessionMutation();
  const [startSession, { isLoading: isStarting }] = useStartSessionMutation();
  const [stopSession, { isLoading: isStopping }] = useStopSessionMutation();
  const [fetchVod, { isLoading: isFetchingVod }] = useFetchSessionVodMutation();

  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategory, setCourseCategory] = useState('Programmation');
  const [courseStartAt, setCourseStartAt] = useState<string>(
    toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()),
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [courseSelection, setCourseSelection] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState<string>(
    toLocalDateTimeInput(new Date(Date.now() + 15 * 60 * 1000).toISOString()),
  );
  const [recordingEnabled, setRecordingEnabled] = useState(true);
  const [resolution, setResolution] = useState('720p');

  useEffect(() => {
    if (fixedCourseId) {
      setCourseSelection(String(fixedCourseId));
      return;
    }
    if (!courseSelection && teacherCourses.length) {
      setCourseSelection(teacherCourses[0].id);
      return;
    }
    if (
      courseSelection &&
      teacherCourses.length &&
      !teacherCourses.some((course) => course.id === courseSelection)
    ) {
      setCourseSelection(teacherCourses[0].id);
    }
  }, [teacherCourses, courseSelection, fixedCourseId]);

  const sessions = useMemo(() => {
    const filtered = fixedCourseId
      ? teacherSessions.filter((session) => Number(session.courseId) === fixedCourseId)
      : teacherSessions;
    return sortSessions(filtered);
  }, [teacherSessions, fixedCourseId]);

  const selectedCourse = useMemo(
    () => teacherCourses.find((course) => course.id === courseSelection) || null,
    [teacherCourses, courseSelection],
  );

  const courseSummaries = useMemo(() => {
    const summaries = teacherCourses.map((course) => {
      const courseSessions = teacherSessions.filter(
        (session) => String(session.courseId) === String(course.id),
      );
      const liveCount = courseSessions.filter(
        (session) => session.isLive || session.status === 'LIVE',
      ).length;
      const replayCount = courseSessions.filter((session) => Boolean(session.recordingUrl)).length;
      const latestSession = [...courseSessions].sort(
        (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
      )[0] || null;

      return {
        course,
        courseSessions,
        sessionCount: courseSessions.length,
        liveCount,
        replayCount,
        latestSession,
      };
    });

    return summaries.sort((a, b) => b.sessionCount - a.sessionCount);
  }, [teacherCourses, teacherSessions]);

  const visibleCourseSummaries = useMemo(() => {
    if (!fixedCourseId) {
      return courseSummaries;
    }
    return courseSummaries.filter(
      (summary) => Number(summary.course.id) === Number(fixedCourseId),
    );
  }, [courseSummaries, fixedCourseId]);

  const liveCount = teacherSessions.filter(
    (session) => session.isLive || session.status === 'LIVE',
  ).length;
  const replayCount = teacherSessions.filter((session) => Boolean(session.recordingUrl)).length;

  const handleCreateCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!teacherId) {
      setErrorMessage('ID enseignant invalide. Reconnectez-vous.');
      return;
    }
    if (!courseTitle.trim() || !courseDescription.trim()) {
      setErrorMessage('Remplissez le titre et la description du cours.');
      return;
    }
    if (!courseStartAt) {
      setErrorMessage('Selectionnez une date de lancement du cours.');
      return;
    }

    setErrorMessage(null);
    try {
      const createdCourse = await createCourse({
        title: courseTitle,
        description: courseDescription,
        category: courseCategory,
        scheduledAt: courseStartAt,
        teacherId,
      }).unwrap();

      await refetchCourses();
      setCourseSelection(createdCourse.id);
      setCourseTitle('');
      setCourseDescription('');
      setCourseCategory('Programmation');
      setCourseStartAt(
        toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()),
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Creation du cours impossible'));
    }
  };

  const handleCreateSession = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!teacherId) {
      setErrorMessage('ID enseignant invalide. Reconnectez-vous.');
      return;
    }
    if (!courseSelection) {
      setErrorMessage('Selectionnez un cours.');
      return;
    }

    setErrorMessage(null);
    try {
      const created = await createSession({
        courseId: courseSelection,
        teacherId,
        scheduledAt,
        recordingEnabled,
        resolution,
      }).unwrap();
      onNavigate(`/teacher/live/${created.courseId}/${created.id}`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Creation de session impossible'));
    }
  };

  const handleStart = async (sessionId: string) => {
    setErrorMessage(null);
    try {
      await startSession(sessionId).unwrap();
      await refetchSessions();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Demarrage impossible'));
    }
  };

  const handleStop = async (sessionId: string) => {
    setErrorMessage(null);
    try {
      await stopSession(sessionId).unwrap();
      await refetchSessions();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Arret impossible'));
    }
  };

  const handleFetchVod = async (sessionId: string) => {
    setErrorMessage(null);
    try {
      await fetchVod(sessionId).unwrap();
      await refetchSessions();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Recuperation VOD impossible'));
    }
  };

  const focusSessionFormForCourse = (targetCourseId: string) => {
    setCourseSelection(targetCourseId);
    if (typeof window !== 'undefined') {
      const sessionForm = window.document.getElementById('session-create-form');
      sessionForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!isAuthenticated || !isTeacher) {
    return (
      <UserGuard
        allowed={false}
        message="Cette page est reservee aux enseignants connectes."
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-indigo-600 via-blue-700 to-emerald-600 text-white shadow-lg">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.08em]">
              Studio enseignant
            </div>
            <h2 className="text-2xl font-semibold md:text-3xl">Cours + sessions live sur une seule page</h2>
            <p className="max-w-2xl text-sm text-white/80">
              Creez un cours, puis planifiez plusieurs sessions live rattachees a ce cours. Vous gardez ensuite les replays pour le visionnage a froid.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge className="bg-white/15 text-white hover:bg-white/20">
                <BookOpen className="mr-1 h-3 w-3" />
                {teacherCourses.length} cours
              </Badge>
              <Badge className="bg-white/20 text-white hover:bg-white/25">
                <Radio className="mr-1 h-3 w-3" />
                {liveCount} en direct
              </Badge>
              <Badge className="bg-white/20 text-white hover:bg-white/25">
                <Video className="mr-1 h-3 w-3" />
                {replayCount} replay(s)
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-center">
              <p className="text-xs text-white/80">Cours</p>
              <p className="text-xl font-semibold">{teacherCourses.length}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-center">
              <p className="text-xs text-white/80">Sessions</p>
              <p className="text-xl font-semibold">{teacherSessions.length}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-center">
              <p className="text-xs text-white/80">Replays</p>
              <p className="text-xl font-semibold">{replayCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_1fr]">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Creer un cours
            </CardTitle>
            <CardDescription>Un cours peut contenir plusieurs sessions live</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateCourse}>
              <div className="space-y-2">
                <Label htmlFor="course-title">Titre du cours</Label>
                <Input
                  id="course-title"
                  value={courseTitle}
                  onChange={(event) => setCourseTitle(event.target.value)}
                  placeholder="Ex: React avance pour projets reels"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-category">Categorie</Label>
                <Select value={courseCategory} onValueChange={setCourseCategory}>
                  <SelectTrigger id="course-category">
                    <SelectValue placeholder="Choisir une categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Programmation">Programmation</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Data">Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-start-at">Date de lancement</Label>
                <Input
                  id="course-start-at"
                  type="datetime-local"
                  value={courseStartAt}
                  onChange={(event) => setCourseStartAt(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-description">Description</Label>
                <Textarea
                  id="course-description"
                  value={courseDescription}
                  onChange={(event) => setCourseDescription(event.target.value)}
                  placeholder="Objectifs, prerequis, plan du cours..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isCreatingCourse}>
                  {isCreatingCourse ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Creer le cours
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card id="session-create-form" className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Nouvelle session live
            </CardTitle>
            <CardDescription>Creer une session connectee a Ant Media</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateSession}>
              {isLoadingCourses ? (
                <div className="flex items-center rounded-md border p-3 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement des cours...
                </div>
              ) : null}

              {!fixedCourseId ? (
                <div className="space-y-2">
                  <Label htmlFor="course-selection">Cours</Label>
                  <Select value={courseSelection} onValueChange={setCourseSelection}>
                    <SelectTrigger id="course-selection">
                      <SelectValue placeholder="Selectionnez un cours" />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherCourses.map((course: LiveCourse) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {selectedCourse ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-600">
                  Session rattachee a: <span className="font-medium">{selectedCourse.title}</span>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="scheduled-at">Date et heure</Label>
                <Input
                  id="scheduled-at"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution</Label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger id="resolution">
                    <SelectValue placeholder="Resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="480p">480p</SelectItem>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Enregistrement</p>
                  <p className="text-xs text-muted-foreground">Activer le VOD apres la session</p>
                </div>
                <Switch checked={recordingEnabled} onCheckedChange={setRecordingEnabled} />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isCreating || (!courseSelection && !fixedCourseId)}>
                  {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Creer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {sessionsError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {getErrorMessage(sessionsError, 'Impossible de charger les sessions')}
          </AlertDescription>
        </Alert>
      ) : null}

      {coursesError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {getErrorMessage(coursesError, 'Impossible de charger les cours')}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Mes cours</CardTitle>
          <CardDescription>Un cours peut contenir autant de sessions live que necessaire</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoadingCourses ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement des cours...
            </div>
          ) : visibleCourseSummaries.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {visibleCourseSummaries.map((summary) => (
                <div
                  key={summary.course.id}
                  className="rounded-xl border bg-background p-4 transition-shadow hover:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{summary.course.title}</p>
                      <p className="text-xs text-muted-foreground">{summary.course.category}</p>
                    </div>
                    <Badge variant="outline">#{summary.course.id}</Badge>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {summary.sessionCount} session{summary.sessionCount > 1 ? 's' : ''}
                    </Badge>
                    <Badge variant={summary.liveCount > 0 ? 'destructive' : 'outline'}>
                      {summary.liveCount} en direct
                    </Badge>
                    <Badge variant="outline">{summary.replayCount} replay(s)</Badge>
                  </div>

                  <p className="mb-3 text-xs text-muted-foreground">
                    {summary.latestSession
                      ? `Derniere session: ${formatSessionDate(summary.latestSession.scheduledAt)}`
                      : 'Aucune session pour ce cours'}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => focusSessionFormForCourse(summary.course.id)}
                    >
                      Programmer une session
                    </Button>
                    {summary.latestSession ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          onNavigate(`/teacher/live/${summary.course.id}/${summary.latestSession.id}`)
                        }
                      >
                        Ouvrir studio
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aucun cours enseignant disponible. Creez votre premier cours ci-dessus.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mes sessions</CardTitle>
          <CardDescription>
            {fixedCourseId
              ? `Filtrees sur le cours #${fixedCourseId}`
              : 'Toutes les sessions de l enseignant connecte'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoadingSessions ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement des sessions...
            </div>
          ) : sessions.length ? (
            sessions.map((session) => {
              const viewerUrl = `/courses/${session.courseId}/live/${session.id}`;
              return (
                <div
                  key={session.id}
                  className="flex flex-col gap-4 rounded-xl border bg-background p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <SessionStatusPill session={session} />
                      <Badge variant="outline">
                        Cours #
                        {session.courseId}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Planifiee: {formatSessionDate(session.scheduledAt)}
                    </p>
                    {session.recordingUrl ? (
                      <a
                        href={session.recordingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary underline underline-offset-4"
                      >
                        Replay disponible
                      </a>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigate(`/teacher/live/${session.courseId}/${session.id}`)}
                    >
                      Ouvrir studio
                    </Button>
                    {!session.isLive ? (
                      <Button
                        size="sm"
                        onClick={() => handleStart(session.id)}
                        disabled={isStarting}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Demarrer
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStop(session.id)}
                        disabled={isStopping}
                      >
                        <Square className="mr-2 h-4 w-4" />
                        Arreter
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleFetchVod(session.id)}
                      disabled={isFetchingVod}
                    >
                      VOD
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        copyToClipboard(`${window.location.origin}${viewerUrl}`);
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copier lien
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onNavigate(viewerUrl)}>
                      Vue etudiant
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aucune session pour le moment.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LiveInteractionTabs({
  sessionId,
  userId,
  isTeacher,
}: {
  sessionId: string;
  userId: string | null;
  isTeacher: boolean;
}) {
  return (
    <Tabs defaultValue="chat" className="space-y-4">
      <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl border border-slate-700 bg-slate-900/80 p-1">
        <TabsTrigger
          value="chat"
          className="rounded-lg text-slate-200 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
        >
          Chat
        </TabsTrigger>
        <TabsTrigger
          value="questions"
          className="rounded-lg text-slate-200 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
        >
          Questions
        </TabsTrigger>
        <TabsTrigger
          value="hands"
          className="rounded-lg text-slate-200 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
        >
          Mains
        </TabsTrigger>
      </TabsList>

      <TabsContent value="chat">
        <ChatPanel sessionId={sessionId} userId={userId} />
      </TabsContent>
      <TabsContent value="questions">
        <QuestionsPanel sessionId={sessionId} userId={userId} isTeacher={isTeacher} />
      </TabsContent>
      <TabsContent value="hands">
        <HandRaisePanel sessionId={sessionId} userId={userId} isTeacher={isTeacher} />
      </TabsContent>
    </Tabs>
  );
}

function useResolvedSession({
  courseId,
  sessionId,
  isAuthenticated,
}: {
  courseId: string;
  sessionId?: string;
  isAuthenticated: boolean;
}) {
  const parsedCourseId = parseNumericId(courseId);
  const parsedSessionId =
    sessionId && sessionId !== 'current' ? parseNumericId(sessionId) : null;

  const sessionByIdQuery = useGetSessionByIdQuery(parsedSessionId || '', {
    skip: !isAuthenticated || !parsedSessionId,
  });
  const courseSessionsQuery = useGetCourseSessionsQuery(parsedCourseId || '', {
    skip: !isAuthenticated || !!parsedSessionId || !parsedCourseId,
  });
  const courseLiveSessionQuery = useGetCourseLiveSessionQuery(parsedCourseId || '', {
    skip: !isAuthenticated || !!parsedSessionId || !parsedCourseId,
  });

  const session = useMemo(() => {
    if (sessionByIdQuery.data) {
      return sessionByIdQuery.data;
    }
    if (courseLiveSessionQuery.data) {
      return courseLiveSessionQuery.data;
    }
    if (courseSessionsQuery.data?.length) {
      return pickPreferredSession(courseSessionsQuery.data);
    }
    return null;
  }, [sessionByIdQuery.data, courseLiveSessionQuery.data, courseSessionsQuery.data]);

  const isLoading =
    sessionByIdQuery.isLoading || courseSessionsQuery.isLoading || courseLiveSessionQuery.isLoading;
  const hasAnySessionData = Boolean(session);
  const error =
    sessionByIdQuery.error ||
    (!hasAnySessionData && (courseLiveSessionQuery.error || courseSessionsQuery.error));

  return { session, isLoading, error, parsedCourseId };
}

export function SimpleLiveStudio({ courseId, sessionId, onNavigate }: BaseLiveProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isTeacher = user?.role === 'teacher';
  const {
    session,
    isLoading: isResolvingSession,
    error: resolveError,
    parsedCourseId,
  } = useResolvedSession({ courseId, sessionId, isAuthenticated });
  const canRequestStreamUrl = Boolean(
    session && (session.isLive || session.status === 'LIVE' || session.recordingUrl),
  );
  const { data: streamUrl } = useGetSessionStreamUrlQuery(session?.id || '', {
    skip: !isAuthenticated || !session || !canRequestStreamUrl,
  });

  const [startSession, { isLoading: isStarting }] = useStartSessionMutation();
  const [stopSession, { isLoading: isStopping }] = useStopSessionMutation();
  const [fetchVod, { isLoading: isFetchingVod }] = useFetchSessionVodMutation();
  const [actionError, setActionError] = useState<string | null>(null);

  const streamKey = session?.streamKey || 'n/a';
  const rtmpIngestUrl = session
    ? buildRtmpIngestUrl({ videoUrl: session.videoUrl || streamUrl || null })
    : null;
  const viewerPath = session ? `/courses/${session.courseId}/live/${session.id}` : null;
  const viewerAbsoluteUrl =
    viewerPath && typeof window !== 'undefined' ? `${window.location.origin}${viewerPath}` : null;
  const playerUrl = session
    ? buildPlayerUrl({
        streamKey: session.streamKey,
        videoUrl: session.videoUrl || streamUrl || null,
      })
    : null;

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

  const handleFetchVod = async () => {
    if (!session) {
      return;
    }

    setActionError(null);
    try {
      await fetchVod(session.id).unwrap();
    } catch (error) {
      setActionError(getErrorMessage(error, 'Recuperation VOD impossible'));
    }
  };

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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-100 via-slate-50 to-white pb-8 pt-4 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="container mx-auto max-w-[1440px] px-4">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-3 text-slate-700 hover:bg-slate-200/70 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => onNavigate('/teacher/live-sessions')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux sessions
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Studio live</h1>
              <p className="text-sm text-muted-foreground">
                {parsedCourseId ? `Cours #${parsedCourseId}` : 'Cours non specifie'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {session ? <SessionStatusPill session={session} /> : null}
            {session?.isLive ? (
              <Badge className="border-0 bg-red-500 text-white">
                <Radio className="mr-1 h-3 w-3 animate-pulse" />
                En direct
              </Badge>
            ) : null}
          </div>
        </div>

        <Alert className="mb-4 border-primary/40 bg-primary/5">
          <Video className="h-4 w-4" />
          <AlertTitle>Demarrage live</AlertTitle>
          <AlertDescription>
            Le bouton "Demarrer" active la session cote plateforme. Pour diffuser votre camera, utilisez le bloc
            "Publication camera" (Start Publishing) ou un logiciel RTMP.
          </AlertDescription>
        </Alert>

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
          <div className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5">
                <SessionPublisherCard session={session} streamUrl={streamUrl} />
                <SessionVideoCard session={session} streamUrl={streamUrl} />
              </div>

              <div className="space-y-5">
                <TeacherLiveOutputCard session={session} onNavigate={onNavigate} />

                <Card className="overflow-hidden border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
                  <CardHeader className="border-b border-slate-800/80 bg-slate-900/70">
                    <CardTitle className="text-base">Configuration stream</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4 text-sm">
                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                      <p className="font-medium text-slate-100">RTMP ingest URL</p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <code className="break-all text-xs text-slate-300">{rtmpIngestUrl || 'N/A'}</code>
                        {rtmpIngestUrl ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
                            onClick={() => copyToClipboard(rtmpIngestUrl)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                      <p className="font-medium text-slate-100">Stream key</p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <code className="break-all text-xs text-slate-300">{streamKey}</code>
                        {session.streamKey ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
                            onClick={() => copyToClipboard(session.streamKey || '')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                      <p className="font-medium text-slate-100">Lien viewer</p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <code className="break-all text-xs text-slate-300">{viewerAbsoluteUrl || 'N/A'}</code>
                        {viewerAbsoluteUrl ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
                            onClick={() => copyToClipboard(viewerAbsoluteUrl)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {playerUrl ? (
                      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                        <p className="font-medium text-slate-100">Lien player Ant Media</p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <code className="break-all text-xs text-slate-300">{playerUrl}</code>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
                            onClick={() => copyToClipboard(playerUrl)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
                  <CardHeader className="border-b border-slate-800/80 bg-slate-900/70">
                    <CardTitle className="text-base">Interactions live</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <LiveInteractionTabs sessionId={session.id} userId={user?.id || null} isTeacher />
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="sticky bottom-4 z-20 mx-auto flex w-fit flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/95 p-2 shadow-2xl backdrop-blur">
              <Button
                size="sm"
                className="rounded-full bg-emerald-500 px-4 text-slate-950 hover:bg-emerald-400"
                onClick={handleStart}
                disabled={session.isLive || isStarting}
              >
                {isStarting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                Demarrer
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="rounded-full px-4"
                onClick={handleStop}
                disabled={!session.isLive || isStopping}
              >
                {isStopping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Square className="mr-2 h-4 w-4" />}
                Arreter
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full px-4"
                onClick={handleFetchVod}
                disabled={isFetchingVod}
              >
                {isFetchingVod ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Tv className="mr-2 h-4 w-4" />}
                VOD
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
                onClick={() => {
                  if (viewerAbsoluteUrl) {
                    copyToClipboard(viewerAbsoluteUrl);
                  }
                }}
                disabled={!viewerAbsoluteUrl}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copier lien
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
                onClick={() => {
                  if (viewerPath) {
                    onNavigate(viewerPath);
                  }
                }}
                disabled={!viewerPath}
              >
                <Users className="mr-2 h-4 w-4" />
                Vue etudiant
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SimpleLiveViewer({ courseId, sessionId, onNavigate }: BaseLiveProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isStudent = user?.role === 'student';
  const { session, isLoading, error: resolveError } = useResolvedSession({
    courseId,
    sessionId,
    isAuthenticated,
  });
  const canUseLivePlayer = Boolean(session && (session.isLive || session.status === 'LIVE'));
  const { data: streamUrl } = useGetSessionStreamUrlQuery(session?.id || '', {
    skip: !isAuthenticated || !session || !canUseLivePlayer,
  });
  const sessionPath = session ? `/courses/${session.courseId}/live/${session.id}` : null;
  const sessionAbsoluteUrl =
    sessionPath && typeof window !== 'undefined' ? `${window.location.origin}${sessionPath}` : null;
  const [joinSession, { isLoading: isJoining }] = useJoinSessionMutation();
  const [joinError, setJoinError] = useState<string | null>(null);
  const joinedForSessionRef = useRef<string | null>(null);

  useEffect(() => {
    const join = async () => {
      if (!session || !isStudent || !isAuthenticated) {
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
  }, [session, isStudent, isAuthenticated, joinSession]);

  if (!isAuthenticated) {
    return (
      <UserGuard
        allowed={false}
        message="Connectez-vous pour acceder aux sessions live."
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-100 via-slate-50 to-white pb-8 pt-4 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="container mx-auto max-w-[1440px] px-4">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-3 text-slate-700 hover:bg-slate-200/70 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => onNavigate(`/courses/${courseId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au cours
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Session live</h1>
              <p className="text-sm text-muted-foreground">Visionnage et interaction en temps reel</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {session ? <SessionStatusPill session={session} /> : null}
            {isJoining ? (
              <Badge variant="outline">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Connexion...
              </Badge>
            ) : null}
          </div>
        </div>

        {joinError ? (
          <Alert variant="destructive" className="mb-4">
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
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {getErrorMessage(resolveError, 'Impossible de charger la session')}
            </AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
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
          <div className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <SessionVideoCard session={session} streamUrl={streamUrl} />

              <div className="space-y-5">
                <Card className="overflow-hidden border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
                  <CardHeader className="border-b border-slate-800/80 bg-slate-900/70">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="h-4 w-4 text-sky-300" />
                      Infos session
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4 text-sm">
                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Etat</p>
                      <p className="mt-1 font-medium">{getSessionStatusLabel(session.status, session.isLive)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Date</p>
                      <p className="mt-1 font-medium">{formatSessionDate(session.scheduledAt)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Enregistrement</p>
                      <p className="mt-1 font-medium">
                        {session.recordingEnabled ? 'active' : 'desactive'}
                      </p>
                    </div>
                    {session.recordingUrl ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            window.open(session.recordingUrl || '', '_blank', 'noopener,noreferrer');
                          }
                        }}
                      >
                        <Tv className="mr-2 h-4 w-4" />
                        Voir le replay
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
                  <CardHeader className="border-b border-slate-800/80 bg-slate-900/70">
                    <CardTitle className="text-base">Interactions live</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <LiveInteractionTabs sessionId={session.id} userId={user?.id || null} isTeacher={false} />
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="sticky bottom-4 z-20 mx-auto flex w-fit flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/95 p-2 shadow-2xl backdrop-blur">
              <Button
                size="sm"
                variant="destructive"
                className="rounded-full px-4"
                onClick={() => onNavigate(`/courses/${courseId}`)}
              >
                <Square className="mr-2 h-4 w-4" />
                Quitter
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
                onClick={() => {
                  if (sessionAbsoluteUrl) {
                    copyToClipboard(sessionAbsoluteUrl);
                  }
                }}
                disabled={!sessionAbsoluteUrl}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copier lien
              </Button>
              {session.recordingUrl ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full px-4"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.open(session.recordingUrl || '', '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  <Tv className="mr-2 h-4 w-4" />
                  Replay
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {isStudent && session?.isLive ? (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-700 dark:text-red-300">
            <span className="inline-flex items-center gap-1">
              <Radio className="h-3 w-3 animate-pulse" />
              Session en direct.
            </span>{' '}
            Si vous ne voyez pas le flux, verifiez que Ant Media est accessible.
          </div>
        ) : null}
      </div>
    </div>
  );
}
