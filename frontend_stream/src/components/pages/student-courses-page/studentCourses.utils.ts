import type { StudentDashboardCourse } from '../../../types/dashboard';
import type { LiveSession } from '../../../types/live';
import type { CourseSort } from './studentCourses.types';

export function matchStatusLabel(status: string) {
  if (status === 'TERMINE') return 'Completed';
  if (status === 'ABANDONNE') return 'Abandoned';
  return 'In progress';
}

export function matchStatusVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status === 'TERMINE') return 'default';
  if (status === 'ABANDONNE') return 'secondary';
  return 'outline';
}

export function sessionPriority(session: LiveSession): number {
  if (session.isLive || session.status === 'LIVE') return 0;
  if (session.status === 'ENDED') return 2;
  return 1;
}

export function nextSessionForCourse(courseId: string, sessions: LiveSession[]) {
  return sessions
    .filter((session) => String(session.courseId) === String(courseId))
    .sort((a, b) => {
      const priority = sessionPriority(a) - sessionPriority(b);
      if (priority !== 0) return priority;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    })[0];
}

export function sortCourses(courses: StudentDashboardCourse[], sortBy: CourseSort) {
  const list = [...courses];
  if (sortBy === 'title') {
    list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }
  if (sortBy === 'progress') {
    list.sort((a, b) => b.progress - a.progress);
    return list;
  }
  list.sort(
    (a, b) => new Date(b.enrolledAt || 0).getTime() - new Date(a.enrolledAt || 0).getTime(),
  );
  return list;
}
