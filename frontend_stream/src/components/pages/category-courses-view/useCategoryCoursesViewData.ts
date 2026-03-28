import { useMemo, useState } from 'react';
import { mapCoursesToCardModels, type CourseCardModel } from '../../../lib/coursePresentation';
import { useGetActiveSessionsQuery, useGetCoursesQuery } from '../../../store/api/liveApi';
import { CATEGORY_COURSES_INITIAL_FILTERS } from './categoryCoursesView.constants';
import type {
  CategoryCoursesViewData,
  CategoryCourseLevel,
  CategoryCoursePrice,
  CategoryCourseSort,
} from './categoryCoursesView.types';
import { filterAndSortCategoryCourses } from './categoryCoursesView.utils';

interface UseCategoryCoursesViewDataParams {
  matchesCategory: (course: CourseCardModel) => boolean;
}

export function useCategoryCoursesViewData({
  matchesCategory,
}: UseCategoryCoursesViewDataParams): CategoryCoursesViewData {
  const { data: courses = [], isLoading } = useGetCoursesQuery();
  const { data: activeSessions = [] } = useGetActiveSessionsQuery();

  const [searchTerm, setSearchTerm] = useState(CATEGORY_COURSES_INITIAL_FILTERS.searchTerm);
  const [sortBy, setSortBy] = useState<CategoryCourseSort>(CATEGORY_COURSES_INITIAL_FILTERS.sortBy);
  const [levelFilter, setLevelFilter] = useState<CategoryCourseLevel>(
    CATEGORY_COURSES_INITIAL_FILTERS.levelFilter,
  );
  const [priceFilter, setPriceFilter] = useState<CategoryCoursePrice>(
    CATEGORY_COURSES_INITIAL_FILTERS.priceFilter,
  );

  const filteredCourses = useMemo(() => {
    const categoryCourses = mapCoursesToCardModels(courses, activeSessions).filter(matchesCategory);
    return filterAndSortCategoryCourses({
      courses: categoryCourses,
      searchTerm,
      levelFilter,
      priceFilter,
      sortBy,
    });
  }, [activeSessions, courses, levelFilter, matchesCategory, priceFilter, searchTerm, sortBy]);

  const resetFilters = () => {
    setSearchTerm(CATEGORY_COURSES_INITIAL_FILTERS.searchTerm);
    setSortBy(CATEGORY_COURSES_INITIAL_FILTERS.sortBy);
    setLevelFilter(CATEGORY_COURSES_INITIAL_FILTERS.levelFilter);
    setPriceFilter(CATEGORY_COURSES_INITIAL_FILTERS.priceFilter);
  };

  return {
    searchTerm,
    sortBy,
    levelFilter,
    priceFilter,
    setSearchTerm,
    setSortBy,
    setLevelFilter,
    setPriceFilter,
    resetFilters,
    isLoading,
    filteredCourses,
  };
}
