import {
  Award,
  BookOpen,
  CreditCard,
  LifeBuoy,
  Rocket,
  Settings,
  Smartphone,
  User,
} from 'lucide-react';
import type { HelpCategoryIconMap } from './help.types';

export const HELP_CATEGORY_ICON_MAP: HelpCategoryIconMap = {
  account: User,
  certifications: Award,
  course: BookOpen,
  payments: CreditCard,
  rocket_launch: Rocket,
  school: BookOpen,
  settings: Settings,
  smartphone: Smartphone,
  support: LifeBuoy,
  technical: Settings,
};

export function resolveCategoryIconKey(rawIcon: string): string {
  return rawIcon.trim().toLowerCase().replace(/\s+/g, '_');
}

export function matchesSearch(value: string, search: string): boolean {
  return value.toLowerCase().includes(search.toLowerCase());
}
