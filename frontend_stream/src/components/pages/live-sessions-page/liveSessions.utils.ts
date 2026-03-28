import type { LiveSession } from '../../../types/live';
import type { StatusFilter } from './liveSessions.types';

export function filterSessions(
  sessions: LiveSession[],
  query: string,
  statusFilter: StatusFilter,
): LiveSession[] {
  const normalizedQuery = query.trim().toLowerCase();

  return sessions
    .filter((session) => {
      const matchesSearch =
        !normalizedQuery ||
        session.id.toLowerCase().includes(normalizedQuery) ||
        session.courseId.toLowerCase().includes(normalizedQuery) ||
        session.teacherId.toLowerCase().includes(normalizedQuery);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'live' && (session.isLive || session.status === 'LIVE')) ||
        (statusFilter === 'scheduled' && !session.isLive && session.status !== 'ENDED') ||
        (statusFilter === 'ended' && session.status === 'ENDED');

      return matchesSearch && matchesStatus;
    })
    .sort((left, right) => {
      if (left.isLive && !right.isLive) {
        return -1;
      }
      if (!left.isLive && right.isLive) {
        return 1;
      }
      return new Date(right.scheduledAt).getTime() - new Date(left.scheduledAt).getTime();
    });
}
