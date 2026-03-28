import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth, multipartBaseQuery } from './apiClient';
import type {
  BackendCourseDetailsDTO,
  BackendCourseDTO,
  BackendCourseLessonDTO,
  BackendCourseSectionDTO,
  BackendLiveChatMessageDTO,
  BackendLiveHandRaiseDTO,
  BackendLiveQuestionDTO,
  BackendLiveSessionDTO,
  LiveChatMessage,
  LiveCourseLite,
  LiveCourse,
  LiveCourseDetails,
  LiveCourseLesson,
  LiveCourseSection,
  LiveHandRaise,
  LiveQuestion,
  LiveSession,
  CourseMetadata,
  LiveSessionMetadata,
} from '../../types/live';
import {
  mapCourse,
  mapCourseDetails,
  mapLiveChatMessage,
  mapLiveCourse,
  mapLiveHandRaise,
  mapLiveQuestion,
  mapLiveSession,
} from '../../types/live';

export interface CreateLiveSessionPayload {
  courseId: string | number;
  teacherId: string | number;
  scheduledAt: string;
  recordingEnabled?: boolean;
  resolution?: string;
  broadcastType?: string;
  metadata?: LiveSessionMetadata;
}

export interface CreateCoursePayload {
  title: string;
  description: string;
  category: string;
  scheduledAt: string;
  teacherId: string | number;
  imageUrl?: string;
  metadata?: CourseMetadata;
}

type BackendLessonType = 'VIDEO' | 'TEXTE' | 'QUIZ';

export interface CreateCourseSectionPayload {
  courseId: string | number;
  title: string;
  description?: string;
  order: number;
}

export interface CreateCourseLessonPayload {
  courseId?: string | number;
  sectionId: string | number;
  title: string;
  description?: string;
  type: BackendLessonType;
  durationMinutes?: number;
  contentUrl?: string;
  contentText?: string;
  order: number;
}

export interface UpdateLiveSessionPayload {
  id: string | number;
  courseId: string | number;
  teacherId: string | number;
  scheduledAt: string;
  isLive: boolean;
  videoUrl?: string | null;
  recordingEnabled?: boolean;
  resolution?: string | null;
  broadcastType?: string | null;
  metadata?: LiveSessionMetadata | null;
}

export interface SendLiveChatMessagePayload {
  sessionId: string | number;
  senderId: string | number;
  content: string;
}

export interface CreateLiveQuestionPayload {
  sessionId: string | number;
  authorId: string | number;
  content: string;
}

export interface GetCourseDetailsPayload {
  courseId: string | number;
  studentId?: string | number | null;
}

interface BackendTeacherCourseDTO {
  id: number | string;
  titre?: string;
}

interface BackendTeacherInscriptionDTO {
  id: number | string;
  etudiantId?: number | string;
  etudiantNom?: string;
  coursId?: number | string;
  coursTitre?: string;
  dateInscription?: string | null;
  statut?: string | null;
  progression?: number | null;
  dateCompletion?: string | null;
}

export interface TeacherStudentEnrollment {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string | null;
  status: string;
  progress: number;
  completedAt: string | null;
}

export interface TeacherStudentsData {
  enrollments: TeacherStudentEnrollment[];
  uniqueStudents: number;
  activeEnrollments: number;
  coursesCount: number;
}

function toBackendDateTime(value: string): string {
  // datetime-local usually gives YYYY-MM-DDTHH:mm, backend LocalDateTime expects seconds too
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value}:00`;
  }
  return value;
}

function toIsoOrNull(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeProgress(value?: number | null): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function mapCourseSection(section: BackendCourseSectionDTO): LiveCourseSection {
  return {
    id: String(section.id),
    title: section.titre || `Section #${section.id}`,
    description: section.description || null,
    order: section.ordre || 0,
    lessons: (section.lecons || []).map(mapCourseLesson),
  };
}

function mapCourseLesson(lesson: BackendCourseLessonDTO): LiveCourseLesson {
  return {
    id: String(lesson.id),
    title: lesson.titre || `Lecon #${lesson.id}`,
    description: lesson.description || null,
    type: lesson.type || 'VIDEO',
    contentUrl: lesson.contenuUrl || null,
    contentText: lesson.contenuTexte || null,
    durationMinutes: typeof lesson.dureeMinutes === 'number' ? lesson.dureeMinutes : null,
    order: lesson.ordre || 0,
    completed: Boolean(lesson.isCompleted),
  };
}

