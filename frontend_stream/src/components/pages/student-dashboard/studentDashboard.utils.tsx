import { Bolt, Brush, Database } from 'lucide-react';

export const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export type RecommendedIconType = 'design' | 'database' | 'creative';

export function titleMatchesQuery(value: string, query: string) {
  if (!query) return true;
  return value.toLowerCase().includes(query);
}

export function matchesQuery(query: string, ...values: Array<string | number>) {
  if (!query) return true;
  return values.join(' ').toLowerCase().includes(query);
}

export function resolveRecommendedIcon(category: string): RecommendedIconType {
  const normalized = category.toLowerCase();
  if (normalized.includes('design') || normalized.includes('ux') || normalized.includes('ui')) {
    return 'design';
  }
  if (normalized.includes('data') || normalized.includes('sql') || normalized.includes('database')) {
    return 'database';
  }
  return 'creative';
}

export function renderRecommendedIcon(iconType: RecommendedIconType, isDark: boolean) {
  if (iconType === 'design') {
    return {
      wrapperClass: isDark
        ? 'h-16 w-16 rounded-xl bg-indigo-900/30 text-indigo-300'
        : 'h-16 w-16 rounded-xl bg-indigo-100 text-indigo-600',
      icon: <Brush className="h-8 w-8" />,
    };
  }

  if (iconType === 'database') {
    return {
      wrapperClass: isDark
        ? 'h-16 w-16 rounded-xl bg-orange-900/30 text-orange-300'
        : 'h-16 w-16 rounded-xl bg-orange-100 text-orange-600',
      icon: <Database className="h-8 w-8" />,
    };
  }

  return {
    wrapperClass: isDark
      ? 'h-16 w-16 rounded-xl bg-[#1152d4]/20 text-[#8fb5ff]'
      : 'h-16 w-16 rounded-xl bg-[#1152d4]/10 text-[#1152d4]',
    icon: <Bolt className="h-8 w-8" />,
  };
}
