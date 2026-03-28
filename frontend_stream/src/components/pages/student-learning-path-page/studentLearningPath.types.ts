import type { StudentDashboardCourse } from '../../../types/dashboard';

export interface StudentLearningPathPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

export type ModuleState = 'completed' | 'current' | 'locked';

export interface PathModule {
  id: string;
  title: string;
  description: string;
  state: ModuleState;
  order: number;
  remainingLessons: number;
  minutes: number;
}

export type DashboardCourse = StudentDashboardCourse;