export const liveApi = createApi({
  reducerPath: 'liveApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['LiveSession', 'LiveChat', 'LiveQuestion', 'LiveHandRaise', 'LiveCourse'],
  endpoints: (builder) => ({
    getAllSessions: builder.query<LiveSession[], void>({
      query: () => '/api/sessions',
      transformResponse: (response: BackendLiveSessionDTO[]): LiveSession[] =>
        (response || []).map(mapLiveSession),
      providesTags: ['LiveSession'],
    }),

    getActiveSessions: builder.query<LiveSession[], void>({
      query: () => '/api/sessions/actives',
      transformResponse: (response: BackendLiveSessionDTO[]): LiveSession[] =>
        (response || []).map(mapLiveSession),
      providesTags: ['LiveSession'],
    }),

    getTeacherSessions: builder.query<LiveSession[], void>({
      query: () => '/api/sessions/enseignant/me',
      transformResponse: (response: BackendLiveSessionDTO[]): LiveSession[] =>
        (response || []).map(mapLiveSession),
      providesTags: ['LiveSession'],
    }),

    getTeacherCourses: builder.query<LiveCourse[], void>({
      query: () => '/api/enseignant/mes-cours',
      transformResponse: (response: BackendCourseDTO[]): LiveCourse[] =>
        (response || []).map(mapCourse),
      providesTags: ['LiveCourse'],
    }),

    getTeacherStudents: builder.query<TeacherStudentsData, void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const coursesResult = await baseQuery({ url: '/api/enseignant/mes-cours' });
        if (coursesResult.error) {
          return { error: coursesResult.error };
        }

        const teacherCourses = Array.isArray(coursesResult.data)
          ? (coursesResult.data as BackendTeacherCourseDTO[])
          : [];

        if (!teacherCourses.length) {
          return {
            data: {
              enrollments: [],
              uniqueStudents: 0,
              activeEnrollments: 0,
              coursesCount: 0,
            },
          };
        }

        const inscriptionResults = await Promise.all(
          teacherCourses.map((course) =>
            baseQuery({
              url: `/api/inscriptions/cours/${course.id}`,
            }),
          ),
        );

        for (const result of inscriptionResults) {
          if (result.error) {
            return { error: result.error };
          }
        }

        const enrollments: TeacherStudentEnrollment[] = [];

        inscriptionResults.forEach((result, index) => {
          const course = teacherCourses[index];
          const fallbackCourseId = String(course.id);
          const fallbackCourseTitle = course.titre || `Cours #${course.id}`;
          const courseInscriptions = Array.isArray(result.data)
            ? (result.data as BackendTeacherInscriptionDTO[])
            : [];

          courseInscriptions.forEach((inscription) => {
            const studentId =
              inscription.etudiantId !== null && inscription.etudiantId !== undefined
                ? String(inscription.etudiantId)
                : '';

            if (!studentId) {
              return;
            }

            enrollments.push({
              enrollmentId: String(inscription.id),
              studentId,
              studentName: inscription.etudiantNom || `Etudiant #${studentId}`,
              courseId:
                inscription.coursId !== null && inscription.coursId !== undefined
                  ? String(inscription.coursId)
                  : fallbackCourseId,
              courseTitle: inscription.coursTitre || fallbackCourseTitle,
              enrolledAt: toIsoOrNull(inscription.dateInscription),
              status: inscription.statut || 'ACTIF',
              progress: normalizeProgress(inscription.progression),
              completedAt: toIsoOrNull(inscription.dateCompletion),
            });
          });
        });

        enrollments.sort((left, right) => {
          const leftDate = new Date(left.enrolledAt || 0).getTime();
          const rightDate = new Date(right.enrolledAt || 0).getTime();
          return rightDate - leftDate;
        });

        const uniqueStudents = new Set(enrollments.map((item) => item.studentId)).size;
        const activeEnrollments = enrollments.filter(
          (item) => item.status === 'ACTIF' || item.status === 'ACTIVE',
        ).length;

        return {
          data: {
            enrollments,
            uniqueStudents,
            activeEnrollments,
            coursesCount: teacherCourses.length,
          },
        };
      },
      providesTags: ['LiveCourse'],
    }),

    getCourseSessions: builder.query<LiveSession[], string | number>({
      query: (courseId) => `/api/sessions/cours/${courseId}`,
      transformResponse: (response: BackendLiveSessionDTO[]): LiveSession[] =>
        (response || []).map(mapLiveSession),
      providesTags: (_result, _error, arg) => [{ type: 'LiveSession', id: `COURSE-${arg}` }],
    }),

    getCourseLiveSession: builder.query<LiveSession, string | number>({
      query: (courseId) => `/api/sessions/cours/${courseId}/live`,
      transformResponse: (response: BackendLiveSessionDTO): LiveSession =>
        mapLiveSession(response),
      providesTags: (_result, _error, arg) => [{ type: 'LiveSession', id: `COURSE-LIVE-${arg}` }],
    }),

    getSessionById: builder.query<LiveSession, string | number>({
      query: (sessionId) => `/api/sessions/${sessionId}`,
      transformResponse: (response: BackendLiveSessionDTO): LiveSession =>
        mapLiveSession(response),
      providesTags: (_result, _error, arg) => [{ type: 'LiveSession', id: String(arg) }],
    }),

    getSessionStreamUrl: builder.query<string, string | number>({
      query: (sessionId) => `/api/sessions/${sessionId}/url`,
      keepUnusedDataFor: 0,
      providesTags: (_result, _error, arg) => [{ type: 'LiveSession', id: `URL-${arg}` }],
    }),

    createSession: builder.mutation<LiveSession, CreateLiveSessionPayload>({
      query: (payload) => ({
        url: '/api/sessions',
        method: 'POST',
        body: {
          dateHeure: toBackendDateTime(payload.scheduledAt),
          coursId: Number(payload.courseId),
          enseignantId: Number(payload.teacherId),
          recordingEnabled: payload.recordingEnabled ?? true,
          resolution: payload.resolution || '720p',
          broadcastType: payload.broadcastType || 'LIVEKIT',
          metadataJson: payload.metadata ? JSON.stringify(payload.metadata) : undefined,
        },
      }),
      transformResponse: (response: BackendLiveSessionDTO): LiveSession =>
        mapLiveSession(response),
      invalidatesTags: ['LiveSession'],
    }),

    updateSession: builder.mutation<LiveSession, UpdateLiveSessionPayload>({
      query: (payload) => ({
        url: `/api/sessions/${payload.id}`,
        method: 'PUT',
        body: {
          id: Number(payload.id),
          dateHeure: toBackendDateTime(payload.scheduledAt),
          estEnDirect: payload.isLive,
          videoUrl: payload.videoUrl || undefined,
          coursId: Number(payload.courseId),
          enseignantId: Number(payload.teacherId),
          recordingEnabled: payload.recordingEnabled ?? true,
          resolution: payload.resolution || undefined,
          broadcastType: payload.broadcastType || undefined,
          metadataJson: payload.metadata ? JSON.stringify(payload.metadata) : undefined,
        },
      }),
      transformResponse: (response: BackendLiveSessionDTO): LiveSession =>
        mapLiveSession(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'LiveSession', id: String(arg.id) },
        'LiveSession',
      ],
    }),

    startSession: builder.mutation<LiveSession, string | number>({
      query: (sessionId) => ({
        url: `/api/sessions/${sessionId}/start`,
        method: 'POST',
      }),
      transformResponse: (response: BackendLiveSessionDTO): LiveSession =>
        mapLiveSession(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'LiveSession', id: String(arg) },
        { type: 'LiveSession', id: `URL-${arg}` },
        'LiveSession',
      ],
    }),

    stopSession: builder.mutation<LiveSession, string | number>({
      query: (sessionId) => ({
        url: `/api/sessions/${sessionId}/stop`,
        method: 'POST',
      }),
      transformResponse: (response: BackendLiveSessionDTO): LiveSession =>
        mapLiveSession(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'LiveSession', id: String(arg) },
        { type: 'LiveSession', id: `URL-${arg}` },
        'LiveSession',
      ],
    }),

    joinSession: builder.mutation<LiveSession, string | number>({
      query: (sessionId) => ({
        url: `/api/sessions/${sessionId}/join`,
        method: 'POST',
      }),
      transformResponse: (response: BackendLiveSessionDTO): LiveSession =>
        mapLiveSession(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'LiveSession', id: String(arg) },
        'LiveSession',
      ],
    }),

    fetchSessionVod: builder.mutation<string, string | number>({
      query: (sessionId) => ({
        url: `/api/sessions/${sessionId}/fetch-vod`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'LiveSession', id: String(arg) },
        'LiveSession',
      ],
    }),

    uploadCourseThumbnail: builder.mutation<{ imageUrl: string }, FormData>({
      queryFn: async (formData, api, extraOptions) => {
        const result = await multipartBaseQuery(
          {
            url: '/api/cours/thumbnail',
            method: 'POST',
            body: formData,
          },
          api,
          extraOptions,
        );

        if (result.error) {
          return { error: result.error };
        }

        const payload = (result.data || {}) as { imageUrl?: string; data?: { imageUrl?: string } };
        const imageUrl = payload.imageUrl || payload.data?.imageUrl;
        if (!imageUrl) {
          return {
            error: {
              status: 'PARSING_ERROR',
              originalStatus: 200,
              data: result.data || '',
              error: 'Thumbnail upload response is missing imageUrl.',
            },
          };
        }

        return { data: { imageUrl } };
      },
    }),

    createCourse: builder.mutation<LiveCourse, CreateCoursePayload>({
      query: (payload) => ({
        url: '/api/cours',
        method: 'POST',
        body: {
          titre: payload.title.trim(),
          description: payload.description.trim(),
          categorie: payload.category.trim(),
          horaire: toBackendDateTime(payload.scheduledAt),
          enseignantId: Number(payload.teacherId),
          imageUrl: payload.imageUrl || undefined,
          metadataJson: payload.metadata ? JSON.stringify(payload.metadata) : undefined,
        },
      }),
      transformResponse: (response: BackendCourseDTO): LiveCourse => mapCourse(response),
      invalidatesTags: ['LiveCourse'],
    }),

    createSection: builder.mutation<LiveCourseSection, CreateCourseSectionPayload>({
      query: (payload) => ({
        url: '/api/sections',
        method: 'POST',
        body: {
          titre: payload.title.trim(),
          description: payload.description?.trim() || undefined,
          ordre: payload.order,
          coursId: Number(payload.courseId),
        },
      }),
      transformResponse: (response: BackendCourseSectionDTO): LiveCourseSection =>
        mapCourseSection(response),
      invalidatesTags: (_result, _error, arg) => [
        'LiveCourse',
        { type: 'LiveCourse', id: `DETAILS-${arg.courseId}` },
      ],
    }),

    createLesson: builder.mutation<LiveCourseLesson, CreateCourseLessonPayload>({
      query: (payload) => ({
        url: '/api/lecons',
        method: 'POST',
        body: {
          titre: payload.title.trim(),
          description: payload.description?.trim() || undefined,
          type: payload.type,
          contenuUrl: payload.contentUrl?.trim() || undefined,
          contenuTexte: payload.contentText?.trim() || undefined,
          dureeMinutes: payload.durationMinutes,
          ordre: payload.order,
          sectionId: Number(payload.sectionId),
        },
      }),
      transformResponse: (response: BackendCourseLessonDTO): LiveCourseLesson =>
        mapCourseLesson(response),
      invalidatesTags: (_result, _error, arg) => [
        'LiveCourse',
        ...(arg.courseId ? [{ type: 'LiveCourse' as const, id: `DETAILS-${arg.courseId}` }] : []),
      ],
    }),

    getCoursesLite: builder.query<LiveCourseLite[], void>({
      query: () => ({
        url: '/api/cours',
        params: { paginate: false },
      }),
      transformResponse: (response: BackendCourseDTO[]): LiveCourseLite[] =>
        (response || []).map(mapLiveCourse),
      providesTags: ['LiveCourse'],
    }),

    getCourses: builder.query<LiveCourse[], void>({
      query: () => ({
        url: '/api/cours',
        params: { paginate: false },
      }),
      transformResponse: (response: BackendCourseDTO[]): LiveCourse[] =>
        (response || []).map(mapCourse),
      providesTags: ['LiveCourse'],
    }),

    getCourseDetails: builder.query<LiveCourseDetails, GetCourseDetailsPayload>({
      query: ({ courseId, studentId }) => ({
        url: `/api/cours/${courseId}/details`,
        params: studentId ? { etudiantId: Number(studentId) } : undefined,
      }),
      transformResponse: (response: BackendCourseDetailsDTO): LiveCourseDetails =>
        mapCourseDetails(response),
      providesTags: (_result, _error, arg) => [{ type: 'LiveCourse', id: `DETAILS-${arg.courseId}` }],
    }),

    getChatHistory: builder.query<LiveChatMessage[], string | number>({
      query: (sessionId) => `/api/chat/history/${sessionId}`,
      transformResponse: (response: BackendLiveChatMessageDTO[]): LiveChatMessage[] =>
        (response || []).map(mapLiveChatMessage),
      providesTags: (_result, _error, arg) => [{ type: 'LiveChat', id: String(arg) }],
    }),

    sendChatMessage: builder.mutation<LiveChatMessage, SendLiveChatMessagePayload>({
      query: (payload) => ({
        url: '/api/chat/messages',
        method: 'POST',
        body: {
          contenu: payload.content.trim(),
          expediteurId: Number(payload.senderId),
          sessionId: Number(payload.sessionId),
        },
      }),
      transformResponse: (response: BackendLiveChatMessageDTO): LiveChatMessage =>
        mapLiveChatMessage(response),
      invalidatesTags: (_result, _error, arg) => [{ type: 'LiveChat', id: String(arg.sessionId) }],
    }),

    getQuestions: builder.query<LiveQuestion[], { sessionId: string | number; userId?: string | number }>({
      query: ({ sessionId, userId }) => ({
        url: `/api/questions/session/${sessionId}`,
        params: userId ? { userId: Number(userId) } : undefined,
      }),
      transformResponse: (response: BackendLiveQuestionDTO[]): LiveQuestion[] =>
        (response || []).map(mapLiveQuestion),
      providesTags: (_result, _error, arg) => [{ type: 'LiveQuestion', id: String(arg.sessionId) }],
    }),

    createQuestion: builder.mutation<LiveQuestion, CreateLiveQuestionPayload>({
      query: (payload) => ({
        url: '/api/questions',
        method: 'POST',
        body: {
          contenu: payload.content.trim(),
          auteurId: Number(payload.authorId),
          sessionId: Number(payload.sessionId),
        },
      }),
      transformResponse: (response: BackendLiveQuestionDTO): LiveQuestion =>
        mapLiveQuestion(response),
      invalidatesTags: (_result, _error, arg) => [{ type: 'LiveQuestion', id: String(arg.sessionId) }],
    }),

    upvoteQuestion: builder.mutation<LiveQuestion, { questionId: string | number; userId: string | number }>({
      query: ({ questionId, userId }) => ({
        url: `/api/questions/${questionId}/upvote`,
        method: 'POST',
        params: { userId: Number(userId) },
      }),
      transformResponse: (response: BackendLiveQuestionDTO): LiveQuestion =>
        mapLiveQuestion(response),
      invalidatesTags: ['LiveQuestion'],
    }),

    removeQuestionVote: builder.mutation<LiveQuestion, { questionId: string | number; userId: string | number }>({
      query: ({ questionId, userId }) => ({
        url: `/api/questions/${questionId}/upvote`,
        method: 'DELETE',
        params: { userId: Number(userId) },
      }),
      transformResponse: (response: BackendLiveQuestionDTO): LiveQuestion =>
        mapLiveQuestion(response),
      invalidatesTags: ['LiveQuestion'],
    }),

    markQuestionAnswered: builder.mutation<LiveQuestion, string | number>({
      query: (questionId) => ({
        url: `/api/questions/${questionId}/answered`,
        method: 'PUT',
      }),
      transformResponse: (response: BackendLiveQuestionDTO): LiveQuestion =>
        mapLiveQuestion(response),
      invalidatesTags: ['LiveQuestion'],
    }),

    getHandRaiseQueue: builder.query<LiveHandRaise[], string | number>({
      query: (sessionId) => `/api/handraises/session/${sessionId}/queue`,
      transformResponse: (response: BackendLiveHandRaiseDTO[]): LiveHandRaise[] =>
        (response || []).map(mapLiveHandRaise),
      providesTags: (_result, _error, arg) => [{ type: 'LiveHandRaise', id: String(arg) }],
    }),

    getCurrentSpeaker: builder.query<LiveHandRaise | null, string | number>({
      query: (sessionId) => `/api/handraises/session/${sessionId}/speaker`,
      transformResponse: (response: BackendLiveHandRaiseDTO | null): LiveHandRaise | null =>
        response ? mapLiveHandRaise(response) : null,
      providesTags: (_result, _error, arg) => [{ type: 'LiveHandRaise', id: `speaker-${arg}` }],
    }),

    raiseHand: builder.mutation<LiveHandRaise, { sessionId: string | number; studentId: string | number }>({
      query: ({ sessionId, studentId }) => ({
        url: '/api/handraises/raise',
        method: 'POST',
        params: {
          sessionId: Number(sessionId),
          etudiantId: Number(studentId),
        },
      }),
      transformResponse: (response: BackendLiveHandRaiseDTO): LiveHandRaise =>
        mapLiveHandRaise(response),
      invalidatesTags: (_result, _error, arg) => [{ type: 'LiveHandRaise', id: String(arg.sessionId) }],
    }),

    lowerHand: builder.mutation<LiveHandRaise, { sessionId: string | number; studentId: string | number }>({
      query: ({ sessionId, studentId }) => ({
        url: '/api/handraises/lower',
        method: 'POST',
        params: {
          sessionId: Number(sessionId),
          etudiantId: Number(studentId),
        },
      }),
      transformResponse: (response: BackendLiveHandRaiseDTO): LiveHandRaise =>
        mapLiveHandRaise(response),
      invalidatesTags: (_result, _error, arg) => [{ type: 'LiveHandRaise', id: String(arg.sessionId) }],
    }),

    grantSpeaking: builder.mutation<LiveHandRaise, string | number>({
      query: (handRaiseId) => ({
        url: `/api/handraises/${handRaiseId}/grant`,
        method: 'POST',
      }),
      transformResponse: (response: BackendLiveHandRaiseDTO): LiveHandRaise =>
        mapLiveHandRaise(response),
      invalidatesTags: ['LiveHandRaise'],
    }),

    completeSpeaking: builder.mutation<LiveHandRaise, string | number>({
      query: (handRaiseId) => ({
        url: `/api/handraises/${handRaiseId}/complete`,
        method: 'POST',
      }),
      transformResponse: (response: BackendLiveHandRaiseDTO): LiveHandRaise =>
        mapLiveHandRaise(response),
      invalidatesTags: ['LiveHandRaise'],
    }),
  }),
});

