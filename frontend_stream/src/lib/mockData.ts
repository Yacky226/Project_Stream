/**
 * Mock Data pour Stream Éducatif
 * Données simulées pour le développement et les tests
 */

import { configUtils } from './config';

// Types pour les données mock
export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  bio?: string;
  joinDate: string;
  isVerified: boolean;
  preferences: {
    language: 'fr' | 'en';
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
  stats?: {
    coursesEnrolled?: number;
    coursesCreated?: number;
    totalStudents?: number;
    rating?: number;
  };
}

export interface MockCourse {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  duration: string;
  price: number;
  rating: number;
  studentsCount: number;
  reviewsCount: number;
  thumbnail?: string;
  tags: string[];
  language: 'fr' | 'en';
  hasLiveSession: boolean;
  isEnrolled?: boolean;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockLiveSession {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  startTime: string;
  endTime?: string;
  duration: number;
  isLive: boolean;
  isScheduled: boolean;
  viewerCount: number;
  maxViewers: number;
  recordingUrl?: string;
  thumbnailUrl?: string;
  settings: {
    allowChat: boolean;
    allowQA: boolean;
    recordSession: boolean;
    isPrivate: boolean;
    quality: 'HD' | 'FHD' | '4K';
  };
}

export interface MockChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  username: string;
  userRole: 'student' | 'teacher' | 'moderator';
  message: string;
  timestamp: string;
  isQuestion: boolean;
  isDeleted?: boolean;
}

export interface MockNotification {
  id: string;
  userId: string;
  type: 'live_session' | 'course_update' | 'message' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

// Mock Users
export const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'student@example.com',
    name: 'Marie Dubois',
    role: 'student',
    bio: 'Étudiante passionnée de développement web',
    joinDate: '2023-09-15',
    isVerified: true,
    preferences: {
      language: 'fr',
      theme: 'light',
      notifications: true
    },
    stats: {
      coursesEnrolled: 5
    }
  },
  {
    id: '2',
    email: 'teacher@example.com',
    name: 'Sarah Martin',
    role: 'teacher',
    bio: 'Développeuse senior avec 8 ans d\'expérience en React et TypeScript',
    joinDate: '2023-03-15',
    isVerified: true,
    preferences: {
      language: 'fr',
      theme: 'dark',
      notifications: true
    },
    stats: {
      coursesCreated: 8,
      totalStudents: 1245,
      rating: 4.8
    }
  },
  {
    id: '3',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    joinDate: '2023-01-01',
    isVerified: true,
    preferences: {
      language: 'fr',
      theme: 'system',
      notifications: true
    }
  }
];

