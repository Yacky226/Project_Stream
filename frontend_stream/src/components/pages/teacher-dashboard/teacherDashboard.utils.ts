import type { TeacherDashboardCourse } from '../../../types/dashboard';

export interface TeacherDashboardChartPoint {
  x: number;
  y: number;
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatDateLabel(value: string | null) {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
  }).format(date);
}

export function formatTimeLabel(value: string | null) {
  if (!value) return '--:--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function minutesUntil(startAt: string | null) {
  if (!startAt) return null;
  const target = new Date(startAt).getTime();
  if (Number.isNaN(target)) return null;
  return Math.round((target - Date.now()) / 60000);
}

export function extractTeacherDashboardErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;
  const payload = error as {
    data?: { message?: string; error?: string };
    error?: string;
    message?: string;
  };
  return payload.data?.message || payload.data?.error || payload.error || payload.message || fallback;
}

export function buildChartPoints(
  values: number[],
  width: number,
  height: number,
): TeacherDashboardChartPoint[] {
  if (!values.length) return [];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);

  return values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 36) - 18;
    return { x, y };
  });
}

export function buildLinePath(points: TeacherDashboardChartPoint[]) {
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

export function buildAreaPath(points: TeacherDashboardChartPoint[], height: number) {
  if (!points.length) return '';
  const linePath = buildLinePath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${linePath} L ${last.x.toFixed(2)} ${height} L ${first.x.toFixed(2)} ${height} Z`;
}

export function downloadCsv(filename: string, rows: string[][]) {
  if (typeof window === 'undefined') return;
  const content = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
        .join(','),
    )
    .join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getCourseStatus(course: TeacherDashboardCourse) {
  if (course.enrollments === 0 || course.completionRate < 25) {
    return {
      label: 'DRAFT',
      className: 'bg-amber-100 text-amber-600',
    };
  }
  return {
    label: 'ACTIVE',
    className: 'bg-green-100 text-green-600',
  };
}
