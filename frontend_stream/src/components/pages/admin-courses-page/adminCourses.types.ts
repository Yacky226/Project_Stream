export interface AdminCoursesPageProps {
  onNavigate: (path: string) => void;
  currentPath?: string;
}

export type CourseStatusFilter = 'all' | 'active' | 'archived';

export type CourseSortValue =
  | 'dateCreation:DESC'
  | 'dateCreation:ASC'
  | 'nombreInscriptions:DESC'
  | 'moyenneNotes:DESC';
