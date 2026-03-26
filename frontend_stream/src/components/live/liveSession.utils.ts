import type { LiveSession, LiveSessionStatus } from '../../types/live';

export interface LiveKitAccessDetails {
  rawUrl: string;
  wsUrl: string | null;
  token: string | null;
  roomName: string | null;
  identity: string | null;
  canPublish: boolean;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function normalizeAppName(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

function resolveAntMediaFromVideoUrl(videoUrl?: string | null): { base: string; app: string } | null {
  if (!videoUrl) {
    return null;
  }

  const match = videoUrl.match(/^(https?:\/\/[^/]+)\/([^/]+)\/streams\//i);
  if (!match) {
    return null;
  }

  return {
    base: trimTrailingSlash(match[1]),
    app: normalizeAppName(match[2]),
  };
}

function resolveAntMediaConfig(videoUrl?: string | null): { base: string; app: string } {
  const resolved = resolveAntMediaFromVideoUrl(videoUrl);
  if (resolved) {
    return resolved;
  }

  const env = import.meta.env as Record<string, string | undefined>;
  return {
    base: trimTrailingSlash(env.VITE_ANTMEDIA_BASE_URL || 'http://localhost:5080'),
    app: normalizeAppName(env.VITE_ANTMEDIA_APP || 'LiveApp'),
  };
}

export function parseNumericId(value?: string): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function toLocalDateTimeInput(value?: string | null): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatSessionDate(value?: string | null): string {
  if (!value) {
    return 'Date non planifiee';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Date non planifiee';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getSessionStatusLabel(status: LiveSessionStatus, isLive: boolean): string {
  if (isLive || status === 'LIVE') {
    return 'En direct';
  }
  if (status === 'ENDED') {
    return 'Terminee';
  }
  return 'Planifiee';
}

export function getSessionStatusVariant(
  status: LiveSessionStatus,
  isLive: boolean,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (isLive || status === 'LIVE') {
    return 'destructive';
  }
  if (status === 'ENDED') {
    return 'secondary';
  }
  return 'outline';
}

export function extractStreamKeyFromVideoUrl(videoUrl?: string | null): string | null {
  if (!videoUrl) {
    return null;
  }

  if (videoUrl.startsWith('livekit://room/')) {
    return videoUrl.replace('livekit://room/', '').trim() || null;
  }

  const match = videoUrl.match(/\/streams\/([^/.]+)\.m3u8/i);
  return match?.[1] || null;
}

export function isLiveKitAccessUrl(value?: string | null): boolean {
  if (!value) {
    return false;
  }

  return (
    value.startsWith('livekit://room/') ||
    value.includes('/custom?liveKitUrl=') ||
    value.includes('meet.livekit.io/custom')
  );
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const segments = token.split('.');
  if (segments.length < 2) {
    return null;
  }

  try {
    const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = `${base64}${'='.repeat((4 - (base64.length % 4 || 4)) % 4)}`;
    const decoded = atob(padded);
    const parsed = JSON.parse(decoded);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function parseLiveKitAccessUrl(value?: string | null): LiveKitAccessDetails | null {
  if (!value || !isLiveKitAccessUrl(value)) {
    return null;
  }

  if (value.startsWith('livekit://room/')) {
    const roomName = value.replace('livekit://room/', '').trim() || null;
    return {
      rawUrl: value,
      wsUrl: null,
      token: null,
      roomName,
      identity: null,
      canPublish: false,
    };
  }

  try {
    const parsedUrl = new URL(value);
    const wsUrl =
      parsedUrl.searchParams.get('liveKitUrl') ||
      parsedUrl.searchParams.get('livekitUrl') ||
      parsedUrl.searchParams.get('wsUrl') ||
      null;
    const token = parsedUrl.searchParams.get('token') || null;
    const payload = token ? decodeJwtPayload(token) : null;
    const videoGrant =
      payload && typeof payload.video === 'object'
        ? (payload.video as Record<string, unknown>)
        : null;

    return {
      rawUrl: value,
      wsUrl,
      token,
      roomName:
        (videoGrant && typeof videoGrant.room === 'string' ? videoGrant.room : null) ||
        null,
      identity:
        (payload && typeof payload.sub === 'string' ? payload.sub : null) ||
        (payload && typeof payload.name === 'string' ? payload.name : null) ||
        null,
      canPublish: Boolean(videoGrant?.canPublish),
    };
  } catch {
    return {
      rawUrl: value,
      wsUrl: null,
      token: null,
      roomName: null,
      identity: null,
      canPublish: false,
    };
  }
}

export function buildPlayerUrl(session: Pick<LiveSession, 'videoUrl' | 'streamKey'>): string | null {
  if (isLiveKitAccessUrl(session.videoUrl) && session.videoUrl?.startsWith('http')) {
    return session.videoUrl;
  }
  if (session.videoUrl?.startsWith('livekit://')) {
    return null;
  }

  const streamKey = session.streamKey || extractStreamKeyFromVideoUrl(session.videoUrl);

  if (session.videoUrl && streamKey) {
    const marker = '/streams/';
    const markerIndex = session.videoUrl.indexOf(marker);
    if (markerIndex > 0) {
      const antBase = session.videoUrl.slice(0, markerIndex);
      return `${antBase}/play.html?id=${streamKey}&playOrder=webrtc,hls`;
    }
  }

  if (!streamKey) {
    return null;
  }

  const { base, app } = resolveAntMediaConfig(session.videoUrl);
  return `${base}/${app}/play.html?id=${streamKey}&playOrder=webrtc,hls`;
}

export function buildPublishUrl(session: Pick<LiveSession, 'videoUrl' | 'streamKey'>): string | null {
  const streamKey = session.streamKey || extractStreamKeyFromVideoUrl(session.videoUrl);
  if (!streamKey) {
    return null;
  }

  if (session.videoUrl) {
    const marker = '/streams/';
    const markerIndex = session.videoUrl.indexOf(marker);
    if (markerIndex > 0) {
      const antBase = session.videoUrl.slice(0, markerIndex);
      return `${antBase}/publish.html?id=${streamKey}`;
    }
  }

  const { base, app } = resolveAntMediaConfig(session.videoUrl);
  return `${base}/${app}/publish.html?id=${streamKey}`;
}

export function buildAntMediaWebSocketUrl(videoUrl?: string | null): string {
  const { base, app } = resolveAntMediaConfig(videoUrl);
  const protocol = base.startsWith('https://') ? 'wss://' : 'ws://';
  const host = base.replace(/^https?:\/\//, '');
  return `${protocol}${host}/${app}/websocket`;
}

export function buildAntMediaScriptCandidates(videoUrl?: string | null): string[] {
  const { base, app } = resolveAntMediaConfig(videoUrl);
  return [
    // Prefer stable UMD bundles first to avoid ESM syntax issues in classic script loading.
    'https://cdn.jsdelivr.net/npm/@antmedia/webrtc_adaptor/dist/browser/webrtc_adaptor.js',
    'https://cdn.jsdelivr.net/npm/@antmedia/webrtc_adaptor/dist/browser/webrtc_adaptor.min.js',
    `${base}/${app}/js/webrtc_adaptor.js`,
    `${base}/${app}/js/webrtc_adaptor.min.js`,
  ];
}

export function buildAntMediaDependencyScriptCandidates(): string[] {
  return [
    // Required by some Ant Media adaptor builds for video effects plugin initialization.
    'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js',
  ];
}

export function buildRtmpIngestUrl(session: Pick<LiveSession, 'videoUrl'>): string {
  const env = import.meta.env as Record<string, string | undefined>;
  const envBase = trimTrailingSlash(env.VITE_ANTMEDIA_BASE_URL || 'http://localhost:5080');
  const envApp = (env.VITE_ANTMEDIA_APP || 'LiveApp').replace(/^\/+|\/+$/g, '');

  if (!session.videoUrl) {
    return `rtmp://${envBase.replace(/^https?:\/\//, '')}/${envApp}`;
  }

  const match = session.videoUrl.match(/^(https?:\/\/[^/]+)\/([^/]+)\/streams\//i);
  if (!match) {
    return `rtmp://${envBase.replace(/^https?:\/\//, '')}/${envApp}`;
  }

  const host = match[1].replace(/^https?:\/\//, '');
  const app = match[2];
  return `rtmp://${host}/${app}`;
}
