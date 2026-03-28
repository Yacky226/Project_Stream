import type { StudentDashboardCourse } from '../../../types/dashboard';
import type { LiveSession } from '../../../types/live';

export interface StudentCoursesPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

export type CourseSort = 'recent' | 'progress' | 'title';

export interface StudentCourseCardProps {
  course: StudentDashboardCourse;
  sessions: LiveSession[];
  onNavigate: (path: string | number) => void;
}
