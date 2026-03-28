import type { LucideIcon } from 'lucide-react';

export interface CategoryGeneralPageProps {
  onNavigate: (path: string) => void;
}

export interface CategoryStat {
  name: string;
  count: number;
}

export interface TrendingCategory extends CategoryStat {
  Icon: LucideIcon;
}

export interface PremiumCategoryCourse {
  id: string | number;
  title: string;
  category: string;
  image: string;
}

export interface CuratedPath {
  title: string;
  duration: string;
  modules: string;
  progress: string;
  progressWidth: string;
  image: string;
  learners: string;
}

export interface CategoryGeneralPageData {
  isLoading: boolean;
  totalCourses: number;
  totalCategories: number;
  trending: TrendingCategory[];
  premiumCourses: PremiumCategoryCourse[];
  curatedPaths: CuratedPath[];
}
