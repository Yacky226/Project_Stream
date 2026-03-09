import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Course, CourseDetails, Lesson, CourseProgress, CourseFilter, CourseStats } from '../../types/course';
import { coursesApi } from '../api/coursesApi';

interface CoursesState {
  // Course data
  courses: Course[];
  featuredCourses: Course[];
  recommendedCourses: Course[];
  currentCourse: CourseDetails | null;
  
  // User progress
  userProgress: Record<string, CourseProgress>;
  recentlyViewed: string[];
  bookmarkedLessons: string[];
  
  // Filters and search
  filters: CourseFilter;
  searchQuery: string;
  searchResults: Course[];
  
  // Categories and tags
  categories: string[];
  tags: string[];
  instructors: any[];
  
  // Statistics
  stats: CourseStats | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  
  // UI state
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  
  // Cache management
  lastFetch: Record<string, number>;
  cacheExpiry: number;
}

const initialState: CoursesState = {
  courses: [],
  featuredCourses: [],
  recommendedCourses: [],
  currentCourse: null,
  userProgress: {},
  recentlyViewed: [],
  bookmarkedLessons: [],
  filters: {
    category: 'all',
    level: 'all',
    price: 'all',
    duration: 'all',
    rating: 0,
    language: 'all',
    sortBy: 'popularity',
    sortOrder: 'desc',
  },
  searchQuery: '',
  searchResults: [],
  categories: [],
  tags: [],
  instructors: [],
  stats: null,
  currentPage: 1,
  totalPages: 1,
  hasNextPage: false,
  isLoading: false,
  isSearching: false,
  error: null,
  lastFetch: {},
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
};

// Async thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (params: {
    page?: number;
    limit?: number;
    category?: string;
    level?: string;
    sortBy?: string;
    forceRefresh?: boolean;
  } = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { courses: CoursesState };
      const cacheKey = `courses-${JSON.stringify(params)}`;
      const lastFetch = state.courses.lastFetch[cacheKey];
      
      // Check cache validity
      if (!params.forceRefresh && lastFetch && Date.now() - lastFetch < state.courses.cacheExpiry) {
        return { fromCache: true };
      }
      
      const response = await coursesApi.endpoints.getCourses.initiate(params).unwrap();
      return { ...response, cacheKey };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch courses');
    }
  }
);

export const fetchCourseDetails = createAsyncThunk(
  'courses/fetchCourseDetails',
  async (courseId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { courses: CoursesState };
      const cacheKey = `course-${courseId}`;
      const lastFetch = state.courses.lastFetch[cacheKey];
      
      // Check cache validity
      if (lastFetch && Date.now() - lastFetch < state.courses.cacheExpiry) {
        return { fromCache: true };
      }
      
      const response = await coursesApi.endpoints.getCourseDetails.initiate(courseId).unwrap();
      return { ...response, cacheKey };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch course details');
    }
  }
);

export const searchCourses = createAsyncThunk(
  'courses/searchCourses',
  async (params: {
    query: string;
    filters?: Partial<CourseFilter>;
    page?: number;
    limit?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await coursesApi.endpoints.searchCourses.initiate(params).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search courses');
    }
  }
);

export const fetchFeaturedCourses = createAsyncThunk(
  'courses/fetchFeaturedCourses',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { courses: CoursesState };
      const cacheKey = 'featured-courses';
      const lastFetch = state.courses.lastFetch[cacheKey];
      
      if (lastFetch && Date.now() - lastFetch < state.courses.cacheExpiry) {
        return { fromCache: true };
      }
      
      const response = await coursesApi.endpoints.getFeaturedCourses.initiate().unwrap();
      return { ...response, cacheKey };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch featured courses');
    }
  }
);

export const fetchRecommendedCourses = createAsyncThunk(
  'courses/fetchRecommendedCourses',
  async (userId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { courses: CoursesState };
      const cacheKey = `recommended-${userId}`;
      const lastFetch = state.courses.lastFetch[cacheKey];
      
      if (lastFetch && Date.now() - lastFetch < state.courses.cacheExpiry) {
        return { fromCache: true };
      }
      
      const response = await coursesApi.endpoints.getRecommendedCourses.initiate(userId).unwrap();
      return { ...response, cacheKey };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch recommended courses');
    }
  }
);

export const updateCourseProgress = createAsyncThunk(
  'courses/updateProgress',
  async (data: {
    courseId: string;
    lessonId: string;
    progress: number;
    completed?: boolean;
    timeSpent?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await coursesApi.endpoints.updateProgress.initiate(data).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update progress');
    }
  }
);

