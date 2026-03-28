import { BriefcaseBusiness, Target, Users } from 'lucide-react';
import { useGetCoursesQuery } from '../../../store/api/liveApi';
import { BUSINESS_BENEFIT_CARDS, BUSINESS_DEFAULT_BRANDS } from './business.data';
import type { BusinessPageDataModel } from './business.types';

export function useBusinessPageData(): BusinessPageDataModel {
  const { data: courses = [], isLoading: isCoursesLoading } = useGetCoursesQuery();

  const uniqueCategories = Array.from(
    new Set(courses.map((course) => course.category).filter((category) => category && category.trim())),
  );

  const stats = [
    {
      icon: BriefcaseBusiness,
      value: isCoursesLoading ? '...' : `${courses.length}+`,
      label: 'Courses available',
    },
    {
      icon: Target,
      value: isCoursesLoading ? '...' : `${uniqueCategories.length}+`,
      label: 'Skill tracks',
    },
    {
      icon: Users,
      value: '24/7',
      label: 'Enterprise support',
    },
  ];

  return {
    isCoursesLoading,
    uniqueCategories,
    stats,
    benefitCards: BUSINESS_BENEFIT_CARDS,
    trustBrands: uniqueCategories.length > 0 ? uniqueCategories.slice(0, 5) : BUSINESS_DEFAULT_BRANDS,
  };
}
