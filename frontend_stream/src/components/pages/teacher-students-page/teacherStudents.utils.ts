import type { TeacherStudentsStatusLabel } from './teacherStudents.types';

export function extractTeacherStudentsErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;
  const payload = error as {
    data?: { message?: string; error?: string };
    error?: string;
    message?: string;
  };
  return payload.data?.message || payload.data?.error || payload.error || payload.message || fallback;
}

export function formatTeacherEnrollmentDate(value: string | null): string {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function normalizeTeacherEnrollmentStatus(status: string): TeacherStudentsStatusLabel {
  if (status === 'ACTIF' || status === 'ACTIVE') {
    return { label: 'Actif', className: 'bg-green-100 text-green-700' };
  }
  if (status === 'TERMINE' || status === 'COMPLETED') {
    return { label: 'Termine', className: 'bg-blue-100 text-blue-700' };
  }
  if (status === 'ABANDONNE' || status === 'ABANDONED') {
    return { label: 'Abandonne', className: 'bg-amber-100 text-amber-700' };
  }
  return { label: status, className: 'bg-slate-100 text-slate-700' };
}
