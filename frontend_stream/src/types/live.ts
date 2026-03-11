export type LiveSessionStatus = 'CREATED' | 'LIVE' | 'ENDED' | string;

export interface BackendLiveSessionDTO {
  id: number;
  dateHeure: string;
  estEnDirect: boolean;
  videoUrl?: string | null;
  coursId: number;
  enseignantId: number;
  streamKey?: string | null;
  recordingUrl?: string | null;
  recordingEnabled?: boolean;
  status?: LiveSessionStatus;
  resolution?: string | null;
  broadcastType?: string | null;
}

export interface LiveSession {
  id: string;
  scheduledAt: string;
  isLive: boolean;
  videoUrl: string | null;
  courseId: string;
  teacherId: string;
  streamKey: string | null;
  recordingUrl: string | null;
  recordingEnabled: boolean;
  status: LiveSessionStatus;
  resolution: string | null;
  broadcastType: string | null;
}

export interface BackendLiveChatMessageDTO {
  id: number;
  contenu: string;
  timestamp: string;
  expediteurId: number;
  expediteurNom?: string;
  expediteurPhoto?: string | null;
  expediteurRole?: string;
  sessionId: number;
}

export interface LiveChatMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderName: string;
  senderPhoto: string | null;
  senderRole: string | null;
  sessionId: string;
}

export interface BackendLiveQuestionDTO {
  id: number;
  contenu: string;
  timestamp: string;
  votes: number;
  estRepondue: boolean;
  auteurId: number;
  auteurNom?: string;
  auteurPhoto?: string | null;
  sessionId: number;
  userHasVoted?: boolean;
}

export interface LiveQuestion {
  id: string;
  content: string;
  createdAt: string;
  votes: number;
  answered: boolean;
  authorId: string;
  authorName: string;
  authorPhoto: string | null;
  sessionId: string;
  userHasVoted: boolean;
}

export interface BackendLiveHandRaiseDTO {
  id: number;
  etudiantId: number;
  etudiantNom?: string;
  etudiantPhoto?: string | null;
  sessionId: number;
  timestampDemande?: string;
  statut?: string;
  timestampAccorde?: string | null;
  timestampFin?: string | null;
  ordre?: number;
}

export interface LiveHandRaise {
  id: string;
  studentId: string;
  studentName: string;
  studentPhoto: string | null;
  sessionId: string;
  requestedAt: string | null;
  status: string;
  grantedAt: string | null;
  endedAt: string | null;
  order: number | null;
}

export interface BackendCourseDTO {
  id: number;
  titre: string;
  description: string;
  categorie: string;
  horaire: string;
  enseignantId: number;
}

export interface BackendCourseDetailsDTO extends BackendCourseDTO {
  imageUrl?: string | null;
  dureeEstimeeHeures?: number | null;
  enseignantNom?: string | null;
  enseignantSpecialite?: string | null;
  nombreInscrits?: number | null;
  notemoyenne?: number | null;
  nombreAvis?: number | null;
  isInscrit?: boolean | null;
  sections?: BackendCourseSectionDTO[] | null;
}

export interface BackendCourseSectionDTO {
  id: number;
  titre: string;
  description?: string | null;
  ordre: number;
  coursId: number;
  lecons?: BackendCourseLessonDTO[] | null;
}

export interface BackendCourseLessonDTO {
  id: number;
  titre: string;
  description?: string | null;
  type: string;
  contenuUrl?: string | null;
  contenuTexte?: string | null;
  dureeMinutes?: number | null;
  ordre: number;
  sectionId: number;
  isCompleted?: boolean | null;
}

export interface LiveCourseLite {
  id: string;
  title: string;
}

export interface LiveCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  scheduledAt: string;
  teacherId: string;
  coverImage: string | null;
  durationMinutes: number | null;
}

export interface LiveCourseDetails extends LiveCourse {
  teacherName: string | null;
  teacherSpeciality: string | null;
  enrolledCount: number;
  averageRating: number | null;
  reviewCount: number;
  isEnrolled: boolean;
  sections: LiveCourseSection[];
}

export interface LiveCourseSection {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: LiveCourseLesson[];
}

export interface LiveCourseLesson {
  id: string;
  title: string;
  description: string | null;
  type: string;
  contentUrl: string | null;
  contentText: string | null;
  durationMinutes: number | null;
  order: number;
  completed: boolean;
}

