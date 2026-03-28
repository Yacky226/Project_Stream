import type {
  CategoryCourseLevel,
  CategoryCoursePrice,
  CategoryCourseSort,
} from './categoryCoursesView.types';

export const CATEGORY_COURSES_INITIAL_FILTERS = {
  searchTerm: '',
  sortBy: 'popularity' as CategoryCourseSort,
  levelFilter: 'all' as CategoryCourseLevel,
  priceFilter: 'all' as CategoryCoursePrice,
};

export const CATEGORY_COURSES_SORT_OPTIONS: Array<{ value: CategoryCourseSort; label: string }> = [
  { value: 'popularity', label: 'Popularite' },
  { value: 'rating', label: 'Prix max' },
  { value: 'price-low', label: 'Prix croissant' },
  { value: 'price-high', label: 'Prix decroissant' },
];

export const CATEGORY_COURSES_LEVEL_OPTIONS: Array<{ value: CategoryCourseLevel; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'beginner', label: 'Debutant' },
  { value: 'intermediate', label: 'Intermediaire' },
  { value: 'advanced', label: 'Avance' },
];

export const CATEGORY_COURSES_PRICE_OPTIONS: Array<{ value: CategoryCoursePrice; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'free', label: 'Gratuit' },
  { value: 'under50', label: '< 50 EUR' },
  { value: 'under100', label: '< 100 EUR' },
  { value: 'paid', label: 'Payant' },
];
