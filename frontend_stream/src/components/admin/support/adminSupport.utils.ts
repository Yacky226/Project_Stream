import type { AdminSupportStatus } from '../../../types/admin';

export type SupportFilterValue = 'ALL' | AdminSupportStatus;
export type NewsletterFilterValue = 'all' | 'active' | 'inactive';

export const SUPPORT_FILTERS: { label: string; value: SupportFilterValue }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'New', value: 'NEW' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
];

export function compact(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    maximumFractionDigits: value >= 100000 ? 0 : 1,
  }).format(value);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unavailable';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatSourcePage(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

export function statusBadgeClasses(status: AdminSupportStatus) {
  switch (status) {
    case 'NEW':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
    case 'IN_PROGRESS':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
    case 'RESOLVED':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
    case 'CLOSED':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  }
}

export function statusLabel(status: AdminSupportStatus) {
  return status.replace('_', ' ');
}

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;
  const payload = error as {
    status?: number | string;
    data?: { message?: string; error?: string; details?: string } | string;
    error?: string;
  };

  const nestedData = typeof payload.data === 'object' && payload.data ? payload.data : null;

  const rawMessage =
    nestedData?.message ||
    nestedData?.error ||
    nestedData?.details ||
    (typeof payload.data === 'string' ? payload.data : undefined) ||
    payload.error;

  const statusSuffix =
    typeof payload.status === 'number' || typeof payload.status === 'string'
      ? ` (HTTP ${payload.status})`
      : '';

  return rawMessage ? `${rawMessage}${statusSuffix}` : `${fallback}${statusSuffix}`;
}
