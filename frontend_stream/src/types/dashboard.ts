export type BackendInscriptionStatus = 'ACTIF' | 'TERMINE' | 'ABANDONNE' | string;

export interface BackendCoursDTO {
  id: number;
  titre: string;
  description: string;
  categorie: string;
  horaire?: string | null;
  enseignantId: number;
}

export interface BackendInscriptionDTO {
  id: number;
  etudiantId: number;
  coursId: number;
  etudiantNom?: string;
  coursTitre?: string;
  dateInscription?: string | null;
  statut?: BackendInscriptionStatus;
  progression?: number | null;
  dateCompletion?: string | null;
}

export interface BackendSessionDTO {
  id: number;
  dateHeure?: string | null;
  estEnDirect?: boolean;
  videoUrl?: string | null;
  coursId: number;
  enseignantId: number;
  streamKey?: string | null;
  recordingUrl?: string | null;
  recordingEnabled?: boolean;
  status?: string | null;
  resolution?: string | null;
  broadcastType?: string | null;
}

export interface BackendDashboardStatsDTO {
  totalUtilisateurs?: number;
  totalEtudiants?: number;
  totalEnseignants?: number;
  totalAdministrateurs?: number;
  totalCours?: number;
  coursActifs?: number;
  coursArchives?: number;
  totalInscriptions?: number;
  inscriptionsActives?: number;
  totalSections?: number;
  totalLecons?: number;
  totalSessions?: number;
  sessionsLive?: number;
  sessionsTerminees?: number;
  totalMessages?: number;
  totalQuestions?: number;
  totalHandRaises?: number;
  nouvellesInscriptionsMois?: number;
  nouveauxUtilisateursMois?: number;
  sessionsLiveMois?: number;
  moyenneNoteCours?: number;
  tauxCompletionMoyen?: number;
  coursLesPlusPopulaires?: Record<string, unknown>;
  enseignantsLesPlusActifs?: Record<string, unknown>;
}

export interface BackendCourseManagementDTO {
  id: number;
  titre: string;
  description?: string;
  archive?: boolean;
  dateCreation?: string | null;
  enseignantId?: number;
  enseignantNom?: string;
  enseignantPrenom?: string;
  nombreInscriptions?: number;
  nombreSections?: number;
  nombreLecons?: number;
  nombreSessions?: number;
  moyenneNotes?: number;
  nombreAvis?: number;
  vuesTotal?: number;
  tauxCompletion?: number;
}

export interface BackendInscriptionManagementDTO {
  id: number;
  etudiantId?: number;
  etudiantNom?: string;
  etudiantPrenom?: string;
  etudiantEmail?: string;
  coursId?: number;
  coursTitre?: string;
  enseignantNom?: string;
  statut?: BackendInscriptionStatus;
  progression?: number | null;
  dateInscription?: string | null;
  dateDerniereActivite?: string | null;
  leconsCompletees?: number;
  leconsTotal?: number;
}

export interface BackendPageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface StudentDashboardStats {
  enrolledCourses: number;
  activeCourses: number;
  completedCourses: number;
  averageProgress: number;
  upcomingSessions: number;
}

export interface StudentDashboardCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  status: BackendInscriptionStatus;
  enrolledAt: string | null;
  scheduledAt: string | null;
}

export interface DashboardSessionItem {
  id: string;
  courseId: string;
  courseTitle: string;
  startAt: string | null;
  isLive: boolean;
  status: string;
}

export interface DashboardActivityItem {
  id: string;
  type: 'enrolled' | 'completed' | 'progress' | 'session';
  title: string;
  occurredAt: string | null;
  details?: string;
}

export interface StudentDashboardData {
  stats: StudentDashboardStats;
  courses: StudentDashboardCourse[];
  upcomingSessions: DashboardSessionItem[];
  recentActivity: DashboardActivityItem[];
}

export interface TeacherDashboardStats {
  totalCourses: number;
  totalStudents: number;
  activeEnrollments: number;
  averageCompletionRate: number;
  upcomingSessions: number;
  liveSessions: number;
}

export interface TeacherDashboardCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  enrollments: number;
  activeEnrollments: number;
  completionRate: number;
  sessions: number;
  liveSessions: number;
  nextSessionAt: string | null;
}

export interface TeacherDashboardData {
  stats: TeacherDashboardStats;
  courses: TeacherDashboardCourse[];
  upcomingSessions: DashboardSessionItem[];
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalCourses: number;
  activeCourses: number;
  archivedCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  totalSessions: number;
  liveSessions: number;
  monthlyNewUsers: number;
  monthlyEnrollments: number;
  averageCourseRating: number;
  averageCompletionRate: number;
}

export interface AdminCourseOverview {
  id: string;
  title: string;
  teacherName: string;
  enrollmentCount: number;
  sessionsCount: number;
  averageRating: number;
  completionRate: number;
  isArchived: boolean;
  createdAt: string | null;
}

export interface AdminInscriptionOverview {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  teacherName: string;
  status: BackendInscriptionStatus;
  progress: number;
  enrolledAt: string | null;
  lastActivityAt: string | null;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  recentCourses: AdminCourseOverview[];
  recentInscriptions: AdminInscriptionOverview[];
}
