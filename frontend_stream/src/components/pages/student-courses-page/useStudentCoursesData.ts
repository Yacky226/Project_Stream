import { useMemo, useState } from 'react';
import { useGetAllSessionsQuery, useGetCoursesQuery } from '../../../store/api/liveApi';
import { useEnrollCourseMutation } from '../../../store/api/userApi';
import { useStudentSpaceData } from '../../student/StudentSpaceShared';
import type { CourseSort } from './studentCourses.types';
import { sortCourses } from './studentCourses.utils';

export interface StudentCoursesDataModel {
  shared: ReturnType<typeof useStudentSpaceData>;
  ready: boolean;
  searchQuery: string;
  sortBy: CourseSort;
  setSearchQuery: (value: string) => void;
  setSortBy: (value: CourseSort) => void;
  actionError: string | null;
  enrollingCourseId: string | null;
  isEnrolling: boolean;
  catalogError: unknown;
  sessionsError: unknown;
  sessions: ReturnType<typeof useGetAllSessionsQuery>['data'];
  activeCourses: ReturnType<typeof useStudentSpaceData>['dashboard']['courses'];
  completedCourses: ReturnType<typeof useStudentSpaceData>['dashboard']['courses'];
  abandonedCourses: ReturnType<typeof useStudentSpaceData>['dashboard']['courses'];
  focusCourse: ReturnType<typeof useStudentSpaceData>['dashboard']['courses'][number] | null;
  averageProgress: number;
  recommendedCourses: ReturnType<typeof useGetCoursesQuery>['data'];
  handleEnroll: (courseId: string, onNavigate: (path: string | number) => void) => Promise<void>;
}

export function useStudentCoursesData(): StudentCoursesDataModel {
  const shared = useStudentSpaceData();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<CourseSort>('recent');
  const [actionError, setActionError] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const ready = shared.status === 'ready' && Boolean(shared.dashboard);
  const { data: catalogCourses = [], error: catalogError } = useGetCoursesQuery(undefined, {
    skip: !ready,
  });
  const { data: sessions = [], error: sessionsError } = useGetAllSessionsQuery(undefined, {
    skip: !ready,
  });
  const [enrollCourse, { isLoading: isEnrolling }] = useEnrollCourseMutation();

  const normalizedSearch = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

  const filteredCourses = useMemo(() => {
    if (!shared.dashboard) return [];
    return sortCourses(
      shared.dashboard.courses.filter((course) =>
        [course.title, course.description, course.category, course.status]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch),
      ),
      sortBy,
    );
  }, [normalizedSearch, shared.dashboard, sortBy]);

  const activeCourses = useMemo(
    () => filteredCourses.filter((course) => course.status === 'ACTIF'),
    [filteredCourses],
  );
  const completedCourses = useMemo(
    () => filteredCourses.filter((course) => course.status === 'TERMINE'),
    [filteredCourses],
  );
  const abandonedCourses = useMemo(
    () => filteredCourses.filter((course) => course.status === 'ABANDONNE'),
    [filteredCourses],
  );
  const focusCourse = activeCourses[0] ?? null;

  const averageProgress = useMemo(() => {
    if (!filteredCourses.length) return 0;
    return Math.round(
      filteredCourses.reduce((sum, course) => sum + course.progress, 0) / filteredCourses.length,
    );
  }, [filteredCourses]);

  const recommendedCourses = useMemo(() => {
    if (!shared.dashboard) return [];

    const enrolledIds = new Set(shared.dashboard.courses.map((course) => String(course.id)));
    const activeCategories = new Set(
      shared.dashboard.courses
        .filter((course) => course.status === 'ACTIF')
        .map((course) => course.category.toLowerCase()),
    );

    return catalogCourses
      .filter((course) => !enrolledIds.has(String(course.id)))
      .sort((a, b) => {
        const aMatch = activeCategories.has(a.category.toLowerCase()) ? 1 : 0;
        const bMatch = activeCategories.has(b.category.toLowerCase()) ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
        return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
      })
      .filter((course) =>
        normalizedSearch
          ? [course.title, course.description, course.category]
              .join(' ')
              .toLowerCase()
              .includes(normalizedSearch)
          : true,
      )
      .slice(0, 3);
  }, [catalogCourses, normalizedSearch, shared.dashboard]);

  const handleEnroll = async (courseId: string, onNavigate: (path: string | number) => void) => {
    setActionError(null);
    setEnrollingCourseId(courseId);
    try {
      await enrollCourse({ coursId: courseId }).unwrap();
      onNavigate(`/courses/${courseId}`);
    } catch {
      setActionError('Enrollment failed for this course.');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  return {
    shared,
    ready,
    searchQuery,
    sortBy,
    setSearchQuery,
    setSortBy,
    actionError,
    enrollingCourseId,
    isEnrolling,
    catalogError,
    sessionsError,
    sessions,
    activeCourses,
    completedCourses,
    abandonedCourses,
    focusCourse,
    averageProgress,
    recommendedCourses,
    handleEnroll,
  };
}
