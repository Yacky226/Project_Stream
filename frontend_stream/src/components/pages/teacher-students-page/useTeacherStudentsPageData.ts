import { useMemo, useState } from 'react';
import { useGetTeacherStudentsQuery } from '../../../store/api/liveApi';
import type { TeacherStudentsPageData } from './teacherStudents.types';
import { extractTeacherStudentsErrorMessage } from './teacherStudents.utils';

interface UseTeacherStudentsPageDataParams {
  shouldFetch: boolean;
}

export function useTeacherStudentsPageData({
  shouldFetch,
}: UseTeacherStudentsPageDataParams): TeacherStudentsPageData {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isFetching, error, refetch } = useGetTeacherStudentsQuery(undefined, {
    skip: !shouldFetch,
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const allRows = data?.enrollments ?? [];

  const filteredRows = useMemo(() => {
    if (!normalizedQuery) return allRows;
    return allRows.filter((row) =>
      `${row.studentName} ${row.courseTitle} ${row.status}`.toLowerCase().includes(normalizedQuery),
    );
  }, [allRows, normalizedQuery]);

  const summary = useMemo(
    () => ({
      uniqueStudentsCount:
        data?.uniqueStudents ?? new Set(filteredRows.map((item) => item.studentId)).size,
      activeCount:
        data?.activeEnrollments ??
        filteredRows.filter((item) => item.status === 'ACTIF' || item.status === 'ACTIVE').length,
      coursesCount: data?.coursesCount ?? 0,
    }),
    [data?.activeEnrollments, data?.coursesCount, data?.uniqueStudents, filteredRows],
  );

  const errorMessage = error
    ? extractTeacherStudentsErrorMessage(error, 'Impossible de charger la liste des etudiants.')
    : null;

  return {
    searchQuery,
    setSearchQuery,
    filteredRows,
    isLoading,
    isFetching,
    errorMessage,
    refetch,
    summary,
  };
}
