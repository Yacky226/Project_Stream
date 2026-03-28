import type { LiveSession } from '../../types/live';

type MutationLikeError =
  | {
      status?: number;
      data?: string | { message?: string; error?: string };
    }
  | undefined;

export function getErrorMessage(error: unknown, fallback: string): string {
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

export function pickPreferredSession(sessions: LiveSession[]): LiveSession | null {
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

export function sortSessions(sessions: LiveSession[]): LiveSession[] {
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

export function copyToClipboard(value: string) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return;
  }
  void navigator.clipboard.writeText(value);
}
