import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  RefreshCcw,
  Users,
  Video,
  VideoOff,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Room, RoomEvent, Track, type AudioTrack, type VideoTrack } from 'livekit-client';
import { parseLiveKitAccessUrl } from './liveSession.utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';

type LiveKitMode = 'viewer' | 'host';
type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

interface LiveKitRoomViewProps {
  accessUrl?: string | null;
  mode: LiveKitMode;
  autoPublish?: boolean;
  className?: string;
  onRequestFreshAccess?: () => Promise<unknown> | void;
}

function LiveKitVideoTrack({
  track,
  muted,
}: {
  track: VideoTrack | null;
  muted?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !track) {
      return;
    }

    const mediaElement = track.attach();
    if (mediaElement instanceof HTMLVideoElement) {
      mediaElement.autoplay = true;
      mediaElement.playsInline = true;
      mediaElement.muted = Boolean(muted);
      mediaElement.className = 'h-full w-full object-cover';
    }

    container.innerHTML = '';
    container.appendChild(mediaElement);

    return () => {
      try {
        track.detach(mediaElement);
      } catch {}
      mediaElement.remove();
    };
  }, [muted, track]);

  return <div ref={containerRef} className="h-full w-full" />;
}

function LiveKitAudioTracks({ tracks }: { tracks: AudioTrack[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const attachedElements: HTMLMediaElement[] = [];
    container.innerHTML = '';

    tracks.forEach((track) => {
      const mediaElement = track.attach();
      if (mediaElement instanceof HTMLAudioElement) {
        mediaElement.autoplay = true;
        mediaElement.playsInline = true;
      }
      mediaElement.classList.add('hidden');
      container.appendChild(mediaElement);
      attachedElements.push(mediaElement);
    });

    return () => {
      attachedElements.forEach((mediaElement) => {
        try {
          mediaElement.remove();
        } catch {}
      });
      tracks.forEach((track) => {
        try {
          track.detach();
        } catch {}
      });
    };
  }, [tracks]);

  return <div ref={containerRef} aria-hidden className="hidden" />;
}

