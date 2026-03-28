import { useMemo } from 'react';
import { useGetCourseLiveSessionQuery, useGetCourseSessionsQuery, useGetSessionByIdQuery } from '../../../store/api/liveApi';
import { pickPreferredSession } from '../liveModule.utils';
import { parseNumericId } from '../liveSession.utils';

interface UseResolvedSessionParams {
  courseId: string;
  sessionId?: string;
  isAuthenticated: boolean;
}

export function useResolvedSession({ courseId, sessionId, isAuthenticated }: UseResolvedSessionParams) {
  const parsedCourseId = parseNumericId(courseId);
  const parsedSessionId = sessionId && sessionId !== 'current' ? parseNumericId(sessionId) : null;

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
