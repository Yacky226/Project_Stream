export const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&h=900&fit=crop';

export function formatMonthYear(dateValue: string | undefined): string {
  if (!dateValue) {
    return 'N/A';
  }
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A';
  }
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(parsed);
}

export function lessonTypeLabel(type: string): string {
  const normalized = (type || '').toUpperCase();
  if (normalized === 'VIDEO') {
    return 'Video';
  }
  if (normalized === 'QUIZ') {
    return 'Quiz';
  }
  if (normalized === 'DOCUMENT') {
    return 'Reading';
  }
  return 'Lesson';
}

export function toMinutesText(minutes: number): string {
  if (minutes <= 0) {
    return '0m';
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}
