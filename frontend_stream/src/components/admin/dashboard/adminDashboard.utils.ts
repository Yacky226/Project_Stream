import type { AdminUserRole } from '../../../types/admin';

export interface ChartPoint {
  x: number;
  y: number;
}

export function compact(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    maximumFractionDigits: value >= 100000 ? 0 : 1,
  }).format(value);
}

export function formatRelativeDate(value?: string | null): string {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;
  const payload = error as {
    data?: { message?: string; error?: string };
    error?: string;
    message?: string;
  };
  return payload.data?.message || payload.data?.error || payload.error || payload.message || fallback;
}

export function roleLabel(role: AdminUserRole): string {
  if (role === 'admin') return 'Admin';
  if (role === 'teacher') return 'Instructor';
  return 'Student';
}

export function roleBadgeClass(role: AdminUserRole): string {
  if (role === 'admin') return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
  if (role === 'teacher') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
  return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
}

export function splitName(value: string): { prenom: string; nom: string } {
  const trimmed = value.trim();
  if (!trimmed) {
    return { prenom: '', nom: '' };
  }
  const [prenom, ...rest] = trimmed.split(/\s+/);
  return {
    prenom,
    nom: rest.join(' '),
  };
}

export function buildChartPoints(values: number[], width: number, height: number): ChartPoint[] {
  if (!values.length) return [];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  return values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 28) - 14;
    return { x, y };
  });
}

export function buildCurvedLinePath(points: ChartPoint[]): string {
  if (!points.length) return '';
  if (points.length === 1) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  }

  const tension = 1;
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;

    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return path;
}

export function buildAreaPath(points: ChartPoint[], height: number): string {
  if (!points.length) return '';
  const first = points[0];
  const last = points[points.length - 1];
  return `${buildCurvedLinePath(points)} L ${last.x.toFixed(2)} ${height} L ${first.x.toFixed(2)} ${height} Z`;
}

function buildMonthLabels(monthCount: number): string[] {
  const labels: string[] = [];
  const today = new Date();
  for (let index = monthCount - 1; index >= 0; index -= 1) {
    const value = new Date(today);
    value.setMonth(today.getMonth() - index);
    labels.push(
      new Intl.DateTimeFormat('en-US', { month: 'short' })
        .format(value)
        .toUpperCase(),
    );
  }
  return labels;
}

function buildMonthKeys(monthCount: number): string[] {
  const keys: string[] = [];
  const today = new Date();
  for (let index = monthCount - 1; index >= 0; index -= 1) {
    const value = new Date(today);
    value.setDate(1);
    value.setMonth(today.getMonth() - index);
    keys.push(`${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

function monthKeyFromIso(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function dateValue(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function buildGrowthSeries(
  inscriptions: Array<{ enrolledAt: string | null }> | undefined,
  range: '6m' | '12m',
) {
  const monthCount = range === '12m' ? 12 : 6;
  const labels = buildMonthLabels(monthCount);
  const monthKeys = buildMonthKeys(monthCount);
  const byMonth = new Map(monthKeys.map((key) => [key, 0]));

  (inscriptions || []).forEach((item) => {
    const key = monthKeyFromIso(item.enrolledAt);
    if (!key || !byMonth.has(key)) return;
    byMonth.set(key, (byMonth.get(key) || 0) + 1);
  });

  const values = monthKeys.map((key) => byMonth.get(key) || 0);

  return { labels, values };
}
