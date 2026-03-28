import type { LiveCourse, LiveCourseDetails } from '../../../types/live';

export interface TeacherProfileProps {
  teacherId: string;
  onNavigate: (path: string) => void;
  currentPath?: string;
}

export interface BackendReview {
  commentaire?: string | null;
  coursId: number;
  dateCreation?: string | null;
  etudiantNom?: string | null;
  etudiantPhoto?: string | null;
  note?: number | null;
}

export interface ReviewWithCourseRef extends BackendReview {
  courseIdString: string;
}

export interface FeaturedCourse {
  course: LiveCourse;
  detail?: LiveCourseDetails;
  enrollments: number;
  rating: number;
  reviewCount: number;
}
