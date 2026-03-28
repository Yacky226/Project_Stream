import { BadgeCheck, BarChart3, Route } from 'lucide-react';
import type { BusinessBenefitCard } from './business.types';

export const BUSINESS_BENEFIT_CARDS: BusinessBenefitCard[] = [
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description:
      'Track progress with deep dashboards showing skill gaps, completion rates, and ROI across teams.',
  },
  {
    icon: Route,
    title: 'Custom Learning Paths',
    description:
      'Create training tracks aligned with your stack, departments, and transformation goals.',
  },
  {
    icon: BadgeCheck,
    title: 'Certified Upskilling',
    description:
      'Issue recognized credentials to validate growth and strengthen employee confidence.',
  },
];

export const BUSINESS_DEFAULT_BRANDS = ['TECHNO', 'GLOBAL', 'VANTAGE', 'HORIZON', 'NEXUS'];
