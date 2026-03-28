import type {
  EnrichedStudentLiveSession,
  SessionFilter,
} from './studentLiveSessions.types';

export function matchesStudentSessionFilter(
  filter: SessionFilter,
  session: Pick<EnrichedStudentLiveSession, 'isLive' | 'status' | 'scheduledAt'>,
): boolean {
  if (filter === 'all') return true;
  if (filter === 'live') return session.isLive || session.status === 'LIVE';
  if (filter === 'ended') return session.status === 'ENDED';
  return !session.isLive && session.status !== 'ENDED' && new Date(session.scheduledAt).getTime() >= Date.now();
}

export function sortStudentSessions<T extends Pick<EnrichedStudentLiveSession, 'isLive' | 'status' | 'scheduledAt'>>(
  sessions: T[],
): T[] {
  return [...sessions].sort((a, b) => {
    const aLive = a.isLive || a.status === 'LIVE';
    const bLive = b.isLive || b.status === 'LIVE';
    if (aLive && !bLive) return -1;
    if (!aLive && bLive) return 1;
    if (a.status === 'ENDED' && b.status !== 'ENDED') return 1;
    if (a.status !== 'ENDED' && b.status === 'ENDED') return -1;
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  });
}

export function getStudentSessionFilterLabel(filter: SessionFilter): string {
  if (filter === 'all') return 'All';
  if (filter === 'live') return 'Live';
  if (filter === 'upcoming') return 'Upcoming';
  return 'Ended';
}
