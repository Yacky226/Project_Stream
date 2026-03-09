export type UserRole = 'student' | 'teacher' | 'admin' | 'moderator';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  timezone: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  coverImage: string;
  duration: number; // in minutes
  studentCount: number;
  category: string;
  isLive: boolean;
  nextSession?: {
    id: string;
    startTime: Date;
    endTime: Date;
  };
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface LiveSession {
  id: string;
  courseId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  streamUrl?: string;
  participantCount: number;
  maxParticipants: number;
}

// Mock authentication state
export const useAuth = () => {
  const getCurrentUser = (): User | null => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return null;
  };

  const setCurrentUser = (user: User | null) => {
    if (typeof window !== 'undefined') {
      if (user) {
        console.log('Setting user in localStorage:', user); // Debug log
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        console.log('Removing user from localStorage'); // Debug log
        localStorage.removeItem('currentUser');
      }
      // Trigger auth state change event
      window.dispatchEvent(new CustomEvent('authStateChange', { detail: user }));
    }
  };

  const signIn = async (email: string, password: string): Promise<User> => {
    // Mock sign in - in real app this would call your auth service
    const mockUser: User = {
      id: '1',
      email,
      firstName: email.includes('teacher') ? 'Sarah' : email.includes('admin') ? 'Admin' : 'Jean',
      lastName: email.includes('teacher') ? 'Martin' : email.includes('admin') ? 'User' : 'Dupont',
      role: email.includes('teacher') ? 'teacher' : email.includes('admin') ? 'admin' : 'student',
      timezone: 'UTC+1'
    };
    console.log('Signing in user:', mockUser); // Debug log
    setCurrentUser(mockUser);
    return mockUser;
  };

  const signUp = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }): Promise<User> => {
    // Mock sign up
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      timezone: 'UTC+1'
    };
    setCurrentUser(newUser);
    return newUser;
  };

  const signOut = () => {
    setCurrentUser(null);
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Role hierarchy: admin > moderator > teacher > student
    const roleHierarchy = {
      student: 0,
      teacher: 1,
      moderator: 2,
      admin: 3
    };
    
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  return {
    getCurrentUser,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAuthenticated: () => getCurrentUser() !== null
  };
};

// Mock course data
export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to React',
    description: 'Learn the fundamentals of React development with hands-on projects and real-world examples.',
    instructorId: '1',
    instructorName: 'Sarah Johnson',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600',
    duration: 120,
    studentCount: 1250,
    category: 'Programming',
    isLive: true,
    nextSession: {
      id: 'session-1',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000)
    },
    price: 99,
    level: 'beginner'
  },
  {
    id: '2',
    title: 'Advanced JavaScript Patterns',
    description: 'Master advanced JavaScript concepts including design patterns, async programming, and performance optimization.',
    instructorId: '2',
    instructorName: 'Michael Chen',
    coverImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=600',
    duration: 180,
    studentCount: 850,
    category: 'Programming',
    isLive: false,
    price: 149,
    level: 'advanced'
  },
  {
    id: '3',
    title: 'UX Design Fundamentals',
    description: 'Learn user experience design principles, user research methods, and design thinking processes.',
    instructorId: '3',
    instructorName: 'Emma Rodriguez',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600',
    duration: 90,
    studentCount: 2100,
    category: 'Design',
    isLive: true,
    nextSession: {
      id: 'session-2',
      startTime: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
      endTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000)
    },
    price: 79,
    level: 'beginner'
  }
];