export function LiveKitRoomView({
  accessUrl,
  mode,
  autoPublish = false,
  className,
  onRequestFreshAccess,
}: LiveKitRoomViewProps) {
  const access = useMemo(() => parseLiveKitAccessUrl(accessUrl), [accessUrl]);
  const roomRef = useRef<Room | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [mainTrack, setMainTrack] = useState<VideoTrack | null>(null);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [reconnectTick, setReconnectTick] = useState(0);

  const canPublish = Boolean(access?.canPublish && mode === 'host');
  const canConnect = Boolean(access?.wsUrl && access?.token);

  const refreshTracks = useCallback(() => {
    const room = roomRef.current;
    if (!room) {
      setMainTrack(null);
      setAudioTracks([]);
      setParticipantCount(0);
      setCameraEnabled(false);
      setMicrophoneEnabled(false);
      setScreenShareEnabled(false);
      return;
    }

    const remoteVideoTracks: Array<{ track: VideoTrack; source: string }> = [];
    const localVideoTracks: Array<{ track: VideoTrack; source: string }> = [];
    const nextAudioTracks: AudioTrack[] = [];

    room.remoteParticipants.forEach((participant) => {
      participant.trackPublications.forEach((publication) => {
        if (!publication.track) {
          return;
        }
        if (publication.kind === Track.Kind.Video) {
          remoteVideoTracks.push({
            track: publication.track as VideoTrack,
            source: String(publication.source || ''),
          });
        }
        if (publication.kind === Track.Kind.Audio) {
          nextAudioTracks.push(publication.track as AudioTrack);
        }
      });
    });

    room.localParticipant.videoTrackPublications.forEach((publication) => {
      if (!publication.track) {
        return;
      }
      localVideoTracks.push({
        track: publication.track as VideoTrack,
        source: String(publication.source || ''),
      });
    });

    const screenSource = String(Track.Source.ScreenShare);
    let candidateTrack: VideoTrack | null = null;

    if (mode === 'host') {
      candidateTrack =
        localVideoTracks.find((entry) => entry.source === screenSource)?.track ||
        localVideoTracks[0]?.track ||
        remoteVideoTracks.find((entry) => entry.source === screenSource)?.track ||
        remoteVideoTracks[0]?.track ||
        null;
    } else {
      candidateTrack =
        remoteVideoTracks.find((entry) => entry.source === screenSource)?.track ||
        remoteVideoTracks[0]?.track ||
        null;
    }

    setMainTrack(candidateTrack);
    setAudioTracks(nextAudioTracks);
    setParticipantCount(room.remoteParticipants.size + 1);
    setCameraEnabled(Boolean((room.localParticipant as { isCameraEnabled?: boolean }).isCameraEnabled));
    setMicrophoneEnabled(
      Boolean((room.localParticipant as { isMicrophoneEnabled?: boolean }).isMicrophoneEnabled),
    );
    setScreenShareEnabled(
      Boolean((room.localParticipant as { isScreenShareEnabled?: boolean }).isScreenShareEnabled),
    );
  }, [mode]);

  useEffect(() => {
    if (!canConnect || !access?.wsUrl || !access.token) {
      setConnectionState('idle');
      setConnectionError(null);
      return;
    }

    let cancelled = false;
    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    roomRef.current = room;
    setConnectionState('connecting');
    setConnectionError(null);

    const sync = () => {
      if (!cancelled) {
        refreshTracks();
      }
    };

    room.on(RoomEvent.TrackSubscribed, sync);
    room.on(RoomEvent.TrackUnsubscribed, sync);
    room.on(RoomEvent.TrackPublished, sync);
    room.on(RoomEvent.TrackUnpublished, sync);
    room.on(RoomEvent.LocalTrackPublished, sync);
    room.on(RoomEvent.LocalTrackUnpublished, sync);
    room.on(RoomEvent.ParticipantConnected, sync);
    room.on(RoomEvent.ParticipantDisconnected, sync);
    room.on(RoomEvent.ActiveSpeakersChanged, sync);
    room.on(RoomEvent.ConnectionStateChanged, (state) => {
      const normalized = String(state).toLowerCase();
      if (normalized.includes('connected')) {
        setConnectionState('connected');
      } else if (normalized.includes('connecting') || normalized.includes('reconnecting')) {
        setConnectionState('connecting');
      } else if (normalized.includes('disconnected')) {
        setConnectionState('disconnected');
      }
    });
    room.on(RoomEvent.Disconnected, () => {
      if (!cancelled) {
        setConnectionState('disconnected');
      }
    });

    const connectRoom = async () => {
      try {
        await room.connect(access.wsUrl, access.token);
        if (cancelled) {
          return;
        }
        setConnectionState('connected');
        if (mode === 'host' && autoPublish && canPublish) {
          await room.localParticipant.setMicrophoneEnabled(true);
          await room.localParticipant.setCameraEnabled(true);
        }
        sync();
      } catch (error) {
        if (cancelled) {
          return;
        }
        setConnectionState('error');
        setConnectionError(
          error instanceof Error ? error.message : 'Connexion LiveKit impossible.',
        );
      }
    };

    void connectRoom();

    return () => {
      cancelled = true;
      try {
        room.removeAllListeners();
        room.disconnect(true);
      } catch {}
      roomRef.current = null;
      setMainTrack(null);
      setAudioTracks([]);
    };
  }, [
    access?.token,
    access?.wsUrl,
    accessUrl,
    autoPublish,
    canConnect,
    canPublish,
    mode,
    reconnectTick,
    refreshTracks,
  ]);

  const toggleCamera = async () => {
    const room = roomRef.current;
    if (!room || !canPublish) {
      return;
    }
    setConnectionError(null);
    try {
      await room.localParticipant.setCameraEnabled(!cameraEnabled);
      refreshTracks();
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Activation camera impossible.');
    }
  };

  const toggleMicrophone = async () => {
    const room = roomRef.current;
    if (!room || !canPublish) {
      return;
    }
    setConnectionError(null);
    try {
      await room.localParticipant.setMicrophoneEnabled(!microphoneEnabled);
      refreshTracks();
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Activation micro impossible.');
    }
  };

  const toggleScreenShare = async () => {
    const room = roomRef.current;
    if (!room || !canPublish) {
      return;
    }
    setConnectionError(null);
    try {
      await room.localParticipant.setScreenShareEnabled(!screenShareEnabled);
      refreshTracks();
    } catch (error) {
      setConnectionError(
        error instanceof Error ? error.message : 'Partage ecran impossible.',
      );
    }
  };

  const handleReconnect = async () => {
    setConnectionError(null);
    try {
      if (onRequestFreshAccess) {
        await onRequestFreshAccess();
      }
    } catch {
      // Reconnect should still proceed even if token refresh fails.
    } finally {
      setReconnectTick((value) => value + 1);
    }
  };

  const mediaContainerClass = canConnect
    ? 'relative mt-3 aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0b1222] shadow-2xl'
    : 'relative mt-3 h-56 w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 shadow-xl';

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Badge
            variant={connectionState === 'connected' ? 'secondary' : 'outline'}
            className="border-slate-300 bg-white text-slate-700"
          >
            {connectionState === 'connected' ? (
              <Wifi className="mr-1 h-3 w-3 text-emerald-600" />
            ) : (
              <WifiOff className="mr-1 h-3 w-3 text-slate-500" />
            )}
            {connectionState === 'connected'
              ? 'Connected'
              : connectionState === 'connecting'
                ? 'Connecting'
                : connectionState === 'error'
                  ? 'Error'
                  : 'Idle'}
          </Badge>
          <Badge variant="outline" className="border-slate-300 bg-white text-slate-600">
            <Users className="mr-1 h-3 w-3" />
            {participantCount}
          </Badge>
          {access?.roomName ? (
            <Badge variant="outline" className="border-slate-300 bg-white text-slate-600">
              Room: {access.roomName}
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            onClick={() => {
              void handleReconnect();
            }}
            disabled={connectionState === 'connecting'}
          >
            <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
            Reconnect
          </Button>
        </div>
      </div>

      <div className={mediaContainerClass}>
        {connectionState === 'connecting' ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-slate-200">
            <Loader2 className="h-4 w-4 animate-spin" />
            Connexion LiveKit...
          </div>
        ) : mainTrack ? (
          <LiveKitVideoTrack track={mainTrack} muted={mode === 'host'} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-slate-300">
            {canConnect
              ? connectionState === 'connected'
              ? 'Aucune piste video active pour le moment.'
              : 'Le flux LiveKit sera affiche ici une fois la connexion etablie.'
              : 'Demarrez la session live pour obtenir un token LiveKit et activer le studio.'}
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-100">
          {mode === 'host' ? 'Studio LiveKit' : 'LiveKit Viewer'}
        </div>
      </div>

      <LiveKitAudioTracks tracks={audioTracks} />

      {mode === 'host' && canConnect ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              void toggleCamera();
            }}
            disabled={!canPublish || connectionState !== 'connected'}
            className={`rounded-full px-4 ${
              cameraEnabled
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            {cameraEnabled ? <Video className="mr-2 h-4 w-4" /> : <VideoOff className="mr-2 h-4 w-4" />}
            {cameraEnabled ? 'Camera on' : 'Camera off'}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              void toggleMicrophone();
            }}
            disabled={!canPublish || connectionState !== 'connected'}
            className={`rounded-full px-4 ${
              microphoneEnabled
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            {microphoneEnabled ? <Mic className="mr-2 h-4 w-4" /> : <MicOff className="mr-2 h-4 w-4" />}
            {microphoneEnabled ? 'Mic on' : 'Mic off'}
          </Button>

          <Button
            type="button"
            size="sm"
            variant={screenShareEnabled ? 'secondary' : 'outline'}
            onClick={() => {
              void toggleScreenShare();
            }}
            disabled={!canPublish || connectionState !== 'connected'}
            className={`rounded-full px-4 ${
              screenShareEnabled
                ? 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {screenShareEnabled ? (
              <Monitor className="mr-2 h-4 w-4" />
            ) : (
              <MonitorOff className="mr-2 h-4 w-4" />
            )}
            {screenShareEnabled ? 'Stop share' : 'Share screen'}
          </Button>
        </div>
      ) : null}

      {!canConnect ? (
        <Alert className="mt-3 border-amber-200 bg-amber-50 text-amber-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Lien LiveKit incomplet. Demarrez le live pour obtenir un token de connexion valide.
          </AlertDescription>
        </Alert>
      ) : null}

      {connectionError ? (
        <Alert variant="destructive" className="mt-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