export const {
  useGetAllSessionsQuery,
  useGetActiveSessionsQuery,
  useGetTeacherSessionsQuery,
  useGetTeacherCoursesQuery,
  useGetTeacherStudentsQuery,
  useGetCourseSessionsQuery,
  useGetCourseLiveSessionQuery,
  useGetSessionByIdQuery,
  useGetSessionStreamUrlQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useStartSessionMutation,
  useStopSessionMutation,
  useJoinSessionMutation,
  useFetchSessionVodMutation,
  useUploadCourseThumbnailMutation,
  useCreateCourseMutation,
  useCreateSectionMutation,
  useCreateLessonMutation,
  useGetCoursesLiteQuery,
  useGetCoursesQuery,
  useGetCourseDetailsQuery,
  useGetChatHistoryQuery,
  useSendChatMessageMutation,
  useGetQuestionsQuery,
  useCreateQuestionMutation,
  useUpvoteQuestionMutation,
  useRemoveQuestionVoteMutation,
  useMarkQuestionAnsweredMutation,
  useGetHandRaiseQueueQuery,
  useGetCurrentSpeakerQuery,
  useRaiseHandMutation,
  useLowerHandMutation,
  useGrantSpeakingMutation,
  useCompleteSpeakingMutation,
} = liveApi;
