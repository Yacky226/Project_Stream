import type { LucideIcon } from 'lucide-react';

export interface BusinessPageProps {
  onNavigate: (path: string) => void;
}

export interface BusinessBenefitCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface BusinessStat {
  icon: LucideIcon;
  value: string;
  label: string;
}

export interface BusinessPageDataModel {
  isCoursesLoading: boolean;
  uniqueCategories: string[];
  stats: BusinessStat[];
  benefitCards: BusinessBenefitCard[];
  trustBrands: string[];
}
