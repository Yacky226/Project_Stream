import { BookOpen, Brain, ExternalLink, Globe, GraduationCap, Sparkles } from 'lucide-react';
import type { CategoryMeta, LocalProfileExtras } from './publicStudentProfile.types';

export const DEFAULT_EXTRAS: LocalProfileExtras = {
  bio: '',
  location: '',
  twitter: '',
  linkedIn: '',
  website: '',
};

export function getErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;
  const payload = error as {
    data?: { message?: string; error?: string };
    error?: string;
    message?: string;
  };
  return payload.data?.message || payload.data?.error || payload.error || payload.message || fallback;
}

export function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.trim().toUpperCase() || 'ST';
}

export function getExtrasStorageKey(userId?: string): string {
  return `account-hub-extras-${userId || 'guest'}`;
}

export function formatRelativeDate(value: string | null | undefined): string {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startToday - startDate) / 86400000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.round(diffDays / 7)} weeks ago`;
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export function getDistinctActivityDays(values: Array<string | null | undefined>): number {
  return new Set(values.filter((value): value is string => Boolean(value)).map((value) => value.slice(0, 10))).size;
}

export function sanitizeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function getCategoryMeta(category: string): CategoryMeta {
  const normalized = category.toLowerCase();
  if (normalized.includes('design')) {
    return {
      icon: Sparkles,
      className: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
    };
  }
  if (normalized.includes('market')) {
    return {
      icon: Brain,
      className: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
    };
  }
  if (normalized.includes('business')) {
    return {
      icon: GraduationCap,
      className: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
    };
  }
  return {
    icon: BookOpen,
    className: 'bg-[#1152d4]/10 text-[#1152d4]',
  };
}

export const SOCIAL_LINK_META = [
  { label: 'Website', key: 'website', icon: Globe },
  { label: 'LinkedIn', key: 'linkedIn', icon: ExternalLink },
  { label: 'Social', key: 'twitter', icon: Sparkles },
] as const;
