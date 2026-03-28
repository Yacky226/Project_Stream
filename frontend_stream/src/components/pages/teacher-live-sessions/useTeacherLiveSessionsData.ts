import { useMemo } from 'react';
import { useGetTeacherSessionsQuery } from '../../../store/api/liveApi';
import { useTeacherSpaceData } from '../../teacher/TeacherSpaceShared';
import { buildTeacherStudioPath } from './teacherLiveSessions.utils';

export function useTeacherLiveSessionsData() {
  const shared = useTeacherSpaceData({ includeDashboard: true });
  const {
    data: sessions = [],
    isLoading: isLoadingSessions,
    error: sessionsError,
    refetch,
  } = useGetTeacherSessionsQuery(undefined, {
    skip: shared.status !== 'ready',
  });

  const activeLiveSession = useMemo(
    () => sessions.find((session) => session.isLive || session.status === 'LIVE') || null,
    [sessions],
  );

  const redirectTarget = activeLiveSession
    ? buildTeacherStudioPath(activeLiveSession.courseId, activeLiveSession.id)
    : null;

  return {
    shared,
    sessions,
    isLoadingSessions,
    sessionsError,
    refetch,
    activeLiveSession,
    redirectTarget,
  };
}
