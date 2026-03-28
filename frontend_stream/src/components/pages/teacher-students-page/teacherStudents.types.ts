import type { TeacherStudentEnrollment } from '../../../store/api/liveApi';

export interface TeacherStudentsPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

export interface TeacherStudentsStatusLabel {
  label: string;
  className: string;
}

export interface TeacherStudentsSummary {
  uniqueStudentsCount: number;
  activeCount: number;
  coursesCount: number;
}

export interface TeacherStudentsPageData {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filteredRows: TeacherStudentEnrollment[];
  isLoading: boolean;
  isFetching: boolean;
  errorMessage: string | null;
  refetch: () => void;
  summary: TeacherStudentsSummary;
}
