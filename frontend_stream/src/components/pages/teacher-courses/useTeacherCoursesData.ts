import { useMemo, useState } from 'react';
import { useGetTeacherDashboardQuery } from '../../../store/api/dashboardApi';
import type { TeacherDashboardCourse } from '../../../types/dashboard';
import { useTeacherSpaceData } from '../../teacher/TeacherSpaceShared';
import { filterAndSortTeacherCourses } from './teacherCourses.utils';

export function useTeacherCoursesData() {
  const shared = useTeacherSpaceData({ includeDashboard: false });
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isFetching, error, refetch } = useGetTeacherDashboardQuery(undefined, {
    skip: shared.status !== 'ready',
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const allCourses: TeacherDashboardCourse[] = data?.courses ?? [];

  const filteredCourses = useMemo(
    () => filterAndSortTeacherCourses(allCourses, normalizedQuery),
    [allCourses, normalizedQuery],
  );

  const totalCourses = data?.stats.totalCourses ?? allCourses.length;
  const totalStudents =
    data?.stats.totalStudents ?? allCourses.reduce((sum, course) => sum + course.enrollments, 0);
  const liveSessions = data?.stats.liveSessions ?? 0;

  return {
    shared,
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    searchQuery,
    setSearchQuery,
    filteredCourses,
    totalCourses,
    totalStudents,
    liveSessions,
  };
}

export type TeacherCoursesDataModel = ReturnType<typeof useTeacherCoursesData>;
