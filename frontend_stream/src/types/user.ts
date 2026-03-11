import {
  User,
  mapBackendRole,
  splitFullName,
  buildDisplayName,
} from './auth';

export interface BackendUtilisateurDTO {
  id: number;
  nom: string;
  prenom?: string;
  email: string;
  role: string;
  dateNaissance?: string | null;
  photoProfil?: string | null;
  specialite?: string;
  niveau?: string;
  coursIds?: number[];
}

export interface BackendEtudiantDTO extends BackendUtilisateurDTO {
  niveau: string;
}

export interface BackendEnseignantDTO extends BackendUtilisateurDTO {
  specialite: string;
  coursIds?: number[];
}

export interface BackendProfileResponse {
  success: boolean;
  data: BackendUtilisateurDTO;
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  phoneNumber?: string;
  niveau?: string;
  specialite?: string;
  coursIds?: number[];
}

export interface UserPreferences {
  language: 'fr' | 'en';
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  courseReminders: boolean;
  weeklyDigest: boolean;
  autoplay: boolean;
  playbackSpeed: number;
  subtitles: boolean;
  quality: 'auto' | '720p' | '1080p' | '4K';
  downloadQuality: 'low' | 'medium' | 'high';
  showOnlineStatus: boolean;
  allowProfileViews: boolean;
  allowCourseRecommendations: boolean;
}

export interface UserStats {
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalLessonsWatched: number;
  totalTimeSpent: number;
  certificatesEarned: number;
  badgesEarned: number;
  streakDays: number;
  longestStreak: number;
  forumPosts: number;
  questionsAsked: number;
  questionsAnswered: number;
  helpfulVotes: number;
  averageCompletionRate: number;
  averageQuizScore: number;
  lastActivityAt: Date;
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

export interface UserActivity {
  id: string;
  type:
    | 'course_started'
    | 'lesson_completed'
    | 'quiz_passed'
    | 'certificate_earned'
    | 'forum_post'
    | 'achievement_unlocked';
  title: string;
  description: string;
  timestamp: Date;
  relatedId?: string;
  metadata?: Record<string, any>;
}

export interface UserCertificate {
  id: string;
  courseId: string;
  courseName: string;
  issuedAt: Date;
  certificateUrl: string;
  grade?: number;
  instructorName: string;
  credentialId: string;
}

export interface UserProgress {
  courseId: string;
  courseName: string;
  completedLessons: string[];
  totalLessons: number;
  completionPercentage: number;
  timeSpent: number;
  lastAccessedAt: Date;
  currentLessonId?: string;
  quizzesTaken: number;
  quizzesPassed: number;
  averageQuizScore: number;
  notesCount: number;
  bookmarksCount: number;
  forumParticipation: number;
}

export function normalizeUserProfile(dto: BackendUtilisateurDTO): UserProfile {
  const names = splitFullName(dto.nom || '');
  const firstName = dto.prenom?.trim() || names.firstName || 'Utilisateur';
  const lastName = dto.nom?.trim() || names.lastName || '';

  return {
    id: String(dto.id),
    email: dto.email,
    firstName,
    lastName,
    nom: dto.nom || buildDisplayName(firstName, lastName),
    role: mapBackendRole(dto.role),
    avatar: dto.photoProfil || null,
    dateNaissance: dto.dateNaissance || null,
    specialite: dto.specialite,
    niveau: dto.niveau,
    coursIds: dto.coursIds,
    emailVerified: true,
    isActive: true,
  };
}

export function normalizeStudentProfile(dto: BackendEtudiantDTO): UserProfile {
  return {
    ...normalizeUserProfile(dto),
    niveau: dto.niveau,
  };
}

export function normalizeTeacherProfile(dto: BackendEnseignantDTO): UserProfile {
  return {
    ...normalizeUserProfile(dto),
    specialite: dto.specialite,
    coursIds: dto.coursIds,
  };
}
