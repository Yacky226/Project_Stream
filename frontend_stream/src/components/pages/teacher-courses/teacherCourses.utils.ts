import type { TeacherDashboardCourse } from '../../../types/dashboard';

export function formatCourseDateLabel(value: string | null): string {
  if (!value) {
    return 'Not scheduled';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not scheduled';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function extractTeacherCourseErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const payload = error as {
    data?: { message?: string; error?: string };
    error?: string;
    message?: string;
  };

  return payload.data?.message || payload.data?.error || payload.error || payload.message || fallback;
}

export function getTeacherCourseStatus(course: TeacherDashboardCourse) {
  if (course.enrollments === 0 || course.completionRate < 25) {
    return {
      label: 'Draft',
      className: 'bg-amber-100 text-amber-700',
    };
  }

  return {
    label: 'Active',
    className: 'bg-green-100 text-green-700',
  };
}

export function filterAndSortTeacherCourses(
  courses: TeacherDashboardCourse[],
  normalizedQuery: string,
): TeacherDashboardCourse[] {
  return [...courses]
    .filter((course) =>
      `${course.title} ${course.description} ${course.category}`.toLowerCase().includes(normalizedQuery),
    )
    .sort((left, right) => {
      if (right.enrollments !== left.enrollments) {
        return right.enrollments - left.enrollments;
      }

      return left.title.localeCompare(right.title);
    });
}
