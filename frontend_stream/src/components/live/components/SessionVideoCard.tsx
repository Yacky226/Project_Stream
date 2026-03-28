import { useMemo } from 'react';
import { Maximize, Pause, Play, Settings2, Tv, Users, Volume2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import type { LiveSession } from '../../../types/live';
import { buildPlayerUrl, formatSessionDate, isLiveKitAccessUrl, parseLiveKitAccessUrl } from '../liveSession.utils';
import { LiveKitRoomView } from '../LiveKitRoomView';
import { SessionStatusPill } from './SessionStatusPill';

interface SessionVideoCardProps {
  session: LiveSession | null;
  streamUrl?: string;
  disableLiveKitEmbed?: boolean;
  onRefreshAccessUrl?: () => Promise<unknown> | void;
  variant?: 'card' | 'stage';
  instructorName?: string | null;
  instructorRole?: string | null;
}

export function SessionVideoCard({
  session,
  streamUrl,
  disableLiveKitEmbed = false,
  onRefreshAccessUrl,
  variant = 'card',
  instructorName,
  instructorRole,
}: SessionVideoCardProps) {
  const effectiveVideoUrl = streamUrl || session?.videoUrl || null;
  const canUseLivePlayer = Boolean(session && (session.isLive || session.status === 'LIVE'));
  const isLiveKitRoom = Boolean(session && isLiveKitAccessUrl(effectiveVideoUrl));
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

    if (isLiveKitRoom && effectiveVideoUrl?.startsWith('http')) {
      return effectiveVideoUrl;
    }

    return buildPlayerUrl({
      videoUrl: effectiveVideoUrl,
    });
  }, [session, effectiveVideoUrl, canUseLivePlayer, isLiveKitRoom]);

  const liveKitAccess = useMemo(
    () => parseLiveKitAccessUrl(playerUrl || effectiveVideoUrl),
    [effectiveVideoUrl, playerUrl],
  );

  const canEmbedLiveKit =
    !disableLiveKitEmbed &&
    !replayUrl &&
    canUseLivePlayer &&
    Boolean(liveKitAccess?.token && liveKitAccess.wsUrl);
  const instructorLabel = (instructorName || '').trim() || 'Dr. Elena Kostic';
  const instructorTag = (instructorRole || '').trim() || 'Lead Instructor';

  const mediaBlock = replayUrl ? (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
      <div className="absolute left-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white">
        Replay
      </div>
      <video src={replayUrl} controls preload="metadata" className="h-full w-full object-cover" />
    </div>
  ) : canEmbedLiveKit ? (
    <LiveKitRoomView
      accessUrl={playerUrl || effectiveVideoUrl}
      mode="viewer"
      onRequestFreshAccess={onRefreshAccessUrl}
    />
  ) : (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
      <div className="absolute left-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white">
        En direct
      </div>

      {playerUrl ? (
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
  );

  if (variant === 'stage') {
    if (canEmbedLiveKit) {
      return (
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <LiveKitRoomView
              accessUrl={playerUrl || effectiveVideoUrl}
              mode="viewer"
              onRequestFreshAccess={onRefreshAccessUrl}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-2xl">
          {replayUrl ? (
            <video src={replayUrl} controls preload="metadata" className="h-full w-full object-cover" />
          ) : playerUrl ? (
            <iframe
              title="Live player stage"
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

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur">
              <Play className="h-7 w-7 fill-white text-white" />
            </div>
          </div>

          <div className="absolute left-4 top-4 inline-flex items-center gap-3 rounded-xl border border-white/30 bg-white/80 px-3 py-2 backdrop-blur">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1152d4] text-white">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">{instructorLabel}</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
                {instructorTag}
              </p>
            </div>
          </div>

          <div className="absolute left-4 top-20 rounded-full bg-black/65 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
            {replayUrl ? 'Replay' : 'En direct'}
          </div>

          <div className="absolute inset-x-0 bottom-0 space-y-3 p-4 text-white">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/30">
              <div className="h-full w-2/3 rounded-full bg-[#1152d4]" />
            </div>
            <div className="flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-3">
                <Pause className="h-4 w-4" />
                <Volume2 className="h-4 w-4" />
                <span>{replayUrl ? 'Replay' : '45:12 / 01:30:00'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Settings2 className="h-4 w-4" />
                <Maximize className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
        {isLiveKitRoom && playerUrl && !canEmbedLiveKit ? (
          <a
            href={playerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-xs font-medium text-blue-600 underline underline-offset-4"
          >
            Ouvrir la salle LiveKit dans un nouvel onglet
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader className="space-y-3 border-b border-slate-200 bg-slate-50 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold md:text-lg">
            <Tv className="h-4 w-4 text-blue-600" />
            {replayUrl ? 'Replay video' : isLiveKitRoom ? 'Flux LiveKit' : 'Flux principal'}
          </CardTitle>
          {session ? <SessionStatusPill session={session} /> : null}
        </div>
        <CardDescription className="text-slate-500">
          {session
            ? `Session planifiee le ${formatSessionDate(session.scheduledAt)}`
            : 'Aucune session selectionnee'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-4 md:p-5">
        {mediaBlock}

        {replayUrl ? (
          <a
            href={replayUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-xs font-medium text-blue-600 underline underline-offset-4"
          >
            Ouvrir le replay dans un nouvel onglet
          </a>
        ) : (
          <p className="text-xs text-slate-500">
            {canEmbedLiveKit
              ? 'Diffusion LiveKit integree a la plateforme.'
              : isLiveKitRoom
                ? 'Session LiveKit: ouverture dans une salle externe en fallback.'
                : 'Si l ecran reste noir, attendez que l enseignant lance la publication camera.'}
          </p>
        )}

        {isLiveKitRoom && playerUrl && !canEmbedLiveKit ? (
          <a
            href={playerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-xs font-medium text-blue-600 underline underline-offset-4"
          >
            Ouvrir la salle LiveKit dans un nouvel onglet
          </a>
        ) : null}
      </CardContent>
    </Card>
  );
}
