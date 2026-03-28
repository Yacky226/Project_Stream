import type { LucideIcon } from 'lucide-react';
import type { StudentDashboardCourse, StudentDashboardData } from '../../../types/dashboard';
import type { UserPreferences, UserProfile } from '../../../types/user';

export interface PublicStudentProfilePageProps {
  onNavigate: (path: string | number) => void;
}

export interface LocalProfileExtras {
  bio: string;
  location: string;
  twitter: string;
  linkedIn: string;
  website: string;
}

export interface SocialLink {
  label: string;
  url: string | null;
  icon: LucideIcon;
}

export interface SkillBadge {
  label: string;
  active: boolean;
  icon: LucideIcon;
}

export interface CategoryMeta {
  icon: LucideIcon;
  className: string;
}

export type PublicStudentProfileStatus =
  | 'auth-required'
  | 'wrong-role'
  | 'loading'
  | 'error'
  | 'ready';

export interface PublicStudentProfileDataModel {
  status: PublicStudentProfileStatus;
  errorMessage: string | null;
  shareState: 'idle' | 'copied' | 'error';
  profile: UserProfile | null;
  preferences: UserPreferences | undefined;
  dashboard: StudentDashboardData | null;
  level: string | undefined;
  unreadCount: number;
  extras: LocalProfileExtras;
  displayName: string;
  publicEnabled: boolean;
  showStatus: boolean;
  completedCourses: StudentDashboardCourse[];
  currentCourses: StudentDashboardCourse[];
  activityDays: number;
  badges: SkillBadge[];
  socialLinks: SocialLink[];
  handleShare: () => Promise<void>;
}
