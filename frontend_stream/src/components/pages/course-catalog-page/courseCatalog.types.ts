export interface CourseCatalogProps {
  currentPath?: string;
  onNavigate: (path: string) => void;
}

export interface CatalogCourse {
  category: string;
  description: string;
  durationHours: number;
  id: string;
  image: string;
  isLive: boolean;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  rating: number;
  reviews: number;
  scheduledAt: string;
  students: number;
  teacherName: string;
  title: string;
}

export type SortBy = 'popular' | 'newest' | 'price-asc' | 'price-desc';
export type PriceFilter = 'all' | 'free' | 'paid';

export interface CourseCatalogDataModel {
  categories: string[];
  selectedCategories: string[];
  priceFilter: PriceFilter;
  selectedLevels: Array<CatalogCourse['level']>;
  minRating: number;
  maxDuration: number;
  sortBy: SortBy;
  page: number;
  coursesCount: number;
  filteredCoursesCount: number;
  paginatedCourses: CatalogCourse[];
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  clearFilters: () => void;
  toggleCategory: (category: string, checked: boolean) => void;
  toggleLevel: (level: CatalogCourse['level'], checked: boolean) => void;
  setPriceFilter: (priceFilter: PriceFilter) => void;
  setMinRating: (minRating: number) => void;
  setMaxDuration: (maxDuration: number) => void;
  setSortBy: (sortBy: SortBy) => void;
  goToPage: (page: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
}
