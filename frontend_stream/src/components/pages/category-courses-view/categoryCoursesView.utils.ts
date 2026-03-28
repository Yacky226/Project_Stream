import type { CourseCardModel } from '../../../lib/coursePresentation';
import type {
  CategoryCourseLevel,
  CategoryCoursePrice,
  CategoryCourseSort,
} from './categoryCoursesView.types';

interface FilterAndSortParams {
  courses: CourseCardModel[];
  searchTerm: string;
  levelFilter: CategoryCourseLevel;
  priceFilter: CategoryCoursePrice;
  sortBy: CategoryCourseSort;
}

export function formatCategoryCourseDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export function filterAndSortCategoryCourses({
  courses,
  searchTerm,
  levelFilter,
  priceFilter,
  sortBy,
}: FilterAndSortParams): CourseCardModel[] {
  let list = [...courses];

  if (searchTerm.trim()) {
    const query = searchTerm.toLowerCase();
    list = list.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.instructorName.toLowerCase().includes(query),
    );
  }

  if (levelFilter !== 'all') {
    list = list.filter((course) => course.level === levelFilter);
  }

  if (priceFilter !== 'all') {
    list = list.filter((course) => {
      if (priceFilter === 'under50') return course.price < 50;
      if (priceFilter === 'under100') return course.price < 100;
      if (priceFilter === 'free') return course.price === 0;
      if (priceFilter === 'paid') return course.price > 0;
      return true;
    });
  }

  if (sortBy === 'popularity') return list.sort((a, b) => b.studentCount - a.studentCount);
  if (sortBy === 'rating') return list.sort((a, b) => b.price - a.price);
  if (sortBy === 'price-low') return list.sort((a, b) => a.price - b.price);
  return list.sort((a, b) => b.price - a.price);
}
