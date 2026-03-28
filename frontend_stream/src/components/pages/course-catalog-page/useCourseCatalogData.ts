import { useEffect, useMemo, useRef, useState } from 'react';
import { buildApiUrl } from '../../../lib/api-base-url';
import { useGetActiveSessionsQuery, useGetCoursesQuery } from '../../../store/api/liveApi';
import type { BackendCourseDetailsDTO, LiveCourseDetails } from '../../../types/live';
import { mapCourseDetails } from '../../../types/live';
import type { CatalogCourse, CourseCatalogDataModel, PriceFilter, SortBy } from './courseCatalog.types';
import {
  coursesPerPage,
  filterCourses,
  sortCourses,
  toCatalogCourse,
} from './courseCatalog.utils';

export function useCourseCatalogData(): CourseCatalogDataModel {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [selectedLevels, setSelectedLevels] = useState<Array<CatalogCourse['level']>>([]);
  const [minRating, setMinRating] = useState(0);
  const [maxDuration, setMaxDuration] = useState(40);
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [page, setPage] = useState(1);

  const { data: courses = [], isError, isLoading } = useGetCoursesQuery();
  const { data: activeSessions = [] } = useGetActiveSessionsQuery();

  const [detailsById, setDetailsById] = useState<Record<string, LiveCourseDetails>>({});
  const pendingDetails = useRef<Set<string>>(new Set());

  const categories = useMemo(() => {
    return Array.from(new Set(courses.map((course) => course.category).filter(Boolean))).sort();
  }, [courses]);

  const normalizedCourses = useMemo(() => {
    return courses.map((course) => toCatalogCourse(course, detailsById[course.id], activeSessions));
  }, [courses, detailsById, activeSessions]);

  const filteredCourses = useMemo(() => {
    const filtered = filterCourses(normalizedCourses, {
      maxDuration,
      minRating,
      priceFilter,
      selectedCategories,
      selectedLevels,
    });
    return sortCourses(filtered, sortBy);
  }, [maxDuration, minRating, normalizedCourses, priceFilter, selectedCategories, selectedLevels, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / coursesPerPage));
  const paginatedCourses = useMemo(() => {
    const start = (page - 1) * coursesPerPage;
    return filteredCourses.slice(start, start + coursesPerPage);
  }, [filteredCourses, page]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategories, priceFilter, selectedLevels, minRating, maxDuration, sortBy]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    const missingIds = paginatedCourses
      .map((course) => course.id)
      .filter((id) => !detailsById[id] && !pendingDetails.current.has(id));

    if (missingIds.length === 0) {
      return;
    }

    const controller = new AbortController();
    missingIds.forEach((id) => pendingDetails.current.add(id));

    const load = async () => {
      try {
        const entries = await Promise.all(
          missingIds.map(async (id) => {
            const response = await fetch(buildApiUrl(`/api/cours/${id}/details`), {
              headers: { Accept: 'application/json' },
              signal: controller.signal,
            });

            if (!response.ok) {
              return null;
            }

            const payload = (await response.json()) as BackendCourseDetailsDTO;
            const mapped = mapCourseDetails(payload);
            return [id, mapped] as const;
          }),
        );

        const validEntries = entries.filter(
          (entry): entry is readonly [string, LiveCourseDetails] => Boolean(entry),
        );
        if (validEntries.length > 0) {
          setDetailsById((previous) => {
            const next = { ...previous };
            validEntries.forEach(([id, details]) => {
              next[id] = details;
            });
            return next;
          });
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          // noop
        }
      } finally {
        missingIds.forEach((id) => pendingDetails.current.delete(id));
      }
    };

    void load();

    return () => {
      controller.abort();
      missingIds.forEach((id) => pendingDetails.current.delete(id));
    };
  }, [detailsById, paginatedCourses]);

  const toggleCategory = (category: string, checked: boolean) => {
    setSelectedCategories((previous) => {
      if (checked) {
        return previous.includes(category) ? previous : [...previous, category];
      }
      return previous.filter((item) => item !== category);
    });
  };

  const toggleLevel = (level: CatalogCourse['level'], checked: boolean) => {
    setSelectedLevels((previous) => {
      if (checked) {
        return previous.includes(level) ? previous : [...previous, level];
      }
      return previous.filter((item) => item !== level);
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceFilter('all');
    setSelectedLevels([]);
    setMinRating(0);
    setMaxDuration(40);
    setSortBy('popular');
    setPage(1);
  };

  const goToPage = (nextPage: number) => {
    setPage(Math.max(1, Math.min(totalPages, nextPage)));
  };

  const goToPreviousPage = () => {
    setPage((previous) => Math.max(1, previous - 1));
  };

  const goToNextPage = () => {
    setPage((previous) => Math.min(totalPages, previous + 1));
  };

  return {
    categories,
    clearFilters,
    coursesCount: courses.length,
    filteredCoursesCount: filteredCourses.length,
    goToNextPage,
    goToPage,
    goToPreviousPage,
    isError,
    isLoading,
    maxDuration,
    minRating,
    page,
    paginatedCourses,
    priceFilter,
    selectedCategories,
    selectedLevels,
    setMaxDuration,
    setMinRating,
    setPriceFilter,
    setSortBy,
    sortBy,
    toggleCategory,
    toggleLevel,
    totalPages,
  };
}
