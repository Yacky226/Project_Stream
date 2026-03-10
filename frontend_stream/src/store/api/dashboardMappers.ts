import type {
  AdminCourseOverview,
  AdminDashboardData,
  AdminDashboardStats,
  AdminInscriptionOverview,
  BackendCoursDTO,
  BackendCourseManagementDTO,
  BackendDashboardStatsDTO,
  BackendInscriptionDTO,
  BackendInscriptionManagementDTO,
  BackendInscriptionStatus,
  BackendSessionDTO,
  DashboardActivityItem,
  DashboardSessionItem,
  StudentDashboardCourse,
  StudentDashboardData,
  TeacherDashboardCourse,
  TeacherDashboardData,
} from '../../types/dashboard';

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function normalizeProgress(value: unknown): number {
  const numeric = toNumber(value, 0);
  if (numeric < 0) {
    return 0;
  }
  if (numeric > 100) {
    return 100;
  }
  return Number(numeric.toFixed(1));
}

function toIso(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function asStatus(value: unknown): BackendInscriptionStatus {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return 'ACTIF';
}

function sessionIsLive(session: BackendSessionDTO): boolean {
  if (session.estEnDirect === true) {
    return true;
  }

  return typeof session.status === 'string' && session.status.toUpperCase() === 'LIVE';
}

function sessionStartAt(session: BackendSessionDTO): string | null {
  return toIso(session.dateHeure);
}

function sortByIsoAsc<T>(items: T[], extractor: (item: T) => string | null): T[] {
  return [...items].sort((a, b) => {
    const aValue = extractor(a);
    const bValue = extractor(b);

    if (!aValue && !bValue) {
      return 0;
    }
    if (!aValue) {
      return 1;
    }
    if (!bValue) {
      return -1;
    }

    return new Date(aValue).getTime() - new Date(bValue).getTime();
  });
}

function sortByIsoDesc<T>(items: T[], extractor: (item: T) => string | null): T[] {
  return [...items].sort((a, b) => {
    const aValue = extractor(a);
    const bValue = extractor(b);

    if (!aValue && !bValue) {
      return 0;
    }
    if (!aValue) {
      return 1;
    }
    if (!bValue) {
      return -1;
    }

    return new Date(bValue).getTime() - new Date(aValue).getTime();
  });
}

function mapSession(
  session: BackendSessionDTO,
  courseTitleById: Map<number, string>,
): DashboardSessionItem {
  const courseTitle = courseTitleById.get(session.coursId) || `Cours #${session.coursId}`;

  return {
    id: String(session.id),
    courseId: String(session.coursId),
    courseTitle,
    startAt: sessionStartAt(session),
    isLive: sessionIsLive(session),
    status: session.status || (session.estEnDirect ? 'LIVE' : 'SCHEDULED'),
  };
}

function upcomingSessions(sessions: DashboardSessionItem[]): DashboardSessionItem[] {
  const now = Date.now();

  return sortByIsoAsc(
    sessions.filter((session) => {
      if (session.isLive) {
        return true;
      }

      if (!session.startAt) {
        return false;
      }

      return new Date(session.startAt).getTime() >= now;
    }),
    (session) => session.startAt,
  );
}

export function buildStudentDashboardData(
  inscriptions: BackendInscriptionDTO[],
  courses: BackendCoursDTO[],
  sessionsByCourseId: Map<number, BackendSessionDTO[]>,
): StudentDashboardData {
  const courseById = new Map<number, BackendCoursDTO>();
  courses.forEach((course) => {
    courseById.set(course.id, course);
  });

  const courseTitleById = new Map<number, string>();
  courses.forEach((course) => {
    courseTitleById.set(course.id, course.titre || `Cours #${course.id}`);
  });

  const sessions = Array.from(sessionsByCourseId.values()).flat();
  const mappedSessions = sessions.map((session) => mapSession(session, courseTitleById));
  const upcoming = upcomingSessions(mappedSessions).slice(0, 8);

  const coursesData: StudentDashboardCourse[] = inscriptions.map((inscription) => {
    const course = courseById.get(inscription.coursId);
    const status = asStatus(inscription.statut);
    const progress = normalizeProgress(inscription.progression);
    const sessionsForCourse = upcoming.filter(
      (session) => session.courseId === String(inscription.coursId),
    );
    const nextSession = sessionsForCourse[0];

    return {
      id: String(inscription.coursId),
      title:
        course?.titre ||
        inscription.coursTitre ||
        courseTitleById.get(inscription.coursId) ||
        `Cours #${inscription.coursId}`,
      description: course?.description || '',
      category: course?.categorie || 'General',
      progress,
      status,
      enrolledAt: toIso(inscription.dateInscription),
      scheduledAt: nextSession?.startAt || null,
    };
  });

  const activeCourses = coursesData.filter((course) => course.status === 'ACTIF').length;
  const completedCourses = coursesData.filter((course) => course.status === 'TERMINE').length;
  const averageProgress =
    coursesData.length === 0
      ? 0
      : Number(
          (
            coursesData.reduce((total, course) => total + normalizeProgress(course.progress), 0) /
            coursesData.length
          ).toFixed(1),
        );

  const activities: DashboardActivityItem[] = inscriptions.flatMap((inscription) => {
    const course = courseById.get(inscription.coursId);
    const title = course?.titre || inscription.coursTitre || `Cours #${inscription.coursId}`;
    const progress = normalizeProgress(inscription.progression);
    const status = asStatus(inscription.statut);

    const items: DashboardActivityItem[] = [
      {
        id: `enrolled-${inscription.id}`,
        type: 'enrolled',
        title: `Inscription: ${title}`,
        occurredAt: toIso(inscription.dateInscription),
      },
    ];

    if (status === 'TERMINE' || progress >= 100) {
      items.push({
        id: `completed-${inscription.id}`,
        type: 'completed',
        title: `Cours termine: ${title}`,
        occurredAt: toIso(inscription.dateCompletion) || toIso(inscription.dateInscription),
      });
    } else if (progress > 0) {
      items.push({
        id: `progress-${inscription.id}`,
        type: 'progress',
        title: `Progression ${progress}%: ${title}`,
        occurredAt: toIso(inscription.dateCompletion) || toIso(inscription.dateInscription),
      });
    }

    return items;
  });

  const recentActivity = sortByIsoDesc(activities, (activity) => activity.occurredAt).slice(0, 8);

  return {
    stats: {
      enrolledCourses: coursesData.length,
      activeCourses,
      completedCourses,
      averageProgress,
      upcomingSessions: upcoming.length,
    },
    courses: sortByIsoDesc(coursesData, (course) => course.enrolledAt),
    upcomingSessions: upcoming,
    recentActivity,
  };
}

export function buildTeacherDashboardData(
  courses: BackendCoursDTO[],
  inscriptionsByCourseId: Map<number, BackendInscriptionDTO[]>,
  sessionsByCourseId: Map<number, BackendSessionDTO[]>,
): TeacherDashboardData {
  const courseTitleById = new Map<number, string>();
  courses.forEach((course) => {
    courseTitleById.set(course.id, course.titre || `Cours #${course.id}`);
  });

  const courseRows: TeacherDashboardCourse[] = courses.map((course) => {
    const inscriptions = inscriptionsByCourseId.get(course.id) || [];
    const sessions = sessionsByCourseId.get(course.id) || [];
    const mappedSessions = sessions.map((session) => mapSession(session, courseTitleById));
    const upcomingForCourse = upcomingSessions(mappedSessions);
    const liveSessions = mappedSessions.filter((session) => session.isLive).length;
    const activeEnrollments = inscriptions.filter(
      (inscription) => asStatus(inscription.statut) === 'ACTIF',
    ).length;
    const completionRate =
      inscriptions.length === 0
        ? 0
        : Number(
            (
              inscriptions.reduce(
                (total, inscription) => total + normalizeProgress(inscription.progression),
                0,
              ) / inscriptions.length
            ).toFixed(1),
          );

    return {
      id: String(course.id),
      title: course.titre,
      description: course.description || '',
      category: course.categorie || 'General',
      enrollments: inscriptions.length,
      activeEnrollments,
      completionRate,
      sessions: mappedSessions.length,
      liveSessions,
      nextSessionAt: upcomingForCourse[0]?.startAt || null,
    };
  });

  const allSessions = Array.from(sessionsByCourseId.values())
    .flat()
    .map((session) => mapSession(session, courseTitleById));
  const upcoming = upcomingSessions(allSessions).slice(0, 10);
  const liveSessions = allSessions.filter((session) => session.isLive).length;

  const totalStudents = courseRows.reduce((total, course) => total + course.enrollments, 0);
  const activeEnrollments = courseRows.reduce((total, course) => total + course.activeEnrollments, 0);
  const averageCompletionRate =
    courseRows.length === 0
      ? 0
      : Number(
          (
            courseRows.reduce((total, course) => total + course.completionRate, 0) /
            courseRows.length
          ).toFixed(1),
        );

  return {
    stats: {
      totalCourses: courseRows.length,
      totalStudents,
      activeEnrollments,
      averageCompletionRate,
      upcomingSessions: upcoming.length,
      liveSessions,
    },
    courses: sortByIsoDesc(courseRows, (course) => course.nextSessionAt),
    upcomingSessions: upcoming,
  };
}

function buildAdminStats(raw?: BackendDashboardStatsDTO): AdminDashboardStats {
  return {
    totalUsers: toNumber(raw?.totalUtilisateurs),
    totalStudents: toNumber(raw?.totalEtudiants),
    totalTeachers: toNumber(raw?.totalEnseignants),
    totalAdmins: toNumber(raw?.totalAdministrateurs),
    totalCourses: toNumber(raw?.totalCours),
    activeCourses: toNumber(raw?.coursActifs),
    archivedCourses: toNumber(raw?.coursArchives),
    totalEnrollments: toNumber(raw?.totalInscriptions),
    activeEnrollments: toNumber(raw?.inscriptionsActives),
    totalSessions: toNumber(raw?.totalSessions),
    liveSessions: toNumber(raw?.sessionsLive),
    monthlyNewUsers: toNumber(raw?.nouveauxUtilisateursMois),
    monthlyEnrollments: toNumber(raw?.nouvellesInscriptionsMois),
    averageCourseRating: Number(toNumber(raw?.moyenneNoteCours).toFixed(2)),
    averageCompletionRate: Number(toNumber(raw?.tauxCompletionMoyen).toFixed(1)),
  };
}

function buildTeacherNameForAdminCourse(course: BackendCourseManagementDTO): string {
  const prenom = course.enseignantPrenom?.trim() || '';
  const nom = course.enseignantNom?.trim() || '';
  const full = `${prenom} ${nom}`.trim();
  return full || 'N/A';
}

function buildRecentCourses(courses: BackendCourseManagementDTO[]): AdminCourseOverview[] {
  const mapped = courses.map((course) => ({
    id: String(course.id),
    title: course.titre,
    teacherName: buildTeacherNameForAdminCourse(course),
    enrollmentCount: toNumber(course.nombreInscriptions),
    sessionsCount: toNumber(course.nombreSessions),
    averageRating: Number(toNumber(course.moyenneNotes).toFixed(2)),
    completionRate: Number(toNumber(course.tauxCompletion).toFixed(1)),
    isArchived: Boolean(course.archive),
    createdAt: toIso(course.dateCreation),
  }));

  return sortByIsoDesc(mapped, (course) => course.createdAt).slice(0, 10);
}

function buildStudentName(inscription: BackendInscriptionManagementDTO): string {
  const prenom = inscription.etudiantPrenom?.trim() || '';
  const nom = inscription.etudiantNom?.trim() || '';
  const full = `${prenom} ${nom}`.trim();
  return full || 'N/A';
}

function buildRecentInscriptions(
  inscriptions: BackendInscriptionManagementDTO[],
): AdminInscriptionOverview[] {
  const mapped = inscriptions.map((inscription) => ({
    id: String(inscription.id),
    studentName: buildStudentName(inscription),
    studentEmail: inscription.etudiantEmail || 'N/A',
    courseTitle: inscription.coursTitre || 'N/A',
    teacherName: inscription.enseignantNom || 'N/A',
    status: asStatus(inscription.statut),
    progress: normalizeProgress(inscription.progression),
    enrolledAt: toIso(inscription.dateInscription),
    lastActivityAt: toIso(inscription.dateDerniereActivite),
  }));

  return sortByIsoDesc(mapped, (inscription) => inscription.enrolledAt).slice(0, 10);
}

export function buildAdminDashboardData(
  stats: BackendDashboardStatsDTO | undefined,
  courses: BackendCourseManagementDTO[],
  inscriptions: BackendInscriptionManagementDTO[],
): AdminDashboardData {
  return {
    stats: buildAdminStats(stats),
    recentCourses: buildRecentCourses(courses),
    recentInscriptions: buildRecentInscriptions(inscriptions),
  };
}
