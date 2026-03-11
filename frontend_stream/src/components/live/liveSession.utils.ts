import type { LiveSession, LiveSessionStatus } from '../../types/live';

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

  const match = videoUrl.match(/\/streams\/([^/.]+)\.m3u8/i);
  return match?.[1] || null;
}

export function buildPlayerUrl(session: Pick<LiveSession, 'videoUrl' | 'streamKey'>): string | null {
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
