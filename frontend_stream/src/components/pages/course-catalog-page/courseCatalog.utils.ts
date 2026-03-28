import type { LiveCourse, LiveCourseDetails, LiveSession } from '../../../types/live';
import type { CatalogCourse, PriceFilter, SortBy } from './courseCatalog.types';

export const coursesPerPage = 12;
export const levelOptions: Array<CatalogCourse['level']> = ['Beginner', 'Intermediate', 'Advanced'];
export const DEFAULT_COURSE_IMAGE =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&h=900&fit=crop';

interface CourseFilters {
  maxDuration: number;
  minRating: number;
  priceFilter: PriceFilter;
  selectedCategories: string[];
  selectedLevels: Array<CatalogCourse['level']>;
}

export function inferLevel(
  title: string,
  category: string,
  durationMinutes: number | null,
): CatalogCourse['level'] {
  const text = `${title} ${category}`.toLowerCase();
  if (text.includes('advanced') || text.includes('expert') || text.includes('pro')) {
    return 'Advanced';
  }
  if (text.includes('beginner') || text.includes('starter') || text.includes('intro')) {
    return 'Beginner';
  }
  if ((durationMinutes ?? 0) >= 420) {
    return 'Advanced';
  }
  if ((durationMinutes ?? 0) <= 120 && durationMinutes !== null) {
    return 'Beginner';
  }
  return 'Intermediate';
}

export function formatPrice(price: number): string {
  if (price <= 0) {
    return 'Free';
  }
  return `$${price.toFixed(2)}`;
}

export function isLiveForCourse(courseId: string, sessions: LiveSession[]): boolean {
  return sessions.some(
    (session) =>
      String(session.courseId) === String(courseId) && (session.isLive || session.status === 'LIVE'),
  );
}

export function toCatalogCourse(
  course: LiveCourse,
  details: LiveCourseDetails | undefined,
  sessions: LiveSession[],
): CatalogCourse {
  const durationMinutes = details?.durationMinutes ?? null;
  return {
    category: course.category || 'General',
    description: course.description || 'Course description coming soon.',
    durationHours: Math.max(1, Math.round((durationMinutes ?? 150) / 60)),
    id: course.id,
    image: details?.coverImage || DEFAULT_COURSE_IMAGE,
    isLive: isLiveForCourse(course.id, sessions),
    level: inferLevel(course.title, course.category || '', durationMinutes),
    price: 0,
    rating: details?.averageRating ?? 0,
    reviews: details?.reviewCount ?? 0,
    scheduledAt: course.scheduledAt,
    students: details?.enrolledCount ?? 0,
    teacherName: details?.teacherName || `Instructor #${course.teacherId}`,
    title: course.title || `Course #${course.id}`,
  };
}

export function filterCourses(courses: CatalogCourse[], filters: CourseFilters): CatalogCourse[] {
  return courses.filter((course) => {
    if (
      filters.selectedCategories.length > 0 &&
      !filters.selectedCategories.includes(course.category)
    ) {
      return false;
    }

    if (filters.priceFilter === 'free' && course.price > 0) {
      return false;
    }

    if (filters.priceFilter === 'paid' && course.price <= 0) {
      return false;
    }

    if (filters.selectedLevels.length > 0 && !filters.selectedLevels.includes(course.level)) {
      return false;
    }

    if (filters.minRating > 0 && course.rating < filters.minRating) {
      return false;
    }

    if (course.durationHours > filters.maxDuration) {
      return false;
    }

    return true;
  });
}

export function sortCourses(courses: CatalogCourse[], sortBy: SortBy): CatalogCourse[] {
  const sorted = [...courses];
  sorted.sort((left, right) => {
    if (sortBy === 'newest') {
      return new Date(right.scheduledAt).getTime() - new Date(left.scheduledAt).getTime();
    }
    if (sortBy === 'price-asc') {
      return left.price - right.price;
    }
    if (sortBy === 'price-desc') {
      return right.price - left.price;
    }
    return right.students - left.students;
  });
  return sorted;
}

export function getPaginationNumbers(
  page: number,
  totalPages: number,
  maxVisible = 5,
): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const half = Math.floor(maxVisible / 2);
  const start = Math.max(1, Math.min(page - half, totalPages - maxVisible + 1));
  return Array.from({ length: maxVisible }, (_, index) => start + index);
}
