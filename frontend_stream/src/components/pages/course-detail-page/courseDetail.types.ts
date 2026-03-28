export interface CourseDetailProps {
  courseId: string;
  onNavigate: (path: string) => void;
}

export interface BackendReview {
  commentaire?: string | null;
  coursId: number;
  dateCreation?: string | null;
  etudiantNom?: string | null;
  etudiantPhoto?: string | null;
  note?: number | null;
}
