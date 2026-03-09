import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Course, CourseDetails, CourseProgress } from '../../types/course';

export const coursesApi = createApi({
  reducerPath: 'coursesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NODE_ENV === 'production' 
      ? '/api/v1' 
      : 'http://localhost:8080/api/v1',
    
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
      const token = state?.auth?.token;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      headers.set('content-type', 'application/json');
      headers.set('accept', 'application/json');
      
      return headers;
    },
  }),
  
  tagTypes: ['Course', 'Progress'],
  
  endpoints: (builder) => ({
    // Get courses with filters
    getCourses: builder.query<{
      courses: Course[];
      page: number;
      totalPages: number;
      hasNextPage: boolean;
    }, {
      page?: number;
      limit?: number;
      category?: string;
      level?: string;
      sortBy?: string;
    }>({
      query: (params) => ({
        url: '/courses',
        params,
      }),
      
      // Development mode simulation
      queryFn: async (params, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Mock courses data
          const mockCourses: Course[] = [
            {
              id: '1',
              title: 'React Hooks Avancés',
              description: 'Maîtrisez les hooks React pour créer des applications modernes et performantes.',
              shortDescription: 'Apprenez les hooks React avancés',
              thumbnail: '/api/placeholder/400/225',
              instructorId: 'instructor1',
              instructorName: 'Sarah Martin',
              instructorAvatar: '/api/placeholder/64/64',
              category: 'Frontend',
              level: 'intermediate',
              language: 'fr',
              price: 49.99,
              currency: 'EUR',
              rating: 4.8,
              ratingCount: 234,
              enrollmentCount: 1567,
              viewCount: 3421,
              totalLessons: 24,
              totalDuration: 180,
              estimatedCompletionTime: '3 semaines',
              status: 'published',
              isPublic: true,
              publishedAt: new Date('2024-01-15'),
              lastUpdatedAt: new Date('2024-01-20'),
              hasCertificate: true,
              hasLiveSupport: true,
              hasDownloads: true,
              hasQuizzes: true,
              hasAssignments: false,
              tags: ['React', 'JavaScript', 'Frontend', 'Hooks'],
            },
            {
              id: '2',
              title: 'TypeScript Masterclass',
              description: 'Développement moderne avec TypeScript pour des applications robustes.',
              shortDescription: 'Maîtrisez TypeScript de A à Z',
              thumbnail: '/api/placeholder/400/225',
              instructorId: 'instructor2',
              instructorName: 'Pierre Dupont',
              instructorAvatar: '/api/placeholder/64/64',
              category: 'Backend',
              level: 'advanced',
              language: 'fr',
              price: 69.99,
              currency: 'EUR',
              rating: 4.9,
              ratingCount: 156,
              enrollmentCount: 892,
              viewCount: 2103,
              totalLessons: 32,
              totalDuration: 240,
              estimatedCompletionTime: '4 semaines',
              status: 'published',
              isPublic: true,
              publishedAt: new Date('2024-02-01'),
              lastUpdatedAt: new Date('2024-02-10'),
              hasCertificate: true,
              hasLiveSupport: false,
              hasDownloads: true,
              hasQuizzes: true,
              hasAssignments: true,
              tags: ['TypeScript', 'JavaScript', 'Backend', 'Types'],
            },
          ];
          
          return {
            data: {
              courses: mockCourses,
              page: params.page || 1,
              totalPages: 5,
              hasNextPage: (params.page || 1) < 5,
            }
          };
        }
        
        return baseQuery({
          url: '/courses',
          params,
        }, api, extraOptions);
      },
      
      providesTags: ['Course'],
    }),
    
    // Get course details
    getCourseDetails: builder.query<{ course: CourseDetails }, string>({
      query: (courseId) => `/courses/${courseId}`,
      
      queryFn: async (courseId, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 600));
          
          // Mock course details
          const mockCourseDetails: CourseDetails = {
            id: courseId,
            title: 'React Hooks Avancés',
            description: 'Maîtrisez les hooks React pour créer des applications modernes et performantes. Ce cours couvre tous les aspects avancés des hooks, depuis useState et useEffect jusqu\'aux hooks personnalisés.',
            shortDescription: 'Apprenez les hooks React avancés',
            thumbnail: '/api/placeholder/400/225',
            previewVideo: '/api/placeholder/video',
            instructorId: 'instructor1',
            instructorName: 'Sarah Martin',
            instructorAvatar: '/api/placeholder/64/64',
            category: 'Frontend',
            subcategory: 'React',
            level: 'intermediate',
            language: 'fr',
            price: 49.99,
            currency: 'EUR',
            rating: 4.8,
            ratingCount: 234,
            enrollmentCount: 1567,
            viewCount: 3421,
            totalLessons: 24,
            totalDuration: 180,
            estimatedCompletionTime: '3 semaines',
            status: 'published',
            isPublic: true,
            publishedAt: new Date('2024-01-15'),
            lastUpdatedAt: new Date('2024-01-20'),
            hasCertificate: true,
            hasLiveSupport: true,
            hasDownloads: true,
            hasQuizzes: true,
            hasAssignments: false,
            tags: ['React', 'JavaScript', 'Frontend', 'Hooks'],
            
            // Extended fields
            objectives: [
              'Maîtriser useState et useEffect',
              'Créer des hooks personnalisés',
              'Optimiser les performances avec useMemo et useCallback',
              'Gérer l\'état global avec useContext',
            ],
            prerequisites: [
              'Connaissance de base de React',
              'JavaScript ES6+',
              'HTML/CSS',
            ],
            targetAudience: [
              'Développeurs React intermédiaires',
              'Frontend developers',
              'Étudiants en développement web',
            ],
            
            curriculum: [
              {
                id: 'section1',
                title: 'Introduction aux Hooks',
                description: 'Comprendre les bases des hooks React',
                order: 1,
                totalDuration: 45,
                lessons: [
                  {
                    id: 'lesson1',
                    title: 'Qu\'est-ce que les hooks ?',
                    description: 'Introduction aux concepts des hooks',
                    type: 'video',
                    order: 1,
                    duration: 15,
                    isPreview: true,
                    isRequired: true,
                    attachments: [],
                  },
                  {
                    id: 'lesson2',
                    title: 'useState en détail',
                    description: 'Comprendre et utiliser useState',
                    type: 'video',
                    order: 2,
                    duration: 20,
                    isPreview: false,
                    isRequired: true,
                    attachments: [],
                  },
                  {
                    id: 'lesson3',
                    title: 'Quiz: Bases des hooks',
                    description: 'Testez vos connaissances',
                    type: 'quiz',
                    order: 3,
                    duration: 10,
                    isPreview: false,
                    isRequired: true,
                    passingScore: 80,
                    attachments: [],
                  },
                ],
              },
            ],
            
            resources: [
              {
                id: 'resource1',
                title: 'Documentation officielle React',
                type: 'link',
                url: 'https://react.dev',
                category: 'Documentation',
              },
            ],
            
            instructor: {
              id: 'instructor1',
              name: 'Sarah Martin',
              bio: 'Développeuse senior avec 8+ années d\'expérience en React et JavaScript. Passionnée par l\'enseignement et les nouvelles technologies.',
              avatar: '/api/placeholder/128/128',
              rating: 4.9,
              studentCount: 5420,
              courseCount: 8,
              socialLinks: {
                website: 'https://sarahmartin.dev',
                linkedin: 'https://linkedin.com/in/sarahmartin',
                github: 'https://github.com/sarahmartin',
              },
            },
            
            reviews: [
              {
                id: 'review1',
                userId: 'user1',
                userName: 'Pierre Dubois',
                rating: 5,
                comment: 'Excellent cours ! Les explications sont claires et les exemples pratiques.',
                createdAt: new Date('2024-01-25'),
                helpfulCount: 12,
              },
            ],
            
            averageRating: 4.8,
            ratingDistribution: {
              5: 180,
              4: 40,
              3: 10,
              2: 3,
              1: 1,
            },
            
            completionRate: 78,
            averageTimeToComplete: 21,
            retentionRate: 85,
            
            faq: [
              {
                id: 'faq1',
                question: 'Quel est le niveau requis pour ce cours ?',
                answer: 'Une connaissance de base de React est recommandée.',
                order: 1,
              },
            ],
            
            announcements: [
              {
                id: 'announcement1',
                title: 'Nouveau chapitre ajouté',
                content: 'J\'ai ajouté un chapitre sur les hooks personnalisés avancés.',
                createdAt: new Date('2024-01-20'),
                isImportant: true,
              },
            ],
          };
          
          return { data: { course: mockCourseDetails } };
        }
        
        return baseQuery(`/courses/${courseId}`, api, extraOptions);
      },
      
      providesTags: (result, error, courseId) => [{ type: 'Course', id: courseId }],
    }),
    
    // Search courses
    searchCourses: builder.query<{
      courses: Course[];
      total: number;
    }, {
      query: string;
      filters?: any;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/courses/search',
        params,
      }),
      
      queryFn: async (params, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Simple mock search - filter by title
          const allCourses: Course[] = []; // Use same mock data as getCourses
          const filteredCourses = allCourses.filter(course => 
            course.title.toLowerCase().includes(params.query.toLowerCase()) ||
            course.description.toLowerCase().includes(params.query.toLowerCase())
          );
          
          return {
            data: {
              courses: filteredCourses,
              total: filteredCourses.length,
            }
          };
        }
        
        return baseQuery({
          url: '/courses/search',
          params,
        }, api, extraOptions);
      },
      
      providesTags: ['Course'],
    }),
    
    // Get featured courses
    getFeaturedCourses: builder.query<{ courses: Course[] }, void>({
      query: () => '/courses/featured',
      
      queryFn: async (_, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 400));
          
          return {
            data: {
              courses: [], // Use subset of mock courses
            }
          };
        }
        
        return baseQuery('/courses/featured', api, extraOptions);
      },
      
      providesTags: ['Course'],
    }),
    
    // Get recommended courses
    getRecommendedCourses: builder.query<{ courses: Course[] }, string>({
      query: (userId) => `/courses/recommended/${userId}`,
      
      queryFn: async (userId, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 600));
          
          return {
            data: {
              courses: [], // Use personalized mock courses
            }
          };
        }
        
        return baseQuery(`/courses/recommended/${userId}`, api, extraOptions);
      },
      
      providesTags: ['Course'],
    }),
    
    // Update course progress
    updateProgress: builder.mutation<CourseProgress, {
      courseId: string;
      lessonId: string;
      progress: number;
      completed?: boolean;
      timeSpent?: number;
    }>({
      query: (data) => ({
        url: `/courses/${data.courseId}/progress`,
        method: 'PUT',
        body: data,
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          return {
            data: {
              courseId: data.courseId,
              lessonId: data.lessonId,
              progress: data.progress,
              completed: data.completed || false,
            }
          };
        }
        
        return baseQuery({
          url: `/courses/${data.courseId}/progress`,
          method: 'PUT',
          body: data,
        }, api, extraOptions);
      },
      
      invalidatesTags: (result, error, arg) => [
        { type: 'Course', id: arg.courseId },
        'Progress',
      ],
    }),
    
    // Rate course
    rateCourse: builder.mutation<{ courseId: string; rating: number }, {
      courseId: string;
      rating: number;
      review?: string;
    }>({
      query: (data) => ({
        url: `/courses/${data.courseId}/rating`,
        method: 'POST',
        body: data,
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 400));
          
          return {
            data: {
              courseId: data.courseId,
              rating: data.rating,
            }
          };
        }
        
        return baseQuery({
          url: `/courses/${data.courseId}/rating`,
          method: 'POST',
          body: data,
        }, api, extraOptions);
      },
      
      invalidatesTags: (result, error, arg) => [
        { type: 'Course', id: arg.courseId },
      ],
    }),
    
    // Bookmark lesson
    bookmarkLesson: builder.mutation<{ lessonId: string; bookmarked: boolean }, {
      courseId: string;
      lessonId: string;
      bookmarked: boolean;
    }>({
      query: (data) => ({
        url: `/courses/${data.courseId}/lessons/${data.lessonId}/bookmark`,
        method: data.bookmarked ? 'POST' : 'DELETE',
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          return {
            data: {
              lessonId: data.lessonId,
              bookmarked: data.bookmarked,
            }
          };
        }
        
        return baseQuery({
          url: `/courses/${data.courseId}/lessons/${data.lessonId}/bookmark`,
          method: data.bookmarked ? 'POST' : 'DELETE',
        }, api, extraOptions);
      },
      
      invalidatesTags: ['Course'],
    }),
    
    // Get course stats
    getCourseStats: builder.query<any, void>({
      query: () => '/courses/stats',
      
      queryFn: async (_, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          return {
            data: {
              totalCourses: 156,
              totalEnrollments: 12450,
              totalCompletions: 9876,
              averageRating: 4.7,
            }
          };
        }
        
        return baseQuery('/courses/stats', api, extraOptions);
      },
      
      providesTags: ['Course'],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseDetailsQuery,
  useSearchCoursesQuery,
  useGetFeaturedCoursesQuery,
  useGetRecommendedCoursesQuery,
  useUpdateProgressMutation,
  useRateCourseMutation,
  useBookmarkLessonMutation,
  useGetCourseStatsQuery,
} = coursesApi;