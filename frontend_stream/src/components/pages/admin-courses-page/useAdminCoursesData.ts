import { useMemo, useState } from 'react';
import { useGetAdminCoursesQuery } from '../../../store/api/dashboardApi';
import { useGetCoursesQuery } from '../../../store/api/liveApi';
import { useAdminSpaceData } from '../../admin/AdminSpaceShared';
import type {
  CourseSortValue,
  CourseStatusFilter,
} from './adminCourses.types';
import { escapeCsvCell, formatDate } from './adminCourses.utils';

type AdminCoursesResponse = NonNullable<ReturnType<typeof useGetAdminCoursesQuery>['data']>;
type AdminCourseItem = AdminCoursesResponse['items'][number];

export interface AdminCoursesDataModel {
  shared: ReturnType<typeof useAdminSpaceData>;
  searchQuery: string;
  statusFilter: CourseStatusFilter;
  sortValue: CourseSortValue;
  page: number;
  setSearchQuery: (value: string) => void;
  setStatusFilter: (value: CourseStatusFilter) => void;
  setSortValue: (value: CourseSortValue) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  coursesPage: ReturnType<typeof useGetAdminCoursesQuery>['data'];
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  filteredItems: AdminCourseItem[];
  watchlist: AdminCourseItem[];
  categoryByCourseId: Map<string, string>;
  totalCourses: number;
  activeCourses: number;
  archivedCourses: number;
  averageRating: number;
  hasData: boolean;
  exportCurrentView: () => void;
}

export function useAdminCoursesData(): AdminCoursesDataModel {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilterState] = useState<CourseStatusFilter>('all');
  const [sortValue, setSortValueState] = useState<CourseSortValue>('dateCreation:DESC');
  const [page, setPage] = useState(0);
  const shared = useAdminSpaceData({ includeDashboard: false });

  const [sortBy, sortDir] = sortValue.split(':') as [string, 'ASC' | 'DESC'];
  const { data: coursesPage, isLoading, isFetching, error } = useGetAdminCoursesQuery(
    {
      page,
      size: 10,
      sortBy,
      sortDir,
    },
    {
      skip: shared.status !== 'ready',
    },
  );
  const { data: publicCourses = [] } = useGetCoursesQuery(undefined, {
    skip: shared.status !== 'ready',
  });

  const categoryByCourseId = useMemo(
    () => new Map(publicCourses.map((course) => [course.id, course.category])),
    [publicCourses],
  );

  const normalizedSearch = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);
  const allItems = coursesPage?.items || [];

  const filteredItems = useMemo(() => {
    return allItems.filter((course) => {
      const category = categoryByCourseId.get(course.id) || 'Category pending';
      const matchesSearch = [course.title, course.teacherName, category]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !course.isArchived) ||
        (statusFilter === 'archived' && course.isArchived);

      return matchesSearch && matchesStatus;
    });
  }, [allItems, categoryByCourseId, normalizedSearch, statusFilter]);

  const watchlist = useMemo(() => {
    return filteredItems
      .filter(
        (course) =>
          course.isArchived ||
          course.enrollmentCount === 0 ||
          (course.reviewCount > 0 && course.averageRating > 0 && course.averageRating < 3.5),
      )
      .slice(0, 4);
  }, [filteredItems]);

  const totalCourses =
    shared.dashboard?.stats.totalCourses ?? coursesPage?.totalElements ?? allItems.length;
  const activeCourses =
    shared.dashboard?.stats.activeCourses ??
    allItems.filter((course) => !course.isArchived).length;
  const archivedCourses =
    shared.dashboard?.stats.archivedCourses ??
    allItems.filter((course) => course.isArchived).length;
  const averageRating =
    shared.dashboard?.stats.averageCourseRating ??
    (allItems.length
      ? allItems.reduce((sum, course) => sum + course.averageRating, 0) /
        Math.max(allItems.length, 1)
      : 0);

  const exportCurrentView = () => {
    if (!filteredItems.length) {
      return;
    }

    const csv = [
      [
        'Title',
        'Instructor',
        'Category',
        'Status',
        'Rating',
        'Reviews',
        'Students',
        'Sessions',
        'Created At',
      ].join(','),
      ...filteredItems.map((course) => {
        const category = categoryByCourseId.get(course.id) || 'Category pending';
        const status = course.isArchived ? 'Archived' : 'Active';
        return [
          course.title,
          course.teacherName,
          category,
          status,
          course.averageRating.toFixed(2),
          course.reviewCount,
          course.enrollmentCount,
          course.sessionsCount,
          formatDate(course.createdAt),
        ]
          .map(escapeCsvCell)
          .join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-course-inventory-page-${page + 1}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const hasData = Boolean(coursesPage && !coursesPage.empty);

  const setStatusFilter = (value: CourseStatusFilter) => {
    setStatusFilterState(value);
    setPage(0);
  };

  const setSortValue = (value: CourseSortValue) => {
    setSortValueState(value);
    setPage(0);
  };

  const goToPreviousPage = () => {
    setPage((previous) => Math.max(previous - 1, 0));
  };

  const goToNextPage = () => {
    setPage((previous) => previous + 1);
  };

  return {
    shared,
    searchQuery,
    statusFilter,
    sortValue,
    page,
    setSearchQuery,
    setStatusFilter,
    setSortValue,
    goToPreviousPage,
    goToNextPage,
    coursesPage,
    isLoading,
    isFetching,
    error,
    filteredItems,
    watchlist,
    categoryByCourseId,
    totalCourses,
    activeCourses,
    archivedCourses,
    averageRating,
    hasData,
    exportCurrentView,
  };
}
