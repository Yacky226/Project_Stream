import type { ReactNode } from 'react';
import type { CourseCardModel } from '../../../lib/coursePresentation';

export interface CategoryCoursesViewProps {
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeClassName: string;
  icon: ReactNode;
  matchesCategory: (course: CourseCardModel) => boolean;
  onNavigate: (path: string) => void;
}

export type CategoryCourseSort = 'popularity' | 'rating' | 'price-low' | 'price-high';
export type CategoryCourseLevel = 'all' | 'beginner' | 'intermediate' | 'advanced';
export type CategoryCoursePrice = 'all' | 'free' | 'under50' | 'under100' | 'paid';

export interface CategoryCoursesViewData {
  searchTerm: string;
  sortBy: CategoryCourseSort;
  levelFilter: CategoryCourseLevel;
  priceFilter: CategoryCoursePrice;
  setSearchTerm: (value: string) => void;
  setSortBy: (value: CategoryCourseSort) => void;
  setLevelFilter: (value: CategoryCourseLevel) => void;
  setPriceFilter: (value: CategoryCoursePrice) => void;
  resetFilters: () => void;
  isLoading: boolean;
  filteredCourses: CourseCardModel[];
}