export function mapLiveSession(dto: BackendLiveSessionDTO): LiveSession {
  return {
    id: String(dto.id),
    scheduledAt: dto.dateHeure,
    isLive: dto.estEnDirect || dto.status === 'LIVE',
    videoUrl: dto.videoUrl || null,
    courseId: String(dto.coursId),
    teacherId: String(dto.enseignantId),
    streamKey: dto.streamKey || null,
    recordingUrl: dto.recordingUrl || null,
    recordingEnabled: dto.recordingEnabled ?? true,
    status: dto.status || 'CREATED',
    resolution: dto.resolution || null,
    broadcastType: dto.broadcastType || null,
  };
}

export function mapLiveChatMessage(dto: BackendLiveChatMessageDTO): LiveChatMessage {
  return {
    id: String(dto.id),
    content: dto.contenu,
    createdAt: dto.timestamp,
    senderId: String(dto.expediteurId),
    senderName: dto.expediteurNom || 'Utilisateur',
    senderPhoto: dto.expediteurPhoto || null,
    senderRole: dto.expediteurRole || null,
    sessionId: String(dto.sessionId),
  };
}

export function mapLiveQuestion(dto: BackendLiveQuestionDTO): LiveQuestion {
  return {
    id: String(dto.id),
    content: dto.contenu,
    createdAt: dto.timestamp,
    votes: dto.votes || 0,
    answered: Boolean(dto.estRepondue),
    authorId: String(dto.auteurId),
    authorName: dto.auteurNom || 'Etudiant',
    authorPhoto: dto.auteurPhoto || null,
    sessionId: String(dto.sessionId),
    userHasVoted: Boolean(dto.userHasVoted),
  };
}

export function mapLiveHandRaise(dto: BackendLiveHandRaiseDTO): LiveHandRaise {
  return {
    id: String(dto.id),
    studentId: String(dto.etudiantId),
    studentName: dto.etudiantNom || 'Etudiant',
    studentPhoto: dto.etudiantPhoto || null,
    sessionId: String(dto.sessionId),
    requestedAt: dto.timestampDemande || null,
    status: dto.statut || 'PENDING',
    grantedAt: dto.timestampAccorde || null,
    endedAt: dto.timestampFin || null,
    order: typeof dto.ordre === 'number' ? dto.ordre : null,
  };
}

export function mapLiveCourse(dto: BackendCourseDTO): LiveCourseLite {
  return {
    id: String(dto.id),
    title: dto.titre || `Cours #${dto.id}`,
  };
}

export function mapCourse(dto: BackendCourseDTO): LiveCourse {
  return {
    id: String(dto.id),
    title: dto.titre || `Cours #${dto.id}`,
    description: dto.description || '',
    category: dto.categorie || 'General',
    scheduledAt: dto.horaire,
    teacherId: String(dto.enseignantId),
    coverImage: null,
    durationMinutes: null,
  };
}

export function mapCourseDetails(dto: BackendCourseDetailsDTO): LiveCourseDetails {
  const base = mapCourse(dto);

  return {
    ...base,
    coverImage: dto.imageUrl || null,
    durationMinutes: dto.dureeEstimeeHeures ? dto.dureeEstimeeHeures * 60 : null,
    teacherName: dto.enseignantNom || null,
    teacherSpeciality: dto.enseignantSpecialite || null,
    enrolledCount: dto.nombreInscrits || 0,
    averageRating: typeof dto.notemoyenne === 'number' ? dto.notemoyenne : null,
    reviewCount: dto.nombreAvis || 0,
    isEnrolled: Boolean(dto.isInscrit),
    sections: (dto.sections || []).map((section) => ({
      id: String(section.id),
      title: section.titre || `Section #${section.id}`,
      description: section.description || null,
      order: section.ordre || 0,
      lessons: (section.lecons || []).map((lesson) => ({
        id: String(lesson.id),
        title: lesson.titre || `Lecon #${lesson.id}`,
        description: lesson.description || null,
        type: lesson.type || 'VIDEO',
        contentUrl: lesson.contenuUrl || null,
        contentText: lesson.contenuTexte || null,
        durationMinutes:
          typeof lesson.dureeMinutes === 'number' ? lesson.dureeMinutes : null,
        order: lesson.ordre || 0,
        completed: Boolean(lesson.isCompleted),
      })),
    })),
  };
}