// Mock Courses
export const mockCourses: MockCourse[] = [
  {
    id: '1',
    title: 'React Hooks Avancés',
    description: 'Maîtrisez les hooks React pour créer des applications performantes et maintenables. Ce cours couvre useCallback, useMemo, useReducer, et la création de hooks personnalisés.',
    shortDescription: 'Maîtrisez les hooks React avancés',
    instructor: {
      id: '2',
      name: 'Sarah Martin'
    },
    category: 'Frontend',
    level: 'Intermédiaire',
    duration: '8h 30min',
    price: 49.99,
    rating: 4.8,
    studentsCount: 456,
    reviewsCount: 89,
    tags: ['React', 'JavaScript', 'Hooks', 'Frontend'],
    language: 'fr',
    hasLiveSession: true,
    isEnrolled: true,
    progress: 65,
    createdAt: '2023-08-15',
    updatedAt: '2023-11-20'
  },
  {
    id: '2',
    title: 'TypeScript Masterclass',
    description: 'Apprenez TypeScript de A à Z avec des projets pratiques. Types avancés, génériques, décorateurs, et intégration avec React.',
    shortDescription: 'TypeScript de A à Z avec des projets pratiques',
    instructor: {
      id: '2',
      name: 'Sarah Martin'
    },
    category: 'Programming',
    level: 'Avancé',
    duration: '12h 15min',
    price: 69.99,
    rating: 4.9,
    studentsCount: 323,
    reviewsCount: 67,
    tags: ['TypeScript', 'Programming', 'Types', 'React'],
    language: 'fr',
    hasLiveSession: false,
    isEnrolled: false,
    createdAt: '2023-07-20',
    updatedAt: '2023-11-18'
  },
  {
    id: '3',
    title: 'Next.js pour les Développeurs React',
    description: 'Créez des applications full-stack performantes avec Next.js. SSR, SSG, API Routes, et déploiement.',
    shortDescription: 'Applications full-stack avec Next.js',
    instructor: {
      id: '2',
      name: 'Sarah Martin'
    },
    category: 'Full-Stack',
    level: 'Intermédiaire',
    duration: '10h 45min',
    price: 59.99,
    rating: 4.7,
    studentsCount: 234,
    reviewsCount: 45,
    tags: ['Next.js', 'React', 'Full-Stack', 'SSR'],
    language: 'fr',
    hasLiveSession: true,
    isEnrolled: true,
    progress: 30,
    createdAt: '2023-09-10',
    updatedAt: '2023-11-25'
  },
  {
    id: '4',
    title: 'Design System avec Figma',
    description: 'Créez des design systems cohérents et scalables avec Figma. Composants, tokens, et collaboration.',
    shortDescription: 'Design systems cohérents avec Figma',
    instructor: {
      id: '4',
      name: 'Pierre Dubois'
    },
    category: 'Design',
    level: 'Intermédiaire',
    duration: '6h 20min',
    price: 39.99,
    rating: 4.6,
    studentsCount: 189,
    reviewsCount: 32,
    tags: ['Figma', 'Design', 'UI/UX', 'Design System'],
    language: 'fr',
    hasLiveSession: false,
    isEnrolled: false,
    createdAt: '2023-10-05',
    updatedAt: '2023-11-22'
  },
  {
    id: '5',
    title: 'Marketing Digital pour Développeurs',
    description: 'Découvrez les bases du marketing digital pour promouvoir vos projets tech. SEO, content marketing, et réseaux sociaux.',
    shortDescription: 'Marketing digital pour projets tech',
    instructor: {
      id: '5',
      name: 'Julie Moreau'
    },
    category: 'Marketing',
    level: 'Débutant',
    duration: '5h 30min',
    price: 29.99,
    rating: 4.4,
    studentsCount: 167,
    reviewsCount: 28,
    tags: ['Marketing', 'SEO', 'Content', 'Digital'],
    language: 'fr',
    hasLiveSession: true,
    isEnrolled: false,
    createdAt: '2023-11-01',
    updatedAt: '2023-11-26'
  }
];

// Mock Live Sessions
export const mockLiveSessions: MockLiveSession[] = [
  {
    id: 'live-1',
    courseId: '1',
    title: 'React Hooks en pratique',
    description: 'Session live sur l\'utilisation pratique des hooks React',
    instructorId: '2',
    instructorName: 'Sarah Martin',
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Started 30 min ago
    duration: 90,
    isLive: true,
    isScheduled: false,
    viewerCount: 47,
    maxViewers: 100,
    settings: {
      allowChat: true,
      allowQA: true,
      recordSession: true,
      isPrivate: false,
      quality: 'FHD'
    }
  },
  {
    id: 'live-2',
    courseId: '3',
    title: 'Déploiement Next.js sur Vercel',
    description: 'Comment déployer efficacement vos apps Next.js',
    instructorId: '2',
    instructorName: 'Sarah Martin',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // In 2 hours
    duration: 60,
    isLive: false,
    isScheduled: true,
    viewerCount: 0,
    maxViewers: 100,
    settings: {
      allowChat: true,
      allowQA: true,
      recordSession: true,
      isPrivate: false,
      quality: 'FHD'
    }
  },
  {
    id: 'live-3',
    courseId: '5',
    title: 'Stratégies SEO pour développeurs',
    description: 'Les bases du SEO technique et du content marketing',
    instructorId: '5',
    instructorName: 'Julie Moreau',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    duration: 75,
    isLive: false,
    isScheduled: true,
    viewerCount: 0,
    maxViewers: 50,
    settings: {
      allowChat: true,
      allowQA: true,
      recordSession: true,
      isPrivate: false,
      quality: 'HD'
    }
  }
];

