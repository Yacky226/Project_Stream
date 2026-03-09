import { User } from './auth';

export interface UserProfile extends User {
  bio?: string;
  website?: string;
  location?: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  
  // Professional information
  jobTitle?: string;
  company?: string;
  experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  skills?: string[];
  interests?: string[];
  
  // Settings
  isPublic: boolean;
  allowMessages: boolean;
  showEmail: boolean;
  showProgress: boolean;
}

export interface UserPreferences {
  // Language and localization
  language: 'fr' | 'en';
  timezone: string;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  courseReminders: boolean;
  weeklyDigest: boolean;
  
  // Learning preferences
  autoplay: boolean;
  playbackSpeed: number;
  subtitles: boolean;
  quality: 'auto' | '720p' | '1080p' | '4K';
  downloadQuality: 'low' | 'medium' | 'high';
  
  // Privacy
  showOnlineStatus: boolean;
  allowProfileViews: boolean;
  allowCourseRecommendations: boolean;
}

export interface UserStats {
  // Learning progress
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalLessonsWatched: number;
  totalTimeSpent: number; // in minutes
  
  // Achievements
  certificatesEarned: number;
  badgesEarned: number;
  streakDays: number;
  longestStreak: number;
  
  // Engagement
  forumPosts: number;
  questionsAsked: number;
  questionsAnswered: number;
  helpfulVotes: number;
  
  // Progress rates
  averageCompletionRate: number;
  averageQuizScore: number;
  
  // Recent activity
  lastActivityAt: Date;
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

export interface UserActivity {
  id: string;
  type: 'course_started' | 'lesson_completed' | 'quiz_passed' | 'certificate_earned' | 'forum_post' | 'achievement_unlocked';
  title: string;
  description: string;
  timestamp: Date;
  relatedId?: string; // course ID, lesson ID, etc.
  metadata?: Record<string, any>;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'learning' | 'community' | 'achievement' | 'special';
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
  timeSpent: number; // in minutes
  lastAccessedAt: Date;
  currentLessonId?: string;
  
  // Quiz progress
  quizzesTaken: number;
  quizzesPassed: number;
  averageQuizScore: number;
  
  // Engagement
  notesCount: number;
  bookmarksCount: number;
  forumParticipation: number;
}

export interface UserEnrollment {
  id: string;
  courseId: string;
  enrolledAt: Date;
  completedAt?: Date;
  progress: number;
  isFavorite: boolean;
  lastAccessedAt: Date;
  accessType: 'free' | 'paid' | 'trial';
  paymentId?: string;
}

export interface UserSubscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod: string;
  nextBillingDate?: Date;
}

export interface UserDevice {
  id: string;
  name: string;
  type: 'web' | 'mobile' | 'tablet' | 'desktop';
  platform: string;
  lastUsedAt: Date;
  isActive: boolean;
  pushToken?: string;
}

export interface UserSession {
  id: string;
  deviceId: string;
  ipAddress: string;
  location?: string;
  userAgent: string;
  createdAt: Date;
  lastActiveAt: Date;
  isActive: boolean;
}

export interface UserInvitation {
  id: string;
  email: string;
  role: 'student' | 'teacher';
  invitedBy: string;
  invitedAt: Date;
  acceptedAt?: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
}