export const rateCourse = createAsyncThunk(
  'courses/rateCourse',
  async (data: {
    courseId: string;
    rating: number;
    review?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await coursesApi.endpoints.rateCourse.initiate(data).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to rate course');
    }
  }
);

export const bookmarkLesson = createAsyncThunk(
  'courses/bookmarkLesson',
  async (data: {
    courseId: string;
    lessonId: string;
    bookmarked: boolean;
  }, { rejectWithValue }) => {
    try {
      const response = await coursesApi.endpoints.bookmarkLesson.initiate(data).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to bookmark lesson');
    }
  }
);

export const fetchCourseStats = createAsyncThunk(
  'courses/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await coursesApi.endpoints.getCourseStats.initiate().unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch course stats');
    }
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    // Filters and search
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    updateFilters: (state, action: PayloadAction<Partial<CourseFilter>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },
    
    // Current course
    setCurrentCourse: (state, action: PayloadAction<CourseDetails | null>) => {
      state.currentCourse = action.payload;
      
      // Add to recently viewed
      if (action.payload && !state.recentlyViewed.includes(action.payload.id)) {
        state.recentlyViewed.unshift(action.payload.id);
        // Keep only last 10
        if (state.recentlyViewed.length > 10) {
          state.recentlyViewed = state.recentlyViewed.slice(0, 10);
        }
      }
    },
    
    // Progress tracking
    updateLocalProgress: (state, action: PayloadAction<{
      courseId: string;
      lessonId: string;
      progress: number;
      timeSpent?: number;
    }>) => {
      const { courseId, lessonId, progress, timeSpent } = action.payload;
      
      if (!state.userProgress[courseId]) {
        state.userProgress[courseId] = {
          courseId,
          completedLessons: [],
          currentLesson: lessonId,
          overallProgress: 0,
          timeSpent: 0,
          lastAccessed: Date.now(),
          quizScores: {},
          certificates: [],
        };
      }
      
      const courseProgress = state.userProgress[courseId];
      courseProgress.currentLesson = lessonId;
      courseProgress.lastAccessed = Date.now();
      
      if (timeSpent) {
        courseProgress.timeSpent += timeSpent;
      }
      
      // Update lesson progress
      if (progress >= 100 && !courseProgress.completedLessons.includes(lessonId)) {
        courseProgress.completedLessons.push(lessonId);
      }
    },
    
    // Bookmarks
    toggleLessonBookmark: (state, action: PayloadAction<string>) => {
      const lessonId = action.payload;
      const index = state.bookmarkedLessons.indexOf(lessonId);
      
      if (index === -1) {
        state.bookmarkedLessons.push(lessonId);
      } else {
        state.bookmarkedLessons.splice(index, 1);
      }
    },
    
    addBookmarkedLesson: (state, action: PayloadAction<string>) => {
      if (!state.bookmarkedLessons.includes(action.payload)) {
        state.bookmarkedLessons.push(action.payload);
      }
    },
    
    removeBookmarkedLesson: (state, action: PayloadAction<string>) => {
      state.bookmarkedLessons = state.bookmarkedLessons.filter(
        lessonId => lessonId !== action.payload
      );
    },
    
    // Recently viewed
    addRecentlyViewed: (state, action: PayloadAction<string>) => {
      const courseId = action.payload;
      const index = state.recentlyViewed.indexOf(courseId);
      
      if (index !== -1) {
        state.recentlyViewed.splice(index, 1);
      }
      
      state.recentlyViewed.unshift(courseId);
      
      // Keep only last 10
      if (state.recentlyViewed.length > 10) {
        state.recentlyViewed = state.recentlyViewed.slice(0, 10);
      }
    },
    
    clearRecentlyViewed: (state) => {
      state.recentlyViewed = [];
    },
    
    // Pagination
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    // Cache management
    invalidateCache: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) {
        delete state.lastFetch[action.payload];
      } else {
        state.lastFetch = {};
      }
    },
    
    setCacheExpiry: (state, action: PayloadAction<number>) => {
      state.cacheExpiry = action.payload;
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
    },
    
    // Local course updates
    updateCourseLocally: (state, action: PayloadAction<{ id: string; updates: Partial<Course> }>) => {
      const { id, updates } = action.payload;
      
      // Update in courses array
      const courseIndex = state.courses.findIndex(course => course.id === id);
      if (courseIndex !== -1) {
        state.courses[courseIndex] = { ...state.courses[courseIndex], ...updates };
      }
      
      // Update in featured courses
      const featuredIndex = state.featuredCourses.findIndex(course => course.id === id);
      if (featuredIndex !== -1) {
        state.featuredCourses[featuredIndex] = { ...state.featuredCourses[featuredIndex], ...updates };
      }
      
      // Update in recommended courses
      const recommendedIndex = state.recommendedCourses.findIndex(course => course.id === id);
      if (recommendedIndex !== -1) {
        state.recommendedCourses[recommendedIndex] = { ...state.recommendedCourses[recommendedIndex], ...updates };
      }
      
      // Update current course
      if (state.currentCourse && state.currentCourse.id === id) {
        state.currentCourse = { ...state.currentCourse, ...updates };
      }
    },
    
    // Reset state
    resetCoursesState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch courses
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (!action.payload.fromCache) {
          state.courses = action.payload.courses;
          state.currentPage = action.payload.page;
          state.totalPages = action.payload.totalPages;
          state.hasNextPage = action.payload.hasNextPage;
          
          if (action.payload.cacheKey) {
            state.lastFetch[action.payload.cacheKey] = Date.now();
          }
        }
        
        state.error = null;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch course details
    builder
      .addCase(fetchCourseDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourseDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (!action.payload.fromCache) {
          state.currentCourse = action.payload.course;
          
          if (action.payload.cacheKey) {
            state.lastFetch[action.payload.cacheKey] = Date.now();
          }
        }
        
        state.error = null;
      })
      .addCase(fetchCourseDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search courses
    builder
      .addCase(searchCourses.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchCourses.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload.courses;
        state.error = null;
      })
      .addCase(searchCourses.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      });

    // Fetch featured courses
    builder
      .addCase(fetchFeaturedCourses.fulfilled, (state, action) => {
        if (!action.payload.fromCache) {
          state.featuredCourses = action.payload.courses;
          
          if (action.payload.cacheKey) {
            state.lastFetch[action.payload.cacheKey] = Date.now();
          }
        }
      });

    // Fetch recommended courses
    builder
      .addCase(fetchRecommendedCourses.fulfilled, (state, action) => {
        if (!action.payload.fromCache) {
          state.recommendedCourses = action.payload.courses;
          
          if (action.payload.cacheKey) {
            state.lastFetch[action.payload.cacheKey] = Date.now();
          }
        }
      });

    // Update progress
    builder
      .addCase(updateCourseProgress.fulfilled, (state, action) => {
        const { courseId, lessonId, progress, completed } = action.payload;
        
        if (!state.userProgress[courseId]) {
          state.userProgress[courseId] = {
            courseId,
            completedLessons: [],
            currentLesson: lessonId,
            overallProgress: 0,
            timeSpent: 0,
            lastAccessed: Date.now(),
            quizScores: {},
            certificates: [],
          };
        }
        
        const courseProgress = state.userProgress[courseId];
        courseProgress.currentLesson = lessonId;
        courseProgress.lastAccessed = Date.now();
        
        if (completed && !courseProgress.completedLessons.includes(lessonId)) {
          courseProgress.completedLessons.push(lessonId);
        }
      });

    // Rate course
    builder
      .addCase(rateCourse.fulfilled, (state, action) => {
        const { courseId, rating } = action.payload;
        
        // Update course rating in all relevant arrays
        [state.courses, state.featuredCourses, state.recommendedCourses].forEach(courseArray => {
          const course = courseArray.find(c => c.id === courseId);
          if (course) {
            course.userRating = rating;
          }
        });
        
        // Update current course
        if (state.currentCourse && state.currentCourse.id === courseId) {
          state.currentCourse.userRating = rating;
        }
      });

    // Bookmark lesson
    builder
      .addCase(bookmarkLesson.fulfilled, (state, action) => {
        const { lessonId, bookmarked } = action.payload;
        
        if (bookmarked) {
          if (!state.bookmarkedLessons.includes(lessonId)) {
            state.bookmarkedLessons.push(lessonId);
          }
        } else {
          state.bookmarkedLessons = state.bookmarkedLessons.filter(
            id => id !== lessonId
          );
        }
      });

    // Fetch stats
    builder
      .addCase(fetchCourseStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  updateFilters,
  resetFilters,
  clearSearchResults,
  setCurrentCourse,
  updateLocalProgress,
  toggleLessonBookmark,
  addBookmarkedLesson,
  removeBookmarkedLesson,
  addRecentlyViewed,
  clearRecentlyViewed,
  setCurrentPage,
  invalidateCache,
  setCacheExpiry,
  clearError,
  updateCourseLocally,
  resetCoursesState,
} = coursesSlice.actions;

export default coursesSlice.reducer;