// Mock Chat Messages
export const mockChatMessages: MockChatMessage[] = [
  {
    id: 'msg-1',
    sessionId: 'live-1',
    userId: '2',
    username: 'Sarah (Enseignant)',
    userRole: 'teacher',
    message: 'Bienvenue dans cette session live ! 👋',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    isQuestion: false
  },
  {
    id: 'msg-2',
    sessionId: 'live-1',
    userId: '1',
    username: 'Marie',
    userRole: 'student',
    message: 'Merci pour cette excellente explication !',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    isQuestion: false
  },
  {
    id: 'msg-3',
    sessionId: 'live-1',
    userId: '6',
    username: 'Pierre',
    userRole: 'student',
    message: 'Pouvez-vous expliquer useEffect à nouveau ?',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isQuestion: true
  },
  {
    id: 'msg-4',
    sessionId: 'live-1',
    userId: '7',
    username: 'Alex',
    userRole: 'student',
    message: 'Super cours ! 🚀',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isQuestion: false
  }
];

// Mock Notifications
export const mockNotifications: MockNotification[] = [
  {
    id: 'notif-1',
    userId: '1',
    type: 'live_session',
    title: 'Session live démarrant',
    message: 'La session "React Hooks en pratique" commence dans 5 minutes',
    isRead: false,
    actionUrl: '/courses/1/live',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-2',
    userId: '1',
    type: 'course_update',
    title: 'Nouveau chapitre disponible',
    message: 'Un nouveau chapitre a été ajouté au cours "TypeScript Masterclass"',
    isRead: false,
    actionUrl: '/courses/2',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-3',
    userId: '1',
    type: 'system',
    title: 'Mise à jour de la plateforme',
    message: 'Nouvelles fonctionnalités disponibles ! Découvrez les améliorations.',
    isRead: true,
    actionUrl: '/help',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mock Data Service
export class MockDataService {
  private static instance: MockDataService;

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  // Simulate API delay
  private async delay(ms: number = 500): Promise<void> {
    if (configUtils.isDevelopment()) {
      await new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  // Users
  async getUsers(): Promise<MockUser[]> {
    await this.delay();
    return [...mockUsers];
  }

  async getUserById(id: string): Promise<MockUser | null> {
    await this.delay();
    return mockUsers.find(user => user.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<MockUser | null> {
    await this.delay();
    return mockUsers.find(user => user.email === email) || null;
  }

  // Courses
  async getCourses(filters?: {
    category?: string;
    level?: string;
    search?: string;
  }): Promise<MockCourse[]> {
    await this.delay();
    
    let courses = [...mockCourses];
    
    if (filters?.category) {
      courses = courses.filter(course => 
        course.category.toLowerCase() === filters.category?.toLowerCase()
      );
    }
    
    if (filters?.level) {
      courses = courses.filter(course => 
        course.level.toLowerCase() === filters.level?.toLowerCase()
      );
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      courses = courses.filter(course =>
        course.title.toLowerCase().includes(search) ||
        course.description.toLowerCase().includes(search) ||
        course.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
    
    return courses;
  }

  async getCourseById(id: string): Promise<MockCourse | null> {
    await this.delay();
    return mockCourses.find(course => course.id === id) || null;
  }

  async getEnrolledCourses(userId: string): Promise<MockCourse[]> {
    await this.delay();
    return mockCourses.filter(course => course.isEnrolled);
  }

  // Live Sessions
  async getLiveSessions(): Promise<MockLiveSession[]> {
    await this.delay();
    return [...mockLiveSessions];
  }

  async getLiveSessionById(id: string): Promise<MockLiveSession | null> {
    await this.delay();
    return mockLiveSessions.find(session => session.id === id) || null;
  }

  async getActiveLiveSessions(): Promise<MockLiveSession[]> {
    await this.delay();
    return mockLiveSessions.filter(session => session.isLive);
  }

  async getScheduledLiveSessions(): Promise<MockLiveSession[]> {
    await this.delay();
    return mockLiveSessions.filter(session => session.isScheduled && !session.isLive);
  }

  // Chat Messages
  async getChatMessages(sessionId: string): Promise<MockChatMessage[]> {
    await this.delay(200); // Faster for chat
    return mockChatMessages.filter(msg => msg.sessionId === sessionId && !msg.isDeleted);
  }

  async sendChatMessage(sessionId: string, userId: string, message: string, isQuestion: boolean = false): Promise<MockChatMessage> {
    await this.delay(200);
    
    const user = await this.getUserById(userId);
    const newMessage: MockChatMessage = {
      id: `msg-${Date.now()}`,
      sessionId,
      userId,
      username: user?.name || 'Utilisateur',
      userRole: user?.role || 'student',
      message,
      timestamp: new Date().toISOString(),
      isQuestion
    };
    
    mockChatMessages.push(newMessage);
    return newMessage;
  }

  // Notifications
  async getNotifications(userId: string): Promise<MockNotification[]> {
    await this.delay();
    return mockNotifications.filter(notif => notif.userId === userId);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.delay(100);
    const notification = mockNotifications.find(notif => notif.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  // Statistics
  async getStats(): Promise<{
    totalUsers: number;
    totalCourses: number;
    activeLiveSessions: number;
    totalMessages: number;
  }> {
    await this.delay();
    
    return {
      totalUsers: mockUsers.length,
      totalCourses: mockCourses.length,
      activeLiveSessions: mockLiveSessions.filter(s => s.isLive).length,
      totalMessages: mockChatMessages.length
    };
  }
}

// Export singleton instance
export const mockDataService = MockDataService.getInstance();

// Helper functions
export const mockHelpers = {
  // Generate random data
  generateMockUser: (override?: Partial<MockUser>): MockUser => ({
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    email: `user${Math.random().toString(36).substr(2, 5)}@example.com`,
    name: `User ${Math.random().toString(36).substr(2, 5)}`,
    role: 'student',
    joinDate: new Date().toISOString(),
    isVerified: Math.random() > 0.3,
    preferences: {
      language: 'fr',
      theme: 'light',
      notifications: true
    },
    ...override
  }),

  // Simulate real-time updates
  simulateRealtimeUpdate: (callback: (data: any) => void, interval: number = 5000) => {
    const intervalId = setInterval(() => {
      // Simulate random updates
      if (Math.random() > 0.7) {
        callback({
          type: 'viewer_count_update',
          sessionId: 'live-1',
          viewerCount: Math.floor(Math.random() * 100) + 20
        });
      }
    }, interval);

    return () => clearInterval(intervalId);
  },

  // Add realistic delays based on action type
  getRealisticDelay: (actionType: 'fast' | 'medium' | 'slow'): number => {
    switch (actionType) {
      case 'fast': return Math.random() * 200 + 100; // 100-300ms
      case 'medium': return Math.random() * 500 + 300; // 300-800ms
      case 'slow': return Math.random() * 1000 + 500; // 500-1500ms
      default: return 500;
    }
  }
};

// Export all data for direct access if needed
export const allMockData = {
  users: mockUsers,
  courses: mockCourses,
  liveSessions: mockLiveSessions,
  chatMessages: mockChatMessages,
  notifications: mockNotifications
};