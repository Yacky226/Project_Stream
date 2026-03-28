import type { LiveSession, LiveSessionStatus } from '../../types/live';

export interface LiveKitAccessDetails {
  rawUrl: string;
  wsUrl: string | null;
  token: string | null;
  roomName: string | null;
  identity: string | null;
  canPublish: boolean;
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

export function buildPlayerUrl(session: Pick<LiveSession, 'videoUrl'>): string | null {
  if (isLiveKitAccessUrl(session.videoUrl) && session.videoUrl?.startsWith('http')) {
    return session.videoUrl;
  }
  return null;
}
