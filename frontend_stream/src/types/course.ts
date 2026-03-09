export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail: string;
  previewVideo?: string;
  
  // Instructor info
  instructorId: string;
  instructorName: string;
  instructorAvatar?: string;
  
  // Course metadata
  category: string;
  subcategory?: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  
  // Pricing
  price: number;
  originalPrice?: number;
  currency: string;
  discountPercentage?: number;
  
  // Statistics
  rating: number;
  ratingCount: number;
  enrollmentCount: number;
  viewCount: number;
  
  // Course structure
  totalLessons: number;
  totalDuration: number; // in minutes
  estimatedCompletionTime: string;
  
  // Status and availability
  status: 'draft' | 'published' | 'archived';
  isPublic: boolean;
  publishedAt?: Date;
  lastUpdatedAt: Date;
  
  // Features
  hasCertificate: boolean;
  hasLiveSupport: boolean;
  hasDownloads: boolean;
  hasQuizzes: boolean;
  hasAssignments: boolean;
  
  // User-specific data (if enrolled)
  isEnrolled?: boolean;
  isFavorited?: boolean;
  userProgress?: number;
  userRating?: number;
  lastAccessedAt?: Date;
}

export interface CourseDetails extends Course {
  // Extended description
  objectives: string[];
  prerequisites: string[];
  targetAudience: string[];
  
  // Course content
  curriculum: CourseSection[];
  resources: CourseResource[];
  
  // Instructor details
  instructor: {
    id: string;
    name: string;
    bio: string;
    avatar?: string;
    rating: number;
    studentCount: number;
    courseCount: number;
    socialLinks?: {
      website?: string;
      linkedin?: string;
      github?: string;
      twitter?: string;
    };
  };
  
  // Reviews and feedback
  reviews: CourseReview[];
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  
  // Analytics
  completionRate: number;
  averageTimeToComplete: number;
  retentionRate: number;
  
  // Additional resources
  faq: CourseFAQ[];
  announcements: CourseAnnouncement[];
  
  // Certificate info
  certificate?: {
    template: string;
    credentialId: string;
    issuer: string;
  };
}

export interface CourseSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
  totalDuration: number;
  isLocked?: boolean;
  unlockConditions?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'live' | 'download';
  order: number;
  duration: number; // in minutes
  
  // Content
  videoUrl?: string;
  textContent?: string;
  downloadUrl?: string;
  
  // Settings
  isPreview: boolean;
  isRequired: boolean;
  passingScore?: number; // for quizzes
  
  // User progress
  isCompleted?: boolean;
  completedAt?: Date;
  timeSpent?: number;
  score?: number;
  
  // Resources
  attachments: LessonAttachment[];
  transcript?: string;
  subtitles?: {
    language: string;
    url: string;
  }[];
  
  // Interactive elements
  quizzes?: Quiz[];
  notes?: UserNote[];
  bookmarks?: UserBookmark[];
}

export interface LessonAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  url: string;
  size: number; // in bytes
  description?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore: number; // percentage
  maxAttempts?: number;
  
  // User data
  userAttempts?: QuizAttempt[];
  bestScore?: number;
  isPassed?: boolean;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'single_choice' | 'true_false' | 'text' | 'matching';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface QuizAttempt {
  id: string;
  startedAt: Date;
  completedAt?: Date;
  score: number;
  answers: Record<string, string | string[]>;
  timeSpent: number; // in seconds
}

export interface CourseResource {
  id: string;
  title: string;
  description?: string;
  type: 'document' | 'tool' | 'link' | 'template';
  url: string;
  category?: string;
}

export interface CourseReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt?: Date;
  helpfulCount: number;
  isHelpful?: boolean; // user's vote
  
  // Instructor response
  instructorResponse?: {
    comment: string;
    createdAt: Date;
  };
}

export interface CourseFAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
}

export interface CourseAnnouncement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  isImportant: boolean;
  attachments?: string[];
}

export interface CourseProgress {
  courseId: string;
  completedLessons: string[];
  currentLesson?: string;
  overallProgress: number; // percentage
  timeSpent: number; // in minutes
  lastAccessed: number; // timestamp
  quizScores: Record<string, number>;
  certificates: string[];
}

export interface UserNote {
  id: string;
  lessonId: string;
  content: string;
  timestamp: number; // video timestamp or page position
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserBookmark {
  id: string;
  lessonId: string;
  title: string;
  timestamp: number; // video timestamp or page position
  createdAt: Date;
  note?: string;
}

export interface CourseFilter {
  category: string;
  level: string;
  price: 'free' | 'paid' | 'all';
  duration: 'short' | 'medium' | 'long' | 'all';
  rating: number;
  language: string;
  sortBy: 'popularity' | 'rating' | 'newest' | 'price_low' | 'price_high';
  sortOrder: 'asc' | 'desc';
}

export interface CourseStats {
  totalCourses: number;
  totalEnrollments: number;
  totalCompletions: number;
  averageRating: number;
  totalRevenue: number;
  
  // By category
  coursesByCategory: Record<string, number>;
  enrollmentsByCategory: Record<string, number>;
  
  // Trends
  monthlyEnrollments: Array<{
    month: string;
    count: number;
  }>;
  
  popularCourses: Array<{
    courseId: string;
    title: string;
    enrollments: number;
  }>;
}