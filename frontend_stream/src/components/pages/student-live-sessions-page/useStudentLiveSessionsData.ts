import { useMemo, useState } from 'react';
import { useGetAllSessionsQuery, useGetCoursesQuery } from '../../../store/api/liveApi';
import type { StudentDashboardCourse } from '../../../types/dashboard';
import type {
  EnrichedStudentLiveSession,
  SessionFilter,
  StudentLiveSessionsSummary,
} from './studentLiveSessions.types';
import {
  matchesStudentSessionFilter,
  sortStudentSessions,
} from './studentLiveSessions.utils';

interface UseStudentLiveSessionsDataParams {
  shouldFetch: boolean;
  enrolledCourses: StudentDashboardCourse[];
}

export interface StudentLiveSessionsData {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filter: SessionFilter;
  setFilter: (value: SessionFilter) => void;
  isLoading: boolean;
  hasError: boolean;
  refetch: () => void;
  enrolledSessions: EnrichedStudentLiveSession[];
  discoverySessions: EnrichedStudentLiveSession[];
  summary: StudentLiveSessionsSummary;
  isEnrolledCourse: (courseId: string | number) => boolean;
}

export function useStudentLiveSessionsData({
  shouldFetch,
  enrolledCourses,
}: UseStudentLiveSessionsDataParams): StudentLiveSessionsData {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<SessionFilter>('all');

  const {
    data: sessions = [],
    isLoading,
    error,
    refetch,
  } = useGetAllSessionsQuery(undefined, {
    skip: !shouldFetch,
  });
  const { data: courses = [] } = useGetCoursesQuery(undefined, {
    skip: !shouldFetch,
  });

  const enrolledCourseIds = useMemo(
    () => new Set(enrolledCourses.map((course) => String(course.id))),
    [enrolledCourses],
  );
  const titleByCourseId = useMemo(() => {
    const map = new Map<string, string>();
    courses.forEach((course: { id: string | number; title?: string }) => {
      map.set(String(course.id), course.title || `Course #${course.id}`);
    });
    enrolledCourses.forEach((course) => {
      map.set(String(course.id), course.title);
    });
    return map;
  }, [courses, enrolledCourses]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const enrichedSessions = useMemo(() => {
    return sortStudentSessions(
      sessions.map((session) => ({
        ...session,
        title: titleByCourseId.get(String(session.courseId)) || `Course #${session.courseId}`,
      })),
    ).filter((session) => {
      if (!matchesStudentSessionFilter(filter, session)) return false;
      if (!normalizedSearch) return true;
      return [session.title, session.courseId, session.teacherId, session.id]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [filter, normalizedSearch, sessions, titleByCourseId]);

  const enrolledSessions = useMemo(
    () =>
      enrichedSessions.filter((session) =>
        enrolledCourseIds.has(String(session.courseId)),
      ),
    [enrichedSessions, enrolledCourseIds],
  );
  const discoverySessions = useMemo(
    () =>
      enrichedSessions.filter(
        (session) => !enrolledCourseIds.has(String(session.courseId)),
      ),
    [enrichedSessions, enrolledCourseIds],
  );

  const summary = useMemo(
    () => ({
      liveCount: enrichedSessions.filter((session) => session.isLive || session.status === 'LIVE')
        .length,
      upcomingCount: enrichedSessions.filter(
        (session) =>
          !session.isLive &&
          session.status !== 'ENDED' &&
          new Date(session.scheduledAt).getTime() >= Date.now(),
      ).length,
    }),
    [enrichedSessions],
  );

  const isEnrolledCourse = (courseId: string | number) =>
    enrolledCourseIds.has(String(courseId));

  return {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    isLoading,
    hasError: Boolean(error),
    refetch,
    enrolledSessions,
    discoverySessions,
    summary,
    isEnrolledCourse,
  };
}
